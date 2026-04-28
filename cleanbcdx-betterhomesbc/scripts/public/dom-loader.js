/**
 * General CleanBC DOM manipulation.
 */
const bcgovBlockThemePluginDomLoader = () => {
	/*
	 * SafarIE iOS requires window.requestAnimationFrame update.
	 */
	window.requestAnimationFrame( () => {
		const body = document.querySelector( 'body' );
		const siteHeader = document.querySelector( '.bcgov-site-header' );
		
		// Set scrollpadding.
		if (siteHeader) {
			setTimeout( () => {
				document.documentElement.style.scrollPadding = `calc(${window.getComputedStyle( siteHeader ).getPropertyValue( 'height' )} + 30px)`;
			}, 500);
		}

		body.classList.add( 'cleanbc-plugin' );
		// CleanBC Icon Buttons
		const iconButtons = document.querySelectorAll( 'a.icon' );
		if ( iconButtons.length ) {
			iconButtons.forEach( ( button ) => {
				if ( null === button.getAttribute( 'href' ) ) {
					button.setAttribute( 'tabindex', '-1' );
					button.style.pointerEvents = 'none';
				}
			} );
		}

		// This should be CSS...
		const iconButtonContainers = document.querySelectorAll(
			'.wp-block-button.is-style-icon'
		);
		if ( iconButtonContainers.length ) {
			iconButtonContainers.forEach( ( container ) => {
				const containerLink = container.querySelector( 'a' );
				if (
					null !== containerLink &&
					! container.classList.contains( 'has-size-large' )
				) {
					containerLink.style.outlineOffset = '1rem';
				}
			} );
		}

		// Handle pressing escape when search input field is in use.
        const searchFieldContainer = document.querySelector('#search-field-container');
		const toggleSearchBtn = document.querySelector( '.toggle-search-btn a' );

		if (searchFieldContainer && toggleSearchBtn) {
			searchFieldContainer.addEventListener('keydown', (event) => {
				if ( 'Escape' === event.code ) {
					searchFieldContainer.blur();
					toggleSearchBtn.focus();
				    searchFieldContainer.classList.add( 'hidden' );
				}
            });
		}

		const isLinkedCards = document.querySelector('.linked-cards');
        const linkedCardGroup = document.querySelectorAll('.linked-card');

        if (isLinkedCards || linkedCardGroup) {
            if (linkedCardGroup) {
                linkedCardGroup.forEach((group) => {
                    const headline = group.querySelector('.linked-card-title');
                    if (headline) {
                        const headlineLink = headline.querySelector('a');
                        if (headlineLink) {
                            if (headlineLink.firstChild) {
                                headline.replaceChild(
                                    headlineLink.firstChild,
                                    headlineLink
                                );
                            } else {
                                headline.remove();
                            }
                            const link = headlineLink.getAttribute('href');
                            const linkWrapper = document.createElement('a');
                            linkWrapper.href = link;
                            group.parentNode.insertBefore(linkWrapper, group);
                            linkWrapper.appendChild(group);
                            linkWrapper.classList.add('card-title-link');
                        }
                    }
                });
            }
        }

		// Re-process external links added by the Block Theme.
		const processExternalLinks = () => {
			const observer = new MutationObserver((mutationsList, observer) => {
				// Check if any links have been given the 'external' class.
				const externalLinks = document.querySelectorAll('a.external:not(#postFilterApp a, #pqeasResults a, #contractorFilterApp a, .vue-card-content a)');
				if (externalLinks.length > 0) {
					// Externally updated classes identified. Processing links.
					observer.disconnect(); // Stop observing once links are found.
					externalLinks.forEach((link) => {
						// Skip links with mailto: or tel:
						if (link.href.startsWith('mailto:') || link.href.startsWith('tel:')) {
							// Special handling for mailto links: replace @ and . with &#8203;
							if (link.href.startsWith('mailto:')) {
								const email = link.href.slice(7); // Remove "mailto:" part
								link.innerHTML = link.innerHTML.replace(email, email.replace(/@/g, '&#8203;@').replace(/\./g, '&#8203;.'));
							}
							return; // Skip further processing for mailto or tel links
						}
		
						const svg = link.querySelector('svg');
						if (svg) {
							const linkText = link.textContent;

							// Leave PDF-labelled links to the PDF injector logic.
							if (/\[PDF\b/i.test(linkText || '')) {
								return;
							}
		
							if (linkText && linkText.trim().length > 0) {
								const words = linkText.trim().split(' ');
								const lastWord = words.pop();
								const restOfText = words.join(' ');
		
								const span = document.createElement('span');
								span.classList.add('last-word', 'no-wrap');
								span.textContent = lastWord;
		
								span.appendChild(svg);
								link.innerHTML = `${restOfText} `;
								link.appendChild(span);
							}
						}
					});
				}
			});
		
			// Start observing the document for changes.
			observer.observe(document.body, {
				childList: true, // Watch for added/removed child nodes.
				subtree: true,   // Watch all descendants.
				attributes: true // Watch for attribute changes.
			});
		
			// Fallback: Stop observing after a timeout to avoid endless observation.
			setTimeout(() => observer.disconnect(), 10000); 
		};		
		
		// Start watching for external links.
		processExternalLinks();
		
	});
};

if ( 'complete' === document.readyState ) {
	bcgovBlockThemePluginDomLoader();
} else {
	document.addEventListener('DOMContentLoaded',
		bcgovBlockThemePluginDomLoader
	);
}
