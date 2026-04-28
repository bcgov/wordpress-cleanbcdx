import { debug } from './shared-functions.js';

/**
 * REBATES Tool events
 * For Better Homes BC and Better Buildings BC
 */

/**
 * Fires a Snowplow event for a user clicking on a rebate item using a link.
 * See: https://github.com/bcgov/GDX-Analytics/blob/master/examples/schemas/ca.bc.gov.cleanbc/rst/jsonschema/2-0-0
 *
 * Note: "action" data can be "hover", "click", "submit", "change", "select", or "deselect" options.
 * 
 * @param {Object} params
 * @param {string} params.projectType
 * @param {string} params.location
 * @param {string} params.heatingType
 * @param {Array<string>} params.filterValues
 * @param {string} params.label - e.g. the rebate title
 * @param {string} [params.rebateText]
 * @param {string} [params.destination] - a URL
 */
export function trackRebateClick({
	projectType,
	location,
	heatingType,
	filterValues,
	label,
	rebateText,
	destination
}) {
	if (window.snowplow) {
		window.snowplow('trackSelfDescribingEvent', {
			schema: 'iglu:ca.bc.gov.cleanbc/rst/jsonschema/3-0-0',
			data: {
				action: 'click',
				element_type: 'rebate',
				project_type: projectType,
				location,
				heating_type: heatingType,
				filter_values: filterValues,
				label,        // the rebate title
				rebate: rebateText,
				destination   // a link URL
			}
		});
	} else {
		debug('Snowplow analytics not loaded.');
	}
}

/**
 * Fires a Snowplow event whenever a filter option is changed using a select input.
 *
 * @param {Object} params - The parameters for the analytics event.
 * @param {string} params.projectType - Current selected build type (e.g., 'Renovation', 'New Build', etc.).
 * @param {string} params.location - The user’s selected location (e.g., 'Vancouver', 'Kelowna', ...).
 * @param {string} params.heatingType - The user’s selected heating system (e.g., 'Heat Pump').
 * @param {Array<string>} params.filterValues - An array of all selected upgrade types.
 * @param {string} params.label - The specific upgrade type just selected or deselected.
 */
export const trackRebateFilterChange = ({
	projectType,
	location,
	heatingType,
	filterValues,
	label
}) => {
	if (window.snowplow) {
		window.snowplow('trackSelfDescribingEvent', {
			schema: 'iglu:ca.bc.gov.cleanbc/rst/jsonschema/3-0-0',
			data: {
				action: 'change',
				element_type: 'filter',
				project_type: projectType,
				location,
				heating_type: heatingType,
				filter_values: filterValues,
				label
			}
		});
		debug(`Snowplow filter changed: ${filterValues} => ${location}`);
		debug('trackFilterChange data: {\n  action: change, \n  element_type: filter, \n  project_type: ' + projectType + ', \n  location: ' + location + ', \n  heating_type: ' + heatingType + ', \n  filter_values: ' + filterValues + ', \n  label: ' + label + ' \n}');
	} else {
		debug('Snowplow analytics not loaded.');
	}
}

/**
 * Fires a Snowplow event whenever an upgrade type is selected or deselected using a checkbox input.
 *
 * @param {Object} params - The parameters for the analytics event.
 * @param {string} params.action - Either 'select' or 'deselect'.
 * @param {string} params.projectType - Current selected build type (e.g., 'Renovation', 'New Build', etc.).
 * @param {string} params.location - The user’s selected location (e.g., 'Vancouver', 'Kelowna', ...).
 * @param {string} params.heatingType - The user’s selected heating system (e.g., 'Heat Pump').
 * @param {Array<string>} params.filterValues - An array of all selected upgrade types.
 * @param {string} params.label - The specific upgrade type just selected or deselected.
 */
export const trackRebateUpgradeTypeChange = ({
	action,         // 'select' or 'deselect'
	projectType,
	location,
	heatingType,
	filterValues,
	label
}) => {
	if (window.snowplow) {
		window.snowplow('trackSelfDescribingEvent', {
			schema: 'iglu:ca.bc.gov.cleanbc/rst/jsonschema/3-0-0',
			data: {
				action,                // 'select' or 'deselect'
				element_type: 'filter',
				project_type: projectType,
				location,
				heating_type: heatingType,
				filter_values: filterValues, // array of all selected upgrade types
				label                  // which upgrade type was just selected/deselected
			}
		});
		debug(`Snowplow upgrade type ${action}: ${label}`);
	} else {
		debug('Snowplow analytics not loaded.');
	}
}


/**
 * FAQ Tool events
 * For Better Homes BC and Better Buildings BC
 */


/**
 * Track a FAQ search input change.
 * 
 * @param {Object} params
 * @param {string} params.newValue - The new search string.
 * @param {string} params.oldValue - The previous search string.
 */
