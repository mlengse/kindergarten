/**
 * @module kindergarten/utils
 * @description
 * This module exports various utility functions and classes used throughout
 * the Kindergarten library. These include type-checking functions (e.g., `isGoverness`, `isSandbox`)
 * and services like `AllowedMethodsService`.
 *
 * @see AllowedMethodsService
 * @see isGoverness
 * @see isPerimeter
 * @see isPurpose
 * @see isRule
 * @see isSandbox
 */
import AllowedMethodsService from './AllowedMethodsService';
import isGoverness from './isGoverness';
import isPerimeter from './isPerimeter';
import isPurpose from './isPurpose';
import isRule from './isRule';
import isSandbox from './isSandbox';

export {
  AllowedMethodsService,
  isGoverness,
  isPerimeter,
  isPurpose,
  isRule,
  isSandbox
};
