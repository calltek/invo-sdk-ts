/**
 * Base authentication error
 */
class AuthError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AuthError';
        Object.setPrototypeOf(this, AuthError.prototype);
    }
}
/**
 * Invalid credentials error
 */
class InvalidCredentialsError extends AuthError {
    constructor(message = 'Invalid email or password') {
        super(message, 401);
        this.name = 'InvalidCredentialsError';
        Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
    }
}
/**
 * Token expired error
 */
class TokenExpiredError extends AuthError {
    constructor(message = 'Token has expired') {
        super(message, 401);
        this.name = 'TokenExpiredError';
        Object.setPrototypeOf(this, TokenExpiredError.prototype);
    }
}
/**
 * Network error
 */
class NetworkError extends AuthError {
    constructor(message = 'Network request failed') {
        super(message);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
/**
 * Invalid token error
 */
class InvalidTokenError extends AuthError {
    constructor(message = 'Invalid or malformed token') {
        super(message, 401);
        this.name = 'InvalidTokenError';
        Object.setPrototypeOf(this, InvalidTokenError.prototype);
    }
}
/**
 * OAuth error
 */
class OAuthError extends AuthError {
    constructor(message = 'OAuth authentication failed') {
        super(message, 401);
        this.name = 'OAuthError';
        Object.setPrototypeOf(this, OAuthError.prototype);
    }
}

/**
 * Decode a JWT token
 */
function decodeJWT(token) {
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            throw new InvalidTokenError('Invalid token format');
        }
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''));
        return JSON.parse(jsonPayload);
    }
    catch (error) {
        throw new InvalidTokenError('Failed to decode token');
    }
}
/**
 * Check if a token is expired
 */
