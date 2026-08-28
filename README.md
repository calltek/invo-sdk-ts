# INVO SDK

Backend SDK for INVO API - Simplified authentication and invoice management with full TypeScript support.

## Features

✅ **TypeScript Native** - Complete type definitions and autocomplete
✅ **Backend Optimized** - Designed for Node.js/Backend applications
✅ **API Token Authentication** - Secure authentication with automatic login
✅ **Zero Configuration** - Works out of the box with minimal setup
✅ **Invoice Management** - Create and manage VeriFactu invoices
✅ **Invoice Reader** - Extract data from PDF and XML invoices
✅ **PDF Generator** - Generate branded invoice PDFs
✅ **Webhook Support** - Receive invoice status updates
✅ **Workspace Support** - Multi-tenant scenarios
✅ **Multi-Environment** - Production and sandbox modes
✅ **Zero Dependencies** - No external dependencies
✅ **Generic Request Method** - Call any API endpoint with authentication

## Installation

```bash
npm install @calltek/invo-sdk
```

```bash
yarn add @calltek/invo-sdk
```

```bash
pnpm add @calltek/invo-sdk
```

## Quick Start

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

// Create SDK instance (login is automatic!)
const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
  // environment is auto-detected from token prefix
})

// Create an invoice - authentication happens automatically
const result = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-001',
  externalId: 'order-12345',
  totalAmount: 1210.00,
  customerName: 'Cliente Ejemplo SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  description: 'Servicios de consultoría tecnológica',
  taxLines: [{
    taxRate: 21,
    baseAmount: 1000.00,
    taxAmount: 210.00
  }]
})

console.log('Invoice created:', result.invoiceId)
console.log('Chain index:', result.chainIndex)
```

## Configuration

```typescript
interface InvoSDKConfig {
  apiToken: string                      // Required: API token from INVO platform
  environment?: 'production' | 'sandbox' // Optional: Auto-detected from token
  onError?: (error: Error) => void      // Optional: Error callback
  debug?: boolean                       // Optional: Enable debug logging
}
```

**Important:** The workspace is automatically determined by the API token. Each API token is associated with a specific workspace, so you don't need to specify it separately.

## Usage Examples

### Basic Setup

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

// Simple setup - workspace is determined by the API token
const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})
```

### Creating Invoices

#### Simple Invoice

```typescript
const result = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-001',
  externalId: 'order-12345',
  totalAmount: 1210.00,
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  description: 'Servicios de consultoría',
  taxLines: [{
    taxRate: 21,
    baseAmount: 1000.00,
    taxAmount: 210.00
  }]
})
```

#### Invoice with Webhook Callback

```typescript
// Receive status updates when the invoice is processed
const result = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-001',
  // ... invoice data
}, 'https://myapp.com/webhooks/invoice-status')

// Your webhook will be called when the invoice status changes
```

#### Invoice with Multiple Tax Rates

```typescript
const result = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-002',
  externalId: 'multi-tax-001',
  totalAmount: 1864.00,
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  description: 'Venta mixta de productos',
  taxLines: [
    {
      taxRate: 21,
      baseAmount: 1000.00,
      taxAmount: 210.00
    },
    {
      taxRate: 10,
      baseAmount: 500.00,
      taxAmount: 50.00
    },
    {
      taxRate: 4,
      baseAmount: 100.00,
      taxAmount: 4.00
    }
  ]
})
```

#### Rectificative Invoice (R1-R5)

```typescript
// Every rectificative type (R1-R5) requires both rectifiedInvoiceIds and
// rectificationType — the backend rejects the request without them.
const result = await sdk.store({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-003',
  externalId: 'rectification-001',
  totalAmount: -121.00, // negative on a credit note
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  description: 'Anulación de la factura FAC-2024-001',
  type: 'R1',
  rectifiedInvoiceIds: ['<uuid-de-la-factura-original>'],
  rectificationType: 'S', // "S" (por sustitución) o "I" (por diferencias)
  taxLines: [{
    taxRate: 21,
    baseAmount: -100.00,
    taxAmount: -21.00
  }]
})
```

