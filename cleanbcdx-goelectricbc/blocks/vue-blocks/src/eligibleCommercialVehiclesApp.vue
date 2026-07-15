<template>
    <div class="eligible-commercial-vehicles">
        <p class="screen-reader-text" aria-live="polite">{{ statusMessage }}</p>

        <div
            v-if="!isLoading && !errorMessage"
            class="eligible-commercial-vehicles__controls"
        >
            <div class="eligible-commercial-vehicles__field">
                <label :for="`${controlIdBase}-search`">Filter vehicles</label>
                <input
                    :id="`${controlIdBase}-search`"
                    v-model.trim="searchTerm"
                    class="eligible-commercial-vehicles__input"
                    type="search"
                    placeholder="Filter by make, model, configuration, date, battery size, or type"
                />
            </div>

            <div
                class="eligible-commercial-vehicles__field eligible-commercial-vehicles__field--narrow"
            >
                <label :for="`${controlIdBase}-fuel-type`">Fuel type</label>
                <select
                    :id="`${controlIdBase}-fuel-type`"
                    v-model="selectedFuelType"
                    class="eligible-commercial-vehicles__select"
                    @click.stop
                    @mousedown.stop
                >
                    <option value="">All fuel types</option>
                    <option
                        v-for="fuelType in fuelTypeOptions"
                        :key="fuelType"
                        :value="fuelType"
                    >
                        {{ fuelType }}
                    </option>
                </select>
            </div>

            <div
                class="eligible-commercial-vehicles__field eligible-commercial-vehicles__field--narrow"
            >
                <label :for="`${controlIdBase}-class-filter`">Class size</label>
                <select
                    :id="`${controlIdBase}-class-filter`"
                    v-model="selectedClass"
                    class="eligible-commercial-vehicles__select"
                    @click.stop
                    @mousedown.stop
                >
                    <option value="">All classes</option>
                    <option
                        v-for="className in classOptions"
                        :key="className"
                        :value="className"
                    >
                        {{ className }}
                    </option>
                </select>
            </div>

            <div
                class="eligible-commercial-vehicles__field eligible-commercial-vehicles__field--narrow"
            >
                <label :for="`${controlIdBase}-class-order`">Class order</label>
                <select
                    :id="`${controlIdBase}-class-order`"
                    v-model="classSortDirection"
                    class="eligible-commercial-vehicles__select"
                    :disabled="selectedClass !== ''"
                    @click.stop
                    @mousedown.stop
                >
                    <option value="asc">Low to high</option>
                    <option value="desc">High to low</option>
                </select>
            </div>

            <div class="eligible-commercial-vehicles__actions">
                <p class="eligible-commercial-vehicles__summary">
                    {{ resultSummary }}
                </p>
                <button
                    v-if="hasActiveFilters"
                    type="button"
                    class="eligible-commercial-vehicles__clear-button"
                    @click="resetFilters"
                >
                    Clear filters
                </button>
            </div>
        </div>

        <p v-if="isLoading" class="eligible-commercial-vehicles__message">
            Loading eligible commercial vehicles...
        </p>
        <p
            v-else-if="errorMessage"
            class="eligible-commercial-vehicles__message"
            role="alert"
        >
            {{ errorMessage }}
        </p>
        <template v-else>
            <p
                v-if="showNoMatchesMessage"
                class="eligible-commercial-vehicles__message"
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
                No eligible commercial vehicles match the current filters.
                Showing all available vehicles below.
            </p>

            <p
                v-if="!groupedRows.length"
                class="eligible-commercial-vehicles__message"
            >
                No eligible commercial vehicles are available.
            </p>

            <div v-else class="eligible-commercial-vehicles__groups">
                <section
                    v-for="group in groupedRows"
                    :key="group.className"
                    class="wp-block-group gap-0 eligible-commercial-vehicles__group"
                >
                    <h3
                        class="wp-block-heading is-style-default cz5-contrast has-extra-small-font-size eligible-commercial-vehicles__heading"
                    >
                        {{ group.className }}
                    </h3>

                    <div
                        class="wp-block-group is-layout-flow eligible-commercial-vehicles__table-shell"
                    >
                        <figure
                            class="wp-block-table is-style-stripes is-sticky-header has-extra-small-font-size"
                        >
                            <table class="has-fixed-layout">
                                <caption class="screen-reader-text">
                                    Eligible commercial vehicles for
                                    {{
                                        group.className
                                    }}
                                </caption>
                                <thead>
                                    <tr>
                                        <th
                                            v-for="column in columns"
                                            :key="column.key"
                                            class="has-text-align-left"
                                            data-align="left"
                                            :aria-sort="getAriaSort(column.key)"
                                        >
                                            <button
                                                type="button"
                                                class="eligible-commercial-vehicles__sort-button"
                                                :aria-label="`Sort by ${getColumnLabel(column, group.className)}`"
                                                @click="changeSort(column.key)"
                                            >
                                                <span
                                                    v-html="
                                                        getColumnLabel(
                                                            column,
                                                            group.className
                                                        )
                                                    "
                                                ></span>
                                                <span
                                                    class="eligible-commercial-vehicles__sort-indicator"
                                                    :class="`is-${getSortState(column.key)}`"
                                                    aria-hidden="true"
                                                ></span>
                                            </button>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="row in group.rows" :key="row.id">
                                        <td
                                            class="has-text-align-left"
                                            data-align="left"
                                        >
                                            {{ row.make }}
                                        </td>
                                        <td
                                            class="has-text-align-left"
                                            data-align="left"
                                        >
                                            {{ row.modelName }}
                                        </td>
                                        <td
                                            class="has-text-align-left"
                                            data-align="left"
                                        >
                                            {{ row.configurationDisplay }}
                                        </td>
                                        <td
                                            class="has-text-align-left"
                                            data-align="left"
                                        >
                                            {{ row.yearDisplay }}
                                        </td>
                                        <td
                                            class="has-text-align-left"
                                            data-align="left"
                                        >
                                            {{ row.fuelTypeName }}
                                        </td>
                                        <td
                                            class="has-text-align-left"
                                            data-align="left"
                                        >
                                            {{ row.batterySizeRange }}
                                        </td>
                                        <td
                                            class="has-text-align-left"
                                            data-align="left"
                                        >
                                            {{ row.vehicleTypeName }}
                                        </td>
                                        <td
                                            class="has-text-align-left"
                                            data-align="left"
                                        >
                                            {{ row.decisionDate }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </figure>
                    </div>
                </section>
            </div>
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
        default: 'eligible-commercial-vehicles-app',
    },
});

