/**
 * Custom error class indicating that an action or access was denied.
 * This error is typically thrown by a {@link Governess} when a rule check fails
 * and an operation is not allowed.
 *
 * @param {string} message - The error message.
 * @constructor
 * @see Governess
 *
 * @example
 * if (!userCanPerformAction) {
 *   throw new AccessDenied('User does not have permission to perform this action.');
 * }
 */
export default function AccessDenied(message) {
  this.name = 'AccessDenied';
  this.message = message;
  // Ensure the stack trace is captured
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error(message)).stack;
  }
}

AccessDenied.prototype = Object.create(Error.prototype);
AccessDenied.prototype.constructor = AccessDenied;
