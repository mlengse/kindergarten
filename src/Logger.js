import isFunction from 'lodash/isFunction';

/**
 * @ignore
 * Logger utility for internal use.
 * It should not be used directly by consumers of this library.
 */
const Logger = {
  /**
   * Internal log method.
   * @param {string} msg - The message to log.
   * @private
   */
  _log(msg) {
    if (console && isFunction(console.log)) {
      /* eslint no-console: 0 */
      console.log(msg);
    }
  },

  /**
   * Logs a message to the console.
   * @param {string} msg - The message to log.
   * @public
   */
  log(msg) {
    Logger._log(msg);
  },

  /**
   * Logs a warning message to the console.
   * @param {string} msg - The warning message to log.
   * @public
   */
  warn(msg) {
    Logger._log(`[WARN] ${msg}`);
  }
};

export default Logger;
