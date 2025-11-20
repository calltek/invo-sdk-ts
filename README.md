# INVO SDK

Backend SDK for INVO API - Authentication and Invoice Management with full TypeScript support.

## Features

✅ **TypeScript Native** - Complete type definitions and autocomplete
✅ **Backend Optimized** - Designed for Node.js/Backend applications
✅ **In-Memory Token Storage** - No dependencies on browser storage
✅ **Auto Token Refresh** - Automatically refreshes tokens before expiration
✅ **Invoice Management** - Create and manage VeriFactu invoices
✅ **Invoice Reader** - Extract data from PDF and XML invoices
✅ **PDF Generator** - Generate branded invoice PDFs
✅ **API Token Authentication** - Authenticate using API tokens for integrations
✅ **Multi-Environment** - Production and sandbox modes
✅ **Zero Dependencies** - No external dependencies
✅ **Generic Request Method** - Call any API endpoint with authentication

## Installation

```bash
npm install invo-sdk
```

```bash
yarn add invo-sdk
```

```bash
pnpm add invo-sdk
```

## Quick Start

```typescript
import { createInvoSDK } from 'invo-sdk'

// Create SDK instance
const sdk = createInvoSDK({
  email: 'user@example.com',
  password: 'password123',
  environment: 'production', // or 'sandbox'
})

// Login
await sdk.login()
console.log('Authenticated:', sdk.isAuthenticated())

// Create an invoice
const result = await sdk.createInvoice({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-001',
  externalId: 'order-12345',
  totalAmount: 1210.00,
  customerName: 'Cliente Ejemplo SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  description: 'Servicios de consultoría tecnológica',
  taxLines: [
    {
      taxRate: 21,
      baseAmount: 1000.00,
      taxAmount: 210.00
    }
  ]
})

console.log('Invoice created:', result.invoiceId)
console.log('Chain index:', result.chainIndex)
```

## Configuration

```typescript
interface InvoSDKConfig {
  email: string                     // Required: User email
  password: string                  // Required: User password
  environment?: 'production' | 'sandbox'  // Default: 'production'
  autoRefresh?: boolean             // Default: true
  refreshBuffer?: number            // Default: 300 (5 minutes before expiry)
  onTokenRefreshed?: (tokens: AuthResponse) => void
  onLogout?: () => void
  onError?: (error: Error) => void
}
```

## Usage Examples

### Authentication

```typescript
import { createInvoSDK } from 'invo-sdk'

// Create and login
const sdk = createInvoSDK({
  email: 'user@example.com',
  password: 'password123',
  environment: 'production',
})

try {
  await sdk.login()
  console.log('User:', sdk.getUser())
  console.log('Access Token:', sdk.getAccessToken())
} catch (error) {
  console.error('Login failed:', error.message)
}
```

### Creating Invoices

#### Simple Invoice (Single Tax Rate)

```typescript
const result = await sdk.createInvoice({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-001',
  externalId: 'order-12345',
  totalAmount: 1210.00,
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  type: 'F1', // Factura completa
  description: 'Servicios de consultoría',
  taxLines: [
    {
      taxRate: 21,
      baseAmount: 1000.00,
      taxAmount: 210.00
    }
  ]
})
```

#### Invoice with Multiple Tax Rates

```typescript
const result = await sdk.createInvoice({
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

#### Invoice with Surcharge (Recargo de Equivalencia)

```typescript
const result = await sdk.createInvoice({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-003',
  externalId: 'surcharge-001',
  totalAmount: 126.20,
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  description: 'Venta con recargo de equivalencia',
  taxLines: [
    {
      taxRate: 21,
      baseAmount: 100.00,
      taxAmount: 21.00,
      surchargeRate: 5.2,
      surchargeAmount: 5.20
    }
  ]
})
```

#### Tax-Exempt Invoice

```typescript
const result = await sdk.createInvoice({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-004',
  externalId: 'exempt-001',
  totalAmount: 2000.00,
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  description: 'Operación exenta - Art. 20 Ley IVA',
  taxLines: [
    {
      taxRate: 0,
      baseAmount: 2000.00,
      taxAmount: 0.00,
      taxExemptionReason: 'E1'
    }
  ]
})
```

### Reading Invoice from File

```typescript
import fs from 'fs'

// Read invoice from a PDF file
const fileBuffer = fs.readFileSync('invoice.pdf')
const file = new File([fileBuffer], 'invoice.pdf', { type: 'application/pdf' })

const invoiceData = await sdk.readInvoice(file)
console.log('Parsed invoice:', invoiceData)
```

### Generating PDF Invoice with Custom Branding

```typescript
import fs from 'fs'

