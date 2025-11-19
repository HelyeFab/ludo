/**
 * Environment variable validation
 * Ensures all required security configurations are present and meet minimum requirements
 */

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 12)
 * @returns Validation errors, empty if valid
 */
export function validatePasswordStrength(
  password: string,
  minLength: number = 12
): string[] {
  const errors: string[] = [];

  // Skip validation for hashed passwords (bcrypt)
  if (password.startsWith("$2b$") || password.startsWith("$2a$")) {
    return errors; // Already hashed, assume valid
  }

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return errors;
}

/**
 * Validates all environment variables
 * Call this at application startup to ensure proper configuration
 */
export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check SESSION_SECRET
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    errors.push(
      "SESSION_SECRET is not set. Generate one with: openssl rand -base64 32"
    );
  } else if (sessionSecret.length < 32) {
    errors.push(
      "SESSION_SECRET must be at least 32 characters long for security"
    );
  }

  // Check ADMIN_PASSWORD
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    errors.push("ADMIN_PASSWORD is not set");
  } else {
    const passwordErrors = validatePasswordStrength(adminPassword);
    if (passwordErrors.length > 0 && !adminPassword.startsWith("$2b$")) {
      warnings.push(
        `ADMIN_PASSWORD is weak: ${passwordErrors.join(", ")}. Consider using a hashed password with bcrypt.`
      );
    }
  }

  // Check VIEWER_PASSWORD
  const viewerPassword = process.env.VIEWER_PASSWORD;
  if (!viewerPassword) {
    errors.push("VIEWER_PASSWORD is not set");
  } else {
    const passwordErrors = validatePasswordStrength(viewerPassword);
    if (passwordErrors.length > 0 && !viewerPassword.startsWith("$2b$")) {
      warnings.push(
        `VIEWER_PASSWORD is weak: ${passwordErrors.join(", ")}. Consider using a hashed password with bcrypt.`
      );
    }
  }

  // Check BLOB_READ_WRITE_TOKEN
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    errors.push("BLOB_READ_WRITE_TOKEN is not set");
  } else if (!blobToken.startsWith("vercel_blob_")) {
    warnings.push("BLOB_READ_WRITE_TOKEN format looks incorrect");
  }

  // Check NODE_ENV
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === "production") {
    // Additional production checks
    if (adminPassword && !adminPassword.startsWith("$2b$")) {
      warnings.push(
        "⚠️  CRITICAL: Using plain text ADMIN_PASSWORD in production. Hash it immediately with bcrypt!"
      );
    }
    if (viewerPassword && !viewerPassword.startsWith("$2b$")) {
      warnings.push(
        "⚠️  CRITICAL: Using plain text VIEWER_PASSWORD in production. Hash it immediately with bcrypt!"
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Logs environment validation results
 * Should be called at server startup
 */
export function logEnvironmentValidation(): void {
  const result = validateEnvironment();

  if (result.errors.length > 0) {
    console.error("\n❌ Environment Variable Errors:");
    result.errors.forEach((error) => console.error(`  - ${error}`));
    console.error("\n");
  }

  if (result.warnings.length > 0) {
    console.warn("\n⚠️  Environment Variable Warnings:");
    result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    console.warn("\n");
  }

  if (result.isValid && result.warnings.length === 0) {
    console.log("✅ Environment variables validated successfully\n");
  }

  // Throw error if critical validation fails
  if (!result.isValid) {
    throw new Error(
      "Environment validation failed. Please fix the errors above before starting the application."
    );
  }
}