function isTokenExpired(token, bufferSeconds = 0) {
    try {
        const decoded = decodeJWT(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime + bufferSeconds;
    }
    catch {
        return true;
    }
}
/**
 * Get seconds until token expires
 */
function getSecondsUntilExpiration(token) {
    try {
        const decoded = decodeJWT(token);
        const currentTime = Math.floor(Date.now() / 1000);
        return Math.max(0, decoded.exp - currentTime);
    }
    catch {
        return 0;
    }
}
/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Detect environment from API token prefix
 * @param apiToken - API token to analyze
 * @returns Detected environment or null if cannot be detected
 */
function detectEnvironmentFromToken(apiToken) {
    if (apiToken.startsWith('invo_tok_prod_')) {
        return 'production';
    }
    if (apiToken.startsWith('invo_tok_sand_')) {
        return 'sandbox';
    }
    return null;
}
/**
 * INVO SDK for backend applications
 * Provides authentication and invoice management functionality
 */
class InvoSDK {
    constructor(config) {
        // Token storage in memory
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        this.refreshTimer = null;
        if (config.environment && !['production', 'sandbox'].includes(config.environment)) {
            throw new Error('Invalid environment. Allowed values are production, sandbox.');
        }
        this.email = config.email;
        this.password = config.password;
        this.environment = config.environment || 'production';
        this.autoRefresh = config.autoRefresh ?? true;
        this.refreshBuffer = config.refreshBuffer ?? 300;
        this.onTokenRefreshed = config.onTokenRefreshed || (() => { });
        this.onLogout = config.onLogout || (() => { });
        this.onError = config.onError || (() => { });
    }
    /**
     * Get the API base URL based on environment
     */
    get apiUrl() {
        return this.environment === 'production'
            ? 'https://api.invo.rest'
            : 'https://sandbox.invo.rest';
    }
    /**
     * Make authenticated API request
     */
    async apiRequest(endpoint, method = 'GET', body, requiresAuth = true, options) {
        try {
            const url = `${this.apiUrl}${endpoint}`;
            const headers = {};
            if (options?.contentType !== null) {
                headers['Content-Type'] = options?.contentType || 'application/json';
            }
            // Add authorization header if required
            if (requiresAuth) {
                if (!this.accessToken) {
                    throw new TokenExpiredError('No access token available. Please login first.');
                }
                // Check if token is expired
                if (isTokenExpired(this.accessToken)) {
                    // Try to refresh the token
                    await this.refreshAccessToken();
                }
                headers['Authorization'] = `Bearer ${this.accessToken}`;
            }
            // Prepare body based on content type
            let requestBody;
            if (body) {
                if (body instanceof FormData) {
                    requestBody = body;
                }
                else {
                    requestBody = JSON.stringify(body);
                }
            }
            const response = await fetch(url, {
                method,
                headers,
                body: requestBody,
            });
            if (!response.ok) {
                const error = await response.json().catch(() => ({
                    message: 'Request failed',
                }));
                if (response.status === 401) {
                    throw new InvalidCredentialsError(error.message || 'Invalid credentials');
                }
                throw new AuthError(error.message || 'Request failed', response.status);
            }
            // Return based on response type
            if (options?.responseType === 'arrayBuffer') {
                const contentType = response.headers.get('content-type') || '';
                // Handle case where server returns JSON with Buffer object
                if (contentType.includes('application/json')) {
                    const jsonResponse = await response.json();
                    // Check if response contains a Buffer object (Node.js Buffer format)
                    if (jsonResponse.invoice &&
                        jsonResponse.invoice.type === 'Buffer' &&
                        Array.isArray(jsonResponse.invoice.data)) {
                        // Convert the array of bytes to ArrayBuffer
                        const uint8Array = new Uint8Array(jsonResponse.invoice.data);
                        return uint8Array.buffer;
                    }
                    throw new Error('Expected binary PDF or Buffer object in JSON response');
                }
                // Direct binary response
                return (await response.arrayBuffer());
            }
            return response.json();
        }
        catch (error) {
            if (error instanceof AuthError) {
                this.onError(error);
                throw error;
            }
            const networkError = new NetworkError(error instanceof Error ? error.message : 'Network request failed');
            this.onError(networkError);
            throw networkError;
        }
    }
    /**
     * Save authentication tokens in memory
     */
    saveTokens(response) {
        this.accessToken = response.access_token;
        this.refreshToken = response.refresh_token;
        this.user = response.user;
        if (this.autoRefresh) {
            this.setupAutoRefresh();
        }
    }
    /**
     * Setup automatic token refresh
     */
    setupAutoRefresh() {
        // Clear existing timer
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }
        if (!this.accessToken)
            return;
        try {
            const decoded = decodeJWT(this.accessToken);
            const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
            const refreshAt = Math.max(0, expiresIn - this.refreshBuffer) * 1000;
            this.refreshTimer = setTimeout(async () => {
                try {
                    await this.refreshAccessToken();
                }
                catch (error) {
                    console.error('Auto-refresh failed:', error);
                    this.onError(error instanceof Error ? error : new Error('Auto-refresh failed'));
                }
            }, refreshAt);
        }
        catch (error) {
            console.error('Failed to setup auto-refresh:', error);
        }
    }
    /**
     * Login with email and password
     */
    async login() {
        if (!this.email || !this.password) {
            throw new Error('Email and password are required for login. Use loginWithToken() for API token authentication.');
        }
        const response = await this.apiRequest('/auth/login', 'POST', {
            email: this.email,
            password: this.password,
        }, false);
        this.saveTokens(response);
        return response;
    }
    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new TokenExpiredError('No refresh token available');
        }
        const response = await this.apiRequest('/auth/refresh', 'POST', {
            refresh_token: this.refreshToken,
        }, false);
        this.saveTokens(response);
        this.onTokenRefreshed(response);
        return response;
    }
    /**
     * Logout and clear tokens
     */
    logout() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        this.onLogout();
    }
    /**
     * Get current access token
     */
    getAccessToken() {
        return this.accessToken;
    }
    /**
     * Get current refresh token
     */
    getRefreshToken() {
        return this.refreshToken;
    }
    /**
     * Get current user
     */
    getUser() {
        return this.user;
    }
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        if (!this.accessToken)
            return false;
        try {
            return !isTokenExpired(this.accessToken);
        }
        catch {
            return false;
        }
    }
    /**
     * Get current environment
     */
    getEnvironment() {
        return this.environment;
    }
    /**
     * Switch environment
     */
    setEnvironment(env) {
        this.environment = env;
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
    async createInvoice(data) {
        return this.apiRequest('/invoice/store', 'POST', data);
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
    async readInvoice(file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.apiRequest('/reader', 'POST', formData, true, {
            contentType: null,
        });
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
    async makeupInvoice(data) {
        return this.apiRequest('/makeup', 'POST', data, true, {
            responseType: 'arrayBuffer',
        });
    }
    /**
     * Login with API Token
     *
     * **Recommended:** Use `createInvoSDKWithToken()` instead for a simpler API.
     *
     * @param apiToken - API token for authentication
     * @returns Authentication response with access token
     *
     * @example
     * ```typescript
     * // Using the helper (recommended)
     * const sdk = await createInvoSDKWithToken('invo_tok_prod_abc123...')
     *
     * // Or manually
     * const sdk = new InvoSDK({ environment: 'production' })
     * const response = await sdk.loginWithToken('invo_tok_prod_abc123...')
     * console.log('Authenticated:', response.user.email)
     * ```
     */
    async loginWithToken(apiToken) {
        const response = await this.apiRequest('/auth/token', 'POST', { api_token: apiToken }, false);
        this.saveTokens(response);
        return response;
    }
    /**
     * Make a generic authenticated request to any endpoint
     *
     * @param endpoint - The API endpoint (e.g., '/users/me')
     * @param method - HTTP method
     * @param body - Request body (optional)
     */
    async request(endpoint, method = 'GET', body) {
        return this.apiRequest(endpoint, method, body);
    }
}
/**
 * Create SDK instance with API Token authentication
 *
 * Automatically detects the environment from the token prefix:
 * - `invo_tok_prod_*` → production
 * - `invo_tok_sand_*` → sandbox
 *
 * @param apiToken - API token for authentication
 * @param config - Optional SDK configuration (environment will be auto-detected if not provided)
 * @returns SDK instance ready to use
 *
 * @example
 * ```typescript
 * import { createInvoSDKWithToken } from 'invo-sdk'
 *
 * // Environment is auto-detected from token prefix
 * const sdk = await createInvoSDKWithToken('invo_tok_prod_abc123...')
 *
 * // Or explicitly specify environment
 * const sdk = await createInvoSDKWithToken('invo_tok_prod_abc123...', {
 *   environment: 'production'
 * })
 *
 * // SDK is automatically authenticated and ready to use
 * const invoice = await sdk.createInvoice({...})
 * ```
 */
async function createInvoSDKWithToken(apiToken, config) {
    // Auto-detect environment from token if not explicitly provided
    const detectedEnv = detectEnvironmentFromToken(apiToken);
    const environment = config?.environment || detectedEnv || 'production';
    const sdk = new InvoSDK({
        environment,
        autoRefresh: config?.autoRefresh ?? false, // Tokens don't auto-refresh
        refreshBuffer: config?.refreshBuffer,
        onTokenRefreshed: config?.onTokenRefreshed,
        onLogout: config?.onLogout,
        onError: config?.onError,
    });
    // Auto-login with token
    await sdk.loginWithToken(apiToken);
    return sdk;
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
function createInvoSDK(config) {
    return new InvoSDK(config);
}

export { AuthError, InvalidCredentialsError, InvalidTokenError, InvoSDK, NetworkError, OAuthError, TokenExpiredError, createInvoSDK, createInvoSDKWithToken, decodeJWT, getSecondsUntilExpiration, isTokenExpired, isValidEmail };
