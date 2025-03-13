
/**
 * Utility functions for handling files in the application
 */

// Read a file as text
export const readFileAsText = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

// Read a file as base64 data URL (for PDFs)
export const readFileAsDataURL = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
};

// Format file size in human-readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Extract text content from a PDF file (simplified mock version)
// In a real implementation, you'd use a library like pdf.js
export const extractTextFromPDF = async (file: File): Promise<string> => {
  // This is a simplified mock function
  // In a real app, you would use pdf.js or another library to extract text
  return `This is mock extracted text from the PDF: ${file.name}. 
  In a real implementation, this would contain the actual text content of the PDF.`;
};

// Validate if the file type is supported
export const isFileTypeSupported = (file: File): boolean => {
  const supportedTypes = [
    'application/pdf',                             // PDF
    'text/plain',                                  // .txt
    'text/markdown',                               // .md
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];
  
  return supportedTypes.includes(file.type);
};

// Generate a preview of the text content (first 300 characters)
export const generatePreview = (text: string): string => {
  const max = 300;
  if (text.length <= max) return text;
  return text.substring(0, max) + '...';
};
