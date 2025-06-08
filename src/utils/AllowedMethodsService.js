import includes from 'lodash/includes';
import isString from 'lodash/isString';
import keys from 'lodash/keys';

import includes from 'lodash/includes';
import isString from 'lodash/isString';
import keys from 'lodash/keys';

// Regular expression for a valid JavaScript identifier.
const METHOD_NAME_REGEX = /^[a-z_$][a-zA-Z0-9_$]*$/i; // Added 'i' for case-insensitivity, adjust if names are strictly case-sensitive.

/**
 * Service class to determine if a method name is safe to be added to an object.
 * It checks against existing properties of a `dummyObj` (representing the object
 * to be extended), JavaScript reserved words, and a custom list of unsafe names.
 * This is used, for example, by {@link Sandbox} to ensure that a {@link Perimeter}'s
 * purpose name doesn't conflict with existing Sandbox properties or JavaScript internals.
 *
 * @example
 * const service = new AllowedMethodsService(mySandboxInstance);
 * if (service.isRestricted('toString')) {
 *   console.log('Cannot use "toString" as a purpose name.'); // true
 * }
 * if (service.isRestricted('myCustomPurpose')) {
 *   console.log('Cannot use "myCustomPurpose".'); // false, if not conflicting
 * }
 */
export default class AllowedMethodsService {
  /**
   * Creates an instance of AllowedMethodsService.
   * @param {Object} [dummyObj={}] - An object instance whose existing properties
   *   will be considered restricted. This is typically the object that methods/properties
   *   might be added to.
   * @param {boolean} [isStrict=true] - If true, the list of restricted methods from `dummyObj`
   *   is re-evaluated on each call to `isRestricted`. If false, the list is captured
   *   only at construction time. Strict mode is safer if `dummyObj` can change after construction.
   */
  constructor(dummyObj = {}, isStrict = true) {
    /**
     * @type {Object}
     * @description The object whose properties are checked against.
     */
    this.dummyObj = dummyObj || {};
    /**
     * @type {boolean}
     * @description Whether to re-evaluate restricted methods from `dummyObj` on each check.
     */
    this.isStrict = isStrict;
    /**
     * @type {Array<string>}
     * @description Initial list of restricted methods from `dummyObj` at construction time.
     * @private
     */
    this._initRestricted = this._getRestrictedMethodsFromDummy();
  }

  /**
   * Checks if a given method name is restricted.
   * A name is restricted if:
   * - It's not a string.
   * - It doesn't match the valid JavaScript identifier regex.
   * - It's present in the list of properties from `dummyObj` (either initial or current, based on `isStrict`).
   * - It's in the custom unsafe list (e.g., 'constructor').
   * - It's a JavaScript reserved word.
   *
   * @param {string} methodName - The method name to check.
   * @return {boolean} True if the method name is restricted, false otherwise.
   */
  isRestricted(methodName) {
    if (!isString(methodName) || !METHOD_NAME_REGEX.test(methodName)) {
      return true; // Not a string or invalid identifier format
    }

    const currentRestrictedFromDummy = this.isStrict ?
      this._getRestrictedMethodsFromDummy() :
      this._initRestricted;

    return includes(currentRestrictedFromDummy, methodName) ||
           includes(this._getCustomUnsafeList(), methodName) ||
           includes(this._getReservedWords(), methodName);
  }

  /**
   * Retrieves the list of property keys from the `dummyObj`.
   * @return {Array<string>} An array of property names.
   * @private
   */
  _getRestrictedMethodsFromDummy() {
    return keys(this.dummyObj);
  }

  /**
   * Returns a list of JavaScript reserved words.
   * @return {Array<string>} An array of reserved words.
   * @private
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#Reserved_keywords_as_of_ECMAScript_2015}
   */
  _getReservedWords() {
    // List might need updates based on JS versions, but this covers common ones.
    return [
      'abstract', 'arguments', 'await', 'boolean', 'break', 'byte',
      'case', 'catch', 'char', 'class', 'const', 'continue',
      'debugger', 'default', 'delete', 'do', 'double', 'else',
      'enum', 'eval', 'export', 'extends', 'false', 'final',
      'finally', 'float', 'for', 'function', 'goto', 'if',
      'implements', 'import', 'in', 'instanceof', 'int', 'interface',
      'let', 'long', 'native', 'new', 'null', 'package',
      'private', 'protected', 'public', 'return', 'short', 'static',
      'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
      'transient', 'true', 'try', 'typeof', 'var', 'void',
      'volatile', 'while', 'with', 'yield'
      // Keywords from newer ECMAScript versions might be missing if critical.
    ];
  }

  /**
   * Returns a custom list of method names considered unsafe or problematic.
   * @return {Array<string>} An array of custom unsafe method names.
   * @private
   */
  _getCustomUnsafeList() {
    return [
      'constructor', // Often problematic if overwritten
      // '__proto__', // Accessing __proto__ directly is generally discouraged
      'prototype',   // Modifying prototype of objects directly can be risky
      'hasOwnProperty', // Standard Object method
      'isPrototypeOf',
      'propertyIsEnumerable',
      'toLocaleString',
      'toString',
      'valueOf'
      // Consider other Object.prototype methods if they pose a risk in the context of use.
    ];
  }
}
