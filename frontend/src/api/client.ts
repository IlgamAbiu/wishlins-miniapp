/**
 * Backend API client for Mini App.
 */

import type { User } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

/**
 * API error with status code and message.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Make an API request with proper error handling.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new ApiError(error.detail || 'Request failed', response.status)
  }

  return response.json()
}

/**
 * API client for user-related operations.
 */
export const userApi = {
  /**
   * Get user by Telegram ID.
   */
  async getByTelegramId(telegramId: number): Promise<User> {
    return request<User>(`/users/telegram/${telegramId}`)
  },
}

export default {
  user: userApi,
}
