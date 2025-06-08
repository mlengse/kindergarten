import find from 'lodash/find';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import isRegExp from 'lodash/isRegExp';
import memoize from 'lodash/memoize';

import {
  WrongRuleDefinition
} from '../errors';

import find from 'lodash/find';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import isRegExp from 'lodash/isRegExp';
import memoize from 'lodash/memoize';

import {
  WrongRuleDefinition
} from '../errors';

/**
 * Represents the definition part of a {@link Rule}.
 * It analyzes the raw rule definition provided (e.g., an array, a RegExp, a function)
 * to determine its type and characteristics, such as whether it implies strict checking.
 *
 * @see Rule
 *
 * @example
 * // Typically instantiated by the Rule class:
 * // const rule = new Rule('can read', ['book1', 'book2']);
 * // const definition = rule.definition; // Instance of Definition
 * // console.log(definition.type); // => 'items'
 * // console.log(definition.isStrict()); // => false (for 'can' rule with items)
 *
 * // const rule2 = new Rule('cannot access', /^\/admin/);
 * // const definition2 = rule2.definition;
 * // console.log(definition2.type); // => 'regex'
 * // console.log(definition2.isStrict()); // => true (for 'cannot' rule)
 */
export default class Definition {
  /**
   * Creates an instance of Definition.
   * @param {Rule} rule - The parent {@link Rule} instance.
   * @param {*} def - The raw rule definition (e.g., array, RegExp, function).
   * @throws {WrongRuleDefinition} If the provided definition `def` does not match any known type.
   */
  constructor(rule, def) {
    /**
     * @type {Array<Array<string, Function, boolean>>}
     * @description Defines the possible types of rule definitions. Each inner array contains:
     *   - `name` {string}: The name of the definition type (e.g., 'items', 'regex').
     *   - `condition` {Function}: A function that takes the raw definition and returns true if it matches this type.
     *   - `isStrictByDefault` {boolean}: Whether this definition type is considered strict by default (for positive rules).
     * @private
     */
    this.TYPES = [
      [
        'items',
        (ruleDef) => isArray(ruleDef) && !isEmpty(ruleDef),
        false // 'items' type is not inherently strict for 'can' rules
      ],
      [
        'regex',
        (ruleDef) => isRegExp(ruleDef),
        true  // 'regex' type is inherently strict for 'can' rules
      ],
      [
        'customMethod',
        (ruleDef) => isFunction(ruleDef),
        true  // 'customMethod' type is inherently strict for 'can' rules
      ]
    ];

    /**
     * @type {Rule}
     * @description The parent Rule instance.
     */
    this.rule = rule;

    /**
     * @type {*}
     * @description The raw rule definition provided to the constructor.
     */
    this.raw = def;

    this._resolve();
  }

  /**
   * Determines if the rule definition implies strict checking.
   * A definition is strict if:
   * - The rule type is negative (e.g., 'cannot').
   * - Or, the definition type itself is inherently strict (e.g., RegExp, custom function for 'can' rules).
   * @return {boolean} True if the definition is strict, false otherwise.
   */
  isStrict() {
    return this.rule.type.isNegative() || this._isStrictByDefault(this.type);
  }

  /**
   * Resolves the raw rule definition to determine its type and assign it.
   * It finds the matching type from `this.TYPES` and sets `this.type` and
   * a property named after the type (e.g., `this.items`, `this.regex`) to the raw definition.
   * It also captures `ruleContext` if the definition is a function with that property.
   * @throws {WrongRuleDefinition} If the definition doesn't match any known type.
   * @private
   */
  _resolve() {
    const definitionObj = find(this.TYPES, (typeConfig) => {
      const condition = typeConfig[1];
      return condition(this.raw);
    });

    if (!definitionObj || !isArray(definitionObj)) {
      throw new WrongRuleDefinition(
        `Cannot create a new rule "${this.rule.type.raw}". Wrong rule definition provided: ${this.raw}`
      );
    }

    /**
     * @type {string}
     * @description The determined type of the rule definition (e.g., 'items', 'regex', 'customMethod').
     */
    this.type = definitionObj[0];

    // Dynamically assign the raw definition to a property named after its type.
    // e.g., if type is 'items', this.items = this.raw
    this[this.type] = this.raw;

    // If the definition is a function and has a ruleContext property, store it.
    if (isFunction(this.raw) && this.raw.ruleContext) {
      /**
       * @type {Object|undefined}
       * @description The context in which a customMethod rule definition should be executed.
       *              This is typically set on the function definition itself.
       */
      this.ruleContext = this.raw.ruleContext;
    }
  }
}

/**
 * Memoized helper function to check if a definition type is strict by default.
 * @param {string} type - The definition type name (e.g., 'items', 'regex').
 * @return {boolean} True if the type is inherently strict, false otherwise.
 * @private
 */
Definition.prototype._isStrictByDefault = memoize(function (type) {
  // `this` inside memoized function refers to Definition.prototype, so this.TYPES is available.
  const typeConfig = find(this.TYPES, (t) => type === t[0]);
  return (typeConfig && typeConfig[2]) || false;
});
