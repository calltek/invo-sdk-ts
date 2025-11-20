# API Token Authentication

## ¿Qué son los API Tokens?

Los API Tokens son credenciales de autenticación que permiten acceder a tu cuenta INVO sin necesidad de usar email y contraseña. Son ideales para integraciones, aplicaciones backend y sistemas automatizados.

## Ventajas

✅ **Seguridad**: No compartes tus credenciales principales
✅ **Simplicidad**: Autenticación en un solo paso
✅ **Ideal para Integraciones**: Perfecto para APIs y automatizaciones
✅ **Multi-entorno**: Tokens específicos para production y sandbox

## Uso de Tokens

### Opción Recomendada: Helper Function

```typescript
import { createInvoSDKWithToken } from 'invo-sdk'

// Crea SDK ya autenticado con token
// El environment se detecta automáticamente del prefijo:
//   - invo_tok_prod_* → production
//   - invo_tok_sand_* → sandbox
const sdk = await createInvoSDKWithToken('invo_tok_prod_abc123...')

// SDK listo para usar directamente
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

console.log('Factura creada:', invoice.invoiceId)
```

### Opción Alternativa: Login Manual

```typescript
import { InvoSDK } from 'invo-sdk'

// Crear SDK sin credenciales
const sdk = new InvoSDK({ environment: 'production' })

// Autenticarse con el token
await sdk.loginWithToken('invo_tok_prod_abc123xyz...')

// SDK listo para usar
const invoice = await sdk.createInvoice({...})
```

## Casos de Uso

### 1. Aplicación Backend

```typescript
// server.ts
import express from 'express'
import { createInvoSDKWithToken } from 'invo-sdk'

const app = express()
app.use(express.json())

// Inicializar SDK con token desde variables de entorno
const sdk = await createInvoSDKWithToken(
  process.env.INVO_API_TOKEN!
)

// Endpoint para crear facturas
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

### 2. Integración con Webhooks

```typescript
// webhook.ts
import { createInvoSDKWithToken } from 'invo-sdk'

export async function handleWebhook(req: Request) {
  const apiToken = process.env.INVO_API_TOKEN

  if (!apiToken) {
    return new Response('Missing API token', { status: 401 })
  }

  const sdk = await createInvoSDKWithToken(apiToken)
  const invoice = await sdk.createInvoice(req.body)

  return new Response(JSON.stringify(invoice), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### 3. Script de Automatización

```typescript
import { createInvoSDKWithToken } from 'invo-sdk'

async function processInvoices() {
  const sdk = await createInvoSDKWithToken(
    process.env.INVO_API_TOKEN!
  )

  // Procesar múltiples facturas
  for (const invoiceData of invoicesToProcess) {
    try {
      const result = await sdk.createInvoice(invoiceData)
      console.log(`✅ Factura creada: ${result.invoiceId}`)
    } catch (error) {
      console.error(`❌ Error: ${error.message}`)
    }
  }
}

processInvoices()
```

## Seguridad

### Almacenamiento Seguro

**✅ Correcto:**
```bash
# .env
INVO_API_TOKEN=invo_tok_prod_abc123xyz...
```

```typescript
// Usar desde variables de entorno
const sdk = await createInvoSDKWithToken(
  process.env.INVO_API_TOKEN!
)
```

**❌ Incorrecto:**
```typescript
// NUNCA hagas esto
const sdk = await createInvoSDKWithToken(
  'invo_tok_prod_abc123xyz...' // Token hardcoded
)
```

### Buenas Prácticas

1. **Nunca** compartas tokens en código público
2. **Nunca** incluyas tokens en logs
3. **Siempre** usa variables de entorno
4. **Almacena** tokens de forma segura (gestores de secretos, .env)
5. **Solicita** nuevos tokens si sospechas de compromiso

### Formato del Token

Los tokens tienen el formato:
```
invo_tok_{environment}_{random}

Ejemplos:
- invo_tok_prod_abc123...  (producción)
- invo_tok_sand_xyz789...  (sandbox)
```

El SDK detecta automáticamente el entorno según el prefijo del token.

## Gestión de Tokens

**Importante:** La gestión de tokens (creación, listado, revocación) se realiza a través de la plataforma web de INVO, no mediante este SDK.

Para obtener un token:
1. Accede a tu cuenta en [INVO](https://api.invo.rest)
2. Ve a la sección de API Tokens
3. Crea un nuevo token
4. Guárdalo de forma segura (solo se muestra una vez)

## Limitaciones

- Los tokens **NO** generan refresh tokens
- Los tokens **NO** soportan auto-refresh
- Los tokens comparten los mismos permisos que el usuario propietario
- La gestión de tokens se hace en la plataforma web INVO

## Troubleshooting

### Error: "Invalid token format"
- Verifica que el token empiece con `invo_tok_`
- No modifiques el token al copiarlo

### Error: "Invalid or revoked token"
- El token fue revocado
- El token ha expirado
- Solicita un nuevo token desde la plataforma INVO

### Error: "Token expired"
- El token llegó a su fecha de expiración
- Solicita un nuevo token desde la plataforma INVO

## FAQ

**¿Dónde obtengo un token?**
Desde tu cuenta en la plataforma web de INVO.

**¿Los tokens expiran?**
Depende de la configuración al crearlos en la plataforma INVO.

**¿Puedo ver el token después de crearlo?**
No, solo se muestra una vez al crearlo. Guárdalo de forma segura.

**¿Qué hago si pierdo mi token?**
Revoca el token antiguo y crea uno nuevo desde la plataforma INVO.

**¿Los tokens tienen permisos diferentes al usuario?**
No, tienen los mismos permisos que el usuario propietario.

## Soporte

Si encuentras problemas, abre un issue en [GitHub](https://github.com/calltek/invo-sdk/issues).
