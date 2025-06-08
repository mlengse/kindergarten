/**
 * Custom error class indicating that a method expected to be exposed by a {@link Perimeter}
 * (and thus available on a {@link Purpose}) was not found or is not a function.
 *
 * @param {string} message - The error message.
 * @constructor
 * @see Perimeter
 * @see Purpose
 *
 * @example
 * // Inside a Perimeter's _loadPerimeter method or similar logic:
 * if (typeof perimeter[exposedMethodName] !== 'function') {
 *   throw new NoExposedMethodError(
 *     `Method '${exposedMethodName}' is listed in 'expose' but not found on the perimeter.`
 *   );
 * }
 */
export default function NoExposedMethodError(message) {
  this.name = 'NoExposedMethodError';
  this.message = message;
  // Ensure the stack trace is captured
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error(message)).stack;
  }
}

NoExposedMethodError.prototype = Object.create(Error.prototype);
NoExposedMethodError.prototype.constructor = NoExposedMethodError;
