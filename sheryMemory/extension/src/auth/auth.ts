import { apiRequest } from "../api/client";

export async function getToken(): Promise<string | null> {
  const { token } = await chrome.storage.local.get("token");
  if (token) return token;

  // Try to sync from the web app's cookie
  try {
    const cookie = await chrome.cookies.get({
      url: "https://sheryian-coding-school-08un.onrender.com",
      name: "token",
    });
    if (cookie?.value) {
      await chrome.storage.local.set({ token: cookie.value });
      return cookie.value;
    }
  } catch (e) {
    console.warn("Could not sync token from cookies", e);
  }

  return null;
}

export async function getUser(): Promise<any> {
  const { user } = await chrome.storage.local.get("user");
  if (user) return user;

  // If we grabbed the token from cookies but don't have user metrics, fetch 'me'
  const token = await getToken();
  if (token) {
    try {
      const res = await apiRequest("/auth/me");
      if (res.data) {
        await chrome.storage.local.set({ user: res.data });
        return res.data;
      }
    } catch (e) {
      // ignore
    }
  }
  return null;
}

export async function isLoggedIn(): Promise<boolean> {
  const token = await getToken();
  return !!token;
}

export async function logout(): Promise<void> {
  await chrome.storage.local.remove(["token", "user"]);
}
