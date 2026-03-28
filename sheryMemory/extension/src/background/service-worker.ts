import { saveItem } from '../api/client'
import { MessageSchema } from '../schemas/messages.schema'

/**
 * Service worker handles:
 * 1. Context menu "Save to SheryMemory"
 */

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'save-to-sherymemory',
        title: 'Save to SheryMemory',
        contexts: ['page', 'link']
    })

    console.log('[SheryMemory] Extension installed, context menus created')
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    try {
        if (info.menuItemId === 'save-to-sherymemory') {
            const url = info.linkUrl || tab?.url
            if (!url) return
            await saveItem(url)
            console.log('[SheryMemory] Saved URL:', url)
        }
    } catch (err) {
        console.error('[SheryMemory] Context menu action failed:', err)
    }
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const parsed = MessageSchema.safeParse(message)
    if (!parsed.success) {
        sendResponse({ success: false, error: 'Invalid message' })
        return true
    }

    const data = parsed.data

    if (data.type === 'SAVE_URL') {
        saveItem(data.url)
            .then(() => sendResponse({ success: true }))
            .catch((err: Error) => sendResponse({ success: false, error: err.message }))
        return true
    }
})
