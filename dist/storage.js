/**
 * Memory storage implementation (for server-side or when storage is unavailable)
 */
class MemoryStorage {
    constructor() {
        this.storage = new Map();
    }
    getItem(key) {
        return this.storage.get(key) || null;
    }
    setItem(key, value) {
        this.storage.set(key, value);
    }
    removeItem(key) {
        this.storage.delete(key);
    }
    clear() {
        this.storage.clear();
    }
}
/**
 * Create a storage adapter based on type
 */
export function createStorageAdapter(storageType) {
    // If it's already a custom adapter, return it
    if (typeof storageType === 'object') {
        return storageType;
    }
    // Check if we're in a browser environment
    const isBrowser = typeof window !== 'undefined';
    switch (storageType) {
        case 'localStorage':
            if (isBrowser && window.localStorage) {
                return window.localStorage;
            }
            console.warn('localStorage not available, using memory storage');
            return new MemoryStorage();
        case 'sessionStorage':
            if (isBrowser && window.sessionStorage) {
                return window.sessionStorage;
            }
            console.warn('sessionStorage not available, using memory storage');
            return new MemoryStorage();
        case 'memory':
            return new MemoryStorage();
        default:
            return new MemoryStorage();
    }
}
/**
 * Storage manager with prefix support
 */
export class StorageManager {
    constructor(storageType, prefix = 'auth_') {
        this.prefix = prefix;
        this.adapter = createStorageAdapter(storageType);
    }
    getKey(key) {
        return `${this.prefix}${key}`;
    }
    get(key) {
        return this.adapter.getItem(this.getKey(key));
    }
    set(key, value) {
        this.adapter.setItem(this.getKey(key), value);
    }
    remove(key) {
        this.adapter.removeItem(this.getKey(key));
    }
    clear() {
        // Only clear items with our prefix
        const keysToRemove = [];
        // Try to get all keys (localStorage/sessionStorage specific)
        if ('length' in this.adapter && 'key' in this.adapter) {
            const storage = this.adapter;
            for (let i = 0; i < storage.length; i++) {
                const key = storage.key(i);
                if (key && key.startsWith(this.prefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach((key) => this.adapter.removeItem(key));
        }
        else {
            // For memory storage or custom adapters, just clear everything
            this.adapter.clear();
        }
    }
    getObject(key) {
        const value = this.get(key);
        if (!value)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return null;
        }
    }
    setObject(key, value) {
        this.set(key, JSON.stringify(value));
    }
}
//# sourceMappingURL=storage.js.map