import each from 'lodash/each';
import find from 'lodash/find';
import some from 'lodash/some';
import isEmpty from 'lodash/isEmpty';

import HeadGoverness from './governesses/HeadGoverness';
import Purpose from './Purpose';
import AllowedMethodsService from './utils/AllowedMethodsService';
import {
  isGoverness,
  isPerimeter,
  isPurpose
} from './utils';
import {
  ArgumentError,
  NoGovernessError,
  RestrictedMethodError
} from './errors';

/**
 * Defines the Sandbox class.
 * A Sandbox is an environment where a "child" object can operate under the
 * supervision of a {@link Governess} and according to rules defined in {@link Perimeter}s.
 *
 * @example
 * const child = {
 *   toys: ['car', 'doll'],
 *   play: (toy) => `playing with ${toy}`,
 * };
 *
 * const mainGoverness = new HeadGoverness();
 * const playgroundPerimeter = new Perimeter({
 *   purpose: 'playground',
 *   govern: { 'can play': (toy) => child.toys.includes(toy) },
 *   expose: ['play'],
 * });
 *
 * const sandbox = new Sandbox(child, {
 *   governess: mainGoverness,
 *   perimeters: [playgroundPerimeter],
 * });
 *
 * sandbox.playground.play('car'); // => 'playing with car'
 * sandbox.playground.play('bike'); // => throws AccessDenied error
 */
export default class Sandbox {
  /**
   * Creates a new Sandbox instance.
   * @param {Object} [child=null] - The child object to be sandboxed.
   * @param {Object} [options={}] - Sandbox options.
   * @param {Governess|Function} [options.governess=HeadGoverness] - The main governess for the sandbox or a constructor for one.
   * @param {Array<Perimeter>} [options.perimeters=[]] - An array of perimeters to load initially.
   */
  constructor(child = null, { governess = new HeadGoverness(), perimeters = [] } = {}) {
    this.child = child;

    if (!isGoverness(governess)) {
      try {
        const Governess = governess;
        governess = new Governess();
      } catch (ignore) {
        // ignore...
      }
    }
    this.governess = governess;

    this._perimeters = [];

    if (!isEmpty(perimeters)) {
      this.loadPerimeter(...perimeters);
    }
  }

  /**
   * The main governess of the sandbox.
   * @type {Governess}
   * @throws {NoGovernessError} If the provided value is not a Governess instance.
   */
  get governess() {
    return this._governess;
  }

  /**
   * Sets the main governess for the sandbox.
   * Ensures the new governess learns all existing rules.
   * @param {Governess} value - The governess to set.
   * @throws {NoGovernessError} If the value is not an instance of Governess.
   */
  set governess(value) {
    if (!isGoverness(value)) {
      throw new NoGovernessError();
    }

    // if governess is null perimeter will use the governess of it's sandbox
    this._governess = value;

    // New governess must know all the rules (if any)
    this._learnRules();

    return value;
  }

  /**
   * Forwards the guard call to the main governess of the sandbox.
   * @param {...*} args - Arguments to pass to the governess's `guard` method.
   * @return {*} The result of the governess's `guard` method.
   * @see Governess#guard
   */
  guard(...args) {
    return this.governess.guard(...args);
  }

  /**
   * Loads one or more perimeters into the sandbox.
   * For each perimeter, it ensures the governess learns its rules and exposes the perimeter's purpose.
   * @param {...Perimeter} perimeters - The perimeters to load.
   * @return {number} The count of newly added perimeters.
   * @throws {ArgumentError} If any of the provided arguments is not a Perimeter instance.
   * @see Perimeter
   * @example
   * sandbox.loadPerimeter(perimeter1, perimeter2);
   */
  loadPerimeter(...perimeters) {
    let counter = 0;

    each(perimeters, (perimeter) => {
      // Sandbox only accepts perimeters
      if (!isPerimeter(perimeter)) {
        throw new ArgumentError(
          'Module must be instance of Kindergarten.Perimeter.'
        );
      }

      // Skip if sandbox already have the perimeter
      if (this.hasPerimeter(perimeter)) return;

      // If perimeter has a governess, then she has to learn the rules as well
      if (isGoverness(perimeter.governess)) {
        perimeter.governess.learnRules(perimeter);
      }

      // Governess that used when checking rules through purpose
      if (!perimeter.purposeGoverness) {
        perimeter.purposeGoverness = new this.governess.constructor();
        perimeter.purposeGoverness.learnRules(perimeter);
      }

      // The governess of a sandbox must know all the rules
      this.governess.learnRules(perimeter);

      perimeter.sandbox = this;

      this._perimeters.push(perimeter);

      // Make sure the purpose is available on Sandbox
      this._extendPurpose(perimeter);

      ++counter;
    });

    return counter;
  }

