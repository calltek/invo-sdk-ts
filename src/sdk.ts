import { AuthError, InvalidCredentialsError, NetworkError, TokenExpiredError } from './errors'
import { decodeJWT, isTokenExpired } from './utils'
import type { LoginResponseDto } from './types/api.types'
import type { User } from './types/auth.types'
import type { CreateInvoiceResult } from './types/invoice.types'
import type { InvoSDKConfig } from './types/sdk.types'
import type { CreateInvoiceDto } from './types/api.types'

/**
 * INVO SDK for backend applications
 * Provides authentication and invoice management functionality
 */
export class InvoSDK {
    private email: string
    private password: string
    private environment: 'production' | 'sandbox'
    private autoRefresh: boolean
    private refreshBuffer: number
    private onTokenRefreshed: (tokens: LoginResponseDto) => void
    private onLogout: () => void
    private onError: (error: Error) => void

    // Token storage in memory
    private accessToken: string | null = null
    private refreshToken: string | null = null
    private user: User | null = null
    private refreshTimer: ReturnType<typeof setTimeout> | null = null

    constructor(config: InvoSDKConfig) {
        if (config.environment && !['production', 'sandbox'].includes(config.environment)) {
            throw new Error('Invalid environment. Allowed values are production, sandbox.')
        }

        this.email = config.email
        this.password = config.password
        this.environment = config.environment || 'production'
        this.autoRefresh = config.autoRefresh ?? true
        this.refreshBuffer = config.refreshBuffer ?? 300
        this.onTokenRefreshed = config.onTokenRefreshed || (() => {})
        this.onLogout = config.onLogout || (() => {})
        this.onError = config.onError || (() => {})
    }

    /**
     * Get the API base URL based on environment
     */
    get apiUrl(): string {
        return this.environment === 'production'
            ? 'https://api.invo.rest'
            : 'https://sandbox.invo.rest'
    }

    /**
     * Make authenticated API request
     */
    private async apiRequest<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: unknown,
        requiresAuth = true,
    ): Promise<T> {
        try {
            const url = `${this.apiUrl}${endpoint}`
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
                'X-Environment': this.environment,
            }

            // Add authorization header if required
            if (requiresAuth) {
                if (!this.accessToken) {
                    throw new TokenExpiredError('No access token available. Please login first.')
                }

                // Check if token is expired
                if (isTokenExpired(this.accessToken)) {
                    // Try to refresh the token
                    await this.refreshAccessToken()
                }

                headers['Authorization'] = `Bearer ${this.accessToken}`
            }

            const response = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            })

            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: 'Request failed',
                }))

                if (response.status === 401) {
                    throw new InvalidCredentialsError(error.message || 'Invalid credentials')
                }

                throw new AuthError(error.message || 'Request failed', response.status)
            }

            return response.json()
        } catch (error) {
            if (error instanceof AuthError) {
                this.onError(error)
                throw error
            }

            const networkError = new NetworkError(
                error instanceof Error ? error.message : 'Network request failed',
            )
            this.onError(networkError)
            throw networkError
        }
    }

    /**
     * Save authentication tokens in memory
     */
    private saveTokens(response: LoginResponseDto): void {
        this.accessToken = response.access_token
        this.refreshToken = response.refresh_token
        this.user = response.user as User

        if (this.autoRefresh) {
            this.setupAutoRefresh()
        }
    }

    /**
     * Setup automatic token refresh
     */
    private setupAutoRefresh(): void {
        // Clear existing timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
        }

        if (!this.accessToken) return

        try {
            const decoded = decodeJWT(this.accessToken)
            const expiresIn = decoded.exp - Math.floor(Date.now() / 1000)
            const refreshAt = Math.max(0, expiresIn - this.refreshBuffer) * 1000

            this.refreshTimer = setTimeout(async () => {
                try {
                    await this.refreshAccessToken()
                } catch (error) {
                    console.error('Auto-refresh failed:', error)
                    this.onError(error instanceof Error ? error : new Error('Auto-refresh failed'))
                }
            }, refreshAt)
        } catch (error) {
            console.error('Failed to setup auto-refresh:', error)
        }
    }

    /**
     * Login with email and password
     */
    async login(): Promise<LoginResponseDto> {
        const response = await this.apiRequest<LoginResponseDto>(
            '/auth/login',
            'POST',
            {
                email: this.email,
                password: this.password,
            },
            false, // Don't require auth for login
        )

        this.saveTokens(response)
        return response
    }

    /**
     * Refresh access token
     */
    async refreshAccessToken(): Promise<LoginResponseDto> {
        if (!this.refreshToken) {
            throw new TokenExpiredError('No refresh token available')
        }

        const response = await this.apiRequest<LoginResponseDto>(
            '/auth/refresh',
            'POST',
            {
                refresh_token: this.refreshToken,
            },
            false, // Don't require auth for refresh
        )

        this.saveTokens(response)
        this.onTokenRefreshed(response)
        return response
    }

    /**
     * Logout and clear tokens
     */
    logout(): void {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer)
            this.refreshTimer = null
        }

        this.accessToken = null
        this.refreshToken = null
        this.user = null
        this.onLogout()
    }

    /**
     * Get current access token
     */
    getAccessToken(): string | null {
        return this.accessToken
    }

    /**
     * Get current refresh token
     */
    getRefreshToken(): string | null {
        return this.refreshToken
    }

    /**
     * Get current user
     */
    getUser(): User | null {
        return this.user
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        if (!this.accessToken) return false

        try {
            return !isTokenExpired(this.accessToken)
        } catch {
            return false
        }
    }

    /**
     * Get current environment
     */
    getEnvironment(): 'production' | 'sandbox' {
        return this.environment
    }

    /**
     * Switch environment
     */
    setEnvironment(env: 'production' | 'sandbox'): void {
        this.environment = env
    }

    /**
     * Create and submit a new invoice
     *
     * @example
     * ```typescript
     * const result = await sdk.createInvoice({
     *   issueDate: new Date().toISOString(),
     *   invoiceNumber: 'FAC-2024-001',
     *   externalId: 'order-12345',
     *   totalAmount: 1210.00,
     *   customerName: 'Cliente SL',
     *   customerTaxId: 'B12345678',
     *   emitterName: 'Mi Empresa SL',
     *   emitterTaxId: 'B87654321',
     *   description: 'Servicios de consultoría',
     *   taxLines: [
     *     {
     *       taxRate: 21,
     *       baseAmount: 1000.00,
     *       taxAmount: 210.00
     *     }
     *   ]
     * })
     * console.log('Invoice created:', result.invoiceId)
     * ```
     */
    async createInvoice(data: CreateInvoiceDto): Promise<CreateInvoiceResult> {
        return this.apiRequest<CreateInvoiceResult>('/invoice/store', 'POST', data)
    }

    /**
     * Make a generic authenticated request to any endpoint
     *
     * @param endpoint - The API endpoint (e.g., '/users/me')
     * @param method - HTTP method
     * @param body - Request body (optional)
     */
    async request<T>(
        endpoint: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        body?: unknown,
    ): Promise<T> {
        return this.apiRequest<T>(endpoint, method, body)
    }
}

/**
 * Create a new INVO SDK instance
 *
 * @example
 * ```typescript
 * import { createInvoSDK } from 'invo-sdk'
 *
 * const sdk = createInvoSDK({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   environment: 'production'
 * })
 *
 * await sdk.login()
 * console.log('Authenticated:', sdk.isAuthenticated())
 * ```
 */
export function createInvoSDK(config: InvoSDKConfig): InvoSDK {
    return new InvoSDK(config)
}
