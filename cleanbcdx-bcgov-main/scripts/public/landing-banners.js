/**
 * Landing banners manipulation.
 */
const bcgovBlockThemePluginLandingBanners = () => {
	/*
	 * SafarIE iOS requires window.requestAnimationFrame update.
	 */
	window.requestAnimationFrame( () => {
		/*
		 * Add a clip path SVG to create a mask on landing banner ::before elements.
		 * Works in conjuction with .landing-cover-banner styles in _cleanbc--patterns-banners.scss.
		 */
		const isHomeBanner = document.querySelectorAll( '.home-cover-banner' );
		const isLandingBanner = document.querySelectorAll( '.landing-cover-banner' );

		if ( isHomeBanner.length || isLandingBanner.length ) {
			const svgNamespace = 'http://www.w3.org/2000/svg';
			const svg = document.createElementNS( svgNamespace, 'svg' );
			const clipElementDefs = document.createElementNS(
				svgNamespace,
				'defs'
			);
			const clipElementClipPath = document.createElementNS(
				svgNamespace,
				'clipPath'
			);
			clipElementClipPath.setAttribute( 'id', 'svgPath' );
			const clipElementPath = document.createElementNS(
				svgNamespace,
				'path'
			);
			clipElementPath.setAttribute(
				'd',
				'M0,77.2v-24.7c0,-8.6,6.8,-15.6,15.3,-16l901.5,-36.6c44.3,-1.7,81.5,33.1,83.2,77.5l-1000,-0.2z'
			);
			clipElementClipPath.setAttribute( 'transform', 'scale(1.44)' );

			// Build the SVG structure
			svg.appendChild( clipElementDefs );
			clipElementDefs.appendChild( clipElementClipPath );
			clipElementClipPath.appendChild( clipElementPath );

			// Set attributes and styles
			svg.setAttribute( 'xmlns', svgNamespace );
			svg.setAttribute( 'xmlns:xlink', 'http://www.w3.org/1999/xlink' );
			svg.setAttribute( 'version', '1.1' );
			svg.setAttribute( 'width', '100' );
			svg.setAttribute( 'height', '100' );
			svg.setAttribute( 'viewBox', '0 0 100 100' );
			svg.setAttribute( 'preserveAspectRatio', 'none' );
			svg.style.position = 'absolute';
			svg.style.top = '0';
			svg.style.left = '0';
			svg.style.visibility = 'visible';

			// Insert the SVG after the body tag
			const body = document.getElementsByTagName( 'body' )[ 0 ];
			body.insertAdjacentElement( 'afterbegin', svg );
		}
	} );
};

if ( 'complete' === document.readyState ) {
	bcgovBlockThemePluginLandingBanners();
} else {
	document.addEventListener('DOMContentLoaded',
		bcgovBlockThemePluginLandingBanners
	);
}
