/**
 * @module kindergarten/errors
 * @description
 * This module exports all custom error classes used within the Kindergarten library.
 * These errors help in identifying specific issues related to sandbox setup,
 * rule definitions, and access control.
 *
 * @see AccessDenied
 * @see ArgumentError
 * @see NoExposedMethodError
 * @see NoGovernessError
 * @see NoPurposeError
 * @see NoSandboxError
 * @see RestrictedMethodError
 * @see WrongRuleDefinition
 */
import AccessDenied from './AccessDenied';
import ArgumentError from './ArgumentError';
import NoExposedMethodError from './NoExposedMethodError';
import NoGovernessError from './NoGovernessError';
import NoPurposeError from './NoPurposeError';
import NoSandboxError from './NoSandboxError';
import RestrictedMethodError from './RestrictedMethodError';
import WrongRuleDefinition from './WrongRuleDefinition';

export {
  AccessDenied,
  ArgumentError,
  NoExposedMethodError,
  NoGovernessError,
  NoPurposeError,
  NoSandboxError,
  RestrictedMethodError,
  WrongRuleDefinition
};
