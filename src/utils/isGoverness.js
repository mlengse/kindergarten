import isObject from 'lodash/isObject';

import isObject from 'lodash/isObject';

import { HeadGoverness } from '../governesses';

/**
 * Checks if a given object is an instance of {@link HeadGoverness} (or its subclasses).
 *
 * @param {*} obj - The object to check.
 * @return {boolean} True if the object is a Governess instance, false otherwise.
 *
 * @example
 * import { HeadGoverness, EasyGoverness } from 'kindergarten';
 * import { isGoverness } from 'kindergarten/utils'; // Assuming direct import path
 *
 * const governess1 = new HeadGoverness();
 * const governess2 = new EasyGoverness();
 * const notAGoverness = { name: 'test' };
 *
 * console.log(isGoverness(governess1)); // => true
 * console.log(isGoverness(governess2)); // => true
 * console.log(isGoverness(notAGoverness)); // => false
 * console.log(isGoverness(null)); // => false
 */
const isGoverness = (obj) =>
  isObject(obj) && obj instanceof HeadGoverness;

export default isGoverness;
