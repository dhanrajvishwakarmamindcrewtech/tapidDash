/**
 * Production-grade localStorage utility with comprehensive error handling
 * Features:
 * - Try/catch wrapper for all operations
 * - Memory fallback when localStorage is unavailable
 * - Data corruption detection and recovery
 * - Quota management
 * - User-friendly error reporting
 */

// Memory fallback storage when localStorage is unavailable
const memoryStorage = new Map();

// Storage availability check
let isLocalStorageAvailable = false;
try {
  const testKey = '__localStorage_test__';
  window.localStorage.setItem(testKey, 'test');
  window.localStorage.removeItem(testKey);
  isLocalStorageAvailable = true;
} catch (e) {
  console.warn('localStorage is not available, falling back to memory storage:', e.message);
}

/**
 * Storage error types for better error handling
 */
export const StorageErrors = {
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  ACCESS_DENIED: 'ACCESS_DENIED',
  CORRUPTED_DATA: 'CORRUPTED_DATA',
  INVALID_KEY: 'INVALID_KEY',
  PARSE_ERROR: 'PARSE_ERROR',
  STORAGE_DISABLED: 'STORAGE_DISABLED'
};

/**
 * Custom error class for storage operations
 */
export class StorageError extends Error {
  constructor(type, message, originalError = null) {
    super(message);
    this.name = 'StorageError';
    this.type = type;
    this.originalError = originalError;
  }
}

/**
 * Safe storage operations with comprehensive error handling
 */
export const safeStorage = {
  /**
   * Safely get an item from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist or operation fails
   * @returns {Object} - { success: boolean, data: any, error: StorageError|null }
   */
  getItem(key, defaultValue = null) {
    // Validate key
    if (!key || typeof key !== 'string') {
      return {
        success: false,
        data: defaultValue,
        error: new StorageError(StorageErrors.INVALID_KEY, 'Storage key must be a non-empty string')
      };
    }

    try {
      let value;
      
      if (isLocalStorageAvailable) {
        value = window.localStorage.getItem(key);
      } else {
        value = memoryStorage.get(key) || null;
      }

      // Key doesn't exist
      if (value === null) {
        return {
          success: true,
          data: defaultValue,
          error: null
        };
      }

      // Try to parse JSON
      try {
        const parsed = JSON.parse(value);
        return {
          success: true,
          data: parsed,
          error: null
        };
      } catch (parseError) {
        // Data might be corrupted, return default and log error
        console.warn(`Corrupted data in storage key "${key}":`, parseError);
        return {
          success: false,
          data: defaultValue,
          error: new StorageError(
            StorageErrors.CORRUPTED_DATA,
            `Data in key "${key}" is corrupted and cannot be parsed`,
            parseError
          )
        };
      }
    } catch (error) {
      console.error('Storage getItem error:', error);
      return {
        success: false,
        data: defaultValue,
        error: new StorageError(
          StorageErrors.ACCESS_DENIED,
          `Failed to read from storage: ${error.message}`,
          error
        )
      };
    }
  },

  /**
   * Safely set an item in storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @returns {Object} - { success: boolean, error: StorageError|null }
   */
  setItem(key, value) {
    // Validate key
    if (!key || typeof key !== 'string') {
      return {
        success: false,
        error: new StorageError(StorageErrors.INVALID_KEY, 'Storage key must be a non-empty string')
      };
    }

    try {
      const serialized = JSON.stringify(value);

      if (isLocalStorageAvailable) {
        window.localStorage.setItem(key, serialized);
      } else {
        memoryStorage.set(key, serialized);
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Storage setItem error:', error);

      // Handle specific error types
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        return {
          success: false,
          error: new StorageError(
            StorageErrors.QUOTA_EXCEEDED,
            'Storage quota exceeded. Please clear some data and try again.',
            error
          )
        };
      }

      if (error.name === 'SecurityError') {
        return {
          success: false,
          error: new StorageError(
            StorageErrors.ACCESS_DENIED,
            'Storage access denied. This might be due to private browsing mode.',
            error
          )
        };
      }

      return {
        success: false,
        error: new StorageError(
          StorageErrors.ACCESS_DENIED,
          `Failed to write to storage: ${error.message}`,
          error
        )
      };
    }
  },

  /**
   * Safely remove an item from storage
   * @param {string} key - Storage key
   * @returns {Object} - { success: boolean, error: StorageError|null }
   */
  removeItem(key) {
    // Validate key
    if (!key || typeof key !== 'string') {
      return {
        success: false,
        error: new StorageError(StorageErrors.INVALID_KEY, 'Storage key must be a non-empty string')
      };
    }

    try {
      if (isLocalStorageAvailable) {
        window.localStorage.removeItem(key);
      } else {
        memoryStorage.delete(key);
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Storage removeItem error:', error);
      return {
        success: false,
        error: new StorageError(
          StorageErrors.ACCESS_DENIED,
          `Failed to remove from storage: ${error.message}`,
          error
        )
      };
    }
  },

  /**
   * Clear all storage data
   * @returns {Object} - { success: boolean, error: StorageError|null }
   */
  clear() {
    try {
      if (isLocalStorageAvailable) {
        window.localStorage.clear();
      } else {
        memoryStorage.clear();
      }

      return {
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Storage clear error:', error);
      return {
        success: false,
        error: new StorageError(
          StorageErrors.ACCESS_DENIED,
          `Failed to clear storage: ${error.message}`,
          error
        )
      };
    }
  },

  /**
   * Get storage info and availability
   * @returns {Object} - Storage information
   */
  getInfo() {
    return {
      isAvailable: isLocalStorageAvailable,
      type: isLocalStorageAvailable ? 'localStorage' : 'memory',
      memoryKeysCount: memoryStorage.size
    };
  },

  /**
   * Update an existing item safely (get + modify + set)
   * @param {string} key - Storage key
   * @param {Function} updateFn - Function to update the value (value) => newValue
   * @param {*} defaultValue - Default value if key doesn't exist
   * @returns {Object} - { success: boolean, data: any, error: StorageError|null }
   */
  updateItem(key, updateFn, defaultValue = null) {
    const getResult = this.getItem(key, defaultValue);
    
    if (!getResult.success && getResult.error.type !== StorageErrors.CORRUPTED_DATA) {
      return getResult;
    }

    try {
      const newValue = updateFn(getResult.data);
      const setResult = this.setItem(key, newValue);
      
      if (!setResult.success) {
        return {
          success: false,
          data: getResult.data,
          error: setResult.error
        };
      }

      return {
        success: true,
        data: newValue,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: getResult.data,
        error: new StorageError(
          StorageErrors.ACCESS_DENIED,
          `Failed to update storage item: ${error.message}`,
          error
        )
      };
    }
  }
};

/**
 * User-friendly error messages for UI display
 */
export const getStorageErrorMessage = (error) => {
  if (!(error instanceof StorageError)) {
    return 'An unexpected storage error occurred.';
  }

  switch (error.type) {
    case StorageErrors.QUOTA_EXCEEDED:
      return 'Storage is full. Please clear some data and try again.';
    case StorageErrors.ACCESS_DENIED:
      return 'Unable to access storage. This might be due to browser settings.';
    case StorageErrors.CORRUPTED_DATA:
      return 'Stored data is corrupted and has been reset.';
    case StorageErrors.INVALID_KEY:
      return 'Invalid storage operation.';
    case StorageErrors.STORAGE_DISABLED:
      return 'Storage is disabled in your browser.';
    default:
      return error.message || 'A storage error occurred.';
  }
};

export default safeStorage; 