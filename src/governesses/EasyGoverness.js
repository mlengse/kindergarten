import HeadGoverness from './HeadGoverness';

import HeadGoverness from './HeadGoverness';

/**
 * Represents a lenient governess that allows all actions by default.
 * This governess type sets `unguarded` to `true`, meaning that unless a specific
 * rule denies an action, it will be permitted. It inherits from {@link HeadGoverness}.
 *
 * @extends HeadGoverness
 *
 * @example
 * const easyGoverness = new EasyGoverness();
 * const sandbox = new Sandbox(child, { governess: easyGoverness });
 *
 * // Unless a 'cannot' rule exists for 'doSomething', this will be allowed.
 * sandbox.guard('doSomething');
 */
export default class EasyGoverness extends HeadGoverness {
  /**
   * Creates an instance of EasyGoverness.
   * Sets the `unguarded` property to `true`.
   * @param {...*} args - Arguments passed to the {@link HeadGoverness} constructor.
   */
  constructor(...args) {
    super(...args);

    this.unguarded = true;
  }
}
