<template>
    <div class="inner">
        <!-- Heading for screen readers -->
        <h2 class="sr-only">Rebate Listings</h2>
        <!-- Skip to results link -->
        <a href="#rebatesResults" class="sr-only skip-to-results">Skip to results</a>
        <!-- Filter Controls -->
        <div id="rebatesFilterControls" class="rebatesFilterControls filter-container">
            <!-- Build Type Select -->
            <div class="control build-type-select">
                <label for="typeSelect" class="">Are you building or renovating the home?</label>
                <div class="custom-select">
                    <select id="typeSelect" class="select select--type" @change="selectIsActive"
                        @click.prevent="selectIsActive" @touchend="selectIsActive" @keyup.esc="selectIsActive"
                        tabindex="0" v-model="selectedBuildType" required="true">
                        <option value="all">All project types</option>
                        <option v-for="(type, index) in types" :key="type" :value="type">{{ type }}</option>
                    </select>
                </div>
            </div>

            <!-- Primary Filter: Location Select -->
            <div class="control location-select">
                <label for="locationSelect" class="">Choose a service region</label>
                <div class="custom-select">
                    <select id="locationSelect" class="select select--location" @change="selectIsActive"
                        @click.prevent="selectIsActive" @touchend="selectIsActive" @keyup.esc="selectIsActive"
                        tabindex="0" v-model="selectedLocation" required="true">
                        <option value="all">All locations</option>
                        <option v-for="location in locations" :key="location" :value="location">{{ location }}</option>
                    </select>
                </div>
            </div>

            <!-- Primary Filter: Primary Heating System Select -->
            <div class="control heating-system-select">
                <label for="systemSelect" class="">Choose your current primary heating system</label>
                <div class="custom-select">
                    <select id="systemSelect" class="select select--system" @change="selectIsActive"
                        @click.prevent="selectIsActive" @touchend="selectIsActive" @keyup.esc="selectIsActive"
                        tabindex="0" v-model="selectedHeatingSystem" required="true">
                        <option value="all">All heating systems</option>
                        <option v-if="!isLoading" v-for="(system, index) in systems" :key="system"
                            :style="'Not sure, view all rebates' == system ? 'display: none;' : null" :value="system">{{
                                system }}</option>
                    </select>
                </div>
            </div>

            <!-- Primary Filter: Upgrade Types Filter -->
            <div class="control upgrade-types">
                <!-- Upgrade Type Filter -->
                <div v-if="upgrades" class="filter filter--upgrade-types accordion">
                    <h2>
                        <button id="upgradeTypesAccordionTrigger" class="accordion-trigger" aria-expanded="false"
                            aria-controls="upgradeTypesAccordionPanel" type="button">
                            <span class="accordion-title"
                                v-html="'Filter by type of upgrade ' + upgradeTypesAccordionTitle(selectedUpgradeTypes)"></span>
                            <span class="accordion-icon"></span>
                        </button>
                    </h2>
                    <div id="upgradeTypesAccordionPanel" class="filter filter__list accordion-panel" role="region"
                        aria-labelledby="upgradeTypesAccordionTrigger" hidden>
                        <div class="inner">
                            <div class="help-text">
                                <p>Click to select the type(s) of upgrade you would like displayed, you may choose more
                                    than one.</p>
                            </div>
                            <fieldset>
                                <div
                                    :class="`filter__item checkbox all ${selectedUpgradeTypes.length ? '' : isCheckedClass}`">
                                    <input id="upgradeTypeAll" class="sr-only" type="checkbox" name="upgradeTypes"
                                        value="all" :aria-checked="selectedUpgradeTypes.length ? false : true"
                                        :checked="selectedUpgradeTypes.length ? false : true"
                                        @click="handleSelectAllInputFilter" @keyup.enter="simulateClickOnEnter">
                                    <label for="upgradeTypeAll">All Upgrade Types</label>
                                </div>
                                <!-- Note regarding .replace() implementations: we run .replace() twice to improve selector name quality.  The first .replace() call can result in multiple -- instances within the class's dynamic name. -->
                                <div v-for="(upgrade, index) in upgrades" :key="index"
                                    :class="`filter__item checkbox checkbox--${upgrade.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-')} ${-1 !== selectedUpgradeTypes.indexOf(upgrade) ? isCheckedClass : ''}`">
                                    <input
                                        :id="upgrade.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-')"
                                        class="sr-only" type="checkbox" v-model="selectedUpgradeTypes"
                                        name="upgradeTypes" :value="upgrade"
                                        :aria-checked="selectedUpgradeTypes.includes(upgrade) ? true : false"
                                        :checked="selectedUpgradeTypes.includes(upgrade) ? true : false"
                                        :aria-disabled="0 === getUpgradeTypeTagCount(upgrade) ? true : false"
                                        :disabled="0 === getUpgradeTypeTagCount(upgrade) ? true : false"
                                        @keyup.enter="simulateClickOnEnter">
                                    <label
                                        :for="upgrade.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-')">{{
                                            upgrade }} ({{ getUpgradeTypeTagCount(upgrade) }})</label>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </div><!-- end .filter--upgrade-types -->
            </div> <!-- end .control.upgrade-types -->

            <!-- Secondary Filter: Offers Filter -->
            <div class="control other-offers other-offers--mobile">
                <div class="filter filter--other-offers accordion">
                    <h2>
                        <button id="otherOffersAccordionTrigger" class="accordion-trigger" aria-expanded="false"
                            aria-controls="otherOffersAccordionPanel" type="button">
                            <span class="accordion-title">Additional filters</span>
                            <span class="accordion-icon"></span>
                        </button>
                    </h2>
                    <div id="otherOffersAccordionPanel" class="filter filter__list accordion-panel" role="region"
                        aria-labelledby="otherOffersAccordionTrigger" hidden>
                        <div class="inner">
                            <fieldset class="filter__list" v-if="!isLoading && offers">
                                <div
                                    :class="`filter__item radio all ${'all' === selectedOtherOffers ? isCheckedClass : ''}`">
                                    <input id="offerTypeAll--mobile" class="sr-only" type="radio" name="all" value="all"
                                        :aria-checked="'all' === selectedOtherOffers ? true : false"
                                        aria-disabled="false" :checked="'all' === selectedOtherOffers ? true : false"
                                        @click="handleSelectAllInputFilter">
                                    <label for="offerTypeAll--mobile">No additional filters applied</label>
                                </div>
                                <div v-for="(offer, index) in offers" :key="index"
                                    :class="`filter__item radio radio--${offer.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-')} ${offer === selectedOtherOffers ? isCheckedClass : ''}`">
                                    <input
                                        :id="offer.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-') + '--mobile'"
                                        :data-filter-value="offer.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-')"
                                        class="sr-only" type="radio" v-model="selectedOtherOffers" :name="offer"
                                        :value="offer" :aria-checked="offer === selectedOtherOffers ? true : false"
                                        :aria-disabled="0 === handleOfferTagCount(offer) ? true : false"
                                        :disabled="0 === handleOfferTagCount(offer) ? true : false"
                                        :checked="offer === selectedOtherOffers ? true : false">
                                    <label
                                        :for="offer.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-') + '--mobile'">{{
                                            offer }} ({{ handleOfferTagCount(offer) }})</label>
                                </div>
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Clear Filters Button -->
            <div class="control reset-filters">
                <button class="clear-filters" @click.prevent="clearFilters" @touchend="clearFilters"
                    @keydown.enter.prevent="clearFilters" type="button">
                    Reset selection
                </button>
            </div>

            <!-- Add Link to Clipboard Button -->
            <div v-if='isVisible' class="control copy-link-btn">
                <button class="copy-link share" @click.prevent="addLinkToClipboard" @touchend="addLinkToClipboard"
                    @keydown.enter.prevent="addLinkToClipboard"
                    :disabled="!canCopyLink"
                    type="button">
                    Copy link
                </button>
                <span class="copy-message isFadedOut" role="status" aria-live="polite"></span>
            </div>

            <!-- Pagination Controls (Top) -->
            <div class="rebatesFilterPagination control pagination pagination--top">
                <!-- Previous Page Button -->
                <button class="prev-page" @click.prevent="prevPage" :disabled="currentPage === 1" tabindex="0"
                    type="button">Previous Page</button>
                <!-- Current Page & Totals -->
                <span class="pages">Page <span class="numValue current-page">{{ currentPage }}</span> of <span
                        class="numValue total-pages">{{ totalPages }}</span></span>
                <!-- Next Page Button -->
                <button class="next-page" @click.prevent="nextPage" :disabled="currentPage === totalPages" tabindex="0"
                    type="button">Next Page</button>

                <!-- Results Information -->
                <span class="totals">
                    Showing <span class="results-count"><span class="numValue paginated-rebates">{{
                            paginatedRebates.length }}</span> of <span class="numValue filtered-rebates">{{
                            filteredRebates.length }}</span></span> Rebates
                </span>

                <span class="sr-status sr-only">
                    <span class="results-count" role="status" aria-live="polite">
                        Showing <span class="numValue paginated-rebates">{{ paginatedRebates.length }}</span> of <span
                            class="numValue filtered-rebates">{{ filteredRebates.length }}</span> rebates {{
                                currentBuildTypeFilterMessage }} {{ currentLocationFilterMessage }} {{
                            currentHeatingSystemFilterMessage }}
                    </span>
                    <span class="pages" role="status" aria-live="polite">Page <span class="numValue current-page">{{
                        currentPage }}</span> of <span class="numValue total-pages">{{ totalPages }}</span></span>
                </span>
            </div>
        </div>

        <div id="rebatesTool" class="rebatesTool">
            <!-- Sidebar -->
            <div id="rebatesSidebar" class="rebatesSidebar sidebar" role="complementary">
                <!-- Secondary Filter: Offers -->
                <div class="filter filter--other-offers">
                    <h2>Additional filters <!--({{ getOfferTotalTagCount }})--></h2>
                    <fieldset class="filter__list" v-if="!isLoading && offers">
                        <legend class="sr-only">Additional Filters:</legend>
                        <div :class="`filter__item radio all ${'all' === selectedOtherOffers ? isCheckedClass : ''}`">
                            <input id="offerTypeAll" data-filter-value="all" class="sr-only" type="radio"
                                name="otherOffers" value="all"
                                :aria-checked="'all' === selectedOtherOffers ? true : false" aria-disabled="false"
                                :checked="'all' === selectedOtherOffers ? true : false" tabindex="0"
                                @click="handleSelectAllInputFilter" @touchend="handleSelectAllInputFilter">
                            <label for="offerTypeAll">No additional filters applied</label>
                        </div>
                        <div v-for="(offer, index) in offers" :key="index"
                            :class="`filter__item radio radio--${offer.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-')} ${offer === selectedOtherOffers ? isCheckedClass : ''}`">
                            <input
                                :id="offer.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-')"
                                :data-filter-value="offer.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-')"
                                class="sr-only" type="radio" v-model="selectedOtherOffers" name="otherOffers"
                                :value="offer" :aria-checked="offer === selectedOtherOffers ? true : false"
                                :aria-disabled="0 === handleOfferTagCount(offer) ? true : false"
                                :disabled="0 === handleOfferTagCount(offer) ? true : false"
                                :checked="offer === selectedOtherOffers ? true : false" tabindex="0">
                            <label
                                :for="offer.toLowerCase().replace(/[ .,\/#!$%\^&\*;:{}=\-_`~()]/g, '-').replace(/--/g, '-')">{{
                                    offer }} ({{ handleOfferTagCount(offer) }})</label>
                        </div>
                    </fieldset>
                </div>
            </div>

            <!-- Rebates Results Grid -->
            <div id="rebatesResults" class="rebatesResults results">
                <h2 class="results__title">Results (<span class="counter__value">{{ filteredRebates.length }}</span>)
                </h2>
                <div :class="`page page--${currentPage}`">
                    <!-- Loading Message -->
                    <div v-if="isLoading" class="is-loading" role="status" aria-live="polite">
                        <div class="inner">
                            <p class="no-results loading">Retrieving a list of Rebates, please wait...</p>
                        </div>
                    </div>

                    <!-- No Results Message -->
                    <div v-if="filteredRebates.length === 0 && !isLoading" class="no-results">
                        <div>
                            <p class="no-results" role="status" aria-live="polite">Sorry, no results found.</p>
                        </div>
                    </div>

                    <!-- Results Loop -->
                    <template v-if="rebates.length > 0 && !isLoading">
                        <article v-for="(rebate, index) in paginatedRebates" :key="rebate.id || index"
                            :class="['rebate', 'result', index % 2 === 0 ? 'even' : 'odd']">
                            <div class="rebate__title">
                                <h3 v-html="decodeHtmlEntities(rebate.title)"></h3>
                            </div>
                            <div :class=rebateAmountClasses(rebate.rebate_amount)>
                                <p>{{ rebate.rebate_amount }}</p>
                            </div>
                            <div class="rebate__short-description">
                                <p v-html="rebate.short_description"></p>
                            </div>
                            <div class="rebate__learn-more">
                                <a :href="rebate.post_url" class="button" 
                            @click="onRebateClick(rebate)"
                                    :aria-label="decodeHtmlEntities(rebate.title) + ' view rebate details'">View rebate
                                    details</a>
                            </div>
                        </article>
                    </template>
                </div>

                <div v-if="isVisible && filteredRebates.length !== 0 && 1 !== totalPages"
                    class="rebatesFilterControls filter-container">
                    <!-- Lower Pagination Controls -->
                    <div class="rebatesFilterPagination control pagination pagination--bottom">
                        <!-- Previous Page Button -->
                        <button class="prev-page" @click.prevent="prevPage" :disabled="currentPage === 1" tabindex="0"
                            type="button">Previous Page</button>
                        <!-- Current Page & Totals -->
                        <span class="pages">Page <span class="numValue current-page">{{ currentPage }}</span> of <span
                                class="numValue total-pages">{{ totalPages }}</span></span>
                        <!-- Next Page Button -->
                        <button class="next-page" @click.prevent="nextPage" :disabled="currentPage === totalPages"
                            tabindex="0" type="button">Next Page</button>
                        <button class="go-to-top" tabindex="0" type="button" :disabled="filteredRebates.length === 0"
                            @click="scrollToElementID('rebatesResults', '11rem')">Go to top of results</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
