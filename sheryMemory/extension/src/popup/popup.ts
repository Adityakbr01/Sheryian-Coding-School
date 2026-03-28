import { login, saveItem, getCollections, createCollection } from '../api/client'
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

const logoutBtn = document.getElementById('logout-btn')!
const pageTitle = document.getElementById('page-title')!
const pageUrl = document.getElementById('page-url')!
const saveBtn = document.getElementById('save-btn')!
const saveText = document.getElementById('save-text')!

// Collection Elements
const toggleCreateBtn = document.getElementById('toggle-create-collection')!
const selectContainer = document.getElementById('select-collection-container')!
const createContainer = document.getElementById('create-collection-container')!
const newCollectionInput = document.getElementById('new-collection-name') as HTMLInputElement
const submitCreateBtn = document.getElementById('submit-create-collection')!

// Custom Dropdown Elements
const customSelectTrigger = document.getElementById('custom-select-trigger')!
const customSelectValue = document.getElementById('custom-select-value')!
const customSelectDropdown = document.getElementById('custom-select-dropdown')!
let selectedCollectionId = ''
let selectedCollectionName = 'Uncategorized (Inbox)'

const notification = document.getElementById('notification')!
const toastIcon = document.getElementById('toast-icon')!
const toastMsg = document.getElementById('toast-msg')!

let isCreatingCollection = false
let collectionsLoaded = false

function showView(view: 'login' | 'save' | 'loading') {
    loginView.classList.toggle('hidden', view !== 'login')
    saveView.classList.toggle('hidden', view !== 'save')
    loadingView.classList.toggle('hidden', view !== 'loading')
}

// Custom Dropdown Logic
customSelectTrigger.addEventListener('click', () => {
    customSelectDropdown.classList.toggle('hidden')
})
document.addEventListener('click', (e) => {
    if (!selectContainer.contains(e.target as Node)) {
        customSelectDropdown.classList.add('hidden')
    }
})

function renderOptions(collections: any[]) {
    customSelectDropdown.innerHTML = `<div class="custom-option ${selectedCollectionId === '' ? 'selected' : ''}" data-value="">Uncategorized (Inbox)</div>`
    
    collections.forEach((c: any) => {
        const opt = document.createElement('div')
        opt.className = `custom-option ${selectedCollectionId === c.id ? 'selected' : ''}`
        opt.dataset.value = c.id
        opt.textContent = c.name
        customSelectDropdown.appendChild(opt)
    })

    // Attach row events
    const allOptions = customSelectDropdown.querySelectorAll('.custom-option')
    allOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            selectedCollectionId = (opt as HTMLElement).dataset.value || ''
            selectedCollectionName = opt.textContent || ''
            customSelectValue.textContent = selectedCollectionName
            
            // clear selected class
            allOptions.forEach(o => o.classList.remove('selected'))
            opt.classList.add('selected')
            customSelectDropdown.classList.add('hidden')
        })
    })
}

// Toast
function showToast(msg: string, type: 'success' | 'error') {
    notification.className = `toast ${type}`
    toastIcon.innerHTML = type === 'success' 
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    toastMsg.textContent = msg
    notification.classList.remove('hidden')
    
    setTimeout(() => {
        notification.classList.add('hidden')
    }, 4000)
}

// Fetch Collections
async function loadCollections() {
    try {
        const res = await getCollections()
        const collections = res.data || []
        renderOptions(collections)
        collectionsLoaded = true
    } catch (e: any) {
        console.error('Failed to load collections:', e)
        showToast('Could not load collections', 'error')
    }
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
    if (!collectionsLoaded) {
        await loadCollections()
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
    loginBtn.setAttribute('disabled', 'true')

    try {
        await login(emailInput.value, passwordInput.value)
        await showSaveView()
    } catch (err: any) {
        loginError.textContent = err.message || 'Login failed. Check credentials.'
        loginError.classList.remove('hidden')
    } finally {
        loginBtn.textContent = 'Sign In'
        loginBtn.removeAttribute('disabled')
    }
})

// Toggle Create Collection form
toggleCreateBtn.addEventListener('click', () => {
    isCreatingCollection = !isCreatingCollection
    if (isCreatingCollection) {
        selectContainer.classList.add('hidden')
        createContainer.classList.remove('hidden')
        toggleCreateBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel'
        newCollectionInput.focus()
    } else {
        createContainer.classList.add('hidden')
        selectContainer.classList.remove('hidden')
        toggleCreateBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg> New'
    }
})

// Submit New Collection
submitCreateBtn.addEventListener('click', async () => {
    const name = newCollectionInput.value.trim()
    if (!name) return

    submitCreateBtn.setAttribute('disabled', 'true')
    submitCreateBtn.textContent = '...'
    
    try {
        const res = await createCollection(name)
        const newCol = res.data
        
        // Add to our internal array & rerender
        selectedCollectionId = newCol.id
        selectedCollectionName = newCol.name
        customSelectValue.textContent = newCol.name
        
        // Quickly re-fetch or just insert
        // Easiest is to force reload to maintain correct array state
        await loadCollections()
        
        // Reset toggle UI
        newCollectionInput.value = ''
        toggleCreateBtn.click()
        showToast(`Collection "${newCol.name}" created`, 'success')
    } catch (err: any) {
        showToast(err.message || 'Failed to create collection', 'error')
    } finally {
        submitCreateBtn.removeAttribute('disabled')
        submitCreateBtn.textContent = 'Create'
    }
})

// Save handler
saveBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (!tab?.url) return

    saveBtn.setAttribute('disabled', 'true')
    saveText.textContent = 'Saving Memory...'
    
    const collectionId = selectedCollectionId || undefined

    try {
        await saveItem(tab.url, collectionId)
        saveText.textContent = 'Saved!'
        showToast('Pushed to SheryMemory successfully.', 'success')

        setTimeout(() => {
            saveText.textContent = 'Save Memory'
            saveBtn.removeAttribute('disabled')
            // Auto close window after 2 seconds on success
            window.close()
        }, 2000)
    } catch (err: any) {
        saveText.textContent = 'Failed'
        showToast(err.message || 'Something went wrong', 'error')

        setTimeout(() => {
            saveText.textContent = 'Save Memory'
            saveBtn.removeAttribute('disabled')
        }, 2000)
    }
})

// Logout
logoutBtn.addEventListener('click', async () => {
    await logout()
    collectionsLoaded = false
    showView('login')
})

// Initialize
init()
