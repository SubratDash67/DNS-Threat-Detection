/**
 * Format detection method name for display
 */
export const formatMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    'safelist': 'Safelist',
    'typosquatting': 'Typosquatting',
    'suspicious_detection': 'Suspicious Rule',
    'ml_ensemble': 'ML Ensemble',
    'brand_whitelist': 'Brand Whitelist',
    'repetition_detection': 'Repetition',
    'ensemble': 'Ensemble',
  };

  return methodMap[method.toLowerCase()] || method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