/**
 * Imports necessary for using Vue Composition API features such as reactive data and lifecycle hooks.
 *
 * This block imports specific functions (`ref`, `onMounted`, `computed`, `watch`) from the Vue Composition API (`vue` package).
 * These functions enable the creation of reactive data, lifecycle hooks, computed properties, and watchers in Vue.js components.
 *
 * @type {Object}
 * @property {Function} ref - Function for creating a reactive reference to a value.
 * @property {Function} onMounted - Function for defining a lifecycle hook that runs after component is mounted.
 * @property {Function} computed - Function for creating a computed property that reacts to reactive dependencies.
 * @property {Function} watch - Function for creating a watcher to react to changes in reactive data or computed properties.
 * @namespace VueCompositionAPI
 */
import {
    computed,
    nextTick,
    ref,
    onMounted,
    watch,
    watchEffect
} from 'vue';

import { decodeHtmlEntities, scrollToElementID } from '../shared-functions.js';
import { trackRebateClick, trackRebateFilterChange, trackRebateUpgradeTypeChange } from '../analytics-schemas.js';
import { localAnalyticsReady } from '../standalone-snowplow.js';

/**
 * Ref for storing an array of Rebates (incentives).
 *
 * @type {Ref<Array>} - A reference to an array containing Rebates.
 */