const feedCache = new Map();
const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: 'base',
});
const columns = [
    {
        key: 'make',
        label: 'Make',
        getLabel: (className) => `(${className})`,
    },
    {
        key: 'modelName',
        label: 'Model',
    },
    {
        key: 'configurationDisplay',
        label: 'Configuration',
    },
    {
        key: 'year',
        label: 'Year',
    },
    {
        key: 'fuelTypeName',
        label: 'Fuel Type',
    },
    {
        key: 'batterySizeRange',
        label: 'Battery Size',
    },
    {
        key: 'vehicleTypeName',
        label: 'Vehicle Type',
    },
    {
        key: 'decisionDate',
        label: 'Approved since',
    },
];

const rows = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const searchTerm = ref('');
const selectedFuelType = ref('');
const selectedClass = ref('');
const classSortDirection = ref('asc');
const sortKey = ref('make');
const sortDirection = ref('asc');

const controlIdBase = computed(
    () => props.appId || 'eligible-commercial-vehicles-app'
);
const hasActiveFilters = computed(
    () =>
        '' !== searchTerm.value ||
        '' !== selectedFuelType.value ||
        '' !== selectedClass.value
);

const fuelTypeOptions = computed(() => {
    return Array.from(
        new Set(rows.value.map((row) => row.fuelTypeName).filter(Boolean))
    ).sort(collator.compare);
});

const classOptions = computed(() => {
    return Array.from(
        new Set(rows.value.map((row) => row.className).filter(Boolean))
    ).sort(compareClassNames);
});

const filteredRows = computed(() => {
    const normalizedSearchTerm = searchTerm.value.trim().toLowerCase();
    const searchedBatteryValue =
        normalizeSearchBatteryValue(normalizedSearchTerm);

    return rows.value.filter((row) => {
        if (selectedClass.value && row.className !== selectedClass.value) {
            return false;
        }

        if (
            selectedFuelType.value &&
            row.fuelTypeName !== selectedFuelType.value
        ) {
            return false;
        }

        if (!normalizedSearchTerm) {
            return true;
        }

        if (row.searchContent.includes(normalizedSearchTerm)) {
            return true;
        }

        if (null !== searchedBatteryValue) {
            return doesBatteryRangeMatchSearch(row, searchedBatteryValue);
        }

        return false;
    });
});

