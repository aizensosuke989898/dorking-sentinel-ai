
export const validateDomain = (domain: string): boolean => {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Remove protocol if present
  let cleanDomain = domain.toLowerCase().trim();
  cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
  cleanDomain = cleanDomain.replace(/^www\./, '');
  cleanDomain = cleanDomain.split('/')[0]; // Remove path
  cleanDomain = cleanDomain.split(':')[0]; // Remove port

  // Basic domain regex - more permissive for real domains
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  
  // Additional checks
  if (cleanDomain.length < 4 || cleanDomain.length > 253) {
    return false;
  }
  
  // Check if it has at least one dot
  if (!cleanDomain.includes('.')) {
    return false;
  }
  
  // Check for valid TLD
  const parts = cleanDomain.split('.');
  const tld = parts[parts.length - 1];
  if (tld.length < 2) {
    return false;
  }
  
  return domainRegex.test(cleanDomain);
};

export const normalizeDomain = (domain: string): string => {
  let cleanDomain = domain.toLowerCase().trim();
  cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
  cleanDomain = cleanDomain.replace(/^www\./, '');
  cleanDomain = cleanDomain.split('/')[0];
  cleanDomain = cleanDomain.split(':')[0];
  return cleanDomain;
};
