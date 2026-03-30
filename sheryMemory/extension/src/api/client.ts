// API base URL for all backend requests
export const BASE_URL = 'https://sheryian-coding-school-08un.onrender.com/api'


export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    let { token } = await chrome.storage.local.get('token')

    if (!token) {
        try {
            const cookie = await chrome.cookies.get({ url: 'https://sheryian-coding-school-08un.onrender.com', name: 'token' })
            if (cookie?.value) {
                token = cookie.value
                await chrome.storage.local.set({ token })
            }
        } catch (e) {
            // ignore
        }
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'API Error')
    return data
}

export async function login(email: string, password: string) {
    const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    })
    await chrome.storage.local.set({ token: res.data.token, user: res.data.user })
    return res.data
}

export async function getMe() {
    return apiRequest('/auth/me', {
        method: 'GET',
    })
}

export async function saveItem(url: string, collectionId?: string) {
    const body: any = { url }
    if (collectionId) {
        body.collectionId = collectionId
    }
    return apiRequest('/items', {
        method: 'POST',
        body: JSON.stringify(body),
    })
}

export async function getCollections() {
    return apiRequest('/collections', {
        method: 'GET',
    })
}

export async function createCollection(name: string) {
    return apiRequest('/collections', {
        method: 'POST',
        body: JSON.stringify({ name }),
    })
}
