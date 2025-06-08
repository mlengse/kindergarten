/**
 * Custom error class indicating that a {@link Governess} instance was expected but not found,
 * or an invalid Governess was provided.
 *
 * @param {string} [message='Governess must be a valid Governess instance.'] - The error message.
 * @constructor
 * @see Governess
 * @see Sandbox
 * @see Perimeter
 *
 * @example
 * if (!isGoverness(someVar)) {
 *   throw new NoGovernessError('A valid Governess instance is required.');
 * }
 */
export default function NoGovernessError(message) {
  this.name = 'NoGovernessError';
  this.message = message || 'Governess must be a valid Governess instance.';
  // Ensure the stack trace is captured
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error(this.message)).stack;
  }
}

NoGovernessError.prototype = Object.create(Error.prototype);
NoGovernessError.prototype.constructor = NoGovernessError;
