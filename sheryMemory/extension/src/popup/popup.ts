import {
  login,
  saveItem,
  getCollections,
  createCollection,
} from "../api/client";
import { isLoggedIn, getUser, logout } from "../auth/auth";

function log(...args: any[]) {
  console.log("🔥 [SheryMemory]:", ...args);
}

function withTimeout<T>(promise: Promise<T>, ms = 30000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Request timed out after ${ms / 1000}s`)),
      ms,
    );
    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ── DOM refs ──────────────────────────────────────────────────────────────────
const loginView = document.getElementById("login-view")!;
const saveView = document.getElementById("save-view")!;
const loadingView = document.getElementById("loading-view")!;
const loadingMsg = document.getElementById("loading-msg");

const loginForm = document.getElementById("login-form") as HTMLFormElement;
const emailInput = document.getElementById("email") as HTMLInputElement;
const passwordInput = document.getElementById("password") as HTMLInputElement;
const loginBtn = document.getElementById("login-btn")!;
const loginError = document.getElementById("login-error")!;

const logoutBtn = document.getElementById("logout-btn")!;
const pageTitle = document.getElementById("page-title")!;
const pageUrl = document.getElementById("page-url")!;
const saveBtn = document.getElementById("save-btn")!;
const saveText = document.getElementById("save-text")!;

const toggleCreateBtn = document.getElementById("toggle-create-collection")!;
const selectContainer = document.getElementById("select-collection-container")!;
const createContainer = document.getElementById("create-collection-container")!;
const newCollectionInput = document.getElementById(
  "new-collection-name",
) as HTMLInputElement;
const submitCreateBtn = document.getElementById(
  "submit-create-collection",
) as HTMLButtonElement;

const customSelectTrigger = document.getElementById("custom-select-trigger")!;
const customSelectValue = document.getElementById("custom-select-value")!;
const customSelectDropdown = document.getElementById("custom-select-dropdown")!;

const notification = document.getElementById("notification")!;
const toastMsg = document.getElementById("toast-msg")!;

// ── State ─────────────────────────────────────────────────────────────────────
let selectedCollectionId = "";
let selectedCollectionName = "Uncategorized (Inbox)";
let isCreatingCollection = false;
let collectionsLoaded = false;

// ── View switcher ─────────────────────────────────────────────────────────────
function showView(view: "login" | "save" | "loading") {
  loginView.classList.toggle("hidden", view !== "login");
  saveView.classList.toggle("hidden", view !== "save");
  loadingView.classList.toggle("hidden", view !== "loading");
}

function setLoadingMsg(msg: string) {
  if (loadingMsg) loadingMsg.textContent = msg;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer: ReturnType<typeof setTimeout> | null = null;
function showToast(msg: string, type: "success" | "error") {
  if (toastTimer) clearTimeout(toastTimer);
  notification.className = `toast ${type}`;
  toastMsg.textContent = msg;
  notification.classList.remove("hidden");
  toastTimer = setTimeout(() => notification.classList.add("hidden"), 4000);
}

// ── Dropdown ──────────────────────────────────────────────────────────────────
customSelectTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  customSelectDropdown.classList.toggle("hidden");
});

document.addEventListener("click", (e) => {
  if (!selectContainer.contains(e.target as Node)) {
    customSelectDropdown.classList.add("hidden");
  }
});

function renderOptions(collections: any[]) {
  customSelectDropdown.innerHTML = "";

  const inbox = document.createElement("div");
  inbox.className = "custom-option";
  inbox.dataset.value = "";
  inbox.textContent = "Uncategorized (Inbox)";
  customSelectDropdown.appendChild(inbox);

  collections.forEach((c: any) => {
    const opt = document.createElement("div");
    opt.className = "custom-option";
    opt.dataset.value = c._id || c.id || "";
    opt.textContent = c.name;
    customSelectDropdown.appendChild(opt);
  });

  customSelectDropdown.querySelectorAll(".custom-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      selectedCollectionId = (opt as HTMLElement).dataset.value || "";
      selectedCollectionName = opt.textContent || "";
      customSelectValue.textContent = selectedCollectionName;
      customSelectDropdown.classList.add("hidden");
    });
  });
}

// ── Collections loader ────────────────────────────────────────────────────────
async function loadCollections() {
  log("Loading collections...");
  try {
    // ✅ 30s — onrender.com free tier cold-starts can take up to 30s
    const res = await withTimeout(getCollections(), 30000);
    log("Collections response:", res);

    const collections = Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.data?.collections)
        ? res.data.collections
        : [];

    renderOptions(collections);
    collectionsLoaded = true;
  } catch (e: any) {
    console.error("❌ Collections error:", e);
    // Non-fatal — render empty list and continue
    renderOptions([]);
    collectionsLoaded = true;
    showToast("Couldn't load collections — server may be waking up", "error");
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  log("🚀 INIT");
  showView("loading");
  setLoadingMsg("Connecting...");

  try {
    const loggedIn = await withTimeout(isLoggedIn(), 10000);
    if (loggedIn) {
      await showSaveView();
    } else {
      showView("login");
    }
  } catch (err) {
    console.error("❌ INIT ERROR:", err);
    showView("login");
  }
}

async function showSaveView() {
  setLoadingMsg("Loading your collections...");
  try {
    await withTimeout(getUser(), 10000);

    if (!collectionsLoaded) {
      await loadCollections();
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab) {
      pageTitle.textContent = tab.title || "Untitled";
      pageUrl.textContent = tab.url || "";
    }

    showView("save");
  } catch (err) {
    console.error("❌ showSaveView error:", err);
    showView("login");
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.classList.add("hidden");
  loginBtn.setAttribute("disabled", "true");
  loginBtn.textContent = "Signing in...";

  try {
    await withTimeout(
      login(emailInput.value.trim(), passwordInput.value),
      30000,
    );
    collectionsLoaded = false;
    await showSaveView();
  } catch (err: any) {
    loginError.textContent = err.message || "Login failed";
    loginError.classList.remove("hidden");
  } finally {
    loginBtn.removeAttribute("disabled");
    loginBtn.textContent = "Sign In";
  }
});

// ── Toggle create form ────────────────────────────────────────────────────────
// ✅ KEY FIX: use inline style.display instead of class toggling
// The .hidden CSS class may conflict with .create-inline-form { display: flex }
function openCreateForm() {
  isCreatingCollection = true;
  selectContainer.style.display = "none";
  createContainer.style.display = "flex";
  newCollectionInput.value = "";
  newCollectionInput.focus();
  toggleCreateBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg> Cancel`;
}

