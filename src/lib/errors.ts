// Redux Toolkit's `unwrap()` throws a plain serialized error object
// (`{ name, message, stack }`), not a real `Error` instance — so
// `error instanceof Error` is always false for rejected thunks, even
// though `error.message` holds the real backend message. This checks
// for a string `message` property first, falling back to `Error` for
// anything thrown outside a thunk (e.g. a raw try/catch around `api.*`).
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
