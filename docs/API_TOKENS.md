# API Tokens - Guía Completa

## ¿Qué son los API Tokens?

Los API Tokens son credenciales de autenticación alternativas que permiten a empresas subcontratadas o aplicaciones de terceros acceder a tu cuenta sin necesidad de compartir tu email y contraseña.

## Ventajas

✅ **Seguridad**: No compartes tus credenciales principales
✅ **Revocación**: Puedes revocar acceso instantáneamente
✅ **Trazabilidad**: Sabes cuándo y desde dónde se usa cada token
✅ **Granularidad**: Diferentes tokens para diferentes propósitos
✅ **Expiración**: Control de validez temporal

## Gestión de Tokens

### Crear un Token

```typescript
import { createInvoSDK } from 'invo-sdk'

// 1. Autenticarse como usuario principal
const sdk = createInvoSDK({
  email: 'usuario@empresa.com',
  password: 'password123',
  environment: 'production'
})

await sdk.login()

// 2. Crear token para partner
const token = await sdk.createApiToken({
  name: 'Partner ABC - Integración Facturas',
  expires_in: 365 // Expira en 1 año (opcional)
})

console.log('Token generado:', token.token)
console.log('⚠️ IMPORTANTE: Guarda este token de forma segura')
console.log('⚠️ No se volverá a mostrar')

// Output:
// {
//   id: '550e8400-e29b-41d4-a716-446655440000',
//   token: 'invo_tok_prod_abc123xyz789...',
//   name: 'Partner ABC - Integración Facturas',
//   created_at: '2024-11-19T10:30:00Z',
//   expires_at: '2025-11-19T10:30:00Z',
//   is_active: true
// }
```

### Listar Tokens

```typescript
const tokens = await sdk.listApiTokens()

console.log(`Tienes ${tokens.length} tokens activos:`)

tokens.forEach(token => {
  console.log(`\n📌 ${token.name}`)
  console.log(`   ID: ${token.id}`)
  console.log(`   Prefijo: ${token.prefix}...`)
  console.log(`   Creado: ${new Date(token.created_at).toLocaleDateString()}`)
  console.log(`   Último uso: ${token.last_used_at ? new Date(token.last_used_at).toLocaleDateString() : 'Nunca'}`)
  console.log(`   IP: ${token.last_used_ip || 'N/A'}`)
  console.log(`   Estado: ${token.is_active ? '✅ Activo' : '❌ Revocado'}`)
})
```

### Ver Detalles de un Token

```typescript
const token = await sdk.getApiToken('550e8400-e29b-41d4...')

console.log('Detalles del token:', token)
```

### Revocar un Token

```typescript
// Revocar acceso inmediatamente
await sdk.revokeApiToken('550e8400-e29b-41d4...')

console.log('✅ Token revocado exitosamente')
console.log('El partner ya no podrá usar este token')
```

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

### 1. Empresa Subcontratada

```typescript
// ========================================
// USUARIO PRINCIPAL (Tu empresa)
// ========================================
import { createInvoSDK } from 'invo-sdk'

const mainSDK = createInvoSDK({
  email: 'admin@tuempresa.com',
  password: 'password123',
  environment: 'production'
})

await mainSDK.login()

// Crear token para el partner
const partnerToken = await mainSDK.createApiToken({
  name: 'Gestoría ABC - Facturación',
  expires_in: 365 // 1 año
})

// Enviar token al partner (email seguro, portal, etc.)
console.log('Token para el partner:', partnerToken.token)

// ========================================
// EMPRESA SUBCONTRATADA (Partner)
// ========================================
import { createInvoSDKWithToken } from 'invo-sdk'

// Partner usa el token
const partnerSDK = await createInvoSDKWithToken(
  'invo_tok_prod_abc123xyz...',
  { environment: 'production' }
)

// El partner puede crear facturas en tu nombre
const invoice = await partnerSDK.createInvoice({
  // ... datos de factura
})

console.log('Factura creada por el partner:', invoice.invoiceId)
```

### 2. Aplicación Backend

```typescript
// server.ts
import express from 'express'
import { createInvoSDKWithToken } from 'invo-sdk'

const app = express()
app.use(express.json())

// Inicializar SDK con token
const sdk = await createInvoSDKWithToken(
  process.env.INVO_API_TOKEN!,
  { environment: 'production' }
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

### 3. Integración con Zapier/Make/N8N

```typescript
// webhook.ts
import { createInvoSDKWithToken } from 'invo-sdk'

export async function handleWebhook(req: Request) {
  const apiToken = req.headers.get('x-api-token')

  if (!apiToken) {
    return new Response('Missing API token', { status: 401 })
  }

  const sdk = await createInvoSDKWithToken(apiToken, {
    environment: 'production'
  })

  const invoice = await sdk.createInvoice(req.body)

  return new Response(JSON.stringify(invoice), {
    headers: { 'Content-Type': 'application/json' }
  })
}
```

### 4. Rotación de Tokens

```typescript
import { createInvoSDK } from 'invo-sdk'