const rebates = ref([]);

/**
 * Ref for for controlling tool visibility.
 *
 * @type {Ref<Bool>} - A reference to the current visibility.
 */
const isVisible = ref(true);

/**
 * Refs to store the previous paginated/filtered Rebates count for
 * comparison purposes when determining which elements of the controls
 * to animate (have changed).
 *
 * @type {Ref<Number>} - References for storing the paginated/filtered Rebates count (integer).
 */
const oldPaginatedRebatesCount = ref(0);
const oldFilteredRebatesCount = ref(0);

/**
 * Ref for the default selected build type (building-types), heating system (primary-space-heating),
 * and location (regions).
 *
 * @type {Ref<String>} - A reference to the default selected build type (building-types),
 * heating system (primary-space-heating), and location (regions).
 */
const defaultSelectedBuildType = ref('all');
const defaultSelectedHeatingSystem = ref('all');
const defaultSelectedLocation = ref('all');
const defaultOtherOffers = ref('all');

/**
 * Ref for the currently selected build type (building-types), heating system (primary-space-heating),
 * and location (regions).
 *
 * @type {Ref<String>} - A reference to the currently selected  build type (building-types),
 * heating system (primary-space-heating), and location (regions).
 */
const selectedBuildType = ref('all');
const selectedHeatingSystem = ref('all');
const selectedLocation = ref('all');
const selectedOtherOffers = ref('all');

/**
 * Refs for the currently selected Offers (other-offer) and Upgrade Types (upgrades) terms.
 *
 * @type {Ref<Array>} - References to arrays for Offers (other-offer) and Upgrade Types (upgrades).
 */
const selectedUpgradeTypes = ref([]);

/**
 * Ref for controlling the visibility of loading messages.
 *
 * @type {Ref<Boolean>} - A reference to a boolean indicating whether to show loading messages.
 */
const showLoadingMessage = ref(true);

/**
 * Ref for controlling the loading state.
 *
 * @type {Ref<Boolean>} - A reference to a boolean indicating whether data is currently being loaded.
 */
const isLoading = ref(false);

/**
 * Refs for storing the CSS class name for active state, updating state, and checked (checkbox) state.
 *
 * @type {Ref<String>} - A reference to the CSS class name for an active state.
 */
const activeClass = ref('is-active');
const updatingClass = ref('is-updating');
const isCheckedClass = ref('is-checked');

/**
 * Ref for storing the default page size for paginated results.
 *
 * @type {Ref<Number>} - A reference to the default page size.
 */
const pageSize = ref(30); // Default page size

/**
 * Ref for storing the current page number for paginated results.
 *
 * @type {Ref<Number>} - A reference to the current page number.
 */
const currentPage = ref(1);

/**
 * Ref for storing the sessionStorage keys for JSON objects to be
 * purged.  This prevents overrunning the sessionStorage max.
 *
 * @type {Ref<Array>} - A reference to an array of sessionStorage keys to empty.
 */
const itemsToClearFromSessionStorage = ref([
    'contractorsData',
    'contractorsTimestamp',
    'faqsData',
    'faqsTimestamp',
    'pqeasData',
    'pqeasTimestamp',
]);

/**
 * Ref for storing the public domain URL.
 *
 * @type {Ref<String>} - A reference to the public domain URL.
 */
const publicDomain = ref('https://www.betterhomesbc.ca');

/**
 * Variable for constructing the API URL for fetching Rebates.
 *
 * @type {String} - The constructed API URL for fetching Rebates.
 */
const rebatesAPI = `${window.site?.domain ? window.site.domain : publicDomain}/wp-json/custom/v1/rebates`;

/**
 * Computed property to handle filtering Rebates (Rebates) by category and/or location.
 *
 * Uses the selected location to filter Rebates based on location and incorporates the results from category filtering.
 *
 * @type {Array} - An array containing the filtered Rebates based on selected taxonomy terms.
 */
const filteredRebates = computed(() => {
    const selectedLoc = selectedLocation.value;
    const selectedUpgrades = selectedUpgradeTypes.value;
    const selectedBuild = selectedBuildType.value;
    const selectedSystem = selectedHeatingSystem.value;
    const selectedOffer = selectedOtherOffers.value;

    let filteredRebates = [...rebates.value];

    // Filter by location if 'all' is not selected.
    if ('all' !== selectedLoc) {
        filteredRebates = filteredRebates.filter(rebate => rebate.locations && rebate.locations.some(location => location.name === selectedLoc));
    }
    // Filter by Build Type if 'all' is not selected.
    if ('all' !== selectedBuild) {
        filteredRebates = filteredRebates.filter(rebate => rebate.types && rebate.types.some(type => type.name === selectedBuild));
    }
    // Filter by Current Primary Heating System if 'all' is not selected.
    if ('all' !== selectedSystem) {
        filteredRebates = filteredRebates.filter(rebate => rebate.primary_heating_sys && rebate.primary_heating_sys.some(sys => sys.name === selectedSystem));
    }
    // Filter by Other Offers (multi) if any are selected.
    if ('all' !== selectedOffer) {
        filteredRebates = filteredRebates.filter(rebate => rebate.other_offers && rebate.other_offers.some(offer => offer.name === selectedOffer));
    }
    // Filter by Upgrade Types (multi) if any are selected.
    if (selectedUpgrades.length) {
        filteredRebates = filteredRebates.filter(rebate => rebate.upgrade_types && rebate.upgrade_types.some(type => selectedUpgrades.includes(type.name)));
    }

    resetSelectsActiveState();

    return filteredRebates;
});

/**
 * Function to apply and remove an updating animation class to specified elements.
 *
 * This function selects elements based on the provided CSS path (`elementCssPath`) using `document.querySelectorAll`.
 * It then adds an updating animation class (`updatingClass.value`) to each selected element and removes it after a short delay (125ms)
 * to simulate an update animation effect.
 *
 * @param {string} elementCssPath - The CSS path selector used to target elements for animation.
 * @returns {void}
 */
const handleUpdatingAnimationClass = (elementCssPath) => {
    // Query all elements matching the specified CSS path.
    const elements = document.querySelectorAll(elementCssPath);

    // Check if any elements are found.
    if (elements.length > 0) {
        // Apply the updating animation class to each element and schedule its removal.
        elements.forEach((element) => {
            // Add the updating animation class to the element.
            element.classList.add(updatingClass.value);

            // Schedule the removal of the updating animation class after a short delay (125ms).
            setTimeout(() => {
                element.classList.remove(updatingClass.value);
            }, 125);
        });
    }
};

/**
 * Computed property to calculate the total number of pages for paginated Rebates (Rebates).
 *
 * Uses the length of filtered Rebates and the page size to determine the total number of pages.
 *
 * @type {number} - The total number of pages for paginated Rebates.
 */
const totalPages = computed(() => {
    const totalRebates = filteredRebates.value.length;
    return totalRebates > 0 ? Math.ceil(totalRebates / pageSize.value) : 1;
});

/**
 * Computed property to calculate the paginated Rebates (Rebates).
 *
 * Uses the current page and page size to determine the slice of filtered Rebates to display.
 *
 * @type {Array} - An array containing the paginated Rebates for the current page.
 */
const paginatedRebates = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return filteredRebates.value.slice(start, end);
});

/**
 * Function to navigate to the previous page in paginated results.
 *
 * Decrements the current page if it is greater than 1.
 *
 * @returns {number|null} - The updated current page value or null if already on the first page.
 */
const prevPage = () => {
    return currentPage.value > 1 ? currentPage.value-- : null;
};

/**
 * Function to navigate to the next page in paginated results.
 *
 * Increments the current page if it is less than the total number of pages.
 *
 * @returns {number|null} - The updated current page value or null if already on the last page.
 */
const nextPage = () => {
    return currentPage.value < totalPages.value ? currentPage.value++ : null;
};

