const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    })

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('NOT_FOUND')
        }
        const data = await response.json().catch(() => ({}))
        throw new Error(data.detail || `API Error: ${response.status}`)
    }

    return response.json()
}