### Reading Invoice from File

```typescript
import fs from 'fs'

// Read invoice from a PDF file
const fileBuffer = fs.readFileSync('invoice.pdf')
const file = new File([fileBuffer], 'invoice.pdf', { type: 'application/pdf' })

const invoiceData = await sdk.read(file)
console.log('Parsed invoice:', invoiceData)
```

### Generating PDF Invoice

```typescript
import fs from 'fs'

const pdfBuffer = await sdk.pdf({
  id: 'INV-2024-001',
  date: '2024-01-15',
  branding: {
    logo: 'https://example.com/logo.png',
    favicon: 'https://example.com/favicon.ico',
    accent_color: '#0066cc',
    foreground_color: '#ffffff'
  },
  client: {
    name: 'John Doe',
    cif: '12345678A',
    address: 'Street 123',
    phone: '+34 666 123 123',
    email: 'john@example.com'
  },
  business: {
    name: 'Business SL',
    cif: 'B12345678',
    address: 'Avenue 456',
    phone: '+34 911 123 123',
    email: 'business@example.com'
  },
  total: 1210,
  subtotal: 1000,
  tax_value: 210,
  tax_percent: 21,
  surcharge_value: 0,
  surcharge_percent: 0,
  observations: 'Thank you!',
  payment_instructions: 'Bank transfer to ES00...',
  RGPD: 'Your data is protected.',
  type: 'invoice',
  template: 'classic',
  concepts: []
})

// Save the PDF
fs.writeFileSync('invoice.pdf', Buffer.from(pdfBuffer))
```

### Express.js Integration

```typescript
import express from 'express'
import { InvoSDK } from '@calltek/invo-sdk'

const app = express()
app.use(express.json())

// Initialize SDK (login is automatic on first request)
const sdk = new InvoSDK({
  apiToken: process.env.INVO_API_TOKEN!
})

// Invoice creation endpoint
app.post('/api/invoices', async (req, res) => {
  try {
    const result = await sdk.store(req.body, req.body.callback)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

### NestJS Integration

```typescript
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InvoSDK } from '@calltek/invo-sdk'

@Injectable()
export class InvoiceService {
  private sdk: InvoSDK

  constructor(private configService: ConfigService) {
    this.sdk = new InvoSDK({
      apiToken: this.configService.get('INVO_API_TOKEN')!
    })
  }

  async createInvoice(data: CreateInvoiceDto, callback?: string) {
    return this.sdk.store(data, callback)
  }

  async readInvoice(file: File) {
    return this.sdk.read(file)
  }

  async generatePDF(data: MakeupPDFDto) {
    return this.sdk.pdf(data)
  }
}
```

### Multi-tenant with Different API Tokens

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

// Tenant 1 - Each API token is already associated with a workspace
const tenant1SDK = new InvoSDK({
  apiToken: process.env.TENANT1_API_TOKEN!
})

// Tenant 2 - Different API token for different workspace
const tenant2SDK = new InvoSDK({
  apiToken: process.env.TENANT2_API_TOKEN!
})

// Each operates independently with its own workspace
await tenant1SDK.store({...})
await tenant2SDK.store({...})
```

## API Reference

### Main Methods

#### `store(data, callback?): Promise<CreateInvoiceResult>`
Create and submit a new invoice.

```typescript
const result = await sdk.store(invoiceData, 'https://webhook.url')
```

#### `read(file): Promise<InvoiceReaderResult>`
Read and parse invoice data from a file.

```typescript
const data = await sdk.read(file)
```

#### `pdf(data): Promise<ArrayBuffer>`
Generate a PDF invoice with custom branding.

```typescript
const pdfBuffer = await sdk.pdf(pdfData)
```

#### `request<T>(endpoint, method?, body?): Promise<T>`
Make a generic authenticated request.

```typescript
const data = await sdk.request('/endpoint', 'GET')
```

### Utility Methods

#### `getAccessToken(): string | null`
Get the current access token.

#### `getUser(): User | null`
Get the current user information.

#### `isAuthenticated(): boolean`
Check if authenticated.

