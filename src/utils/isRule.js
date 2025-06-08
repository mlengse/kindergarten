import isObject from 'lodash/isObject';

import isObject from 'lodash/isObject';

import Rule from '../Rule';

/**
 * Checks if a given object is an instance of {@link Rule}.
 *
 * @param {*} obj - The object to check.
 * @return {boolean} True if the object is a Rule instance, false otherwise.
 *
 * @example
 * import { Rule } from 'kindergarten';
 * import { isRule } from 'kindergarten/utils'; // Assuming direct import path
 *
 * const rule = new Rule('can play', true);
 * const notARule = { name: 'test' };
 *
 * console.log(isRule(rule)); // => true
 * console.log(isRule(notARule)); // => false
 * console.log(isRule(null)); // => false
 */
const isRule = (obj) =>
  isObject(obj) && obj instanceof Rule;

export default isRule;