/**
 * Computed property to extract unique Project Types (project-types) from Rebates.
 * Iterates through the Rebates to collect distinct project type names and sorts them alphabetically.
 *
 * @type {Array} - An array containing unique Project Types sorted alphabetically.
 */
const types = computed(() => {
    const uniqueTypes = new Set();

    // Iterate through Rebates to collect distinct project type names.
    rebates.value.forEach(rebate => {
        if (rebate.types) {
            if (typeof rebate.types === 'string') {
                uniqueTypes.add(rebate.types.name);
            } else if (Array.isArray(rebate.types)) {
                rebate.types.forEach(type => {
                    uniqueTypes.add(type.name);
                });
            }
        }
    });

    // Convert Set to array and sort alphabetically.
    const sortedTypes = Array.from(uniqueTypes).sort((a, b) => a.localeCompare(b));
    return [...sortedTypes];
});

/**
 * Computed property to extract unique Project Types (project-types) from Rebates.
 * Iterates through the Rebates to collect distinct project type names and sorts them alphabetically.
 *
 * @type {Array} - An array containing unique Project Types sorted alphabetically.
 */
const upgrades = computed(() => {
    const uniqueUpgrades = new Set();

    // Iterate through Rebates to collect distinct project type names.
    rebates.value.forEach(rebate => {
        if (rebate.upgrade_types) {
            if (typeof rebate.upgrade_types === 'string') {
                uniqueUpgrades.add(rebate.upgrade_types);
            } else if (Array.isArray(rebate.upgrade_types)) {
                rebate.upgrade_types.forEach(upgrade => {
                    uniqueUpgrades.add(upgrade.name);
                });
            }
        }
    });

    // Convert Set to array and sort alphabetically.
    const sortedUpgrades = Array.from(uniqueUpgrades).sort((a, b) => a.localeCompare(b));

    return [...sortedUpgrades];
});

/**
 * Computed property to extract unique Project Types (project-types) from Rebates.
 * Iterates through the Rebates to collect distinct project type names and sorts them alphabetically.
 *
 * @type {Array} - An array containing unique Project Types sorted alphabetically.
 */
const offers = computed(() => {
    const uniqueOffers = new Set();

    // Iterate through Rebates to collect distinct project type names.
    rebates.value.forEach(rebate => {
        if (rebate.other_offers) {
            if (typeof rebate.other_offers === 'string') {
                uniqueOffers.add(rebate.other_offers);
            } else if (Array.isArray(rebate.other_offers)) {
                rebate.other_offers.forEach(offer => {
                    uniqueOffers.add(offer.name);
                });
            }
        }
    });

    // Convert Set to array and sort alphabetically.
    const sortedOffers = Array.from(uniqueOffers).sort((a, b) => a.localeCompare(b));

    return [...sortedOffers];
});

/**
 * Computed property to extract unique Project Types (project-types) from Rebates.
 * Iterates through the Rebates to collect distinct project type names and sorts them alphabetically.
 *
 * @type {Array} - An array containing unique Project Types sorted alphabetically.
 */
const systems = computed(() => {
    const uniqueSystems = new Set();

    // Iterate through Rebates to collect distinct project type names.
    rebates.value.forEach(rebate => {
        if (rebate.primary_heating_sys) {
            if (typeof rebate.primary_heating_sys === 'string') {
                uniqueSystems.add(rebate.primary_heating_sys);
            } else if (Array.isArray(rebate.primary_heating_sys)) {
                rebate.primary_heating_sys.forEach(upgrade => {
                    uniqueSystems.add(upgrade.name);
                });
            }
        }
    });

    // Convert Set to array and sort alphabetically.
    const sortedSystems = Array.from(uniqueSystems).sort((a, b) => a.localeCompare(b));

    return [...sortedSystems];
});

/**
 * Computed property to extract unique Locations (locations) from Rebates.
 * Iterates through the Rebates to collect distinct location names and sorts them alphabetically.
 *
 * @type {Array} - An array containing unique Locations sorted alphabetically.
 */
const locations = computed(() => {
    const uniqueLocations = new Set();

    // Iterate through Rebates to collect distinct location names.
    rebates.value.forEach(rebate => {
        if (rebate.locations) {
            if (typeof rebate.locations === 'string') {
                uniqueLocations.add(rebate.locations.name);
            } else if (Array.isArray(rebate.locations)) {
                rebate.locations.forEach(location => {
                    uniqueLocations.add(location.name);
                });
            }
        }
    });

    // Convert Set to array and sort alphabetically.
    const sortedLocations = Array.from(uniqueLocations).sort((a, b) => a.localeCompare(b));
    return [...sortedLocations];
});


/**
 * Function assembles a URL with query string parameters for the selected type, program, and location.
 *
 * @returns {string} - The assembled URL with query string parameters.
 */
const assembleUrl = () => {
    const baseUrl = window.location.origin + window.location.pathname;

    const urlParams = new URLSearchParams();

    // Add tool identifier
    urlParams.set('tool', 'rebates');

    // Add type filter if not default
    if (selectedBuildType.value && selectedBuildType.value !== 'all') {
        urlParams.set('type', encodeURIComponent(selectedBuildType.value));
    }

    // Add program filter if not default
    if (selectedLocation.value && selectedLocation.value !== 'all') {
        urlParams.set('region', encodeURIComponent(selectedLocation.value));
    }

    // Add location filter if not default
    if (selectedHeatingSystem.value && selectedHeatingSystem.value !== 'all') {
        urlParams.set('system', encodeURIComponent(selectedHeatingSystem.value));
    }

    // Add upgrade filter if not default
    if (selectedUpgradeTypes.value.length > 0) {
        const wrappedUpgrades = selectedUpgradeTypes.value.map(upgrade => `"${upgrade}"`).join(',');
        urlParams.set('upgrade', encodeURIComponent(wrappedUpgrades));
    }

    // Combine base URL with query string
    return `${baseUrl}?${urlParams.toString()}`;
};

/**
 * Copies the dynamically assembled URL with filters to the clipboard.
 *
 * This function generates a URL containing query string parameters based on
 * the selected type, program, and location, and copies it to the clipboard.
 * It provides feedback via a success or error message.
 *
 * @function
 * @returns {void}
 *
 * @example
 * // Example usage:
 * addLinkToClipboard();
 * // Copies a URL like:
 * // https://betterhomesbc.ca?tool=contractors&type=Heat%20Pump&program=Energy%20Savings&region=Vancouver
 */
const addLinkToClipboard = (event) => {
    const url = assembleUrl();

    navigator.clipboard
        .writeText(url)
        .then(() => {
            handleLinkCopiedMessageContent(event, '.filter-container', 'Shareable link copied to clipboard!');
        })
        .catch((err) => {
            console.error('Failed to copy URL:', err);
            alert('Failed to copy the link. Please try again.');
        });
};

const canCopyLink = computed(() => {
  return Boolean(
    selectedLocation.value && selectedLocation.value !== 'all'
  )
});


/**
 * Injects messageToUser into ARIA live region node.
 *
 * @param {Event} event - The event object triggered by the click action.
 */
function handleLinkCopiedMessageContent(event, target = '.filter-container', msg) {
    const container = event.target.closest(target);
    const messageArea = container ? container.querySelector('.copy-message') : null;

    if (messageArea) {
        messageArea.innerText = msg;
        messageArea.classList.remove('isFadedOut');

        setTimeout(() => {
            messageArea.classList.add('isFadedOut');
        }, 1500);

        setTimeout(() => {
            messageArea.innerText = '';
        }, 2000);
    }
}


/**
 * Computed property for generating a filter results message based on the selected category.
 * Indicates whether the selected category is the default, and provides a message accordingly.
 *
 * @type {String} - A string indicating the filter results message based on the selected category.
 */
const currentBuildTypeFilterMessage = computed(() => {
    return 'all' !== selectedBuildType.value ? ' for ' + selectedBuildType.value.toLowerCase() : null;
});

