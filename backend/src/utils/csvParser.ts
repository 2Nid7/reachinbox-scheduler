// Simple CSV parser to extract email addresses
export const parseCSV = (fileContent: string): string[] => {
  const lines = fileContent.split('\n');
  const emails: string[] = [];

  // Regular expression for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Skip empty lines
    if (!trimmedLine) continue;

    // Try to extract email from the line
    const parts = trimmedLine.split(',');

    for (const part of parts) {
      const trimmedPart = part.trim();

      if (emailRegex.test(trimmedPart)) {
        emails.push(trimmedPart);
      }
    }
  }

  return emails;
};