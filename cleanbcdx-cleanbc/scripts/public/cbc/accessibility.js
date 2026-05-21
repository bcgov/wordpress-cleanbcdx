/**
 * General CleanBC DOM manipulation for accessibility.
 */
const cleanbcAccessibilityLoader = () => {
	/*
	 * SafarIE iOS requires window.requestAnimationFrame update.
	 */
	window.requestAnimationFrame( () => {

		// Only run if CleanBC site.
		if ('cleanbc' === window.site.customBodyClass) {

			// Alt label header logo lockup correctly.
			const headerLogo = document.querySelector('.custom-logo-link img');
			headerLogo.setAttribute('alt', 'BC Government and Clean BC logos');
		}
	});
};

if ( 'complete' === document.readyState ) {
	cleanbcAccessibilityLoader();
} else {
	document.addEventListener('DOMContentLoaded',
		cleanbcAccessibilityLoader
	);
}
