/**
 * Test script for INVO SDK API Token Authentication
 * Tests: createInvoSDKWithToken and loginWithToken
 *
 * Note: API token management (create, list, revoke) is done through the INVO web platform.
 * This test assumes you have an existing API token from your INVO account.
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createInvoSDKWithToken, InvoSDK } from '../src/sdk'

// Load environment variables from .env file in project root
config({ path: resolve(__dirname, '../.env') })

// Configuration
const TEST_API_TOKEN = process.env.INVO_API_TOKEN || 'your-api-token-here'
const TEST_NAME = process.env.INVO_NAME
const TEST_NIF = process.env.INVO_NIF

async function main() {
    console.log('🚀 Starting INVO SDK API Token Authentication Tests\n')

    if (!TEST_API_TOKEN || TEST_API_TOKEN === 'your-api-token-here') {
        console.error('❌ Error: INVO_API_TOKEN environment variable is not set')
        console.error('   Please add INVO_API_TOKEN to your .env file')
        console.error('   You can obtain an API token from your INVO account dashboard')
        process.exit(1)
    }

    try {
        // Test 1: Create SDK with API Token (using helper function)
        console.log('🔐 Test 1: Create SDK with API Token (using createInvoSDKWithToken)')
        console.log('  Creating SDK instance...')
        const sdk = await createInvoSDKWithToken(TEST_API_TOKEN)
        console.log('  ✅ SDK created and authenticated successfully!')
        console.log(`  Is authenticated: ${sdk.isAuthenticated() ? '✅' : '❌'}`)
        const user = sdk.getUser()
        console.log(`  Current user: ${user?.email || 'None'}`)
        console.log(`  Environment: ${sdk.getEnvironment()}`)

        // Test 2: Create test invoice with token-based SDK
        console.log('\n📄 Test 2: Create Invoice with Token Authentication')
        console.log('  Preparing test invoice...')

        const invoiceData = {
            issueDate: new Date().toISOString(),
            invoiceNumber: `TEST-TOKEN-${Date.now()}`,
            externalId: `test-token-order-${Date.now()}`,
            totalAmount: 1210.0,
            customerName: TEST_NAME || 'Test Customer',
            customerTaxId: TEST_NIF || 'B12345678',
            emitterName: TEST_NAME || 'Test Emitter',
            emitterTaxId: TEST_NIF || 'B87654321',
            type: 'F1' as const,
            description: 'Factura de prueba del SDK con API Token',
            taxLines: [
                {
                    taxRate: 21,
                    baseAmount: 1000.0,
                    taxAmount: 210.0,
                },
            ],
        }

        console.log('  Creating invoice...')
        const result = await sdk.createInvoice(invoiceData)
        console.log('  ✅ Invoice created successfully!')
        console.log(`  Invoice ID: ${result.invoiceId}`)
        console.log(`  Chain Index: ${result.chainIndex}`)

        // Test 3: Manual login with token (alternative method)
        console.log('\n🔑 Test 3: Manual Login with Token (alternative method)')
        console.log('  Creating SDK instance without authentication...')
        const sdk2 = new InvoSDK({ environment: 'production' })
        console.log('  Logging in with API token...')
        const authResponse = await sdk2.loginWithToken(TEST_API_TOKEN)
        console.log('  ✅ Login successful!')
        console.log(`  User ID: ${authResponse.user.id}`)
        console.log(`  User Email: ${authResponse.user.email}`)
        console.log(`  Is authenticated: ${sdk2.isAuthenticated() ? '✅' : '❌'}`)

        console.log('\n🎉 All API Token authentication tests completed successfully!')
        console.log('')
        console.log('💡 Note: API token management (create, list, revoke) is done through')
        console.log('   the INVO web platform at https://invo.rest')
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
