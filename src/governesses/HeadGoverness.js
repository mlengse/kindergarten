import each from 'lodash/each';
import filter from 'lodash/filter';
import forIn from 'lodash/forIn';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import some from 'lodash/some';

import Rule from '../Rule';
import isRule from '../utils/isRule';
import {
  AccessDenied,
  ArgumentError
} from '../errors';

import each from 'lodash/each';
import filter from 'lodash/filter';
import forIn from 'lodash/forIn';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';
import some from 'lodash/some';

import Rule from '../Rule';
import isRule from '../utils/isRule';
import {
  AccessDenied,
  ArgumentError
} from '../errors';

/**
 * The base class for all Governess types.
 * A Governess is responsible for learning rules and enforcing them.
 * It determines whether actions are allowed or denied based on the learned rules.
 *
 * @example
 * const headGoverness = new HeadGoverness();
 * const sandbox = new Sandbox(childObject, { governess: headGoverness });
 * const perimeter = new Perimeter({
 *   purpose: 'playground',
 *   govern: { 'can play': true, 'cannot run': 'too slippery' }
 * });
 * headGoverness.learnRules(perimeter);
 *
 * sandbox.guard('play'); // OK
 * sandbox.guard('run', 'too slippery'); // Throws AccessDenied
 */
export default class HeadGoverness {
  /**
   * Creates a new instance of HeadGoverness.
   * Initializes an empty array for rules.
   */
  constructor() {
    /**
     * @type {Array<Rule>}
     * @description Stores all the rules learned by this governess.
     */
    this.rules = [];
    this._unguarded = false; // Default to guarded
  }

  /**
   * Checks if an action is allowed. If not, it throws an {@link AccessDenied} error.
   * If the governess is `unguarded`, this check is bypassed.
   *
   * @param {string} action - The action to check (e.g., 'read', 'write').
   * @param {...*} args - Additional arguments passed to the rule verification logic.
   *   The first of these arguments is often considered the "target" of the action.
   * @return {*} The first argument (`args[0]`), typically the target, if the action is allowed.
   * @throws {AccessDenied} If the action is not allowed.
   *
   * @example
   * governess.guard('edit', document);
   */
  guard(action, ...args) {
    const target = args[0];

    if (this.isAllowed(action, ...args)) {
      return target;
    }

    throw new AccessDenied(
      `Child is not allowed to ${action} ${isString(target) ? target : 'the target'}.`
    );
  }

  /**
   * Executes a callback function within a given context, applying provided arguments.
   * This method is intended to be overridden by more specialized governesses (like {@link GermanGoverness})
   * to inject additional checks (e.g., calling `guard`) before executing the callback.
   * The base implementation simply executes the callback.
   *
   * @param {Function} callback - The function to execute.
   * @param {Array<*>} [args=[]] - Arguments to apply to the callback.
   * @param {Object|null} [callingContext=null] - The context (`this`) in which to execute the callback.
   * @return {*} The result of the callback execution.
   *
   * @example
   * const myMethod = function(val) { return `Called with ${val} in context ${this.name}`; };
   * governess.governed(myMethod, ['test'], { name: 'MyContext' });
   * // => "Called with test in context MyContext"
   */
  governed(callback, args = [], callingContext = null) {
    return callback.apply(callingContext, args);
  }

  /**
   * Determines if an action is allowed based on the learned rules.
   * If the governess is `unguarded` ({@link HeadGoverness#isUnguarded}), it always returns true.
   * Otherwise, it checks if there's at least one positive rule allowing the action
   * AND no strict disallowing rules are met.
   *
   * @param {string} action - The action to check.
   * @param {...*} args - Arguments passed to the rule verification logic.
   * @return {boolean} True if the action is allowed, false otherwise.
   *
   * @example
   * if (governess.isAllowed('view', page)) {
   *   // show page
   * }
   */
  isAllowed(action, ...args) {
    if (this.isUnguarded()) { // If unguarded, always allow.
      return true;
    }

    // If guarded, proceed with rule checking.
    const allowRules = [];
    const strictDisallowRules = [];

    each(this.getRules(action), (rule) => {
      if (isRule(rule)) { // Ensure it's a valid Rule object
        const verificationResult = rule.verify(...args);

        // Is there any rule explicitly allowing the child to do that?
        if (rule.type.isPositive() && verificationResult) {
          allowRules.push(rule);
        }

        // Is there any rule strictly disallowing the child to do that?
        // A rule is strictly disallowing if its type is negative (e.g. 'cannot')
        // AND its verification result is true (meaning the 'cannot' condition is met).
        // Or, if it's a positive rule (e.g. 'can') that is defined as strict
        // AND its verification fails.
        // The original code `!verificationResult && rule.definition.isStrict` seems to target
        // a positive rule that is strict and fails.
        // A 'cannot' rule that is met (verificationResult is true) should also be a strict disallow.
        if (rule.type.isNegative() && verificationResult) {
          strictDisallowRules.push(rule);
        } else if (rule.type.isPositive() && rule.definition.isStrict && !verificationResult) {
          // This covers 'can' rule that is strict and fails verification
          strictDisallowRules.push(rule);
        }
      }
    });

    // Action is allowed if there's at least one allowRule AND no strictDisallowRules.
    return !isEmpty(allowRules) && isEmpty(strictDisallowRules);
  }