const pdfBuffer = await sdk.makeupInvoice({
  id: 'INV-2024-001',
  date: '2024-01-15',
  branding: {
    logo: 'https://example.com/logo.png',
    favicon: 'https://example.com/favicon.ico',
    accent_color: '#ff0000',
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
  observations: 'Thank you for your business!',
  payment_instructions: 'Bank transfer to ES00 0000 0000 0000 0000 0000',
  RGPD: 'Your data is protected according to GDPR regulations.',
  type: 'invoice',
  template: 'classic',
  concepts: []
})

// Save the PDF
fs.writeFileSync('invoice.pdf', Buffer.from(pdfBuffer))
console.log('PDF generated successfully!')
```

### Using API Tokens (Authentication Only)

If you have an API token (obtained from your INVO account), you can authenticate directly without email/password:

```typescript
import { createInvoSDKWithToken } from 'invo-sdk'

// Create SDK with API Token (obtained from your INVO account)
// Environment is auto-detected from token prefix:
//   - invo_tok_prod_* → production
//   - invo_tok_sand_* → sandbox
const sdk = await createInvoSDKWithToken('invo_tok_prod_abc123...')

// SDK is ready to use - no login() needed
const result = await sdk.createInvoice({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-001',
  // ... rest of invoice data
})
```

### Generic API Requests

```typescript
// Make any authenticated request to the API
const data = await sdk.request('/users/me', 'GET')
console.log('User data:', data)

// POST request
const result = await sdk.request('/some-endpoint', 'POST', {
  foo: 'bar'
})
```

### Token Management

```typescript
// Check authentication
if (sdk.isAuthenticated()) {
  console.log('User is authenticated')
}

// Get tokens
const accessToken = sdk.getAccessToken()
const refreshToken = sdk.getRefreshToken()

// Manual refresh (auto-refresh is enabled by default)
try {
  await sdk.refreshAccessToken()
  console.log('Token refreshed')
} catch (error) {
  console.error('Refresh failed:', error)
}

// Logout
sdk.logout()
```

### Express.js Integration

```typescript
import express from 'express'
import { createInvoSDK } from 'invo-sdk'

const app = express()
app.use(express.json())

// Initialize SDK (can be done once at startup)
const sdk = createInvoSDK({
  email: process.env.INVO_EMAIL!,
  password: process.env.INVO_PASSWORD!,
  environment: 'production',
})

// Login on startup
await sdk.login()

// Invoice creation endpoint
app.post('/api/invoices', async (req, res) => {
  try {
    const result = await sdk.createInvoice(req.body)
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
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createInvoSDK, InvoSDK } from 'invo-sdk'

@Injectable()
export class InvoiceService implements OnModuleInit {
  private sdk: InvoSDK

  constructor(private configService: ConfigService) {
    this.sdk = createInvoSDK({
      email: this.configService.get('INVO_EMAIL'),
      password: this.configService.get('INVO_PASSWORD'),
      environment: this.configService.get('INVO_ENV'),
    })
  }

  async onModuleInit() {
    await this.sdk.login()
  }

  async createInvoice(data: CreateInvoiceData) {
    return this.sdk.createInvoice(data)
  }
}
```

## API Reference

### Main SDK Methods

#### `login(): Promise<AuthResponse>`
Login with configured credentials.

#### `logout(): void`
Logout and clear all tokens from memory.

#### `refreshAccessToken(): Promise<AuthResponse>`
Manually refresh the access token.

#### `createInvoice(data: CreateInvoiceData): Promise<CreateInvoiceResult>`
Create and submit a new invoice to the VeriFactu system.

#### `readInvoice(file: File | Blob): Promise<any>`
Read and parse invoice data from an uploaded file (PDF, XML, etc.).

#### `makeupInvoice(data: MakeupPDFDto): Promise<ArrayBuffer>`
Generate a PDF invoice with custom branding and styling.

#### `loginWithToken(apiToken: string): Promise<LoginResponseDto>`
Authenticate using an API Token (obtained from your INVO account) instead of email/password.

#### `request<T>(endpoint: string, method?: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: unknown): Promise<T>`
Make a generic authenticated request to any API endpoint.

#### `getAccessToken(): string | null`
Get the current access token.

#### `getRefreshToken(): string | null`
Get the current refresh token.

#### `getUser(): User | null`
Get the current user information.

#### `isAuthenticated(): boolean`
Check if the user is authenticated and token is valid.

#### `getEnvironment(): 'production' | 'sandbox'`
Get the current environment.

#### `setEnvironment(env: 'production' | 'sandbox'): void`
Switch between production and sandbox environments.

### Types

```typescript
interface CreateInvoiceData {
  issueDate: string              // ISO 8601 format
  invoiceNumber: string          // 1-60 chars, no " ' < > =
  externalId: string             // 1-100 chars
  totalAmount: number            // Total including taxes
  customerName: string           // 1-120 chars
  customerTaxId: string          // NIF/CIF
  emitterName: string            // 1-120 chars
  emitterTaxId: string           // NIF/CIF
  taxLines: InvoiceTaxLine[]     // Minimum 1 required
  currency?: string              // Default: "EUR"
  type?: 'F1' | 'F2' | 'F3' | 'R1' | 'R2' | 'R3' | 'R4'  // Default: "F1"
  description?: string           // 1-500 chars
  rectifiedInvoiceIds?: string[] // Required for R1-R4
}

interface InvoiceTaxLine {
  taxRate: number                // 0, 4, 5, 10, 21
  baseAmount: number             // Base amount
  taxAmount: number              // Tax amount
  taxType?: string               // "01" (IVA), "02" (IPSI), "03" (IGIC), "04" (Otros)
  surchargeAmount?: number       // Surcharge amount
  surchargeRate?: number         // 0.5, 0.62, 1.4, 1.75, 5.2
  taxExemptionReason?: string    // E1-E6
  regimeKey?: string             // "01"-"19"
}

interface CreateInvoiceResult {
  success: boolean
  invoiceId: string              // UUID of created invoice
  chainIndex: number             // Index in VeriFactu chain
}

interface AuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: User
}

interface User {
  id: string
  email: string
}

interface MakeupPDFDto {
  id: string                          // Invoice number/ID
  date: string                        // Issue date
  branding: {
    logo: string                      // Logo URL
    favicon: string                   // Favicon URL
    accent_color: string              // Primary color (e.g., "#ff0000")
    foreground_color: string          // Secondary color (e.g., "#ffffff")
  }
  client: {
    name: string                      // Client name
    cif: string                       // Client tax ID
    address: string                   // Client address
    phone: string                     // Client phone
    email: string                     // Client email
  }
  business: {
    name: string                      // Business name
    cif: string                       // Business tax ID
    address: string                   // Business address
    phone: string                     // Business phone
    email: string                     // Business email
  }
  total: number                       // Total amount
  subtotal: number                    // Subtotal amount
  tax_value: number                   // Tax amount
  tax_percent: number                 // Tax percentage
  surcharge_value: number             // Surcharge amount
  surcharge_percent: number           // Surcharge percentage
  observations: string                // Additional notes
  payment_instructions: string        // Payment instructions
  RGPD: string                        // GDPR text
  type: 'invoice' | 'budget' | 'proforma'  // Document type
  template: string                    // Template name (e.g., "classic")
  concepts: any[][]                   // Line items/concepts
}
```

### Error Classes

```typescript
import {
  AuthError,
  InvalidCredentialsError,
  TokenExpiredError,
  NetworkError,
  InvalidTokenError,
} from 'invo-sdk'

try {
  await sdk.login()
} catch (error) {
  if (error instanceof InvalidCredentialsError) {
    console.error('Invalid email or password')
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message)
  } else if (error instanceof TokenExpiredError) {
    console.error('Token expired')
  }
}
```

## Invoice Types

- **F1**: Factura completa (Complete invoice)
- **F2**: Factura simplificada (Simplified invoice, max 3000€)
- **F3**: Factura sustitutiva (Substitutive invoice)
- **R1-R4**: Facturas rectificativas (Corrective invoices)

## Tax Exemption Reasons

- **E1**: Exenta - Art. 20 Ley IVA
- **E2**: Exenta - Art. 21 Ley IVA
- **E3**: Exenta - Art. 22 Ley IVA
- **E4**: Exenta - Art. 23 Ley IVA
- **E5**: Exenta - Art. 24 Ley IVA
- **E6**: Exenta - Otras

## Important Validations

- **Minimum date**: 2024-10-28 (VeriFactu minimum date)
- **No future dates**: Invoices cannot be dated in the future
- **F2 maximum**: 3000€ for simplified invoices
- **Prohibited characters in invoiceNumber**: `" ' < > =`
- **Tax lines**: Minimum 1 required
- **Valid surcharge rates**: Only specific combinations (IVA 21%→5.2%, etc.)

## Environment URLs

- **Production**: `https://api.invo.rest`
- **Sandbox**: `https://sandbox.invo.rest`

## API Token Authentication

If you have an API token from your INVO account, you can use it to authenticate instead of email/password. This is ideal for integrations and automated systems.

### Using an API Token

```typescript
import { createInvoSDKWithToken } from 'invo-sdk'

// Authenticate with API token (obtained from your INVO account)
// Environment is auto-detected from token prefix:
//   - invo_tok_prod_* → production
//   - invo_tok_sand_* → sandbox
const sdk = await createInvoSDKWithToken('invo_tok_prod_abc123...')

// SDK is ready to use immediately
const invoice = await sdk.createInvoice({
  issueDate: new Date().toISOString(),
  invoiceNumber: 'FAC-2024-001',
  externalId: 'order-12345',
  totalAmount: 1210.00,
  customerName: 'Cliente SL',
  customerTaxId: 'B12345678',
  emitterName: 'Mi Empresa SL',
  emitterTaxId: 'B87654321',
  description: 'Servicios de consultoría',
  taxLines: [
    {
      taxRate: 21,
      baseAmount: 1000.00,
      taxAmount: 210.00
    }
  ]
})

console.log('Invoice created:', invoice.invoiceId)
```

**Note:** API tokens must be obtained from your INVO account dashboard. Token management (creation, revocation) is done through the INVO web platform, not through this SDK.

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

## Migration from Legacy Client

If you were using the old `createAuthClient`, it's still available for backward compatibility but is deprecated:

```typescript
// Old way (deprecated, still works for frontend apps)
import { createAuthClient } from 'invo-sdk'

// New way (recommended for backend)
import { createInvoSDK } from 'invo-sdk'
```

## License

MIT

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/calltek/invo-sdk/issues).
