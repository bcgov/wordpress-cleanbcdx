/**
 * Incentives and rebates in-page navigation generator DOM manipulation.
 *
 * @param {Array<HTMLElement>} links The nav links to reset/apply active state for.
 * @param {HTMLElement|null|undefined} activeLink The link to mark as active.
 * @return {void}
 */
const setActiveLink = (links, activeLink) => {
	links.forEach((link) => {
		if (link.parentNode) {
			link.parentNode.classList.remove('active');
		}
	});

	if (activeLink && activeLink.parentNode) {
		activeLink.parentNode.classList.add('active');
	}
};

const initializeInPageNav = (sideNav) => {
	const inPageNav = sideNav.querySelector('.in-page-nav');
	if (!inPageNav) {
		return;
	}

	const inPageNavLinks = Array.from(inPageNav.querySelectorAll('a'));
	if (0 === inPageNavLinks.length) {
		return;
	}

	let clickedOnNav = false;
	const targets = inPageNavLinks
		.map((targetLink) => document.querySelector(targetLink.getAttribute('href')))
		.filter(Boolean);

	if (targets.length > 0 && 'IntersectionObserver' in window) {
		const observer = new window.IntersectionObserver(
			(entries) => {
				if (clickedOnNav) {
					return;
				}

				const firstVisibleEntry = entries.find((entry) => entry.isIntersecting);
				if (!firstVisibleEntry) {
					return;
				}

				const visibleLink = inPageNavLinks.find(
					(link) => link.getAttribute('href') === `#${firstVisibleEntry.target.id}`
				);
				setActiveLink(inPageNavLinks, visibleLink);
			},
			{
				rootMargin: '15% 0% -75% 0%',
			}
		);

		targets.forEach((target) => {
			observer.observe(target);
		});
	}

	inPageNavLinks.forEach((link) => {
		link.addEventListener('click', () => {
			setActiveLink(inPageNavLinks, link);
			clickedOnNav = true;

			const target = document.querySelector(link.getAttribute('href'));
			if (target) {
				target.style.scrollMarginTop = '32px';
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});

				setTimeout(() => {
					target.setAttribute('tabindex', '0');
					target.focus();
					target.style.outline = 'none';
				}, 1000);
			}

			setTimeout(() => {
				clickedOnNav = false;
			}, 1000);
		});
	});

	setActiveLink(inPageNavLinks, inPageNavLinks[0]);
};

const addStickyMobileTitle = () => {
	const inStickyNav = document.querySelector('.sticky');
	if (!inStickyNav || inStickyNav.querySelector('.mobile-only')) {
		return;
	}

	const mobileNavTitle = document.createElement('h2');
	mobileNavTitle.className = 'mobile-only';
	mobileNavTitle.textContent = 'On this page';
	inStickyNav.insertBefore(mobileNavTitle, inStickyNav.firstChild);
};

const bcgovBlockThemePluginSideNav = () => {
	/*
	 * SafarIE bug requires 0ms timeout.
	 */
	setTimeout(() => {
		const detailsContainer = document.querySelector('#incentive-details-container');
		const sideNav = document.querySelector('#incentive-side-nav');

		if (!detailsContainer || !sideNav) {
			return;
		}

		// Clear the existing content of #incentive-side-nav.
		sideNav.innerHTML = '';

		// Find all H2 elements inside the #incentive-details-container.
		const headings = detailsContainer.querySelectorAll('h2[id]');

		// Create a new list for navigation.
		const navListContainer = document.createElement('nav');
		navListContainer.classList.add('side-nav', 'bb-nav', 'wp-block-navigation', 'is-vertical', 'wp-container-core-navigation-layout-2');
		navListContainer.classList.add('in-page-nav');

		const navList = document.createElement('ul');
		navList.classList.add('side-nav', 'bb-nav', 'wp-block-navigation', 'is-vertical', 'wp-block-navigation__container');

		// Loop through the H2 elements to create links.
		headings.forEach((heading) => {
			const id = heading.id;
			const text = heading.textContent.trim();

			// Create a list item.
			const listItem = document.createElement('li');
			listItem.classList.add('wp-block-navigation-item', 'wp-block-navigation-link');

			// Create a link element.
			const link = document.createElement('a');
			link.href = `#${id}`;
			link.textContent = text;
			link.classList.add('wp-block-navigation-item__content');

			// Append the link to the list item.
			listItem.appendChild(link);

			// Append the list item to the navigation list.
			navList.appendChild(listItem);
		});

		// Append the navigation list to the side navigation.
		navListContainer.appendChild(navList);
		sideNav.appendChild(navListContainer);
		sideNav.classList.remove('admin-instructions');

		initializeInPageNav(sideNav);
		addStickyMobileTitle();
	}, 0);
};

if ('complete' === document.readyState) {
	bcgovBlockThemePluginSideNav();
} else {
	document.addEventListener('DOMContentLoaded',
		bcgovBlockThemePluginSideNav
	);
}
