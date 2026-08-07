<template>
    <div class="approved-sellers eligible-commercial-vehicles">
        <p class="screen-reader-text" aria-live="polite">{{ statusMessage }}</p>

        <p
            v-if="!isLoading && !errorMessage && lastUpdatedLabel"
            class="approved-sellers__last-updated"
        >
            Last updated on {{ lastUpdatedLabel }}
        </p>

        <div
            v-if="!isLoading && !errorMessage"
            class="approved-sellers__controls eligible-commercial-vehicles__controls"
        >
            <div class="approved-sellers__field eligible-commercial-vehicles__field">
                <label :for="`${controlIdBase}-search`">Filter approved sellers</label>
                <input
                    :id="`${controlIdBase}-search`"
                    v-model.trim="searchTerm"
                    class="approved-sellers__input eligible-commercial-vehicles__input"
                    type="search"
                    placeholder="Filter by company name, location, address, email, phone, or website"
                />
            </div>

            <div class="approved-sellers__actions eligible-commercial-vehicles__actions">
                <p class="approved-sellers__summary eligible-commercial-vehicles__summary">
                    {{ resultSummary }}
                </p>
                <button
                    v-if="hasActiveFilter"
                    type="button"
                    class="approved-sellers__clear-button eligible-commercial-vehicles__clear-button"
                    @click="resetFilter"
                >
                    Clear filter
                </button>
            </div>
        </div>

        <p v-if="isLoading" class="approved-sellers__message eligible-commercial-vehicles__message">
            Loading approved sellers...
        </p>
        <p
            v-else-if="errorMessage"
            class="approved-sellers__message eligible-commercial-vehicles__message"
            role="alert"
        >
            {{ errorMessage }}
        </p>
        <template v-else>
            <p v-if="!rows.length" class="approved-sellers__message eligible-commercial-vehicles__message">
                No approved sellers are available.
            </p>

            <template v-else>
                <p
                    v-if="showNoMatchesMessage"
                    class="approved-sellers__message eligible-commercial-vehicles__message"
                >
                <img
                    decoding="async"
                    :src="noResultsImage"
                    alt=""
                    width="32"
                    height="32"
                    style="position: relative; top: 10px"
                    title=""
                />
                    No approved sellers match the current filter. Showing all available sellers below.
                </p>

                <div
                    class="wp-block-group gap-0 approved-sellers__group eligible-commercial-vehicles__group"
                >
                    <h3
                        class="wp-block-heading is-style-default cz5-contrast has-extra-small-font-size approved-sellers__heading eligible-commercial-vehicles__heading"
                    >
                        Approved sellers
                    </h3>

                    <div
                        class="wp-block-group is-layout-flow approved-sellers__table-shell eligible-commercial-vehicles__table-shell"
                    >
                        <figure
                            class="wp-block-table is-style-stripes is-sticky-header has-extra-small-font-size approved-sellers__table-figure"
                        >
                            <table
                                role="table"
                                class="has-fixed-layout approved-sellers__table"
                            >
                                <caption class="screen-reader-text">
                                    Approved sellers
                                </caption>
                                <colgroup>
                                    <col
                                        v-for="column in columns"
                                        :key="column.key"
                                        :style="{ width: column.width }"
                                    />
                                </colgroup>
                                <thead role="rowgroup">
                                    <tr role="row">
                                        <th
                                            v-for="column in columns"
                                            :key="column.key"
                                            class="has-text-align-left"
                                            data-align="left"
                                            :data-column="column.key"
                                            role="columnheader"
                                            :aria-sort="getAriaSort(column.key)"
                                        >
                                            <button
                                                type="button"
                                                class="approved-sellers__sort-button eligible-commercial-vehicles__sort-button"
                                                :aria-label="`Sort by ${column.label}`"
                                                @click="changeSort(column.key)"
                                            >
                                                <span>{{ column.label }}</span>
                                                <span
                                                    class="approved-sellers__sort-indicator eligible-commercial-vehicles__sort-indicator"
                                                    :class="`is-${getSortState(column.key)}`"
                                                    aria-hidden="true"
                                                ></span>
                                            </button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody role="rowgroup">
                                    <tr v-for="row in sortedRows" :key="row.id" role="row">
                                    <td
                                        class="has-text-align-left"
                                        data-align="left"
                                        data-column="operatingOrgName"
                                        role="cell"
                                        :data-label="getCellLabel(columns[0])"
                                    >
                                        <a
                                            v-if="row.websiteHref"
                                            :href="row.websiteHref"
                                            rel="noopener noreferrer"
                                        >
                                            {{ row.operatingOrgName }}
                                        </a>
                                        <span v-else>{{ row.operatingOrgName }}</span>
                                    </td>
                                    <td
                                        class="has-text-align-left"
                                        data-align="left"
                                        data-column="location"
                                        role="cell"
                                        :data-label="getCellLabel(columns[1])"
                                    >
                                        {{ row.location }}
                                    </td>
                                    <td
                                        class="has-text-align-left"
                                        data-align="left"
                                        data-column="streetAddress"
                                        role="cell"
                                        :data-label="getCellLabel(columns[2])"
                                    >
                                        {{ row.streetAddress }}
                                    </td>
                                    <td
                                        class="has-text-align-left"
                                        data-align="left"
                                        data-column="contactDisplay"
                                        role="cell"
                                        :data-label="getCellLabel(columns[3])"
                                    >
                                        <div class="approved-sellers__contact">
                                            <a
                                                v-if="row.emailHref"
                                                :href="row.emailHref"
                                                class="approved-sellers__contact-item approved-sellers__contact-item--email"
                                                :title="row.email"
                                            >
                                                {{ row.email }}
                                            </a>
                                            <span
                                                v-else-if="row.email"
                                                class="approved-sellers__contact-item approved-sellers__contact-item--email"
                                                :title="row.email"
                                            >
                                                {{ row.email }}
                                            </span>
                                            <a
                                                v-if="row.phoneHref"
                                                :href="row.phoneHref"
                                                class="approved-sellers__contact-item approved-sellers__contact-item--phone"
                                            >
                                                {{ row.phoneNumber }}
                                            </a>
                                            <span
                                                v-else-if="row.phoneNumber"
                                                class="approved-sellers__contact-item approved-sellers__contact-item--phone"
                                            >
                                                {{ row.phoneNumber }}
                                            </span>
                                        </div>
                                    </td>
                                    <td
                                        class="has-text-align-left"
                                        data-align="left"
                                        data-column="approvedSinceDisplay"
                                        role="cell"
                                        :data-label="getCellLabel(columns[4])"
                                    >
                                        {{ row.approvedSinceDisplay }}
                                    </td>
                                    </tr>
                                </tbody>
                            </table>
                        </figure>
                    </div>
                </div>
            </template>
        </template>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import noResultsImage from './assets/leaf-icon-01.png';

