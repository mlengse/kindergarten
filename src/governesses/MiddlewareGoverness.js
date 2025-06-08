import HeadGoverness from './HeadGoverness';

/**
 * A governess that allows a middleware function to be executed before
 * the actual `governed` logic of {@link HeadGoverness} is called.
 * The middleware function receives the governess instance and all arguments
 * passed to the `governed` method.
 *
 * @extends HeadGoverness
 *
 * @example
 * const myMiddleware = (governess, originalCallback, originalArgs, callingContext) => {
 *   console.log(`Middleware called for action on context: ${callingContext.purpose}`);
 *   // Middleware could, for example, call governess.guard() here,
 *   // modify arguments, or perform logging.
 *   // governess.guard('someAction', ...originalArgs);
 * };
 *
 * const middlewareGoverness = new MiddlewareGoverness(myMiddleware);
 * const perimeter = new Perimeter({
 *   purpose: 'logging',
 *   governess: middlewareGoverness,
 *   expose: ['doWork'],
 *   doWork(task) {
 *     return `Work done on: ${task}`;
 *   }
 * });
 * const sandbox = new Sandbox({}, { perimeters: [perimeter] });
 *
 * sandbox.logging.doWork('documentation');
 * // Console will show: "Middleware called for action on context: logging"
 * // Then the doWork method executes.
 */
export default class MiddlewareGoverness extends HeadGoverness {
  /**
   * Creates an instance of MiddlewareGoverness.
   * @param {Function} middleware - The middleware function to be executed.
   *   This function will be called with `(governessInstance, originalCallback, originalArgs, callingContext)`.
   * @param {...*} headGovernessArgs - Arguments to be passed to the {@link HeadGoverness} constructor.
   */
  constructor(middleware, ...headGovernessArgs) {
    super(...headGovernessArgs);

    if (typeof middleware !== 'function') {
      throw new Error('MiddlewareGoverness requires a middleware function as its first argument.');
    }

    /**
     * @type {Function}
     * @description The middleware function to be executed.
     */
    this.middleware = middleware;
  }

  /**
   * Overrides the `governed` method from {@link HeadGoverness}.
   * It first executes the provided middleware function and then calls the
   * original `governed` method of the {@link HeadGoverness}.
   *
   * @param {Function} callback - The original method to be executed.
   * @param {Array<*>} [args=[]] - The arguments passed to the original method.
   * @param {Object|null} [callingContext=null] - The context in which the original method is called.
   * @return {*} The result of the original callback execution via `HeadGoverness.prototype.governed`.
   */
  governed(callback, args = [], callingContext = null) {
    // The middleware is called with the governess instance, and all original `governed` arguments.
    this.middleware(this, callback, args, callingContext);

    // After the middleware, call the parent's governed method.
    // Note: The problem description shows `HeadGoverness.prototype.governed.apply(this, args);`
    // which would mean `callback, args, callingContext` are not passed correctly if `args` here
    // is meant to be `[callback, args, callingContext]`.
    // Assuming the intent is to pass the original `governed` arguments to the parent.
    return HeadGoverness.prototype.governed.call(this, callback, args, callingContext);
  }
}
