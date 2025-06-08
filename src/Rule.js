import some from 'lodash/some';
import upperFirst from 'lodash/upperFirst';

import {
  Definition,
  Type
} from './rules';

/**
 * Defines a Rule that can be learned and enforced by a {@link Governess}.
 * Rules are typically defined within a {@link Perimeter}.
 *
 * @example
 * // 'can play': true
 * const rule1 = new Rule('can play', true);
 *
 * // 'cannot run': ['slippery floor']
 * const rule2 = new Rule('cannot run', ['slippery floor']);
 *
 * // 'can access': /^\/admin\//
 * const rule3 = new Rule('can access', /^\/admin\//);
 *
 * // 'can edit': (user, resource) => user.hasPermission(resource, 'edit')
 * const rule4 = new Rule('can edit', (user, resource) => {
 *   return user.hasPermission(resource, 'edit');
 * });
 */
export default class Rule {
  /**
   * Creates a new Rule instance.
   * @param {string} str - The string representation of the rule (e.g., 'can read', 'cannot write').
   * @param {*} def - The definition of the rule. This can be a boolean, an array, a RegExp, or a custom function.
   */
  constructor(str, def) {
    this.type = new Type(this, str);
    this.definition = new Definition(this, def);
  }

  /**
   * Verifies if the given arguments satisfy this rule.
   * The verification logic depends on the type of the rule definition.
   * @param {...*} args - Arguments to verify against the rule.
   * @return {boolean} True if the rule is satisfied, false otherwise.
   */
  verify(...args) {
    const verifyMethodName = `_verify${upperFirst(this.definition.type)}`;

    const result = this[verifyMethodName](...args);

    return this.type.isPositive() ?
      result : !result;
  }

  /**
   * Verifies if the subject matches any of the items in the rule definition.
   * Used when the rule definition is an array.
   * @param {*} subject - The subject to verify.
   * @param {...*} args - Additional arguments (currently ignored by this verification type).
   * @return {boolean} True if the subject matches any item, false otherwise.
   * @private
   */
  _verifyItems(...args) {
    const subject = args[0];

    return some(this.definition.items, (item) => {
      let isInstance = false;

      try {
        isInstance = subject instanceof item;
      } catch (ignore) {
        // Ignore if instanceof is not applicable
      }

      return isInstance || item === subject;
    });
  }

  /**
   * Verifies if the subject matches the regular expression in the rule definition.
   * Used when the rule definition is a RegExp.
   * @param {string} subject - The subject string to verify.
   * @param {...*} args - Additional arguments (currently ignored by this verification type).
   * @return {boolean} True if the subject matches the regex, false otherwise.
   * @private
   */
  _verifyRegex(...args) {
    const subject = args[0];

    return this.definition.regex.test(subject);
  }

  /**
   * Verifies by calling the custom method in the rule definition.
   * Used when the rule definition is a function.
   * @param {...*} args - Arguments to pass to the custom verification method.
   * @return {boolean} The result of the custom verification method.
   * @private
   */
  _verifyCustomMethod(...args) {
    const definition = this.definition;

    return definition.customMethod.apply(definition.ruleContext, args);
  }
}
