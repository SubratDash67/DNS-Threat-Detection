/**
 * Download file from blob
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Download data as JSON file
 */
export const downloadJSON = (data: any, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadFile(blob, filename);
};

/**
 * Download data as CSV file
 */
export const downloadCSV = (data: string[][], filename: string): void => {
  const csv = data.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  downloadFile(blob, filename);
};

/**
 * Convert array of objects to CSV
 */
export const objectArrayToCSV = (objects: Record<string, any>[]): string[][] => {
  if (objects.length === 0) return [];

  const headers = Object.keys(objects[0]);
  const rows = objects.map((obj) => headers.map((header) => String(obj[header] || '')));

  return [headers, ...rows];
};
