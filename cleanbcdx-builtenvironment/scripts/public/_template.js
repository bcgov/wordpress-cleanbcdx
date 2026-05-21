const bcgovBlockThemePlugin = () => {
	/*
		* SafarIE iOS requires window.requestAnimationFrame update.
		*/
	window.requestAnimationFrame( () => {
		// console.log('General script loaded');
	} );
};

if ( 'complete' === document.readyState ) {
	bcgovBlockThemePlugin.initFrontendGeneral();
} else {
	document.addEventListener(
		'DOMContentLoaded',
		bcgovBlockThemePlugin
	);
}
