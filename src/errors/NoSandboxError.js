/**
 * Custom error class indicating that a {@link Sandbox} instance was expected but not found,
 * or an invalid Sandbox was provided. For example, a {@link Perimeter} requires a Sandbox.
 *
 * @param {string} [message='Operation requires a valid Sandbox instance.'] - The error message.
 * @constructor
 * @see Sandbox
 * @see Perimeter
 *
 * @example
 * if (!isSandbox(someVar)) {
 *   throw new NoSandboxError('A valid Sandbox instance is required for this perimeter.');
 * }
 */
export default function NoSandboxError(message) {
  this.name = 'NoSandboxError';
  this.message = message || 'Operation requires a valid Sandbox instance.';
  // Ensure the stack trace is captured
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error(this.message)).stack;
  }
}

NoSandboxError.prototype = Object.create(Error.prototype);
NoSandboxError.prototype.constructor = NoSandboxError;
