/**
 * @module kindergarten/decorators
 * @description
 * This module exports all available decorators provided by the Kindergarten library.
 * Decorators are a convenient way to apply Kindergarten's security features
 * directly to class methods and properties.
 *
 * Currently available decorators:
 * - {@link guard}
 * - {@link sandbox}
 */
import guard from './guard';
import sandbox from './sandbox';

export {
  guard,
  sandbox
};
