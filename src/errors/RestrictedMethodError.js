/**
 * Custom error class indicating that an attempt was made to use a restricted method name.
 * This typically occurs when trying to expose a method or purpose with a name
 * that is reserved by the Sandbox or its utilities.
 *
 * @param {string} message - The error message.
 * @constructor
 * @see AllowedMethodsService
 *
 * @example
 * if (AllowedMethodsService.isRestricted(methodName)) {
 *   throw new RestrictedMethodError(`Method name "${methodName}" is restricted.`);
 * }
 */
export default function RestrictedMethodError(message) {
  this.name = 'RestrictedMethodError';
  this.message = message;
  // Ensure the stack trace is captured
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error(message)).stack;
  }
}

RestrictedMethodError.prototype = Object.create(Error.prototype);
RestrictedMethodError.prototype.constructor = RestrictedMethodError;
