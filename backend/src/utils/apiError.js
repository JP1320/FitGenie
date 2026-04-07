export function apiError(code, message, details = null) {
  return { error: { code, message, details } };
}
