/**
 * Simple in-memory rate limiter
 * For production, consider using @upstash/ratelimit with Redis
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  },
  5 * 60 * 1000
);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed
   */
  maxRequests: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request is within rate limits
 * @param identifier - Unique identifier for the rate limit (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // No entry or expired entry - create new one
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  // Entry exists and is still valid
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get rate limit identifier from request
 * Uses X-Forwarded-For header or IP address
 */
export function getRateLimitIdentifier(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take first IP from X-Forwarded-For
    return forwardedFor.split(",")[0].trim();
  }

  // Fallback to x-real-ip or "unknown"
  return req.headers.get("x-real-ip") || "unknown";
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  /**
   * Photo upload: 20 uploads per hour
   */
  PHOTO_UPLOAD: {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  /**
   * Album operations: 50 per hour
   */
  ALBUM_OPERATIONS: {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  /**
   * General mutations: 100 per hour
   */
  GENERAL_MUTATIONS: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const;