const props = defineProps({
    endpoint: {
        type: String,
        required: true,
    },
    appId: {
        type: String,
        default: 'approved-sellers-app',
    },
});

const columns = [
    {
        key: 'operatingOrgName',
        label: 'Company name',
        width: '24%',
    },
    {
        key: 'location',
        label: 'Location',
        width: '14%',
    },
    {
        key: 'streetAddress',
        label: 'Street address',
        width: '26%',
    },
    {
        key: 'contactDisplay',
        label: 'Contact',
        width: '22%',
    },
    {
        key: 'approvedSinceDisplay',
        label: 'Approved since',
        width: '14%',
    },
];

const feedCache = new Map();
const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
});
const approvedSinceFormatter = new Intl.DateTimeFormat('en-CA', {
    dateStyle: 'long',
});

const rows = ref([]);
const lastUpdated = ref('');
const isLoading = ref(true);
const errorMessage = ref('');
const searchTerm = ref('');
const sortKey = ref('operatingOrgName');
const sortDirection = ref('asc');

const controlIdBase = computed(() => props.appId || 'approved-sellers-app');
const lastUpdatedLabel = computed(() => {
    const normalizedValue = normalizeTextValue(lastUpdated.value);

    if (!normalizedValue) {
        return '';
    }

    const parsedDate = new Date(normalizedValue);

    if (Number.isNaN(parsedDate.getTime())) {
        return normalizedValue;
    }

    return approvedSinceFormatter.format(parsedDate);
});
const hasActiveFilter = computed(() => '' !== searchTerm.value);

const filteredRows = computed(() => {
    const normalizedSearchTerm = normalizeLookupValue(searchTerm.value);

    if (!normalizedSearchTerm) {
        return rows.value;
    }

    return rows.value.filter((row) =>
        row.searchContent.includes(normalizedSearchTerm)
    );
});

