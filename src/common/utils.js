const ERROR_INFO_STYLES = "font-weight:bold;";
const ERROR_MESSAGE_STYLES =
  "font-family:monospace;background-color:#222;padding:1px 4px;border-radius:3px;";

/**
 * todo.
 */
export function todo() {
  throw new Error("Not yet implemented!");
}

/**
 * invariant.
 *
 * @param {boolean} condition
 * @param {string | undefined} message
 */
export function invariant(condition, message = "reason unknown") {
  console.error(
    `Invariance failed; \n%c Reason: %c ${message}`,
    ERROR_INFO_STYLES,
    ERROR_MESSAGE_STYLES
  );
  if (!condition) throw new Error(`INVARIANCE: ${message}`);
}

/**
 * invalid.
 *
 * @param {unknown} debug
 */
export function invalid(debug) {
  console.error(
    `Invalid state reached; should not have gotten here! :(\n\t%c Debug Info: %c ${debug}`,
    ERROR_INFO_STYLES,
    ERROR_MESSAGE_STYLES
  );

  throw new Error("INVALID");
}
