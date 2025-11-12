# @calltek/auth-sdk

Authentication SDK for Calltek services with full TypeScript support.

## Features

✅ **TypeScript Native** - Complete type definitions and autocomplete
✅ **Framework Agnostic** - Works with React, Vue, Angular, Vanilla JS, Node.js
✅ **Flexible Storage** - localStorage, sessionStorage, memory, or custom adapter
✅ **Auto Token Refresh** - Automatically refreshes tokens before expiration
✅ **OAuth Support** - Google, GitHub, Azure, Facebook
✅ **Multi-Environment** - Production and development modes
✅ **Zero Dependencies** - No external dependencies
✅ **Tree-Shakeable** - Only import what you need

## Installation

```bash
npm install @calltek/auth-sdk
```

```bash
yarn add @calltek/auth-sdk
```

```bash
pnpm add @calltek/auth-sdk
```

## Quick Start

```typescript
import { createAuthClient } from '@calltek/auth-sdk'

// Create client
const auth = createAuthClient({
  apiUrl: 'https://api.example.com',
  environment: 'production',
  storage: 'localStorage',
  autoRefresh: true,
})

// Login
const { user, access_token } = await auth.login({
  email: 'user@example.com',
  password: 'password123',
})

console.log('Logged in as:', user.email)
console.log('Token:', access_token)

// Check if authenticated
if (auth.isAuthenticated()) {
  const currentUser = auth.getUser()
  console.log('Current user:', currentUser)
}

// Logout
auth.logout()
```

## Configuration

```typescript
interface AuthClientConfig {
  apiUrl: string              // Required: API base URL
  environment?: 'production' | 'development'  // Default: 'production'
  storage?: 'localStorage' | 'sessionStorage' | 'memory' | StorageAdapter
  autoRefresh?: boolean       // Default: true
  refreshBuffer?: number      // Default: 300 (5 minutes before expiry)
  storagePrefix?: string      // Default: 'auth_'
  onTokenRefreshed?: (tokens: AuthResponse) => void
  onLogout?: () => void
  onError?: (error: Error) => void
}
```

## Usage Examples

### Email/Password Authentication

```typescript
try {
  const response = await auth.login({
    email: 'user@example.com',
    password: 'password123',
  })

  console.log('Welcome!', response.user.email)
} catch (error) {
  if (error instanceof InvalidCredentialsError) {
    console.error('Invalid email or password')
  } else {
    console.error('Login failed:', error.message)
  }
}
```

### OAuth Authentication

```typescript
// Get OAuth URL
const oauthUrl = await auth.getOAuthUrl('google')

// Redirect user to OAuth provider
window.location.href = oauthUrl

// After callback, handle the tokens
await auth.handleOAuthCallback({
  access_token: 'token_from_callback',
  refresh_token: 'refresh_token_from_callback',
  expires_in: 3600,
})
```

### Token Refresh

```typescript
// Manual refresh
try {
  const newTokens = await auth.refreshToken()
  console.log('Token refreshed:', newTokens.access_token)
} catch (error) {
  console.error('Refresh failed:', error)
  auth.logout()
}

// Auto-refresh (enabled by default)
const auth = createAuthClient({
  apiUrl: 'https://api.example.com',
  autoRefresh: true,
  refreshBuffer: 300, // Refresh 5 minutes before expiry
  onTokenRefreshed: (tokens) => {
    console.log('Token auto-refreshed')
  },
})
```

### Custom Storage Adapter

```typescript
import { StorageAdapter } from '@calltek/auth-sdk'

// Create custom storage (e.g., secure storage, cookies)
const customStorage: StorageAdapter = {
  getItem: (key) => {
    // Your custom get implementation
    return Cookies.get(key) || null
  },
  setItem: (key, value) => {
    // Your custom set implementation
    Cookies.set(key, value, { secure: true, sameSite: 'strict' })
  },
  removeItem: (key) => {
    Cookies.remove(key)
  },
  clear: () => {
    // Clear all auth cookies
  },
}

const auth = createAuthClient({
  apiUrl: 'https://api.example.com',
  storage: customStorage,
})
```

### React Hook Example

```typescript
import { createAuthClient } from '@calltek/auth-sdk'
import { useState, useEffect } from 'react'

const auth = createAuthClient({
  apiUrl: 'https://api.example.com',
})

export function useAuth() {
  const [user, setUser] = useState(auth.getUser())
  const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated())

  useEffect(() => {
    setUser(auth.getUser())
    setIsAuthenticated(auth.isAuthenticated())
  }, [])

  const login = async (email: string, password: string) => {
    const response = await auth.login({ email, password })
    setUser(response.user)
    setIsAuthenticated(true)
    return response
  }

  const logout = () => {
    auth.logout()
    setUser(null)
    setIsAuthenticated(false)
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    getAccessToken: () => auth.getAccessToken(),
  }
}
```

### Vue Composable Example

```typescript
import { createAuthClient } from '@calltek/auth-sdk'
import { ref, computed } from 'vue'

const auth = createAuthClient({
  apiUrl: 'https://api.example.com',
})

export function useAuth() {
  const user = ref(auth.getUser())
  const isAuthenticated = computed(() => auth.isAuthenticated())

  const login = async (email: string, password: string) => {
    const response = await auth.login({ email, password })
    user.value = response.user
    return response
  }

  const logout = () => {
    auth.logout()
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    getAccessToken: () => auth.getAccessToken(),
  }
}
```

## API Reference

### Methods

#### `login(credentials: LoginCredentials): Promise<AuthResponse>`
Login with email and password.

#### `logout(): void`
Logout and clear all tokens.

#### `refreshToken(): Promise<AuthResponse>`
Manually refresh the access token.

#### `getOAuthUrl(provider: OAuthProvider): Promise<string>`
Get OAuth URL for a provider ('google' | 'github' | 'azure' | 'facebook').

#### `handleOAuthCallback(data: OAuthCallbackData): Promise<AuthResponse>`
Handle OAuth callback and save tokens.

#### `getAccessToken(): string | null`
Get the current access token.

#### `getRefreshToken(): string | null`
Get the current refresh token.

#### `getUser(): User | null`
Get the current user information.

#### `isAuthenticated(): boolean`
Check if the user is authenticated.

#### `getEnvironment(): Environment`
Get the current environment.

#### `setEnvironment(env: Environment): void`
Switch between 'production' and 'development'.

### Types

```typescript
interface LoginCredentials {
  email: string
  password: string
}

interface AuthResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: {
    id: string
    email: string
  }
}

interface User {
  id: string
  email: string
}

type OAuthProvider = 'google' | 'github' | 'azure' | 'facebook'
type Environment = 'production' | 'development'
```

### Error Classes

```typescript
import {
  AuthError,
  InvalidCredentialsError,
  TokenExpiredError,
  NetworkError,
  InvalidTokenError,
  OAuthError,
} from '@calltek/auth-sdk'
```

## Publishing to npm

```bash
cd packages/auth-sdk

# Build the package
npm run build

# Login to npm
npm login

# Publish (first time)
npm publish --access public

# Update version and publish
npm version patch  # or minor, or major
npm publish
```

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
```

## License

MIT

## Support

For issues and questions, please open an issue on [GitHub](https://github.com/calltek/bf-verifactu/issues).
