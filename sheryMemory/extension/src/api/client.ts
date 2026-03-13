const BASE_URL = 'http://localhost:5000/api'

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    const { token } = await chrome.storage.local.get('token')

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

export async function saveItem(url: string) {
    return apiRequest('/items', {
        method: 'POST',
        body: JSON.stringify({ url }),
    })
}

export async function saveHighlight(url: string, text: string) {
    return apiRequest('/highlights', {
        method: 'POST',
        body: JSON.stringify({ url, text }),
    })
}