/**
 * Computed property for generating a filter results message based on the selected location.
 * If the selected location is not 'all', the message indicates servicing the selected location.
 *
 * @type {String|null} - A string indicating the filter results message or null if 'all' is selected.
 */
const currentLocationFilterMessage = computed(() => {
    return 'all' !== selectedLocation.value ? ' available to residents of ' + selectedLocation.value : null;
});

const currentHeatingSystemFilterMessage = computed(() => {
    return 'all' !== selectedHeatingSystem.value ? ' for ' + selectedHeatingSystem.value + ' heating systems ' : null;
});

/**
 * Determine the CSS classes for a rebate amount based on its value.
 *
 * This function calculates and returns a string of CSS classes based on the provided `rebate_amount`.
 * The resulting CSS classes include a default class (`rebate__amount`) combined with contextual classes
 * determined by the `rebate_amount` value.
 *
 * @param {string} rebate_amount - The rebate amount value to evaluate.
 * @returns {string} - A string of CSS classes representing the styled presentation of the rebate amount.
 */
const rebateAmountClasses = (rebate_amount) => {
    // Define a reactive reference to the default CSS class.
    const default_class = ref('rebate__amount');

    // Define a reactive reference for contextual CSS classes.
    const contextual_classes = ref('');

    // Determine contextual classes based on the rebate_amount value.
    switch (rebate_amount.toLowerCase()) {
        case 'fully subscribed':
            contextual_classes.value = 'fully-subscribed';
            break;
        case 'free':
            contextual_classes.value = 'free';
            break;
        case 'nearly subscribed':
            contextual_classes.value = 'nearly-subscribed';
            break;
        default:
            contextual_classes.value = '';
    }

    // Concatenate default class with contextual classes and return the result.
    return default_class.value + ' ' + contextual_classes.value;
};

/**
 * Clears all selected locations and types and resets the filter, removes the hash from the URL,
 * scrolls smoothly to the categories filter container, and checks for external links.
 *
 * @returns {void}
 */
const clearFilters = () => {
    const allActiveFilters = document.querySelectorAll(`.${isCheckedClass.value}`);
    const checkboxFilterAll = document.querySelectorAll(".all");

    resetSelectsActiveState();

    selectedBuildType.value = defaultSelectedBuildType.value;
    selectedHeatingSystem.value = defaultSelectedHeatingSystem.value;
    selectedLocation.value = defaultSelectedLocation.value;
    selectedOtherOffers.value = defaultOtherOffers.value;
    selectedUpgradeTypes.value = [];

    history.replaceState(selectedBuildType.value, defaultSelectedBuildType.value);
    history.replaceState(selectedHeatingSystem.value, defaultSelectedHeatingSystem.value);
    history.replaceState(selectedLocation.value, defaultSelectedLocation.value);
    history.replaceState(selectedOtherOffers.value, defaultOtherOffers.value);

    allActiveFilters.length ? allActiveFilters.forEach((activeFilter) => {
        activeFilter.classList.remove(isCheckedClass.value)
    }) : null;
    checkboxFilterAll.checked = true;
    checkboxFilterAll.forEach((checkbox) => {
        checkbox.classList.add(isCheckedClass.value)
    });

    currentPage.value !== 1 ? handleUpdatingAnimationClass(".control.pagination .pages") : null;
    currentPage.value = 1;
};

/**
 * Handle the selection of "Select All" input filters.
 *
 * This function manages the behavior when a "Select All" input filter is selected.
 * It toggles the selection state of the filter and updates related reactive data.
 * Additionally, it resets other active filters and triggers pagination updates if needed.
 *
 * @param {Event} event - The event object representing the input filter selection.
 * @returns {void}
 */
const handleSelectAllInputFilter = (event) => {
    // Find the closest filter list container element.
    const container = event.target.closest(".filter__list");

    // Retrieve the "Select All" checkbox within the container.
    const filterAll = container.querySelector('.all');

    // Find all currently active filters within the container.
    const allActiveFilters = container ? container.querySelectorAll(`.${isCheckedClass.value}`) : null;

    // Handle specific actions based on the selected input filter ID.
    if (event.target.id === "offerTypeAll" || event.target.id === "offerTypeAll--mobile") {
        // Update the selectedOtherOffers value when offer type "Select All" is selected.
        selectedOtherOffers.value = 'all';
    } else if (event.target.id === "upgradeTypeAll") {
        // Reset the selectedUpgradeTypes array when upgrade type "Select All" is selected.
        selectedUpgradeTypes.value = [];
    }

    // Remove isCheckedClass from all active filters except for the "All" filter.
    allActiveFilters.forEach((activeFilter) => {
        if (activeFilter !== filterAll) {
            activeFilter.classList.remove(isCheckedClass.value);
        }
    });

    // Add isCheckedClass to the parent node of the event target if it's not already added.
    if (!event.target.parentNode.classList.contains(isCheckedClass.value)) {
        event.target.parentNode.classList.add(isCheckedClass.value);
    }

    // Check the "All" filter checkbox to select it.
    filterAll.checked = true;

    // Reset the current pagination page to 1 and trigger a UI animation if necessary.
    if (currentPage.value !== 1) {
        handleUpdatingAnimationClass('.control.pagination .pages');
    }
    currentPage.value = 1;
};

/**
 * Reset the active state of custom select elements.
 *
 * This function resets the active state of custom select elements within the rebate filter application.
 * It removes the 'is-active' class from all currently active custom select elements.
 *
 * @returns {void}
 */
const resetSelectsActiveState = () => {
    // Find all active custom select elements within the rebate filter application.
    const activeSelects = document.querySelectorAll('.rebateFilterApp .custom-select.is-active');

    // Check if there are active custom select elements, then remove the 'is-active' class.
    if (activeSelects.length > 0) {
        activeSelects.forEach((item) => {
            item.classList.remove('is-active');
        });
    }
};

/**
 * Event listener bound to @click and @keyup.esc
 * Toggle active class for presentation on <select> element wrapper .custom-select.
 *
 * @param {Event} event - The click or keyup event.
 * @returns {void}
 */
const selectIsActive = (event) => {
    return 'click' !== event.type ? event.target.parentNode.classList.remove(activeClass.value) : event.target.parentNode.classList.toggle(activeClass.value);
};

/**
 * Calculates and returns the count of posts containing a specific tag.
 *
 * Iterates through the `filteredRebates` array and increments the count for each post that includes the specified tag.
 *
 * @param {string} tag - The tag for which to calculate the count.
 * @returns {number} The count of posts containing the specified tag.
 *
 * Because the Upgrade Type filter is presented as a multi-select, * run .reduce() against all Rebates, rather than just the current, * filtered sub-set.
 */
