import each from 'lodash/each';
import isEmpty from 'lodash/isEmpty';
import isFunction from 'lodash/isFunction';
import isString from 'lodash/isString';

import AllowedMethodsService from './utils/AllowedMethodsService';
import Logger from './Logger';
import {
  isPerimeter,
  isSandbox
} from './utils';
import {
  ArgumentError,
  NoExposedMethodError,
  RestrictedMethodError
} from './errors';

/**
 * Defines the Purpose class.
 *
 * A Purpose acts as a bridge between a Sandbox and a Perimeter.
 * When a Perimeter is added to a Sandbox, a new Purpose is created.
 * All methods exposed by the Perimeter are copied to this Purpose.
 * It's designed to have a minimal set of methods.
 * This class is used internally by {@link Sandbox} and typically not instantiated directly by consumers.
 *
 * @see Sandbox
 * @see Perimeter
 *
 * @example
 * // Purpose is used internally by Sandbox and usually not instantiated directly.
 */
export default class Purpose {
  /**
   * Creates a new instance of Purpose.
   * @param {string} name - The name of the purpose.
   * @param {Sandbox} sandbox - The sandbox instance associated with this purpose.
   * @throws {ArgumentError} If the name is not a string or if the sandbox is not a valid Sandbox instance.
   */
  constructor(name, sandbox) {
    this._name = name;
    this._sandbox = sandbox;
 * Purpose is a connection between Sandbox and Perimeter.
 * Whenever a Perimeter is added to a Sandbox new Purpose is created.
 * And all exposed methods from Perimeter and copied to Purpose.
 * Purpose should have as less methods as possible.
 * Purpose is used internally by Sandbox and shouldn't be used as standalone
 * object.
 */
export default class Purpose {
  /**
   * Create new instance of purpose.
   */
  constructor(name, sandbox) {
    this._name = name;
    this._sandbox = sandbox;

    if (!isString(this._name)) {
      throw new ArgumentError(
        'Purpose must have a name.'
      );
    }

    if (!isSandbox(this._sandbox)) {
      throw new ArgumentError(
        'Purpose must have a sandbox.'
      );
    }
  }

  /**
   * Loads a perimeter and copies all its exposed methods into this purpose.
   * This method is used internally by {@link Sandbox} and should not be called externally.
   * @param {Perimeter} perimeter - The perimeter to load.
   * @throws {ArgumentError} If the provided perimeter is not a valid Perimeter instance.
   * @throws {RestrictedMethodError} If an exposed method name is restricted.
   * @throws {NoExposedMethodError} If an exposed method is not defined on the perimeter.
   * @private
   */
  _loadPerimeter(perimeter) {
    if (!isPerimeter(perimeter)) {
      throw new ArgumentError(
        'Cannot load perimeter. Is it an instance of perimeter?'
      );
    }

    const exposedMethods = perimeter.expose;
    const allowedMethodsService = new AllowedMethodsService(this, false);

    if (isEmpty(exposedMethods)) return;

    each(exposedMethods, (exposedMethod) => {
      if (allowedMethodsService.isRestricted(exposedMethod)) {
        throw new RestrictedMethodError(
          `Cannot create a method ${exposedMethods}. It is restricted.`
        );
      }

      if (isFunction(this[exposedMethod])) {
        Logger.warn(`Overriding already sandboxed method ${this._name}.${exposedMethod}.`);
      }

      if (!isFunction(perimeter[exposedMethod])) {
        throw new NoExposedMethodError(
          `The exposed method ${exposedMethod} is not defined on perimeter ${perimeter.purpose}.`
        );
      }

      // Call the method in context of perimeter and governed by a governess
      this[exposedMethod] = (...args) => perimeter.governed(
        perimeter[exposedMethod],
        args,
        perimeter
      );
    });
  }

  /**
   * Checks if the perimeter is allowed to perform an action.
   * It uses the governess of the associated perimeter.
   * @param {...*} args - Arguments to pass to the governess's `isAllowed` method.
   * @return {boolean} True if the action is allowed, false otherwise.
   * @see Governess#isAllowed
   */
  isAllowed(...args) {
    const perimeter = this._sandbox.getPerimeter(this._name);

    return perimeter.hasOwnGoverness() ?
      perimeter.isAllowed(...args) :
      perimeter.purposeGoverness.isAllowed(...args);
  }

  /**
   * Checks if the perimeter is not allowed to perform an action.
   * It uses the governess of the associated perimeter.
   * @param {...*} args - Arguments to pass to the governess's `isAllowed` method.
   * @return {boolean} True if the action is not allowed, false otherwise.
   * @see Governess#isNotAllowed
   */
  isNotAllowed(...args) {
    return !this.isAllowed(...args);
  }

  /**
   * Forwards the guard call to the governess of the associated perimeter.
   * @param {...*} args - Arguments to pass to the governess's `guard` method.
   * @return {*} The result of the governess's `guard` method.
   * @see Governess#guard
   */
  guard(...args) {
    const perimeter = this._sandbox.getPerimeter(this._name);

    return perimeter.hasOwnGoverness() ?
      perimeter.guard(...args) :
      perimeter.purposeGoverness.guard(...args);
  }
}
