import extend from 'lodash/extend';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import omit from 'lodash/omit';
import keys from 'lodash/keys';
import each from 'lodash/each';

import AllowedMethodsService from './utils/AllowedMethodsService';
import HeadGoverness from './governesses/HeadGoverness';
import {
  isGoverness,
  isSandbox
} from './utils';
import {
  NoPurposeError,
  NoSandboxError
} from './errors';

const allowedMethodsService = new AllowedMethodsService({});

/**
 * A Perimeter is used to define the places where a child (sandboxed object) can play.
 * It defines the rules and the governess that will enforce them.
 *
 * @example
 * const perimeter = new Perimeter({
 *   purpose: 'playground',
 *   govern: {
 *     'can play': true,
 *     'cannot run': false,
 *   },
 *   expose: ['swing', 'slide'],
 *   governess: new StrictGoverness(),
 * });
 */
export default class Perimeter {
  /**
   * Create new perimeter.
   * @param {string|Object} purpose - The purpose of the perimeter or an options object.
   * @param {string} [purpose.purpose] - The purpose of the perimeter.
   * @param {Object} [purpose.govern] - Rules to govern the perimeter.
   * @param {Array<string>} [purpose.expose] - Methods to expose from the child.
   * @param {Governess} [purpose.governess] - Governess for the perimeter.
   * @param {Object} [opts={}] - Options object if purpose is a string.
   * @param {Object} [opts.govern] - Rules to govern the perimeter.
   * @param {Array<string>} [opts.expose] - Methods to expose from the child.
   * @param {Governess} [opts.governess] - Governess for the perimeter.
   */
  constructor(purpose, opts = {}) {
    if (isObject(purpose) && isString(purpose.purpose)) {
      opts = purpose;
      this.purpose = purpose.purpose;
    }

    this.purpose = this.purpose || purpose;
    this.govern = this.extractGovern(opts);
    this.expose = opts.expose || [];

    if (!isGoverness(opts.governess)) {
      try {
        const Governess = opts.governess;
        this.governess = new Governess();
      } catch (ignore) {
        // ignore...
      }
    }

    this.governess = this.governess || opts.governess;

    // Perimeter doesn't require governess
    if (isGoverness(this.governess)) {
      this.governess.learnRules(this);
    }

    extend(this, omit(opts, ['purpose', 'govern', 'expose', 'governess']));
  }

  /**
   * The purpose of the perimeter.
   * @type {string}
   * @throws {NoPurposeError} If the purpose is not a string or is a restricted name.
   */
  get purpose() {
    return this._purpose;
  }

  /**
   * Sets the purpose of the perimeter.
   * Ensures that the name of the purpose is not restricted.
   * @param {string} value - The purpose to set.
   * @throws {NoPurposeError} If the purpose is not a string or is a restricted name.
   */
  set purpose(value) {
    if (!isString(value) || allowedMethodsService.isRestricted(value)) {
      throw new NoPurposeError();
    }

    this._purpose = value;

    return value;
  }

  /**
   * Returns the purpose of the perimeter.
   * @return {string} The purpose of the perimeter.
   */
  getPurpose() {
    return this.purpose;
  }

  /**
   * The sandbox associated with this perimeter.
   * @type {Sandbox}
   * @throws {NoSandboxError} If the value is not an instance of Sandbox.
   */
  get sandbox() {
    return this._sandbox;
  }

  /**
   * Sets the sandbox for this perimeter.
   * Ensures that the given sandbox is an instance of the Sandbox class.
   * @param {Sandbox} value - The sandbox to set.
   * @throws {NoSandboxError} If the value is not an instance of Sandbox.
   */
  set sandbox(value) {
    if (!isSandbox(value)) {
      throw new NoSandboxError();
    }

    this._sandbox = value;
    this.child = value.child;

    return value;
  }

  /**
   * Returns the sandbox of the perimeter.
   * @return {Sandbox} The sandbox of the perimeter.
   */
  getSandbox() {
    return this.sandbox;
  }

  /**
   * The governess for this perimeter.
   * If the perimeter has its own governess, it returns it.
   * Otherwise, it returns the governess of its sandbox.
   * @type {Governess}
   */
  get governess() {
    return this.hasOwnGoverness() ?
      this._governess : (() => (
        isSandbox(this.sandbox) ? this.sandbox.governess : null
      ))();
  }

  /**
   * Sets the governess for this perimeter.
   * If the governess is null, the perimeter will use the governess of its sandbox.
   * @param {Governess} value - The governess to set.
   */
  set governess(value) {
    // if governess is null perimeter will use the governess of it's sandbox
    this._governess = (isGoverness(value)) ?
      value : (() => (
        isSandbox(this.sandbox) ? this.sandbox.governess : null
    ))();

    // Make sure governess know all the rules
    if (
      isObject(this._governess) && this._governess instanceof HeadGoverness
    ) {
      this._governess.learnRules(this);
    }

    return value;
  }

  /**
   * Returns the governess of the perimeter or the governess of its sandbox.
   * @return {Governess} The governess.
   */
  getGoverness() {
    return this.governess;
  }

  /**
   * Checks if the perimeter has its own governess.
   * @return {boolean} True if the perimeter has its own governess, false otherwise.
   */
  hasOwnGoverness() {
    return isGoverness(this._governess);
  }

  /**
   * Forwards the guard call to the governess.
   * @param {...*} args - Arguments to pass to the governess's guard method.
   * @return {*} The result of the governess's guard method.
   * @see Governess#guard
   */
  guard(...args) {
    return this.governess.guard.call(this.governess, ...args);
  }

  /**
   * Forwards the governed call to the governess.
   * @param {...*} args - Arguments to pass to the governess's governed method.
   * @return {*} The result of the governess's governed method.
   * @see Governess#governed
   */
  governed(...args) {
    return this.governess.governed.call(this.governess, ...args);
  }

  /**
   * Forwards the isAllowed call to the governess.
   * @param {...*} args - Arguments to pass to the governess's isAllowed method.
   * @return {boolean} The result of the governess's isAllowed method.
   * @see Governess#isAllowed
   */
  isAllowed(...args) {
    return this.governess.isAllowed.call(this.governess, ...args);
  }

  /**
   * Forwards the isNotAllowed call to the governess.
   * @param {...*} args - Arguments to pass to the governess's isNotAllowed method.
   * @return {boolean} The result of the governess's isNotAllowed method.
   * @see Governess#isNotAllowed
   */
  isNotAllowed(...args) {
    return this.governess.isNotAllowed.call(this.governess, ...args);
  }

  /**
   * Extracts and transforms govern rules from options.
   * @param {Object} opts - Options object.
   * @param {Object} [opts.govern] - Govern rules.
   * @param {Object} [opts.can] - 'can' rules.
   * @param {Object} [opts.cannot] - 'cannot' rules.
   * @return {Object} The extracted govern rules.
   * @private
   */
  extractGovern({ govern, can, cannot }) {
    govern = govern || {};

    each(keys(can || {}), (key) => {
      govern[`can ${key}`] = can[key];
    });

    each(keys(cannot || {}), (key) => {
      govern[`cannot ${key}`] = cannot[key];
    });

    return govern;
  }
}
