/**
 * Debounce a function so it runs only after a specified delay.
 *
 * @template {(...args: any[]) => void} T
 * @param {T} fn - The function to debounce.
 * @param {number} [delay=500] - Delay in milliseconds.
 * @returns {(...args: Parameters<T>) => void} - A debounced wrapper.
 */
function debounce(fn, delay = 500) {}

/**
 * Fetch and replace the rebate details section asynchronously.
 *
 * - Updates `#rebate-details-container` inner HTML from server response.
 * - Executes embedded scripts.
 * - Updates browser history state.
 * - Resets external dirty flags and scroll menu.
 *
 * @async
 * @returns {Promise<void>}
 */
async function updateRebateDetails() {}

/**
 * Rebuild the scroll menu (`#incentive-side-nav`) from H2 headings
 * inside `#incentive-details-container`.
 *
 * @returns {void}
 */
function rerenderScrollMenu() {}

/**
 * Toggle editable mode. When disabled, resets `activeEdit`.
 *
 * @returns {void}
 */
function toggleEditable() {}

/**
 * Open a specific field for editing.
 *
 * @param {string} field - Field key to activate editing for.
 * @returns {void}
 */
function openEdit(field) {}

/**
 * Handle when a select input changes.
 * Closes the select, marks state dirty, and re-focuses associated button.
 *
 * @async
 * @param {string} fieldKey - Key of the field being changed.
 * @param {string} newValue - Newly selected value.
 * @returns {Promise<void>}
 */
async function handleSelectChange(fieldKey, newValue) {}

/**
 * Move focus to the next field missing a selection.
 *
 * @param {string} currentKey - Current field key.
 * @returns {boolean} Whether a new missing field was focused.
 */
function focusNextMissingField(currentKey) {}

/**
 * Move focus to the previous field missing a selection.
 *
 * @param {string} currentKey - Current field key.
 * @returns {boolean} Whether a new missing field was focused.
 */
function focusPrevMissingField(currentKey) {}

/**
 * Handle keyboard interaction for select elements.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 * @param {string} fieldKey - The field key.
 * @param {string} currentValue - The current value of the field.
 * @returns {void}
 */
function handleSelectKeydown(event, fieldKey, currentValue) {}

/**
 * Clear all user selections, reset URL, and reopen the first missing field.
 *
 * @param {Event} [event] - Optional triggering event.
 * @returns {void}
 */
function clearSettings(event) {}

/**
 * Rebuild the current rebate tool URL including all selected params.
 *
 * @returns {string} Full URL with query string.
 */
function assembleUrl() {}

/**
 * Copy the assembled URL to clipboard and show a feedback message.
 *
 * @param {Event} event - Triggering event.
 * @returns {void}
 */
function addLinkToClipboard(event) {}

/**
 * Show a temporary feedback message in the UI when link copied.
 *
 * @param {Event} event - Triggering event.
 * @param {string} targetSelector - CSS selector for root container.
 * @param {string} msg - Message to display.
 * @returns {void}
 */
function handleLinkCopiedMessageContent(event, targetSelector, msg) {}

/**
 * Initialize form state from current query string params.
 *
 * @returns {void}
 */
function initFromQueryString() {}

/**
 * Initialize form state from stored localStorage object.
 *
 * @param {Record<string, any>} data - Parsed localStorage state object.
 * @returns {void}
 */
function initFromLocalStorage(data) {}

/**
 * Update the browser address bar to match assembled state.
 *
 * @returns {void}
 */
function updateAddressBar() {}

/**
 * Handle building type change by resetting home value and focusing next.
 *
 * @async
 * @returns {Promise<void>}
 */
async function onBuildingTypeChange() {}

/**
 * Handle household size change by resetting income range and focusing next.
 *
 * @async
 * @returns {Promise<void>}
 */
async function onPersonsChange() {}

/**
 * Return a URL with the current query string appended.
 *
 * @param {string} baseUrl - Base URL to append to.
 * @returns {string} URL with query string or '#' if invalid.
 */
function withQueryString(baseUrl) {}