const getUpgradeTypeTagCount = (tag) => {
    const app = document.querySelector('.rebateFilterApp');
    const filterContainers = app ? app.querySelectorAll('.filter--upgrade-types') : null;
    const selectedLoc = selectedLocation.value;
    const selectedBuild = selectedBuildType.value;
    const selectedSystem = selectedHeatingSystem.value;

    let count = 0;

    // filteredRebates is the result of all filters.  For this count, we
    // want to use the results filtered by the primary filters only.
    let primaryFilteredRebates = [...rebates.value];

    // Filter by location if 'all' is not selected.
    if ('all' !== selectedLoc) {
        primaryFilteredRebates = primaryFilteredRebates.filter(rebate => rebate.locations && rebate.locations.some(location => location.name === selectedLoc));
    }
    // Filter by Build Type if 'all' is not selected.
    if ('all' !== selectedBuild) {
        primaryFilteredRebates = primaryFilteredRebates.filter(rebate => rebate.types && rebate.types.some(type => type.name === selectedBuild));
    }
    // Filter by Current Primary Heating System if 'all' is not selected.
    if ('all' !== selectedSystem) {
        primaryFilteredRebates = primaryFilteredRebates.filter(rebate => rebate.primary_heating_sys && rebate.primary_heating_sys.some(sys => sys.name === selectedSystem));
    }

    // Because we cannot pass the taxonomy term array into .reduce(), we
    // flatten the array into a string with JSON.stringify() and run
    // .includes() against the outcome.  If our string is found, increment
    // count by 1.  Otherwise increment by zero.
    count = primaryFilteredRebates.reduce(
        (count, rebate) => count + (JSON.stringify(rebate.upgrade_types).includes(tag) ? 1 : 0),
        0
    );

    // Failsafe against this code being run when the DOM is not fully loaded.
    if (filterContainers.length) {
        filterContainers.forEach((filterContainer) => {
            // Find the radio input element corresponding to the specified filter.
            const radioInput = filterContainer ? filterContainer.querySelector('.filter__item input[value=\"' + tag + '\"]') : null;

            if (radioInput) {
                if (0 === count) {
                    // Manage helper CSS classes.
                    radioInput.parentNode.classList.remove(isCheckedClass.value);
                    radioInput.parentNode.classList.add('is-disabled');

                    // If the given filter has zero results (because another filter has changed)
                    // remove it from the current search criteria.
                    selectedUpgradeTypes.value.forEach((upgrade) => {
                        if (radioInput.name === upgrade) {
                            // Remove empty term from search query if secondary filter count
                            // is zero as a result of primary filter configuration.
                            selectedUpgradeTypes.value = selectedUpgradeTypes.value.filter(upgrade => upgrade !== radioInput.name);
                        }
                    });
                } else {
                    // Remove CSS helper class.
                    radioInput.parentNode.classList.remove('is-disabled');
                }
            }
        });
    }

    return count;
};

/**
 * Calculates and returns the count of posts containing a specific tag.
 *
 * Iterates through the `filteredRebates` array and increments the count for each post that includes the specified tag.
 *
 * @param {string} tag - The tag for which to calculate the count.
 * @returns {number} The count of posts containing the specified tag.
 */
const handleOfferTagCount = (tag) => {
    const app = document.querySelector('.rebateFilterApp');
    const filterContainers = app ? app.querySelectorAll('.filter--other-offers') : null;
    const selectedLoc = selectedLocation.value;
    const selectedUpgrades = selectedUpgradeTypes.value;
    const selectedBuild = selectedBuildType.value;
    const selectedSystem = selectedHeatingSystem.value;
    let primaryFilteredRebates = [...rebates.value];
    let count = primaryFilteredRebates.length;

    // Filter by location if 'all' is not selected.
    if ('all' !== selectedLoc) {
        primaryFilteredRebates = primaryFilteredRebates.filter(rebate => rebate.locations && rebate.locations.some(location => location.name === selectedLoc));
    }
    // Filter by Build Type if 'all' is not selected.
    if ('all' !== selectedBuild) {
        primaryFilteredRebates = primaryFilteredRebates.filter(rebate => rebate.types && rebate.types.some(type => type.name === selectedBuild));
    }
    // Filter by Current Primary Heating System if 'all' is not selected.
    if ('all' !== selectedSystem) {
        primaryFilteredRebates = primaryFilteredRebates.filter(rebate => rebate.primary_heating_sys && rebate.primary_heating_sys.some(sys => sys.name === selectedSystem));
    }

    // Filter by Upgrade Types (multi) if any are selected.
    if (selectedUpgrades.length) {
        primaryFilteredRebates = primaryFilteredRebates.filter(rebate => rebate.upgrade_types && rebate.upgrade_types.some(type => selectedUpgrades.includes(type.name)));
    }

    count = primaryFilteredRebates.reduce(
        (count, rebate) => count + (JSON.stringify(rebate.other_offers).includes(tag) ? 1 : 0),
        0
    );

    if (filterContainers.length) {
        filterContainers.forEach((filterContainer) => {
            // Find the radio input element corresponding to the specified filter.
            const radioInput = filterContainer ? filterContainer.querySelector('.filter__item input[value=\"' + tag + '\"]') : null;
            const radioInputAll = filterContainer ? filterContainer.querySelector('.all input') : null;

            if (radioInput) {
                if (0 === count) {
                    // Manage helper CSS classes.
                    radioInput.parentNode.classList.remove(isCheckedClass.value);
                    radioInput.parentNode.classList.add('is-disabled');

                    if (selectedOtherOffers.value === radioInput.name) {
                        selectedOtherOffers.value = defaultOtherOffers.value;
                        history.replaceState(selectedOtherOffers.value, defaultOtherOffers.value);
                    }
                } else {
                    radioInput.parentNode.classList.remove('is-disabled');
                }
            }
        });
    }

    return count;
};

function simulateClickOnEnter(event) {
    event.target.click();
}

/**
 * Compute the total count of offer tags from filtered rebates.
 *
 * This computed property calculates the total count of offer tags from filtered rebates.
 * It iterates through the filtered rebates and counts the number of offer tags present in each rebate.
 *
 * @type {number} - The total count of offer tags from filtered rebates.
 */
const getOfferTotalTagCount = computed(() => {
    return filteredRebates.value.reduce((count, rebate) => {
        // Check if the rebate has 'other_offers' and add the length of 'other_offers' to the count.
        return count + (rebate.other_offers ? rebate.other_offers.length : 0);
    }, 0);
});

/**
 * Fetches rebate data either from sessionStorage cache (if available and not expired) or from the WordPress API.
 * If data is fetched from the API, it is stored in sessionStorage for caching purposes.
 */

/**
* Determines if the provided error indicates that storage quota has been exceeded.
*
* @param {any} error - The error object to test.
* @returns {boolean} `true` if the error is a QuotaExceededError; otherwise, `false`.
*/
const isQuotaExceededError = (error) => {
    if (!error) return false;
    return (
        error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    );
};

/**
 * Helper function to check whether the provided timestamp is within the past 24 hours.
 *
 * @param {string|number} timestamp - The timestamp to evaluate (in milliseconds).
 * @returns {boolean} `true` if the timestamp is less than 24 hours old, otherwise `false`.
 */
const isDataValid = (timestamp) => {
    const timeElapsed = Date.now() - parseInt(timestamp, 10);
    const hoursElapsed = timeElapsed / (1000 * 60 * 60);
    return hoursElapsed < 24;
};

/**
 * Fetches rebate data from session or local storage if valid; otherwise fetches from the API.
 * Updates `rebates.value` with the fetched data and toggles loading indicators accordingly.
 * Tries to store the data in sessionStorage, falling back to localStorage on quota errors.
 *
 * @async
 * @function fetchData
 * @returns {Promise<void>} Resolves when the fetch and state updates complete.
 * @throws {Error} Throws an error if the network request fails or data parsing fails.
 */
