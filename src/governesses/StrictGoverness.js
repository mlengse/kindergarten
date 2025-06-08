import HeadGoverness from './HeadGoverness';
import {
  AccessDenied
} from '../errors';

import HeadGoverness from './HeadGoverness';
import {
  AccessDenied
} from '../errors';

/**
 * A governess that enforces a strict policy: every call to an exposed method
 * (via `governed`) must be preceded by a corresponding call to `guard`.
 * It tracks the counts of `governed` and `guard` calls. If `governed` is called
 * more times than `guard` (and the governess is not `unguarded`), it throws an
 * {@link AccessDenied} error, assuming a `guard` call was missed.
 *
 * This is useful to ensure that all exposed functionalities are explicitly checked
 * for permissions.
 *
 * Note: This governess executes the exposed method first and then checks the counts.
 * If `guard` was not called, the method still runs, but an error is thrown afterwards.
 *
 * @extends HeadGoverness
 *
 * @example
 * const strictGoverness = new StrictGoverness();
 * const perimeter = new Perimeter({
 *   purpose: 'strictAccess',
 *   governess: strictGoverness,
 *   expose: ['taskOne', 'taskTwo'],
 *   govern: { 'can taskOne': true, 'can taskTwo': true },
 *   taskOne() {
 *     this.governess.guard('taskOne'); // Correct: guard is called
 *     return 'Task one done.';
 *   },
 *   taskTwo() {
 *     // Incorrect: guard('taskTwo') is NOT called
 *     return 'Task two done.';
 *   }
 * });
 * const sandbox = new Sandbox({}, { perimeters: [perimeter] });
 *
 * sandbox.strictAccess.taskOne(); // OK
 * sandbox.strictAccess.taskTwo(); // Executes taskTwo, then throws AccessDenied
 */
export default class StrictGoverness extends HeadGoverness {
  /**
   * Creates an instance of StrictGoverness.
   * Initializes `_guardCount` and `_governedCount` to 0.
   * @param {...*} args - Arguments passed to the {@link HeadGoverness} constructor.
   */
  constructor(...args) {
    super(...args);
    /**
     * @type {number}
     * @description Counter for `guard` method calls.
     * @private
     */
    this._guardCount = 0;
    /**
     * @type {number}
     * @description Counter for `governed` method calls.
     * @private
     */
    this._governedCount = 0;
  }

  /**
   * Overrides the `governed` method from {@link HeadGoverness}.
   * It executes the original method via the parent's `governed` call, then increments
   * its internal `_governedCount`. If this count exceeds `_guardCount` and the
   * governess is not `unguarded`, it throws an {@link AccessDenied} error.
   *
   * @param {Function} callback - The original method to be executed.
   * @param {Array<*>} [args=[]] - The arguments passed to the original method.
   * @param {Object|null} [callingContext=null] - The context in which the original method is called.
   * @return {*} The result of the original callback execution.
   * @throws {AccessDenied} If `_governedCount` exceeds `_guardCount` and not `unguarded`.
   */
  governed(callback, args = [], callingContext = null) {
    const returnVal = HeadGoverness.prototype.governed.call(this, callback, args, callingContext);

    this._governedCount++;

    if (this._governedCount > this._guardCount && !this.unguarded) {
      // Reset counts after throwing to allow for potential recovery or subsequent valid calls,
      // though the error itself is disruptive. This state management might need review
      // depending on desired behavior after such an error.
      this._resetCounts();
      throw new AccessDenied(
        'StrictGoverness: guard() was not called for an exposed method or was called an incorrect number of times.'
      );
    }

    return returnVal;
  }

  /**
   * Overrides the `guard` method from {@link HeadGoverness}.
   * It increments its internal `_guardCount` before calling the parent's `guard` method.
   *
   * @param {string} action - The action to check.
   * @param {...*} args - Additional arguments passed to the rule verification logic.
   * @return {*} The result of the parent's `guard` method call.
   * @throws {AccessDenied} If the parent's `guard` method denies access.
   */
  guard(action, ...args) {
    this._guardCount++;
    // Reset governedCount when guard is called, as typically one guard call corresponds to one governed action.
    // This makes the check `_governedCount > _guardCount` more about whether the *current* governed action
    // was preceded by a guard, rather than a global count mismatch.
    // However, the original logic seems to imply a global count.
    // For a strict 1:1 call, _governedCount should be reset here or _guardCount should not accumulate beyond _governedCount + 1.
    // Let's stick to incrementing and rely on the check in `governed`.
    // If a guard is called without a governed, _guardCount will be higher, which is fine.
    // The issue is a governed call without a preceding (or corresponding) guard call.

    return HeadGoverness.prototype.guard.call(this, action, ...args);
  }

  /**
   * Resets the guard and governed counters.
   * This might be called after an error or if a reset is needed.
   * @private
   */
  _resetCounts() {
    this._guardCount = 0;
    this._governedCount = 0;
  }
}
