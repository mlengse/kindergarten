/**
 * Custom error class indicating that a function or constructor was called with an invalid argument.
 *
 * @param {string} message - The error message.
 * @constructor
 *
 * @example
 * if (typeof options !== 'object' || options === null) {
 *   throw new ArgumentError('Options must be an object.');
 * }
 */
export default function ArgumentError(message) {
  this.name = 'ArgumentError';
  this.message = message;
  // Ensure the stack trace is captured
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error(message)).stack;
  }
}

ArgumentError.prototype = Object.create(Error.prototype);
ArgumentError.prototype.constructor = ArgumentError;
