/**
 * Test script for INVO SDK - Makeup Endpoint
 *
 * Tests the makeupInvoice method that generates PDF invoices with custom branding
 *
 * Usage:
 * npx tsx test/test-makeup.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { writeFileSync } from 'fs'
import { createInvoSDK } from '../src/sdk'
import type { MakeupPDFDto } from '../src/types'

// Load environment variables from .env file in project root
config({ path: resolve(__dirname, '../.env') })

// Configuration
const TEST_EMAIL = process.env.INVO_EMAIL || 'your-email@example.com'
const TEST_PASSWORD = process.env.INVO_PASSWORD || 'your-password'
const TEST_ENVIRONMENT = (process.env.INVO_ENV as 'production' | 'sandbox') || 'sandbox'
const TEST_NAME = process.env.INVO_NAME || 'Test Company SL'
const TEST_NIF = process.env.INVO_NIF || 'B12345678'

// Output path for generated PDF
const OUTPUT_PDF_PATH = resolve(__dirname, '../test-output-invoice.pdf')

async function main() {
    console.log('🚀 Starting INVO SDK Makeup Tests\n')
    console.log('Configuration:')
    console.log(`  Email: ${TEST_EMAIL}`)
    console.log(`  Environment: ${TEST_ENVIRONMENT}`)
    console.log(`  Output PDF Path: ${OUTPUT_PDF_PATH}`)
    console.log('')

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

        // Test 2: Generate Invoice PDF
        console.log('🎨 Test 2: Generate Invoice PDF')
        console.log('  Preparing invoice data...')

        const invoiceData: MakeupPDFDto = {
            id: `INV-TEST-${Date.now()}`,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
            branding: {
                logo: 'https://via.placeholder.com/200x80/4F46E5/ffffff?text=LOGO',
                favicon: 'https://via.placeholder.com/32x32/4F46E5/ffffff?text=F',
                accent_color: '#4F46E5', // Indigo
                foreground_color: '#ffffff', // White
            },
            client: {
                name: 'John Doe',
                cif: '12345678A',
                address: 'Calle Falsa 123, 28080 Madrid',
                phone: '+34 666 123 123',
                email: 'john.doe@example.com',
            },
            business: {
                name: TEST_NAME,
                cif: TEST_NIF,
                address: 'Avenida Principal 456, 28080 Madrid',
                phone: '+34 911 123 123',
                email: 'business@example.com',
            },
            total: 1210,
            subtotal: 1000,
            tax_value: 210,
            tax_percent: 21,
            surcharge_value: 0,
            surcharge_percent: 0,
            observations: '¡Gracias por su compra! Es un placer hacer negocios con usted.',
            payment_instructions:
                'Transferencia bancaria a la cuenta ES00 0000 0000 0000 0000 0000. Por favor, incluya el número de factura como referencia.',
            RGPD: 'Sus datos personales serán tratados de acuerdo con el Reglamento General de Protección de Datos (RGPD).',
            type: 'invoice',
            template: 'classic',
            concepts: [
                {
                    name: 'Copistería',
                    quantity: 80,
                    total: 400.0,
                    subtotal: 400.0,
                    discount_value: 0.0,
                    discount_percent: 0,
                    price: 5,
                },
            ],
        }

        console.log('  Invoice details:')
        console.log(`    ID: ${invoiceData.id}`)
        console.log(`    Date: ${invoiceData.date}`)
        console.log(`    Client: ${invoiceData.client.name} (${invoiceData.client.cif})`)
        console.log(`    Business: ${invoiceData.business.name} (${invoiceData.business.cif})`)
        console.log(`    Total: €${invoiceData.total}`)
        console.log('')

        console.log('  Generating PDF...')
        const startTime = Date.now()

        const pdfBuffer = await sdk.makeupInvoice(invoiceData)

        const endTime = Date.now()
        const duration = endTime - startTime

        console.log(`  ✅ PDF generated successfully! (${duration}ms)`)
        console.log(
            `  PDF size: ${pdfBuffer.byteLength} bytes (${(pdfBuffer.byteLength / 1024).toFixed(2)} KB)`,
        )
        console.log('')

        // Test 3: Save PDF to file
        console.log('💾 Test 3: Save PDF to File')
        console.log(`  Writing PDF to: ${OUTPUT_PDF_PATH}`)

        // Convert ArrayBuffer to Buffer for Node.js
        const nodeBuffer = Buffer.from(pdfBuffer)
        writeFileSync(OUTPUT_PDF_PATH, nodeBuffer)

        console.log('  ✅ PDF saved successfully!')
        console.log(`  File location: ${OUTPUT_PDF_PATH}`)
        console.log('')

        // Test 4: Validate PDF structure
        console.log('📋 Test 4: Validate PDF Structure')
        const pdfHeader = nodeBuffer.toString('utf8', 0, 5)
        if (pdfHeader === '%PDF-') {
            console.log('  ✅ Valid PDF header detected')
            console.log(`  PDF version: ${nodeBuffer.toString('utf8', 5, 8)}`)
        } else {
            console.log('  ⚠️  PDF header not found - might not be a valid PDF')
        }
        console.log('')

        console.log('🎉 All Makeup tests completed successfully!')
        console.log('')
        console.log('📄 You can now open the generated PDF:')
        console.log(`   open ${OUTPUT_PDF_PATH}`)
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
