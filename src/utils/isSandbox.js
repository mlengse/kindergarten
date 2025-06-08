import isObject from 'lodash/isObject';

import isObject from 'lodash/isObject';

import Sandbox from '../Sandbox';

/**
 * Checks if a given object is an instance of {@link Sandbox}.
 *
 * @param {*} obj - The object to check.
 * @return {boolean} True if the object is a Sandbox instance, false otherwise.
 *
 * @example
 * import { Sandbox } from 'kindergarten';
 * import { isSandbox } from 'kindergarten/utils'; // Assuming direct import path
 *
 * const sandbox = new Sandbox({});
 * const notASandbox = { name: 'test' };
 *
 * console.log(isSandbox(sandbox)); // => true
 * console.log(isSandbox(notASandbox)); // => false
 * console.log(isSandbox(null)); // => false
 */
const isSandbox = (obj) =>
  isObject(obj) && obj instanceof Sandbox;

export default isSandbox;
