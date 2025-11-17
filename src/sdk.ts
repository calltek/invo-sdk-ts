import { AuthError, InvalidCredentialsError, NetworkError, TokenExpiredError } from './errors'
import { decodeJWT, isTokenExpired } from './utils'
import type { LoginResponseDto, UserDto, CreateInvoiceDto, MakeupPDFDto } from './types/api.types'
import type { CreateInvoiceResult } from './types/index'
import type { InvoSDKConfig } from './types/sdk.types'

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
    private user: UserDto | null = null
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
        options?: {
            responseType?: 'json' | 'arrayBuffer'
            contentType?: string | null
        },
    ): Promise<T> {
        try {
            const url = `${this.apiUrl}${endpoint}`
            const headers: HeadersInit = {}

            if (options?.contentType !== null) {
                headers['Content-Type'] = options?.contentType || 'application/json'
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

            // Prepare body based on content type
            let requestBody: string | FormData | undefined
            if (body) {
                if (body instanceof FormData) {
                    requestBody = body
                } else {
                    requestBody = JSON.stringify(body)
                }
            }

            const response = await fetch(url, {
                method,
                headers,
                body: requestBody,
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

            // Return based on response type
            if (options?.responseType === 'arrayBuffer') {
                const contentType = response.headers.get('content-type') || ''

                // Handle case where server returns JSON with Buffer object
                if (contentType.includes('application/json')) {
                    const jsonResponse = await response.json()

                    // Check if response contains a Buffer object (Node.js Buffer format)
                    if (jsonResponse.invoice && jsonResponse.invoice.type === 'Buffer' && Array.isArray(jsonResponse.invoice.data)) {
                        // Convert the array of bytes to ArrayBuffer
                        const uint8Array = new Uint8Array(jsonResponse.invoice.data)
                        return uint8Array.buffer as T
                    }

                    throw new Error('Expected binary PDF or Buffer object in JSON response')
                }

                // Direct binary response
                return (await response.arrayBuffer()) as T
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
        this.user = response.user

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
    getUser(): UserDto | null {
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
     * Read invoice data from uploaded file
     *
     * @param file - The invoice file to read (PDF, XML, etc.)
     * @returns Parsed invoice data
     *
     * @example
     * ```typescript
     * const fs = require('fs')
     * const fileBuffer = fs.readFileSync('invoice.pdf')
     * const file = new File([fileBuffer], 'invoice.pdf', { type: 'application/pdf' })
     * const invoiceData = await sdk.readInvoice(file)
     * ```
     */
    async readInvoice(file: File | Blob): Promise<any> {
        const formData = new FormData()
        formData.append('file', file)

        return this.apiRequest<any>('/reader', 'POST', formData, true, {
            contentType: null,
        })
    }

    /**
     * Generate a PDF invoice with custom branding
     *
     * @param data - Invoice makeup configuration
     * @returns PDF as ArrayBuffer
     *
     * @example
     * ```typescript
     * const pdfBuffer = await sdk.makeupInvoice({
     *   id: 'INV-2024-001',
     *   date: '2024-01-15',
     *   branding: {
     *     logo: 'https://example.com/logo.png',
     *     favicon: 'https://example.com/favicon.ico',
     *     accent_color: '#ff0000',
     *     foreground_color: '#ffffff'
     *   },
     *   client: {
     *     name: 'John Doe',
     *     cif: '12345678A',
     *     address: 'Street 123',
     *     phone: '+34 666 123 123',
     *     email: 'john@example.com'
     *   },
     *   business: {
     *     name: 'Business SL',
     *     cif: 'B12345678',
     *     address: 'Avenue 456',
     *     phone: '+34 911 123 123',
     *     email: 'business@example.com'
     *   },
     *   total: 1210,
     *   subtotal: 1000,
     *   tax_value: 210,
     *   tax_percent: 21,
     *   surcharge_value: 0,
     *   surcharge_percent: 0,
     *   observations: 'Thank you!',
     *   payment_instructions: 'Bank transfer to ES00...',
     *   RGPD: 'GDPR compliance text',
     *   type: 'invoice',
     *   template: 'classic',
     *   concepts: []
     * })
     * // Save the PDF
     * const fs = require('fs')
     * fs.writeFileSync('invoice.pdf', Buffer.from(pdfBuffer))
     * ```
     */
    async makeupInvoice(data: MakeupPDFDto): Promise<ArrayBuffer> {
        return this.apiRequest<ArrayBuffer>('/makeup', 'POST', data, true, {
            responseType: 'arrayBuffer',
        })
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
