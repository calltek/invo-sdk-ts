# Tests

This folder contains test files for the INVO SDK.

## Files

- **`test.ts`** - Main test script that validates all SDK functionality
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
npm test
```

## What Gets Tested

The test suite validates:

1. ✅ **Authentication** - Login with email/password
2. ✅ **Token Management** - Access tokens, refresh tokens
3. ✅ **Invoice Creation** - Create VeriFactu invoices
4. ✅ **Generic Requests** - Custom API calls
5. ✅ **Token Refresh** - Automatic and manual refresh
6. ✅ **Environment Switching** - Production/Sandbox
7. ✅ **Logout** - Clean token cleanup

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
