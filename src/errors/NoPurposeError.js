/**
 * Custom error class indicating that a {@link Perimeter} was defined without a purpose,
 * or with an invalid purpose.
 *
 * @param {string} [message='Perimeter must have a valid purpose.'] - The error message.
 * @constructor
 * @see Perimeter
 *
 * @example
 * if (!purpose || typeof purpose !== 'string') {
 *   throw new NoPurposeError('Perimeter purpose must be a non-empty string.');
 * }
 */
export default function NoPurposeError(message) {
  this.name = 'NoPurposeError';
  this.message = message || 'Perimeter must have a valid purpose.';
  // Ensure the stack trace is captured
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error(this.message)).stack;
  }
}

NoPurposeError.prototype = Object.create(Error.prototype);
NoPurposeError.prototype.constructor = NoPurposeError;
