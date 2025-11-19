// /**
//  * Test script for INVO SDK API Token functionality
//  * Tests: createInvoSDKWithToken, createApiToken, listApiTokens, getApiToken, revokeApiToken
//  */

// import { config } from 'dotenv'
// import { resolve } from 'path'
// import { createInvoSDK, createInvoSDKWithToken } from '../src/sdk'

// // Load environment variables from .env file in project root
// config({ path: resolve(__dirname, '../.env') })

// // Configuration
// const TEST_EMAIL = process.env.INVO_EMAIL || 'your-email@example.com'
// const TEST_PASSWORD = process.env.INVO_PASSWORD || 'your-password'
// const TEST_ENVIRONMENT = (process.env.INVO_ENV as 'production' | 'sandbox') || 'sandbox'
// const TEST_NAME = process.env.INVO_NAME
// const TEST_NIF = process.env.INVO_NIF

// async function main() {
//     console.log('🚀 Starting INVO SDK API Token Tests\n')
//     console.log('Configuration:')
//     console.log(`  Email: ${TEST_EMAIL}`)
//     console.log(`  Environment: ${TEST_ENVIRONMENT}`)
//     console.log('')

//     // Step 1: Create SDK instance with email/password to create an API token
//     console.log('📦 Step 1: Creating SDK instance with email/password...')
//     const sdk = createInvoSDK({
//         email: TEST_EMAIL,
//         password: TEST_PASSWORD,
//         environment: TEST_ENVIRONMENT,
//     })

//     let createdTokenId: string | undefined
//     let apiToken: string | undefined

//     try {
//         // Test 1: Login with email/password
//         console.log('\n🔐 Test 1: Authentication with Email/Password')
//         console.log('  Attempting login...')
//         const authResponse = await sdk.login()
//         console.log('  ✅ Login successful!')
//         console.log(`  User ID: ${authResponse.user.id}`)
//         console.log(`  User Email: ${authResponse.user.email}`)
//         console.log(`  Token expires in: ${authResponse.expires_in} seconds`)

//         // Test 2: Create API Token
//         console.log('\n🔑 Test 2: Create API Token')
//         console.log('  Creating new API token...')
//         const tokenResponse = await sdk.createApiToken({
//             name: `SDK Test Token - ${new Date().toISOString()}`,
//             expires_in: 30, // 30 days
//         })
//         createdTokenId = tokenResponse.id
//         apiToken = tokenResponse.token
//         console.log('  ✅ API Token created successfully!')
//         console.log(`  Token ID: ${tokenResponse.id}`)
//         console.log(`  Token Name: ${tokenResponse.name}`)
//         console.log(`  Token Preview: ${tokenResponse.token.substring(0, 25)}...`)
//         console.log(`  Expires at: ${tokenResponse.expires_at}`)
//         console.log(`  Is Active: ${tokenResponse.is_active}`)
//         console.log('  ⚠️ This token will only be shown once!')

//         // Test 3: List API Tokens
//         console.log('\n📋 Test 3: List API Tokens')
//         const tokens = await sdk.listApiTokens()
//         console.log(`  ✅ Found ${tokens.length} API token(s)`)
//         tokens.forEach((token, index) => {
//             console.log(`  Token ${index + 1}:`)
//             console.log(`    Name: ${token.name}`)
//             console.log(`    Prefix: ${token.prefix}...`)
//             console.log(`    Created: ${token.created_at}`)
//             console.log(`    Last used: ${token.last_used_at || 'Never'}`)
//             console.log(`    Active: ${token.is_active}`)
//         })

//         // Test 4: Get specific API Token details
//         console.log('\n🔍 Test 4: Get API Token Details')
//         const tokenDetails = await sdk.getApiToken(createdTokenId)
//         console.log('  ✅ Token details retrieved:')
//         console.log(`  Name: ${tokenDetails.name}`)
//         console.log(`  Prefix: ${tokenDetails.prefix}...`)
//         console.log(`  Is Active: ${tokenDetails.is_active}`)
//         console.log(`  Created: ${tokenDetails.created_at}`)

