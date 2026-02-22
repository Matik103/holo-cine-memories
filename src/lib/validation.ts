/**
 * Input validation for search and user content.
 * Used for security and UX (clear error messages).
 */
export const validateSearchQuery = (query: string): { valid: boolean; error?: string } => {
  if (!query || query.trim().length === 0) {
    return { valid: false, error: 'Please enter a search query' };
  }

  if (query.trim().length < 3) {
    return { valid: false, error: 'Query must be at least 3 characters' };
  }

  if (query.length > 500) {
    return { valid: false, error: 'Query is too long (max 500 characters)' };
  }

  // Check for potentially dangerous patterns
  const dangerousPatterns = /<script|javascript:|onerror=|onload=/i;
  if (dangerousPatterns.test(query)) {
    return { valid: false, error: 'Invalid characters detected' };
  }

  return { valid: true };
};