function closeCreateForm() {
  isCreatingCollection = false;
  createContainer.style.display = "none";
  selectContainer.style.display = "block";
  newCollectionInput.value = "";
  toggleCreateBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"/><path d="M12 5v14"/>
        </svg> New`;
}

toggleCreateBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  isCreatingCollection ? closeCreateForm() : openCreateForm();
});

// ── Submit new collection ─────────────────────────────────────────────────────
submitCreateBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const name = newCollectionInput.value.trim();
  if (!name) {
    showToast("Please enter a collection name", "error");
    newCollectionInput.focus();
    return;
  }

  submitCreateBtn.disabled = true;
  submitCreateBtn.textContent = "...";

  try {
    const res = await withTimeout(createCollection(name), 30000);
    log("Create collection response:", res);

    // Handle: { data: Collection } per your React API shape
    const newCol = res?.data?.collection || res?.data || res;

    if (!newCol?.name) throw new Error("Unexpected server response");

    selectedCollectionId = newCol._id || newCol.id || "";
    selectedCollectionName = newCol.name;

    // Refresh dropdown & re-apply selection
    collectionsLoaded = false;
    await loadCollections();
    customSelectValue.textContent = selectedCollectionName;

    closeCreateForm();
    showToast(`"${newCol.name}" created ✓`, "success");
  } catch (err: any) {
    log("Create error:", err);
    showToast(err.message || "Failed to create collection", "error");
  } finally {
    submitCreateBtn.disabled = false;
    submitCreateBtn.textContent = "Create";
  }
});

// Allow Enter inside input to trigger submit
newCollectionInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitCreateBtn.click();
  }
});

// ── Save item ─────────────────────────────────────────────────────────────────
saveBtn.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url) return;

  saveBtn.setAttribute("disabled", "true");
  saveText.textContent = "Saving...";

  try {
    await withTimeout(
      saveItem(tab.url, selectedCollectionId || undefined),
      30000,
    );
    showToast("Saved successfully ✓", "success");
    setTimeout(() => window.close(), 1200);
  } catch (err: any) {
    showToast(err.message || "Save failed", "error");
  } finally {
    saveBtn.removeAttribute("disabled");
    saveText.textContent = "Save Memory";
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
logoutBtn.addEventListener("click", async () => {
  await logout();
  collectionsLoaded = false;
  selectedCollectionId = "";
  selectedCollectionName = "Uncategorized (Inbox)";
  showView("login");
});

init();