const showNoMatchesMessage = computed(
    () =>
        hasActiveFilters.value &&
        0 === filteredRows.value.length &&
        rows.value.length > 0
);

const matchedClassCount = computed(() => {
    return new Set(
        filteredRows.value.map((row) => row.className).filter(Boolean)
    ).size;
});

const sortedRows = computed(() => {
    return sortVehicleRows(filteredRows.value);
});

const displayRows = computed(() => {
    return showNoMatchesMessage.value
        ? sortVehicleRows(rows.value)
        : sortedRows.value;
});

const groupedRows = computed(() => {
    const groupedVehicles = new Map();

    displayRows.value.forEach((row) => {
        if (!groupedVehicles.has(row.className)) {
            groupedVehicles.set(row.className, []);
        }

        groupedVehicles.get(row.className).push(row);
    });

    return Array.from(groupedVehicles.entries())
        .sort((left, right) => {
            const comparison = compareClassNames(left[0], right[0]);

            return 'desc' === classSortDirection.value
                ? comparison * -1
                : comparison;
        })
        .map(([className, groupRows]) => ({
            className,
            rows: groupRows,
        }));
});

const resultSummary = computed(() => {
    const vehicleCount = filteredRows.value.length;
    const classCount = matchedClassCount.value;

    return `Showing ${vehicleCount} vehicle${1 === vehicleCount ? '' : 's'} across ${classCount} class${1 === classCount ? '' : 'es'}.`;
});

const statusMessage = computed(() => {
    if (isLoading.value) {
        return 'Loading eligible commercial vehicles.';
    }

    if (errorMessage.value) {
        return errorMessage.value;
    }

    return resultSummary.value;
});

function getColumnLabel(column, className) {
    return typeof column.getLabel === 'function'
        ? `${column.label}<br>${column.getLabel(className)}`
        : column.label;
}

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

function changeSort(nextSortKey) {
    if (sortKey.value === nextSortKey) {
        sortDirection.value = 'asc' === sortDirection.value ? 'desc' : 'asc';
        return;
    }

    sortKey.value = nextSortKey;
    sortDirection.value = 'asc';
}

function resetFilters() {
    searchTerm.value = '';
    selectedFuelType.value = '';
    selectedClass.value = '';
}

function sortVehicleRows(vehicleRows) {
    return [...vehicleRows].sort((left, right) => {
        const primarySort = compareRows(left, right, sortKey.value);

        if (0 !== primarySort) {
            return 'asc' === sortDirection.value ? primarySort : -primarySort;
        }

        return (
            compareRows(left, right, 'make') ||
            compareRows(left, right, 'modelName') ||
            compareRows(left, right, 'year')
        );
    });
}

function compareRows(left, right, activeSortKey) {
    if ('year' === activeSortKey) {
        return (left.year || 0) - (right.year || 0);
    }

    if ('batterySizeRange' === activeSortKey) {
        return (
            left.batterySortValue - right.batterySortValue ||
            collator.compare(left.batterySizeRange, right.batterySizeRange)
        );
    }

    if ('decisionDate' === activeSortKey) {
        return (
            left.decisionDateSortValue - right.decisionDateSortValue ||
            collator.compare(left.decisionDate, right.decisionDate)
        );
    }

    return collator.compare(
        left[activeSortKey] || '',
        right[activeSortKey] || ''
    );
}

function compareClassNames(leftClassName, rightClassName) {
    const leftClassNumber = extractFirstNumber(leftClassName);
    const rightClassNumber = extractFirstNumber(rightClassName);

    if (
        null !== leftClassNumber &&
        null !== rightClassNumber &&
        leftClassNumber !== rightClassNumber
    ) {
        return leftClassNumber - rightClassNumber;
    }

    return collator.compare(leftClassName, rightClassName);
}

function extractFirstNumber(value) {
    const match = String(value || '').match(/(\d+)/);

    if (!match) {
        return null;
    }

    return Number.parseInt(match[1], 10);
}

function normalizeConfiguration(configurationName) {
    const normalizedValue = String(configurationName || '').trim();

    if (!normalizedValue || 'not specified' === normalizedValue.toLowerCase()) {
        return '';
    }

    return normalizedValue;
}

