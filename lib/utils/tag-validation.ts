/**
 * Client-side tag validation utilities
 * These functions don't require database access
 */

export function validateTagName(tagName: string): { valid: boolean; error?: string } {
  if (!tagName.trim()) {
    return { valid: false, error: 'Tag name cannot be empty' };
  }
  
  if (tagName.length > 50) {
    return { valid: false, error: 'Tag name must be 50 characters or less' };
  }
  
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(tagName)) {
    return { valid: false, error: 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores' };
  }
  
  return { valid: true };
}
