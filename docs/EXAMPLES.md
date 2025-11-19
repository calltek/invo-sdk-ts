# Usage Examples

## Basic Setup

### JavaScript (CommonJS)

```javascript
const { createInvoSDK } = require('invo-sdk')

const sdk = createInvoSDK({
  email: process.env.INVO_EMAIL,
  password: process.env.INVO_PASSWORD,
  environment: 'production' // or 'sandbox'
})

// Login
await sdk.login()
```

### TypeScript / ES Modules

```typescript
import { createInvoSDK } from 'invo-sdk'

const sdk = createInvoSDK({
  email: process.env.INVO_EMAIL,
  password: process.env.INVO_PASSWORD,
  environment: 'production' // or 'sandbox'
})

// Login
await sdk.login()
```

## Creating Invoices

### Simple Invoice

```typescript
import { createInvoSDK } from 'invo-sdk'

const sdk = createInvoSDK({
  email: process.env.INVO_EMAIL!,
  password: process.env.INVO_PASSWORD!,
  environment: 'production'
})

await sdk.login()

const result = await sdk.createInvoice({
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

console.log('Invoice created:', result.invoiceId)
```

### Invoice with Multiple Tax Rates

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

## Reading Invoices from Files

### Read PDF Invoice

```typescript
import { createInvoSDK } from 'invo-sdk'
import fs from 'fs'

const sdk = createInvoSDK({
  email: process.env.INVO_EMAIL!,
  password: process.env.INVO_PASSWORD!,
  environment: 'production'
})

await sdk.login()

// Read invoice from PDF
const fileBuffer = fs.readFileSync('invoice.pdf')
const file = new File([fileBuffer], 'invoice.pdf', { type: 'application/pdf' })

const invoiceData = await sdk.readInvoice(file)
console.log('Parsed invoice data:', invoiceData)
```

### Read XML Invoice

```typescript
const xmlBuffer = fs.readFileSync('invoice.xml')
const xmlFile = new File([xmlBuffer], 'invoice.xml', { type: 'application/xml' })

const invoiceData = await sdk.readInvoice(xmlFile)
console.log('Parsed invoice:', invoiceData)
```

## Generating PDF Invoices

### Generate PDF with Custom Branding

```typescript
import { createInvoSDK } from 'invo-sdk'
import fs from 'fs'

const sdk = createInvoSDK({
  email: process.env.INVO_EMAIL!,
  password: process.env.INVO_PASSWORD!,
  environment: 'production'
})

await sdk.login()

const pdfBuffer = await sdk.makeupInvoice({
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
    address: 'Calle Ejemplo 123, Madrid',
    phone: '+34 666 123 123',
    email: 'john@example.com'
  },
  business: {
    name: 'Business SL',
    cif: 'B12345678',
    address: 'Avenida Principal 456, Madrid',
    phone: '+34 911 123 123',
    email: 'business@example.com'
  },
  total: 1210,
  subtotal: 1000,
  tax_value: 210,
  tax_percent: 21,
  surcharge_value: 0,
  surcharge_percent: 0,
  observations: 'Gracias por su compra!',
  payment_instructions: 'Transferencia bancaria a ES00 0000 0000 0000 0000 0000',
  RGPD: 'Sus datos están protegidos según RGPD.',
  type: 'invoice',
  template: 'classic',
  concepts: []
})

// Save PDF to file
fs.writeFileSync('generated-invoice.pdf', Buffer.from(pdfBuffer))
console.log('PDF generado exitosamente!')
```

### Generate Budget PDF

```typescript
const pdfBuffer = await sdk.makeupInvoice({
  id: 'PRES-2024-001',
  date: '2024-01-15',
  type: 'budget', // Changed to budget
  // ... rest of the configuration
})

fs.writeFileSync('budget.pdf', Buffer.from(pdfBuffer))
```

## Node.js / Express Integration

### Express API Server

