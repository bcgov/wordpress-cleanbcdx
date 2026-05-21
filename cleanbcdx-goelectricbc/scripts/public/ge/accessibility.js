/**
 * General Go Electric DOM manipulation for accessibility.
 */
const goEVAccessibilityLoader = () => {
	/*
	 * SafarIE iOS requires window.requestAnimationFrame update.
	 */
	window.requestAnimationFrame( () => {

		// Only run if Go Electric site.
		if ('goelectricbc' === window.site.customBodyClass) {

			// Alt label header logo lockup correctly.
			const headerLogo = document.querySelector('.custom-logo-link img');
			headerLogo.setAttribute('alt', 'BC Government and Clean BC Go Electric logos');
		}
	});
};

if ( 'complete' === document.readyState ) {
	goEVAccessibilityLoader();
} else {
	document.addEventListener('DOMContentLoaded',
		goEVAccessibilityLoader
	);
}
