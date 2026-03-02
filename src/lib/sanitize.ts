/**
 * Input sanitization utilities to prevent XSS, SQL injection, and other attacks
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

// Dangerous patterns to remove
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:/gi,
  /vbscript:/gi,
  /expression\s*\(/gi,
  /url\s*\(/gi,
];

// SQL injection patterns
const SQL_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|DECLARE)\b)/gi,
  /(--)|(\/\*)|(\*\/)/g,
  /(;|\||`)/g,
];

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Remove dangerous HTML/script content
 */
export function stripDangerousContent(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  let result = str;
  for (const pattern of DANGEROUS_PATTERNS) {
    result = result.replace(pattern, '');
  }
  return result;
}

/**
 * Sanitize input for SQL safety (basic protection - always use parameterized queries)
 */
export function sanitizeForSql(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  let result = str;
  for (const pattern of SQL_PATTERNS) {
    result = result.replace(pattern, '');
  }
  return result;
}

/**
 * Sanitize user input - main function for form inputs
 * Removes dangerous content and trims whitespace
 */
export function sanitizeInput(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Strip dangerous HTML/script content
  sanitized = stripDangerousContent(sanitized);
  
  // Limit length to prevent DoS
  const MAX_LENGTH = 10000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized;
}

/**
 * Sanitize for display - escapes HTML entities
 */
export function sanitizeForDisplay(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';
  return escapeHtml(sanitizeInput(input));
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '';
  
  // Basic email sanitization
  let sanitized = email.trim().toLowerCase();
  
  // Remove any HTML/script content
  sanitized = stripDangerousContent(sanitized);
  
  // Only allow valid email characters
  sanitized = sanitized.replace(/[^a-z0-9@._+-]/g, '');
  
  return sanitized;
}

/**
 * Sanitize URL input
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  
  let sanitized = url.trim();
  
  // Remove dangerous protocols
  if (!/^https?:\/\//i.test(sanitized)) {
    return '';
  }
  
  // Strip dangerous content
  sanitized = stripDangerousContent(sanitized);
  
  return sanitized;
}

/**
 * Sanitize search query
 */
export function sanitizeSearchQuery(query: string | null | undefined): string {
  if (!query || typeof query !== 'string') return '';
  
  let sanitized = query.trim();
  
  // Remove dangerous content
  sanitized = stripDangerousContent(sanitized);
  sanitized = sanitizeForSql(sanitized);
  
  // Limit length for search queries
  const MAX_SEARCH_LENGTH = 500;
  if (sanitized.length > MAX_SEARCH_LENGTH) {
    sanitized = sanitized.substring(0, MAX_SEARCH_LENGTH);
  }
  
  return sanitized;
}

/**
 * Sanitize object - recursively sanitize all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      (sanitized as Record<string, unknown>)[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item) : 
        typeof item === 'object' && item !== null ? sanitizeObject(item as Record<string, unknown>) : item
      );
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize password (don't modify, just validate)
 */
export function validatePassword(password: string | null | undefined): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters' };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }
  
  return { valid: true };
}

/**
 * Rate limiting helper - track submission attempts
 */
const submissionAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const attempt = submissionAttempts.get(key);
  
  if (!attempt || now - attempt.lastAttempt > windowMs) {
    submissionAttempts.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (attempt.count >= maxAttempts) {
    return false;
  }
  
  attempt.count++;
  attempt.lastAttempt = now;
  return true;
}

export function resetRateLimit(key: string): void {
  submissionAttempts.delete(key);
}
