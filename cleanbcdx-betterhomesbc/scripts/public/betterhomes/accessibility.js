/**
 * General Better Homes DOM manipulation for accessibility.
 */
const betterhomesBCAccessibilityLoader = () => {
	/*
	 * SafarIE iOS requires window.requestAnimationFrame update.
	 */
	window.requestAnimationFrame(() => {

		// Only run if Better Homes site.
		if ('betterhomesbc' === window.site.customBodyClass) {

			// Alt label header logo lockup correctly.
			const headerLogo = document.querySelector('.custom-logo-link img');
			
			headerLogo.setAttribute('alt', 'BC Government and Clean BC Better Homes logos');

			// Rebate specific accessibility.
			const rebatePage = document.querySelector('body.single-incentives');

			if (rebatePage) {

				// Remove legacy link targeting new tab/windows.
				const newTabLinks = document.querySelectorAll('a[target="_blank"]');

				if (newTabLinks) {
					newTabLinks.forEach(link => {
						link.removeAttribute('target');
					});
				}
				
				// Add ARIA labels to contact links.
				const addressContainer = document.querySelectorAll('.address');

				if (addressContainer) {
	
					addressContainer.forEach(section => {
						let currentHeading = '';
	
						// Traverse child nodes of the address section
						[...section.children].forEach(child => {
							if ('H4' === child.tagName) {
								// Strip "customers" and trim
								currentHeading = child.textContent.replace(/customers/i, '').trim();

								// Special case: change "FortisBC" to "Fortis BC"
								if ('FortisBC' === currentHeading) {
									currentHeading = 'Fortis BC';
								}
							}
	
							if ('UL' === child.tagName) {
								child.querySelectorAll('li').forEach(li => {
									const link = li.querySelector('a');
									if (!link) return;
	
									const liClass = li.className.trim(); // "phone", "site", "form", etc.
									if (!liClass) return;
	
									let labelType;
									if ('site' === liClass) {
										labelType = 'website';
									} else if ('phone' === liClass) {
										const phoneNumber = link.textContent.trim();
  										labelType = `telephone ${phoneNumber}`;
									} else if ('form' === liClass) {
										labelType = 'contact form';
									} else {
										labelType = liClass;
									}
	
									const ariaLabel = `${currentHeading} ${labelType}`;
									link.setAttribute('aria-label', ariaLabel);
								});
							}
						});
					});
				}
			}
		}
	});
};

if ('complete' === document.readyState) {
	betterhomesBCAccessibilityLoader();
} else {
	document.addEventListener('DOMContentLoaded',
		betterhomesBCAccessibilityLoader
	);
}
