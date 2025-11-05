/**
 * Get color based on scan result
 */
export const getResultColor = (result: string): string => {
  switch (result.toUpperCase()) {
    case 'BENIGN':
      return '#00E676'; // Green
    case 'MALICIOUS':
      return '#FF1744'; // Red
    case 'SUSPICIOUS':
      return '#FFB300'; // Amber
    case 'UNKNOWN':
    default:
      return '#B0BEC5'; // Gray
  }
};

/**
 * Get background color with opacity for result
 */
export const getResultBgColor = (result: string): string => {
  switch (result.toUpperCase()) {
    case 'BENIGN':
      return 'rgba(0, 230, 118, 0.1)';
    case 'MALICIOUS':
      return 'rgba(255, 23, 68, 0.1)';
    case 'SUSPICIOUS':
      return 'rgba(255, 179, 0, 0.1)';
    case 'UNKNOWN':
    default:
      return 'rgba(176, 190, 197, 0.1)';
  }
};

/**
 * Get icon color based on confidence
 */
export const getConfidenceColor = (confidence: number): string => {
  const percentage = confidence * 100;
  
  if (percentage >= 75) return '#00E676'; // Green
  if (percentage >= 50) return '#FFB300'; // Amber
  return '#FF1744'; // Red
};

/**
 * Get severity color
 */
export const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical'): string => {
  switch (severity) {
    case 'low':
      return '#00E676';
    case 'medium':
      return '#FFB300';
    case 'high':
      return '#FF9100';
    case 'critical':
      return '#FF1744';
    default:
      return '#B0BEC5';
  }
};