function normalizeBatterySizeRange(battery) {
    const configuredValue = String(battery?.battery_size_range || '').trim();
    const batterySize = normalizeNumberValue(battery?.battery_size);
    const lowerBatteryRange = normalizeNumberValue(
        battery?.lower_battery_range
    );
    const upperBatteryRange = normalizeNumberValue(
        battery?.upper_battery_range
    );

    if (configuredValue) {
        return configuredValue;
    }

    if (Number.isFinite(batterySize)) {
        return `${batterySize} kWh`;
    }

    if (
        Number.isFinite(lowerBatteryRange) &&
        Number.isFinite(upperBatteryRange)
    ) {
        return `${lowerBatteryRange} - ${upperBatteryRange}`;
    }

    return '';
}

function normalizeBatterySortValue(battery) {
    const batterySize = normalizeNumberValue(battery?.battery_size);
    const lowerBatteryRange = normalizeNumberValue(
        battery?.lower_battery_range
    );
    const upperBatteryRange = normalizeNumberValue(
        battery?.upper_battery_range
    );

    if (Number.isFinite(batterySize)) {
        return batterySize;
    }

    if (Number.isFinite(lowerBatteryRange)) {
        return lowerBatteryRange;
    }

    if (Number.isFinite(upperBatteryRange)) {
        return upperBatteryRange;
    }

    return 0;
}

function normalizeBatterySearchRange(battery) {
    const batterySize = normalizeNumberValue(battery?.battery_size);
    const lowerBatteryRange = normalizeNumberValue(
        battery?.lower_battery_range
    );
    const upperBatteryRange = normalizeNumberValue(
        battery?.upper_battery_range
    );

    if (null !== batterySize) {
        return {
            min: batterySize,
            max: batterySize,
        };
    }

    if (null !== lowerBatteryRange && null !== upperBatteryRange) {
        return {
            min: Math.min(lowerBatteryRange, upperBatteryRange),
            max: Math.max(lowerBatteryRange, upperBatteryRange),
        };
    }

    if (null !== lowerBatteryRange) {
        return {
            min: lowerBatteryRange,
            max: lowerBatteryRange,
        };
    }

    if (null !== upperBatteryRange) {
        return {
            min: upperBatteryRange,
            max: upperBatteryRange,
        };
    }

    return {
        min: null,
        max: null,
    };
}

function normalizeDecisionDateSortValue(decisionDate) {
    const normalizedValue = String(decisionDate || '').trim();
    const dateParts = normalizedValue.split('/');

    if (3 !== dateParts.length) {
        return 0;
    }

    const month = Number.parseInt(dateParts[0], 10);
    const day = Number.parseInt(dateParts[1], 10);
    const year = Number.parseInt(dateParts[2], 10);

    if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) {
        return 0;
    }

    return new Date(year, month - 1, day).getTime();
}

function normalizeTextValue(value) {
    return String(value || '').trim();
}

function normalizeNumberValue(value) {
    const parsedValue = Number.parseFloat(value);

    if (Number.isNaN(parsedValue)) {
        return null;
    }

    return parsedValue;
}

function normalizeSearchBatteryValue(value) {
    const normalizedValue = String(value || '')
        .trim()
        .toLowerCase();
    const match = normalizedValue.match(/^(\d+(?:\.\d+)?)(?:\s*kwh)?$/);

    if (!match) {
        return null;
    }

    return normalizeNumberValue(match[1]);
}

function doesBatteryRangeMatchSearch(row, searchValue) {
    if (null === row.batterySearchMin && null === row.batterySearchMax) {
        return false;
    }

    return (
        searchValue >= row.batterySearchMin &&
        searchValue <= row.batterySearchMax
    );
}

function toArray(value) {
    return Array.isArray(value) ? value : [];
}

