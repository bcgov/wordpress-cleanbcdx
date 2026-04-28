/**
 * Accessibility DOM manipulation.
 */
function cleanbcdxBhAccessibility() {
    /*
     * SafarIE iOS requires window.requestAnimationFrame update.
     */
    window.requestAnimationFrame(() => {
        /**
         * Checks whether a given URL shares the same origin as the current page.
         *
         * @param {string} url - The URL to compare.
         * @returns {boolean} True if the URL is same-origin; otherwise false.
         */
        const isSameOrigin = (url) => {
            try {
                return (
                    new URL(url, window.location.href).origin ===
                    window.location.origin
                );
            } catch {
                return false;
            }
        };

        /**
         * Sets 'aria-hidden="true"' attribute on elements with the class 'hide-from-sr'.
         * This attribute hides the elements from assistive technologies like screen readers.
         */
        const hideFromSRContainers = document.querySelectorAll('.hide-from-sr');

        if (hideFromSRContainers.length) {
            hideFromSRContainers.forEach((el) =>
                el.setAttribute('aria-hidden', 'true')
            );
        }

        /**
         * Apply language attributes based on class names like "lang-fr-CA".
         */
        const langClassElements = document.querySelectorAll('[class*="lang-"]');

        if (langClassElements.length) {
            langClassElements.forEach((el) => {
                const langClass = Array.from(el.classList).find((className) => {
                    return (
                        className.startsWith('lang-') && className.length > 5
                    );
                });

                if (!langClass) return;

                const langValue = langClass.slice(5);
                if (langValue) {
                    el.setAttribute('lang', langValue);
                }
            });
        }

        /**
         * Enhances breadcrumb navigation accessibility by adding ARIA attributes and roles.
         * https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/examples/breadcrumb/
         *
         * Modifies the existing breadcrumb structure to:
         * - Define it explicitly as a navigation landmark using role="navigation".
         * - Provide a descriptive label with aria-label="Breadcrumb".
         * - Indicate the current page breadcrumb using aria-current="page".
         * - Prevent breadcrumb separators from being announced by screen readers using aria-hidden="true".
         */
        const breadcrumbContainer = document.querySelector(
            '.aioseo-breadcrumbs'
        );

        if (breadcrumbContainer) {
            breadcrumbContainer.setAttribute('role', 'navigation');
            breadcrumbContainer.setAttribute('aria-label', 'Breadcrumb');

            const breadcrumbLinks = breadcrumbContainer.querySelectorAll(
                '.aioseo-breadcrumb a'
            );
            if (breadcrumbLinks.length > 0) {
                const lastBreadcrumb = breadcrumbContainer.querySelector(
                    '.aioseo-breadcrumb:last-of-type'
                );
                if (lastBreadcrumb && !lastBreadcrumb.querySelector('a')) {
                    lastBreadcrumb.setAttribute('aria-current', 'page');
                }
            }

            // Hide separators from screen readers
            const separators = breadcrumbContainer.querySelectorAll(
                '.aioseo-breadcrumb-separator'
            );
            separators.forEach((separator) =>
                separator.setAttribute('aria-hidden', 'true')
            );
        }

        /**
         * NodeList of all anchor elements linking to PDF files on the page.
         *
         * @type {NodeListOf<HTMLAnchorElement>}
         */
        const pdfLinks = document.querySelectorAll(
            'a[href$=".pdf" i], a[href*="pdf" i], a[title*="pdf" i], a[class*="pdf" i]'
        );

        if (pdfLinks) {
            setTimeout(() => {
                // Set a delay to avoid external link class race condition.
                pdfLinks.forEach((link) => {
                    const url = link.href;
                    // Skip if label already includes 'PDF', 'KB', or 'MB'
                    const label = link.textContent.toUpperCase();
                    if (
                        label.includes('[PDF') ||
                        label.includes('PDF]') ||
                        label.includes('KB]') ||
                        label.includes('MB]')
                    )
                        return;
                    if (isSameOrigin(url)) {
                        // Same-origin request
                        fetch(url, { method: 'HEAD' }).then((response) => {
                            const size = response.headers.get('Content-Length');
                            appendSizeLabel(link, size);
                        });
                    }
                    if (!isSameOrigin(url)) {
                        /**
                         * Cross-origin: use proxy endpoint with nonce passed via header.
                         */
                        fetch(
                            `${window.site.domain}/index.php?pdf_size_proxy=1&url=${encodeURIComponent(url)}`,
                            {
                                headers: {
                                    'X-WP-Nonce': window.pluginCleanbc.nonce,
                                },
                            }
                        )
                            .then((res) => res.text()) // Use .text() instead of .json() for debugging.
                            .then((text) => {
                                // Try to parse it manually.
                                try {
                                    const data = JSON.parse(text);
                                    appendSizeLabel(link, data.size);
                                } catch (e) {
                                    console.error('JSON parse error:', e);
                                }
                            })
                            .catch((error) => {
                                console.error('Proxy fetch failed:', error);
                            });
                    }
                });
            }, 500);
        }

        /**
         * Appends a file size label to a PDF link, inserting it into a <span class="last-word no-wrap">
         * if present, and replacing or adding the <svg> icon as needed.
         *
         * @param {HTMLAnchorElement} link - The anchor element linking to the PDF.
         * @param {number} size - The file size in bytes.
         */
        const appendSizeLabel = (link, size) => {
            let labelText = ' [PDF]';

            if (!size || size <= 0 || undefined === size) {
                labelText = ' [PDF unknown size]';
            } else {
                const kb = size / 1024;
                const mb = kb / 1024;
                const sizeLabel =
                    mb >= 1 ? `${mb.toFixed(1)}MB` : `${kb.toFixed(0)}KB`;

                labelText = ` [PDF ${sizeLabel}]`;
            }

            // Create the new PDF icon <svg>.
            const pdfSvg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            );
            pdfSvg.setAttribute('class', 'pdf-download-icon');
            pdfSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            pdfSvg.setAttribute(
                'style',
                'width: 20px; height: 20px; top: 4px; position: relative;'
            );
            pdfSvg.setAttribute('viewBox', '0 0 384 512');

            const path = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'path'
            );
            path.setAttribute(
                'd',
                'M320 480L64 480c-17.7 0-32-14.3-32-32L32 64c0-17.7 14.3-32 32-32l128 0 0 112c0 26.5 21.5 48 48 48l112 0 0 256c0 17.7-14.3 32-32 32zM240 160c-8.8 0-16-7.2-16-16l0-111.5c2.8 .7 5.4 2.1 7.4 4.2L347.3 152.6c2.1 2.1 3.5 4.6 4.2 7.4L240 160zM64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-284.1c0-12.7-5.1-24.9-14.1-33.9L254.1 14.1c-9-9-21.2-14.1-33.9-14.1L64 0zM208 240c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 121.4-52.7-52.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l80 80c6.2 6.2 16.4 6.2 22.6 0l80-80c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L208 361.4 208 240z'
            );
            pdfSvg.appendChild(path);

            // Split trailing sentence punctuation so [PDF ...] + icon
            // can be inserted immediately before punctuation.
            const splitTrailingNonAlnum = (text = '') => {
                const trailingWhitespaceMatch = text.match(/\s*$/);
                const trailingWhitespace = trailingWhitespaceMatch
                    ? trailingWhitespaceMatch[0]
                    : '';
                const withoutTrailingWhitespace = text.slice(
                    0,
                    text.length - trailingWhitespace.length
                );
                // Exclude square brackets so we never move the closing "]" from "[PDF ...]".
                const trailingNonAlnumMatch =
                    withoutTrailingWhitespace.match(/([^\w\s[\]]+)$/);

                if (!trailingNonAlnumMatch) {
                    return {
                        main: text,
                        trailing: '',
                    };
                }

                const trailingNonAlnum = trailingNonAlnumMatch[1];
                return {
                    main: withoutTrailingWhitespace.slice(
                        0,
                        -trailingNonAlnum.length
                    ),
                    trailing: `${trailingNonAlnum}${trailingWhitespace}`,
                };
            };

            // Get the last text node in DOM order so punctuation in nested elements is detected too.
            const getLastTextNode = (root) => {
                const walker = document.createTreeWalker(
                    root,
                    NodeFilter.SHOW_TEXT
                );
                let lastTextNode = null;
                let currentNode = walker.nextNode();
                while (currentNode) {
                    lastTextNode = currentNode;
                    currentNode = walker.nextNode();
                }
                return lastTextNode;
            };

            // Ensure any trailing punctuation ends up after the injected icon.
            const moveTrailingPunctuationAfterIcon = (container, icon) => {
                let candidateTextNode = null;
                let sibling = icon.previousSibling;

                while (sibling && !candidateTextNode) {
                    if (
                        Node.TEXT_NODE === sibling.nodeType &&
                        (sibling.nodeValue || '').trim()
                    ) {
                        candidateTextNode = sibling;
                        break;
                    }
                    if (Node.ELEMENT_NODE === sibling.nodeType) {
                        const nestedTextNode = getLastTextNode(sibling);
                        if (
                            nestedTextNode &&
                            (nestedTextNode.nodeValue || '').trim()
                        ) {
                            candidateTextNode = nestedTextNode;
                            break;
                        }
                    }
                    sibling = sibling.previousSibling;
                }

                if (!candidateTextNode) {
                    return;
                }

                const { main, trailing } = splitTrailingNonAlnum(
                    candidateTextNode.nodeValue || ''
                );
                if (!trailing) {
                    return;
                }

                candidateTextNode.nodeValue = main;
                container.insertBefore(
                    document.createTextNode(trailing),
                    icon.nextSibling
                );
            };

            const span = link.querySelector('span.last-word.no-wrap');

            if (span) {
                const existingSvg = span.querySelector('svg');
                const textNodes = Array.from(span.childNodes).filter(
                    (node) => Node.TEXT_NODE === node.nodeType
                );
                const textNode =
                    textNodes.length > 0
                        ? textNodes[textNodes.length - 1]
                        : document.createTextNode('');
                const { main, trailing } = splitTrailingNonAlnum(
                    textNode.nodeValue || ''
                );
                textNode.nodeValue = main;
                if (!textNode.parentNode) {
                    span.insertBefore(textNode, existingSvg || null);
                }

                if (existingSvg) {
                    span.insertBefore(
                        document.createTextNode(labelText),
                        existingSvg
                    );
                    existingSvg.replaceWith(pdfSvg);
                } else {
                    span.appendChild(document.createTextNode(labelText));
                    span.appendChild(pdfSvg);
                }

                if (trailing) {
                    span.insertBefore(
                        document.createTextNode(trailing),
                        pdfSvg.nextSibling
                    );
                }
                moveTrailingPunctuationAfterIcon(span, pdfSvg);
            } else {
                // No special span — fall back to appending at end of link, but
                // insert before trailing non-alphanumeric punctuation if present.
                const textNode =
                    getLastTextNode(link) || document.createTextNode('');
                const { main, trailing } = splitTrailingNonAlnum(
                    textNode.nodeValue || ''
                );
                textNode.nodeValue = main;
                if (!textNode.parentNode) {
                    link.appendChild(textNode);
                }

                link.classList.add('external');
                link.appendChild(document.createTextNode(labelText));
                link.appendChild(pdfSvg);
                if (trailing) {
                    link.appendChild(document.createTextNode(trailing));
                }
                moveTrailingPunctuationAfterIcon(link, pdfSvg);
            }
        };

        const actionsAccordionHeader = document.querySelector(
            '.actions-accordion-header'
        );
        if (null !== actionsAccordionHeader) {
            const getSiblings = (elem) => {
                // Setup siblings array and get the first sibling
                const siblings = [];
                let sibling = elem.parentNode.firstChild;

                // Loop through each sibling and push to the array
                while (sibling) {
                    if (1 === sibling.nodeType && sibling !== elem) {
                        siblings.push(sibling);
                    }
                    if (null !== sibling.nextSibling) {
                        sibling = sibling.nextSibling;
                    }
                }
                return siblings;
            };
            /*
             * Inject ARIA labels into queried content.
             */
            const labelEls = document.querySelectorAll('.labelInjector');
            labelEls.forEach((label) => {
                const siblings = getSiblings(label);
                const ariaLabel = label.getAttribute('data-label');
                siblings.forEach((el) => {
                    if (el.classList.contains('wp-block-buttons')) {
                        const link = el.querySelector('.wp-block-button__link');
                        link.setAttribute('aria-label', ariaLabel);
                    }
                });
                label.remove();
            });
        }

        // Define breadcrumb nav pattern
        const breadcrumbNav = document.querySelector('#breadcrumb-nav');

        if (null !== breadcrumbNav) {
            breadcrumbNav.setAttribute('role', 'navigation');
            breadcrumbNav.setAttribute('aria-label', 'Breadcrumb');

            const aioseoBreadcrumb = breadcrumbNav.querySelector(
                '.aioseo-breadcrumbs'
            );
            const aioseoBreadcrumbItems =
                aioseoBreadcrumb.querySelectorAll('.aioseo-breadcrumb');
            const aioseoBreadcrumbSeparators =
                aioseoBreadcrumb.querySelectorAll(
                    '.aioseo-breadcrumb-separator'
                );

            if (null !== aioseoBreadcrumb && null !== aioseoBreadcrumbItems) {
                aioseoBreadcrumb.setAttribute('role', 'list');

                aioseoBreadcrumbItems.forEach((item, index) => {
                    item.setAttribute('role', 'listitem');

                    // Add aria-current to the last breadcrumb item
                    if (index === aioseoBreadcrumbItems.length - 1) {
                        item.setAttribute('role', 'link');
                        item.setAttribute('aria-current', 'page');
                    }
                });
            }

            if (null !== aioseoBreadcrumbSeparators) {
                aioseoBreadcrumbSeparators.forEach((separator) => {
                    separator.setAttribute('aria-hidden', 'true');
                });
            }
        }

        /**
         * Setup for detail-with-number-container grid layout modifications for screen reader.
         * See: https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/layout-grids/
         */
        const detailsWithNumbersContainers = document.querySelectorAll(
            '.detail-with-number-container'
        );

        if (detailsWithNumbersContainers.length > 0) {
            // Create and insert grid container
            const gridGroupDiv = document.createElement('div');
            gridGroupDiv.setAttribute('role', 'grid');
            gridGroupDiv.setAttribute('data-wrap-cols', true);
            gridGroupDiv.setAttribute('data-wrap-rows', true);

            const firstDetailContainer = detailsWithNumbersContainers[0];
            firstDetailContainer.parentNode.insertBefore(
                gridGroupDiv,
                firstDetailContainer
            );

            // Move detail containers inside the new grid
            detailsWithNumbersContainers.forEach((detailContainer) => {
                gridGroupDiv.appendChild(detailContainer);
            });

            let determinedHeadingLevel = null; // for potential future use

            detailsWithNumbersContainers.forEach((detailContainer, index) => {
                detailContainer.setAttribute('role', 'row');

                const headlineCell = detailContainer.querySelector(
                    '.wp-block-column:nth-of-type(1)'
                );
                const detailCell = detailContainer.querySelector(
                    '.wp-block-column:nth-of-type(2)'
                );

                const headlines = headlineCell
                    ? headlineCell.querySelectorAll('.wp-block-heading')
                    : [];

                // Fallback: if no second cell exists, use headlineCell as detailCell
                const finalDetailCell =
                    headlines.length > 0 && detailCell
                        ? detailCell
                        : headlineCell;

                if (finalDetailCell) {
                    finalDetailCell.setAttribute('role', 'gridcell');
                    finalDetailCell.setAttribute('tabindex', '0');

                    if (headlineCell) {
                        const headlines =
                            headlineCell.querySelectorAll('.wp-block-heading');

                        // Concatenate all headlines' text into a single string
                        let concatenatedHeadlineText = '';
                        headlines.forEach((headline) => {
                            concatenatedHeadlineText +=
                                headline.innerText + ' ';
                            headline.setAttribute('aria-hidden', true); // Hide original headlines from screen readers
                        });

                        if (concatenatedHeadlineText.trim()) {
                            if (0 === index) {
                                // Determine heading level on the first row
                                let nearestHeading = null;
                                let currentElement =
                                    detailContainer.previousElementSibling;

                                // Traverse previous siblings to find the nearest wp-block-heading
                                while (currentElement && !nearestHeading) {
                                    if (
                                        currentElement.classList.contains(
                                            'wp-block-heading'
                                        )
                                    ) {
                                        nearestHeading = currentElement;
                                        break;
                                    }

                                    const headings =
                                        currentElement.querySelectorAll(
                                            '.wp-block-heading'
                                        );
                                    if (headings.length > 0) {
                                        nearestHeading =
                                            headings[headings.length - 1]; // Select the last one found inside the sibling
                                        break;
                                    }

                                    currentElement =
                                        currentElement.previousElementSibling;
                                }

                                let parentElement =
                                    detailContainer.parentElement;
                                while (!nearestHeading && parentElement) {
                                    currentElement =
                                        parentElement.previousElementSibling;

                                    while (currentElement) {
                                        if (
                                            currentElement.classList.contains(
                                                'wp-block-heading'
                                            )
                                        ) {
                                            nearestHeading = currentElement;
                                            break;
                                        }

                                        const headings =
                                            currentElement.querySelectorAll(
                                                '.wp-block-heading'
                                            );
                                        if (headings.length > 0) {
                                            nearestHeading =
                                                headings[headings.length - 1];
                                            break;
                                        }

                                        currentElement =
                                            currentElement.previousElementSibling;
                                    }

                                    parentElement = parentElement.parentElement;
                                }

                                if (nearestHeading) {
                                    const nearestHeadingTagName =
                                        nearestHeading.tagName.toLowerCase();
                                    determinedHeadingLevel =
                                        parseInt(
                                            nearestHeadingTagName.replace(
                                                'h',
                                                ''
                                            )
                                        ) + 1;
                                    if (determinedHeadingLevel > 6)
                                        determinedHeadingLevel = 6; // <h6> is the lowest level
                                } else {
                                    determinedHeadingLevel = 2; // Default to <h2> if no heading is found
                                }
                            }

                            // Create the new heading element using the determined heading level
                            const newHeading = document.createElement(
                                `h${determinedHeadingLevel}`
                            );
                            newHeading.innerText =
                                concatenatedHeadlineText.trim();
                            newHeading.classList.add('sr-only');

                            // Insert the new heading at the start of detailCell
                            finalDetailCell.insertBefore(
                                newHeading,
                                finalDetailCell.firstChild
                            );
                        }
                    }
                }

                if (0 === index) {
                    let nearestHeading = null;
                    let currentElement = detailContainer.previousElementSibling;

                    while (currentElement && !nearestHeading) {
                        if (
                            currentElement.classList.contains(
                                'wp-block-heading'
                            )
                        ) {
                            nearestHeading = currentElement;
                            break;
                        }

                        const headings =
                            currentElement.querySelectorAll(
                                '.wp-block-heading'
                            );
                        if (headings.length > 0) {
                            nearestHeading = headings[headings.length - 1];
                            break;
                        }

                        currentElement = currentElement.previousElementSibling;
                    }

                    let parentElement = detailContainer.parentElement;
                    while (!nearestHeading && parentElement) {
                        currentElement = parentElement.previousElementSibling;

                        while (currentElement) {
                            if (
                                currentElement.classList.contains(
                                    'wp-block-heading'
                                )
                            ) {
                                nearestHeading = currentElement;
                                break;
                            }

                            const headings =
                                currentElement.querySelectorAll(
                                    '.wp-block-heading'
                                );
                            if (headings.length > 0) {
                                nearestHeading = headings[headings.length - 1];
                                break;
                            }

                            currentElement =
                                currentElement.previousElementSibling;
                        }

                        parentElement = parentElement.parentElement;
                    }

                    if (nearestHeading) {
                        let headingId = nearestHeading.getAttribute('id');
                        if (!headingId) {
                            headingId = `grid-${Date.now()}`;
                            nearestHeading.setAttribute('id', headingId);
                        }
                        gridGroupDiv.setAttribute('aria-labelledby', headingId);
                    }
                }
            });

            // Add keyboard navigation
            gridGroupDiv.addEventListener('keydown', (event) => {
                const activeElement = document.activeElement;
                if ('gridcell' === activeElement.getAttribute('role')) {
                    const row = activeElement.parentElement;
                    const rows = Array.from(
                        gridGroupDiv.querySelectorAll('[role="row"]')
                    );
                    const cells = Array.from(
                        row.querySelectorAll('[role="gridcell"]')
                    );
                    const rowIndex = rows.indexOf(row);
                    const cellIndex = cells.indexOf(activeElement);

                    switch (event.key) {
                        case 'ArrowRight':
                        case 'ArrowDown':
                            if (rowIndex < rows.length - 1) {
                                const nextRowCells =
                                    rows[rowIndex + 1].querySelectorAll(
                                        '[role="gridcell"]'
                                    );
                                nextRowCells[cellIndex].focus();
                            }
                            break;
                        case 'ArrowLeft':
                        case 'ArrowUp':
                            if (rowIndex > 0) {
                                const prevRowCells =
                                    rows[rowIndex - 1].querySelectorAll(
                                        '[role="gridcell"]'
                                    );
                                prevRowCells[cellIndex].focus();
                            }
                            break;
                        case 'PageDown':
                            if (rowIndex < rows.length - 1) {
                                const nextRowIndex = Math.min(
                                    rowIndex + 3,
                                    rows.length - 1
                                ); // Adjust 3 as the number of rows to scroll
                                const nextRowCells =
                                    rows[nextRowIndex].querySelectorAll(
                                        '[role="gridcell"]'
                                    );
                                nextRowCells[cellIndex].focus();
                            }
                            event.preventDefault();
                            break;
                        case 'PageUp':
                            if (rowIndex > 0) {
                                const prevRowIndex = Math.max(rowIndex - 3, 0); // Adjust 3 as the number of rows to scroll
                                const prevRowCells =
                                    rows[prevRowIndex].querySelectorAll(
                                        '[role="gridcell"]'
                                    );
                                prevRowCells[cellIndex].focus();
                            }
                            event.preventDefault();
                            break;
                        case 'Home':
                            // Move focus to the first cell in the first row
                            rows[0].querySelector('[role="gridcell"]').focus();
                            event.preventDefault();
                            break;

                        case 'End': {
                            // Move focus to the last cell in the last row
                            const lastRow = rows[rows.length - 1];
                            lastRow
                                .querySelector('[role="gridcell"]:last-child')
                                .focus();
                            event.preventDefault();
                            break;
                        }
                    }
                }
            });
        }

        /**
         * Allow assitive technologies to move focus to the body after using the back to top link.
         */
        const backToTop = document.querySelector('.back-to-top');

        backToTop.addEventListener('click', (event) => {
            event.preventDefault();

            window.scrollTo({ top: 0, behavior: 'smooth' });

            const checkIfScrolledToTop = setInterval(() => {
                if (0 === window.scrollY) {
                    clearInterval(checkIfScrolledToTop);
                    document.body.setAttribute('tabindex', '-1');
                    document.body.focus({ preventScroll: true });
                }
            }, 50);
        });
    });
}

if ('complete' === document.readyState) {
    cleanbcdxBhAccessibility();
} else {
    document.addEventListener('DOMContentLoaded', cleanbcdxBhAccessibility);
}

window.cleanbcdxBhAccessibility = cleanbcdxBhAccessibility;
