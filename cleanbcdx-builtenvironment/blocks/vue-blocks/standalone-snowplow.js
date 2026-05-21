import { debug } from './shared-functions.js';

/**
 * Snowplow analytics loader for local development only. 
 * Some helper functions that if needed will be moved into the shared-functions.js script file as export functions.
 *
 * @return {void}
 */
export const localAnalyticsReady = () => {

	const isServerEnv = window.site?.domain.includes('bc.ca');
	const isLocalEnv = window.site?.domain.includes('.local');

	if (!isServerEnv || isLocalEnv) {
		
		// ----------------------------------------------
		// Snowplow (as-is) standalone for local testing.
		// ----------------------------------------------
		(function (p, l, o, w, i, n, g) {
			if (!p[i]) {
				p.GlobalSnowplowNamespace = p.GlobalSnowplowNamespace || [];
				p.GlobalSnowplowNamespace.push(i); p[i] = function () {
					(p[i].q = p[i].q || []).push(arguments)
				}; p[i].q = p[i].q || []; n = l.createElement(o); g = l.getElementsByTagName(o)[0]; n.async = 1;
				n.src = w; g.parentNode.insertBefore(n, g)
			}
		}(window, document, "script", "https://www2.gov.bc.ca/StaticWebResources/static/sp/sp-2-14-0.js", "snowplow"));
	
		const collector = 'spt.apps.gov.bc.ca';
		window.snowplow('newTracker', 'rt', collector, {
			appId: "Snowplow_standalone",
			cookieLifetime: 86400 * 548,
			platform: 'web',
			post: true,
			forceSecureTracker: true,
			contexts: {
				webPage: true,
				performanceTiming: true
			}
		});
		window.snowplow('enableActivityTracking', 30, 30);
		window.snowplow('enableLinkClickTracking');
		window.snowplow('trackPageView');
    }


	/* ------------------------------------------------------------------------
	  Helpers
	------------------------------------------------------------------------- */

	// Vanilla equivalent of getUrlParamArray
	const getUrlParamArray = (param, defaultValue) => {
		const vars = [];
		window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
			if (key === param) {
				vars.push(value);
			}
		});
		return vars.length ? vars : [defaultValue];
	};

	// Return all query string values as an object
	const getQueryStringValues = () => {
		const urlParams = new URLSearchParams(window.location.search);
		const entries = {};
		for (const [k, v] of urlParams.entries()) {
			entries[k] = v;
		}
		return entries;
	};

	// "hoverIntent"-like utility
	const addHoverIntent = (element, overFn, outFn, timeout = 0) => {
		let hoverTimer = null;
		element.addEventListener('mouseenter', () => {
			if (hoverTimer) clearTimeout(hoverTimer);
			hoverTimer = setTimeout(() => {
				overFn();
			}, timeout);
		});
		element.addEventListener('mouseleave', () => {
			if (hoverTimer) {
				clearTimeout(hoverTimer);
				hoverTimer = null;
			}
			if (typeof outFn === 'function') {
				outFn();
			}
		});
	};

	// Final confirm
	debug('DEV: Analytics script loaded. \n' +
		'DEV: Set debugState = true for console logs. If you see this message it is set to \'true\' \n' +
		'DEV: Set disableClicks = true to prevent real clicks.');

}