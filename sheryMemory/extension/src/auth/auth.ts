export async function getToken(): Promise<string | null> {
    const { token } = await chrome.storage.local.get('token')
    return token || null
}

export async function getUser(): Promise<any> {
    const { user } = await chrome.storage.local.get('user')
    return user || null
}

export async function isLoggedIn(): Promise<boolean> {
    const token = await getToken()
    return !!token
}

export async function logout(): Promise<void> {
    await chrome.storage.local.remove(['token', 'user'])
}
