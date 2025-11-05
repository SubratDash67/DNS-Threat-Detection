/**
 * Format confidence score as percentage
 */
export const formatConfidence = (confidence: number): string => {
  return `${(confidence * 100).toFixed(2)}%`;
};

/**
 * Format confidence for display with color
 */
export const getConfidenceDisplay = (confidence: number): {
  text: string;
  color: string;
} => {
  const percentage = confidence * 100;
  
  let color = '#00E676'; // Green
  if (percentage < 50) {
    color = '#FF1744'; // Red
  } else if (percentage < 75) {
    color = '#FFB300'; // Amber
  }

  return {
    text: `${percentage.toFixed(1)}%`,
    color,
  };
};

/**
 * Get confidence level text
 */
export const getConfidenceLevel = (confidence: number): string => {
  const percentage = confidence * 100;
  
  if (percentage >= 90) return 'Very High';
  if (percentage >= 75) return 'High';
  if (percentage >= 50) return 'Medium';
  if (percentage >= 25) return 'Low';
  return 'Very Low';
};
