/**
 * Test script for INVO SDK - Reader Endpoint
 *
 * Tests the readInvoice method that reads invoice data from uploaded files
 *
 * Usage:
 * npx tsx test/test-reader.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync, existsSync } from 'fs'
import { createInvoSDK } from '../src/sdk'

// Load environment variables from .env file in project root
config({ path: resolve(__dirname, '../.env') })

// Configuration
const TEST_EMAIL = process.env.INVO_EMAIL || 'your-email@example.com'
const TEST_PASSWORD = process.env.INVO_PASSWORD || 'your-password'
const TEST_ENVIRONMENT = (process.env.INVO_ENV as 'production' | 'sandbox') || 'sandbox'

// Path to test invoice file (PDF, XML, etc.)
const TEST_INVOICE_PATH = process.env.TEST_INVOICE_PATH || resolve(__dirname, '../test/factura_test.pdf')

async function main() {
    console.log('🚀 Starting INVO SDK Reader Tests\n')
    console.log('Configuration:')
    console.log(`  Email: ${TEST_EMAIL}`)
    console.log(`  Environment: ${TEST_ENVIRONMENT}`)
    console.log(`  Test Invoice Path: ${TEST_INVOICE_PATH}`)
    console.log('')

    // Check if test invoice file exists
    if (!existsSync(TEST_INVOICE_PATH)) {
        console.error('❌ Test invoice file not found!')
        console.error(`   Expected file at: ${TEST_INVOICE_PATH}`)
        console.error('')
        console.error('📝 To run this test:')
        console.error('   1. Place a test invoice PDF/XML file in the project root')
        console.error('   2. Name it "factura_test.pdf" or set TEST_INVOICE_PATH env variable')
        console.error('   3. Run: npx tsx test/test-reader.ts')
        process.exit(1)
    }

    // Create SDK instance
    console.log('📦 Creating SDK instance...')
    const sdk = createInvoSDK({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        environment: TEST_ENVIRONMENT,
        autoRefresh: true,
        onTokenRefreshed: () => {
            console.log('✅ Token refreshed automatically')
        },
        onError: (error) => {
            console.error('❌ SDK Error:', error.message)
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
        console.log('')

        // Test 2: Read Invoice from file
        console.log('📖 Test 2: Read Invoice')
        console.log('  Loading test invoice file...')

        // Read the file as a buffer
        const fileBuffer = readFileSync(TEST_INVOICE_PATH)
        console.log(`  File size: ${fileBuffer.length} bytes`)

        // Create a File object (in Node.js we need to create a Blob-like object)
        const fileName = TEST_INVOICE_PATH.split('/').pop() || 'invoice.pdf'
        const mimeType = fileName.endsWith('.xml')
            ? 'application/xml'
            : fileName.endsWith('.pdf')
              ? 'application/pdf'
              : 'application/octet-stream'

        // For Node.js, we need to create a File-like object
        // In Node 18+, File is available globally
        let file: File | Blob
        if (typeof File !== 'undefined') {
            file = new File([fileBuffer], fileName, { type: mimeType })
        } else {
            // Fallback for older Node versions using Blob
            file = new Blob([fileBuffer], { type: mimeType })
        }

        console.log(`  File type: ${mimeType}`)
        console.log('  Uploading and reading invoice...')

        const invoiceData = await sdk.readInvoice(file)

        console.log('  ✅ Invoice read successfully!')
        console.log('  Invoice data:', JSON.stringify(invoiceData, null, 2))
        console.log('')

        // Validate response structure
        console.log('📋 Test 3: Validate Response')
        if (invoiceData) {
            console.log('  ✅ Response contains data')
            console.log(`  Response type: ${typeof invoiceData}`)
            if (typeof invoiceData === 'object') {
                console.log(`  Keys in response: ${Object.keys(invoiceData).join(', ')}`)
            }
        } else {
            console.log('  ⚠️  Response is empty or null')
        }
        console.log('')

        console.log('🎉 All Reader tests completed successfully!')
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
