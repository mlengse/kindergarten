import isObject from 'lodash/isObject';

import isObject from 'lodash/isObject';

import Purpose from '../Purpose';

/**
 * Checks if a given object is an instance of {@link Purpose}.
 *
 * @param {*} obj - The object to check.
 * @return {boolean} True if the object is a Purpose instance, false otherwise.
 *
 * @example
 * import { Purpose, Sandbox } from 'kindergarten';
 * import { isPurpose } from 'kindergarten/utils'; // Assuming direct import path
 *
 * const sandbox = new Sandbox(); // Purpose requires a sandbox and name
 * const purpose = new Purpose('testPurpose', sandbox);
 * const notAPurpose = { name: 'test' };
 *
 * console.log(isPurpose(purpose)); // => true
 * console.log(isPurpose(notAPurpose)); // => false
 * console.log(isPurpose(null)); // => false
 */
const isPurpose = (obj) =>
  isObject(obj) && obj instanceof Purpose;

export default isPurpose;
