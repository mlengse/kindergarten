import Rule from './Rule';

import Rule from './Rule';

/**
 * Factory function to create a new instance of {@link Rule}.
 * This is a convenience function that passes all arguments directly to the
 * {@link Rule} constructor.
 *
 * @param {...*} args - Arguments to pass to the {@link Rule} constructor.
 * @return {Rule} A new instance of Rule.
 * @see Rule
 *
 * @example
 * import { createRule } from 'kindergarten';
 *
 * const rule = createRule('can play', true);
 */
const createRule = (...args) => new Rule(...args);

export default createRule;