const showNoMatchesMessage = computed(
    () => hasActiveFilter.value && 0 === filteredRows.value.length && rows.value.length > 0
);

const displayRows = computed(() => {
    return showNoMatchesMessage.value ? rows.value : filteredRows.value;
});

const sortedRows = computed(() => {
    return [...displayRows.value].sort((left, right) => {
        const primarySort = compareRows(left, right, sortKey.value);

        if (0 !== primarySort) {
            return 'asc' === sortDirection.value ? primarySort : -primarySort;
        }

        return (
            collator.compare(left.operatingOrgName, right.operatingOrgName) ||
            collator.compare(left.location, right.location)
        );
    });
});

const resultSummary = computed(() => {
    const visibleCount = sortedRows.value.length;
    const totalCount = rows.value.length;

    if (!totalCount) {
        return 'Showing 0 approved sellers.';
    }

    if (showNoMatchesMessage.value) {
        return `Showing all ${totalCount} approved seller${1 === totalCount ? '' : 's'}.`;
    }

    if (hasActiveFilter.value) {
        return `Showing ${visibleCount} of ${totalCount} approved seller${1 === totalCount ? '' : 's'}.`;
    }

    return `Showing ${visibleCount} approved seller${1 === visibleCount ? '' : 's'}.`;
});

const statusMessage = computed(() => {
    if (isLoading.value) {
        return 'Loading approved sellers.';
    }

    if (errorMessage.value) {
        return errorMessage.value;
    }

    return resultSummary.value;
});

function getAriaSort(columnKey) {
    if (sortKey.value !== columnKey) {
        return 'none';
    }

    return 'asc' === sortDirection.value ? 'ascending' : 'descending';
}

function getSortState(columnKey) {
    if (sortKey.value !== columnKey) {
        return 'none';
    }

    return 'asc' === sortDirection.value ? 'asc' : 'desc';
}

function getCellLabel(column) {
    return `${column.label}: `;
}

function changeSort(nextSortKey) {
    if (sortKey.value === nextSortKey) {
        sortDirection.value = 'asc' === sortDirection.value ? 'desc' : 'asc';
        return;
    }

    sortKey.value = nextSortKey;
    sortDirection.value = 'asc';
}

function resetFilter() {
    searchTerm.value = '';
}

function compareRows(left, right, activeSortKey) {
    if ('approvedSinceDisplay' === activeSortKey) {
        return (
            left.approvedSinceSortValue - right.approvedSinceSortValue ||
            collator.compare(
                left.approvedSinceDisplay,
                right.approvedSinceDisplay
            )
        );
    }

    return collator.compare(
        left[activeSortKey] || '',
        right[activeSortKey] || ''
    );
}

function normalizeTextValue(value) {
    return String(value || '').trim();
}

function normalizeLookupValue(value) {
    return normalizeTextValue(value).toLowerCase();
}

function normalizeApprovedSinceDisplay(value) {
    const normalizedValue = normalizeTextValue(value);

    if (!normalizedValue) {
        return '';
    }

    const parsedDate = new Date(`${normalizedValue}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return normalizedValue;
    }

    return approvedSinceFormatter.format(parsedDate);
}

function normalizeApprovedSinceSortValue(value) {
    const normalizedValue = normalizeTextValue(value);

    if (!normalizedValue) {
        return 0;
    }

    const parsedDate = new Date(`${normalizedValue}T00:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return 0;
    }

    return parsedDate.getTime();
}

function normalizeWebsiteHref(value) {
    const normalizedValue = normalizeTextValue(value);

    if (!normalizedValue) {
        return '';
    }

    if (/^https?:\/\//i.test(normalizedValue)) {
        return normalizedValue;
    }

    return `https://${normalizedValue}`;
}

function normalizePhoneHref(value) {
    const normalizedValue = normalizeTextValue(value);

    if (!normalizedValue) {
        return '';
    }

    return `tel:${normalizedValue.replace(/[^+\d]/g, '')}`;
}

function buildStreetAddress(row) {
    const mailingUnit = normalizeTextValue(row?.mailing_unit);
    const mailingStreet = normalizeTextValue(row?.mailing_street);
    const mailingStreetOptional = normalizeTextValue(
        row?.mailing_street_optional
    );
    const streetLine = [mailingUnit, mailingStreet].filter(Boolean).join(' ');

    return [streetLine, mailingStreetOptional].filter(Boolean).join(', ');
}