export function trackFaqSearch({
		newValue, 
		oldValue 
	}) {
	if (window.snowplow) {
		window.snowplow('trackSelfDescribingEvent', {
			schema: 'iglu:ca.bc.gov.cleanbc/faq/jsonschema/1-0-0',
			data: {
				action: 'search',
				element_type: 'faq-text-search',
				old_value: oldValue,
				new_value: newValue
			}
		}); 
		debug(`Snowplow upgrade type 'search': ${newValue}`);
	} else {
		debug('Snowplow analytics not loaded.');
	}
}

/**
 * Track a FAQ category or filter change.
 * 
 * @param {Object} params
 * @param {string} params.filterName - 'category' or 'additionalFilter'
 * @param {string} params.newValue - The newly selected value.
 * @param {string} [params.oldValue] - The old value if needed.
 */
export function trackFaqFilterChange({ filterName, newValue, oldValue }) {
	if (window.snowplow) {
		window.snowplow('trackSelfDescribingEvent', {
			schema: 'iglu:ca.bc.gov.cleanbc/faq/jsonschema/1-0-0',
			data: {
				action: 'change',
				element_type: `faq-${filterName}`,
				old_value: oldValue || '',
				new_value: newValue
			}
		}); 
		debug(`Snowplow upgrade type 'change' ${filterName}: ${newValue}`);
	} else {
		debug('Snowplow analytics not loaded.');
	}
}

/**
 * Track a FAQ accordion expand or collapse action.
 *
 * @param {Object} params
 * @param {'expand' | 'collapse'} params.action
 * @param {number | string} params.faqId - Unique ID of the FAQ
 * @param {string} params.faqTitle - Title of the FAQ
 */
export function trackFaqAccordionToggle({ action, faqId, faqTitle }) {
	if (window.snowplow) {
		window.snowplow('trackSelfDescribingEvent', {
			schema: 'iglu:ca.bc.gov.cleanbc/faq/jsonschema/1-0-0',
			data: {
				action,               // 'expand' or 'collapse'
				element_type: 'faq-accordion',
				faq_id: faqId,
				faq_title: faqTitle
			}
		}); 
		debug(`Snowplow upgrade type ${action}: ${faqTitle}`);
	} else {
		debug('Snowplow analytics not loaded.');
	}
}

/**
 * Track a click on a link *within* an expanded FAQ.
 * 
 * @param {Object} params
 * @param {number | string} params.faqId - Unique ID of the FAQ
 * @param {string} params.faqTitle - Title of the FAQ
 * @param {string} params.href - The link URL clicked
 * @param {string} [params.linkText] - The link's text, if available
 */
export function trackFaqLinkClick({ faqId, faqTitle, href, linkText }) {
	if (window.snowplow) {
		window.snowplow('trackSelfDescribingEvent', {
			schema: 'iglu:ca.bc.gov.cleanbc/faq/jsonschema/1-0-0',
			data: {
				action: 'click',
				element_type: 'faq-internal-link',
				faq_id: faqId,
				faq_title: faqTitle,
				destination: href,
				label: linkText || ''
			}
		}); 
		debug(`Snowplow upgrade type 'click': ${linkText}`);
	} else {
		debug('Snowplow analytics not loaded.');
	}
}


/**
 * CONTRACTORS and ENERGY ADVISORS (PQEAs) tools events
 * For Better Homes BC
 */

// analytics-schemas.js

/**
 * Fires a Snowplow event when a user changes a contractor filter
 * (e.g., upgrade type, program, location).
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.upgradeType - e.g. "Heat Pump" or "all"
 * @param {string} params.program     - e.g. "CleanBC" or "all"
 * @param {string} params.location    - e.g. "Vancouver" or "all"
 * @param {string} params.label       - A descriptive label for what changed
 */
export function trackProviderFilterChange({
	filterName,
	upgradeType,
	program,
	location,
	label
  }) {
	window.snowplow('trackSelfDescribingEvent', {
	  schema: 'iglu:ca.bc.gov.cleanbc/providers/jsonschema/1-0-0',
	  data: {
		action: 'change',
		element_type: `${filterName}-filter`,
		upgrade_type: upgradeType,
		program,
		service_location: location,
		label
	  }
	});
  }
  
  /**
   * Fires a Snowplow event when the user clicks a contractor link.
   *
   * @param {Object} params - The parameters object.
   * @param {string} params.upgradeType - Current filter for upgrade type
   * @param {string} params.program     - Current filter for program
   * @param {string} params.location    - Current filter for location
   * @param {string} params.companyName - Contractor company name or link text
   * @param {string} [params.destination] - The link URL
   */
  export function trackProviderClick({
	filterName,
	upgradeType,
	program,
	location,
	companyName,
	destination
  }) {
	window.snowplow('trackSelfDescribingEvent', {
	  schema: 'iglu:ca.bc.gov.cleanbc/providers/jsonschema/1-0-0',
	  data: {
		action: 'click',
		element_type: `${filterName}-link`,
		upgrade_type: upgradeType,
		program,
		service_location: location,
		label: companyName,
		destination
	  }
	});
  }
