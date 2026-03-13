/**
 * Content script injected into every page.
 * Shows a "Save Highlight" tooltip when text is selected.
 */

let tooltip: HTMLDivElement | null = null

function createTooltip() {
    if (tooltip) return tooltip

    tooltip = document.createElement('div')
    tooltip.id = 'sherymemory-tooltip'
    tooltip.innerHTML = '🧠 Save Highlight'
    tooltip.style.cssText = `
        position: fixed;
        padding: 6px 12px;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 13px;
        font-weight: 600;
        border-radius: 8px;
        cursor: pointer;
        z-index: 2147483647;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        display: none;
        user-select: none;
        transition: opacity 0.15s, transform 0.15s;
    `
    document.body.appendChild(tooltip)

    tooltip.addEventListener('click', async () => {
        const selectedText = window.getSelection()?.toString().trim()
        if (!selectedText) return

        tooltip!.innerHTML = '⏳ Saving...'

        chrome.runtime.sendMessage(
            {
                type: 'SAVE_HIGHLIGHT',
                url: window.location.href,
                text: selectedText
            },
            (response) => {
                if (response?.success) {
                    tooltip!.innerHTML = '✅ Saved!'
                    setTimeout(hideTooltip, 1200)
                } else {
                    tooltip!.innerHTML = '❌ Failed'
                    setTimeout(() => { tooltip!.innerHTML = '🧠 Save Highlight' }, 1500)
                }
            }
        )
    })

    return tooltip
}

function showTooltip(x: number, y: number) {
    const tt = createTooltip()
    tt.style.left = `${Math.min(x, window.innerWidth - 160)}px`
    tt.style.top = `${Math.max(y - 40, 10)}px`
    tt.style.display = 'block'
    tt.innerHTML = '🧠 Save Highlight'
}

function hideTooltip() {
    if (tooltip) {
        tooltip.style.display = 'none'
    }
}

// Listen for text selection
document.addEventListener('mouseup', (e) => {
    const selectedText = window.getSelection()?.toString().trim()

    if (selectedText && selectedText.length > 3) {
        showTooltip(e.clientX, e.clientY)
    } else {
        // Small delay so click on tooltip works
        setTimeout(hideTooltip, 200)
    }
})

// Hide on scroll
document.addEventListener('scroll', hideTooltip)

console.log('[SheryMemory] Content script loaded')
