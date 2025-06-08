import isArray from 'lodash/isArray';
import isString from 'lodash/isString';

import AllowedMethodsService from '../utils/AllowedMethodsService';
import {
  WrongRuleDefinition
} from '../errors';

import isArray from 'lodash/isArray';
import isString from 'lodash/isString';

import AllowedMethodsService from '../utils/AllowedMethodsService';
import {
  WrongRuleDefinition
} from '../errors';

// The basic RegEx for validating that rule string is correct.
// It expects "can <action>" or "cannot <action>".
// The action name must be a valid JavaScript identifier.
const TYPE_REGEX = /^can(not)? ([a-z_$][a-zA-Z0-9_$]*)$/i; // Added 'i' for case-insensitivity if desired, though current code implies case-sensitive.

/**
 * Represents the type information of a {@link Rule}, parsed from a rule string
 * like "can read" or "cannot write".
 * It validates the rule string format and extracts the action (e.g., "read")
 * and whether it's a positive ("can") or negative ("cannot") rule.
 *
 * @see Rule
 *
 * @example
 * // Typically instantiated by the Rule class:
 * // const rule = new Rule('can read', true);
 * // const type = rule.type; // Instance of Type
 * // console.log(type.type); // => 'read'
 * // console.log(type.isPositive()); // => true
 *
 * // const rule2 = new Rule('cannot write', ['field1']);
 * // const type2 = rule2.type;
 * // console.log(type2.type); // => 'write'
 * // console.log(type2.isNegative()); // => true
 */
export default class Type {
  /**
   * Creates an instance of Type.
   * @param {Rule} rule - The parent {@link Rule} instance.
   * @param {string} str - The raw rule string (e.g., "can read", "cannot write").
   * @throws {WrongRuleDefinition} If the rule string `str` is invalid or uses a restricted action name.
   */
  constructor(rule, str) {
    const match = isString(str) && str.match(TYPE_REGEX);

    if (!match) {
      throw new WrongRuleDefinition(
        `Invalid rule string format: "${str}". Expected "can <action>" or "cannot <action>".`
      );
    }

    /**
     * @type {string|undefined}
     * @description The extracted action part of the rule (e.g., "read", "write").
     *              Undefined if the rule string is invalid.
     */
    this.type = match[2]; // Group 2 captures the action name

    /**
     * @type {string}
     * @description The raw rule string provided to the constructor.
     */
    this.raw = str;

    /**
     * @type {Rule}
     * @description Reference to the parent Rule instance.
     */
    this.rule = rule;

    // Validate the parsed type (action name)
    this.validate();

    /**
     * @type {boolean}
     * @description True if the rule is positive ("can"), false if negative ("cannot").
     * @private
     */
    // match[1] will be "not" for "cannot" rules, undefined for "can" rules.
    this._isPositive = !match[1];
  }

  /**
   * Validates the extracted rule type (action name).
   * It checks if the type is a string and not a restricted method name.
   * @throws {WrongRuleDefinition} If the type is invalid or restricted.
   * @return {true} If validation passes.
   */
  validate() {
    const allowedMethodsService = new AllowedMethodsService();
    const typeAction = this.type; // The action part, e.g., "read"

    if (!isString(typeAction) || allowedMethodsService.isRestricted(typeAction)) {
      throw new WrongRuleDefinition(
        `Cannot create a rule "${this.raw}". The action type "${typeAction}" is invalid or restricted.`
      );
    }

    return true;
  }

  /**
   * Checks if the rule type is positive (e.g., "can action").
   * @return {boolean} True if the rule is positive, false otherwise.
   */
  isPositive() {
    return this._isPositive;
  }

  /**
   * Checks if the rule type is negative (e.g., "cannot action").
   * This is the logical negation of {@link Type#isPositive}.
   * @return {boolean} True if the rule is negative, false otherwise.
   */
  isNegative() {
    return !this.isPositive();
  }

  /**
   * Checks if the rule's action type matches the given action string.
   * @param {string} action - The action string to compare against (e.g., "read").
   * @return {boolean} True if the rule's action type is the same as the provided action.
   */
  isOfType(action) {
    return this.type === action;
  }
}