const sdk = createInvoSDK({
  email: 'admin@empresa.com',
  password: 'password123',
  environment: 'production'
})

await sdk.login()

// 1. Crear nuevo token
const newToken = await sdk.createApiToken({
  name: 'Partner ABC - Renovado 2025',
  expires_in: 365
})

console.log('Nuevo token:', newToken.token)

// 2. Comunicar nuevo token al partner
// ... (enviar por email seguro, portal, etc.)

// 3. Esperar confirmación del partner

// 4. Revocar token antiguo
await sdk.revokeApiToken('old-token-id')

console.log('✅ Token antiguo revocado')
console.log('✅ Token nuevo activo')
```

### 5. Portal de Gestión

```typescript
// TokenManager.tsx
import React, { useState, useEffect } from 'react'
import { createInvoSDK } from 'invo-sdk'

export function TokenManager() {
  const [tokens, setTokens] = useState([])
  const [sdk] = useState(() => createInvoSDK({
    email: user.email,
    password: user.password,
    environment: 'production'
  }))

  useEffect(() => {
    loadTokens()
  }, [])

  const loadTokens = async () => {
    await sdk.login()
    const list = await sdk.listApiTokens()
    setTokens(list)
  }

  const handleCreateToken = async () => {
    const name = prompt('Nombre del token:')
    if (!name) return

    const token = await sdk.createApiToken({ name })

    alert(`Token creado:\n\n${token.token}\n\n⚠️ Guárdalo, no se volverá a mostrar`)

    await loadTokens()
  }

  const handleRevokeToken = async (tokenId: string) => {
    if (!confirm('¿Revocar este token?')) return

    await sdk.revokeApiToken(tokenId)
    await loadTokens()
  }

  return (
    <div>
      <h2>API Tokens</h2>
      <button onClick={handleCreateToken}>+ Crear Token</button>

      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Prefijo</th>
            <th>Último Uso</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map(token => (
            <tr key={token.id}>
              <td>{token.name}</td>
              <td><code>{token.prefix}...</code></td>
              <td>{token.last_used_at ? new Date(token.last_used_at).toLocaleString() : 'Nunca'}</td>
              <td>{token.is_active ? '✅' : '❌'}</td>
              <td>
                {token.is_active && (
                  <button onClick={() => handleRevokeToken(token.id)}>
                    Revocar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Seguridad

### Almacenamiento Seguro

```bash
# Variables de entorno
INVO_API_TOKEN=invo_tok_prod_abc123xyz...

# .env.example
INVO_API_TOKEN=your_token_here
```

```typescript
// Usar desde variables de entorno
const sdk = await createInvoSDKWithToken(
  process.env.INVO_API_TOKEN!,
  { environment: 'production' }
)
```

### Buenas Prácticas

1. **Nunca** compartas tokens en código público
2. **Nunca** incluyas tokens en logs
3. **Siempre** usa variables de entorno
4. **Rota** tokens periódicamente (cada 6-12 meses)
5. **Revoca** tokens inmediatamente si sospechas compromiso
6. **Monitorea** el uso de tokens regularmente

### Validación del Token

Los tokens tienen el formato:
```
invo_tok_{environment}_{random}

Ejemplos:
- invo_tok_prod_abc123...  (producción)
- invo_tok_sand_xyz789...  (sandbox)
```

## Limitaciones

- Los tokens **NO** generan refresh tokens
- Los tokens **NO** soportan auto-refresh
- Los tokens comparten los mismos permisos que el usuario propietario
- Los tokens revocados **NO** se pueden reactivar

## Troubleshooting

### Error: "Invalid token format"
- Verifica que el token empiece con `invo_tok_`
- No modifiques el token al copiarlo

### Error: "Invalid or revoked token"
- El token fue revocado
- El token ha expirado
- Crea un nuevo token

### Error: "Token expired"
- El token llegó a su fecha de expiración
- Crea un nuevo token con `expires_in` mayor o sin expiración

## FAQ

**¿Cuántos tokens puedo crear?**
No hay límite, pero recomendamos mantener un número manejable.

**¿Los tokens expiran automáticamente?**
Solo si especificas `expires_in` al crearlos.

**¿Puedo ver el token después de crearlo?**
No, el token completo solo se muestra al crearlo por seguridad.

**¿Qué pasa si revoco un token?**
Se desactiva inmediatamente y deja de funcionar.

**¿Puedo reactivar un token revocado?**
No, debes crear uno nuevo.

**¿Los tokens tienen permisos diferentes al usuario?**
No, tienen los mismos permisos que el usuario propietario.

## Soporte

Si encuentras problemas, abre un issue en [GitHub](https://github.com/calltek/invo-sdk/issues).
