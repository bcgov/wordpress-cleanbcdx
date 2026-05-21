<template>
  <div class="inner">
    <!-- Skip to results link -->
    <a href="#contractorsResults" class="sr-only skip-to-results">Skip to results</a>
    <!-- Filter Controls -->
    <div v-if="isVisible || (1 < totalPages && !isVisible)" id="contractorsFilterControls" class="contractorsFilterControls filter-container">
      <h2 class='settings-headline'>Filter registered contractor list</h2>
        <div class='filter-controls-container'>
          <!-- Deprecated Location Select -->
          <div v-if='false && isVisible' class="control location-select">
            <label for="locationSelect" class="">Choose a service region</label>
            <div class="custom-select">
                <select @change="selectIsActive" @click.prevent="selectIsActive" @touchend="selectIsActive" @keyup.esc="selectIsActive" tabindex="0" id="locationSelect" class="select select--location" v-model="selectedLocation">
                    <option value="all">All Locations</option>
                    <option v-for="location in locations" :key="location" :value="location">{{ location }}</option>
                </select>
            </div>
          </div>

          <!-- Location input -->
          <div v-if="isVisible" class="control type-input location-input-control">
            <label for="contractorLocation">Filter by service region</label>

            <div class="custom-input location-input-wrapper">
              <input
                id="contractorLocation"
                class="location-input"
                :class="{ 'has-valid-selection': hasValidLocationSelection }"
                type="text"
                inputmode="search"
                autocomplete="off"
                placeholder="The community you live closest to"
                :list="isMobile ? 'locationListMobile' : 'locationList'"
                v-model="locationInputProxy"
                @focus="handleLocationFocus"
                @blur="commitLocation('blur')"
                @change="commitLocation('change')"
                @keydown.enter.prevent="commitLocation('enter')"
                :aria-invalid="locationTouched && locationError ? 'true' : 'false'"
                :aria-describedby="locationTouched && locationError ? 'locationError' : null"
              />
              <button
                v-if="hasValidLocationSelection"
                type="button"
                class="location-clear-btn"
                aria-label="Clear selected service region"
                @mousedown.prevent
                @click.prevent="clearLocationSelection"
              ></button>

            </div>
            <!-- Desktop: full datalist -->
            <datalist v-if="!isMobile" id="locationList">
              <option value="All Locations"></option>
              <option v-for="loc in locations" :key="loc" :value="loc"></option>
            </datalist>
            <!-- Mobile: proxy datalist (top 10 only) -->
           <datalist v-else id="locationListMobile">
            <!-- Empty: show only a hint -->
            <option v-if="locationQueryIsEmpty" value="Please type to find your community"></option>

            <!-- Not empty: show All Locations + top 10 suggestions -->
            <template v-else>
              <option value="All Locations"></option>
              <option v-for="loc in mobileLocationOptions" :key="loc" :value="loc"></option>
            </template>
          </datalist>

            <!-- Error information -->
            <p v-if="locationTouched && locationError" id="locationError" class="message error-message" role="alert">
              {{ locationError }}
            </p>
          </div>

          <!--Name filter -->
          <div v-if='isVisible' class="control type-input">
            <label for="nameInput" class="">Filter by company name</label>
            <div class="custom-input">
              <input
                id="nameInput"
                type="search"
                v-model.trim="nameQuery"
                autocomplete="organization"
                placeholder="Type a company name"
              />
            </div>
          </div>

          
          <!-- Type Select -->
          <div v-if='isVisible' class="control type-select">
            <label for="typeSelect" class="">Choose a type of upgrade</label>
            <div class="custom-select">
                <select @change="selectIsActive"
                  @click.prevent="selectIsActive"
                  @touchend="selectIsActive"
                  @keyup.esc="selectIsActive"
                  tabindex="0"
                  id="typeSelect"
                  class="select select--type"
                  v-model="selectedUpgradeType"
                  :required="true"
                  data-active="false">
                    <option value="all">All Upgrade Types</option>
                    <option v-for="(type, index) in types" :key="type" :value="type">{{ type }}</option>
                </select>
            </div>
          </div>

          <!-- Program Select -->
          <div v-if='isVisible' class="control program-select">
            <label for="programSelect" class="">Choose a rebate program</label>
            <div class="custom-select">
                <select @change="selectIsActive" @click.prevent="selectIsActive" @touchend="selectIsActive" @keyup.esc="selectIsActive" tabindex="0" id="programSelect" class="select select--program" v-model="selectedProgram" :required="true" data-active="false">
                    <option value="all">All Programs</option>
                    <option v-for="(program, index) in programs" :key="program" :value="program">{{ program }}</option>
                </select>
            </div>
          </div>

        </div>

        <!-- Clear Filters Button -->
        <div v-if='isVisible' class="control reset-filters">
          <p class="totals" aria-live='polite'>
            Showing {{ displayedContractors.length }} of {{ filteredContractors.length }} contractors
          </p>

          <!-- Add Link to Clipboard Button -->
          <div class="control copy-link-btn">
              <button
                class="copy-link share"
                @click.prevent="addLinkToClipboard"
                @keydown.enter.prevent="addLinkToClipboard"
                :disabled="!canCopyLink"
                type="button"
              >
                Share
              </button>
              <span class="copy-message isFadedOut" role="status" aria-live="polite"></span>
          </div>
          
          <button class="clear-filters" @click.prevent="clearFilters"
            @touchend="clearFilters"
            @keydown.enter.prevent="clearFilters"
            type="button">
            Reset selection
          </button>
      </div>

        <!-- Pagination Controls -->
        <div v-if="(isVisible && 1 !== totalPages) || (1 < totalPages && !isVisible)" class="contractorsFilterPagination control pagination pagination--top">
            <!-- Previous Page Button -->
            <button class="prev-page" @click.prevent="prevPage" :disabled="currentPage === 1" tabindex="0" type="button">Previous Page</button>
            <!-- Current Page & Totals -->
            <span class="pages">Page <span class="numValue current-page">{{ currentPage }}</span> of <span class="numValue total-pages">{{ totalPages }}</span></span>
            <!-- Next Page Button -->
            <button class="next-page" @click.prevent="nextPage" :disabled="currentPage === totalPages" tabindex="0" type="button">Next Page</button>

            <!-- Results Information -->
            <div class="totals">
                Showing <span class="results-count"><span class="numValue paginated-contractors">{{displayedContractors.length }}</span> of <span class="numValue filtered-contractors">{{ filteredContractors.length }}</span></span> registered contractors
            </div>

            <!-- ARIA live regions -->
            <span class="sr-status sr-only">
                <span class="results-count" role="status" aria-live="polite">Showing <span class="numValue paginated-contractors">{{ displayedContractors.length }}</span> of <span class="numValue filtered-contractors">{{ filteredContractors.length }}</span> registered contractors {{ currentTypeFilterMessage }} {{ currentLocationFilterMessage }}.</span>
                <span class="pages" role="status" aria-live="polite">Page <span class="numValue current-page">{{ currentPage }}</span> of <span class="numValue total-pages">{{ totalPages }}</span></span>
            </span>

            <!-- Load vs page mode Button -->
            <div v-if="false" class="control view-mode custom-select">
            <label for="displayMode" class='sr-only'>Choose how results are shown: page by page or continuously as you scroll.</label>
            <select id="displayMode" v-model="displayMode" class="select select--type">
              <option value="paginate">Page by page</option>
              <option value="loadMore">Show more as you scroll (50 at a time)</option>
            </select>
          </div>
        </div>
    </div>

    <!-- Contractors Results Table -->
    <h2 v-if="false" class="results__title">Find a registered contractor (<span class="counter__value">{{ filteredContractors.length }}</span> results)</h2>
    <table id="contractorsResults" class="contractorsResults results table table--striped">
        <caption class="sr-only">Registered Contractors</caption>
        <!-- Table Columns -->
        <colgroup>
            <col class="col col--1 odd col--contractor__company-and-location"/>
            <!-- <col class="col col--2 even col--contractor__head-office"/> -->
            <col class="col col--2 odd col--contractor__email-and-phone"/>
            <col class="col col--3 even col--contractor__upgrade-types"/>
            <col class="col col--4 odd col--contractor__program-designations"/>
        </colgroup>
        <!-- Table Header -->
        <thead>
            <tr>
                <th class="contractor-heading odd contractor-heading--company-and-location">Company name &amp; head&nbsp;office&nbsp;location</th>
                <!-- <th class="contractor-heading even contractor-heading--contact-name">Head Office</th> -->
                <th class="contractor-heading odd contractor-heading--email-and-phone">Email &amp; phone</th>
                <th class="contractor-heading even contractor-heading--service-organizations">Upgrade type(s)</th>
                <th class="contractor-heading odd contractor-heading--services">Qualified program(s)</th>
            </tr>
        </thead>

        <!-- Table Body -->
        <tbody ref="resultsTbody" :class="`page page--${currentPage}`">
            <!-- No Results Message -->
            <tr v-if="filteredContractors.length === 0 && !isLoading" class="no-results">
                <td colspan="100%">
                    <div class="no-results" role="status" aria-live="polite">
                      <p>There are currently no registered contractors in your community for the selected program or upgrade. Try searching a nearby community.</p>
                      <p>Contractors who aren't on this list can visit <a href="https://homeperformance.ca/about-the-network/">homeperformance.ca/contractornetwork</a> to register for Better Homes programs.</p>
                    </div>
                </td>
            </tr>

            <!-- Loading Message -->
            <tr v-if="isLoading" class="is-loading" role="status" aria-live="polite">
                <td colspan="100%">
                    <p class="no-results loading">Retrieving a list of registered contractors, please wait...</p>
                </td>
            </tr>

            <!-- Results Loop -->
            <template
              v-if="contractors.length > 0"
              v-for="(contractor, index) in displayedContractors"
              :key="contractor.id || contractor.company_name || index"
            ><tr :class="`contractor result result--${index+1} ${0 === (index+1) % 2 ? `even` : `odd`}`">
                    <!-- Company Name and Head Office -->
                    <td data-label="Company name and head office location" class="contractor__company-and-location">
                        <!-- Company Website Link -->
                        <div class='table-link-wrapper'>
                          <a v-if="contractor.company_website" class="contractor__company external-app-link" :href="contractor.company_website" target="_blank" @click="onProviderLinkClick(contractor)" :aria-label="decodeHtmlEntities(contractor.company_name) + ' website, opens in a new tab/window.'">
                              {{ contractor.company_name ? decodeHtmlEntities(contractor.company_name) : 'Website' }}
                          </a>
                          <!-- Company Name if No Website -->
                          <span v-else class="contractor__company">
                            {{ contractor.company_name ? decodeHtmlEntities(contractor.company_name) : 'No company name provided' }}
                          </span>
                          <p class='has-icon location' v-if='contractor.head_office_location'>{{ contractor.head_office_location ? contractor.head_office_location : 'Not provided' }}</p>
                        </div>
                    </td>

                    <!-- Company Location -->
                    <!-- <td data-label="Head Office" class="contractor__head-office">
                        <p>{{ contractor.head_office_location ? contractor.head_office_location : 'Not provided' }}</p>
                    </td> -->

                    <!-- Contact Email and Phone -->
                    <td data-label="Company email and phone" class="contractor__email-and-phone">
                        <div class='clip-text'>
                          <div class='table-link-wrapper'>
                              <!-- Email Link -->
                              <a v-if="contractor.email" class="contractor__email ellipsis" :href="'mailto:' + contractor.email" @click.prevent="onEmailPhoneClick(contractor, 'email')"><span v-if="false" v-html="insertBreakableChar(contractor.email)"></span>{{ contractor.email }}</a>
                              <p class="contractor__email" v-else>No email provided</p>
                            </div>
                            <div class='table-link-wrapper'>
                             <!-- Phone Link -->
                              <a v-if="contractor.phone" class="contractor__telephone" :href="'tel:+1' + contractor.phone.replace(/-/g, '')" @click.prevent="onEmailPhoneClick(contractor, 'phone')">{{ contractor.phone }}</a>
                              <p class="contractor__telephone" v-else>No phone number provided</p>
                            </div>
                        </div>
                    </td>

                    <!-- Business Types -->
                    <td data-label="Upgrade type(s)" class="contractor__upgrade-types">
                        <ul v-if="getVisibleContractorTypeLabels(contractor).length">
                            <li v-for="typeLabel in getVisibleContractorTypeLabels(contractor)" :key="typeLabel">{{ typeLabel }}</li>
                        </ul>
                    </td>

                    <!-- Program Designations -->
                    <td data-label="Qualified program(s)" class="contractor__program-designations">
                        <ul v-if="getVisibleProgramDesignations(contractor).length">
                          <li v-for="d in getVisibleProgramDesignations(contractor)"
                              :key="d?.id || d?.name" :class='d.slug' class='has-icon is-uppercase' :aria-label="d.name + ' qualified'">
                            {{ d.slug }}
                          </li>
                        </ul>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>
  </div>
  <div  v-if="(displayedContractors.length && filteredContractors.length > displayedContractors.length) || (filteredContractors.length !== 0 && 1 !== totalPages)" class="contractorsFilterControls filter-container filter-container--bottom">
      <!-- Load more Controls -->
      <div v-if="displayMode === 'loadMore' && remainingCount > 0" class="control load-more">
        <button type="button" @click="loadMore" ref="loadMoreBtn">
          Load {{ nextLoadCount }} more contractor{{ nextLoadCount === 1 ? '' : 's' }}
        </button>

        <p class="totals">
          Showing {{ displayedContractors.length }} of {{ filteredContractors.length }}
        </p>
      </div>

    
      <!-- Lower Pagination Controls -->
    <div v-if="false && filteredContractors.length !== 0 && 1 !== totalPages" class="contractorsFilterPagination control pagination pagination--bottom">
            <!-- Previous Page Button -->
            <button class="prev-page" @click.prevent="prevPage" :disabled="currentPage === 1" tabindex="0" type="button">Previous Page</button>
            <!-- Current Page & Totals -->
            <span class="pages">Page <span class="numValue current-page">{{ currentPage }}</span> of <span class="numValue total-pages">{{ totalPages }}</span></span>
            <!-- Next Page Button -->
            <button class="next-page" @click.prevent="nextPage" :disabled="currentPage === totalPages" tabindex="0" type="button">Next Page</button>
            <button class="go-to-top" tabindex="0" type="button" :disabled="filteredContractors.length === 0" @click="scrollToElementID('contractorsResults', '11rem')">Go to top of results</button>
        </div>
  </div>
