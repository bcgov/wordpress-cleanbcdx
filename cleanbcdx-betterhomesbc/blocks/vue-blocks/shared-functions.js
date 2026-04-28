let debugState = false; // Change to true for debug logs

/**
 * Logs a message to the console when debug mode is enabled.
 *
 * @param {string} msg - The debug message to display in the console.
 * @param {'log' | 'error'} [status='log'] - Determines which console method to use. 
 *   Use "error" to log with `console.error`, otherwise `console.log`.
 */
export const debug = (msg, status = 'log') => {
	if (debugState) {
		if (status === 'error') {
			console.error(msg);
		} else {
			console.log(msg);
		}
	}
};


/**
 * Decodes HTML character entities in a given string.
 *
 * This function takes a string containing HTML character entities  * (e.g., `&amp;`, `&lt;`, `&#39;`) 
 * and decodes them into their corresponding characters (e.g., `&`, `<`, `'`).
 *
 * @param {string} text - The string containing HTML entities to decode.
 * @returns {string} - The decoded string with entities replaced by their corresponding characters.
 *
 * @example
 * const decoded = decodeHtmlEntities('What is the best way to reduce GHG&#8217;s emitted by my home?');
 * console.log(decoded); // Output: 'What is the best way to reduce GHG’s emitted by my home?'
 */
export function decodeHtmlEntities(text) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(text, 'text/html');
	return doc.documentElement.textContent;
}

/**
 * Sorts an array of objects alphabetically based on a specified property.
 *
 * @param {Object[]} array - The array of objects to sort.
 * @param {string} key - The key or property path (e.g., 'company_name') to sort by.
 * @param {string} [order='asc'] - The sort order: 'asc' for ascending, 'desc' for descending.
 * @returns {Object[]} - The array sorted by the specified property and order.
 *
 * @example
 * const contractors = [
 *   { company_name: 'Zebra Corp', id: 1 },
 *   { company_name: 'Alpha LLC', id: 2 },
 *   { company_name: 'Mango Inc', id: 3 }
 * ];
 * const sortedAsc = sortArrayAZ(contractors, 'company_name');
 * console.log(sortedAsc);
 * // Ascending:
 * // [
 * //   { company_name: 'Alpha LLC', id: 2 },
 * //   { company_name: 'Mango Inc', id: 3 },
 * //   { company_name: 'Zebra Corp', id: 1 }
 * // ]
 *
 * const sortedDesc = sortArrayAZ(contractors, 'company_name', 'desc');
 * console.log(sortedDesc);
 * // Descending:
 * // [
 * //   { company_name: 'Zebra Corp', id: 1 },
 * //   { company_name: 'Mango Inc', id: 3 },
 * //   { company_name: 'Alpha LLC', id: 2 }
 * // ]
 */
export function sortArray(array, key, order = 'asc') {
	return array.slice().sort((a, b) => {
	  const valueA = key.split('.').reduce((obj, k) => obj && obj[k], a) || '';
	  const valueB = key.split('.').reduce((obj, k) => obj && obj[k], b) || '';
	  const comparison = valueA.localeCompare(valueB, undefined, { sensitivity: 'base' });
	  return order === 'desc' ? -comparison : comparison;
	});
  }

/**
 * Function to shuffle an array.
 *
 * @param {Array} - The array to be randomised.
 * @returns {Array} - The updated array of contractor results.
 */
export function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
};

/**
 * Function to scroll to a target element and set focus on the first tabbable item.
 *
 * @param {string} el - The ID of the target element.
 * @param {string} [scrollMarginTop=0] - The margin from the top of the viewport in pixels (e.g., '50px').
 * @returns {void}
 */
export function scrollToElementID(el, scrollMarginTop = '0px') {
	const target = document.querySelector(`#${el}`);
	if (target) {
		// Temporarily apply scroll-margin-top for the target element
		const originalScrollMarginTop = target.style.scrollMarginTop;
		target.style.scrollMarginTop = scrollMarginTop;

		// Scroll the element into view
		target.scrollIntoView({ behavior: 'smooth', block: 'start' });

		// Restore the original scroll margin after scrolling
		setTimeout(() => {
			target.style.scrollMarginTop = originalScrollMarginTop || '';

			// Move focus to the first tabbable item within the target
			const tabbableItem = target.querySelector('a');
			if (tabbableItem) {
				tabbableItem.focus();
				tabbableItem.blur();
			} else {
				console.warn(`No tabbable items found within #${el}.`);
			}
		}, 500); // Align this duration with your scrolling animation duration
	} else {
		console.warn(`Target element #${el} not found.`);
	}
}

