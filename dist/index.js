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
    /**
     * Create a new InvoSDK instance
     *
     * @example
     * ```typescript
     * // Basic usage
     * const sdk = new InvoSDK({ apiToken: 'invo_tok_prod_...' })
     *
     * // With workspace
     * const sdk = new InvoSDK({
     *   apiToken: 'invo_tok_prod_...',
     *   workspace: 'workspace-id'
     * })
     *
     * // All methods automatically authenticate when needed
     * const invoice = await sdk.store({...})
     * ```
     */
    constructor(config) {
        // Token storage in memory
        this.accessToken = null;
        this.user = null;
        this.loginPromise = null;
        if (config.environment && !['production', 'sandbox'].includes(config.environment)) {
            throw new Error('Invalid environment. Allowed values are production, sandbox.');
        }
        this.apiToken = config.apiToken;
        this.workspace = config.workspace;
        // Auto-detect environment from API token if not provided
        const detectedEnv = detectEnvironmentFromToken(this.apiToken);
        this.environment = config.environment || detectedEnv || 'production';
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
     * Ensure the SDK is authenticated
     * Automatically logs in with API token if not already authenticated
     */
    async ensureAuthenticated() {
        // Already authenticated
        if (this.accessToken && !isTokenExpired(this.accessToken)) {
            return;
        }
        // Login in progress, wait for it
        if (this.loginPromise) {
            await this.loginPromise;
            return;
        }
        // Auto-login with API token
        this.loginPromise = this.loginWithToken();
        try {
            await this.loginPromise;
        }
        finally {
            this.loginPromise = null;
        }
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
                // Ensure we're authenticated (auto-login if needed)
                await this.ensureAuthenticated();
                if (!this.accessToken) {
                    throw new TokenExpiredError('No access token available after authentication.');
                }
                headers['Authorization'] = `Bearer ${this.accessToken}`;
            }
            // Add workspace header if specified
            if (this.workspace) {
                headers['X-Workspace-Id'] = this.workspace;
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
        this.user = response.user;
    }
    /**
     * Get current access token
     */
    getAccessToken() {
        return this.accessToken;
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
     * Create and submit a new invoice
     *
     * @param data - Invoice data
     * @param callback - Optional webhook URL to receive status updates for this invoice
     *
     * @example
     * ```typescript
     * // Without webhook
     * const result = await sdk.store({
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
     *
     * // With webhook to receive status updates
     * const result = await sdk.store({...}, 'https://myapp.com/webhooks/invo')
     * console.log('Invoice created:', result.invoiceId)
     * ```
     */
    async store(data, callback) {
        const payload = {
            ...data,
            ...(callback && { callback })
        };
        return this.apiRequest('/invoice/store', 'POST', payload);
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
     * const invoiceData = await sdk.read(file)
     * ```
     */
    async read(file) {
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
     * const pdfBuffer = await sdk.pdf({
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
    async pdf(data) {
        return this.apiRequest('/makeup', 'POST', data, true, {
            responseType: 'arrayBuffer',
        });
    }
    /**
     * Login with API Token (internal method)
     */
    async loginWithToken() {
        const response = await this.apiRequest('/auth/token', 'POST', { api_token: this.apiToken }, false);
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

export { AuthError, InvalidCredentialsError, InvalidTokenError, InvoSDK, NetworkError, OAuthError, TokenExpiredError, decodeJWT, getSecondsUntilExpiration, isTokenExpired, isValidEmail };
