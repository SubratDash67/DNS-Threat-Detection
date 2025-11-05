/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Domain validation regex (basic)
 */
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate domain name
 */
export const isValidDomain = (domain: string): boolean => {
  if (!domain || domain.length === 0 || domain.length > 255) {
    return false;
  }
  return DOMAIN_REGEX.test(domain);
};

/**
 * Validate password strength
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  messages: string[];
} => {
  const messages: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (password.length < 8) {
    messages.push('Password must be at least 8 characters');
  }

  if (!/[a-z]/.test(password)) {
    messages.push('Include at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    messages.push('Include at least one uppercase letter');
  }

  if (!/[0-9]/.test(password)) {
    messages.push('Include at least one number');
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    messages.push('Include at least one special character');
  }

  // Determine strength
  const criteriasMet = 5 - messages.length;
  if (criteriasMet >= 4 && password.length >= 12) {
    strength = 'strong';
  } else if (criteriasMet >= 3 && password.length >= 8) {
    strength = 'medium';
  }

  return {
    isValid: messages.length === 0 && password.length >= 8,
    strength,
    messages,
  };
};

/**
 * Sanitize domain input (remove protocol, path, etc.)
 */
export const sanitizeDomain = (input: string): string => {
  let domain = input.trim().toLowerCase();

  // Remove protocol
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, '');

  // Remove path
  domain = domain.split('/')[0];

  // Remove port
  domain = domain.split(':')[0];

  return domain;
};
