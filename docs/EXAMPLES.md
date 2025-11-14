# Usage Examples

## Basic Setup

### JavaScript (CommonJS)

```javascript
const { createAuthClient } = require('@calltek/auth-sdk')

const auth = createAuthClient({
  apiUrl: 'https://api.example.com',
  environment: 'production'
})
```

### TypeScript / ES Modules

```typescript
import { createAuthClient } from '@calltek/auth-sdk'

const auth = createAuthClient({
  apiUrl: 'https://api.example.com',
  environment: 'production'
})
```

## React Integration

### With Context

```typescript
// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react'
import { createAuthClient, AuthClient, User } from '@calltek/auth-sdk'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const authClient = createAuthClient({
  apiUrl: process.env.REACT_APP_API_URL!,
  onLogout: () => {
    // Handle logout (e.g., redirect)
    window.location.href = '/login'
  },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(authClient.getUser())

  useEffect(() => {
    // Check authentication on mount
    if (authClient.isAuthenticated()) {
      setUser(authClient.getUser())
    }
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authClient.login({ email, password })
    setUser(response.user)
  }

  const logout = () => {
    authClient.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: authClient.isAuthenticated(),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### Login Component

```typescript
// LoginForm.tsx
import React, { useState } from 'react'
import { useAuth } from './AuthContext'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      // Redirect on success
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  )
}
```

### Protected Route

```typescript
// ProtectedRoute.tsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

## Vue 3 Integration

### Composable

```typescript
// composables/useAuth.ts
import { ref, computed } from 'vue'
import { createAuthClient, type User } from '@calltek/auth-sdk'

const authClient = createAuthClient({
  apiUrl: import.meta.env.VITE_API_URL,
})

const user = ref<User | null>(authClient.getUser())

export function useAuth() {
  const isAuthenticated = computed(() => authClient.isAuthenticated())

  const login = async (email: string, password: string) => {
    const response = await authClient.login({ email, password })
    user.value = response.user
  }

  const logout = () => {
    authClient.logout()
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    getAccessToken: () => authClient.getAccessToken(),
  }
}
```

### Login Component

```vue
<!-- LoginForm.vue -->
<template>
  <form @submit.prevent="handleLogin">
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    <div v-if="error" class="error">{{ error }}</div>
    <button type="submit">Login</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { login } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  try {
    await login(email.value, password.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  }
}
</script>
```

## Angular Integration

### Auth Service

```typescript
// auth.service.ts
import { Injectable } from '@angular/core'
import { createAuthClient, AuthClient, User } from '@calltek/auth-sdk'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authClient: AuthClient
  private userSubject = new BehaviorSubject<User | null>(null)

  public user$: Observable<User | null> = this.userSubject.asObservable()

  constructor() {
    this.authClient = createAuthClient({
      apiUrl: environment.apiUrl,
      onLogout: () => this.userSubject.next(null),
    })

    // Initialize user if authenticated
    if (this.authClient.isAuthenticated()) {
      this.userSubject.next(this.authClient.getUser())
    }
  }

  async login(email: string, password: string): Promise<void> {
    const response = await this.authClient.login({ email, password })
    this.userSubject.next(response.user)
  }

  logout(): void {
    this.authClient.logout()
  }

  isAuthenticated(): boolean {
    return this.authClient.isAuthenticated()
  }

  getAccessToken(): string | null {
    return this.authClient.getAccessToken()
  }
}
```

### Auth Guard

```typescript
// auth.guard.ts
import { Injectable } from '@angular/core'
import { Router, CanActivate } from '@angular/router'
import { AuthService } from './auth.service'

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true
    }

    this.router.navigate(['/login'])
    return false
  }
}
```

## Node.js / Express Integration

### API Client

```typescript
// apiClient.ts
import { createAuthClient } from '@calltek/auth-sdk'

// Use memory storage for server-side
const auth = createAuthClient({
  apiUrl: process.env.API_URL!,
  storage: 'memory',
  autoRefresh: true,
})

export async function makeAuthenticatedRequest(url: string, options = {}) {
  const token = auth.getAccessToken()

  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })

  return response.json()
}
```

## Environment Switching

```typescript
const auth = createAuthClient({
  apiUrl: 'https://api.example.com',
  environment: 'production',
})

// Switch to development
auth.setEnvironment('development')

// All subsequent requests will use 'development' environment
await auth.login({ email, password })
```

## Error Handling

```typescript
import {
  InvalidCredentialsError,
  TokenExpiredError,
  NetworkError,
} from '@calltek/auth-sdk'

try {
  await auth.login({ email, password })
} catch (error) {
  if (error instanceof InvalidCredentialsError) {
    console.error('Wrong email or password')
  } else if (error instanceof TokenExpiredError) {
    console.error('Session expired, please login again')
  } else if (error instanceof NetworkError) {
    console.error('Network error, check your connection')
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Testing

### Mock Auth Client

```typescript
// __mocks__/@calltek/auth-sdk.ts
export const createAuthClient = jest.fn(() => ({
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
}))
```

### Test Example

```typescript
import { createAuthClient } from '@calltek/auth-sdk'

jest.mock('@calltek/auth-sdk')

describe('Login', () => {
  it('should login successfully', async () => {
    const auth = createAuthClient({ apiUrl: 'http://test.com' })

    const response = await auth.login({
      email: 'test@example.com',
      password: 'password',
    })

    expect(response.user.email).toBe('test@example.com')
    expect(auth.isAuthenticated()).toBe(true)
  })
})
```
