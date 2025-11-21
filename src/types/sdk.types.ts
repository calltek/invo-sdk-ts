/**
 * SDK Configuration types
 */

/**
 * Invoice SDK Configuration
 */
export interface InvoSDKConfig {
    /**
     * API token for authentication (required)
     * The SDK will automatically login when initialized
     * Environment is auto-detected from the token prefix:
     * - invo_tok_prod_* → production
     * - invo_tok_sand_* → sandbox
     */
    apiToken: string

    /**
     * Workspace ID to use for multi-tenant scenarios
     */
    workspace?: string

    /**
     * Environment to use
     * If not specified, it will be auto-detected from the token prefix
     * @default auto-detected from token
     */
    environment?: 'production' | 'sandbox'

    /**
     * Callback fired on authentication errors
     */
    onError?: (error: Error) => void
}

