/**
 * @module kindergarten
 * @description
 * Welcome to KindergartenJS!
 *
 * Kindergarten is a JavaScript library for implementing robust access control
 * and permissions management in your applications. It provides a flexible way
 * to define rules (what a "child" or module can and cannot do) and enforce
 * these rules through "governesses" within isolated "sandboxes".
 *
 * This main module exports all the core components of the Kindergarten library,
 * allowing you to construct and manage your application's security policies.
 *
 * Core Components:
 * - {@link Sandbox}: The environment where a "child" object operates under supervision.
 * - {@link Perimeter}: Defines rules and exposes methods for a specific purpose within a Sandbox.
 * - {@link Rule}: Represents a single permission or restriction.
 * - Governesses (e.g., {@link HeadGoverness}, {@link StrictGoverness}): Enforce the rules.
 * - {@link Purpose}: Acts as a bridge between a Sandbox and a Perimeter for exposed methods.
 *
 * Utility Functions:
 * - Factory functions: `createSandbox`, `createPerimeter`, `createRule`.
 * - Type checkers: `isSandbox`, `isPerimeter`, `isRule`, `isGoverness`, `isPurpose`.
 *
 * Custom Errors:
 * - Specific error classes (e.g., {@link AccessDenied}, {@link ArgumentError}) for better error handling.
 *
 * Decorators:
 * - (If decorators are exported here, list them. Based on previous files, they are in `./decorators`)
 *   Note: Decorators might be exported separately or included if this is the primary public API definition.
 *   The current `ls` output did not show decorators directly in `src/index.js` exports, but they are part of the library.
 *
 * @see Sandbox
 * @see Perimeter
 * @see Rule
 * @see HeadGoverness
 * @see Purpose
 * @see VERSION
 * @see {@link module:kindergarten/decorators|Decorators} for method and class decorators.
 * @see {@link module:kindergarten/errors|Custom Errors} for detailed error types.
 * @see {@link module:kindergarten/utils|Utility Functions} for type checkers and services.
 *
 * @example
 * import { Sandbox, Perimeter, GermanGoverness, AccessDenied } from 'kindergarten';
 *
 * const child = {
 *   action: () => 'Child action done.'
 * };
 *
 * const perimeter = new Perimeter({
 *   purpose: 'myApi',
 *   governess: new GermanGoverness(), // Auto-guards exposed methods
 *   expose: ['action'],
 *   govern: {
 *     'can action': false // Define a rule
 *   }
 * });
 *
 * const sandbox = new Sandbox(child, { perimeters: [perimeter] });
 *
 * try {
 *   sandbox.myApi.action();
 * } catch (e) {
 *   if (e instanceof AccessDenied) {
 *     console.error(e.message); // => Child is not allowed to action the target.
 *   }
 * }
 */
import Logger from './Logger';
import Perimeter from './Perimeter';
import Purpose from './Purpose';
import Rule from './Rule';
import Sandbox from './Sandbox';
import VERSION from './VERSION';
import createPerimeter from './createPerimeter';
import createRule from './createRule';
import createSandbox from './createSandbox';

import {
  isGoverness,
  isPerimeter,
  isPurpose,
  isRule,
  isSandbox,
  PubSub
} from './utils';

import {
  EasyGoverness,
  GermanGoverness,
  HeadGoverness,
  MiddlewareGoverness,
  StrictGoverness
} from './governesses';

import {
  AccessDenied,
  ArgumentError,
  NoExposedMethodError,
  NoGovernessError,
  NoPurposeError,
  NoSandboxError,
  RestrictedMethodError,
  WrongRuleDefinition
} from './errors';

export {
  AccessDenied,
  ArgumentError,
  EasyGoverness,
  GermanGoverness,
  HeadGoverness,
  Logger,
  MiddlewareGoverness,
  NoExposedMethodError,
  NoGovernessError,
  NoPurposeError,
  NoSandboxError,
  Perimeter,
  PubSub,
  Purpose,
  RestrictedMethodError,
  Rule,
  Sandbox,
  StrictGoverness,
  VERSION,
  WrongRuleDefinition,
  createPerimeter,
  createRule,
  createSandbox,
  isGoverness,
  isPerimeter,
  isPurpose,
  isRule,
  isSandbox
};

const Kindergarten = {
  AccessDenied,
  ArgumentError,
  EasyGoverness,
  GermanGoverness,
  HeadGoverness,
  Logger,
  MiddlewareGoverness,
  NoExposedMethodError,
  NoGovernessError,
  NoPurposeError,
  NoSandboxError,
  Perimeter,
  PubSub,
  Purpose,
  RestrictedMethodError,
  Rule,
  Sandbox,
  StrictGoverness,
  VERSION,
  WrongRuleDefinition,
  createPerimeter,
  createRule,
  createSandbox,
  isGoverness,
  isPerimeter,
  isPurpose,
  isRule,
  isSandbox
};

export default Kindergarten;
