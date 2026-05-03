import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window as any);

/**
 * Sanitizes user input by stripping HTML and enforcing length limits.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  
  // Strip HTML
  let sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  
  // Trim to 2000 chars
  if (sanitized.length > 2000) {
    sanitized = sanitized.substring(0, 2000);
  }
  
  // Basic SQL injection patterns check (very naive but requested)
  const sqlPatterns = [/DROP TABLE/i, /INSERT INTO/i, /DELETE FROM/i, /SELECT \* FROM/i, /UNION SELECT/i];
  for (const pattern of sqlPatterns) {
    if (pattern.test(sanitized)) {
      console.warn("Potential SQL injection pattern detected and blocked.");
      return "Invalid input detected.";
    }
  }

  return sanitized;
}
