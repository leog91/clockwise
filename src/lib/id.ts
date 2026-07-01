/**
 * Generates a short, reasonably unique identifier without external dependencies.
 */
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
