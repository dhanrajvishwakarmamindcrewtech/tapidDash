/**
 * Secure file upload utilities with validation, compression, and optimization
 * Includes XSS protection, file type validation, and memory management
 */

import { validateFile } from './validation';

// File type configurations
export const FILE_TYPES = {
  IMAGE: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    category: 'image'
  },
  DOCUMENT: {
    mimeTypes: ['application/pdf', 'text/plain'],
    extensions: ['.pdf', '.txt'],
    maxSize: 10 * 1024 * 1024, // 10MB
    category: 'document'
  }
};

// Dangerous file types that should never be allowed
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.vbs', '.js', '.jar',
  '.app', '.deb', '.pkg', '.dmg', '.run', '.msi', '.ps1', '.sh', '.php'
];

/**
 * Validate file security and type
 * @param {File} file - File to validate
 * @param {object} options - Validation options
 * @returns {object} - Validation result
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    allowedTypes = FILE_TYPES.IMAGE,
    maxSize = allowedTypes.maxSize,
    allowMultiple = false
  } = options;

  const errors = [];

  if (!file) {
    return { isValid: false, errors: ['No file selected'] };
  }

  // Basic file validation
  const basicValidation = validateFile(file, {
    allowedTypes: allowedTypes.mimeTypes,
    maxSize
  });

  if (!basicValidation.isValid) {
    errors.push(...basicValidation.errors);
  }

  // Additional security checks
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));

  // Check for dangerous extensions
  if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
    errors.push('This file type is not allowed for security reasons');
  }

  // Check for double extensions (e.g., .jpg.exe)
  const extensionCount = (fileName.match(/\./g) || []).length;
  if (extensionCount > 1) {
    const parts = fileName.split('.');
    if (parts.length > 2) {
      errors.push('Files with multiple extensions are not allowed');
    }
  }

  // Validate file extension matches MIME type
  if (!allowedTypes.extensions.includes(fileExtension)) {
    errors.push(`File extension ${fileExtension} is not allowed`);
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /[<>:"|?*]/,  // Invalid filename characters
    /^\./,  // Hidden files
    /\s+$/  // Trailing spaces
  ];

  if (suspiciousPatterns.some(pattern => pattern.test(fileName))) {
    errors.push('Invalid file name format');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedName: basicValidation.sanitized
  };
};

/**
 * Compress image file
 * @param {File} file - Image file to compress
 * @param {object} options - Compression options
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'image/jpeg'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          format,
          quality
        );

        // Cleanup
        img.src = '';
        canvas.width = 0;
        canvas.height = 0;
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Generate thumbnail from image
 * @param {File} file - Image file
 * @param {object} options - Thumbnail options
 * @returns {Promise<string>} - Data URL of thumbnail
 */
export const generateThumbnail = (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      width = 150,
      height = 150,
      quality = 0.7,
      format = 'image/jpeg'
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        canvas.width = width;
        canvas.height = height;

        // Calculate crop dimensions for square thumbnail
        const { naturalWidth, naturalHeight } = img;
        const size = Math.min(naturalWidth, naturalHeight);
        const x = (naturalWidth - size) / 2;
        const y = (naturalHeight - size) / 2;

        // Draw cropped and resized image
        ctx.drawImage(img, x, y, size, size, 0, 0, width, height);
        
        const dataURL = canvas.toDataURL(format, quality);
        resolve(dataURL);

        // Cleanup
        img.src = '';
        canvas.width = 0;
        canvas.height = 0;
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Read file as data URL with error handling
 * @param {File} file - File to read
 * @returns {Promise<string>} - Data URL
 */
export const readFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Memory-safe blob URL manager
 */
class BlobURLManager {
  constructor() {
    this.urls = new Set();
    this.cleanupTimeouts = new Map();
  }

  create(blob, autoCleanup = true, cleanupDelay = 60000) {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);

    if (autoCleanup) {
      const timeout = setTimeout(() => {
        this.revoke(url);
      }, cleanupDelay);
      
      this.cleanupTimeouts.set(url, timeout);
    }

    return url;
  }

  revoke(url) {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url);
      this.urls.delete(url);
      
      const timeout = this.cleanupTimeouts.get(url);
      if (timeout) {
        clearTimeout(timeout);
        this.cleanupTimeouts.delete(url);
      }
    }
  }

  revokeAll() {
    this.urls.forEach(url => {
      URL.revokeObjectURL(url);
    });
    
    this.cleanupTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    
    this.urls.clear();
    this.cleanupTimeouts.clear();
  }

  getActiveCount() {
    return this.urls.size;
  }
}

// Global blob URL manager instance
export const blobURLManager = new BlobURLManager();