const fetchData = async () => {
    try {
        // Set loading indicators.
        isLoading.value = true;
        showLoadingMessage.value = true;

        // Check sessionStorage.
        let data = sessionStorage.getItem('rebatesData');
        let timestamp = sessionStorage.getItem('rebatesTimestamp');
        let cachedData = null;

        if (data && timestamp && isDataValid(timestamp)) {
            // data in sessionStorage is valid.
            cachedData = JSON.parse(data);
        } else {
            // Check localStorage.
            data = localStorage.getItem('rebatesData');
            timestamp = localStorage.getItem('rebatesTimestamp');
            if (data && timestamp && isDataValid(timestamp)) {
                // data in localStorage is valid.
                cachedData = JSON.parse(data);
            }
        }

        // If cachedData is found (from either storage), use it and return early.
        if (cachedData) {
            rebates.value = cachedData;
            showLoadingMessage.value = false;
            isLoading.value = false;
            return;  // <-- stop here, we have valid cache.
        }

        // Fetch from API if no valid cache found.
        const response = await fetch(rebatesAPI, { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();

        // Optionally clear sessionStorage to avoid piling up.
        try {
            itemsToClearFromSessionStorage.value.forEach((item) => {
                sessionStorage.removeItem(item);
            });
            sessionStorage.clear();
        } catch (clearError) {
            console.warn('Error clearing sessionStorage:', clearError);
        }

        // Save to sessionStorage; fall back to localStorage on quota error.
        try {
            sessionStorage.setItem('rebatesData', JSON.stringify(json));
            sessionStorage.setItem('rebatesTimestamp', Date.now().toString());
        } catch (storageError) {
            if (isQuotaExceededError(storageError)) {
                console.warn('SessionStorage quota exceeded. Falling back to localStorage.');
                try {
                    localStorage.setItem('rebatesData', JSON.stringify(json));
                    localStorage.setItem('rebatesTimestamp', Date.now().toString());
                } catch (lsError) {
                    console.error('Error setting data in localStorage:', lsError);
                }
            } else {
                console.error('Error setting data in sessionStorage:', storageError);
                throw storageError; // or handle differently.
            }
        }

        // Update state.
        rebates.value = json;
        showLoadingMessage.value = false;
        isLoading.value = false;
    } catch (error) {
        console.error('Error fetching rebates data:', error);
        throw error;
    }
};


/**
 * Manages the accordion title, updating the title when one or more filters
 * are active.
 *
 * @param {array} selectedUpgradeTypes
 */
const upgradeTypesAccordionTitle = (selectedUpgradeTypes) => {
    let title = '';

    if (0 === selectedUpgradeTypes.length) {
        title += ' (All types active)';
    } else {
        title += '(' + selectedUpgradeTypes.length.toString();
        title += 1 === selectedUpgradeTypes.length ? ' filter ' : ' filters ';
        title += 'active)';
    }

    return title;
};

/**
 * SNOWPLOW EVENTS: Click handlers and watcher for events that fire analytics.
 */

/**
 * Called each time the user clicks athe "View rebate details" link in an <article>.
 * Pass in all relevant filters as function parameters so trackRebateClick
 * doesn't need direct access to these refs.
 */
 const onRebateClick = (rebate)=> {
  trackRebateClick({
    projectType: selectedBuildType.value,
    location:    selectedLocation.value,
    heatingType: selectedHeatingSystem.value,
    filterValues: selectedUpgradeTypes.value,
    label: decodeHtmlEntities(rebate.title),
    rebateText: rebate.rebate_amount || '',
    destination: rebate.post_url || ''
  });
  // Optionally prevent navigation if you only want to debug:
  // event.preventDefault();
}

/**
 * Watcher for changes that fire analytics.
 */
 watch(selectedBuildType, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    trackRebateFilterChange({
      projectType: newVal,
      location: selectedLocation.value,
      heatingType: selectedHeatingSystem.value,
      filterValues: selectedUpgradeTypes.value,
      label: `Build type: ${newVal}`,
      oldVal
    });
  }
});

watch(selectedHeatingSystem, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    trackRebateFilterChange({
      projectType: selectedBuildType.value,
      location: selectedLocation.value,
      heatingType: newVal,
      filterValues: selectedUpgradeTypes.value,
      label: `Primary heating system: ${newVal}`,
      oldVal
    });
  }
});

watch(selectedLocation, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    trackRebateFilterChange({
      projectType: selectedBuildType.value,
      location: newVal,
      heatingType: selectedHeatingSystem.value,
      filterValues: selectedUpgradeTypes.value,
      label: `Service region: ${newVal}`,
      oldVal
    });
  }
});

// watch the array for additions/removals.
watch(
  () => [...selectedUpgradeTypes.value], // watch the array contents
  (newArray, oldArray) => {
    const newlySelected = newArray.filter(x => !oldArray.includes(x));
    const removed       = oldArray.filter(x => !newArray.includes(x));

    // For each newly selected upgrade
    newlySelected.forEach(upgrade => {
      trackRebateUpgradeTypeChange({
        action: 'select',
        projectType: selectedBuildType.value,
        location: selectedLocation.value,
        heatingType: selectedHeatingSystem.value,
        filterValues: newArray,  // all currently selected
        label: upgrade           // the new upgrade just selected
      });
    });

    // For each deselected upgrade
    removed.forEach(upgrade => {
      trackRebateUpgradeTypeChange({
        action: 'deselect',
        projectType: selectedBuildType.value,
        location: selectedLocation.value,
        heatingType: selectedHeatingSystem.value,
        filterValues: newArray,  // all currently selected
        label: upgrade           // the upgrade just removed
      });
    });
  }
);

/**
 * END: SNOWPLOW EVENTS.
 */


/**
 * Watcher for changes in the window.site?.domain variable.
 * Invokes the fetchData() function when the window.site?.domain becomes truthy.
 *
 * @param {Function} callback - The callback function to execute when the watched property changes.
 * @returns {void}
 */
watch(() => window.site?.domain, (newVal) => {
    if (newVal) {
        fetchData();
    }
});

/**
 * Watchers for changes in paginated and filtered rebates.
 *
 * These watchers monitor changes in paginated and filtered rebates to trigger animations accordingly.
 * They avoid firing animations when the number value remains the same to optimize performance.
 *
 * @returns {void}
 */
watch(paginatedRebates, () => {
    // Check if the number of paginated rebates has changed.
    if (oldPaginatedRebatesCount.value !== paginatedRebates.value.length) {
        // Update the old count of paginated rebates.
        oldPaginatedRebatesCount.value = paginatedRebates.value.length;

        // Trigger the updating animation class for paginated rebates.
        handleUpdatingAnimationClass('.control.pagination .paginated-rebates');
    }
});

watch(filteredRebates, () => {
    // Check if the number of filtered rebates has changed.
    if (oldFilteredRebatesCount.value !== filteredRebates.value.length) {
        // Update the old count of filtered rebates.
        oldFilteredRebatesCount.value = filteredRebates.value.length;

        // Trigger the updating animation class for filtered rebates.
        handleUpdatingAnimationClass('.control.pagination .filtered-rebates');
        handleUpdatingAnimationClass('.counter__value');
    }
});

/**
 * Watchers for changes in current page and total pages.
 *
 * These watchers monitor changes in the current page and total pages to trigger animations accordingly.
 * They use the 'handleUpdatingAnimationClass' function to apply updating animations to specific UI elements.
 *
 * @returns {void}
 */
watch(currentPage, () => {
    // Trigger the updating animation class for the current page.
    handleUpdatingAnimationClass(".control.pagination .current-page");
});

watch(totalPages, () => {
    // Trigger the updating animation class for the total pages.
    handleUpdatingAnimationClass(".control.pagination .total-pages");
});

/**
 * Watcher for changes in selectedUpgradeTypes.
 *
 * This watcher monitors changes in the selectedUpgradeTypes reactive property and performs UI updates accordingly.
 * It resets the selected other offers filter if 'all' is not selected, updating the UI state and history state.
 *
 * @returns {void}
 */
watch(selectedUpgradeTypes, () => {
    // Find the container for other offers filters.
    const filterContainers = document.querySelectorAll('.filter--other-offers');

    if (filterContainers.length && 'all' !== selectedOtherOffers.value) {
        filterContainers.forEach((filterContainer) => {
            // Retrieve the "Select All" radio and old active radio filter within the container.
            const allFilterRadio = filterContainer ? filterContainer.querySelector('.all') : null;
            const prevActiveRadio = filterContainer ? filterContainer.querySelector(`.${isCheckedClass.value}`) : null;

            // Remove active state from the old active radio filter if present.
            prevActiveRadio ? prevActiveRadio.classList.remove(isCheckedClass.value) : null;

            // Adjust the state of the "Select All" radio based on active radio filters.
            allFilterRadio ? allFilterRadio.classList.add(isCheckedClass.value) : null;

            // Reset the other offers filter because filter selections may
            // cause it to be empty.
            selectedOtherOffers.value = defaultOtherOffers.value;
            history.replaceState(selectedOtherOffers.value, defaultOtherOffers.value);
        })
    }
});