</template>

<script setup>
  /**
 * Vue Composition API imports for reactive data and lifecycle hooks.
 */
  import {
  ref,
  onBeforeUnmount,
  onMounted,
  computed,
  nextTick,
  watch
} from 'vue'
import { decodeHtmlEntities, shuffleArray } from '../shared-functions.js'
import { trackProviderFilterChange, trackProviderClick } from '../analytics-schemas.js'
import { localAnalyticsReady } from '../standalone-snowplow.js'

/* -----------------------------------------------------------------------------
 * Small utilities
 * -------------------------------------------------------------------------- */

/**
 * Debounce a function so it runs only after a delay.
 * @template {(...args: any[]) => any} T
 * @param {T} fn
 * @param {number} [delay=500]
 * @returns {(...args: Parameters<T>) => void}
 */
function debounce(fn, delay = 500) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

const MOBILE_HINT_EMPTY = 'Please type to find your community'
const MOBILE_HINT_MORE  = 'Continue typing to see more results'

/**
 * Normalize a string for case-insensitive comparisons.
 * (HTML-decoded, trimmed, lowercased)
 * @param {string} [s]
 * @returns {string}
 */
const normalize = (s = '') => decodeHtmlEntities(String(s)).trim().toLowerCase()

/**
 * Precompute a normalized lookup for a list of strings.
 * @param {string[]} list
 * @returns {{ raw: string, norm: string }[]}
 */
