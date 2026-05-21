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

        const CACHE_KEY = 'apiData';
        const CACHE_TIMESTAMP_KEY = 'apiDataTimestamp';
        const ONE_DAY_IN_MILLIS = 24 * 60 * 60 * 1000;

        /**
         * Safely reads a cached array from localStorage.
         *
         * @param {string} key The localStorage key containing JSON data.
         * @returns {Array} The parsed array value, or an empty array if unavailable or invalid.
         */
        const getCachedArray = (key) => {
            try {
                const raw = window.localStorage.getItem(key);

                if (!raw) {
                    return [];
                }

                const parsed = JSON.parse(raw);

                return Array.isArray(parsed) ? parsed : [];
            } catch (error) {
                /* eslint-disable no-console */
                console.error('Error parsing cached data:', error.message);
                /* eslint-enable no-console */
                return [];
            }
        };

        /**
         * Determines whether the cached data is still fresh enough to use.
         *
         * @returns {boolean} True when the cache timestamp exists and is less than one day old.
         */
        const isCacheValid = () => {
            try {
                const cachedTimestamp =
                    window.localStorage.getItem(CACHE_TIMESTAMP_KEY);

                if (!cachedTimestamp) {
                    return false;
                }

                const currentTime = Date.now();
                const timeDiff = currentTime - parseInt(cachedTimestamp, 10);

                return timeDiff < ONE_DAY_IN_MILLIS;
            } catch (error) {
                return false;
            }
        };

        /**
         * Clears the cached API data and timestamp from localStorage.
         *
         * @returns {void} No return value.
         */
        const clearCache = () => {
            try {
                window.localStorage.removeItem(CACHE_KEY);
                window.localStorage.removeItem(CACHE_TIMESTAMP_KEY);
            } catch (error) {
                /* eslint-disable no-console */
                console.error('Error clearing cache:', error.message);
                /* eslint-enable no-console */
            }
        };

        /**
         * Stores API data in localStorage with a fresh timestamp.
         *
         * @param {Array} data The API response array to cache.
         * @returns {void} No return value.
         */
        const setCache = (data) => {
            try {
                window.localStorage.setItem(CACHE_KEY, JSON.stringify(data));
                window.localStorage.setItem(
                    CACHE_TIMESTAMP_KEY,
                    Date.now().toString()
                );
            } catch (error) {
                /* eslint-disable no-console */
                console.error('Error saving cache:', error.message);
                /* eslint-enable no-console */

                // Clear broken or oversized cache and continue without caching.
                clearCache();
            }
        };

        /**
         * Fetches data from the custom API endpoint, processes categories,
         * replaces links with images, and caches the data for one day.
         *
         * This version removes recursive pagination because the current
         * endpoint does not use page/per_page parameters. The previous
         * implementation repeatedly fetched the same data and appended
         * duplicates into localStorage, eventually exceeding browser quota.
         *
         * @async
         * @returns {Promise<void>} Resolves when fetching, caching, and link replacement are complete.
         * @throws {Error} Throws an error if the HTTP request fails.
         */
        const fetchDataAndReplaceLinks = async () => {
            try {
                if (isCacheValid()) {
                    const cachedData = getCachedArray(CACHE_KEY);

                    if (cachedData.length) {
                        processCategories(cachedData);
                        return;
                    }
                }

                const response = await fetch(
                    `${window.site?.domain}/wp-json/custom/v1/actions`,
                    {
                        credentials: 'same-origin',
                    }
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const newData = await response.json();
                const normalizedData = Array.isArray(newData) ? newData : [];

                setCache(normalizedData);
                processCategories(normalizedData);
            } catch (error) {
                /* eslint-disable no-console */
                console.error('Error fetching data:', error.message);
                /* eslint-enable no-console */
            }
        };

        /**
         * Processes category data from the API response, filters duplicates,
         * and prepares a unique category collection with associated images.
         *
         * Expected category structure:
         * item.categories = [
         *   {
         *     id: number,
         *     name: string,
         *     slug: string,
         *     image: string
         *   }
         * ]
         *
         * @param {Object[]} data The array of API response items to inspect for category data.
         * @returns {void} No return value.
         */
        const processCategories = (data) => {
            const categories = [];
            const uniqueCategoryNames = new Set();

            data.forEach((item) => {
                const itemCategories = item?.categories;

                if (!Array.isArray(itemCategories)) {
                    return;
                }

                itemCategories.forEach((category) => {
                    const categoryName = category?.name;
                    const categoryImage = category?.image || '';

                    if (
                        categoryName &&
                        categoryName !== 'Actions we are taking' &&
                        !uniqueCategoryNames.has(categoryName)
                    ) {
                        uniqueCategoryNames.add(categoryName);
                        categories.push({
                            name: categoryName,
                            image: categoryImage,
                        });
                    }
                });
            });

            replaceLinks(categories);
        };

        /**
         * Replaces links within taxonomy-category containers with images
         * based on the provided categories.
         *
         * @param {Object[]} categories The list of unique categories available for link replacement.
         * @param {string} categories[].name The display name of the category.
         * @param {string} categories[].image The category image URL.
         * @returns {void} No return value.
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

                        const matchingCategory = categories.find(
                            (category) => category.name === categoryName
                        );

                        if (!matchingCategory || !matchingCategory.image) {
                            return;
                        }

                        const imgElement = document.createElement('img');
                        imgElement.src = matchingCategory.image;
                        imgElement.alt = categoryName;
                        imgElement.title = categoryName;
                        imgElement.loading = 'lazy';
                        imgElement.decoding = 'async';

                        link.replaceWith(imgElement);
                    });

                    categoryDiv.style.opacity = '1';
                });
        };

        if (queryLoopDriverCardContainer.length) {
            fetchDataAndReplaceLinks();
        }
    });
};

if ('complete' === document.readyState) {
    bcgovBlockThemePluginDriverCategoryQuery();
} else {
    document.addEventListener(
        'DOMContentLoaded',
        bcgovBlockThemePluginDriverCategoryQuery
    );
}
