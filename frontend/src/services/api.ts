/**
 * Centralized API client for all backend requests.
 * Wraps fetch() with error handling and base URL management.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public detail?: string
    ) {
        super(detail || `${status} ${statusText}`)
        this.name = 'ApiError'
    }
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let detail: string | undefined
        try {
            const data = await response.json()
            detail = data.detail
        } catch { /* ignore parse errors */ }
        throw new ApiError(response.status, response.statusText, detail)
    }
    // Handle 204 No Content
    if (response.status === 204) return undefined as T
    return response.json()
}

export const api = {
    async get<T = any>(path: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })
        return handleResponse<T>(response)
    },

    async post<T = any>(path: string, body?: any): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        })
        return handleResponse<T>(response)
    },

    async put<T = any>(path: string, body?: any): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        })
        return handleResponse<T>(response)
    },

    async patch<T = any>(path: string, body?: any): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
        })
        return handleResponse<T>(response)
    },

    async delete<T = any>(path: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
        return handleResponse<T>(response)
    },
}

export { ApiError }