const toNormalizedList = (list = []) =>
  list
    .filter(Boolean)
    .map(raw => ({ raw, norm: normalize(raw) }))

/**
 * Fuzzy include (uses pre-normalized haystack).
 * @param {string} haystackNorm
 * @param {string} needleNorm
 * @returns {boolean}
 */
const includesFuzzyNorm = (haystackNorm, needleNorm) => {
  if (!needleNorm) return true
  return (haystackNorm || '').includes(needleNorm)
}

/**
 * Finds the closest matching location name from known locations.
 * Returns at most 10 candidates when ambiguous.
 *
 * IMPORTANT: expects pre-normalized location list for speed.
 *
 * @param {string} raw
 * @param {{raw:string,norm:string}[]} normalizedLocations
 * @returns {{ match: string|null, reason: string, candidates?: string[] }}
 */
function findClosestLocation(raw, normalizedLocations) {
  const q = normalize(raw)

  // Ignore hint options if they ever get selected/copied into the input
  if (q === normalize(MOBILE_HINT_EMPTY) || q === normalize(MOBILE_HINT_MORE)) {
    return { match: 'all', reason: 'empty' }
  }

  if (!q) return { match: 'all', reason: 'empty' }
  if (q === 'all' || q === 'all locations') return { match: 'all', reason: 'all' }

  const list = normalizedLocations || []

  // 1) exact
  const exact = list.find(x => x.norm === q)
  if (exact) return { match: exact.raw, reason: 'exact' }

  // 2) startsWith (up to 10)
  const starts = []
  for (const x of list) {
    if (x.norm.startsWith(q)) {
      starts.push(x.raw)
      if (starts.length >= 10) break
    }
  }
  if (starts.length === 1) return { match: starts[0], reason: 'startsWith' }
  if (starts.length > 1) return { match: null, reason: 'ambiguous_starts', candidates: starts }

  // 3) includes (rank by earlier match, then shorter string)
  const includes = []
  for (const x of list) {
    const idx = x.norm.indexOf(q)
    if (idx >= 0) includes.push({ raw: x.raw, idx })
  }

  includes.sort((a, b) => (a.idx - b.idx) || (a.raw.length - b.raw.length) || a.raw.localeCompare(b.raw))
  const top = includes.slice(0, 10).map(x => x.raw)

  if (top.length === 1) return { match: top[0], reason: 'includes' }
  if (top.length > 1) return { match: null, reason: 'ambiguous_includes', candidates: top }

  return { match: null, reason: 'none' }
}