function buildSearchContent(row) {
    return [
        row.operatingOrgName,
        row.location,
        row.streetAddress,
        row.email,
        row.website,
        row.phoneNumber,
        row.approvedSince,
        row.approvedSinceDisplay,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

function normalizeApprovedSellersFeed(feedRows) {
    if (!Array.isArray(feedRows)) {
        return [];
    }

    return feedRows.map((row, index) => {
        const normalizedRow = {
            id: String(index),
            operatingOrgName: normalizeTextValue(row?.operating_org_name),
            location: normalizeTextValue(row?.city),
            streetAddress: buildStreetAddress(row),
            email: normalizeTextValue(row?.email),
            website: normalizeTextValue(row?.website),
            phoneNumber: normalizeTextValue(row?.phone_number),
            approvedSince: normalizeTextValue(row?.decision_date),
        };

        normalizedRow.approvedSinceDisplay = normalizeApprovedSinceDisplay(
            normalizedRow.approvedSince
        );
        normalizedRow.approvedSinceSortValue = normalizeApprovedSinceSortValue(
            normalizedRow.approvedSince
        );
        normalizedRow.emailHref = normalizedRow.email
            ? `mailto:${normalizedRow.email}`
            : '';
        normalizedRow.websiteHref = normalizeWebsiteHref(normalizedRow.website);
        normalizedRow.phoneHref = normalizePhoneHref(normalizedRow.phoneNumber);
        normalizedRow.contactDisplay = [
            normalizedRow.email,
            normalizedRow.phoneNumber,
        ]
            .filter(Boolean)
            .join(' ');
        normalizedRow.searchContent = buildSearchContent(normalizedRow);

        return normalizedRow;
    });
}

async function fetchFeed(endpoint, unavailableMessage) {
    if (!feedCache.has(endpoint)) {
        feedCache.set(
            endpoint,
            fetch(endpoint, { cache: 'no-store' }).then(async (response) => {
                if (!response.ok) {
                    throw new Error(unavailableMessage);
                }

                return {
                    data: await response.json(),
                    lastUpdated: normalizeTextValue(
                        response.headers.get(
                            'X-CleanBCDX-Approved-Sellers-Last-Updated'
                        )
                    ),
                };
            })
        );
    }

    return feedCache.get(endpoint);
}

onMounted(async () => {
    if (!props.endpoint) {
        errorMessage.value =
            'The approved sellers feed endpoint is not configured.';
        isLoading.value = false;
        return;
    }

    try {
        const {
            data: responseData,
            lastUpdated: responseLastUpdated,
        } = await fetchFeed(
            props.endpoint,
            'Unable to fetch approved sellers.'
        );

        if (!Array.isArray(responseData)) {
            throw new Error(
                'The approved sellers feed returned an unexpected response.'
            );
        }

        rows.value = normalizeApprovedSellersFeed(responseData);
        lastUpdated.value = responseLastUpdated;
    } catch (error) {
        errorMessage.value =
            error instanceof Error
                ? error.message
                : 'Unable to load approved sellers.';
    } finally {
        isLoading.value = false;
    }
});
</script>

<style scoped>

.approved-sellers__last-updated {
    color: var(--scorpiongrey, #585858);
    font-size: var(--wp--preset--font-size--extra-small, 0.95rem);
    margin: 0 0 0.5rem;

    &::before {
        background-image: var(--icon-last-updated);
        width: 1rem;
        height: 1rem;
        margin-right: 0.25rem;
        display: inline-block;
        position: relative;
        top: 0.15rem;
        content: "";
        background-position: center;
        background-repeat: no-repeat;
    }
}

.approved-sellers__controls {
    display: grid;
    gap: 1rem;
    align-items: end;
    background: white;
    width: 100%;
    padding-block: 1rem;
}

.approved-sellers__field {
    display: grid;
    gap: 0.35rem;
}

.approved-sellers__field label {
    font-size: var(--wp--preset--font-size--extra-small, 0.95rem);
    font-weight: 700;
}

.approved-sellers__input {
    width: 100%;
    min-height: 2.75rem;
    padding: 0.75rem 0.9rem;
    border: 2px solid var(--wp--preset--color--tertiary, #38598a);
    border-radius: 0.66rem;
    background: #fff;
    color: inherit;
}

.approved-sellers__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: start;
    justify-content: space-between;
    gap: 0.75rem;
}

.approved-sellers__clear-button {
    padding: 0.75rem 1rem;
    border: 2px solid var(--wp--preset--color--tertiary, #38598a);
    border-radius: 999px;
    background: transparent;
    color: var(--wp--preset--color--tertiary, #003366);
    font-weight: 700;
}

.approved-sellers__summary,
.approved-sellers__message {
    margin: 0 0 2rem;
    font-size: var(--wp--preset--font-size--extra-small, 0.95rem);
}

.approved-sellers__group {
    gap: 0;
    min-width: 0;
}

.approved-sellers__heading {
    align-items: center;
    border-top-right-radius: 1rem;
    color: var(--wp--preset--color--white);
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 0;
    padding: 0.5rem 1rem 0.35rem;
    background-color: var(--wp--preset--color--primary-brand, #003366);
}

.approved-sellers__table-shell {
    border: 2px solid var(--wp--preset--color--primary-brand, #003366);
    border-radius: 0 0 0.66rem 0.66rem;
    max-width: 100%;
    min-width: 0;
}

.eligible-commercial-vehicles__table-shell .wp-block-table {
    margin-block-end: 8px;
    max-width: 100%;

    @media (width <= 850px) {
        overflow-x: auto;
    }

    :is(table) {
        border-width: 0;
        border-radius: 0;
        width: 100%;
        min-width: 56rem;

        @media (width > 600px) {
            thead {
                position: sticky;
                top: -1.25rem;
                z-index: 99;
            }
        }

        & th:first-child,
        & th:last-child {
            border-radius: 0;
        }

        tbody tr:last-child {
            td:first-child {
                border-radius: 0 0 0 0.66rem;
            }

            td:last-child {
                border-radius: 0 0 0.66rem 0;
            }
        }

        & th {
            background-color: #fff;
            border-top: 2px solid var(--wp--preset--color--primary-brand, #003366);
            padding: 0;
        }

        & th:not([aria-sort='none']) {
            background-color: #f0f0f0;
        }
    }
}

.approved-sellers__table {
    table-layout: fixed;
}

.approved-sellers__table-figure :is(td, th) {
    vertical-align: top;
}

.approved-sellers__contact {
    display: grid;
    gap: 0.35rem;
    min-width: 0;
}

.approved-sellers__contact-item {
    display: block;
    max-width: 100%;
    min-width: 0;
}

.approved-sellers__table-figure :is(.approved-sellers__contact-item--email) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow-wrap: normal;
    word-break: normal;
}

.approved-sellers__table-figure :is(td[data-column='approvedSinceDisplay']) {
    white-space: nowrap;
}

.approved-sellers__table-figure :is(a) {
    overflow-wrap: anywhere;
}

.eligible-commercial-vehicles__sort-button {
    display: grid;
    align-content: start;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 1rem 0.65rem;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 700;
    text-align: left;
    line-height: 1.35;
    grid-template-columns: 1fr auto;
    margin: 0;
}

.eligible-commercial-vehicles__sort-indicator {
    position: relative;
    flex: 0 0 auto;
    width: 0.85rem;
    height: 0.95rem;
}

.eligible-commercial-vehicles__sort-indicator::before,
.eligible-commercial-vehicles__sort-indicator::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    border-left: 0.3rem solid transparent;
    border-right: 0.3rem solid transparent;
    opacity: 0.35;
}

.eligible-commercial-vehicles__sort-indicator::before {
    top: 5px;
    border-bottom: 0.4rem solid currentColor;
}

.eligible-commercial-vehicles__sort-indicator::after {
    bottom: -4px;
    border-top: 0.4rem solid currentColor;
}

.eligible-commercial-vehicles__sort-indicator.is-asc::before,
.eligible-commercial-vehicles__sort-indicator.is-desc::after {
    opacity: 1;
}

.eligible-commercial-vehicles__sort-indicator.is-asc::after,
.eligible-commercial-vehicles__sort-indicator.is-desc::before {
    opacity: 0.18;
}

@media (max-width: 782px) {
    .approved-sellers__actions {
        align-items: stretch;
        flex-direction: column;
    }

    .approved-sellers__actions > * {
        width: 100%;
    }
}
</style>
