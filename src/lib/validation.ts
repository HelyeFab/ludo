/**
 * Validation utilities for file uploads and user input
 */

// Allowed image MIME types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
] as const;

// Maximum file size: 15MB
const MAX_FILE_SIZE = 15 * 1024 * 1024;

// Maximum number of files per upload
const MAX_FILES_PER_UPLOAD = 20;

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Validate image file type and size
 * @param file - File to validate
 * @returns Validation result
 */
export function validateImageFile(file: File): ValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check if file has content
  if (file.size === 0) {
    return {
      valid: false,
      error: "File is empty",
    };
  }

  return { valid: true };
}

/**
 * Validate multiple image files
 * @param files - Files to validate
 * @returns Validation result
 */
export function validateImageFiles(files: File[]): ValidationResult {
  // Check number of files
  if (files.length === 0) {
    return {
      valid: false,
      error: "No files provided",
    };
  }

  if (files.length > MAX_FILES_PER_UPLOAD) {
    return {
      valid: false,
      error: `Too many files: ${files.length}. Maximum: ${MAX_FILES_PER_UPLOAD}`,
    };
  }

  // Validate each file
  for (const file of files) {
    const result = validateImageFile(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}

/**
 * Sanitize filename to prevent directory traversal and other attacks
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, "-") // Replace unsafe characters
    .replace(/\.+/g, ".") // Replace multiple dots with single dot
    .replace(/^\./, "") // Remove leading dot
    .substring(0, 255); // Limit length
}

/**
 * Validate album title
 * @param title - Album title to validate
 * @returns Validation result
 */
export function validateAlbumTitle(title: string): ValidationResult {
  const trimmed = title.trim();

  if (!trimmed) {
    return {
      valid: false,
      error: "Title is required",
    };
  }

  if (trimmed.length < 2) {
    return {
      valid: false,
      error: "Title must be at least 2 characters",
    };
  }

  if (trimmed.length > 200) {
    return {
      valid: false,
      error: "Title must be less than 200 characters",
    };
  }

  return { valid: true };
}

/**
 * Validate optional text field
 * @param text - Text to validate
 * @param maxLength - Maximum length
 * @returns Validation result
 */
export function validateOptionalText(
  text: string | undefined,
  maxLength: number = 500
): ValidationResult {
  if (!text) {
    return { valid: true };
  }

  const trimmed = text.trim();

  if (trimmed.length > maxLength) {
    return {
      valid: false,
      error: `Text must be less than ${maxLength} characters`,
    };
  }

  return { valid: true };
}
