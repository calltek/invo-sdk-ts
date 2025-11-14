/**
 * Test script for INVO SDK
 *
 * Usage:
 * npx tsx test.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createInvoSDK } from '../src/sdk'

// Load environment variables from .env file in project root
config({ path: resolve(__dirname, '../.env') })

// Configuration - Replace with your credentials
const TEST_EMAIL = process.env.INVO_EMAIL || 'your-email@example.com'
const TEST_PASSWORD = process.env.INVO_PASSWORD || 'your-password'
const TEST_ENVIRONMENT = (process.env.INVO_ENV as 'production' | 'sandbox') || 'sandbox'

async function main() {
    console.log('🚀 Starting INVO SDK Tests\n')
    console.log('Configuration:')
    console.log(`  Email: ${TEST_EMAIL}`)
    console.log(`  Environment: ${TEST_ENVIRONMENT}`)
    console.log('')

    // Create SDK instance
    console.log('📦 Creating SDK instance...')
    const sdk = createInvoSDK({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        environment: TEST_ENVIRONMENT,
        autoRefresh: true,
        refreshBuffer: 300,
        onTokenRefreshed: () => {
            console.log('✅ Token refreshed automatically')
        },
        onError: (error) => {
            console.error('❌ SDK Error:', error.message)
        },
        onLogout: () => {
            console.log('👋 User logged out')
        },
    })

    try {
        // Test 1: Login
        console.log('🔐 Test 1: Authentication')
        console.log('  Attempting login...')
        const authResponse = await sdk.login()
        console.log('  ✅ Login successful!')
        console.log(`  User ID: ${authResponse.user.id}`)
        console.log(`  User Email: ${authResponse.user.email}`)
        console.log(`  Token expires in: ${authResponse.expires_in} seconds`)
        console.log('')

        // Test 2: Check authentication status
        console.log('🔍 Test 2: Authentication Status')
        const isAuthenticated = sdk.isAuthenticated()
        console.log(`  Is authenticated: ${isAuthenticated ? '✅' : '❌'}`)
        const user = sdk.getUser()
        console.log(`  Current user: ${user?.email || 'None'}`)
        const accessToken = sdk.getAccessToken()
        console.log(`  Has access token: ${accessToken ? '✅' : '❌'}`)
        console.log(`  Token preview: ${accessToken?.substring(0, 20)}...`)
        console.log('')

        // Test 3: Create a test invoice
        console.log('📄 Test 3: Create Invoice')
        console.log('  Creating test invoice...')

        const invoiceData = {
            issueDate: new Date().toISOString(),
            invoiceNumber: `TEST-${Date.now()}`,
            externalId: `test-order-${Date.now()}`,
            totalAmount: 1210.00,
            customerName: 'Cliente Test SL',
            customerTaxId: 'B12345678',
            emitterName: 'Empresa Test SL',
            emitterTaxId: 'B87654321',
            type: 'F1' as const,
            description: 'Factura de prueba del SDK',
            taxLines: [
                {
                    taxRate: 21,
                    baseAmount: 1000.00,
                    taxAmount: 210.00,
                },
            ],
        }

        console.log('  Invoice data:', JSON.stringify(invoiceData, null, 2))

        const result = await sdk.createInvoice(invoiceData)
        console.log('  ✅ Invoice created successfully!')
        console.log(`  Invoice ID: ${result.invoiceId}`)
        console.log(`  Chain Index: ${result.chainIndex}`)
        console.log(`  Success: ${result.success}`)
        console.log('')

        // Test 4: Generic API request
        console.log('🌐 Test 4: Generic API Request')
        console.log('  Making request to /auth/me...')
        try {
            const userData = await sdk.request('/auth/me', 'GET')
            console.log('  ✅ Request successful!')
            console.log('  User data:', JSON.stringify(userData, null, 2))
        } catch (error) {
            console.log('  ⚠️  Endpoint /auth/me not available or requires different path')
        }
        console.log('')

        // Test 5: Token refresh (manual)
        console.log('🔄 Test 5: Manual Token Refresh')
        console.log('  Refreshing token manually...')
        const refreshedTokens = await sdk.refreshAccessToken()
        console.log('  ✅ Token refreshed successfully!')
        console.log(`  New token expires in: ${refreshedTokens.expires_in} seconds`)
        console.log('')

        // Test 6: Environment switching
        console.log('🔀 Test 6: Environment Switching')
        const currentEnv = sdk.getEnvironment()
        console.log(`  Current environment: ${currentEnv}`)
        const newEnv = currentEnv === 'production' ? 'sandbox' : 'production'
        sdk.setEnvironment(newEnv)
        console.log(`  Switched to: ${sdk.getEnvironment()}`)
        sdk.setEnvironment(currentEnv) // Switch back
        console.log(`  Switched back to: ${sdk.getEnvironment()}`)
        console.log('')

        // Test 7: Logout
        console.log('👋 Test 7: Logout')
        console.log('  Logging out...')
        sdk.logout()
        console.log(`  Is authenticated after logout: ${sdk.isAuthenticated() ? '❌' : '✅'}`)
        console.log(`  Access token after logout: ${sdk.getAccessToken() || 'null (✅)'}`)
        console.log('')

        console.log('🎉 All tests completed successfully!')
        console.log('')

    } catch (error) {
        console.error('')
        console.error('❌ Test failed!')
        if (error instanceof Error) {
            console.error(`  Error: ${error.message}`)
            console.error(`  Type: ${error.constructor.name}`)
            if (error.stack) {
                console.error('')
                console.error('Stack trace:')
                console.error(error.stack)
            }
        } else {
            console.error('  Unknown error:', error)
        }
        process.exit(1)
    }
}

// Run tests
main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
})