### Properties

#### `environment: 'production' | 'sandbox'`
Current environment (read-only).

```typescript
console.log(sdk.environment) // 'production'
```

## Types

```typescript
interface CreateInvoiceDto {
  issueDate: string              // ISO 8601 format
  invoiceNumber: string          // 1-60 chars
  externalId: string             // 1-100 chars
  totalAmount: number            // Total including taxes
  customerName: string           // 1-120 chars
  customerTaxId: string          // NIF/CIF
  emitterName?: string           // 1-120 chars. Optional: falls back to the name on the certificate
  emitterTaxId: string           // NIF/CIF
  taxLines: InvoiceTaxLineDto[]  // Minimum 1 required
  currency?: string              // Default: "EUR"
  type?: 'F1' | 'F2' | 'F3' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5'  // Default: "F1"
  rectifiedInvoiceIds?: string[]           // Required for R1-R5: UUIDs of the invoices being rectified
  rectificationType?: 'S' | 'I'            // Required for R1-R5: "S" (substitution) or "I" (difference)
  description?: string           // 1-500 chars
}

interface InvoiceTaxLineDto {
  taxRate: number                // 0, 4, 5, 10, 21
  baseAmount: number             // Base amount
  taxAmount: number              // Tax amount
  taxType?: string               // Default: "01" (IVA)
  surchargeAmount?: number       // Surcharge amount
  surchargeRate?: number         // Surcharge rate
  taxExemptionReason?: string    // E1-E6
  regimeKey?: string             // "01"-"19"
}

interface CreateInvoiceResult {
  success: boolean
  invoiceId: string              // UUID
  chainIndex: number             // VeriFactu chain index
}
```

### Error Classes

```typescript
import {
  AuthError,
  InvalidCredentialsError,
  TokenExpiredError,
  NetworkError,
} from '@calltek/invo-sdk'

try {
  await sdk.store({...})
} catch (error) {
  if (error instanceof InvalidCredentialsError) {
    console.error('Invalid API token')
  } else if (error instanceof NetworkError) {
    console.error('Network error')
  } else if (error instanceof TokenExpiredError) {
    console.error('Token expired')
  }
}
```

## API Token Management

API tokens must be obtained from your INVO account dashboard. Token management (creation, listing, revocation) is done through the INVO web platform.

**Token Format:**
```
invo_tok_prod_*  → production
invo_tok_sand_*  → sandbox
```

The SDK automatically detects the environment from the token prefix.

## Environment URLs

- **Production**: `https://api.invo.rest`
- **Sandbox**: `https://sandbox.invo.rest`

## Documentation

- **[API Tokens Guide](./docs/API_TOKENS.md)** - Complete guide on API tokens
- **[Examples](./docs/EXAMPLES.md)** - Usage examples and integration patterns
- **[Testing](./docs/TESTING.md)** - Testing guide
- **[Publishing](./docs/PUBLISHING.md)** - Publishing guide

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run build:watch

# Clean
npm run clean

# Generate types from Swagger
npm run types          # Production
npm run types:sandbox  # Sandbox
```

## Migration from v1.x

If you're migrating from v1.x:

### ❌ Old API (v1.x)

```typescript
import { createInvoSDK } from 'invo-sdk'

const sdk = createInvoSDK({ email, password })
await sdk.login()
await sdk.createInvoice({...})
await sdk.logout()
```

### ✅ New API (v2.x)

```typescript
import { InvoSDK } from '@calltek/invo-sdk'

const sdk = new InvoSDK({ apiToken })
// Login is automatic!
await sdk.store({...})
// No logout needed
```

**Breaking Changes:**
- Email/password authentication removed (API token only)
- `createInvoice` renamed to `store`
- `readInvoice` renamed to `read`
- `makeupInvoice` renamed to `pdf`
- `login()`, `logout()`, `refreshAccessToken()` removed
- `createInvoSDK` and `createInvoSDKWithToken` helpers removed
- Use `new InvoSDK()` directly

## License

MIT

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/calltek/invo-sdk/issues).
