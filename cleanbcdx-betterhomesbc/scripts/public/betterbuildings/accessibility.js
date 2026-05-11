/**
 * General Better Buildings DOM manipulation for accessibility.
 */
const betterbuildingsAccessibilityLoader = () => {
	/*
	 * SafarIE iOS requires window.requestAnimationFrame update.
	 */
	window.requestAnimationFrame( () => {

		// Only run if Better Buildings site.
		if ('betterbuildingsbc' === window.site.customBodyClass) {

			// Alt label header logo lockup correctly.
			const headerLogo = document.querySelector('.custom-logo-link img');
			headerLogo.setAttribute('alt', 'BC Government and Clean BC Better Buildings logos');
		}
	});
};

if ( 'complete' === document.readyState ) {
	betterbuildingsAccessibilityLoader();
} else {
	document.addEventListener('DOMContentLoaded',
		betterbuildingsAccessibilityLoader
	);
}
