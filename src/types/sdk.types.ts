import type { LoginResponseDto } from './api.types'

/**
 * SDK Configuration types
 */

/**
 * Invoice SDK Configuration
 */
export interface InvoSDKConfig {
    /**
     * User email for authentication
     */
    email: string

    /**
     * User password for authentication
     */
    password: string

    /**
     * Environment to use
     * @default 'production'
     */
    environment?: 'production' | 'sandbox'

    /**
     * Enable automatic token refresh
     * @default true
     */
    autoRefresh?: boolean

    /**
     * Buffer time in seconds before token expiration to trigger refresh
     * @default 300 (5 minutes)
     */
    refreshBuffer?: number

    /**
     * Callback fired when tokens are refreshed
     */
    onTokenRefreshed?: (tokens: LoginResponseDto) => void

    /**
     * Callback fired when user logs out
     */
    onLogout?: () => void

    /**
     * Callback fired on authentication errors
     */
    onError?: (error: Error) => void
}