/* -----------------------------------------------------------------------------
 * Core state
 * -------------------------------------------------------------------------- */

const loadMoreBtn = ref(null)
const resultsTbody = ref(null)

const contractors = ref([])
const shuffledContractors = ref([])

const isVisible = ref(true)
const showLoadingMessage = ref(true)
const isLoading = ref(false)

const nameQuery = ref('')

const defaultSelectedUpgradeType = ref('all')
const selectedUpgradeType = ref('all')

const defaultSelectedProgram = ref('all')
const selectedProgram = ref('all')

const defaultSelectedLocation = ref('all')
const selectedLocation = ref('all')

const activeClass = ref('is-active')
const updatingClass = ref('is-updating')

/** Results display mode. */
const displayMode = ref('loadMore') // 'paginate' | 'loadMore'
const pageSize = ref(30)
const visibleCount = ref(pageSize.value)
const currentPage = ref(1)

const oldPaginatedContractorsCount = ref(0)
const oldFilteredContractorsCount = ref(0)

/* -----------------------------------------------------------------------------
 * Mobile-optimized location input
 * -------------------------------------------------------------------------- */

const isMobile = ref(false)
onMounted(() => {
  isMobile.value = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
})

const locationInputValue = ref('')     // committed display value
const locationInputDisplay = ref('')   // mobile typing buffer

const isLocationFocused = ref(false)
const locationTouched = ref(false)
const locationError = ref('')

watch(locationInputValue, v => {
  if (isMobile.value) locationInputDisplay.value = v || ''
})

const locationInputProxy = computed({
  get() {
    return isMobile.value ? locationInputDisplay.value : locationInputValue.value
  },
  set(val) {
    if (isMobile.value) locationInputDisplay.value = val
    else locationInputValue.value = val
  }
})

function handleLocationFocus() {
  isLocationFocused.value = true
  if (isMobile.value) {
    setTimeout(() => {
      document.querySelector('#contractorLocation')?.focus()
    }, 300)
  }
}

const commitLocation = (trigger = 'change') => {
  const el = document.querySelector('#contractorLocation')

  if (!isMobile.value && (trigger === 'enter' || trigger === 'change')) {
    el?.focus()
  }

  locationTouched.value = true

  // mobile: re-read DOM value on blur to capture datalist selection reliably
  if (isMobile.value && trigger === 'blur') {
    if (el) locationInputDisplay.value = el.value
  }

  const raw = (isMobile.value ? locationInputDisplay.value : locationInputValue.value) || ''
  const normalizedList = normalizedLocations.value
  const { match, reason, candidates = [] } = findClosestLocation(raw, normalizedList)

  // empty => reset
  if (!raw.trim()) {
    selectedLocation.value = 'all'
    locationInputValue.value = ''
    locationInputDisplay.value = ''
    locationError.value = ''
    isLocationFocused.value = false
    return
  }

  if (match) {
    selectedLocation.value = match
    locationError.value = ''
    locationInputValue.value = match === 'all' ? '' : match
    locationInputDisplay.value = match === 'all' ? '' : match
  } else {
    selectedLocation.value = 'all'
    const example = candidates.slice(0, 3).join(', ')
    locationError.value =
      reason.startsWith('ambiguous')
        ? `That matches multiple service regions. Please choose one from the list (e.g., ${example}${candidates.length > 3 ? '…' : ''}).`
        : 'That service region was not recognized. Please the community you live in or are closest to from the available options.'
  }

  isLocationFocused.value = false
}

const locationQuery = computed(() => {
  const raw = isMobile.value ? locationInputDisplay.value : locationInputValue.value
  return normalize(raw || '')
})

const locationQueryIsEmpty = computed(() => !locationQuery.value)
const hasValidLocationSelection = computed(() =>
  selectedLocation.value !== 'all' &&
  !locationError.value &&
  locations.value.includes(selectedLocation.value)
)

function clearLocationSelection() {
  selectedLocation.value = 'all'
  locationInputValue.value = ''
  locationInputDisplay.value = ''
  locationTouched.value = false
  locationError.value = ''
  isLocationFocused.value = true

  nextTick(() => {
    document.querySelector('#contractorLocation')?.focus()
  })
}

/* -----------------------------------------------------------------------------
 * API + caching
 * -------------------------------------------------------------------------- */

const publicDomain = ref('https://betterhomes.gov.bc.ca')
const contractorsAPI = `${window.site?.domain ? window.site.domain : publicDomain.value}/wp-json/custom/v1/contractors`

const CONDO_HEAT_PUMP_NAME = 'Heat pumps for condos and apartments'
const CONDO_HEAT_PUMP_SLUG = 'heat-pumps-for-condos-and-apartments'
const CONDO_PROGRAM_SUFFIX_BY_SLUG = {
  esp: 'ESP only',
  hrr: 'HRR only'
}

const itemsToClearFromSessionStorage = ref([
  'faqsData',
  'faqsTimestamp',
  'pqeasData',
  'pqeasTimestamp',
  'rebatesData',
  'rebatesTimestamp'
])

const isQuotaExceededError = (error) => {
  if (!error) return false
  return (
    error.code === 22 ||
    error.code === 1014 ||
    error.name === 'QuotaExceededError' ||
    error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
  )
}

const isDataValid = (timestamp) => {
  const timeElapsed = Date.now() - parseInt(String(timestamp), 10)
  return (timeElapsed / (1000 * 60 * 60)) < 24
}

