# Tests

This folder contains test files for the INVO SDK.

## Files

- **`test.ts`** - Main test script that validates all SDK functionality
- **`test-reader.ts`** - Test script for the Reader endpoint (readInvoice)
- **`test-makeup.ts`** - Test script for the Makeup endpoint (makeupInvoice - PDF generation)
- **`.env.example`** - Example environment variables file

## Running Tests

### Quick Start

1. Copy the example environment file:
```bash
cp test/.env.example .env
```

2. Edit `.env` with your credentials:
```env
INVO_EMAIL=your-email@example.com
INVO_PASSWORD=your-password
INVO_ENV=sandbox
```

3. Run the tests:
```bash
# Run all tests
npm test

# Run specific tests
npx tsx test/test.ts           # Main SDK tests
npx tsx test/test-reader.ts    # Reader endpoint tests
npx tsx test/test-makeup.ts    # Makeup/PDF generation tests
```

## What Gets Tested

### Main Test Suite (`test.ts`)
The main test suite validates:

1. ✅ **Authentication** - Login with email/password
2. ✅ **Token Management** - Access tokens, refresh tokens
3. ✅ **Invoice Creation** - Create VeriFactu invoices
4. ✅ **Generic Requests** - Custom API calls
5. ✅ **Token Refresh** - Automatic and manual refresh
6. ✅ **Environment Switching** - Production/Sandbox
7. ✅ **Logout** - Clean token cleanup

### Reader Test Suite (`test-reader.ts`)
Tests the invoice reading functionality:

1. ✅ **File Upload** - Upload invoice files (PDF, XML)
2. ✅ **Invoice Parsing** - Extract invoice data from uploaded files
3. ✅ **Response Validation** - Verify parsed data structure

**Requirements:**
- Place a test invoice file (PDF or XML) in the project root named `test-invoice.pdf`
- Or set `TEST_INVOICE_PATH` environment variable to point to your test file

### Makeup Test Suite (`test-makeup.ts`)
Tests the PDF invoice generation functionality:

1. ✅ **PDF Generation** - Generate branded PDF invoices
2. ✅ **Custom Branding** - Apply custom colors, logos, and templates
3. ✅ **File Output** - Save generated PDF to disk
4. ✅ **PDF Validation** - Verify PDF structure

**Output:**
- Generated PDF will be saved as `test-output-invoice.pdf` in the project root

## Test Output

When tests pass, you'll see:

```
🚀 Starting INVO SDK Tests

Configuration:
  Email: your-email@example.com
  Environment: sandbox

📦 Creating SDK instance...
🔐 Test 1: Authentication
  ✅ Login successful!

... (more tests)

🎉 All tests completed successfully!
```

## Documentation

For detailed testing documentation, see [docs/TESTING.md](../docs/TESTING.md).

## Creating Custom Tests

You can modify `test.ts` to add your own test scenarios. The file is well-commented and easy to extend.

Example:

```typescript
// Test custom invoice scenario
const customInvoiceData = {
    issueDate: new Date().toISOString(),
    invoiceNumber: 'CUSTOM-001',
    // ... your specific data
}

const result = await sdk.createInvoice(customInvoiceData)
console.log('Custom invoice created:', result.invoiceId)
```