//         // Test 5: Create new SDK instance with API Token
//         console.log('\n🆕 Test 5: Create SDK Instance with API Token')
//         console.log('  Creating new SDK instance using createInvoSDKWithToken...')
//         const tokenSdk = await createInvoSDKWithToken(apiToken)
//         console.log('  ✅ SDK instance created and authenticated with API token!')
//         console.log(`  Is authenticated: ${tokenSdk.isAuthenticated() ? '✅' : '❌'}`)
//         const tokenUser = tokenSdk.getUser()
//         console.log(`  Current user: ${tokenUser?.email || 'None'}`)

//         // Test 6: Test operations with token-based SDK
//         console.log('\n📊 Test 6: Test Operations with Token-based SDK')
//         console.log('  Listing tokens with the new SDK instance...')
//         const tokensFromTokenSdk = await tokenSdk.listApiTokens()
//         console.log(
//             `  ✅ Retrieved ${tokensFromTokenSdk.length} token(s) using token authentication`,
//         )

//         // Test 7: Create a test invoice with token-based SDK (optional)
//         console.log('\n📄 Test 7: Create Invoice with Token-based SDK')
//         console.log('  Preparing test invoice...')

//         const invoiceData = {
//             issueDate: new Date().toISOString(),
//             invoiceNumber: `TEST-TOKEN-${Date.now()}`,
//             externalId: `test-token-order-${Date.now()}`,
//             totalAmount: 1210.0,
//             customerName: TEST_NAME || 'Test Customer',
//             customerTaxId: TEST_NIF || 'CIF12345678',
//             emitterName: TEST_NAME || 'Test Emitter',
//             emitterTaxId: TEST_NIF || 'CIF87654321',
//             type: 'F1' as const,
//             description: 'Factura de prueba del SDK con API Token',
//             taxLines: [
//                 {
//                     taxRate: 21,
//                     baseAmount: 1000.0,
//                     taxAmount: 210.0,
//                 },
//             ],
//         }

//         console.log('  Invoice data prepared ')
//         const result = await tokenSdk.createInvoice(invoiceData)
//         console.log('  ✅ Invoice created successfully!')
//         console.log(`  Invoice ID: ${result.invoiceId}`)

//         // Test 8: Revoke API Token
//         console.log('\n🗑️  Test 8: Revoke API Token')
//         console.log('  Revoking the test token...')
//         await sdk.revokeApiToken(createdTokenId)
//         console.log('  ✅ API Token revoked successfully!')

//         // Verify token is revoked
//         console.log('  Verifying token is revoked...')
//         const tokensAfterRevoke = await sdk.listApiTokens()
//         const revokedToken = tokensAfterRevoke.find((t) => t.id === createdTokenId)
//         if (!revokedToken) {
//             console.log('  ✅ Token no longer appears in active tokens list')
//         } else if (!revokedToken.is_active) {
//             console.log('  ✅ Token is marked as inactive')
//         } else {
//             console.log('  ⚠️ Token still appears as active (might take time to update)')
//         }

//         // Test 9: Cleanup
//         console.log('\n👋 Test 9: Cleanup')
//         console.log('  Logging out from email/password SDK...')
//         sdk.logout()
//         console.log(`  Is authenticated after logout: ${sdk.isAuthenticated() ? '❌' : '✅'}`)

//         console.log('\n🎉 All API Token tests completed successfully!')
//         console.log('')
//     } catch (error) {
//         console.error('')
//         console.error('❌ Test failed!')
//         if (error instanceof Error) {
//             console.error(`  Error: ${error.message}`)
//             console.error(`  Type: ${error.constructor.name}`)
//             if (error.stack) {
//                 console.error('')
//                 console.error('Stack trace:')
//                 console.error(error.stack)
//             }
//         } else {
//             console.error('  Unknown error:', error)
//         }

//         // Cleanup: Try to revoke the token if it was created
//         if (createdTokenId && sdk.isAuthenticated()) {
//             try {
//                 console.log('\n🧹 Attempting cleanup: Revoking test token...')
//                 await sdk.revokeApiToken(createdTokenId)
//                 console.log('  ✅ Test token cleaned up')
//             } catch (cleanupError) {
//                 console.error('  ⚠️ Could not cleanup test token:', cleanupError)
//             }
//         }

//         process.exit(1)
//     }
// }

// // Run tests
// main().catch((error) => {
//     console.error('Fatal error:', error)
//     process.exit(1)
// })
