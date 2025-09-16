/**
 * Comprehensive validation and sanitization utilities
 * Provides XSS protection, input validation, and data sanitization
 */

// HTML entities for XSS protection
const HTML_ENTITIES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeHTML = (input) => {
  if (typeof input !== 'string') return '';
  return input.replace(/[&<>"'\/]/g, (char) => HTML_ENTITIES[char]);
};

/**
 * Validate and sanitize text input
 * @param {string} input - The input to validate
 * @param {object} options - Validation options
 * @returns {object} - {isValid: boolean, sanitized: string, errors: array}
 */
export const validateText = (input, options = {}) => {
  const {
    required = false,
    minLength = 0,
    maxLength = 1000,
    allowHTML = false,
    pattern = null,
    customValidator = null
  } = options;

  const errors = [];
  let sanitized = input || '';

  // Required check
  if (required && !sanitized.trim()) {
    errors.push('This field is required');
    return { isValid: false, sanitized: '', errors };
  }

  // Skip validation if empty and not required
  if (!required && !sanitized.trim()) {
    return { isValid: true, sanitized: '', errors: [] };
  }

  // Length validation
  if (sanitized.length < minLength) {
    errors.push(`Must be at least ${minLength} characters long`);
  }
  
  if (sanitized.length > maxLength) {
    errors.push(`Must be no more than ${maxLength} characters long`);
    sanitized = sanitized.substring(0, maxLength);
  }

  // Pattern validation
  if (pattern && !pattern.test(sanitized)) {
    errors.push('Invalid format');
  }

  // XSS protection
  if (!allowHTML) {
    sanitized = sanitizeHTML(sanitized);
  }

  // Custom validation
  if (customValidator) {
    const customResult = customValidator(sanitized);
    if (!customResult.isValid) {
      errors.push(...customResult.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};

/**
 * Validate email addresses
 * @param {string} email - Email to validate
 * @returns {object} - Validation result
 */
export const validateEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return validateText(email, {
    required: true,
    maxLength: 254,
    pattern: emailPattern,
    customValidator: (value) => {
      // Additional email validation
      if (value.includes('..')) {
        return { isValid: false, errors: ['Invalid email format - consecutive dots not allowed'] };
      }
      return { isValid: true, errors: [] };
    }
  });
};

/**
 * Validate phone numbers
 * @param {string} phone - Phone number to validate
 * @returns {object} - Validation result
 */
export const validatePhone = (phone) => {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  
  return validateText(phone, {
    required: false,
    minLength: 10,
    maxLength: 20,
    customValidator: (value) => {
      if (!value) return { isValid: true, errors: [] };
      
      // Basic phone number validation
      const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phonePattern.test(digitsOnly)) {
        return { isValid: false, errors: ['Invalid phone number format'] };
      }
      
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        return { isValid: false, errors: ['Phone number must be 10-15 digits'] };
      }
      
      return { isValid: true, errors: [] };
    }
  });
};

/**
 * Validate URLs
 * @param {string} url - URL to validate
 * @param {boolean} required - Whether URL is required
 * @returns {object} - Validation result
 */
export const validateURL = (url, required = false) => {
  return validateText(url, {
    required,
    maxLength: 2048,
    customValidator: (value) => {
      if (!value) return { isValid: true, errors: [] };
      
      try {
        const urlObj = new URL(value);
        
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
          return { isValid: false, errors: ['Only HTTP and HTTPS URLs are allowed'] };
        }
        
        // Basic domain validation
        if (!urlObj.hostname || urlObj.hostname.length < 3) {
          return { isValid: false, errors: ['Invalid domain name'] };
        }
        
        return { isValid: true, errors: [] };
      } catch (error) {
        return { isValid: false, errors: ['Invalid URL format'] };
      }
    }
  });
};

/**
 * Validate file uploads
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize = 5 * 1024 * 1024, // 5MB default
    maxFiles = 1
  } = options;

  const errors = [];

  if (!file) {
    return { isValid: false, sanitized: null, errors: ['No file provided'] };
  }

  // File type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  // File size validation
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    errors.push(`File size too large. Maximum size: ${maxSizeMB}MB`);
  }

  // File name validation (prevent directory traversal)
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  if (sanitizedName !== file.name) {
    errors.push('File name contains invalid characters');
  }

  // Additional security checks
  const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js', '.jar'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  if (suspiciousExtensions.includes(fileExtension)) {
    errors.push('Executable files are not allowed');
  }

  return {
    isValid: errors.length === 0,
    sanitized: sanitizedName,
    errors
  };
};

/**
 * Validate business hours
 * @param {object} hours - Hours object with day keys
 * @returns {object} - Validation result
 */
export const validateBusinessHours = (hours) => {
  const errors = [];
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  if (!hours || typeof hours !== 'object') {
    return { isValid: false, sanitized: {}, errors: ['Invalid hours format'] };
  }

  const sanitized = {};

  days.forEach(day => {
    const dayHours = hours[day];
    
    if (dayHours) {
      const { enabled, open, close } = dayHours;
      
      sanitized[day] = {
        enabled: Boolean(enabled),
        open: '',
        close: ''
      };

      if (enabled) {
        // Validate time format (HH:MM)
        const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        if (!open || !timePattern.test(open)) {
          errors.push(`Invalid opening time for ${day}`);
        } else {
          sanitized[day].open = open;
        }
        
        if (!close || !timePattern.test(close)) {
          errors.push(`Invalid closing time for ${day}`);
        } else {
          sanitized[day].close = close;
        }
        
        // Validate that closing time is after opening time
        if (open && close && timePattern.test(open) && timePattern.test(close)) {
          const openMinutes = parseInt(open.split(':')[0]) * 60 + parseInt(open.split(':')[1]);
          const closeMinutes = parseInt(close.split(':')[0]) * 60 + parseInt(close.split(':')[1]);
          
          if (closeMinutes <= openMinutes) {
            errors.push(`Closing time must be after opening time for ${day}`);
          }
        }
      }
    }
  });

  return {
    isValid: errors.length === 0,
    sanitized,
    errors
  };
};

/**
 * Comprehensive form validation
 * @param {object} formData - Form data to validate
 * @param {object} schema - Validation schema
 * @returns {object} - Complete validation result
 */
export const validateForm = (formData, schema) => {
  const errors = {};
  const sanitized = {};
  let isValid = true;

  Object.keys(schema).forEach(fieldName => {
    const fieldValue = formData[fieldName];
    const fieldSchema = schema[fieldName];
    
    let result;
    
    switch (fieldSchema.type) {
      case 'email':
        result = validateEmail(fieldValue);
        break;
      case 'phone':
        result = validatePhone(fieldValue);
        break;
      case 'url':
        result = validateURL(fieldValue, fieldSchema.required);
        break;
      case 'file':
        result = validateFile(fieldValue, fieldSchema.options);
        break;
      case 'businessHours':
        result = validateBusinessHours(fieldValue);
        break;
      default:
        result = validateText(fieldValue, fieldSchema);
    }
    
    if (!result.isValid) {
      errors[fieldName] = result.errors;
      isValid = false;
    }
    
    sanitized[fieldName] = result.sanitized;
  });

  return {
    isValid,
    sanitized,
    errors
  };
};

/**
 * Rate limiting helper
 * @param {string} key - Unique identifier for the operation
 * @param {number} limit - Max attempts allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} - Whether the operation is allowed
 */
export const rateLimit = (key, limit = 5, windowMs = 60000) => {
  const now = Date.now();
  const storageKey = `rateLimit_${key}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    const attempts = stored ? JSON.parse(stored) : [];
    
    // Filter out attempts outside the time window
    const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    if (validAttempts.length >= limit) {
      return false;
    }
    
    // Add current attempt
    validAttempts.push(now);
    localStorage.setItem(storageKey, JSON.stringify(validAttempts));
    
    return true;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return true; // Allow operation if rate limiting fails
  }
};

export default {
  sanitizeHTML,
  validateText,
  validateEmail,
  validatePhone,
  validateURL,
  validateFile,
  validateBusinessHours,
  validateForm,
  rateLimit
}; 