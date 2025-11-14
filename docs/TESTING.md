# Testing Guide - INVO SDK

Esta guía te ayudará a probar el SDK para verificar que funciona correctamente.

## Configuración Rápida

### 1. Crear archivo de configuración

Crea un archivo `.env` en la raíz del proyecto con tus credenciales:

```bash
cp .env.example .env
```

Edita `.env` y configura tus credenciales:

```env
INVO_EMAIL=tu-email@ejemplo.com
INVO_PASSWORD=tu-password
INVO_ENV=sandbox
```

**IMPORTANTE**: El archivo `.env` está en `.gitignore` y nunca se subirá a Git.

### 2. Ejecutar los tests

```bash
npm test
```

O directamente:

```bash
npx tsx test.ts
```

## Qué prueba el script de test

El script `test.ts` ejecuta las siguientes pruebas:

### ✅ Test 1: Autenticación
- Crea una instancia del SDK
- Realiza login con las credenciales configuradas
- Verifica que se obtengan tokens y datos de usuario

### ✅ Test 2: Estado de Autenticación
- Verifica que `isAuthenticated()` devuelva `true`
- Comprueba que se puedan obtener los datos del usuario
- Verifica que exista un access token

### ✅ Test 3: Creación de Factura
- Crea una factura de prueba
- Envía la factura al endpoint `/invoice/store`
- Verifica que se reciba un `invoiceId` y `chainIndex`

### ✅ Test 4: Request Genérico
- Prueba el método `sdk.request()` para llamar a cualquier endpoint
- Intenta obtener datos del usuario autenticado

### ✅ Test 5: Refresh Manual de Token
- Ejecuta un refresh manual del token
- Verifica que se obtengan nuevos tokens

### ✅ Test 6: Cambio de Entorno
- Prueba cambiar entre `production` y `sandbox`
- Verifica que el cambio se realice correctamente

### ✅ Test 7: Logout
- Ejecuta el logout
- Verifica que se limpien los tokens
- Verifica que `isAuthenticated()` devuelva `false`

## Salida Esperada

```
🚀 Starting INVO SDK Tests

Configuration:
  Email: tu-email@ejemplo.com
  Environment: sandbox

📦 Creating SDK instance...
🔐 Test 1: Authentication
  Attempting login...
  ✅ Login successful!
  User ID: 550e8400-e29b-41d4-a716-446655440000
  User Email: tu-email@ejemplo.com
  Token expires in: 3600 seconds

🔍 Test 2: Authentication Status
  Is authenticated: ✅
  Current user: tu-email@ejemplo.com
  Has access token: ✅
  Token preview: eyJhbGciOiJIUzI1NiIsI...

📄 Test 3: Create Invoice
  Creating test invoice...
  ✅ Invoice created successfully!
  Invoice ID: 550e8400-e29b-41d4-a716-446655440001
  Chain Index: 0
  Success: true

🌐 Test 4: Generic API Request
  Making request to /auth/me...
  ✅ Request successful!

🔄 Test 5: Manual Token Refresh
  Refreshing token manually...
  ✅ Token refreshed successfully!
  New token expires in: 3600 seconds

🔀 Test 6: Environment Switching
  Current environment: sandbox
  Switched to: production
  Switched back to: sandbox

👋 Test 7: Logout
  Logging out...
  Is authenticated after logout: ✅
  Access token after logout: null (✅)

🎉 All tests completed successfully!
```

## Errores Comunes

### Error: "Invalid credentials"
- Verifica que tu email y password sean correctos en el archivo `.env`
- Asegúrate de tener una cuenta válida en el entorno configurado

### Error: "Cannot find module"
- Ejecuta `npm install` para instalar dependencias
- Asegúrate de haber compilado el proyecto: `npm run build`

### Error: "Network request failed"
- Verifica tu conexión a internet
- Comprueba que la API esté disponible en el entorno configurado

### Error al crear factura
- Verifica que los datos de la factura sean válidos
- Asegúrate de que `emitterTaxId` y `customerTaxId` tengan formato de NIF/CIF español válido
- La fecha de la factura debe ser >= 2024-10-28

## Tests Personalizados

Puedes modificar `test.ts` para probar casos específicos. Por ejemplo:

### Probar factura con múltiples IVAs

```typescript
const invoiceData = {
    issueDate: new Date().toISOString(),
    invoiceNumber: `TEST-${Date.now()}`,
    externalId: `test-${Date.now()}`,
    totalAmount: 1864.00,
    customerName: 'Cliente Test SL',
    customerTaxId: 'B12345678',
    emitterName: 'Empresa Test SL',
    emitterTaxId: 'B87654321',
    description: 'Factura con múltiples tipos de IVA',
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
}
```

### Probar factura con recargo de equivalencia

```typescript
const invoiceData = {
    // ... otros campos
    taxLines: [
        {
            taxRate: 21,
            baseAmount: 100.00,
            taxAmount: 21.00,
            surchargeRate: 5.2,
            surchargeAmount: 5.20
        }
    ]
}
```

## Testing en CI/CD

Para ejecutar tests en un pipeline CI/CD, configura las variables de entorno:

```bash
export INVO_EMAIL="tu-email@ejemplo.com"
export INVO_PASSWORD="tu-password"
export INVO_ENV="sandbox"

npm test
```

## Notas de Seguridad

- **NUNCA** subas el archivo `.env` a Git
- **NUNCA** compartas tus credenciales en issues o pull requests
- En producción, usa variables de entorno del sistema o un gestor de secretos
- Rota tus credenciales regularmente