const fetchData = async () => {
  try {
    isLoading.value = true
    showLoadingMessage.value = true

    // Try sessionStorage then localStorage
    const readCache = (store) => {
      const data = store.getItem('contractorsData')
      const ts = store.getItem('contractorsTimestamp')
      if (data && ts && isDataValid(ts)) {
        try { return JSON.parse(data) } catch { return null }
      }
      return null
    }

    let cached = readCache(sessionStorage)
    if (!cached && !isShareSourceUrl()) cached = readCache(localStorage)

    if (cached) {
      contractors.value = cached
      shuffledContractors.value = shuffleArray([...cached])
      showLoadingMessage.value = false
      isLoading.value = false
      return
    }

    const response = await fetch(contractorsAPI, { cache: 'no-store' })
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
    const json = await response.json()

    // reduce storage pressure
    try {
      itemsToClearFromSessionStorage.value.forEach((item) => sessionStorage.removeItem(item))
      sessionStorage.clear()
    } catch (clearError) {
      console.warn('Error clearing sessionStorage:', clearError)
    }

    const writeCache = (store) => {
      store.setItem('contractorsData', JSON.stringify(json))
      store.setItem('contractorsTimestamp', Date.now().toString())
    }

    try {
      writeCache(sessionStorage)
    } catch (storageError) {
      if (isQuotaExceededError(storageError)) {
        console.warn('SessionStorage quota exceeded. Falling back to localStorage.')
        if (!isShareSourceUrl()) {
          try { writeCache(localStorage) } catch (lsError) {
            console.error('Error setting data in localStorage:', lsError)
          }
        }
      } else {
        console.error('Error setting data in sessionStorage:', storageError)
        throw storageError
      }
    }

    contractors.value = json
    shuffledContractors.value = shuffleArray([...json])
    showLoadingMessage.value = false
    isLoading.value = false
  } catch (error) {
    console.error('Error fetching contractors data:', error)
    throw error
  }
}

/* -----------------------------------------------------------------------------
 * Derived option lists (now single-pass, more defensive)
 * -------------------------------------------------------------------------- */

function collectUniqueNames(array, key) {
  const unique = new Set()
  for (const c of array) {
    const items = c?.[key]
    if (!items) continue

    // You currently treat "string" as if it has .name; keep behaviour safe.
    if (Array.isArray(items)) {
      for (const it of items) if (it?.name) unique.add(it.name)
    } else if (items?.name) {
      unique.add(items.name)
    }
  }
  return Array.from(unique).sort((a, b) => a.localeCompare(b))
}

const normalizeSlug = (value = '') => String(value || '').trim().toLowerCase()

const isCondoHeatPumpParentTerm = (term) => {
  const slug = normalizeSlug(term?.slug)
  const name = String(term?.name || '').trim()
  return slug === CONDO_HEAT_PUMP_SLUG || name === CONDO_HEAT_PUMP_NAME
}

const getVisibleProgramDesignations = (contractor) => {
  const designations = Array.isArray(contractor?.program_designations)
    ? contractor.program_designations.filter(Boolean)
    : []

  if (selectedProgram.value !== 'all') {
    return designations.filter((designation) => designation?.name === selectedProgram.value)
  }

  return designations
}

const getVisibleContractorTypeLabels = (contractor) => {
  const rawTypes = Array.isArray(contractor?.types) ? contractor.types.filter(Boolean) : []
  const visibleProgramSlugs = new Set(
    getVisibleProgramDesignations(contractor)
      .map((designation) => normalizeSlug(designation?.slug))
      .filter(Boolean)
  )

  const condoParent = rawTypes.find(isCondoHeatPumpParentTerm) || null
  const condoParentId = Number(condoParent?.term_id || condoParent?.id || 0)
  const condoProgramChildren = rawTypes.filter((term) => {
    const slug = normalizeSlug(term?.slug)
    if (!Object.prototype.hasOwnProperty.call(CONDO_PROGRAM_SUFFIX_BY_SLUG, slug)) return false

    const termParentId = Number(term?.parent || 0)
    if (condoParentId > 0) return termParentId === condoParentId
    return termParentId > 0
  })
  const condoProgramChildSlugs = new Set(
    condoProgramChildren.map((term) => normalizeSlug(term?.slug)).filter(Boolean)
  )
  const hasBothCondoProgramChildren =
    condoProgramChildSlugs.has('esp') && condoProgramChildSlugs.has('hrr')

  const output = []
  const seen = new Set()
  const addLabel = (label) => {
    if (!label || seen.has(label)) return
    seen.add(label)
    output.push(label)
  }

  for (const term of rawTypes) {
    if (isCondoHeatPumpParentTerm(term)) continue

    const slug = normalizeSlug(term?.slug)
    if (Object.prototype.hasOwnProperty.call(CONDO_PROGRAM_SUFFIX_BY_SLUG, slug)) continue

    addLabel(term?.name)
  }

  if (hasBothCondoProgramChildren) {
    addLabel(CONDO_HEAT_PUMP_NAME)
  } else if (condoProgramChildren.length) {
    for (const term of condoProgramChildren) {
      const slug = normalizeSlug(term?.slug)
      if (!visibleProgramSlugs.has(slug)) continue
      addLabel(
        selectedProgram.value === 'all'
          ? `${CONDO_HEAT_PUMP_NAME} (${CONDO_PROGRAM_SUFFIX_BY_SLUG[slug]})`
          : CONDO_HEAT_PUMP_NAME
      )
    }
  } else if (condoParent) {
    addLabel(CONDO_HEAT_PUMP_NAME)
  }

  return output
}

const getSelectableContractorTypeLabels = (contractor) => {
  const selectable = new Set()

  for (const typeLabel of getVisibleContractorTypeLabels(contractor)) {
    if (typeLabel.startsWith(`${CONDO_HEAT_PUMP_NAME} (`)) {
      selectable.add(CONDO_HEAT_PUMP_NAME)
      continue
    }

    selectable.add(typeLabel)
  }

  return Array.from(selectable)
}

const types = computed(() => {
  const unique = new Set()
  for (const contractor of contractors.value) {
    for (const typeLabel of getSelectableContractorTypeLabels(contractor)) {
      unique.add(typeLabel)
    }
  }
  return Array.from(unique).sort((a, b) => a.localeCompare(b))
})
const programs = computed(() => collectUniqueNames(contractors.value, 'program_designations'))
const locations = computed(() => collectUniqueNames(contractors.value, 'locations'))