/**
 * Process uploaded files with validation, compression, and optimization
 * @param {FileList|File[]} files - Files to process
 * @param {object} options - Processing options
 * @returns {Promise<object>} - Processing results
 */
export const processFileUploads = async (files, options = {}) => {
  const {
    allowedTypes = FILE_TYPES.IMAGE,
    compress = true,
    generateThumbnails = true,
    maxFiles = 5
  } = options;

  const fileArray = Array.from(files);
  const results = {
    processed: [],
    errors: [],
    totalSize: 0
  };

  // Check file count limit
  if (fileArray.length > maxFiles) {
    results.errors.push(`Too many files. Maximum ${maxFiles} files allowed.`);
    return results;
  }

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    
    try {
      // Validate file
      const validation = validateFileUpload(file, { allowedTypes });
      
      if (!validation.isValid) {
        results.errors.push(`${file.name}: ${validation.errors.join(', ')}`);
        continue;
      }

      const processedFile = {
        original: file,
        name: validation.sanitizedName,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };

      // Process images
      if (allowedTypes.category === 'image') {
        try {
          // Compress image if requested
          if (compress) {
            const compressed = await compressImage(file);
            processedFile.compressed = compressed;
            processedFile.compressedSize = compressed.size;
            processedFile.compressionRatio = (1 - compressed.size / file.size) * 100;
          }

          // Generate thumbnail if requested
          if (generateThumbnails) {
            const thumbnail = await generateThumbnail(file);
            processedFile.thumbnail = thumbnail;
          }

          // Create preview URL
          processedFile.previewURL = blobURLManager.create(
            processedFile.compressed || file,
            true,
            300000 // 5 minutes
          );

        } catch (imageError) {
          console.error('Image processing error:', imageError);
          results.errors.push(`${file.name}: Failed to process image`);
          continue;
        }
      } else {
        // For non-images, just create a blob URL
        processedFile.previewURL = blobURLManager.create(file, true, 300000);
      }

      results.processed.push(processedFile);
      results.totalSize += processedFile.compressedSize || file.size;

    } catch (error) {
      console.error('File processing error:', error);
      results.errors.push(`${file.name}: Processing failed`);
    }
  }

  return results;
};

/**
 * Clean up file upload resources
 * @param {Array} processedFiles - Array of processed file objects
 */
export const cleanupFileUploads = (processedFiles) => {
  processedFiles.forEach(file => {
    if (file.previewURL) {
      blobURLManager.revoke(file.previewURL);
    }
  });
};

/**
 * Upload file with progress tracking
 * @param {File|Blob} file - File to upload
 * @param {string} url - Upload URL
 * @param {object} options - Upload options
 * @returns {Promise<object>} - Upload result
 */
export const uploadFileWithProgress = (file, url, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      onProgress = () => {},
      headers = {},
      fieldName = 'file',
      additionalFields = {}
    } = options;

    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // Add file to form data
    formData.append(fieldName, file);

    // Add additional fields
    Object.entries(additionalFields).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress, event.loaded, event.total);
      }
    });

    // Upload complete
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          resolve({ success: true, data: xhr.responseText });
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    // Upload error
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed due to network error'));
    });

    // Upload timeout
    xhr.addEventListener('timeout', () => {
      reject(new Error('Upload timed out'));
    });

    // Set headers
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // Set timeout (30 seconds default)
    xhr.timeout = options.timeout || 30000;

    // Start upload
    xhr.open('POST', url);
    xhr.send(formData);
  });
};

/**
 * Drag and drop file handler
 * @param {DragEvent} event - Drag event
 * @param {object} options - Handler options
 * @returns {FileList} - Dropped files
 */
export const handleFileDrop = (event, options = {}) => {
  event.preventDefault();
  event.stopPropagation();

  const {
    allowedTypes = FILE_TYPES.IMAGE,
    maxFiles = 5
  } = options;

  const files = event.dataTransfer.files;
  
  if (files.length > maxFiles) {
    throw new Error(`Too many files. Maximum ${maxFiles} files allowed.`);
  }

  // Validate file types
  const invalidFiles = Array.from(files).filter(file => {
    const validation = validateFileUpload(file, { allowedTypes });
    return !validation.isValid;
  });

  if (invalidFiles.length > 0) {
    throw new Error(`Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
  }

  return files;
};

export default {
  validateFileUpload,
  compressImage,
  generateThumbnail,
  readFileAsDataURL,
  processFileUploads,
  cleanupFileUploads,
  uploadFileWithProgress,
  handleFileDrop,
  blobURLManager,
  FILE_TYPES
}; 