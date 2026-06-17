/**
 * Input validation utility to protect Leafstep API endpoints.
 */

export const MAX_TEXT_LENGTH = 500;
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates free text inputs (such as chat messages or NLP log logs).
 */
export function validateText(text: any): ValidationResult {
  if (typeof text !== "string") {
    return { isValid: false, error: "Input must be a string" };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { isValid: false, error: "Input cannot be empty" };
  }
  if (trimmed.length > MAX_TEXT_LENGTH) {
    return {
      isValid: false,
      error: `Input is too long (maximum ${MAX_TEXT_LENGTH} characters, received ${trimmed.length})`,
    };
  }
  return { isValid: true };
}

/**
 * Validates file data URLs uploaded for OCR receipt processing.
 */
export function validateFileDataUrl(fileDataUrl: any): ValidationResult {
  if (typeof fileDataUrl !== "string") {
    return { isValid: false, error: "File data URL must be a string" };
  }
  
  if (!fileDataUrl.startsWith("data:")) {
    return { isValid: false, error: "Invalid data URL format" };
  }

  // Calculate approximate decoded size from base64 length
  const base64Str = fileDataUrl.split(",")[1] || "";
  const approxSize = (base64Str.length * 3) / 4;

  if (approxSize > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds the 5MB limit (approx ${Math.round(approxSize / (1024 * 1024))}MB)`,
    };
  }

  return { isValid: true };
}