function buildSearchContent(row) {
    return [
        row.className,
        row.make,
        row.modelName,
        row.configurationDisplay,
        row.yearDisplay,
        row.fuelTypeName,
        row.batterySizeRange,
        row.vehicleTypeName,
        row.decisionDate,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
}

function flattenEligibleVehiclesFeed(manufacturers) {
    const flattenedRows = [];

    toArray(manufacturers).forEach((manufacturer, manufacturerIndex) => {
        const make = normalizeTextValue(manufacturer?.make);

        toArray(manufacturer?.models).forEach((model, modelIndex) => {
            const modelName = normalizeTextValue(model?.model_name);

            toArray(model?.configuration).forEach(
                (configuration, configurationIndex) => {
                    const configurationDisplay = normalizeConfiguration(
                        configuration?.configuration_name
                    );

                    toArray(configuration?.model_years).forEach(
                        (modelYear, modelYearIndex) => {
                            const year = normalizeNumberValue(modelYear?.year);

                            toArray(modelYear?.vehicle_class).forEach(
                                (vehicleClass, vehicleClassIndex) => {
                                    const className = normalizeTextValue(
                                        vehicleClass?.vehicle_class_name
                                    );

                                    toArray(vehicleClass?.vehicle_type).forEach(
                                        (vehicleType, vehicleTypeIndex) => {
                                            const vehicleTypeName =
                                                normalizeTextValue(
                                                    vehicleType?.vehicle_type_name
                                                );

                                            toArray(
                                                vehicleType?.fuel_type
                                            ).forEach(
                                                (fuelType, fuelTypeIndex) => {
                                                    const fuelTypeName =
                                                        normalizeTextValue(
                                                            fuelType?.fuel_type_name
                                                        );

                                                    toArray(
                                                        fuelType?.battery
                                                    ).forEach(
                                                        (
                                                            battery,
                                                            batteryIndex
                                                        ) => {
                                                            const decisionDate =
                                                                normalizeTextValue(
                                                                    battery?.decision_date
                                                                );
                                                            const batterySearchRange =
                                                                normalizeBatterySearchRange(
                                                                    battery
                                                                );
                                                            const row = {
                                                                id: [
                                                                    manufacturerIndex,
                                                                    modelIndex,
                                                                    configurationIndex,
                                                                    modelYearIndex,
                                                                    vehicleClassIndex,
                                                                    vehicleTypeIndex,
                                                                    fuelTypeIndex,
                                                                    batteryIndex,
                                                                ].join('-'),
                                                                className,
                                                                make,
                                                                modelName,
                                                                configurationDisplay,
                                                                year:
                                                                    null ===
                                                                    year
                                                                        ? null
                                                                        : year,
                                                                yearDisplay:
                                                                    null ===
                                                                    year
                                                                        ? ''
                                                                        : String(
                                                                              year
                                                                          ),
                                                                fuelTypeName,
                                                                batterySizeRange:
                                                                    normalizeBatterySizeRange(
                                                                        battery
                                                                    ),
                                                                batterySortValue:
                                                                    normalizeBatterySortValue(
                                                                        battery
                                                                    ),
                                                                batterySearchMin:
                                                                    batterySearchRange.min,
                                                                batterySearchMax:
                                                                    batterySearchRange.max,
                                                                vehicleTypeName,
                                                                decisionDate,
                                                                decisionDateSortValue:
                                                                    normalizeDecisionDateSortValue(
                                                                        decisionDate
                                                                    ),
                                                            };

                                                            row.searchContent =
                                                                buildSearchContent(
                                                                    row
                                                                );
                                                            flattenedRows.push(
                                                                row
                                                            );
                                                        }
                                                    );
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        });
    });

    return flattenedRows;
}

async function fetchFeed(endpoint) {
    if (!feedCache.has(endpoint)) {
        feedCache.set(
            endpoint,
            fetch(endpoint, { cache: 'no-store' }).then(async (response) => {
                if (!response.ok) {
                    throw new Error(
                        'Unable to load eligible commercial vehicles.'
                    );
                }

                return response.json();
            })
        );
    }

    return feedCache.get(endpoint);
}

onMounted(async () => {
    if (!props.endpoint) {
        errorMessage.value =
            'The eligible vehicles feed endpoint is not configured.';
        isLoading.value = false;
        return;
    }

    try {
        const responseData = await fetchFeed(props.endpoint);

        if (!Array.isArray(responseData)) {
            throw new Error(
                'The eligible vehicles feed returned an unexpected response.'
            );
        }

        rows.value = flattenEligibleVehiclesFeed(responseData);
    } catch (error) {
        errorMessage.value =
            error instanceof Error
                ? error.message
                : 'Unable to load eligible commercial vehicles.';
    } finally {
        isLoading.value = false;
    }
});
</script>

<style scoped>
.eligible-commercial-vehicles {
    /* display: grid; */
}

.eligible-commercial-vehicles__controls {
    display: grid;
    gap: 1rem;
    grid-template-columns: minmax(0, 4fr) repeat(3, minmax(8rem, 1fr));
    align-items: end;
    /* position: sticky;
     @media (width > 600px) {
        top: -1.5rem;
     } */
    background: white;
    z-index: 99999999;
    padding-block: 1rem;
    width: 100%;
}

.dialog-content {
    @media (width > 600px) {
        .eligible-commercial-vehicles__controls {
            position: sticky;
            top: -1.5rem;
        }
    }
}

.eligible-commercial-vehicles__field {
    display: grid;
    gap: 0.35rem;
}

.eligible-commercial-vehicles__field label {
    font-size: var(--wp--preset--font-size--extra-small, 0.95rem);
    font-weight: 700;
}

.eligible-commercial-vehicles__input,
.eligible-commercial-vehicles__select {
    width: 100%;
    min-height: 2.75rem;
    padding: 0.75rem 0.9rem;
    border: 2px solid var(--wp--preset--color--tertiary, #38598a);
    border-radius: 0.66rem;
    background: #fff;
    color: inherit;
}

.eligible-commercial-vehicles__select[disabled] {
    opacity: 0.5;
}

.eligible-commercial-vehicles__actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    grid-column: 1 / -1;
}

.eligible-commercial-vehicles__clear-button {
    padding: 0.75rem 1rem;
    border: 2px solid var(--wp--preset--color--tertiary, #38598a);
    border-radius: 999px;
    background: transparent;
    color: var(--wp--preset--color--tertiary, #003366);
    font-weight: 700;
}

.eligible-commercial-vehicles__summary,
.eligible-commercial-vehicles__message {
    margin: 0 0 2rem;
    font-size: var(--wp--preset--font-size--extra-small, 0.95rem);
}

.eligible-commercial-vehicles__groups {
    display: grid;
    gap: 1.5rem;
}

.eligible-commercial-vehicles__group {
    min-width: 0;
}

.eligible-commercial-vehicles__heading {
    border-top-right-radius: 1rem;
    color: var(--wp--preset--color--white);
    margin: 0;
    padding: 0.5rem 1rem;
}

.eligible-commercial-vehicles__table-shell {
    border-radius: 0 0 0.66rem 0.66rem;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
}

.eligible-commercial-vehicles__group:nth-of-type(3n + 1) {
    .eligible-commercial-vehicles__heading {
        background-color: var(--wp--preset--color--primary-brand, #003366);
    }

    .eligible-commercial-vehicles__table-shell {
        border: 2px solid var(--wp--preset--color--primary-brand, #003366);
    }

    .wp-block-table thead th {
        border-top: 2px solid var(--wp--preset--color--primary-brand, #003366);
    }
}

.eligible-commercial-vehicles__group:nth-of-type(3n + 2) {
    .eligible-commercial-vehicles__heading {
        background-color: var(--wp--preset--color--tertiary, #0055a4);
    }

    .eligible-commercial-vehicles__table-shell {
        border: 2px solid var(--wp--preset--color--tertiary, #0055a4);
    }

    .wp-block-table thead th {
        border-top: 2px solid var(--wp--preset--color--tertiary, #0055a4);
    }
}

.eligible-commercial-vehicles__group:nth-of-type(3n + 3) {
    .eligible-commercial-vehicles__heading {
        background-color: var(--wp--preset--color--septenary, #2e8540);
    }

    .eligible-commercial-vehicles__table-shell {
        border: 2px solid var(--wp--preset--color--septenary, #2e8540);
    }

    .wp-block-table thead th {
        border-top: 2px solid var(--wp--preset--color--septenary, #2e8540);
    }
}

.eligible-commercial-vehicles__table-shell .wp-block-table {
    margin-block-end: 8px;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;

    :is(table) {
        border-width: 0;
        border-radius: 0;
        width: 100%;

        @media (width > 600px) {
            thead {
                position: sticky;
                top: 0; /* 8.75rem; */
                z-index: 99;
            }
        }

        & th:first-child,
        & th:last-child {
            border-radius: 0;
        }
        tbody tr:last-child {
            td:first-child,
            td:last-child {
                border-radius: 0.66rem;
            }
        }

        & th {
            background-color: #fff;
            padding: 0;
        }

        & th:not([aria-sort='none']) {
            background-color: #f0f0f0;
        }
    }
}

.eligible-commercial-vehicles__sort-button {
    display: grid;
    align-content: start;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 10px;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 700;
    text-align: left;
    line-height: 1.35;
    grid-template-columns: 1fr auto;
    margin: 0;
    min-height: 65px;
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

.eligible-commercial-vehicles :deep(table) {
    min-width: 48rem;
}

@media (max-width: 782px) {
    .eligible-commercial-vehicles__controls {
        grid-template-columns: 1fr;
    }

    .eligible-commercial-vehicles__actions {
        align-items: stretch;
        flex-direction: column;
    }

    .eligible-commercial-vehicles__actions > * {
        width: 100%;
    }
}
</style>