/**
 * Normalized location list, computed once per locations change,
 * used for matching & mobile suggestion generation.
 */
const normalizedLocations = computed(() => toNormalizedList(locations.value))

const resolvePreferredLocation = () => {
  const preferred = readPreferredSettings()
  const loc = preferred?.location
  if (!loc) return null

  const candidates = [loc.name, loc.slug, loc.region, loc.region_slug]
    .map((value) => (value ? String(value).trim() : ''))
    .filter(Boolean)

  if (!candidates.length) return null

  const list = normalizedLocations.value
  for (const candidate of candidates) {
    const { match } = findClosestLocation(candidate, list)
    if (match && match !== 'all') return match
  }

  return null
}

/* -----------------------------------------------------------------------------
 * Mobile proxy location datalist options (no repeated normalize in loops)
 * -------------------------------------------------------------------------- */

const mobileLocationOptions = computed(() => {
  const q = locationQuery.value
  if (!q) return []

  const list = normalizedLocations.value
  const starts = []
  const includes = []

  for (const x of list) {
    if (x.norm.startsWith(q)) {
      starts.push(x.raw)
      if (starts.length >= 10) return starts
    } else if (x.norm.includes(q)) {
      includes.push(x.raw)
    }
  }

  // Fill with includes up to 10
  for (const raw of includes) {
    starts.push(raw)
    if (starts.length >= 10) break
  }

  return starts
})

/* -----------------------------------------------------------------------------
 * Filtering + pagination/load more (single-pass filter with early exits)
 * -------------------------------------------------------------------------- */

/**
 * Precompute "row indexes" once per fetch/shuffle to avoid decoding
 * and repeatedly walking nested arrays in computed filters.
 */
const contractorIndex = computed(() => {
  const arr = shuffledContractors.value || []
  return arr.map((c) => {
    const companyNorm = normalize(c?.company_name || '')
    const typeNames = new Set(getSelectableContractorTypeLabels(c))
    const locNames  = new Set((c?.locations || []).map(l => l?.name).filter(Boolean))
    const progNames = new Set((c?.program_designations || []).map(p => p?.name).filter(Boolean))

    return { c, companyNorm, typeNames, locNames, progNames }
  })
})

const filteredContractors = computed(() => {
  const typeSel = selectedUpgradeType.value
  const locSel  = selectedLocation.value
  const progSel = selectedProgram.value

  const nameNeedleNorm = normalize(nameQuery.value || '')

  const out = []
  for (const row of contractorIndex.value) {
    // Type
    if (typeSel !== 'all' && !row.typeNames.has(typeSel)) continue
    // Name (fuzzy)
    if (nameNeedleNorm && !includesFuzzyNorm(row.companyNorm, nameNeedleNorm)) continue
    // Location
    if (locSel !== 'all' && !row.locNames.has(locSel)) continue
    // Program
    if (progSel !== 'all' && !row.progNames.has(progSel)) continue

    out.push(row.c)
  }
  return out
})

const totalPages = computed(() => {
  if (displayMode.value !== 'paginate') return 1
  const total = filteredContractors.value.length
  return total > 0 ? Math.ceil(total / pageSize.value) : 1
})

const displayedContractors = computed(() => {
  const list = filteredContractors.value
  if (displayMode.value === 'loadMore') {
    return list.slice(0, visibleCount.value)
  }
  const start = (currentPage.value - 1) * pageSize.value
  return list.slice(start, start + pageSize.value)
})

const remainingCount = computed(() =>
  Math.max(0, filteredContractors.value.length - displayedContractors.value.length)
)

const nextLoadCount = computed(() =>
  Math.min(pageSize.value, remainingCount.value)
)

const focusFirstNewLink = async (startIndex) => {
  await nextTick()
  const tbody = resultsTbody.value
  if (!tbody) return

  const rows = tbody.querySelectorAll('tr.contractor')
  for (let i = startIndex; i < rows.length; i++) {
    const link = rows[i].querySelector('a[href]:not([tabindex="-1"])')
    if (link) {
      link.focus({ preventScroll: true })
      link.scrollIntoView({ block: 'center' })
      return
    }
  }
  loadMoreBtn.value?.focus?.()
}

const loadMore = async () => {
  const startIndex = displayedContractors.value.length
  visibleCount.value = Math.min(
    visibleCount.value + pageSize.value,
    filteredContractors.value.length
  )
  await focusFirstNewLink(startIndex)
}

const prevPage = () => (currentPage.value > 1 ? currentPage.value-- : null)
const nextPage = () => (currentPage.value < totalPages.value ? currentPage.value++ : null)

/* -----------------------------------------------------------------------------
 * URL assembly + copy link
 * -------------------------------------------------------------------------- */

const assembleUrl = ({ includeSource = false } = {}) => {
  const baseUrl = window.location.origin + window.location.pathname
  const url = new URL(baseUrl)

  url.searchParams.set('tool', 'contractors')
  if (includeSource) {
    url.searchParams.set('source', 'share')
  }

  if (nameQuery.value?.trim()) {
    url.searchParams.set('company', nameQuery.value.trim())
  }
  if (selectedUpgradeType.value && selectedUpgradeType.value !== 'all') {
    url.searchParams.set('type', selectedUpgradeType.value)
  }
  if (selectedProgram.value && selectedProgram.value !== 'all') {
    const programParam = PROGRAM_TO_SHORTHAND[selectedProgram.value] || selectedProgram.value
    url.searchParams.set('program', programParam)
  }
  if (selectedLocation.value && selectedLocation.value !== 'all') {
    url.searchParams.set('region', selectedLocation.value)
  }

  return url.toString()
}


function handleLinkCopiedMessageContent(event, target = '.filter-container', msg) {
  const root = event?.target?.closest?.(target) || document.querySelector(target) || document.body
  const el = root?.querySelector?.('.copy-message')
  if (!el) return

  el.textContent = msg
  el.classList.remove('isFadedOut')

  setTimeout(() => el.classList.add('isFadedOut'), 1000)
  setTimeout(() => {
    if (el.classList.contains('isFadedOut')) el.textContent = ''
  }, 1600)
}

