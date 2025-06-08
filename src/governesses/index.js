/**
 * @module kindergarten/governesses
 * @description
 * This module exports the various types of Governess classes available in the
 * Kindergarten library. Governesses are responsible for learning and enforcing rules.
 * Different governesses can implement different enforcement strategies.
 *
 * @see HeadGoverness
 * @see EasyGoverness
 * @see GermanGoverness
 * @see MiddlewareGoverness
 * @see StrictGoverness
 */
import EasyGoverness from './EasyGoverness';
import GermanGoverness from './GermanGoverness';
import HeadGoverness from './HeadGoverness';
import MiddlewareGoverness from './MiddlewareGoverness';
import StrictGoverness from './StrictGoverness';

export {
  EasyGoverness,
  GermanGoverness,
  HeadGoverness,
  MiddlewareGoverness,
  StrictGoverness
};