  /**
   * Alias for {@link Sandbox#loadPerimeter}.
   * @param {...Perimeter} args - The perimeters to load.
   * @return {number} The count of newly added perimeters.
   */
  loadModule(...args) {
    return this.loadPerimeter(...args);
  }

  /**
   * Returns all perimeters currently loaded in the sandbox.
   * @return {Array<Perimeter>} An array of perimeters.
   */
  getPerimeters() {
    return this._perimeters || [];
  }

  /**
   * Retrieves a specific perimeter by its purpose name.
   * @param {string} purpose - The purpose name of the perimeter to retrieve.
   * @return {Perimeter|null} The found perimeter, or null if not found.
   * @example
   * const pgPerimeter = sandbox.getPerimeter('playground');
   */
  getPerimeter(purpose) {
    const perimeter = find(this.getPerimeters(), (p) => (p.purpose === purpose));

    return isPerimeter(perimeter) ? perimeter : null;
  }

  /**
   * Checks if the sandbox already contains a perimeter with the given purpose or instance.
   * @param {Perimeter|string} perimeter - The perimeter instance or its purpose name.
   * @return {boolean} True if the perimeter exists in the sandbox, false otherwise.
   */
  hasPerimeter(perimeter) {
    const purpose = isPerimeter(perimeter) ?
      perimeter.purpose :
      perimeter;

    return some(this.getPerimeters(), (p) => p.purpose === purpose);
  }

  /**
   * Checks if an action is allowed by the main governess of the sandbox.
   * @param {...*} args - Arguments to pass to the governess's `isAllowed` method.
   * @return {boolean} True if the action is allowed, false otherwise.
   * @see Governess#isAllowed
   */
  isAllowed(...args) {
    return this.governess.isAllowed(...args);
  }

  /**
   * Checks if an action is not allowed by the main governess of the sandbox.
   * @param {...*} args - Arguments to pass to the governess's `isNotAllowed` method.
   * @return {boolean} True if the action is not allowed, false otherwise.
   * @see Governess#isNotAllowed
   */
  isNotAllowed(...args) {
    return this.governess.isNotAllowed(...args);
  }

  /**
   * Exposes the purpose of a given perimeter on the sandbox instance.
   * This creates a new {@link Purpose} object or uses an existing one,
   * and loads the perimeter into that purpose.
   * This method is used internally by Sandbox and should not be used externally.
   * @param {Perimeter} perimeter - The perimeter whose purpose is to be exposed.
   * @throws {RestrictedMethodError} If the perimeter's purpose name is a restricted method name.
   * @private
   */
  _extendPurpose(perimeter) {
    const name = perimeter.purpose;
    const allowedMethodsService = new AllowedMethodsService(this);

    if (allowedMethodsService.isRestricted(name)) {
      throw new RestrictedMethodError(
        `Cannot expose purpose ${name} to sandbox. Restricted method name.`
      );
    }

    this[name] = isPurpose(this[name]) ? this[name] : new Purpose(name, this);
    this[name]._loadPerimeter(perimeter);
  }

  /**
   * Ensures the main governess learns all rules from all loaded perimeters.
   * This method is used internally by Sandbox and should not be used externally.
   * @private
   */
  _learnRules() {
    each(this.getPerimeters() || [], (perimeter) =>
      this.governess.learnRules(perimeter)
    );
  }
}