async function copyTextToClipboard(text) {
  // Modern async clipboard (works in secure contexts + most modern browsers)
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }

  // Fallback for Safari / older browsers
  const ta = document.createElement('textarea')
  ta.value = text
  ta.setAttribute('readonly', '')
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  ta.style.top = '0'
  document.body.appendChild(ta)

  ta.select()
  ta.setSelectionRange(0, ta.value.length)

  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  } finally {
    document.body.removeChild(ta)
  }
  return ok
}

const addLinkToClipboard = async (event) => {
  const url = assembleUrl({ includeSource: true })

  try {
    const ok = await copyTextToClipboard(url)
    handleLinkCopiedMessageContent(
      event,
      '.filter-container',
      ok ? 'Shareable link copied to clipboard!' : 'Copy failed'
    )
    if (!ok) console.warn('Clipboard fallback failed.')
  } catch (err) {
    console.error('Failed to copy URL:', err)
    handleLinkCopiedMessageContent(event, '.filter-container', 'Copy failed')
  }
}

const canCopyLink = computed(() => {
  return Boolean(
    nameQuery.value?.trim() ||
    (selectedUpgradeType.value && selectedUpgradeType.value !== 'all') ||
    (selectedProgram.value && selectedProgram.value !== 'all') ||
    (selectedLocation.value && selectedLocation.value !== 'all')
  )
})

const isShareSourceUrl = () => new URLSearchParams(window.location.search).get('source') === 'share'

const normalizeProgramParam = (v = '') =>
  decodeHtmlEntities(String(v)).trim().toLowerCase()

const PROGRAM_SHORTHANDS = {
  esp: 'Energy Savings Program (ESP)',
  hrr: 'Home Renovation Rebate (HRR)'
}

const PROGRAM_TO_SHORTHAND = {
  'Energy Savings Program (ESP)': 'ESP',
  'Home Renovation Rebate (HRR)': 'HRR'
}

const PREFERRED_SETTINGS_KEY = 'preferredSettings'

function readPreferredSettings() {
  if (isShareSourceUrl()) return null
  try {
    const raw = localStorage.getItem(PREFERRED_SETTINGS_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}



/* -----------------------------------------------------------------------------
 * UI helpers (existing behaviour)
 * -------------------------------------------------------------------------- */

const insertBreakableChar = (email) => String(email || '').replace(/@/g, '&#8203;@').replace(/\./g, '&#8203;.')

const resetSelectsActiveState = () => {
  const activeSelects = document.querySelectorAll('#contractorFilterApp .custom-select.is-active')
  activeSelects.forEach((item) => item.classList.remove('is-active'))
}

const selectIsActive = (event) => {
  if (event.type !== 'click') event.target.parentNode.classList.remove(activeClass.value)
  else event.target.parentNode.classList.toggle(activeClass.value)
}

const handleUpdatingAnimationClass = (elementCssPath) => {
  const elements = document.querySelectorAll(elementCssPath)
  elements.forEach((element) => {
    element.classList.add(updatingClass.value)
    setTimeout(() => element.classList.remove(updatingClass.value), 125)
  })
}

/* -----------------------------------------------------------------------------
 * Analytics hooks
 * -------------------------------------------------------------------------- */

const onProviderLinkClick = (contractor) => {
  trackProviderClick({
    filterName: 'contractor',
    upgradeType: selectedUpgradeType.value,
    program: selectedProgram.value,
    location: selectedLocation.value,
    companyName: contractor.company_name || '',
    destination: contractor.company_website || ''
  })
}

const onEmailPhoneClick = (contractor, linkType) => {
  let label = ''
  let destination = ''

  if (linkType === 'email') {
    label = contractor.email ? `Email: ${contractor.email}` : 'Email link'
    destination = `mailto:${contractor.email}`
  } else {
    label = contractor.phone ? `Phone: ${contractor.phone}` : 'Phone link'
    destination = `tel:+1${contractor.phone?.replace(/-/g, '')}`
  }

  trackProviderClick({
    filterName: 'contractor',
    upgradeType: selectedUpgradeType.value,
    program: selectedProgram.value,
    location: selectedLocation.value,
    companyName: contractor.company_name || '',
    destination,
    label
  })
}

/* -----------------------------------------------------------------------------
 * Clear filters
 * -------------------------------------------------------------------------- */

const clearFilters = () => {
  resetSelectsActiveState()

  nameQuery.value = ''
  selectedUpgradeType.value = defaultSelectedUpgradeType.value
  selectedProgram.value = defaultSelectedProgram.value

  selectedLocation.value = 'all'
  locationInputValue.value = ''
  locationInputDisplay.value = ''
  locationTouched.value = false
  locationError.value = ''
  isLocationFocused.value = false

  displayMode.value = 'loadMore'
  currentPage.value = 1
  visibleCount.value = pageSize.value

  window.history.replaceState({}, '', assembleUrl())

  if (currentPage.value !== 1) handleUpdatingAnimationClass('.control.pagination .pages')
  currentPage.value = 1
}

/* -----------------------------------------------------------------------------
 * Watchers (paging resets + analytics + UI animation)
 * -------------------------------------------------------------------------- */

watch(selectedUpgradeType, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    trackProviderFilterChange({
      filterName: 'contractor',
      upgradeType: newVal,
      program: selectedProgram.value,
      location: selectedLocation.value,
      label: `Upgrade Type changed to: ${newVal}`
    })
  }
})

watch(selectedProgram, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    trackProviderFilterChange({
      filterName: 'contractor',
      upgradeType: selectedUpgradeType.value,
      program: newVal,
      location: selectedLocation.value,
      label: `Program changed to: ${newVal}`
    })
  }
})

watch(selectedLocation, (newVal, oldVal) => {
  if (newVal === oldVal) return
  if (isLocationFocused.value) return

  locationInputValue.value = newVal === 'all' ? '' : newVal

  if (newVal === 'all' || locations.value.includes(newVal)) {
    locationError.value = ''
    locationTouched.value = false
  }

  trackProviderFilterChange({
    filterName: 'contractor',
    upgradeType: selectedUpgradeType.value,
    program: selectedProgram.value,
    location: newVal,
    label: `Location changed to: ${newVal}`
  })
})

