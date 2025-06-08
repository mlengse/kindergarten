import isObject from 'lodash/isObject';

import isObject from 'lodash/isObject';

import Perimeter from '../Perimeter';

/**
 * Checks if a given object is an instance of {@link Perimeter}.
 *
 * @param {*} obj - The object to check.
 * @return {boolean} True if the object is a Perimeter instance, false otherwise.
 *
 * @example
 * import { Perimeter } from 'kindergarten';
 * import { isPerimeter } from 'kindergarten/utils'; // Assuming direct import path
 *
 * const perimeter = new Perimeter({ purpose: 'test' });
 * const notAPerimeter = { name: 'test' };
 *
 * console.log(isPerimeter(perimeter)); // => true
 * console.log(isPerimeter(notAPerimeter)); // => false
 * console.log(isPerimeter(null)); // => false
 */
const isPerimeter = (obj) =>
  isObject(obj) && obj instanceof Perimeter;

export default isPerimeter;
