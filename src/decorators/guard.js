import isString from 'lodash/isString';
import isFunction from 'lodash/isFunction';
import isUndefined from 'lodash/isUndefined';

import {
  isPerimeter,
  isSandbox
} from '../utils';

import {
  AccessDenied
} from '../errors';

/**
 * A method decorator factory that protects methods within a {@link Sandbox} or {@link Perimeter}.
 * It uses the `guard` method of the class instance (either Sandbox or Perimeter)
 * to check for permissions before executing the decorated method.
 *
 * @param {string} [actionName] - The name of the action/rule to check.
 *   If not provided, the name of the decorated method will be used as the action name.
 * @param {Function|*} [accessDeniedCallback] - A function to call or a value to return
 *   if access is denied. If it's a function, it will be called with the same arguments
 *   as the original method. If it's a value, that value will be returned.
 *   If not provided, an {@link AccessDenied} error will be thrown.
 * @return {Function} The method decorator.
 * @throws {Error} If used on a class that is not a Sandbox or Perimeter, or doesn't have a `guard` method.
 *
 * @example
 * import { Sandbox, Perimeter, guard } from 'kindergarten';
 *
 * class MyPerimeter extends Perimeter {
 *   constructor() {
 *     super({ purpose: 'restrictedArea' });
 *     this.governess.learnRules({
 *       'can enter': false,
 *       'can viewData': true,
 *       'can_edit_document': (user, doc) => doc.owner === user.id
 *     });
 *   }
 *
 *   @guard // actionName will be 'guardedMethodExample'
 *   guardedMethodExample() {
 *     return 'You got in!';
 *   }
 *
 *   @guard('enter') // specific actionName
 *   anotherGuardedMethod() {
 *     return 'Entered successfully!';
 *   }
 *
 *   @guard('enter', () => 'Access was denied, returned this instead.')
 *   methodWithCallback() {
 *     return 'This should not be returned if access is denied.';
 *   }
 *
 *   @guard('editDocument') // Will use 'editDocument' as action name
 *   editDocument(user, document) {
 *     // ... logic to edit document
 *     return 'Document updated.';
 *   }
 * }
 *
 * const perimeter = new MyPerimeter();
 * const sandbox = new Sandbox({});
 * sandbox.loadPerimeter(perimeter);
 *
 * sandbox.restrictedArea.guardedMethodExample(); // Throws AccessDenied
 * sandbox.restrictedArea.anotherGuardedMethod(); // Throws AccessDenied
 * sandbox.restrictedArea.methodWithCallback(); // Returns 'Access was denied, returned this instead.'
 *
 * const user1 = { id: 1 };
 * const user2 = { id: 2 };
 * const doc1 = { owner: 1, content: 'Hello' };
 *
 * sandbox.restrictedArea.editDocument(user1, doc1); // Returns 'Document updated.'
 * sandbox.restrictedArea.editDocument(user2, doc1); // Throws AccessDenied
 */
const guard = (...args) => {
  /**
   * @type {string}
   * Name of the action that should be guarded.
   */
  const action = args[0];

  /**
   * @type {boolean}
   * True if the @guard decorator is called with arguments like `@guard('action')` or `@guard()`.
   */
  const isCalled = isString(action) || args.length === 0;

  /**
   * @type {Function|*}
   * Return callback or value that should be returned in case guard method
   * throws `AccessDenied` error.
   */
  let callback;
  if (isCalled) {
    callback = args[1];
  }

  /**
   * The actual decorator function.
   * @param {Object} target - The class prototype.
   * @param {string} name - The name of the method being decorated.
   * @param {Object} descriptor - The property descriptor of the method.
   * @private
   */
  const guardFunc = function (target, name, descriptor) {
    const protectedMethod = descriptor.value;

    descriptor.value = function (...protectedMethodArgs) {
      if (!isPerimeter(this) && !isSandbox(this) && !isFunction(this.guard)) {
        throw new Error(
          'Guard decorator can only be used within perimeter or sandbox.'
        );
      }

      const ruleName = (isCalled && action) ? action : name;
      const guardCall = () => this.guard(ruleName, ...protectedMethodArgs);

      /**
       * If callback is specified and guard method throws an error. Then we
       * need to return the result of the callback method;
       */
      if (!isUndefined(callback)) {
        try {
          guardCall();
        } catch (e) {
          if (e instanceof AccessDenied) {
            return isFunction(callback) ?
              callback.apply(this, protectedMethodArgs) :
              callback;
          }
          // Re-throw other errors
          throw e;
        }
      } else {
        /**
         * Call the guard method of the governess. If no callback is provided,
         * this will throw AccessDenied if not allowed.
         */
        guardCall();
      }

      return protectedMethod.apply(this, protectedMethodArgs);
    };

    return descriptor; // Return the modified descriptor
  };

  // If @guard() or @guard('action', callback) was used, return the decorator function.
  // Otherwise (e.g. @guard without parentheses, though less common for factories), apply it directly.
  return isCalled ? guardFunc : guardFunc(...args);
};

export default guard;
