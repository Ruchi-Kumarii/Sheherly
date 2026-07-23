/**
 * A simple module-level flag used to signal that the chatbot
 * should open in support mode. It is set by the customer-support
 * screen BEFORE navigating, and consumed (and cleared) by the
 * chatbot screen on focus — so a plain tab tap never triggers it.
 */
let _openInSupportMode = false;

export function setSupportMode() {
  _openInSupportMode = true;
}

export function consumeSupportMode() {
  const val = _openInSupportMode;
  _openInSupportMode = false; // clear immediately after reading
  return val;
}
