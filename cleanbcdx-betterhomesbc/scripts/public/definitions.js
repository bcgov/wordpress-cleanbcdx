/**
 * General CleanBC Definitons dialog generator.
 */
export function cleanbcdxBhDefinitions() {
    /*
     * SafarIE iOS requires window.requestAnimationFrame update.
     */
    window.requestAnimationFrame(() => {
        const links = document.querySelectorAll('a:not(#postFilterApp a)');

        const definitionLinks = Array.from(links).filter((link) => {
            return link.href.includes('definitions');
        });

        /**
         * Adds event listeners for click and keypress events to the specified element.
         *
         * @param {HTMLElement} element - The DOM element to which the event listeners will be added.
         *
         * @fires click - Triggered when the element is clicked.
         * @fires keypress - Triggered when a key is pressed while the element is focused.
         */
        const addEventListeners = (element) => {
            element.addEventListener('click', handleClick);
            element.addEventListener('keypress', handleKeypress);
        };

        /**
         * Handles click and keypress events, fetching and displaying content based on a URL.
         *
         * @async
         * @param {Event} event - The event object triggered by a user interaction.
         * @property {string} event.type - The type of the event (e.g., 'click', 'keypress').
         * @property {string} [event.key] - The key pressed during a keypress event (e.g., 'Enter').
         * @property {HTMLElement} event.currentTarget - The element on which the event listener is attached.
         *
         * @throws {Error} Throws an error if the fetch operation fails or required elements are not found.
         *
         * @description
         * - If the event is a `click` or a `keypress` with the `Enter` key, the function prevents the default action.
         * - It checks if the URL's content is cached in `sessionStorage`.
         * - If cached, it retrieves and displays the content.
         * - If not cached, it fetches the content from the URL, parses it, and displays it.
         * - The fetched content is cached in `sessionStorage` for future use.
         */
        const handleClick = async (event) => {
            if (
                'click' === event.type ||
                ('keypress' === event.type && 'Enter' === event.key)
            ) {
                event.preventDefault();
                setDialogWidth(shouldUseWideDialog(event.currentTarget));
                const url = event.currentTarget.getAttribute('href');
                const cachedData = window.sessionStorage.getItem(url);

                if (cachedData) {
                    const { title, content } = JSON.parse(cachedData);
                    displayContent(title, content);
                } else {
                    try {
                        const response = await fetch(url);

                        if (!response.ok) {
                            throw new Error(
                                `HTTP error! Status: ${response.status}`
                            );
                        }

                        const html = await response.text();
                        const parser = new window.DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');

                        const titleElement = doc.querySelector(
                            '.wp-block-post-title'
                        );
                        const contentElement =
                            doc.querySelector('.entry-content');

                        if (!titleElement || !contentElement) {
                            throw new Error(
                                'Required content not found in the fetched HTML.'
                            );
                        }

                        const title = titleElement.innerText;
                        const content = contentElement.innerHTML;
                        const dataToCache = { title, content };

                        window.sessionStorage.setItem(
                            url,
                            JSON.stringify(dataToCache)
                        );
                        displayContent(title, content);
                    } catch (error) {
                        console.error('Error fetching content:', error);
                    }
                }
            }
        };

        /**
         * Handles keypress events, triggering the `handleClick` function if the Enter key is pressed.
         *
         * @param {KeyboardEvent} event - The keyboard event object.
         * @property {string} event.key - The name of the key pressed (e.g., 'Enter').
         * @property {number} [event.keyCode] - The numeric keycode of the key pressed (e.g., 13 for Enter).
         *
         * @description
         * - Checks if the key pressed is the Enter key.
         * - If the Enter key is detected, the function delegates handling to the `handleClick` function.
         */
        const handleKeypress = (event) => {
            if ('Enter' === event.key || 13 === event.keycode) {
                handleClick(event);
            }
        };

        /**
         * Displays the specified content in a dialog and sets focus on the title.
         *
         * @param {string} title - The title to be displayed in the dialog.
         * @param {string} content - The HTML content to be displayed in the dialog.
         *
         * @description
         * - Updates the content of the dialog's `.dialog-content` element.
         * - Sets the `tabindex` of the title to `0` to make it focusable.
         * - Calls `showDialog()` to display the dialog.
         * - Moves focus to the title (`<h2>` element) after rendering.
         */
        const displayContent = (title, content) => {
            const dialogContent = document.querySelector(
                '#dialog .dialog-content'
            );
            dialogContent.innerHTML =
                '<h2 tabindex="0">' + title + '</h2>' + content;
            showDialog();
            dialogContent.querySelector('h2').focus();
        };

        /**
         * Displays a dialog element using the `showModal` method.
         *
         * @description
         * - Retrieves the dialog element with the ID `dialog`.
         * - Opens the dialog using the `showModal()` method, which displays it as a modal dialog.
         *
         * @throws {TypeError} Throws an error if the dialog element does not exist or is not a valid HTMLDialogElement.
         */
        const showDialog = () => {
            const dialog = document.getElementById('dialog');
            setBodyScrollLock(true);
            dialog.showModal();
        };

        const setBodyScrollLock = (isLocked) => {
            const html = document.documentElement;
            const body = document.body;

            if (!html || !body) {
                return;
            }

            if (isLocked) {
                html.style.overflow = 'hidden';
                body.style.margin = '0';
                body.style.height = '100%';
                body.style.overflow = 'hidden';
                body.style.left = '0';
                body.style.right = '0';
                body.style.width = '100%';
                return;
            }

            html.style.overflow = '';
            body.style.margin = '';
            body.style.height = '';
            body.style.overflow = '';
            body.style.left = '';
            body.style.right = '';
            body.style.width = '';
        };

        const setDialogWidth = (isWide) => {
            const dialog = document.getElementById('dialog');

            if (!dialog) {
                return;
            }

            dialog.classList.toggle('wide', isWide);
        };

        const closeDialogOnBackdropClick = (event) => {
            const dialog = event.currentTarget;

            if (!dialog || !dialog.open) {
                return;
            }

            const rect = dialog.getBoundingClientRect();
            const isInsideDialogBounds =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;

            if (!isInsideDialogBounds) {
                dialog.close();
            }
        };

        const shouldUseWideDialog = (triggerElement) => {
            if (!triggerElement) {
                return false;
            }

            if (triggerElement.classList.contains('wide')) {
                return true;
            }

            return Boolean(triggerElement.closest('.wide'));
        };

        if (definitionLinks.length > 0) {
            let dialog = document.getElementById('dialog');
            const needsDialog = !dialog;

            if (needsDialog) {
                dialog = document.createElement('dialog');
                dialog.id = 'dialog';
                dialog.className = 'dialog';
                dialog.setAttribute('aria-modal', true);
                dialog.setAttribute('aria-live', 'polite');
                dialog.innerHTML =
                    '<div class="dialog-content"></div><button id="close-dialog" aria-label="closes defintion dialog">Close</button>';
                document.body.appendChild(dialog);

                const closeDialogButton =
                    document.getElementById('close-dialog');

                closeDialogButton.addEventListener('click', () => {
                    dialog.close();
                    setDialogWidth(false);
                });

                dialog.addEventListener('close', () => {
                    setDialogWidth(false);
                    setBodyScrollLock(false);
                });

                dialog.addEventListener('click', closeDialogOnBackdropClick);
            }

            definitionLinks.forEach((link) => {
                if ('true' === link.dataset.definitionInit) {
                    return;
                }

                link.dataset.definitionInit = 'true';
                link.classList.add('icon-definition');
                link.setAttribute(
                    'aria-label',
                    'opens definition dialog for this concept'
                );

                const linkText = link.textContent;

                if (linkText && linkText.trim().length > 0) {
                    const words = linkText.trim().split(' ');
                    const lastWord = words.pop();
                    const restOfText = words.join(' ');

                    // Create a span element for the last word
                    const span = document.createElement('span');
                    span.classList.add('last-word', 'no-wrap');
                    span.textContent = lastWord;

                    link.innerHTML = `${restOfText} `;
                    link.appendChild(span);
                }

                addEventListeners(link);
            });
        }

        // Glossary list processor.
        const glossaryList = document.querySelector('.glossary-results ul');
        const glossaryNavContainer = document.querySelector(
            '#glossary-nav .wp-block-buttons'
        );
        const sampleButton =
            glossaryNavContainer?.querySelector('.wp-block-button');

        // Only run if required elements exist.
        if (!glossaryList || !glossaryNavContainer || !sampleButton) return;

        // Gather glossary items.
        const glossaryItems = Array.from(glossaryList.querySelectorAll('li'));
        let currentLetter = '';
        const letterAnchors = new Set();
        const usedTitleIds = new Map();

        const toSlug = (value) => {
            const slug = value
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            return slug.length > 0 ? slug : 'glossary-term';
        };

        const getUniqueId = (base) => {
            const existingCount = usedTitleIds.get(base) || 0;
            const nextCount = existingCount + 1;
            usedTitleIds.set(base, nextCount);
            return 0 === existingCount ? base : `${base}-${nextCount}`;
        };

        glossaryItems.forEach((item) => {
            const titleElement = item.querySelector('h3');
            if (!titleElement) return;

            const titleText = titleElement.textContent.trim();
            const titleIdBase = toSlug(titleText);
            titleElement.id = getUniqueId(titleIdBase);
            const firstLetter = titleText.charAt(0).toUpperCase();

            if (firstLetter !== currentLetter) {
                currentLetter = firstLetter;
                letterAnchors.add(currentLetter); // Collect for nav

                // Create <h2 id="glossary-a">A</h2>
                const h2 = document.createElement('h2');
                h2.textContent = currentLetter;
                h2.id = `glossary-${currentLetter.toLowerCase()}`;
                h2.classList.add('glossary-inline-letter');

                // Create wrapper <li>
                const wrapper = document.createElement('li');
                wrapper.classList.add('glossary-entry-group');

                // Create flex container
                const flexContainer = document.createElement('div');
                flexContainer.classList.add('glossary-entry-flex');

                // Create a div to hold the term content (instead of <li>)
                const termWrapper = document.createElement('div');
                termWrapper.classList.add('glossary-entry');

                // Move the item's children into the termWrapper
                while (item.firstChild) {
                    termWrapper.appendChild(item.firstChild);
                }

                // Add <h2> and term to the flex container
                flexContainer.appendChild(h2);
                flexContainer.appendChild(termWrapper);

                // Add the flex container to the wrapper <li>
                wrapper.appendChild(flexContainer);

                // Replace the original <li> with the new wrapper
                glossaryList.replaceChild(wrapper, item);
            }
        });

        // Build letter buttons inside glossaryNavContainer.
        letterAnchors.forEach((letter) => {
            const newButtonWrapper = sampleButton.cloneNode(true);
            const newButtonLink = newButtonWrapper.querySelector('a');

            if (newButtonLink) {
                newButtonLink.textContent = letter;
                newButtonLink.setAttribute(
                    'href',
                    `#glossary-${letter.toLowerCase()}`
                );
                newButtonWrapper.classList.remove('invisible');
            }

            glossaryNavContainer.appendChild(newButtonWrapper);
        });

        // Remove the original sample button.
        sampleButton.remove();
    });
}

if ('complete' === document.readyState) {
    cleanbcdxBhDefinitions();
} else {
    document.addEventListener('DOMContentLoaded', cleanbcdxBhDefinitions);
}

window.cleanbcdxBhDefinitions = cleanbcdxBhDefinitions;
