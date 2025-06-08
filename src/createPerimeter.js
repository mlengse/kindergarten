import Perimeter from './Perimeter';

import Perimeter from './Perimeter';

/**
 * Factory function to create a new instance of {@link Perimeter}.
 * This is a convenience function that passes all arguments directly to the
 * {@link Perimeter} constructor.
 *
 * @param {...*} args - Arguments to pass to the {@link Perimeter} constructor.
 * @return {Perimeter} A new instance of Perimeter.
 * @see Perimeter
 *
 * @example
 * import { createPerimeter } from 'kindergarten';
 *
 * const perimeter = createPerimeter({
 *   purpose: 'api',
 *   govern: {
 *     'can read': true,
 *   },
 * });
 */
const createPerimeter = (...args) => new Perimeter(...args);

export default createPerimeter;
