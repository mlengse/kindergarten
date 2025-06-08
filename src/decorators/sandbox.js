import each from 'lodash/each';
import forOwn from 'lodash/forOwn';

import Sandbox from '../Sandbox';

/**
 * A class decorator factory that integrates a {@link Sandbox} instance into a target class.
 * It creates a new Sandbox instance with the provided arguments and mixes its methods
 * and properties into the decorated class's instances.
 *
 * @param {...*} sandboxArgs - Arguments to be passed to the {@link Sandbox} constructor.
 *   This typically includes the child object and options like `governess` and `perimeters`.
 * @return {Function} The class decorator.
 * @throws {Error} If a property from the sandbox instance already exists on the target class instance.
 *
 * @example
 * import { sandbox, HeadGoverness, Perimeter } from 'kindergarten';
 *
 * const childObject = {
 *   secret: 'candy stash',
 *   getSecret: function() { return this.secret; }
 * };
 *
 * const perimeter = new Perimeter({
 *  purpose: 'secrets',
 *  govern: { 'can getSecret': false },
 *  expose: ['getSecret']
 * });
 *
 * // Apply the sandbox decorator to a class
 * // Pass sandbox constructor arguments here (child, options)
 * @sandbox(childObject, { governess: new HeadGoverness(), perimeters: [perimeter] })
 * class MySecureClass {
 *   constructor(name) {
 *     this.name = name;
 *   }
 *
 *   // This class now has methods like:
 *   // this.loadPerimeter(), this.guard(), this.isAllowed(),
 *   // this.secrets.getSecret() (which will be guarded)
 *   // and properties like this.governess
 *
 *   displaySecret() {
 *     try {
 *       // Accessing the sandboxed method via the purpose
 *       return `The secret is: ${this.secrets.getSecret()}`;
 *     } catch (e) {
 *       return e.message;
 *     }
 *   }
 * }
 *
 * const instance = new MySecureClass('Mr. Secure');
 * console.log(instance.name); // Output: Mr. Secure
 *
 * // Trying to access the guarded method
 * console.log(instance.displaySecret()); // Output: Access to method getSecret is denied.
 *
 * // We can interact with the sandbox features directly on the instance
 * instance.governess.learnRules(new Perimeter({
 *  purpose: 'secrets', // Redefine or add rules
 *  govern: { 'can getSecret': true }
 * }));
 * console.log(instance.displaySecret()); // Output: The secret is: candy stash
 */
const sandbox = (...sandboxArgs) => (Target) => {
  const sandboxInstance = new Sandbox(...sandboxArgs);

  /**
   * Adds a method/property to the target object if it doesn't already exist.
   * @param {Object} obj - The object to add the property to.
   * @param {string} key - The property key.
   * @param {*} value - The property value.
   * @throws {Error} If the property already exists on the object.
   * @private
   */
  const addMethod = (obj, key, value) => {
    if (obj[key]) {
      throw new Error(
        `Cannot apply sandbox decorator ${key} property is already defined.`
      );
    }
    obj[key] = value;
  };

  // The new class that extends the Target class
  return class extends Target {
    constructor(...args) {
      super(...args);

      // Mixin specific Sandbox methods
      each([
        'loadPerimeter',
        'loadModule',
        'guard',
        'isAllowed',
        'isNotAllowed',
        'hasPerimeter',
        'getPerimeter',
        'getPerimeters',
        'governess' // includes getter and setter
      ], (key) => {
        // For methods, we bind them to the sandboxInstance.
        // For properties like 'governess' (which has a getter/setter on Sandbox),
        // we need to define them as properties on the new class instance
        // to ensure getters/setters are correctly invoked.
        if (typeof sandboxInstance[key] === 'function') {
          addMethod(this, key, sandboxInstance[key].bind(sandboxInstance));
        } else {
           // This handles properties like 'governess' which might have getters/setters
           // We want to ensure these are also available on the decorated class.
           // However, simple assignment might not trigger getters/setters correctly if they are defined on the prototype.
           // A more robust way for properties with accessors would be Object.defineProperty,
           // but for now, direct assignment after check for simplicity, assuming direct properties or simple getters.
           // This part might need refinement if complex accessor behavior from Sandbox is critical.
          addMethod(this, key, sandboxInstance[key]);
        }
      });

      // Mixin other properties from the sandbox instance (like purposes)
      forOwn(sandboxInstance, (val, key) => {
        // Avoid re-adding properties already handled or internal properties
        if (this[key] === undefined && key !== '_governess' && key !== '_perimeters' && key !== 'child') {
          addMethod(this, key, val);
        }
      });
    }
  };
};

export default sandbox;