watch([selectedUpgradeType, selectedProgram, selectedLocation, nameQuery], () => {
  currentPage.value = 1
  visibleCount.value = pageSize.value
})

watch(displayMode, () => {
  currentPage.value = 1
  visibleCount.value = pageSize.value
})

watch(totalPages, () => handleUpdatingAnimationClass('.control.pagination .total-pages'))
watch(currentPage, () => handleUpdatingAnimationClass('.control.pagination .current-page'))

watch(displayedContractors, () => {
  if (oldPaginatedContractorsCount.value !== displayedContractors.value.length) {
    oldPaginatedContractorsCount.value = displayedContractors.value.length
    handleUpdatingAnimationClass('.control.pagination .paginated-contractors')
  }
})

watch(filteredContractors, () => {
  if (oldFilteredContractorsCount.value !== filteredContractors.value.length) {
    oldFilteredContractorsCount.value = filteredContractors.value.length
    handleUpdatingAnimationClass('.control.pagination .filtered-contractors')
    handleUpdatingAnimationClass('.counter__value')
  }
})

/* -----------------------------------------------------------------------------
 * Initialization: fetch + query-string hydration
 * -------------------------------------------------------------------------- */

watch(() => window.site?.domain, (newVal) => {
  if (newVal) fetchData()
})

onMounted(() => {
  localAnalyticsReady()

  const appElement = document.getElementById('contractorFilterApp')
  const showControls = appElement?.getAttribute('data-show-controls') === 'false'
  isVisible.value = showControls

  fetchData()
  showLoadingMessage.value = true

  const urlParams = new URLSearchParams(window.location.search)
  const showParam = urlParams.get('show')
  if (showParam === 'off') isVisible.value = false
})

const didHydrateFromUrl = ref(false)

function hydrateFromUrl() {
  const urlParams = new URLSearchParams(window.location.search)
  const showParam = urlParams.get('show')

  // Only guard tool param if present
  const toolParam = urlParams.get('tool')
  if (toolParam !== null && toolParam !== 'contractors') {
    console.warn('Tool parameter does not match "contractors". Initialization skipped.')
    return
  }

  if (showParam === 'off') isVisible.value = false

  // IMPORTANT: URLSearchParams.get() is already decoded.
  const companyName = urlParams.get('company')
  const serviceRegion = urlParams.get('region')
  const upgradeType = urlParams.get('type')
  const rebateProgram = urlParams.get('program')

  if (companyName?.trim()) {
    nameQuery.value = companyName.trim()
  } else {
    nameQuery.value = ''
  }

  if (serviceRegion) {
    if (locations.value.includes(serviceRegion)) {
      selectedLocation.value = serviceRegion
      locationInputValue.value = serviceRegion
      locationInputDisplay.value = serviceRegion
      locationError.value = ''
      locationTouched.value = false
    } else {
      selectedLocation.value = 'all'
      // keep what user had in link visible in the input so they can correct it
      locationInputValue.value = serviceRegion
      locationInputDisplay.value = serviceRegion
      locationError.value =
        'That service region was not recognized. Please choose one from the list of available options.'
      locationTouched.value = true
    }
  } else if (!isShareSourceUrl()) {
    const preferredLocation = resolvePreferredLocation()
    if (preferredLocation) {
      selectedLocation.value = preferredLocation
      locationInputValue.value = preferredLocation
      locationInputDisplay.value = preferredLocation
      locationError.value = ''
      locationTouched.value = false
    }
  } else {
    selectedLocation.value = 'all'
    locationInputValue.value = ''
    locationInputDisplay.value = ''
    locationError.value = ''
    locationTouched.value = false
  }

  if (upgradeType) {
    if (types.value.includes(upgradeType)) selectedUpgradeType.value = upgradeType
    else console.warn(`Invalid upgrade type: ${upgradeType}`)
  }

  if (rebateProgram) {
    const raw = String(rebateProgram).trim()
    const key = normalizeProgramParam(raw)

    // Expand shorthand if applicable
    const expanded = PROGRAM_SHORTHANDS[key] || raw

    // Accept expanded OR raw (defensive)
    const match =
      programs.value.includes(expanded) ? expanded :
      programs.value.includes(raw) ? raw :
      null

    if (match) {
      selectedProgram.value = match
    } else {
      console.warn(`Invalid rebate program: ${raw}`)
    }
  }


  showLoadingMessage.value = false
}

watch(
  [types, programs, locations],
  ([t, p, l]) => {
    if (didHydrateFromUrl.value) return
    if (!t.length || !p.length || !l.length) return

    didHydrateFromUrl.value = true
    hydrateFromUrl()
  },
  { immediate: true }
)

const syncUrlFromState = debounce(() => {
  window.history.replaceState({}, '', assembleUrl())
}, 250)

// Keep URL synced for all filters INCLUDING name
watch([selectedUpgradeType, selectedProgram, selectedLocation, nameQuery], () => {
  if (!didHydrateFromUrl.value) return
  syncUrlFromState()
})


onMounted(() => {
  const onPopState = () => {
    // Re-hydrate if user navigates browser history to a different query string
    if (types.value.length && programs.value.length && locations.value.length) {
      hydrateFromUrl()
    }
  }
  window.addEventListener('popstate', onPopState)
  onBeforeUnmount(() => window.removeEventListener('popstate', onPopState))
})

/* -----------------------------------------------------------------------------
 * Global click handlers — keep ONE.
 * -------------------------------------------------------------------------- */
onMounted(() => {
  const onWindowClick = (event) => {
    if (!event.target.closest('.custom-select.is-active')) resetSelectsActiveState()
  }
  window.addEventListener('click', onWindowClick)
  onBeforeUnmount(() => window.removeEventListener('click', onWindowClick))
})
</script>


<style lang='scss' scoped>
// See bcgov-plugin-cleanbcdx/styles/public/betterhomes/_vue-apps.scss
#contractorFilterApp {}
</style>
