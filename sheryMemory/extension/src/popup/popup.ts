import { login, saveItem } from '../api/client'
import { isLoggedIn, getUser, logout } from '../auth/auth'

// DOM elements
const loginView = document.getElementById('login-view')!
const saveView = document.getElementById('save-view')!
const loadingView = document.getElementById('loading-view')!

const loginForm = document.getElementById('login-form') as HTMLFormElement
const emailInput = document.getElementById('email') as HTMLInputElement
const passwordInput = document.getElementById('password') as HTMLInputElement
const loginBtn = document.getElementById('login-btn')!
const loginError = document.getElementById('login-error')!

const userEmail = document.getElementById('user-email')!
const logoutBtn = document.getElementById('logout-btn')!
const pageTitle = document.getElementById('page-title')!
const pageUrl = document.getElementById('page-url')!
const saveBtn = document.getElementById('save-btn')!
const saveText = document.getElementById('save-text')!
const saveStatus = document.getElementById('save-status')!

function showView(view: 'login' | 'save' | 'loading') {
    loginView.classList.toggle('hidden', view !== 'login')
    saveView.classList.toggle('hidden', view !== 'save')
    loadingView.classList.toggle('hidden', view !== 'loading')
}

async function init() {
    showView('loading')

    if (await isLoggedIn()) {
        await showSaveView()
    } else {
        showView('login')
    }
}

async function showSaveView() {
    const user = await getUser()
    if (user) {
        userEmail.textContent = user.email
    }

    // Get current tab info
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab) {
        pageTitle.textContent = tab.title || 'Untitled'
        pageUrl.textContent = tab.url || ''
    }

    showView('save')
}

// Login handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    loginBtn.textContent = 'Signing in...'
    loginError.classList.add('hidden')

    try {
        await login(emailInput.value, passwordInput.value)
        await showSaveView()
    } catch (err: any) {
        loginError.textContent = err.message || 'Login failed'
        loginError.classList.remove('hidden')
        loginBtn.textContent = 'Sign In'
    }
})

// Save handler
saveBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url) return

    saveBtn.setAttribute('disabled', 'true')
    saveText.textContent = '⏳ Saving...'
    saveStatus.classList.add('hidden')

    try {
        await saveItem(tab.url)
        saveText.textContent = '✅ Saved!'
        saveStatus.textContent = 'Page saved to SheryMemory! AI is processing it now.'
        saveStatus.className = 'status success'
        saveStatus.classList.remove('hidden')

        setTimeout(() => {
            saveText.textContent = '💾 Save This Page'
            saveBtn.removeAttribute('disabled')
        }, 2000)
    } catch (err: any) {
        saveText.textContent = '❌ Failed'
        saveStatus.textContent = err.message || 'Something went wrong'
        saveStatus.className = 'status error'
        saveStatus.classList.remove('hidden')

        setTimeout(() => {
            saveText.textContent = '💾 Save This Page'
            saveBtn.removeAttribute('disabled')
        }, 2000)
    }
})

// Logout
logoutBtn.addEventListener('click', async () => {
    await logout()
    showView('login')
})

// Initialize
init()