  /**
   * Determines if an action is not allowed.
   * This is the logical negation of {@link HeadGoverness#isAllowed}.
   *
   * @param {...*} args - Arguments passed to `isAllowed`. The first is typically the action name.
   * @return {boolean} True if the action is not allowed, false otherwise.
   *
   * @example
   * if (governess.isNotAllowed('delete', record)) {
   *  // show error
   * }
   */
  isNotAllowed(...args) {
    return !this.isAllowed(...args);
  }

  /**
   * Gets the `unguarded` status of the governess.
   * If true, `guard` checks are bypassed.
   * @type {boolean}
   */
  get unguarded() {
    return !!this._unguarded;
  }

  /**
   * Sets the `unguarded` status of the governess.
   * @param {boolean} value - True to make the governess unguarded, false to make it guarded.
   */
  set unguarded(value) {
    this._unguarded = !!value;
  }

  /**
   * Retrieves rules, optionally filtered by action type.
   * @param {string} [action] - The action type (e.g., 'read', 'write') to filter rules by.
   *                            If not provided, all rules are returned.
   * @return {Array<Rule>} An array of matching rules.
   *
   * @example
   * const readRules = governess.getRules('read');
   * const allRules = governess.getRules();
   */
  getRules(action) {
    return action ?
      filter(this.rules, (rule) => rule.type.isOfType(action)) :
      this.rules;
  }

  /**
   * Teaches the governess rules from a given {@link Perimeter}.
   * It iterates over the `govern` object of the perimeter, creates {@link Rule} instances,
   * and adds them if they haven't been learned already from the same perimeter.
   *
   * @param {Perimeter} perimeter - The perimeter from which to learn rules.
   * @return {number} The number of new rules learned from this perimeter.
   *
   * @example
   * governess.learnRules(myPerimeter);
   */
  learnRules(perimeter) {
    const governObj = perimeter.govern || {};
    let keys = 0;

    forIn(governObj, (val, key) => {
      // It's good practice to check hasOwnProperty for for...in loops
      if (Object.prototype.hasOwnProperty.call(governObj, key)) {
        const ruleDef = governObj[key];

        // function rules must be called in context of perimeter to have access
        // to `this.child` (if perimeter has a child)
        if (isFunction(ruleDef)) {
          // Ensure ruleContext is set, defaults to the perimeter itself.
          ruleDef.ruleContext = ruleDef.ruleContext || perimeter;
        }

        const rule = new Rule(
          key, ruleDef
        );
        // Associate the rule with the perimeter it came from.
        // This is used by `hasRule` to differentiate rules with the same name from different perimeters.
        rule._perimeter = perimeter;

        if (!this.hasRule(perimeter, rule)) {
          this.addRule(rule);
          keys++;
        }
      }
    });

    return keys;
  }

  /**
   * Adds one or more rules to the governess.
   * @param {...Rule} rules - The {@link Rule} instances to add.
   * @return {number} The number of rules successfully added.
   * @throws {ArgumentError} If any of the provided arguments is not a {@link Rule} instance.
   *
   * @example
   * const rule1 = new Rule('can fly', true);
   * const rule2 = new Rule('cannot swim', 'no water wings');
   * governess.addRule(rule1, rule2);
   */
  addRule(...rules) {
    let counter = 0;

    each(rules, (rule) => {
      if (!isRule(rule)) {
        throw new ArgumentError(
          'Governess cannot learn the rule. Does it inherit from Rule class?'
        );
      }

      ++counter;
      this.rules.push(rule);
    });

    return counter;
  }

  /**
   * Checks if the governess has already learned a specific rule from a specific perimeter.
   * This prevents adding duplicate rules from the same perimeter.
   *
   * @param {Perimeter} perimeter - The perimeter the rule originated from.
   * @param {Rule} rule - The rule to check.
   * @return {boolean} True if the rule from that perimeter has already been learned, false otherwise.
   * @private // Should this be private? It's used by learnRules.
   */
  hasRule(perimeter, rule) {
    return some(this.rules, (r) => r.type.raw === rule.type.raw && r._perimeter === perimeter);
  }

  /**
   * Checks if the governess has learned any rules.
   * @return {boolean} True if there are any rules, false otherwise.
   *
   * @example
   * if (governess.hasAnyRules()) {
   *   // Governess is configured
   * }
   */
  hasAnyRules() {
    return !isEmpty(this.rules);
  }

  /**
   * Executes a callback function in an unguarded state, then restores the previous state.
   * This is useful for performing actions that should temporarily bypass `guard` checks.
   *
   * @param {Function} callback - The function to execute.
   * @param {Object|null} [context=null] - The context (`this`) in which to execute the callback.
   * @return {*} The result of the callback execution, or undefined if callback is not a function.
   *
   * @example
   * governess.doUnguarded(() => {
   *   // Perform some administrative task that should not be guarded
   *   sensitiveOperation();
   * });
   */
  doUnguarded(callback, context) {
    let returnValue;

    context = context || null; // Default context to null if not provided

    if (isFunction(callback)) {
      const previousUnguardedState = this.unguarded;
      this.unguarded = true;
      try {
        returnValue = callback.apply(context);
      } finally {
        this.unguarded = previousUnguardedState;
      }
    }

    return returnValue;
  }

  /**
   * Checks if the governess is currently in an unguarded state.
   * @return {boolean} True if unguarded, false otherwise.
   * @see HeadGoverness#unguarded
   */
  isUnguarded() {
    return this.unguarded;
  }

  /**
   * Checks if the governess is currently in a guarded state.
   * This is the logical negation of {@link HeadGoverness#isUnguarded}.
   * @return {boolean} True if guarded, false otherwise.
   */
  isGuarded() {
    return !this.isUnguarded();
  }
}
