/**
 * Base authentication error
 */
export class AuthError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'AuthError';
        Object.setPrototypeOf(this, AuthError.prototype);
    }
}
/**
 * Invalid credentials error
 */
export class InvalidCredentialsError extends AuthError {
    constructor(message = 'Invalid email or password') {
        super(message, 401);
        this.name = 'InvalidCredentialsError';
        Object.setPrototypeOf(this, InvalidCredentialsError.prototype);
    }
}
/**
 * Token expired error
 */
export class TokenExpiredError extends AuthError {
    constructor(message = 'Token has expired') {
        super(message, 401);
        this.name = 'TokenExpiredError';
        Object.setPrototypeOf(this, TokenExpiredError.prototype);
    }
}
/**
 * Network error
 */
export class NetworkError extends AuthError {
    constructor(message = 'Network request failed') {
        super(message);
        this.name = 'NetworkError';
        Object.setPrototypeOf(this, NetworkError.prototype);
    }
}
/**
 * Invalid token error
 */
export class InvalidTokenError extends AuthError {
    constructor(message = 'Invalid or malformed token') {
        super(message, 401);
        this.name = 'InvalidTokenError';
        Object.setPrototypeOf(this, InvalidTokenError.prototype);
    }
}
/**
 * OAuth error
 */
export class OAuthError extends AuthError {
    constructor(message = 'OAuth authentication failed') {
        super(message, 401);
        this.name = 'OAuthError';
        Object.setPrototypeOf(this, OAuthError.prototype);
    }
}
//# sourceMappingURL=errors.js.map