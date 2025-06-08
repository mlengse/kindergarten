import Sandbox from './Sandbox';

import Sandbox from './Sandbox';

/**
 * Factory function to create a new instance of {@link Sandbox}.
 * This is a convenience function that passes all arguments directly to the
 * {@link Sandbox} constructor.
 *
 * @param {...*} args - Arguments to pass to the {@link Sandbox} constructor.
 * @return {Sandbox} A new instance of Sandbox.
 * @see Sandbox
 *
 * @example
 * import { createSandbox, HeadGoverness } from 'kindergarten';
 *
 * const child = { name: 'Max' };
 * const sandbox = createSandbox(child, {
 *   governess: new HeadGoverness(),
 * });
 */
const createSandbox = (...args) => new Sandbox(...args);

export default createSandbox;