```typescript
import express from 'express'
import { createInvoSDK } from 'invo-sdk'

const app = express()
app.use(express.json())

// Initialize SDK
const sdk = createInvoSDK({
  email: process.env.INVO_EMAIL!,
  password: process.env.INVO_PASSWORD!,
  environment: 'production',
  autoRefresh: true,
  onError: (error) => {
    console.error('SDK Error:', error)
  }
})

// Login on startup
await sdk.login()

// Create invoice endpoint
app.post('/api/invoices', async (req, res) => {
  try {
    const result = await sdk.createInvoice(req.body)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Read invoice endpoint
app.post('/api/invoices/read', async (req, res) => {
  try {
    const file = req.file // Using multer or similar
    const invoiceData = await sdk.readInvoice(file)
    res.json(invoiceData)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Generate PDF endpoint
app.post('/api/invoices/pdf', async (req, res) => {
  try {
    const pdfBuffer = await sdk.makeupInvoice(req.body)
    res.setHeader('Content-Type', 'application/pdf')
    res.send(Buffer.from(pdfBuffer))
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})
```

### NestJS Service

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createInvoSDK, InvoSDK } from 'invo-sdk'

@Injectable()
export class InvoiceService implements OnModuleInit {
  private sdk: InvoSDK

  constructor(private configService: ConfigService) {
    this.sdk = createInvoSDK({
      email: this.configService.get('INVO_EMAIL')!,
      password: this.configService.get('INVO_PASSWORD')!,
      environment: this.configService.get('INVO_ENV') || 'production',
    })
  }

  async onModuleInit() {
    await this.sdk.login()
  }

  async createInvoice(data: CreateInvoiceDto) {
    return this.sdk.createInvoice(data)
  }

  async readInvoice(file: File) {
    return this.sdk.readInvoice(file)
  }

  async generatePDF(data: MakeupPDFDto) {
    return this.sdk.makeupInvoice(data)
  }
}
```

## Environment Switching

```typescript
const sdk = createInvoSDK({
  email: 'user@example.com',
  password: 'password',
  environment: 'sandbox',
})

await sdk.login()

// Switch to production
sdk.setEnvironment('production')

// All subsequent requests will use 'production' environment
const result = await sdk.createInvoice({...})
```

## Error Handling

```typescript
import {
  InvalidCredentialsError,
  TokenExpiredError,
  NetworkError,
  AuthError
} from 'invo-sdk'

const sdk = createInvoSDK({
  email: 'user@example.com',
  password: 'password',
  environment: 'production',
  onError: (error) => {
    // Global error handler
    console.error('SDK Error:', error)
  }
})

try {
  await sdk.login()
  const result = await sdk.createInvoice({...})
} catch (error) {
  if (error instanceof InvalidCredentialsError) {
    console.error('Wrong email or password')
  } else if (error instanceof TokenExpiredError) {
    console.error('Session expired, refreshing token...')
    await sdk.refreshAccessToken()
  } else if (error instanceof NetworkError) {
    console.error('Network error, check your connection')
  } else if (error instanceof AuthError) {
    console.error('Authentication error:', error.message)
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Testing

### Mock SDK

```typescript
// __mocks__/invo-sdk.ts
export const createInvoSDK = jest.fn(() => ({
  login: jest.fn().mockResolvedValue({
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    user: { id: '1', email: 'test@example.com' },
  }),
  logout: jest.fn(),
  getUser: jest.fn().mockReturnValue({ id: '1', email: 'test@example.com' }),
  isAuthenticated: jest.fn().mockReturnValue(true),
  getAccessToken: jest.fn().mockReturnValue('mock-token'),
  createInvoice: jest.fn().mockResolvedValue({
    success: true,
    invoiceId: 'uuid-123',
    chainIndex: 0
  }),
  readInvoice: jest.fn().mockResolvedValue({
    invoiceNumber: 'FAC-001',
    total: 1210
  }),
  makeupInvoice: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
}))
```

### Test Example

```typescript
import { createInvoSDK } from 'invo-sdk'

jest.mock('invo-sdk')

describe('Invoice Creation', () => {
  it('should create invoice successfully', async () => {
    const sdk = createInvoSDK({
      email: 'test@example.com',
      password: 'password',
      environment: 'sandbox'
    })

    await sdk.login()

    const result = await sdk.createInvoice({
      issueDate: new Date().toISOString(),
      invoiceNumber: 'FAC-001',
      externalId: 'test-001',
      totalAmount: 1210,
      customerName: 'Test Client',
      customerTaxId: 'B12345678',
      emitterName: 'Test Business',
      emitterTaxId: 'B87654321',
      taxLines: [
        {
          taxRate: 21,
          baseAmount: 1000,
          taxAmount: 210
        }
      ]
    })

    expect(result.success).toBe(true)
    expect(result.invoiceId).toBe('uuid-123')
  })
})
