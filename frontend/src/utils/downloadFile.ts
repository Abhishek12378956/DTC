export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const downloadCSV = (data: any[], filename: string): void => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const headers = Object.keys(data[0]).join(',');
  const rows = data.map((row) =>
    Object.values(row)
      .map((val) => `"${val || ''}"`)
      .join(',')
  );
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, filename);
};

