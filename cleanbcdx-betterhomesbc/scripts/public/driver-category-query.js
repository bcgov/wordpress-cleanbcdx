/**
 * General CleanBC Drivers page Query Loop manipulation.
 */
const bcgovBlockThemePluginDriverCategoryQuery = () => {
    /*
     * SafarIE iOS requires window.requestAnimationFrame update.
     */
    window.requestAnimationFrame(() => {
        const queryLoopDriverCardContainer = document.querySelectorAll(
            '.wp-block-query.vue-card-container'
        );

        /**
         * Fetches data from a specified API endpoint, processes categories, replaces links with images,
         * and caches the data to optimize subsequent calls. Cache expires afetr 1 day.
         *
         * @async
         * @function fetchDataAndReplaceLinks
         * @param {number} [page=1] - The offset for paginating through API results.
         * @throws {Error} Throws an error if there's an HTTP error during the API fetch.
         * @throws {Error} Throws an error if there's an issue parsing the cached data.
         * @throws {Error} Throws an error if there's an issue during data fetching and processing.
         * @return {Promise<void>} A Promise that resolves after fetching, processing, and replacing links.
         */
        const fetchDataAndReplaceLinks = async (page = 1) => {
            try {
                const perPage = 100;
                const cachedData = window.localStorage.getItem('apiData');
                const cachedTimestamp =
                    window.localStorage.getItem('apiDataTimestamp');

                // Initialize existingData as an array, even if there is no cached data
                const existingData = cachedData ? JSON.parse(cachedData) : [];

                if (cachedData && cachedTimestamp) {
                    try {
                        const currentTime = new Date().getTime();
                        const timeDiff =
                            currentTime - parseInt(cachedTimestamp, 10);
                        const oneDayInMillis = 24 * 60 * 60 * 1000; // 1 day in milliseconds

                        if (timeDiff < oneDayInMillis) {
                            // Use cached data if it's less than a day old
                            processCategories(existingData);
                            return;
                        }
                    } catch (cacheError) {
                        /* eslint-disable no-console */
                        console.error(
                            'Error parsing cached data:',
                            cacheError.message
                        );
                        /* eslint-enable no-console */
                    }
                }

                const response = await fetch(
                    // `${window.site?.domain}/wp-json/wp/v2/project?_embed&per_page=${perPage}&page=${page}&_category_image=true`
                    `${window.site?.domain}/wp-json/custom/v1/actions`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                } 

                const newData = await response.json();
                const mergedData = existingData.concat(newData);

                // Store merged data in cache
                window.localStorage.setItem(
                    'apiData',
                    JSON.stringify(mergedData)
                );

                // If there are more projects, recursively fetch the next page
                if (newData.length >= perPage) {
                    await fetchDataAndReplaceLinks(page + 1);
                }

                processCategories(mergedData);

                // Store timestamp and enable cache override
                window.localStorage.setItem(
                    'apiDataTimestamp',
                    new Date().getTime().toString()
                );
            } catch (error) {
                /* eslint-disable no-console */
                console.error('Error fetching data:', error.message);
                /* eslint-enable no-console */
            }
        }

        /**
         * Processes category data extracted from the provided API response, filters out duplicates,
         * and prepares an array of unique categories with associated images for further use.
         *
         * @function processCategories
         * @param {Object[]} data - An array of project items from the API response.
         * @return {void} The function does not return a value, but it logs the unique categories and calls replaceLinks with the processed data.
         */
        const processCategories = (data) => {
            const categories = [];
            const uniqueCategoryNames = new Set();

            data.forEach((item) => {
                const terms = item?._embedded?.['wp:term'] || [];

                terms.forEach((categoryArray) => {
                    categoryArray.forEach((category) => {
                        const categoryName = category?.name;
                        const categoryImage = category?.acf?.category_image;

                        if (
                            categoryName &&
                            categoryName !== 'Actions we are taking' &&
                            !uniqueCategoryNames.has(categoryName)
                        ) {
                            uniqueCategoryNames.add(categoryName); // Add the name to the set
                            categories.push({
                                name: categoryName,
                                acf: {
                                    category_image: categoryImage || null,
                                },
                            });
                        }
                    });
                });
            });

            replaceLinks(categories);
        }

        /**
         * Replaces links within elements of class 'taxonomy-category' with images based on the provided categories.
         * Called from processCategories function.
         *
         * @function replaceLinks
         * @param {Object[]} categories                        - An array of category objects containing name and acf properties.
         * @param {string}   categories[].name                 - The name of the category.
         * @param {Object}   [categories[].acf]                - Additional fields associated with the category (e.g., category_image).
         * @param {string}   [categories[].acf.category_image] - The URL of the category image.
         * @return {void} The function does not return a value, but it modifies the DOM by replacing links with images.
         */
        const replaceLinks = (categories) => {
            document
                .querySelectorAll('div.taxonomy-category')
                .forEach((categoryDiv) => {
                    const links = categoryDiv.querySelectorAll('a');
                    const separators = categoryDiv.querySelectorAll(
                        'span.wp-block-post-terms__separator'
                    );

                    separators.forEach((separator) => separator.remove());

                    links.forEach((link) => {
                        const categoryName = link.innerText.trim();

                        if ('Actions we are taking' === categoryName) {
                            link.remove();
                            return;
                        }

                        // Find the category with the matching name
                        const matchingCategory = categories.find(
                            (category) => category.name === categoryName
                        );

                        // Replace the link with an image if the category is found
                        if (matchingCategory) {
                            const categoryImage =
                                matchingCategory?.acf?.category_image;
                            if (categoryImage) {
                                // Create an image element
                                const imgElement =
                                    document.createElement('img');
                                imgElement.src = categoryImage;
                                imgElement.alt = categoryName;
                                imgElement.title = categoryName;

                                // Replace the link with the image
                                link.replaceWith(imgElement);
                            }
                        }
                    });

                    categoryDiv.style.opacity = '1';
                });
        }

        if (queryLoopDriverCardContainer.length) {
            fetchDataAndReplaceLinks();
        }
    });
};

if ('complete' === document.readyState) {
    bcgovBlockThemePluginDriverCategoryQuery();
} else {
    document.addEventListener('DOMContentLoaded',
        bcgovBlockThemePluginDriverCategoryQuery
    );
}
