/**
 * Custom error class indicating that a rule was defined with an invalid or
 * unsupported format.
 *
 * @param {string} message - The error message.
 * @constructor
 * @see Rule
 * @see Definition
 *
 * @example
 * // Inside rule processing logic:
 * if (typeof ruleDefinition === 'number') { // Assuming numbers are not valid rule definitions
 *   throw new WrongRuleDefinition('Rule definition cannot be a number.');
 * }
 */
export default function WrongRuleDefinition(message) {
  this.name = 'WrongRuleDefinition';
  this.message = message;
  // Ensure the stack trace is captured
  if (typeof Error.captureStackTrace === 'function') {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = (new Error(message)).stack;
  }
}

WrongRuleDefinition.prototype = Object.create(Error.prototype);
WrongRuleDefinition.prototype.constructor = WrongRuleDefinition;