/**
 * Watcher for changes in selectedUpgradeTypes and selectedLocation.
 * Resets the currentPage to 1 whenever either of the watched properties changes.
 *
 * @param {Array} dependencies - An array of reactive properties to watch.
 * @param {Function} callback - The callback function to execute when any of the watched properties change.
 * @returns {void}
 */
watch([selectedBuildType, selectedLocation, selectedUpgradeTypes, selectedHeatingSystem, selectedOtherOffers], () => {
    currentPage.value = 1;
});

/**
 * Event listener for global click events.
 *
 * This event listener is triggered on any click event within the window.
 * It checks if the clicked target is not within an active custom select dropdown or any custom select dropdown within the rebate filter app.
 * If the click is outside of these areas, it calls the 'resetSelectsActiveState' function to deactivate all active custom select dropdowns.
 *
 * @param {Event} event - The click event object.
 * @returns {void}
 */
window.addEventListener("click", (event) => {
    // Check if the clicked target is not within an active custom select dropdown.
    if (!event.target.closest('.custom-select.is-active') || !document.querySelectorAll('.rebateFilterApp .custom-select.is-active').length) {
        // Reset all active custom select dropdowns.
        resetSelectsActiveState();
    }
});

/**
 * Watches the `selectedUpgradeTypes` array for changes and ensures the upgrade types accordion is expanded
 * if any upgrade type checkboxes are selected. It does not auto-close the accordion at any point.
 *
 * @function
 * @async
 * @returns {Promise<void>} - Resolves when the DOM updates and the accordion's state is handled.
 *
 * @description
 * - Monitors the `selectedUpgradeTypes` array for changes.
 * - If any upgrade type checkboxes are selected:
 *   - Ensures the DOM is updated using `nextTick`.
 *   - Locates the accordion trigger button (`#upgradeTypesAccordionTrigger`).
 *   - Checks the `aria-expanded` attribute to determine if the accordion is already expanded.
 *   - If not expanded, clicks the trigger button to expand the accordion.
 * - Prevents auto-closing by only acting when the accordion is not expanded.
 */
watch(selectedUpgradeTypes, async () => {
    // Check if any upgrade type checkboxes are selected
    const hasSelectedUpgradeTypes = selectedUpgradeTypes.value.length > 0;

    // Get the upgrade types accordion trigger button
    const accordionTrigger = document.querySelector('#upgradeTypesAccordionTrigger');

    // Wait for DOM updates to ensure the checkboxes are rendered
    await nextTick();

    if (hasSelectedUpgradeTypes && accordionTrigger) {
        // Check if the accordion is not already expanded
        const isExpanded = accordionTrigger.getAttribute('aria-expanded') === 'true';

        if (!isExpanded) {
            // Click the trigger to expand the accordion
            accordionTrigger.click();
        }
    }
});


/**
 * A Vue lifecycle hook that is called after the instance has been mounted.
 * It retrieves various attributes from the 'postFilterApp' element and assigns them to reactive properties.
 * It also shows a loading message, fetches data, and then handles the URL hash.
 *
 * @returns {void}
 */
onMounted(() => {

    localAnalyticsReady();

    fetchData();

    // init accordions
    const accordions = document.querySelectorAll('.filter.accordion h2');
    accordions.forEach((accordionEl) => {
        new Accordion(accordionEl);
    });;
});

class Accordion {
    constructor(domNode) {
        this.rootEl = domNode;
        this.buttonEl = this.rootEl.querySelector('button[aria-expanded]');

        const controlsId = this.buttonEl.getAttribute('aria-controls');
        this.contentEl = document.getElementById(controlsId);

        this.open = this.buttonEl.getAttribute('aria-expanded') === 'true';

        // add event listeners
        this.buttonEl.addEventListener('click', this.onButtonClick.bind(this));
    }

    onButtonClick() {
        this.toggle(!this.open);
    }

    toggle(open) {
        // don't do anything if the open state doesn't change
        if (open === this.open) {
            return;
        }

        // update the internal state
        this.open = open;

        // handle DOM updates
        this.buttonEl.setAttribute('aria-expanded', `${open}`);
        if (open) {
            this.contentEl.removeAttribute('hidden');
        } else {
            this.contentEl.setAttribute('hidden', '');
        }
    }

    // Add public open and close methods for convenience
    open() {
        this.toggle(true);
    }

    close() {
        this.toggle(false);
    }
}

watchEffect(() => {
    // Ensure types, systems, locations, and upgrades are populated before proceeding
    if (types.value.length && locations.value.length && systems.value.length && upgrades.value.length) {
        // Get query string parameters
        const urlParams = new URLSearchParams(window.location.search);

        const showParam = urlParams.get('show');

        // Ensure the tool matches "rebates" before processing
        if (null !== urlParams.get('tool') && urlParams.get('tool') !== 'rebates') {
            console.warn('Tool parameter does not match "rebates". Initialization skipped.');
            return;
        }

        // Hide tools if `show=off` is in the query string
        if (showParam === 'off') {
            isVisible.value = false;
        }

        // Initialize selected filters from query string
        const buildType = urlParams.get('type');
        const serviceRegion = urlParams.get('region');
        const rebateSystem = urlParams.get('system');
        const upgradeType = urlParams.get('upgrade');

        // Update the corresponding reactive properties with URI-decoded values
        if (buildType) {
            const decodedBuildType = decodeURIComponent(buildType);
            if (types.value.includes(decodedBuildType)) {
                selectedBuildType.value = decodedBuildType;
            } else {
                console.warn(`Invalid build type: ${decodedBuildType}`);
            }
        }

        if (serviceRegion) {
            const decodedServiceRegion = decodeURIComponent(serviceRegion);
            if (locations.value.includes(decodedServiceRegion)) {
                selectedLocation.value = decodedServiceRegion;
            } else {
                console.warn(`Invalid service region: ${decodedServiceRegion}`);
            }
        }

        if (rebateSystem) {
            const decodedRebateSystem = decodeURIComponent(rebateSystem);
            if (systems.value.includes(decodedRebateSystem)) {
                selectedHeatingSystem.value = decodedRebateSystem;
            } else {
                console.warn(`Invalid rebate program: ${decodedRebateSystem}`);
            }
        }

        if (upgradeType) {
            // Decode the upgradeType parameter and parse quoted values
            const decodedUpgradeType = decodeURIComponent(upgradeType);
            const upgradeTypesArray = parseQuotedValues(decodedUpgradeType);

            // Validate the parsed upgrade types
            const validUpgradeTypes = upgradeTypesArray.filter(upgrade => upgrades.value.includes(upgrade));

            if (validUpgradeTypes.length) {
                selectedUpgradeTypes.value = validUpgradeTypes;
            } else {
                console.warn(`Invalid upgrade types: ${upgradeTypesArray.join(', ')}`);
            }
        }

        // Stop showing the loading message once data is initialized
        showLoadingMessage.value = false;
    }
});

/**
 * Parses a string containing quoted values separated by commas, allowing for commas within quotes.
 *
 * @param {string} input - The string to parse.
 * @returns {string[]} - An array of parsed values.
 */
function parseQuotedValues(input) {
    const values = [];
    let current = '';
    let insideQuotes = false;

    for (const char of input) {
        if (char === '"') {
            // Toggle the insideQuotes state
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            // Push the current value when outside quotes and reset
            values.push(current.trim());
            current = '';
        } else {
            // Append character to the current value
            current += char;
        }
    }

    // Add the last value
    if (current.trim()) {
        values.push(current.trim());
    }

    return values;
}
</script>

<style lang='scss' scoped>
// See bcgov-plugin-cleanbc/styles/public/betterhomes/_vue-apps.scss
.rebateFilterApp {}
</style>