import find from 'lodash/find';

import HeadGoverness from './HeadGoverness';
import { isPerimeter } from '../utils';

import find from 'lodash/find';

import HeadGoverness from './HeadGoverness';
import { isPerimeter } from '../utils';

/**
 * Represents a governess that enforces rules strictly by automatically guarding
 * all exposed methods of a {@link Perimeter}.
 * When an exposed method is called, this governess first calls its own `guard` method,
 * using the name of the exposed method as the action to check.
 *
 * @extends HeadGoverness
 *
 * @example
 * const germanGoverness = new GermanGoverness();
 * const perimeter = new Perimeter({
 *   purpose: 'restrictedActions',
 *   governess: germanGoverness,
 *   expose: ['doSecretTask'],
 *   govern: {
 *     'can doSecretTask': false // or a function (user) => user.isAdmin
 *   },
 *   doSecretTask() {
 *     return 'Secret task done.';
 *   }
 * });
 * const sandbox = new Sandbox({}, { perimeters: [perimeter] });
 *
 * // This will automatically call perimeter.governess.guard('doSecretTask', ...args)
 * // before executing doSecretTask.
 * sandbox.restrictedActions.doSecretTask(); // Throws AccessDenied if 'can doSecretTask' is false
 */
export default class GermanGoverness extends HeadGoverness {
  /**
   * Overrides the `governed` method from {@link HeadGoverness}.
   * Before executing the callback (the exposed method), this method automatically
   * calls `this.guard()` with the detected name of the exposed method and its arguments.
   *
   * @param {Function} callback - The original method to be executed (an exposed method from a Perimeter).
   * @param {Array<*>} [args=[]] - The arguments passed to the original method.
   * @param {Perimeter|null} [callingContext=null] - The perimeter instance from which the method is called.
   * @return {*} The result of the original callback execution.
   * @throws {Error} If the `callingContext` is not a Perimeter, as this governess
   *   relies on the perimeter to detect the exposed method name.
   * @throws {AccessDenied} If the guard check fails.
   */
  governed(callback, args = [], callingContext = null) {
    // Original arguments are used for guard, so we need to clone or be careful if `unshift` modifies in place
    // and HeadGoverness.prototype.governed expects original args.
    // For simplicity, assuming HeadGoverness.prototype.governed can handle the modified args array
    // or that the modification is acceptable. A safer approach might be to clone args for guardArgs.
    const guardArgs = [...args]; // Clone args to avoid modification issues

    const exposedMethodName = this._detectNameOfExposedMethod(
      callingContext,
      callback
    );

    guardArgs.unshift(exposedMethodName);

    // Call the guard method on each exposed method
    this.guard.apply(
      this,
      guardArgs
    );

    // Call the original governed method with the original (or potentially modified) args
    // and original callback.
    return HeadGoverness.prototype.governed.call(this, callback, args, callingContext);
  }

  /**
   * Detects the name of an exposed method on a perimeter.
   * This is used to automatically determine the action name for the `guard` call.
   *
   * @param {Perimeter} perimeter - The perimeter to search for the method.
   * @param {Function} method - The method function itself.
   * @return {string|undefined} The name of the exposed method, or undefined if not found.
   * @throws {Error} If the provided object is not a Perimeter.
   * @private
   */
  _detectNameOfExposedMethod(perimeter, method) {
    if (isPerimeter(perimeter)) {
      // Ensure perimeter.expose is an array
      const exposed = Array.isArray(perimeter.expose) ? perimeter.expose : [];
      return find(exposed, (m) => perimeter[m] === method);
    }

    throw new Error(
      'GermanGoverness requires the calling context to be a Perimeter to detect exposed method names.'
    );
  }
}
