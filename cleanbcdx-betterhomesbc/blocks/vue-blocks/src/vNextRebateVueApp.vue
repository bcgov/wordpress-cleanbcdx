<template>
    <div>
        <p v-if="!isReadyToRender" role="status" class="loader">
            Preparing rebate tool...
        </p>
        <div v-else class="inner">
            <!-- Heading for screen readers -->
            <p v-if="mode === 'single'" class="sr-only">
                The next section, Your Home’s Details, shows the answers
                currently being used to determine rebate eligibility. If your
                details are correct, you can skip this section. To change a
                setting in the regular interface, expand details if needed,
                select Edit, then activate a setting and choose a new value. A
                screen-reader-only Screen reader enhanced interface button is
                available. After it is enabled, that same button changes to Skip
                home details and moves focus to the Reset screen reader enhanced
                interface button.
            </p>

            <!-- Skip to results link (only in archive mode) -->
            <a
                v-if="mode === 'archive'"
                href="#rebatesResults"
                class="sr-only skip-to-results"
                >Skip to results</a
            >

            <!-- Loading / Error -->
            <p v-if="isLoading" role="status" class="loader">
                Initializing rebates qualifier questionaire from settings...
            </p>
            <p v-else-if="loadError" role="alert">
                Failed to load rebates: {{ loadError }}
            </p>

            <template v-else>
                <dialog
                    v-if="mode === 'single'"
                    ref="singleModeDialogRef"
                    id="single-mode-dialog"
                    class="dialog"
                    :aria-hidden="isSingleModeDialogOpen ? 'false' : 'true'"
                    :inert="isSingleModeDialogOpen ? null : ''"
                    aria-modal="true"
                    aria-live="polite"
                    :aria-labelledby="'single-mode-dialog-title'"
                    :aria-describedby="'single-mode-dialog-desc'"
                    @close="handleSingleModeDialogClosed"
                    @click="handleSingleModeDialogBackdropClick"
                    @cancel.prevent="closeSingleModeDialog"
                >
                    <div class="dialog-content">
                        <h2
                            id="single-mode-dialog-title"
                            tabindex="0"
                            ref="singleModeDialogHeadingRef"
                        >
                            {{ singleModeDialogTitle }}
                        </h2>
                        <p id="single-mode-dialog-desc">
                            {{ singleModeDialogDescription }}
                        </p>
                        <div class="dialog-actions">
                            <div
                                class="wp-block-buttons is-layout-flex wp-block-buttons-is-layout-flex"
                                style="margin-top: 1rem; margin-bottom: 0rem"
                            >
                                <div
                                    class="guardrails-dialog__actions is-layout-flex"
                                >
                                    <!-- Secondary (always shown) -->
                                    <div
                                        class="wp-block-button has-size-regular is-style-outline"
                                    >
                                        <a
                                            href="#top"
                                            class="wp-block-button__link has-extra-small-font-size has-custom-font-size wp-element-button"
                                            @click.prevent="
                                                closeSingleModeDialog
                                            "
                                            >Stay here</a
                                        >
                                    </div>
                                    <!-- Primary (always shown, but varies by state) -->
                                    <div
                                        v-if="
                                            singleModeDialogVariant ===
                                                'alternate-rebate' &&
                                            singleModeAlternateRebate
                                        "
                                        class="wp-block-button has-size-regular is-style-fill"
                                    >
                                        <a
                                            :href="
                                                singleModeAlternateRebate.href
                                            "
                                            class="wp-block-button__link has-extra-small-font-size has-custom-font-size wp-element-button"
                                            >{{
                                                singleModeAlternateButtonLabel
                                            }}</a
                                        >
                                    </div>
                                    <div
                                        v-else
                                        class="wp-block-button has-size-regular is-style-fill"
                                    >
                                        <a
                                            href="/find-rebates"
                                            class="wp-block-button__link has-extra-small-font-size has-custom-font-size wp-element-button"
                                            >Find rebates you might qualify
                                            for</a
                                        >
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        class="close-dialog"
                        aria-label="Close dialog"
                        @click="closeSingleModeDialog"
                    >
                        Close
                    </button>
                </dialog>

                <div
                    v-if="(!hasAllSelection || isDirty) && mode === 'single'"
                    class="wp-block-group info has-icon is-layout-flow wp-block-group-is-layout-flow"
                    style="border-radius: 1rem; margin: 0; padding: 0.5rem 1rem"
                >
                    <p style="font-size: 1rem; margin-block: 0.5rem">
                        We can't recommend a rebate.
                        <a
                            v-if="!isDirty && !assistiveSimpleMode"
                            @click="toggleCollapseView"
                            @keydown.enter.space.prevent="toggleCollapseView"
                            tabindex="0"
                        >
                            Please update your home's details.
                        </a>
                        <span v-if="isDirty">
                            The page URL does not match your settings. Please
                            update and save your selections.
                        </span>
                    </p>
                </div>
                <button
                    v-if="mode === 'single'"
                    type="button"
                    class="sr-only sr-only-focusable simplify-assistive-toggle"
                    @click="handleAssistiveScreenReaderButton"
                >
                    {{
                        assistiveSimpleMode
                            ? 'Skip home details'
                            : 'Screen reader enhanced interface'
                    }}
                </button>

                <!-- Filter Controls -->
                <div
                    id="rebatesFilterControls"
                    class="filter-container"
                    :class="[
                        {
                            'filters-dirty': isDirty,
                            'labels-hidden': !labelsVisible,
                        },
                        { collapsed: isCollapseView && mode === 'single' },
                        { loading: isLoading },
                    ]"
                >
                    <article
                        v-if="mode === 'single'"
                        :class="[
                            'selection-summary',
                            { 'assistive-simple-mode': assistiveSimpleMode },
                        ]"
                        role="region"
                        aria-labelledby="single-mode-settings-title"
                    >
                        <h2
                            id="single-mode-settings-title"
                            class="settings-headline"
                        >
                            Your home's details
                        </h2>
                        <p
                            id="single-mode-summary-instructions"
                            class="sr-only"
                        >
                            <template v-if="assistiveSimpleMode">
                                Screen reader enhanced interface is active.
                                Settings are shown directly as select fields.
                                Use Tab to move through the fields, or use the
                                reset button to return to the regular interface.
                            </template>
                            <template v-else-if="isSingleModeEditModeActive">
                                Edit mode is active. Use Tab to move between
                                settings buttons, then press Enter or Space to
                                edit a setting.
                            </template>
                            <template v-else>
                                Read-only summary of your current home details.
                                Use Tab to move through controls.
                            </template>
                        </p>
                        <p
                            id="single-mode-summary-status"
                            class="sr-only"
                            role="status"
                            aria-live="polite"
                        >
                            {{ singleModeSettingsContextMessage }}
                        </p>
                        <button
                            v-if="!assistiveSimpleMode"
                            ref="collapseButtonRef"
                            class="rebate-collapse-setting"
                            tabindex="0"
                            :class="isCollapseView ? 'collapsed' : ''"
                            :aria-expanded="isCollapseView ? 'false' : 'true'"
                            aria-controls="single-mode-controls"
                            aria-labelledby="single-mode-settings-title single-mode-settings-details-label"
                            @click="toggleCollapseView"
                        >
                            <span
                                id="single-mode-settings-details-label"
                                class="sr-only"
                                >{{
                                    isCollapseView
                                        ? 'Expand details'
                                        : 'Collapse details'
                                }}</span
                            >
                        </button>

                        <div
                            v-if="
                                false &&
                                selectedBuildingGroupSlug !== 'murb' &&
                                murbTenure === 'rent'
                            "
                            class="message error-message"
                        >
                            <p>
                                <span
                                    >Rentals of your home type are not
                                    eligible</span
                                >
                            </p>
                            <p>
                                Only rentals in multi-unit residential buildings
                                are currently eligible.
                            </p>
                        </div>
                        <div
                            id="single-mode-controls"
                            class="control-container"
                            :inert="isCollapseView ? '' : null"
                            :aria-hidden="isCollapseView ? 'true' : 'false'"
                        >
                            <template v-for="field in fields" :key="field.key">
                                <template
                                    v-if="
                                        field.condition === undefined ||
                                        field.condition
                                    "
                                >
                                    <!-- If field has a value -->
                                    <template
                                        v-if="
                                            field.displayValue &&
                                            isSingleModeEditModeActive
                                        "
                                    >
                                        <!-- Show button (unless its select is open) -->
                                        <div
                                            class="control button-group"
                                            v-if="activeEdit !== field.key"
                                        >
                                            <label class="small">{{
                                                field.shortDesc
                                            }}</label>
                                            <button
                                                class="rebate-setting"
                                                :disabled="field.disabled"
                                                tabindex="0"
                                                :data-field-key="field.key"
                                                :aria-label="
                                                    getEditFieldButtonLabel(
                                                        field
                                                    )
                                                "
                                                :aria-describedby="
                                                    [
                                                        `${field.key}-edit-hint`,
                                                        fieldErrors[field.key]
                                                            ? `${field.key}-edit-warning`
                                                            : null,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ')
                                                "
                                                :class="{
                                                    'is-external-dirty':
                                                        isExternalDirty &&
                                                        lastChangedField ===
                                                            field.key,
                                                    error: fieldErrors[
                                                        field.key
                                                    ],
                                                }"
                                                @click="
                                                    openEdit(field.key, $event)
                                                "
                                                :ref="
                                                    (el) =>
                                                        (buttonRefs[field.key] =
                                                            el)
                                                "
                                            >
                                                {{ field.displayValue }}
                                            </button>
                                            <span
                                                :id="`${field.key}-edit-hint`"
                                                class="sr-only"
                                                >Activate to edit
                                                {{ field.shortDesc }}.</span
                                            >
                                            <p
                                                v-if="fieldErrors[field.key]"
                                                :id="`${field.key}-edit-warning`"
                                                class="rebate-setting-warning"
                                            >
                                                <template
                                                    v-if="
                                                        false &&
                                                        isIneligibleInstalledHeatPumpSelection(
                                                            field.key
                                                        )
                                                    "
                                                >
                                                    You can't get a rebate if
                                                    <strong
                                                        >you already have a
                                                        {{
                                                            getInstalledHeatPumpLabel(
                                                                field.key
                                                            )
                                                        }}.</strong
                                                    >
                                                    To see other rebates,
                                                    <a
                                                        href="/find-rebates/"
                                                        style="
                                                            color: darkred;
                                                            text-underline-offset: 2px;
                                                        "
                                                        >go back to the
                                                        questionnaire.</a
                                                    >
                                                </template>
                                                <template v-if="true">
                                                    This page is based on
                                                    {{
                                                        field.key === 'building'
                                                            ? 'home and heating type'
                                                            : 'current heating type'
                                                    }}. To see rebates for a
                                                    different home type,
                                                    <a
                                                        href="/find-rebates/"
                                                        style="
                                                            color: darkred;
                                                            text-underline-offset: 2px;
                                                        "
                                                        >go back to the
                                                        questionnaire.</a
                                                    >
                                                </template>
                                            </p>
                                        </div>
                                        <!-- Show select if open -->
                                        <div
                                            v-else-if="
                                                editable &&
                                                activeEdit === field.key
                                            "
                                        >
                                            <figure class="control editable">
                                                <button
                                                    v-if="!assistiveSimpleMode"
                                                    :disabled="
                                                        !field.model.value
                                                    "
                                                    type="button"
                                                    class="close-btn"
                                                    tabindex="-1"
                                                    aria-hidden="true"
                                                    @click="
                                                        closeEdit(field.key)
                                                    "
                                                    :aria-label="`Close ${field.shortDesc} editor`"
                                                ></button>
                                                <label
                                                    :id="`${field.key}SelectLabel`"
                                                    :for="`${field.key}Select`"
                                                    >{{ field.label }}</label
                                                >
                                                <select
                                                    :key="
                                                        field.key +
                                                        '-' +
                                                        (fieldRenderKeys[
                                                            field.key
                                                        ] ?? 0)
                                                    "
                                                    class="select"
                                                    :class="
                                                        fieldErrors[field.key]
                                                            ? 'error'
                                                            : ''
                                                    "
                                                    :id="`${field.key}Select`"
                                                    :aria-describedby="
                                                        [
                                                            field.description
                                                                ? `${field.key}SelectDesc`
                                                                : null,
                                                            fieldErrors[
                                                                field.key
                                                            ] &&
                                                            field.error_desc
                                                                ? `${field.key}SelectError`
                                                                : null,
                                                        ]
                                                            .filter(Boolean)
                                                            .join(' ') || null
                                                    "
                                                    v-model="field.model.value"
                                                    :disabled="field.disabled"
                                                    @change="
                                                        handleSelectChange(
                                                            field.key,
                                                            $event.target.value
                                                        )
                                                    "
                                                    @keydown="
                                                        handleSelectKeydown(
                                                            $event,
                                                            field.key,
                                                            field.model.value
                                                        )
                                                    "
                                                    :ref="
                                                        (el) =>
                                                            (selectRefs[
                                                                field.key
                                                            ] = el)
                                                    "
                                                >
                                                    <option
                                                        disabled
                                                        :selected="
                                                            !field.model.value
                                                        "
                                                        data-default="Select an option"
                                                        value=""
                                                    >
                                                        Select an option
                                                    </option>

                                                    <!-- Grouped (building) -->
                                                    <template
                                                        v-if="field.isGrouped"
                                                    >
                                                        <optgroup
                                                            v-for="group in field.groups"
                                                            :key="group.slug"
                                                            :label="
                                                                group.name ===
                                                                'MURB'
                                                                    ? 'Multi-unit residential buildings'
                                                                    : group.name
                                                            "
                                                        >
                                                            <option
                                                                v-for="child in group.children"
                                                                :key="
                                                                    child.slug
                                                                "
                                                                :value="
                                                                    child.slug
                                                                "
                                                            >
                                                                {{ child.name }}
                                                            </option>
                                                        </optgroup>
                                                    </template>

                                                    <!-- Flat (others) -->
                                                    <template v-else>
                                                        <option
                                                            v-for="opt in field.options"
                                                            :key="opt.slug"
                                                            :value="opt.slug"
                                                        >
                                                            {{ opt.name }}
                                                        </option>
                                                    </template>
                                                </select>

                                                <figcaption
                                                    v-if="field.description"
                                                    :id="`${field.key}SelectDesc`"
                                                >
                                                    {{ field.description }}
                                                </figcaption>
                                                <p
                                                    v-if="
                                                        getFieldErrorDescription(
                                                            field
                                                        ) &&
                                                        fieldErrors[field.key]
                                                    "
                                                    :id="`${field.key}SelectError`"
                                                    class="message error-message"
                                                    aria-live="polite"
                                                    v-html="
                                                        getFieldErrorDescription(
                                                            field
                                                        )
                                                    "
                                                ></p>
                                                <figcaption
                                                    v-if="
                                                        field.key ===
                                                            'heating' &&
                                                        field.disabled
                                                    "
                                                >
                                                    This heating type is
                                                    preselected for this rebate.
                                                </figcaption>
                                            </figure>
                                        </div>
                                    </template>

                                    <template
                                        v-else-if="
                                            field.displayValue &&
                                            !isSingleModeEditModeActive &&
                                            !assistiveSimpleMode
                                        "
                                    >
                                        <div
                                            class="control label-group"
                                            role="group"
                                            :aria-labelledby="`${field.key}-summary-label ${field.key}-summary-value`"
                                        >
                                            <label
                                                class="small"
                                                :id="`${field.key}-summary-label`"
                                                >{{ field.shortDesc }}</label
                                            >
                                            <p
                                                class="rebate-detail"
                                                :id="`${field.key}-summary-value`"
                                                :class="
                                                    fieldErrors[field.key]
                                                        ? 'error'
                                                        : ''
                                                "
                                            >
                                                {{ field.displayValue }}
                                            </p>
                                            <p
                                                v-if="fieldErrors[field.key]"
                                                class="rebate-detail-warning"
                                            >
                                                This setting is not supported
                                                for this rebate.
                                            </p>
                                        </div>
                                    </template>

                                    <!-- If field is missing show select immediately -->
                                    <template v-else>
                                        <figure class="control editable">
                                            <button
                                                v-if="!assistiveSimpleMode"
                                                :disabled="!field.model.value"
                                                type="button"
                                                class="close-btn"
                                                tabindex="-1"
                                                aria-hidden="true"
                                                @click="closeEdit(field.key)"
                                                :aria-label="`Close ${field.shortDesc} editor`"
                                            ></button>
                                            <label
                                                :id="`${field.key}SelectLabel`"
                                                :for="`${field.key}Select`"
                                                >{{ field.label }}</label
                                            >
                                            <select
                                                :key="
                                                    field.key +
                                                    '-' +
                                                    (fieldRenderKeys[
                                                        field.key
                                                    ] ?? 0)
                                                "
                                                class="select"
                                                :class="
                                                    fieldErrors[field.key]
                                                        ? 'error'
                                                        : ''
                                                "
                                                :id="`${field.key}Select`"
                                                :aria-describedby="
                                                    [
                                                        field.description
                                                            ? `${field.key}SelectDesc`
                                                            : null,
                                                        fieldErrors[
                                                            field.key
                                                        ] && field.error_desc
                                                            ? `${field.key}SelectError`
                                                            : null,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' ') || null
                                                "
                                                v-model="field.model.value"
                                                :disabled="field.disabled"
                                                @change="
                                                    handleSelectChange(
                                                        field.key,
                                                        $event.target.value
                                                    )
                                                "
                                                @keydown="
                                                    handleSelectKeydown(
                                                        $event,
                                                        field.key,
                                                        field.model.value
                                                    )
                                                "
                                                :ref="
                                                    (el) =>
                                                        (selectRefs[field.key] =
                                                            el)
                                                "
                                            >
                                                <option
                                                    disabled
                                                    :selected="
                                                        !field.model.value
                                                    "
                                                    data-default="Select an option"
                                                    value=""
                                                >
                                                    Select an option
                                                </option>

                                                <!-- Grouped (building) -->
                                                <template
                                                    v-if="field.isGrouped"
                                                >
                                                    <optgroup
                                                        v-for="group in field.groups"
                                                        :key="group.slug"
                                                        :label="
                                                            group.name ===
                                                            'MURB'
                                                                ? 'Multi-unit residential buildings'
                                                                : group.name
                                                        "
                                                    >
                                                        <option
                                                            v-for="child in group.children"
                                                            :key="child.slug"
                                                            :value="child.slug"
                                                        >
                                                            {{ child.name }}
                                                        </option>
                                                    </optgroup>
                                                </template>

                                                <!-- Flat (others) -->
                                                <template v-else>
                                                    <option
                                                        v-for="opt in field.options"
                                                        :key="opt.slug"
                                                        :value="opt.slug"
                                                    >
                                                        {{ opt.name }}
                                                    </option>
                                                </template>
                                            </select>

                                            <figcaption
                                                v-if="field.description"
                                                :id="`${field.key}SelectDesc`"
                                            >
                                                {{ field.description }}
                                            </figcaption>
                                            <p
                                                v-if="
                                                    getFieldErrorDescription(
                                                        field
                                                    ) && fieldErrors[field.key]
                                                "
                                                :id="`${field.key}SelectError`"
                                                class="message error-message"
                                                aria-live="polite"
                                                v-html="
                                                    getFieldErrorDescription(
                                                        field
                                                    )
                                                "
                                            ></p>
                                        </figure>
                                    </template>
                                </template>
                            </template>
                            <div class="control instruction-group">
                                <div>
                                    <label
                                        v-if="isSingleModeEditModeActive"
                                        class="small sr-only"
                                        for="instructions"
                                        >Settings instructions</label
                                    >
                                    <p
                                        v-if="isSingleModeEditModeActive"
                                        name="instructions"
                                        class="small-text"
                                        style="
                                            text-align: left;
                                            line-height: 1.665;
                                            padding-top: 0.5rem;
                                        "
                                    >
                                        Updating your home's details will
                                        refresh the page content.
                                    </p>
                                </div>
                                <button
                                    class="editBtn toggle-edit-mode readonly-toggle"
                                    v-if="!assistiveSimpleMode"
                                    tabindex="0"
                                    :disabled="isSingleModeEditToggleDisabled"
                                    :class="
                                        isSavingEditMode
                                            ? 'saving'
                                            : isSingleModeEditModeActive
                                              ? 'show-edit-mode'
                                              : 'show-readonly-mode'
                                    "
                                    aria-describedby="single-mode-summary-instructions"
                                    @click="toggleEditModeView"
                                    :aria-label="editModeToggleLabel"
                                    :title="editModeToggleLabel"
                                >
                                    <span>{{
                                        isSavingEditMode
                                            ? 'Saving edit...'
                                            : isSingleModeEditModeActive
                                              ? 'Edit'
                                              : 'Edit'
                                    }}</span>
                                </button>
                                <button
                                    v-if="assistiveSimpleMode"
                                    ref="resetSimplifiedButtonRef"
                                    type="button"
                                    class="reset-simplified-interface-btn"
                                    tabindex="0"
                                    aria-label="Collapse your home's details and reset the screen reader enhanced interface"
                                    @click="disableAssistiveSimpleMode"
                                >
                                    <span
                                        >Reset screen reader enhanced
                                        interface</span
                                    >
                                </button>
                                <button
                                    v-if="false"
                                    class="editBtn labels"
                                    :class="
                                        labelsVisible
                                            ? 'show-labels'
                                            : 'hide-labels'
                                    "
                                    @click="toggleLabels"
                                    :title="
                                        labelsVisible
                                            ? 'Hide settings labels'
                                            : 'Show settings labels'
                                    "
                                >
                                    Show or hide settings labels
                                </button>
                            </div>
                        </div>
                    </article>

                    <template v-if="mode === 'archive'">
                        <div
                            v-if="
                                false &&
                                selectedBuildingGroupSlug ===
                                    'ground-oriented-dwellings' &&
                                murbTenure === 'rent'
                            "
                            class="message error-message"
                        >
                            <p>
                                <span
                                    >Rentals of your home type are not
                                    eligible</span
                                >
                            </p>
                            <p>
                                Only rentals in multi-unit residential buildings
                                are currently eligible.
                            </p>
                        </div>

                        <div aria-live="polite" class="sr-only" role="status">
                            {{ ariaStatusMessage }}
                        </div>

                        <div class="control-container stacked">
                            <template v-for="field in fields" :key="field.key">
                                <template
                                    v-if="
                                        field.condition === undefined ||
                                        field.condition
                                    "
                                >
                                    <div class="question-container">
                                        <div class="num-label"></div>
                                        <figure class="control" role="none">
                                            <label :for="`${field.key}Select`"
                                                >{{ field.label }}
                                                <a
                                                    v-if="field.definition"
                                                    :href="field.glossary_link"
                                                    :class="{
                                                        wide: field.glossary_wide,
                                                    }"
                                                    >{{ field.definition }}</a
                                                ></label
                                            >

                                            <!-- Location input -->
                                            <template
                                                v-if="field.key === 'location'"
                                            >
                                                <div
                                                    class="custom-input location-input-wrapper"
                                                >
                                                    <input
                                                        :list="
                                                            isMobile
                                                                ? `${field.key}ListMobile`
                                                                : `${field.key}List`
                                                        "
                                                        :id="`${field.key}Select`"
                                                        type="text"
                                                        autocomplete="off"
                                                        class="location-input"
                                                        :class="{
                                                            'is-empty':
                                                                !locationInputValue,
                                                            'is-valid':
                                                                !isLocationFocused &&
                                                                isLocationValid,
                                                            'is-error':
                                                                !isLocationFocused &&
                                                                !isLocationValid &&
                                                                locationInputValue,
                                                            'is-invalid':
                                                                isLocationFocused &&
                                                                !isLocationValid &&
                                                                locationInputValue,
                                                            'has-valid-selection':
                                                                hasValidArchiveLocationSelection,
                                                        }"
                                                        :aria-invalid="
                                                            locationInputValue &&
                                                            !isLocationValid
                                                                ? 'true'
                                                                : 'false'
                                                        "
                                                        :aria-describedby="
                                                            fieldErrors[
                                                                field.key
                                                            ]
                                                                ? `${field.key}Error`
                                                                : null
                                                        "
                                                        placeholder="Your community..."
                                                        v-model="
                                                            locationInputProxy
                                                        "
                                                        :disabled="
                                                            field.disabled
                                                        "
                                                        @focus="handleFocus"
                                                        @blur="
                                                            handleLocationInputCommit(
                                                                'blur'
                                                            )
                                                        "
                                                        @change="
                                                            handleLocationInputCommit(
                                                                'change'
                                                            )
                                                        "
                                                        @keydown.enter.prevent="
                                                            handleLocationInputCommit(
                                                                'enter'
                                                            )
                                                        "
                                                    />
                                                    <button
                                                        v-if="
                                                            hasValidArchiveLocationSelection
                                                        "
                                                        type="button"
                                                        class="location-clear-btn"
                                                        aria-label="Clear selected community"
                                                        @mousedown.prevent
                                                        @click.prevent="
                                                            clearArchiveLocationSelection
                                                        "
                                                    ></button>
                                                </div>
                                                <!-- Desktop: full datalist -->
                                                <datalist
                                                    v-if="!isMobile"
                                                    :id="`${field.key}List`"
                                                >
                                                    <option
                                                        v-for="opt in locationOptionsForInput"
                                                        :key="opt.slug"
                                                        :value="opt.name"
                                                    ></option>
                                                </datalist>
                                                <!-- Mobile: proxy datalist (top 10 only) -->
                                                <datalist
                                                    v-else
                                                    :id="`${field.key}ListMobile`"
                                                >
                                                    <option
                                                        v-if="
                                                            locationQueryIsEmpty
                                                        "
                                                        value="Please type to find your community"
                                                    ></option>
                                                    <option
                                                        v-else
                                                        v-for="opt in mobileLocationOptions"
                                                        :key="opt.slug"
                                                        :value="opt.name"
                                                    ></option>
                                                </datalist>
                                                <p
                                                    v-if="
                                                        field.error_desc &&
                                                        fieldErrors[field.key]
                                                    "
                                                    class="message error-message"
                                                    v-html="field.error_desc"
                                                    aria-live="polite"
                                                ></p>

                                                <figcaption
                                                    v-if="field.description"
                                                >
                                                    {{ field.description }}
                                                </figcaption>
                                                <figcaption
                                                    v-if="
                                                        field.filter_desc &&
                                                        !field.disabled
                                                    "
                                                >
                                                    {{ field.filter_desc }}
                                                </figcaption>
                                                <figcaption
                                                    v-if="
                                                        field.disabled_desc &&
                                                        field.disabled
                                                    "
                                                >
                                                    {{ field.disabled_desc }}
                                                </figcaption>
                                            </template>

                                            <!-- All other selects -->
                                            <template v-else>
                                                <select
                                                    :key="
                                                        field.key +
                                                        '-' +
                                                        (fieldRenderKeys[
                                                            field.key
                                                        ] ?? 0)
                                                    "
                                                    class="select"
                                                    :class="
                                                        fieldErrors[field.key]
                                                            ? 'error'
                                                            : ''
                                                    "
                                                    :id="`${field.key}Select`"
                                                    v-model="field.model.value"
                                                    :disabled="field.disabled"
                                                    @change="
                                                        handleSelectChange(
                                                            field.key,
                                                            $event.target.value
                                                        )
                                                    "
                                                    @keydown="
                                                        handleSelectKeydown(
                                                            $event,
                                                            field.key,
                                                            field.model.value
                                                        )
                                                    "
                                                    :ref="
                                                        (el) =>
                                                            (selectRefs[
                                                                field.key
                                                            ] = el)
                                                    "
                                                >
                                                    <option
                                                        disabled
                                                        :selected="
                                                            !field.model.value
                                                        "
                                                        data-default="Select an option"
                                                        value=""
                                                    >
                                                        Select an option
                                                    </option>

                                                    <!-- Grouped (building) -->
                                                    <template
                                                        v-if="field.isGrouped"
                                                    >
                                                        <template
                                                            v-for="group in field.groups"
                                                            :key="group.slug"
                                                        >
                                                            <optgroup
                                                                v-if="
                                                                    group.slug !==
                                                                    'other'
                                                                "
                                                                :label="
                                                                    group.name ===
                                                                    'MURB'
                                                                        ? 'Multi-unit residential buildings'
                                                                        : group.name
                                                                "
                                                            >
                                                                <option
                                                                    v-for="child in group.children"
                                                                    :key="
                                                                        child.slug
                                                                    "
                                                                    :value="
                                                                        child.slug
                                                                    "
                                                                >
                                                                    {{
                                                                        child.name
                                                                    }}
                                                                </option>
                                                            </optgroup>

                                                            <template v-else>
                                                                <option
                                                                    :key="
                                                                        group.slug
                                                                    "
                                                                    :value="
                                                                        group.slug
                                                                    "
                                                                >
                                                                    {{
                                                                        group.name
                                                                    }}
                                                                </option>
                                                            </template>
                                                        </template>
                                                    </template>

                                                    <!-- Flat (others) -->
                                                    <template v-else>
                                                        <option
                                                            v-for="opt in field.options"
                                                            :key="opt.slug"
                                                            :value="opt.slug"
                                                        >
                                                            {{ opt.name }}
                                                        </option>
                                                    </template>
                                                </select>

                                                <figcaption
                                                    v-if="field.description"
                                                >
                                                    {{ field.description }}
                                                </figcaption>
                                                <figcaption
                                                    v-if="
                                                        field.filter_desc &&
                                                        !field.disabled
                                                    "
                                                >
                                                    {{ field.filter_desc }}
                                                </figcaption>
                                                <figcaption
                                                    v-if="
                                                        field.disabled_desc &&
                                                        field.disabled
                                                    "
                                                >
                                                    {{ field.disabled_desc }}
                                                </figcaption>
                                                <p
                                                    v-if="
                                                        field.error_desc &&
                                                        fieldErrors[field.key]
                                                    "
                                                    class="message error-message"
                                                    aria-live="polite"
                                                    v-html="field.error_desc"
                                                ></p>

                                                <template
                                                    v-if="
                                                        field.key === 'building'
                                                    "
                                                >
                                                    <div
                                                        class="eligible-homes-insertion"
                                                    ></div>
                                                </template>
                                            </template>
                                        </figure>
                                    </div>
                                </template>
                            </template>
                        </div>
                        <div v-if="hasAnySelection" class="clear-msg">
                            <a href="#clear" @click.prevent="clearSettings"
                                >Clear settings</a
                            >
                            to start over
                        </div>
                        <div v-else class="clear-msg">
                            Please answer the form questions to see possible
                            rebates.
                        </div>
                    </template>
                </div>

                <!-- Results -->
                <template v-if="mode === 'archive'">
                    <!-- Show results -->
                    <section
                        v-if="hasAllSelection && filteredResults.length"
                        id="rebatesResults"
                        aria-label="Rebate results"
                    >
                        <div class="results-message">
                            <div>
                                <h2>Congratulations!</h2>
                                <p>
                                    You might be eligible for these rebate
                                    offers:
                                </p>
                            </div>
                            <div id="grid-or-list-container">
                                <input
                                    id="grid-or-list"
                                    type="checkbox"
                                    v-model="displayGridOrList"
                                    class="sr-only"
                                    :aria-label="
                                        displayGridOrList
                                            ? 'Switch to list view'
                                            : 'Switch to grid view'
                                    "
                                    @change="onViewToggleChange"
                                    @keydown.enter.prevent="
                                        toggleViewWithKeyboard
                                    "
                                />
                                <label for="grid-or-list" class="toggle-label">
                                    <span class="sr-only">
                                        {{
                                            displayGridOrList
                                                ? 'Switch to list view'
                                                : 'Switch to grid view'
                                        }}
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div
                            class="results"
                            :class="
                                displayGridOrList ? 'grid-view' : 'list-view'
                            "
                        >
                            <template
                                v-for="(item, index) in filteredResults"
                                :key="item.id"
                            >
                                <article
                                    class="rebate-card"
                                    :class="item.rebate_type_class"
                                >
                                    <a
                                        :href="
                                            withQueryString(
                                                item.post_url ?? item.url ?? '#'
                                            )
                                        "
                                        style="position: relative"
                                        :aria-label="
                                            item.rebate_type_headline_card
                                        "
                                    >
                                        <div class="card-meta">
                                            <div
                                                v-if="
                                                    false &&
                                                    item.rebate_value_card
                                                "
                                                class="rebate-value"
                                                aria-hidden="true"
                                            >
                                                {{ item.rebate_value_card }}
                                            </div>

                                            <figure
                                                v-if="
                                                    item.rebate_featured_image
                                                "
                                                class="wp-block-image size-full"
                                            >
                                                <img
                                                    decoding="async"
                                                    width="1024"
                                                    height="515"
                                                    data-print-width="25"
                                                    :src="
                                                        item.rebate_featured_image
                                                    "
                                                    alt=""
                                                    title=""
                                                />
                                            </figure>

                                            <div
                                                v-if="
                                                    false &&
                                                    item.rebate_description_card
                                                "
                                                class="rebate-icons"
                                                aria-label="Rebate available"
                                            >
                                                <div
                                                    v-for="(
                                                        ht, i
                                                    ) in item.heating_types"
                                                    :key="ht.id || i"
                                                    :class="[
                                                        'rebate-icon',
                                                        ht.slug,
                                                    ]"
                                                    :title="`For homes fueled by ${ht.name}`"
                                                    :aria-label="`For homes fueled by ${ht.name}`"
                                                ></div>
                                            </div>
                                        </div>

                                        <div class="rebate-details-container">
                                            <header>
                                                <h3 class="rebate-title">
                                                    <div>
                                                        {{
                                                            item.rebate_type_headline_card
                                                        }}
                                                    </div>
                                                    <small
                                                        v-if="
                                                            !item.rebate_type_headline_card.includes(
                                                                'Insulation'
                                                            ) &&
                                                            !item.rebate_type_headline_card.includes(
                                                                'Window'
                                                            )
                                                        "
                                                        >{{ item.title }}</small
                                                    >
                                                </h3>
                                            </header>

                                            <div class="rebate-details">
                                                <div
                                                    v-if="
                                                        item.rebate_value_card
                                                    "
                                                    class="sr-only"
                                                >
                                                    <div>
                                                        {{
                                                            item.rebate_value_card
                                                        }}
                                                    </div>
                                                </div>

                                                <div
                                                    v-if="
                                                        item.rebate_description_card
                                                    "
                                                    class="rebate-description"
                                                >
                                                    <div>
                                                        {{
                                                            item.rebate_description_card
                                                        }}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                </article>

                                <!-- Info card appears AFTER the first heat pump rebate -->
                                <div
                                    v-if="
                                        false &&
                                        showHeatPumpInfo &&
                                        (item.rebate_type_class ===
                                            'heat-pump-rebates' ||
                                            item.rebate_type_class ===
                                                'heat-pump-water-heater-rebates') &&
                                        index === firstHeatPumpIndex
                                    "
                                    class="info-card"
                                >
                                    <div class="info-card-content">
                                        <h3>What is a heat pump?</h3>
                                        <p>
                                            A heat pump is an efficient heating
                                            and cooling system that uses
                                            electricity to move heat from one
                                            place to another. In the winter, a
                                            heat pump transfers heat from the
                                            outside air to the indoors through a
                                            cycle of compression and expansion
                                            of a refrigerant. In the summer, it
                                            operates in reverse and heat from
                                            inside your home to the outdoors,
                                            like an air conditioner.
                                        </p>
                                    </div>
                                    <figure class="wp-block-image size-full">
                                        <img
                                            decoding="async"
                                            width="1889"
                                            height="1259"
                                            data-print-width="25"
                                            src="https://www.betterhomesbc.ca/app/uploads/sites/956/2025/10/heat-pump-info-card.jpg"
                                            alt=""
                                            title=""
                                        />
                                    </figure>
                                </div>
                            </template>
                        </div>
                        <p v-if="!filteredResults.length" class="no-results">
                            No rebates match your current selections ({{
                                espTier
                            }}).
                        </p>
                    </section>

                    <!-- No results -->
                    <section
                        v-if="hasAllSelection && !filteredResults.length"
                        class="not-eligible"
                    >
                        <div class="not-eligible-insertion"></div>
                    </section>

                    <!-- Complete for for results -->
                    <p v-if="!hasAllSelection" class="no-results loader">
                        Please complete the questionnaire form to see your
                        rebate options.
                    </p>
                </template>

                <!-- Selection summary (for quick verification) -->
                <div v-if="debug" class="selection-summary" aria-live="polite">
                    <p>
                        <strong>Debug information: </strong>
                        <span v-if="!hasAnySelection">No selections</span><br />
                        <span v-if="espTier"
                            ><strong>Derived value (ESP tier):</strong>
                            {{ espTier }}</span
                        >
                    </p>

                    <!-- Query string + Copy link -->
                    <div class="link-tools">
                        <code class="assembled-url">{{
                            assembledQueryString
                        }}</code>
                        <button
                            type="button"
                            class="copy-link"
                            @click="addLinkToClipboard"
                        >
                            Copy link
                        </button>
                        <span class="copy-message" aria-live="polite"></span>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
// See vNextRebateVueApp.docs.js for full JSDoc reference.
import {
    computed,
    ref,
    nextTick,
    onMounted,
    onBeforeUnmount,
    watch,
    watchEffect,
} from 'vue';
import {
    isHeatPumpRebatePage,
    isGroundOrientedHeatPumpIneligible,
    isHeatPumpWaterHeaterRebatePage,
    shouldForceElectricHpError,
    shouldForceElectricHpwhError,
    shouldValidateRoomHeatingField,
    shouldValidateWaterHeatingField,
} from './singleModeEligibility';
import { getRestoredBuildingTypeSlug } from './buildingTypeSelection';

/** Public domain fallback */
const publicDomain = ref('https://www.betterhomesbc.ca');

/** API endpoint */
const rebatesAPI = `${window.site?.domain ? window.site.domain : publicDomain.value}/wp-json/custom/v2/rebates`;

const debug = false;

function runOptionalGlobal(functionName) {
    const candidate = globalThis?.[functionName];

    if (typeof candidate === 'function') {
        candidate();
    }
}

const initialSourceParam = (() => {
    if (typeof window === 'undefined') return '';
    try {
        return String(
            new URLSearchParams(window.location.search).get('source') || ''
        )
            .trim()
            .toLowerCase();
    } catch (e) {
        return '';
    }
})();

// Local state for fetched API payload.
const api = ref({
    'settings-selects': {
        'building-types': [],
        'home-value': [],
        'income-bands': [],
        locations: [],
        utilities: [],
    },
    results: [],
});

const isLoading = ref(true);
const loadError = ref('');
const isSingleModeTitleAwaitingAjax = ref(false);

/**
 * Set the state of the results. Allow for retrieval from localStorage.
 * true = grid view, false = list view.
 */

const displayGridOrList = ref(true);
const STORAGE_KEY = 'displayGridOrList';
const PREFERRED_SETTINGS_KEY = 'preferredSettings';
const REBATE_TOOL_SETTINGS_KEY = 'rebateToolSettings';
const ASSISTIVE_SIMPLE_MODE_KEY = 'rebateAssistiveSimpleMode';
const SINGLE_MODE_TITLE_PENDING_CLASS = 'vnext-single-mode-title-pending';
const SINGLE_MODE_TITLE_TRANSITION_MS = 300;
const viewPreferenceLoaded = ref(false);
let singleModeTitleRevealFrame = 0;
let singleModeTitleSwapTimeout = 0;

if (typeof document !== 'undefined') {
    const initialAppMode =
        document.getElementById('vnextRebateFilterApp')?.dataset?.mode || '';
    if (initialAppMode === 'single') {
        document.documentElement.classList.add(SINGLE_MODE_TITLE_PENDING_CLASS);
    }
}

function persistDisplayViewPreference() {
    localStorage.setItem(STORAGE_KEY, String(displayGridOrList.value));
}

function onViewToggleChange() {
    persistDisplayViewPreference();
}

function toggleViewWithKeyboard() {
    displayGridOrList.value = !displayGridOrList.value;
    persistDisplayViewPreference();
}

function readPreferredSettings() {
    try {
        const raw = localStorage.getItem(PREFERRED_SETTINGS_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
        return {};
    }
}

function writePreferredSettings(partial) {
    try {
        const prev = readPreferredSettings();
        const next = {
            ...prev,
            ...partial,
            updated_at: new Date().toISOString(),
        };
        localStorage.setItem(PREFERRED_SETTINGS_KEY, JSON.stringify(next));
    } catch (e) {
        // no-op
    }
}

function readRebateToolSettings() {
    try {
        const raw = localStorage.getItem(REBATE_TOOL_SETTINGS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (e) {
        return null;
    }
}

/**
 * Hydrate preferredSettings from:
 * - current reactive state (selectedLocationSlug / selectedLocationName / espTier)
 * - and/or stored rebateToolSettings (location can be slug or name)
 *
 * This is safe to call repeatedly; it only writes when it can resolve a valid value.
 */
function hydratePreferredSettingsFromRebateToolSettings() {
    const saved = readRebateToolSettings();
    const preferred = readPreferredSettings();

    // --- LOCATION ---
    // Best source: current state if valid
    let locMatch =
        (selectedLocationSlug.value &&
            locationOptionsForInput.value.find(
                (l) => l.slug === selectedLocationSlug.value
            )) ||
        (selectedLocationName.value &&
            locationOptionsForInput.value.find(
                (l) => l.name === selectedLocationName.value
            )) ||
        null;

    // Fallback: rebateToolSettings (can be slug OR name in your implementation)
    if (!locMatch && saved?.location) {
        locMatch =
            locationOptionsForInput.value.find(
                (l) => l.slug === saved.location
            ) ||
            locationOptionsForInput.value.find(
                (l) => l.name === saved.location
            ) ||
            null;
    }

    // Only write location if we resolved a real option
    // (and optionally avoid rewriting if it’s unchanged)
    if (locMatch) {
        const nextSlug = locMatch.slug;
        const currentSlug = preferred?.location?.slug || '';
        if (nextSlug && nextSlug !== currentSlug) {
            writePreferredSettings({
                location: {
                    slug: locMatch.slug,
                    name: locMatch.name,
                    region: locMatch.children?.[0]?.name || '',
                    region_slug: locMatch.children?.[0]?.slug || '',
                },
            });
        }
    }

    // --- ESP TIER ---
    // If espTier is currently valid, store it.
    // This will become valid after initFromLocalStorage/query string restores enough fields.
    const tier = espTier.value;
    if (tier) {
        if (preferred?.esp_tier !== tier) {
            writePreferredSettings({ esp_tier: tier });
        }
    }
}

/**
 * Debounce a function so it runs only after a specified delay.
 */
function debounce(fn, delay = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

const singleModeDebugEnabled = computed(() => {
    if (typeof window === 'undefined') return false;
    try {
        const params = new URLSearchParams(window.location.search);
        return (
            params.get('single_mode_debug') === '1' ||
            window.localStorage.getItem('singleModeDebug') === '1'
        );
    } catch (e) {
        return false;
    }
});

function logSingleModeDebug(event, extra = {}) {
    if (!singleModeDebugEnabled.value) return;
    const payload = {
        event,
        mode: mode.value,
        isReadyToRender: isReadyToRender.value,
        hasInitialQuery: singleModeHasInitialQueryString.value,
        pageKind: singleModePageRebateKind.value,
        primaryFieldsComplete:
            singleModePrimaryFieldsCompleteForCurrentPage.value,
        currentPageInVerifiedResults:
            singleModeCurrentPageInVerifiedResults.value,
        queryInvalidOnLoad: singleModeQueryInvalidOnPageLoad.value,
        currentPath: currentPagePathname.value,
        alternateCount: singleModeAlternateRebateOptions.value.length,
        alternateHref: singleModeAlternateRebate.value?.href || '',
        selected: {
            buildingGroup: selectedBuildingGroupSlug.value,
            heating: selectedHeatingSlug.value,
            waterHeating: selectedWaterHeatingSlug.value,
        },
        ...extra,
    };
    console.groupCollapsed(`[single-mode-debug] ${event}`);
    console.table(payload);
    console.groupEnd();
}

const debouncedUpdateRebateDetails = debounce(updateRebateDetails, 500);
const isAjaxLoading = ref(false);

function getAjaxStyleSignature(node) {
    if (!(node instanceof Element)) return '';

    if (node.tagName === 'LINK') {
        const rel = String(node.getAttribute('rel') || '').toLowerCase();
        const href = String(node.getAttribute('href') || '').trim();
        if (!href) return '';
        return `link:${rel}:${href}`;
    }

    if (node.tagName === 'STYLE') {
        const id = String(node.getAttribute('id') || '').trim();
        if (id) return `style:id:${id}`;

        const media = String(node.getAttribute('media') || '').trim();
        const text = String(node.textContent || '').trim();
        if (!text) return '';
        return `style:inline:${media}:${text}`;
    }

    return '';
}

function syncFetchedDocumentStyles(doc) {
    if (!(doc instanceof Document)) return;

    const fetchedStyleNodes = [
        ...doc.querySelectorAll(
            'head style, head link[rel~="stylesheet"], body style, body link[rel~="stylesheet"]'
        ),
    ];

    if (!fetchedStyleNodes.length) return;

    const existingSignatures = new Set(
        [
            ...document.querySelectorAll(
                'head style, head link[rel~="stylesheet"], body style, body link[rel~="stylesheet"]'
            ),
        ]
            .map(getAjaxStyleSignature)
            .filter(Boolean)
    );

    for (const styleNode of fetchedStyleNodes) {
        const signature = getAjaxStyleSignature(styleNode);
        if (!signature || existingSignatures.has(signature)) continue;

        const clone = styleNode.cloneNode(true);
        document.head.appendChild(clone);
        existingSignatures.add(signature);
    }
}

/**
 * Fetch and replace the rebate details section asynchronously.
 */
async function updateRebateDetails() {
    const targetSelector = '#rebate-details-container';
    const container = document.querySelector(targetSelector);
    if (!container) return;
    let didSyncTitleAfterRefresh = false;
    const titleEl = document.querySelector('.subtitle');
    const nextTitleTarget = titleEl
        ? getSingleModeHeatingTitleTarget(titleEl)
        : null;
    const currentTitleSignature =
        titleEl?.dataset?.singleModeTitleSignature || '';
    const shouldAnimateTitleSwap =
        mode.value === 'single' &&
        Boolean(nextTitleTarget?.signature) &&
        Boolean(currentTitleSignature) &&
        currentTitleSignature !== nextTitleTarget.signature;

    try {
        if (shouldAnimateTitleSwap) {
            setSingleModeHeatingTitleVisibility(false);
        }
        isAjaxLoading.value = true;
        const res = await fetch(assembledUrl.value, {
            credentials: 'same-origin',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const newContent = doc.querySelector(targetSelector);

        if (newContent) {
            syncFetchedDocumentStyles(doc);
            container.innerHTML = newContent.innerHTML;

            container.querySelectorAll('script').forEach((oldScript) => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    newScript.textContent = oldScript.textContent;
                }
                document.body.appendChild(newScript);
                document.body.removeChild(newScript);
            });

            window.history.replaceState(null, '', assembledUrl.value);
            syncCurrentQueryStringFromWindow();

            // After DOM swap, clear external dirty + selection markers.
            isExternalDirty.value = false;
            isSavingEditMode.value = false;
            lastChangedField.value = '';
            rerenderScrollMenu();
            nextTick(() => runOptionalGlobal('cleanbcdxBhTablesPattern'));
            nextTick(() => runOptionalGlobal('cleanbcdxBhDefinitions'));
            nextTick(() =>
                runOptionalGlobal('cleanbcdxBhRebatesArchiveLoader')
            );
            nextTick(() =>
                runOptionalGlobal('betterhomesRebatesExternalLinkCheck')
            );
            nextTick(() => runOptionalGlobal('cleanbcdxBhAccessibility'));
            isSingleModeTitleAwaitingAjax.value = false;
            nextTick(() => queueHeatingTitleUpdate());
            didSyncTitleAfterRefresh = true;
        }
    } catch (err) {
        console.error('Failed to update rebate details via AJAX:', err);
        isSingleModeTitleAwaitingAjax.value = false;
        nextTick(() => queueHeatingTitleUpdate());
        didSyncTitleAfterRefresh = true;
    } finally {
        if (!didSyncTitleAfterRefresh) {
            isSingleModeTitleAwaitingAjax.value = false;
            nextTick(() => queueHeatingTitleUpdate());
        }
        isAjaxLoading.value = false;
    }
}

/**
 * Reset the external links icons.
 */
const betterhomesRebatesExternalLinkCheck = () => {
    /**
     * Set up external icons for links.
     */

    if ('1' === window.site.externalLinkIcons) {
        const links = document.querySelectorAll('.post-content a');

        if (links) {
            links.forEach((link) => {
                const href = link.getAttribute('href');

                if (null !== href) {
                    // Check if the link is an anchor link or a relative link
                    if (
                        href.startsWith('#') ||
                        href.startsWith('/') ||
                        href.startsWith('./') ||
                        href.startsWith('../') ||
                        href.startsWith('?')
                    ) {
                        return;
                    }

                    // Get the current domain
                    const currentDomain = window.location.hostname;

                    // Extract the domain from the link's href
                    const linkDomain = href.match(
                        /^(?:https?:)?(?:\/\/)?([^\/\?]+)/i
                    )[1];

                    // Check if the domains don't match
                    if (linkDomain !== currentDomain) {
                        link.classList.add('external');

                        const svg = document.createElementNS(
                            'http://www.w3.org/2000/svg',
                            'svg'
                        );
                        svg.setAttribute('class', 'external-link-icon');
                        svg.setAttribute('version', '1.1');
                        svg.setAttribute('id', 'Layer_1');
                        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        svg.setAttribute(
                            'xmlns:xlink',
                            'http://www.w3.org/1999/xlink'
                        );
                        svg.setAttribute('x', '0px');
                        svg.setAttribute('y', '0px');
                        svg.setAttribute('viewBox', '0 0 18 18');
                        svg.setAttribute(
                            'style',
                            'enable-background:new 0 0 18 18;'
                        );
                        svg.setAttribute('xml:space', 'preserve');
                        svg.innerHTML =
                            '<path class="st0" d="M9.7,3.9c0-0.1-0.1-0.3-0.2-0.4C9.4,3.4,9.3,3.4,9.2,3.4H1.7c-0.4,0-0.9,0.2-1.2,0.5C0.2,4.2,0,4.6,0,5.1v11.2c0,0.4,0.2,0.9,0.5,1.2C0.8,17.8,1.2,18,1.7,18h11.2c0.4,0,0.9-0.2,1.2-0.5c0.3-0.3,0.5-0.7,0.5-1.2V8.8c0-0.1-0.1-0.3-0.2-0.4 c-0.1-0.1-0.2-0.2-0.4-0.2c-0.1,0-0.3,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.2,0.4v7.5c0,0.1-0.1,0.3-0.2,0.4c-0.1,0.1-0.2,0.2-0.4,0.2 H1.7c-0.1,0-0.3-0.1-0.4-0.2c-0.1-0.1-0.2-0.2-0.2-0.4V5.1c0-0.1,0.1-0.3,0.2-0.4c0.1-0.1,0.2-0.2,0.4-0.2h7.5 c0.1,0,0.3-0.1,0.4-0.2C9.7,4.2,9.7,4.1,9.7,3.9z"/><path class="st0" d="M18,0.6c0-0.1-0.1-0.3-0.2-0.4C17.7,0.1,17.6,0,17.4,0h-5.6c-0.1,0-0.3,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.2,0.4 s0.1,0.3,0.2,0.4c0.1,0.1,0.2,0.2,0.4,0.2h4.3l-9.2,9.2c-0.1,0.1-0.1,0.1-0.1,0.2c0,0.1,0,0.1,0,0.2s0,0.1,0,0.2c0,0.1,0.1,0.1,0.1,0.2C7,11.1,7,11.2,7.1,11.2c0.1,0,0.1,0,0.2,0c0.1,0,0.1,0,0.2,0s0.1-0.1,0.2-0.1l9.2-9.2v4.3c0,0.1,0.1,0.3,0.2,0.4c0.1,0.1,0.2,0.2,0.4,0.2c0.1,0,0.3-0.1,0.4-0.2C17.9,6.5,18,6.3,18,6.2V0.6z"/>';

                        const computedStyle = window.getComputedStyle(link);
                        const fontSize = computedStyle.fontSize;

                        // Set the font size for the SVG
                        svg.style.width = fontSize;
                        svg.style.height = fontSize;

                        link.appendChild(svg);
                    }
                }
            });
        }
    }
};

/**
 * Rebuild the scroll menu (#incentive-side-nav) from H2 headings inside #incentive-details-container.
 */
function rerenderScrollMenu() {
    const detailsContainer = document.querySelector(
        '#incentive-details-container'
    );
    const sideNav = document.querySelector('#incentive-side-nav');
    if (!detailsContainer || !sideNav) return;

    // Clear the existing content of #incentive-side-nav.
    sideNav.innerHTML = '';

    // Find all H2 elements inside the #incentive-details-container.
    const headings = detailsContainer.querySelectorAll('h2[id]');

    // Create a new list for navigation.
    const navListContainer = document.createElement('nav');
    navListContainer.classList.add(
        'side-nav',
        'bb-nav',
        'wp-block-navigation',
        'is-vertical',
        'wp-container-core-navigation-layout-2'
    );

    const navList = document.createElement('ul');
    navList.classList.add(
        'side-nav',
        'bb-nav',
        'wp-block-navigation',
        'is-vertical',
        'wp-block-navigation__container'
    );

    // Loop through the H2 elements to create links.
    headings.forEach((heading) => {
        const id = heading.id;
        const text = heading.textContent.trim();

        // Create a list item.
        const listItem = document.createElement('li');
        listItem.classList.add(
            'wp-block-navigation-item',
            'wp-block-navigation-link'
        );

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
}

// Editable state
const editable = ref(false);
const activeEdit = ref('');
const labelsVisible = ref(true);
const showReadOnlyFields = ref(true);
const showEditModeUI = ref(false);
const editModeView = ref(false);
const singleModeEditModePreference = ref(false);
const isCollapseView = ref(true);
const isSavingEditMode = ref(false);
const hasError = ref(false);
const ariaStatusMessage = ref('');
const hasArchiveAutoScrolledToResults = ref(false);
const pageHeatingType = ref('');
const pageHeatingTypes = ref([]);
const pageWaterHeatingType = ref('');
const pageWaterHeatingTypes = ref([]);
const pageBuildingGroup = ref('');
const pageRebateType = ref('');
// -- Mode (archive|single) --
const mode = ref('archive');
const heatPumpWaterHeaterRebateSlug = 'heat-pump-water-heater-rebates';
const heatPumpRebateSlug = 'heat-pump-rebates';
const singleModeRebateTypeClass = ref('');
const isReadyToRender = ref(false);
const singleModeDialogRef = ref(null);
const singleModeDialogHeadingRef = ref(null);
const singleModeDialogVariant = ref('');
const isSingleModeDialogOpen = ref(false);
const singleModeDialogLastFocusedEl = ref(null);
const collapseButtonRef = ref(null);
const resetSimplifiedButtonRef = ref(null);
const singleModeSettingsContextMessage = ref('');
const assistiveSimpleMode = ref(false);
const singleModeHasInitialQueryString = ref(null);
const singleModePageLoadDialogHandled = ref(false);
const singleModePageLoadDialogChecking = ref(false);
const singleModeFirstFilterChangeChecking = ref(false);
const singleModePendingFilterChangeCheck = ref(false);
const singleModeQueuedChangeField = ref('');
const singleModeAlternateDialogChangeField = ref('');
const singleModeAlternateDialogSource = ref('');
const singleModeSourceParam = ref(initialSourceParam);
const singleModeOpenFromPlannerSource = computed(
    () => singleModeSourceParam.value === 'planner'
);

// Focus map for selects
const selectRefs = ref({});
const buttonRefs = ref({});
const lastChangedField = ref('');

// Force full re-render when the options list changes.
const fieldRenderKeys = ref({
    homeValue: 0,
    income: 0,
});

const isHpwhRebatePage = computed(() =>
    pageRebateType.value
        .toLowerCase()
        .includes('heat pump water heater rebates')
);

const normalizeHeatingSlug = (val) => {
    if (!val) return '';
    const v = val.toLowerCase().trim();
    if (v.includes('gas')) return 'gas';
    if (v.includes('oil')) return 'oil';
    if (v.includes('wood')) return 'wood';
    if (v.includes('electric')) return 'electricity';
    return v.replace(/\s+/g, '-'); // fallback.
};

const extractHeatingTokens = (val) => {
    if (!val) return [];
    const v = String(val).toLowerCase();
    const tokens = [];
    if (v.includes('gas')) tokens.push('gas');
    if (v.includes('oil')) tokens.push('oil');
    if (v.includes('wood')) tokens.push('wood');
    if (v.includes('electric')) tokens.push('electricity');
    if (tokens.length > 0) return Array.from(new Set(tokens));
    return [normalizeHeatingSlug(val)];
};

const normalizeHeatingTitleKey = (value) => {
    const raw = String(value || '')
        .toLowerCase()
        .trim();
    if (!raw) return '';
    if (
        raw === 'electric-hpwh' ||
        raw.includes('electric heat pump water heater')
    )
        return 'electric-hpwh';
    if (raw === 'electric-hp' || raw.includes('electric heat pump'))
        return 'electric-hp';
    if (raw === 'other' || raw.includes('other') || raw.includes('unsure'))
        return 'other';
    if (raw.includes('gas') || raw.includes('propane')) return 'gas';
    if (raw.includes('oil')) return 'oil';
    if (raw.includes('wood')) return 'wood';
    if (raw.includes('electric')) return 'electricity';
    return raw.replace(/\s+/g, '-');
};

const extractHeatingTitleKeys = (value) => {
    if (!value) return [];

    const raw = String(value).toLowerCase();
    const tokens = [];
    if (raw.includes('electric heat pump water heater'))
        tokens.push('electric-hpwh');
    if (raw.includes('electric heat pump')) tokens.push('electric-hp');
    if (raw.includes('gas') || raw.includes('propane')) tokens.push('gas');
    if (raw.includes('oil')) tokens.push('oil');
    if (raw.includes('wood')) tokens.push('wood');
    if (raw.includes('other') || raw.includes('unsure')) tokens.push('other');
    if (
        raw.includes('electric') &&
        !raw.includes('electric heat pump') &&
        !raw.includes('electric heat pump water heater')
    ) {
        tokens.push('electricity');
    }

    if (tokens.length > 0) return Array.from(new Set(tokens));
    return [normalizeHeatingTitleKey(value)];
};

const resolvedPageWaterHeatingSources = computed(() => {
    if (
        Array.isArray(pageWaterHeatingTypes.value) &&
        pageWaterHeatingTypes.value.length > 0
    ) {
        return pageWaterHeatingTypes.value.filter(Boolean);
    }

    return String(pageWaterHeatingType.value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
});

const fieldErrors = computed(() => {
    const heatingOptionsSet = pageHeatingTypes.value.length > 0;
    const shouldValidateHeating = heatingOptionsSet && !isHpwhRebatePage.value;
    const shouldValidateWaterHeating =
        resolvedPageWaterHeatingSources.value.length > 0 &&
        isHpwhRebatePage.value;
    const shouldValidateBuildingGroup = !!pageBuildingGroup.value;
    const normalizedSelectedHeating = normalizeHeatingSlug(
        selectedHeatingSlug.value || selectedHeatingName.value
    );
    const normalizedSelectedWaterHeating = normalizeHeatingSlug(
        selectedWaterHeatingSlug.value || selectedWaterHeatingName.value
    );
    const allowedHeatingTypes = Array.isArray(pageHeatingTypes.value)
        ? pageHeatingTypes.value
              .flatMap((item) => extractHeatingTokens(item))
              .filter(Boolean)
        : [];
    const allowedWaterHeatingTypes = resolvedPageWaterHeatingSources.value
        .flatMap((item) => extractHeatingTokens(item))
        .filter(Boolean);
    const pageRebateWaterHeatingTokens = extractHeatingTokens(
        pageRebateType.value
    );
    const pagePathWaterHeatingTokens =
        typeof window !== 'undefined'
            ? extractHeatingTokens(window.location.pathname)
            : [];
    const resolvedWaterHeatingTypes = Array.from(
        new Set([
            ...allowedWaterHeatingTypes,
            ...pageRebateWaterHeatingTokens,
            ...pagePathWaterHeatingTokens,
        ])
    );
    const isSingleMode = mode.value === 'single';
    const pageRebateTypeText = String(pageRebateType.value || '').toLowerCase();
    const pageRebateClass = String(
        singleModeRebateTypeClass.value || ''
    ).toLowerCase();
    const isHeatPumpWaterHeaterPage = isHeatPumpWaterHeaterRebatePage({
        pageRebateClass,
        pageRebateTypeText,
        hpwhRebateSlug: heatPumpWaterHeaterRebateSlug,
    });
    const validateRoomHeatingField = shouldValidateRoomHeatingField({
        isSingleMode,
        isHeatPumpWaterHeaterRebatePage: isHeatPumpWaterHeaterPage,
    });
    const validateWaterHeatingField = shouldValidateWaterHeatingField({
        isSingleMode,
        isHeatPumpWaterHeaterRebatePage: isHeatPumpWaterHeaterPage,
    });
    const forceHeatingElectricHpError = shouldForceElectricHpError({
        isSingleMode,
        selectedHeatingSlug: selectedHeatingSlug.value,
        pageRebateClass,
        pageRebateTypeText,
    });
    const forceWaterElectricHpwhError = shouldForceElectricHpwhError({
        isSingleMode,
        selectedWaterHeatingSlug: selectedWaterHeatingSlug.value,
        pageRebateClass,
        pageRebateTypeText,
    });

    return {
        location:
            !isLocationFocused.value &&
            !isLocationValid.value &&
            !!locationInputValue.value,
        // murbTenure:
        //   false &&
        //   selectedBuildingGroupSlug.value === 'ground-oriented-dwellings' &&
        //   murbTenure.value === 'rent',
        building:
            selectedBuildingTypeSlug.value === 'other' ||
            (shouldValidateBuildingGroup &&
                !!selectedBuildingGroupSlug.value &&
                selectedBuildingGroupSlug.value !== pageBuildingGroup.value),
        heating:
            (validateRoomHeatingField &&
                selectedHeatingSlug.value === 'other') ||
            forceHeatingElectricHpError ||
            (shouldValidateHeating &&
                !!selectedHeatingSlug.value &&
                !allowedHeatingTypes.includes(normalizedSelectedHeating)),
        water:
            (validateWaterHeatingField &&
                selectedWaterHeatingSlug.value === 'other') ||
            forceWaterElectricHpwhError ||
            (shouldValidateWaterHeating &&
                !!selectedWaterHeatingSlug.value &&
                !resolvedWaterHeatingTypes.includes(
                    normalizedSelectedWaterHeating
                )),
        utility: selectedUtilitySlug.value === 'other',
        // gas: selectedGasSlug.value === 'other'
    };
});

const normalizeRebateLabel = (val) =>
    String(val || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();

const toSentenceCase = (val) => {
    const text = String(val || '').trim();
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
};

const toA11yText = (val) =>
    String(val || '')
        .replace(/\s+/g, ' ')
        .trim();

function getFieldErrorDescription(field) {
    if (!field?.error_desc) return '';

    if (
        mode.value === 'single' &&
        field.key === 'heating' &&
        selectedHeatingSlug.value === 'other'
    ) {
        return 'Only the listed heating types are currently eligible for Better Homes rebates. <strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> to find out if your heating type fits into one of these categories.';
    }

    if (
        mode.value === 'single' &&
        field.key === 'water' &&
        selectedWaterHeatingSlug.value === 'other'
    ) {
        return 'Only the listed water heating types are currently eligible for Better Homes rebates. <strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> to find out if your water heating type fits into one of these categories.';
    }

    return field.error_desc;
}

function getEditFieldButtonLabel(field) {
    const fieldName = toA11yText(field?.shortDesc || field?.label || 'setting');
    const value = toA11yText(field?.displayValue || '');
    if (!fieldName) return 'Edit setting';
    if (!value) return `Edit ${fieldName}`;
    return `Edit ${fieldName}. Current value: ${value}.`;
}

function isIneligibleInstalledHeatPumpSelection(fieldKey) {
    if (fieldKey === 'heating') {
        return selectedHeatingSlug.value === 'electric-hp';
    }

    if (fieldKey === 'water') {
        return selectedWaterHeatingSlug.value === 'electric-hpwh';
    }

    return false;
}

function getInstalledHeatPumpLabel(fieldKey) {
    if (fieldKey === 'water') {
        return 'heat pump water heater';
    }

    return 'heat pump';
}

const singleModePageEligible = computed(() => {
    if (mode.value !== 'single') return true;

    const pageClass = normalizeRebateLabel(singleModeRebateTypeClass.value);
    const pageType = normalizeRebateLabel(pageRebateType.value);

    if (!pageClass && !pageType) return true;

    return filteredResults.value.some((item) => {
        const itemClass = normalizeRebateLabel(item.rebate_type_class);
        const itemHeadline = normalizeRebateLabel(
            item.rebate_type_headline_card
        );
        const itemTitle = normalizeRebateLabel(item.title);

        if (pageClass && itemClass === pageClass) return true;
        if (
            pageType &&
            (itemHeadline.includes(pageType) || itemTitle.includes(pageType))
        ) {
            return true;
        }

        return false;
    });
});

const singleModePageRebateKind = computed(() => {
    const pageRebateClass = String(
        singleModeRebateTypeClass.value || ''
    ).toLowerCase();
    const pageRebateTypeText = String(pageRebateType.value || '').toLowerCase();
    const isHeatPumpWaterHeaterPage = isHeatPumpWaterHeaterRebatePage({
        pageRebateClass,
        pageRebateTypeText,
        hpwhRebateSlug: heatPumpWaterHeaterRebateSlug,
    });
    if (isHeatPumpWaterHeaterPage) return 'hpwh';

    const isHeatPumpPage = isHeatPumpRebatePage({
        pageRebateClass,
        pageRebateTypeText,
    });
    if (isHeatPumpPage) return 'hp';

    return '';
});

const normalizedSelectedRoomHeatingForAlternate = computed(() =>
    normalizeHeatingSlug(selectedHeatingSlug.value || selectedHeatingName.value)
);

const normalizedSelectedWaterHeatingForAlternate = computed(() =>
    normalizeHeatingSlug(
        selectedWaterHeatingSlug.value || selectedWaterHeatingName.value
    )
);

const normalizedSelectedBuildingGroupForAlternate = computed(() =>
    String(selectedBuildingGroupSlug.value || '')
        .toLowerCase()
        .trim()
);

const currentPagePathname = computed(() =>
    typeof window !== 'undefined' ? String(window.location.pathname || '') : ''
);

const currentPageRebateItem = computed(() => {
    const pagePath = currentPagePathname.value;
    if (!pagePath) return null;

    return (
        api.value.results.find((item) => {
            const rawUrl = item?.post_url ?? item?.url ?? '';
            if (!rawUrl) return false;
            try {
                const itemPath = new URL(rawUrl, window.location.origin)
                    .pathname;
                return itemPath === pagePath;
            } catch (e) {
                return false;
            }
        }) || null
    );
});

const currentPageAllowedTypeSlugsForAlternate = computed(() => {
    const fromDataset = String(pageBuildingGroup.value || '')
        .toLowerCase()
        .trim();
    if (fromDataset) return [fromDataset];

    const itemTypes = Array.isArray(currentPageRebateItem.value?.types)
        ? currentPageRebateItem.value.types
              .map((t) =>
                  String(t?.slug || '')
                      .toLowerCase()
                      .trim()
              )
              .filter(Boolean)
        : [];

    return itemTypes;
});

const currentPageTypeEligibleForAlternate = computed(() => {
    const pageGroups = currentPageAllowedTypeSlugsForAlternate.value;
    if (pageGroups.length === 0) return true;
    if (!normalizedSelectedBuildingGroupForAlternate.value) return false;
    return pageGroups.includes(
        normalizedSelectedBuildingGroupForAlternate.value
    );
});

const currentPageRoomHeatingEligibleForAlternate = computed(() => {
    const selected = normalizedSelectedRoomHeatingForAlternate.value;
    if (!selected) return false;

    const allowed = Array.isArray(pageHeatingTypes.value)
        ? pageHeatingTypes.value
              .flatMap((item) => extractHeatingTokens(item))
              .filter(Boolean)
        : [];
    if (allowed.length === 0) return true;
    return allowed.includes(selected);
});

const currentPageWaterHeatingEligibleForAlternate = computed(() => {
    const selected = normalizedSelectedWaterHeatingForAlternate.value;
    if (!selected) return false;

    const allowed = resolvedPageWaterHeatingSources.value
        .flatMap((item) => extractHeatingTokens(item))
        .filter(Boolean);
    if (allowed.length === 0) return true;
    return allowed.includes(selected);
});

const singleModeCurrentPageEligibleForPrimaryFields = computed(() => {
    if (mode.value !== 'single') return true;
    if (!currentPageTypeEligibleForAlternate.value) return false;
    if (singleModePageRebateKind.value === 'hp') {
        return currentPageRoomHeatingEligibleForAlternate.value;
    }
    if (singleModePageRebateKind.value === 'hpwh') {
        return currentPageWaterHeatingEligibleForAlternate.value;
    }
    return true;
});

const singleModePrimaryFieldsCompleteForCurrentPage = computed(() => {
    if (mode.value !== 'single') return false;
    if (!normalizedSelectedBuildingGroupForAlternate.value) return false;
    if (singleModePageRebateKind.value === 'hp') {
        return !!normalizedSelectedRoomHeatingForAlternate.value;
    }
    if (singleModePageRebateKind.value === 'hpwh') {
        return !!normalizedSelectedWaterHeatingForAlternate.value;
    }
    return false;
});

const singleModeAlternateRebateOptions = computed(() => {
    if (mode.value !== 'single') return [];
    if (singleModePageRebateKind.value === '') return [];

    const currentPath = currentPagePathname.value;
    const seen = new Set();

    // Use already-verified eligibility output and then pick same-type alternates only.
    return filteredResults.value.reduce((acc, item, index) => {
        const itemClass = normalizeRebateLabel(item.rebate_type_class);
        const isSameType =
            (singleModePageRebateKind.value === 'hp' &&
                itemClass === heatPumpRebateSlug) ||
            (singleModePageRebateKind.value === 'hpwh' &&
                itemClass === heatPumpWaterHeaterRebateSlug);
        if (!isSameType) return acc;

        const rawUrl = item.post_url ?? item.url ?? '';
        if (!rawUrl) return acc;

        let normalizedPath = '';
        try {
            const urlObj = new URL(rawUrl, window.location.origin);
            normalizedPath = urlObj.pathname;
        } catch (e) {
            // fallback: skip path normalization
        }

        if (normalizedPath && normalizedPath === currentPath) return acc;
        if (seen.has(rawUrl)) return acc;

        const headline =
            item.rebate_type_headline_card || item.title || 'Rebate page';
        const subtitle =
            item.rebate_type_headline_card &&
            !item.rebate_type_headline_card.includes('Insulation') &&
            !item.rebate_type_headline_card.includes('Window')
                ? item.title
                : '';

        const combinedRaw = subtitle
            ? `${headline} ${subtitle.toLowerCase()}`
            : headline;

        acc.push({
            key: item.id ?? `${index}-${rawUrl}`,
            href: withQueryString(rawUrl, { state: 'valid' }),
            combinedSentence: toSentenceCase(combinedRaw),
        });
        seen.add(rawUrl);
        return acc;
    }, []);
});

const singleModeCurrentPageInVerifiedResults = computed(() => {
    const currentPath = currentPagePathname.value;
    if (!currentPath) return false;

    return filteredResults.value.some((item) => {
        const rawUrl = item.post_url ?? item.url ?? '';
        if (!rawUrl) return false;
        try {
            const itemPath = new URL(rawUrl, window.location.origin).pathname;
            return itemPath === currentPath;
        } catch (e) {
            return false;
        }
    });
});

const singleModeCurrentPageMismatchField = computed(() => {
    if (mode.value !== 'single') return '';
    if (!singleModePrimaryFieldsCompleteForCurrentPage.value) return '';
    if (singleModeCurrentPageInVerifiedResults.value) return '';

    if (!currentPageTypeEligibleForAlternate.value) {
        return 'building';
    }

    if (singleModePageRebateKind.value === 'hp') {
        return currentPageRoomHeatingEligibleForAlternate.value
            ? ''
            : 'heating';
    }

    if (singleModePageRebateKind.value === 'hpwh') {
        return currentPageWaterHeatingEligibleForAlternate.value ? '' : 'water';
    }

    return '';
});

const singleModeQueryInvalidOnPageLoad = computed(() => {
    if (mode.value !== 'single') return false;
    if (singleModeHasInitialQueryString.value === null) return false;
    if (!singleModeHasInitialQueryString.value) return false;
    if (!hasAllSelection.value) return false;
    if (!singleModePrimaryFieldsCompleteForCurrentPage.value) return false;
    return !singleModeCurrentPageInVerifiedResults.value;
});

const singleModeAlternateRebate = computed(() =>
    singleModeAlternateRebateOptions.value.length > 0
        ? singleModeAlternateRebateOptions.value[0]
        : null
);

const singleModeShouldSuppressInvalidQueryModal = computed(
    () => mode.value === 'single' && Boolean(currentPageRebateItem.value)
);

const singleModeDialogTitle = computed(() => {
    if (singleModeDialogVariant.value === 'alternate-rebate') {
        const field = singleModeAlternateDialogChangeField.value;
        const label =
            field === 'building'
                ? 'home'
                : field === 'water'
                  ? 'water heating'
                  : field === 'heating'
                    ? 'heating'
                    : 'home';
        if (singleModeAlternateDialogSource.value === 'load-mismatch') {
            return `This isn't your ${label} type`;
        }
        if (singleModeAlternateDialogSource.value !== 'change') {
            return 'You aren’t eligible for these rebates';
        }
        return `You changed the ${label} type`;
    }
    return 'Your home details don’t match this rebate';
});

const singleModeDialogDescription = computed(() => {
    if (singleModeDialogVariant.value === 'alternate-rebate') {
        if (singleModeAlternateDialogSource.value === 'load-mismatch') {
            const field = singleModeAlternateDialogChangeField.value;
            const label =
                field === 'building'
                    ? 'home'
                    : field === 'water'
                      ? 'water heating'
                      : field === 'heating'
                        ? 'heating'
                        : 'home';
            return `This rebate is for a different ${label} type than the one in your details.`;
        }
        if (singleModeAlternateDialogSource.value === 'change') {
            const pageTitle =
                String(
                    currentPageRebateItem.value?.title ||
                        pageRebateType.value ||
                        ''
                )
                    .trim()
                    .toLowerCase() || 'this rebate page';
            return `Rebates are organized by home and heating type. This rebate is for ${pageTitle}.`;
        }
        return 'Rebates are organized by heating and home type.';
    }
    return 'Rebates are organized by home and heating type.';
});

const singleModeAlternateButtonLabel = computed(() => {
    if (singleModeAlternateDialogSource.value === 'load-mismatch') {
        const field = singleModeAlternateDialogChangeField.value;
        const label =
            field === 'building'
                ? 'home'
                : field === 'water'
                  ? 'water heating'
                  : field === 'heating'
                    ? 'heating'
                    : 'home';
        return `See rebates for your ${label} type`;
    }
    if (singleModeAlternateDialogSource.value !== 'change') {
        return 'Continue to an eligble rebate';
    }
    const field = singleModeAlternateDialogChangeField.value;
    const label =
        field === 'building'
            ? 'home'
            : field === 'water'
              ? 'water heating'
              : field === 'heating'
                ? 'heating'
                : 'home';
    return `Go to the rebate for the new ${label} type`;
});

const isChangeTriggeredAlternateModal = computed(
    () =>
        singleModeDialogVariant.value === 'alternate-rebate' &&
        singleModeAlternateDialogSource.value === 'change'
);

const hasAnyError = computed(() => {
    const hasFieldError = Object.values(fieldErrors.value).some(Boolean);
    const hasNoResults =
        hasAllSelection.value && 0 === filteredResults.value.length;

    return hasFieldError || hasNoResults;
});

function setSingleModeDialogScrollLock(isLocked) {
    const html = document.documentElement;
    const body = document.body;

    if (!html || !body) return;

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
}

function openSingleModeDialog() {
    const dialog = singleModeDialogRef.value;
    if (!dialog || dialog.open) return false;
    try {
        const activeEl = document.activeElement;
        singleModeDialogLastFocusedEl.value =
            activeEl instanceof HTMLElement ? activeEl : null;
        setSingleModeDialogScrollLock(true);
        dialog.showModal();
        isSingleModeDialogOpen.value = true;
        nextTick(() => {
            singleModeDialogHeadingRef.value?.focus?.();
        });
        return true;
    } catch (e) {
        // no-op.
        setSingleModeDialogScrollLock(false);
        isSingleModeDialogOpen.value = false;
        return false;
    }
}

function openSingleModeDialogVariant(variant) {
    if (!variant) return;
    if (mode.value === 'single' && !hasAllSelection.value) {
        logSingleModeDebug('dialog-open-blocked:form-incomplete', { variant });
        return;
    }
    const dialog = singleModeDialogRef.value;
    if (dialog?.open) return;
    if (variant !== 'alternate-rebate') {
        singleModeAlternateDialogChangeField.value = '';
        singleModeAlternateDialogSource.value = '';
    }
    singleModeDialogVariant.value = variant;
    nextTick(() => {
        openSingleModeDialog();
    });
}

function closeSingleModeDialog(e) {
    e?.preventDefault?.();
    const dialog = singleModeDialogRef.value;
    if (dialog?.open) {
        dialog.close();
    }
}

function handleSingleModeDialogBackdropClick(e) {
    const dialog = singleModeDialogRef.value;
    if (!dialog || !dialog.open) return;

    const rect = dialog.getBoundingClientRect();
    const isInsideDialogBounds =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

    if (!isInsideDialogBounds) {
        closeSingleModeDialog();
    }
}

function handleSingleModeDialogClosed() {
    setSingleModeDialogScrollLock(false);
    isSingleModeDialogOpen.value = false;
    singleModeAlternateDialogChangeField.value = '';
    singleModeAlternateDialogSource.value = '';
    const previouslyFocused = singleModeDialogLastFocusedEl.value;
    nextTick(() => {
        if (
            previouslyFocused &&
            previouslyFocused instanceof HTMLElement &&
            previouslyFocused.isConnected &&
            typeof previouslyFocused.focus === 'function'
        ) {
            previouslyFocused.focus({ preventScroll: true });
            singleModeDialogLastFocusedEl.value = null;
            return;
        }

        const fallback = collapseButtonRef.value;
        if (fallback && typeof fallback.focus === 'function') {
            fallback.focus({ preventScroll: true });
        }
        singleModeDialogLastFocusedEl.value = null;
    });
}

async function maybeOpenSingleModeInvalidQueryDialogOnLoad() {
    logSingleModeDebug('load-check:start');
    if (mode.value !== 'single') return;
    if (singleModePageLoadDialogHandled.value) return;
    if (singleModePageLoadDialogChecking.value) return;
    if (!isReadyToRender.value) return;
    if (singleModeHasInitialQueryString.value === null) {
        logSingleModeDebug('load-check:exit-query-unresolved');
        return;
    }
    if (!singleModeHasInitialQueryString.value) {
        singleModePageLoadDialogHandled.value = true;
        logSingleModeDebug('load-check:exit-no-query');
        return;
    }
    if (!hasAllSelection.value) {
        logSingleModeDebug('load-check:exit-form-incomplete');
        return;
    }
    if (!singleModePrimaryFieldsCompleteForCurrentPage.value) {
        logSingleModeDebug('load-check:exit-primary-incomplete');
        return;
    }

    singleModePageLoadDialogChecking.value = true;
    await nextTick();
    await nextTick();

    singleModePageLoadDialogChecking.value = false;
    singleModePageLoadDialogHandled.value = true;
    if (!singleModeQueryInvalidOnPageLoad.value) {
        logSingleModeDebug('load-check:exit-not-invalid');
        return;
    }

    // On page load, if we can identify a same-type eligible alternate, use that branch.
    if (singleModeAlternateRebate.value) {
        const mismatchField = singleModeCurrentPageMismatchField.value;
        if (mismatchField) {
            singleModeAlternateDialogSource.value = 'load-mismatch';
            singleModeAlternateDialogChangeField.value = mismatchField;
        } else {
            singleModeAlternateDialogSource.value = 'load';
            singleModeAlternateDialogChangeField.value = '';
        }
        logSingleModeDebug('load-check:open-alternate-modal');
        openSingleModeDialogVariant('alternate-rebate');
        return;
    }

    if (singleModeShouldSuppressInvalidQueryModal.value) {
        logSingleModeDebug('load-check:skip-invalid-modal-on-target-page');
        return;
    }

    logSingleModeDebug('load-check:open-invalid-modal');
    openSingleModeDialogVariant('invalid-query');
}

async function maybeOpenSingleModeAlternateRebateDialog(changeField = '') {
    logSingleModeDebug('first-change-check:start');
    if (mode.value !== 'single') return;

    if (changeField) {
        singleModeQueuedChangeField.value = changeField;
    }

    if (singleModeFirstFilterChangeChecking.value) {
        singleModePendingFilterChangeCheck.value = true;
        return;
    }

    singleModeFirstFilterChangeChecking.value = true;
    do {
        singleModePendingFilterChangeCheck.value = false;
        const dialogChangeField =
            singleModeQueuedChangeField.value || changeField;
        singleModeQueuedChangeField.value = '';

        // Ensure computed eligibility/results are based on the latest edited field value.
        await nextTick();
        await nextTick();

        if (!hasAllSelection.value) {
            logSingleModeDebug('first-change-check:exit-form-incomplete');
            continue;
        }
        if (singleModeCurrentPageInVerifiedResults.value) {
            logSingleModeDebug('first-change-check:exit-current-page-valid');
            continue;
        }
        if (!singleModeAlternateRebate.value) {
            if (singleModeShouldSuppressInvalidQueryModal.value) {
                logSingleModeDebug(
                    'first-change-check:skip-invalid-modal-on-target-page'
                );
                continue;
            }
            logSingleModeDebug(
                'first-change-check:open-invalid-modal-no-alternate'
            );
            singleModeAlternateDialogSource.value = 'change';
            singleModeAlternateDialogChangeField.value = dialogChangeField;
            openSingleModeDialogVariant('invalid-query');
            continue;
        }

        logSingleModeDebug('first-change-check:open-alternate-modal');
        singleModeAlternateDialogSource.value = 'change';
        singleModeAlternateDialogChangeField.value = dialogChangeField;
        openSingleModeDialogVariant('alternate-rebate');
    } while (singleModePendingFilterChangeCheck.value);

    singleModeFirstFilterChangeChecking.value = false;
}

const singleModeDialogFieldByStateKey = {
    type: 'building',
    group: 'building',
    tenure: 'building',
    home_value: 'homeValue',
    persons: 'persons',
    income: 'income',
    location: 'location',
    heating: 'heating',
    water_heating: 'water',
    utility: 'utility',
    gas: 'gas',
};

function getSingleModeChangedField(currentState = {}, previousState = {}) {
    for (const key of Object.keys(singleModeDialogFieldByStateKey)) {
        if (currentState[key] !== previousState[key]) {
            return singleModeDialogFieldByStateKey[key];
        }
    }

    return '';
}

/**
 * Toggle visibility of field labels.
 */
function toggleLabels() {
    labelsVisible.value = !labelsVisible.value;
    localStorage.setItem(
        'rebateLabelsVisible',
        JSON.stringify(labelsVisible.value)
    );
}

/**
 * Open a specific field for editing.
 */
function openEdit(field, event) {
    editable.value = true;
    activeEdit.value = field;
    const trigger = event?.currentTarget;
    if (trigger instanceof HTMLElement && typeof trigger.blur === 'function') {
        trigger.blur();
    }
    focusSingleModeSelectForField(field);
}

/**
 * Close a specific field edit state and restore focus to its trigger button.
 */
function closeEdit(fieldKey = activeEdit.value) {
    const keyToFocus = fieldKey || activeEdit.value;
    activeEdit.value = '';

    if (!keyToFocus) return;

    nextTick(() => {
        const controlButton = buttonRefs.value[keyToFocus];
        if (controlButton && typeof controlButton.focus === 'function') {
            controlButton.focus({ preventScroll: true });
        }
    });
}

function focusSingleModeSelectForField(fieldKey) {
    if (!fieldKey) return;
    let attempts = 0;
    const maxAttempts = 8;
    const tryFocus = () => {
        const targetSelect =
            selectRefs.value[fieldKey] ||
            document.getElementById(`${fieldKey}Select`);
        if (
            targetSelect &&
            typeof targetSelect.focus === 'function' &&
            !targetSelect.hasAttribute('disabled')
        ) {
            targetSelect.focus({ preventScroll: true });
            return;
        }

        attempts += 1;
        if (attempts < maxAttempts) {
            setTimeout(tryFocus, 30);
        }
    };

    nextTick(() => {
        nextTick(() => {
            tryFocus();
        });
    });
}

/**
 * In single mode, close an open editable control when clicking outside it,
 * while keeping keyboard focus on the same control.
 */
function handleSingleModeOutsidePointerDown(event) {
    if (mode.value !== 'single' || !activeEdit.value) return;

    const activeFieldKey = activeEdit.value;
    const activeSelect =
        selectRefs.value[activeFieldKey] ||
        document.getElementById(`${activeFieldKey}Select`);
    const activeEditableContainer = activeSelect?.closest('.control.editable');
    if (!activeEditableContainer) return;

    const target = event.target;
    if (!(target instanceof Node)) return;
    if (activeEditableContainer.contains(target)) return;

    event.preventDefault();
    closeEdit(activeFieldKey);
}

function focusFirstSingleModeEditableControl() {
    const controlsRoot = document.getElementById('single-mode-controls');
    if (!controlsRoot) return;

    const firstVisibleSelect = controlsRoot.querySelector(
        '.control.editable .select:not([disabled])'
    );
    if (firstVisibleSelect && typeof firstVisibleSelect.focus === 'function') {
        firstVisibleSelect.focus({ preventScroll: true });
        return;
    }

    const firstEditButton = controlsRoot.querySelector(
        '.control.button-group .rebate-setting:not([disabled])'
    );

    if (firstEditButton instanceof HTMLElement) {
        const fieldKey = firstEditButton.dataset.fieldKey || '';
        if (fieldKey) {
            openEdit(fieldKey);
            return;
        }
        if (typeof firstEditButton.focus === 'function') {
            firstEditButton.focus({ preventScroll: true });
        }
        return;
    }
}

function enableAssistiveSimpleMode({ focusWithinTool = true } = {}) {
    assistiveSimpleMode.value = true;
    editModeView.value = false;
    editable.value = true;
    activeEdit.value = '';
    isCollapseView.value = false;
    singleModeSettingsContextMessage.value =
        'Screen reader enhanced interface enabled. Settings are now shown as select fields.';
    localStorage.setItem(ASSISTIVE_SIMPLE_MODE_KEY, 'true');

    if (focusWithinTool) {
        nextTick(() => {
            focusFirstSingleModeEditableControl();
        });
    }
}

function handleAssistiveScreenReaderButton() {
    if (!assistiveSimpleMode.value) {
        enableAssistiveSimpleMode();
        return;
    }

    nextTick(() => {
        nextTick(() => {
            const resetButton = resetSimplifiedButtonRef.value;
            if (resetButton && typeof resetButton.focus === 'function') {
                resetButton.focus({ preventScroll: true });
            }
        });
    });
}

function disableAssistiveSimpleMode() {
    assistiveSimpleMode.value = false;
    editModeView.value = false;
    editable.value = false;
    activeEdit.value = '';
    isCollapseView.value = true;
    singleModeSettingsContextMessage.value =
        'Screen reader enhanced interface disabled. Regular interface restored.';
    localStorage.removeItem(ASSISTIVE_SIMPLE_MODE_KEY);
}

/**
 * Toggle the edit mode view on/off.
 */
function toggleEditModeView() {
    if (assistiveSimpleMode.value || isSingleModeEditToggleDisabled.value)
        return;
    editModeView.value = !editModeView.value;
    singleModeEditModePreference.value = editModeView.value;
    singleModeSettingsContextMessage.value = editModeView.value
        ? 'Edit mode enabled. Use Tab to move between settings and Enter to edit.'
        : 'Edit mode disabled. Read-only details view enabled. Use Tab to reach the Edit button.';
    localStorage.setItem(
        'rebateEditModeView',
        JSON.stringify(singleModeEditModePreference.value)
    );

    if (editModeView.value) {
        nextTick(() => {
            focusFirstSingleModeEditableControl();
        });
    }
}

/**
 * Toggle the collapse mode view on/off.
 */
function toggleCollapseView() {
    isCollapseView.value = !isCollapseView.value;
    singleModeSettingsContextMessage.value = isCollapseView.value
        ? 'Home details collapsed.'
        : 'Home details expanded.';
    if (
        !isCollapseView.value &&
        mode.value === 'single' &&
        !assistiveSimpleMode.value
    ) {
        editModeView.value = isSingleModeEditToggleLocked.value
            ? true
            : singleModeEditModePreference.value;
    }
    localStorage.setItem(
        'rebateCollapseView',
        JSON.stringify(isCollapseView.value)
    );
}

function handleFocus() {
    isLocationFocused.value = true;
    if (isMobile.value) {
        setTimeout(() => {
            const inputEl = document.querySelector('input.location-input');
            inputEl?.focus();
        }, 300);
    }
}

/**
 * Commit location input on change or blur.
 */
const handleLocationInputCommit = debounce(async (trigger = 'change') => {
    await new Promise((resolve) => setTimeout(resolve, 150));

    let raw;

    // On mobile blur, re-read the DOM value to capture datalist suggestion.
    if (isMobile.value && trigger === 'blur') {
        const inputEl = document.querySelector('input.location-input');
        if (inputEl) {
            raw = inputEl.value;
            locationInputDisplay.value = raw;
        } else {
            raw = locationInputDisplay.value;
        }
    } else {
        raw = isMobile.value
            ? locationInputDisplay.value
            : locationInputValue.value;
    }

    const trimmed = raw.trim().toLowerCase();

    // 1. Try exact match first.
    let match = locationOptionsForInput.value.find(
        (opt) => opt.name.toLowerCase() === trimmed
    );

    // 2. Try best fuzzy match on blur.
    if (!match && trigger === 'blur' && raw !== '') {
        const possible = locationOptionsForInput.value.filter((opt) =>
            opt.name.toLowerCase().includes(trimmed)
        );

        if (possible.length > 0) {
            possible.sort((a, b) => {
                const aIndex = a.name.toLowerCase().indexOf(trimmed);
                const bIndex = b.name.toLowerCase().indexOf(trimmed);
                const aLengthDiff = Math.abs(a.name.length - raw.length);
                const bLengthDiff = Math.abs(b.name.length - raw.length);

                if (aIndex !== bIndex) return aIndex - bIndex;
                return aLengthDiff - bLengthDiff;
            });

            match = possible[0];
        }
    }

    // 3. Apply the match if found.
    if (match) {
        selectedLocationSlug.value = match.slug;
        locationInputValue.value = match.name;
        if (isMobile.value) {
            locationInputDisplay.value = match.name;
        }
        lastChangedField.value = 'location';
        isExternalDirty.value = true;
        updateAddressBar();
        debouncedUpdateRebateDetails();
        ariaStatusMessage.value = `${match.name} selected. Moving to next field.`;

        // Save preferredSettings whenever a valid location is chosen by the user
        writePreferredSettings({
            location: {
                slug: match.slug,
                name: match.name,
                region: match.children?.[0]?.name || '',
                region_slug: match.children?.[0]?.slug || '',
            },
        });

        // NEW: mirror select behaviour in archive mode
        await runArchiveFlowForField('location');
    } else {
        selectedLocationSlug.value = '';
    }
    isLocationFocused.value = false;
}, 50);

const isLocationFocused = ref(false);

const isLocationValid = computed(() =>
    locationOptionsForInput.value.some(
        (opt) =>
            opt.name.toLowerCase() ===
            locationInputValue.value.trim().toLowerCase()
    )
);

/**
 * Handle when a select input changes.
 * - Closes edit bubble (single mode)
 * - Marks state dirty
 * - In archive mode:
 *   • if there are errors – go to first invalid question
 *   • else if all valid   – go to results
 *   • else                – move focus to next question, keeping previous visible
 */
async function handleSelectChange(fieldKey, newValue) {
    if (newValue === undefined || newValue === null) return;

    lastChangedField.value = fieldKey;
    isSavingEditMode.value = true;

    // Close edit "bubble" in single-mode summary UI and restore focus to its button.
    if (mode.value === 'single' && activeEdit.value === fieldKey) {
        closeEdit(fieldKey);
        await nextTick();
    }

    // Mark Vue + external blocks as dirty
    isExternalDirty.value = true;

    if (mode.value !== 'archive') {
        const fieldMeta = fields.value.find((f) => f.key === fieldKey) || null;
        const fieldName = fieldMeta?.shortDesc || fieldMeta?.label || fieldKey;

        let selectedText = '';
        if (fieldMeta?.isGrouped && Array.isArray(fieldMeta.groups)) {
            selectedText =
                fieldMeta.groups
                    .flatMap((group) =>
                        Array.isArray(group?.children) ? group.children : []
                    )
                    .find((option) => option?.slug === newValue)?.name || '';
        } else if (Array.isArray(fieldMeta?.options)) {
            selectedText =
                fieldMeta.options.find((option) => option?.slug === newValue)
                    ?.name || '';
        }

        if (!selectedText) {
            selectedText = fieldMeta?.displayValue || String(newValue);
        }

        singleModeSettingsContextMessage.value = `${fieldName} updated to ${selectedText}.`;
        isSavingEditMode.value = false;
        return;
    }

    // Reuse the shared archive behaviour
    await runArchiveFlowForField(fieldKey);

    isSavingEditMode.value = false;
}

/**
 * After a field is successfully committed in archive mode, decide
 * where to scroll next or whether to go to results.
 */
async function runArchiveFlowForField(fieldKey) {
    if (mode.value !== 'archive') return;

    // Wait for all reactive updates to propagate.
    await nextTick();
    await nextTick();

    const allFields = fields.value;

    const isAnsweredAndValid = (field) => {
        const value = field.model?.value ?? null;
        const hasError = field.isInvalid?.() || false;
        return !!value && !hasError;
    };

    const anyError = hasAnyError.value;
    const currentIndex = allFields.findIndex((f) => f.key === fieldKey);
    const firstInvalid = allFields.find((field) => field.isInvalid?.());
    const unansweredAbove =
        currentIndex > 0
            ? allFields
                  .slice(0, currentIndex)
                  .find((field) => !isAnsweredAndValid(field))
            : null;

    const unansweredBelow =
        currentIndex !== -1 && currentIndex < allFields.length - 1
            ? allFields
                  .slice(currentIndex + 1)
                  .find((field) => !isAnsweredAndValid(field))
            : null;

    const allValid = allFields.every((field) => isAnsweredAndValid(field));

    // 1) If any error exists, go to the first invalid
    if (anyError && firstInvalid) {
        await scrollToQuestion(firstInvalid, {
            keepPreviousVisible: false,
        });

        // Optionally ensure the error message itself is announced
        await nextTick();
        const errorEl = document.querySelector('.message.error-message');
        if (errorEl) {
            errorEl.setAttribute('tabindex', '-1');
            errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorEl.focus({ preventScroll: true });
        }
        return;
    }

    // 2) If there is an unanswered field above, go back up to that
    if (unansweredAbove) {
        await scrollToQuestion(unansweredAbove, {
            keepPreviousVisible: false,
        });
        return;
    }

    // 3) Otherwise, if there is an unanswered field below, move down, keeping the previous question visible on screen
    if (unansweredBelow) {
        await scrollToQuestion(unansweredBelow, {
            keepPreviousVisible: true,
        });
        return;
    }

    // 4) If everything is answered and valid, go to results
    if (allValid && !hasArchiveAutoScrolledToResults.value) {
        scrollToArchiveResultsOnce();
    }
}

function scrollToArchiveResultsOnce() {
    if (hasArchiveAutoScrolledToResults.value) return;
    const resultsSection = document.getElementById('rebatesResults');
    if (!resultsSection) return;

    hasArchiveAutoScrolledToResults.value = true;
    setTimeout(() => {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        resultsSection.setAttribute('tabindex', '-1');
        resultsSection.focus({ preventScroll: true });
    }, 100);
}

/**
 * Scroll to a specific question and focus its control.
 *
 * keepPreviousVisible: when true and we’re moving forward, we offset so
 * the previous question remains visible above.
 */
async function scrollToQuestion(
    targetField,
    { keepPreviousVisible = false } = {}
) {
    await nextTick();
    await new Promise((r) => requestAnimationFrame(r));

    const allFields = fields.value;
    const idx = allFields.findIndex((f) => f.key === targetField.key);

    const controlEl =
        document.getElementById(`${targetField.key}Select`) ||
        document.getElementById(`${targetField.key}Input`);

    const container = controlEl?.closest('.question-container');
    if (!container) {
        console.warn(
            `Could not find question container for field: ${targetField.key}`
        );
        return;
    }

    const targetRect = container.getBoundingClientRect();
    let offsetTop;

    if (keepPreviousVisible && idx > 0) {
        // Use the height of the previous question to keep it on screen
        const prevField = allFields[idx - 1];
        const prevEl =
            document
                .getElementById(`${prevField.key}Select`)
                ?.closest('.question-container') ||
            document
                .getElementById(`${prevField.key}Input`)
                ?.closest('.question-container');

        let visibleOffset = 150;
        if (prevEl) {
            visibleOffset = prevEl.offsetHeight + 150;
        }

        offsetTop = window.scrollY + targetRect.top - visibleOffset;
    } else {
        // Simple "put it near the top"
        offsetTop = window.scrollY + targetRect.top - 150;
    }

    window.scrollTo({
        top: Math.max(0, offsetTop),
        behavior: 'smooth',
    });

    // Focus the control in the target question
    if (controlEl && typeof controlEl.focus === 'function') {
        setTimeout(() => {
            controlEl.focus({ preventScroll: true });
        }, 200);
    }
}

/**
 * Handle keyboard interaction for select elements.
 */
function handleSelectKeydown(event, fieldKey, currentValue) {
    if (event.key === 'Enter') {
        event.preventDefault();
        if (mode.value === 'archive') {
            runArchiveFlowForField(fieldKey);
        }

        return;
    }

    if (event.key === 'Escape') {
        event.preventDefault();
        activeEdit.value = '';
        return;
    }

    if (event.key === 'Tab') {
        // Archive auto-scroll should only assist forward progression while form is incomplete.
        // Do not auto-scroll on reverse tabbing (Shift+Tab) or once all selections are complete.
        if (mode.value !== 'archive') return;
        if (event.shiftKey) return;
        if (hasAllSelection.value) return;

        nextTick(() => scrollToNextVisibleField(fieldKey, 'down'));
    }
}

/**
 * Scroll to next visible field (direction-aware).
 */
async function scrollToNextVisibleField(currentKey, direction = 'down') {
    await nextTick();
    const all = fields.value;
    const idx = all.findIndex((f) => f.key === currentKey);
    if (idx === -1) return;

    const nextField =
        direction === 'up'
            ? all
                  .slice(0, idx)
                  .reverse()
                  .find((f) => f)
            : all.slice(idx + 1).find((f) => f);

    if (!nextField) return;

    const nextEl =
        document.getElementById(`${nextField.key}Select`) ||
        document.getElementById(`${nextField.key}Input`);

    if (nextEl) {
        const rect = nextEl.getBoundingClientRect();
        const offsetTop = window.scrollY + rect.top - 150; // adjust padding.
        window.scrollTo({ top: Math.max(0, offsetTop), behavior: 'smooth' });
    }
}

/**
 * Auto-focus when activeEdit changes.
 */
watch(activeEdit, async (newKey) => {
    if (!newKey) return;
    if (mode.value !== 'single') return;
    if (!isSingleModeEditModeActive.value) return;
    focusSingleModeSelectForField(newKey);
});

/**
 * Clear all user selections, reset URL, and reopen the first missing field.
 */
function clearSettings(event) {
    event?.preventDefault?.();

    selectedBuildingTypeSlug.value = '';
    murbTenure.value = '';
    selectedHomeValueSlug.value = '';
    selectedPersonsSlug.value = '';
    selectedIncomeRangeSlug.value = '';
    selectedLocationSlug.value = '';

    selectedHeatingSlug.value = '';
    selectedWaterHeatingSlug.value = '';

    selectedUtilitySlug.value = '';
    selectedGasSlug.value = '';
    hasArchiveAutoScrolledToResults.value = false;

    const url = window.location.origin + window.location.pathname;
    window.history.replaceState(null, '', url);
    syncCurrentQueryStringFromWindow();

    localStorage.removeItem('rebateToolSettings');
    editable.value = true;

    const firstMissing = fields.value.find((f) => !f.displayValue);
    activeEdit.value = firstMissing ? firstMissing.key : '';

    localStorage.removeItem('rebateEditableState');
}

const sortOtherLast = (items = []) => {
    if (!Array.isArray(items)) return items;

    const rest = items.filter((i) => i?.slug !== 'other');
    const others = items.filter((i) => i?.slug === 'other');

    return [...rest, ...others];
};

const sortBySlugWithOtherLast = (items = []) => {
    if (!Array.isArray(items)) return items;

    return [...items].sort((a, b) => {
        const aSlug = String(a?.slug || '');
        const bSlug = String(b?.slug || '');
        const aIsOther = aSlug === 'other';
        const bIsOther = bSlug === 'other';

        if (aIsOther && !bIsOther) return 1;
        if (!aIsOther && bIsOther) return -1;
        return aSlug.localeCompare(bSlug);
    });
};

/**
 * Unified fields config.
 */
const fields = computed(() => [
    {
        key: 'location',
        shortDesc: 'Home location',
        label: 'What community do you live in or closest to?',
        model: selectedLocationSlug,
        options: locationOptionsForInput.value,
        displayValue: selectedLocationName.value
            ? selectedLocationName.value // was: `${selectedLocationName.value} (${selectedRegionName.value})`
            : '',
        missingMessage: 'Missing location details',
        isInvalid: () => !selectedLocationSlug.value,
        filter_desc: 'Start typing to search communities.',
        error_desc: 'Please choose a community from the list.',
    },
    {
        key: 'murbTenure',
        shortDesc: 'Rent or own',
        label: 'Do you rent or own your home?',
        model: murbTenure,
        options: [
            { slug: 'own', name: 'Own' },
            { slug: 'rent', name: 'Rent' },
        ],
        displayValue: murbTenureLabel.value,
        missingMessage: 'Missing ownership status',
        // description:
        // 'Only rentals in multi-unit residential buildings are currently eligible.',
        // error_desc:
        // 'Rentals of your home type are not eligible. Only rentals in multi-unit residential buildings are currently eligible.',
        // isInvalid: () =>
        // selectedBuildingGroupSlug.value === 'ground-oriented-dwellings' &&
        // murbTenure.value === 'rent'
    },
    {
        key: 'building',
        shortDesc: 'Type of home',
        label: 'What type of home do you live in?',
        model: selectedBuildingTypeSlug,
        groups: buildingTypeGroups.value,
        isGrouped: true,
        displayValue: selectedBuildingTypeName.value,
        missingMessage: 'Missing home type',
        description:
            'Your home must have its own electricity meter. The utility account must be in the name of a resident of the household.',
        // filter_desc:
        //   'Changing between Ground Oriented / MURB types will require you to update the assessed property value information.',
        error_desc:
            '<strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> for help with your home type.',
        definition: 'See the different home types',
        glossary_link: '/definitions/home-types/',
        glossary_wide: true,
        isInvalid: () => selectedBuildingTypeSlug.value === 'other',
    },
    {
        key: 'homeValue',
        shortDesc: 'Assessed property value',
        label: 'What is the current assessed value of your property?',
        model: selectedHomeValueSlug,
        options: homeValueOptions.value,
        displayValue: selectedHomeValueName.value,
        missingMessage: 'Missing home value',
        disabled:
            !selectedBuildingGroupSlug.value ||
            selectedBuildingTypeSlug.value === 'other',
        ready: homeValueOptions.value.length > 0,
        // filter_desc:
        //   'The amount options shown change based on the set type of home.',
        disabled_desc: 'Please answer the "type of home you live in" first.',
        definition: 'How to find the assessed value of your property',
        glossary_link: '/definitions/assessed-home-value/',
        isInvalid: () =>
            (!selectedHomeValueSlug.value &&
                !!selectedBuildingGroupSlug.value) ||
            selectedBuildingTypeSlug.value === 'other',
    },
    {
        key: 'persons',
        shortDesc: 'People in household',
        label: 'How many people live in your home (including adults and children)?',
        model: selectedPersonsSlug,
        options: personCountOptions.value,
        displayValue: selectedPersonsCount.value,
        missingMessage: 'Missing household number',
        // description:
        //   'Changing this field will require you to update the pre-tax income range information as well.',
        isInvalid: () => !selectedPersonsSlug.value,
    },
    {
        key: 'income',
        shortDesc: 'Household income',
        label: 'What is the combined pre-tax income of all adults in your household (excluding dependants)?',
        model: selectedIncomeRangeSlug,
        options: incomeRangeOptions.value,
        displayValue: selectedIncomeRangeName.value,
        missingMessage: 'Missing household income',
        disabled: !selectedPersonsSlug.value,
        ready: incomeRangeOptions.value.length > 0,
        // description:
        //   'The amount options shown change based on the set number of people in the household.',
        disabled_desc:
            'Please answer "how many people live in your home" to enable this selection.',
        definition: 'Why we ask for household income',
        glossary_link: '/definitions/household-income/',
        isInvalid: () =>
            !!selectedPersonsSlug.value && !selectedIncomeRangeSlug.value,
    },
    {
        key: 'heating',
        shortDesc: 'Room heating type',
        label: 'How do you heat the rooms in your home?',
        description:
            'If you have multiple heat sources, choose the option that applies to most of your home. If your home is heated with both a wood stove and another source, choose the other source as your primary heating type.',
        model: selectedHeatingSlug,
        options: heatingOptions.value,
        displayValue: selectedHeatingName.value,
        missingMessage: 'Missing room heating details',
        error_desc:
            '<strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> for help with your room heating type.',
        isInvalid: () =>
            !selectedHeatingSlug.value || selectedHeatingSlug.value === 'other',
    },
    {
        key: 'water',
        shortDesc: 'Water heating type',
        label: 'How do you heat your water?',
        description:
            'If you have more than one system, choose the one that heats most of your water.',
        model: selectedWaterHeatingSlug,
        options: waterHeatingOptions.value,
        displayValue: selectedWaterHeatingName.value,
        missingMessage: 'Missing water heating details',
        error_desc:
            '<strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> for help with your water heating type. ',
        isInvalid: () =>
            !selectedWaterHeatingSlug.value ||
            selectedWaterHeatingSlug.value === 'other',
    },
    {
        key: 'gas',
        shortDesc: 'Natural gas or propane',
        label: 'Who is your gas or propane provider?',
        model: selectedGasSlug,
        options: gasOptions.value,
        displayValue: selectedGasName.value,
        missingMessage: 'Missing service details',
        isInvalid: () => !selectedGasSlug.value,
    },
    {
        key: 'utility',
        shortDesc: 'Electric utility company',
        label: 'Who is your electricity provider?',
        model: selectedUtilitySlug,
        options: utilityOptions.value,
        displayValue: selectedUtilityName.value,
        missingMessage: 'Missing service details',
        error_desc:
            'Without your electricity provider, we can’t determine your rebate eligibility. <strong><a href="/get-support/" style="color: #8b0000;">Contact an Energy Coach</a></strong> for help or choose one of the listed options. ',
        isInvalid: () =>
            !selectedUtilitySlug.value || selectedUtilitySlug.value === 'other',
    },
]);

const isExternalDirty = ref(false); // for outside Vue elements + button spin.

// Bootstrap guard.
const bootstrapped = ref(false);

onMounted(() => {
    // Save compact state to localStorage — but only after bootstrapping is complete.
    watch(
        urlStateDeps,
        (newDeps) => {
            if (!bootstrapped.value) return;
            const compact = Object.fromEntries(
                Object.entries(newDeps).filter(([, v]) => v !== '' && v != null)
            );
            localStorage.setItem('rebateToolSettings', JSON.stringify(compact));
        },
        { deep: true } // no immediate:true — avoids clobbering saved settings.
    );
});

watch(isExternalDirty, (newVal) => {
    const blocks = document.querySelectorAll(
        '.multi-query-content-block, .query-conditional-group-block'
    );
    blocks.forEach((el) => el.classList.toggle('is-dirty-variable', newVal));
});

/**
 * Toggle classes based on isDirty state.
 */
function applyDirtyClasses(val) {
    document
        .querySelectorAll(
            '.multi-query-content-block > span[data-replace="value"]'
        )
        .forEach((el) => el.classList.toggle('is-dirty', val));
}

function normalizeSingleModeTitleText(value) {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .trim();
}

function ensureSingleModeHeatingTitleVisible(
    titleEl,
    { titleSelector = '.subtitle' } = {}
) {
    if (typeof document === 'undefined') return;

    const resolvedTitleEl = titleEl || document.querySelector(titleSelector);
    if (!resolvedTitleEl) {
        document.documentElement.classList.remove(
            SINGLE_MODE_TITLE_PENDING_CLASS
        );
        return;
    }

    resolvedTitleEl.dataset.singleModeTitleManaged = 'true';
    resolvedTitleEl.dataset.singleModeTitleState = 'visible';
    resolvedTitleEl.removeAttribute('aria-hidden');
    resolvedTitleEl.style.maxHeight = `${Math.max(resolvedTitleEl.scrollHeight, 1)}px`;
    document.documentElement.classList.remove(SINGLE_MODE_TITLE_PENDING_CLASS);
}

function setSingleModeHeatingTitleVisibility(
    isVisible,
    { titleSelector = '.subtitle' } = {}
) {
    if (typeof document === 'undefined' || typeof window === 'undefined')
        return;

    const titleEl = document.querySelector(titleSelector);
    if (!titleEl) {
        document.documentElement.classList.toggle(
            SINGLE_MODE_TITLE_PENDING_CLASS,
            mode.value === 'single' && !isVisible
        );
        return;
    }

    if (singleModeTitleRevealFrame) {
        window.cancelAnimationFrame(singleModeTitleRevealFrame);
        singleModeTitleRevealFrame = 0;
    }

    titleEl.dataset.singleModeTitleManaged = 'true';
    titleEl.dataset.singleModeTitleState = 'hidden';
    titleEl.setAttribute('aria-hidden', 'true');
    titleEl.style.maxHeight = '0px';

    if (!isVisible) {
        document.documentElement.classList.toggle(
            SINGLE_MODE_TITLE_PENDING_CLASS,
            mode.value === 'single'
        );
        return;
    }

    const targetHeight = Math.max(titleEl.scrollHeight, 1);
    void titleEl.offsetHeight;

    singleModeTitleRevealFrame = window.requestAnimationFrame(() => {
        document.documentElement.classList.remove(
            SINGLE_MODE_TITLE_PENDING_CLASS
        );

        singleModeTitleRevealFrame = window.requestAnimationFrame(() => {
            titleEl.dataset.singleModeTitleState = 'visible';
            titleEl.style.maxHeight = `${targetHeight}px`;
            titleEl.removeAttribute('aria-hidden');
            singleModeTitleRevealFrame = 0;
        });
    });
}

function getSingleModeHeatingTitleTarget(titleEl) {
    const currentText = normalizeSingleModeTitleText(titleEl?.textContent);
    if (!singleModeTitleOriginalText.value && currentText) {
        singleModeTitleOriginalText.value = currentText;
    }

    const originalTitle = singleModeTitleOriginalText.value || currentText;
    if (!originalTitle) return null;

    if (singleModeResolvedTitleHtml.value) {
        singleModeLastValidTitleHtml.value = singleModeResolvedTitleHtml.value;
        return {
            content: singleModeResolvedTitleHtml.value,
            signature: `html:${singleModeResolvedTitleHtml.value}`,
            asHtml: true,
        };
    }

    if (
        singleModeCanRetainLastValidTitle.value &&
        singleModeLastValidTitleHtml.value
    ) {
        return {
            content: singleModeLastValidTitleHtml.value,
            signature: `html:${singleModeLastValidTitleHtml.value}`,
            asHtml: true,
        };
    }

    singleModeLastValidTitleHtml.value = '';
    return {
        content: originalTitle,
        signature: `text:${originalTitle}`,
        asHtml: false,
    };
}

function updateSingleModeHeatingTitleContent(
    titleEl,
    { content, signature, asHtml = true, titleSelector = '.subtitle' } = {}
) {
    if (!titleEl) return;

    const applyContent = () => {
        if (asHtml) {
            titleEl.innerHTML = content;
        } else {
            titleEl.textContent = content;
        }
        titleEl.dataset.singleModeTitleSignature = signature;
    };

    if (singleModeTitleSwapTimeout) {
        window.clearTimeout(singleModeTitleSwapTimeout);
        singleModeTitleSwapTimeout = 0;
    }

    const currentSignature = titleEl.dataset.singleModeTitleSignature || '';
    const isCurrentlyVisible =
        titleEl.dataset.singleModeTitleState === 'visible';

    if (currentSignature === signature) {
        ensureSingleModeHeatingTitleVisible(titleEl, { titleSelector });
        return;
    }

    if (isCurrentlyVisible && currentSignature) {
        setSingleModeHeatingTitleVisibility(false, { titleSelector });
        singleModeTitleSwapTimeout = window.setTimeout(() => {
            applyContent();
            setSingleModeHeatingTitleVisibility(true, { titleSelector });
            singleModeTitleSwapTimeout = 0;
        }, SINGLE_MODE_TITLE_TRANSITION_MS);
        return;
    }

    applyContent();
    setSingleModeHeatingTitleVisibility(true, { titleSelector });
}

const singleModeTitleOriginalText = ref('');
const singleModeLastValidTitleHtml = ref('');

function applySingleModeHeatingTitle({ titleSelector = '.subtitle' } = {}) {
    if (typeof document === 'undefined' || typeof window === 'undefined')
        return;

    const titleEl = document.querySelector(titleSelector);
    if (!titleEl) return;

    const nextTarget = getSingleModeHeatingTitleTarget(titleEl);
    if (!nextTarget) return;

    updateSingleModeHeatingTitleContent(titleEl, {
        content: nextTarget.content,
        signature: nextTarget.signature,
        asHtml: nextTarget.asHtml,
        titleSelector,
    });
}

// Show the info card only if any heat pump rebate exists
const showHeatPumpInfo = computed(() =>
    filteredResults.value.some((item) =>
        ['heat-pump-rebates', 'heat-pump-water-heater-rebates'].includes(
            item.rebate_type_class
        )
    )
);

// Find the index of the first qualifying heat pump rebate
const firstHeatPumpIndex = computed(() =>
    filteredResults.value.findIndex((item) =>
        ['heat-pump-rebates', 'heat-pump-water-heater-rebates'].includes(
            item.rebate_type_class
        )
    )
);

onMounted(() => {
    const el = document.getElementById('vnextRebateFilterApp');
    if (el?.dataset?.mode) {
        mode.value = el.dataset.mode;
    }
});

onMounted(async () => {
    let shouldRedirect = false;
    try {
        const res = await fetch(rebatesAPI, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        api.value = await res.json();

        const params = new URLSearchParams(window.location.search);
        singleModeHasInitialQueryString.value = params.toString().length > 0;
        const hasTool = params.get('tool') === 'rebates';
        const saved = localStorage.getItem('rebateToolSettings');

        if (hasTool) {
            // From URL.
            initFromQueryString();
        } else if (saved) {
            // From localStorage apply, then reload with full query string.
            initFromLocalStorage(JSON.parse(saved));
            if (mode.value === 'archive') {
                updateAddressBar();
            } else {
                // This is needed on single mode pages so the page receives the SSR details aligned with localStorage when accessed without the query string.
                shouldRedirect = true;
                window.location.href = assembledUrl.value;
                return; // stop further initialization until page reloads.
            }
        } else {
            // First visit — nothing special.
            console.log('No saved settings — starting fresh');
        }

        if (mode.value === 'single') {
            await updateRebateDetails();
        }

        if (
            mode.value === 'single' &&
            !hasAllSelection.value &&
            !singleModeOpenFromPlannerSource.value
        ) {
            isCollapseView.value = true;
        }

        isReadyToRender.value = true;
        maybeOpenSingleModeInvalidQueryDialogOnLoad();

        // Bootstrap completes here.
        bootstrapped.value = true;

        // Hydrate preferredSettings from restored rebateToolSettings/state
        hydratePreferredSettingsFromRebateToolSettings();

        if (mode.value === 'single') {
            updateAddressBar();
        }

        watch(
            urlStateDeps,
            () => {
                isExternalDirty.value = true; // external goes dirty immediately.
                if (mode.value === 'single') {
                    isSingleModeTitleAwaitingAjax.value = true;
                }
                updateAddressBar();
                debouncedUpdateRebateDetails();
            },
            { deep: true }
        );

        watch(homeValueOptions, async (newVal, oldVal = []) => {
            const previousSlug = selectedHomeValueSlug.value;
            const hasCurrentSelection = Boolean(previousSlug);
            const currentSelectionStillValid =
                hasCurrentSelection &&
                newVal.some((o) => o.slug === previousSlug);

            if (currentSelectionStillValid) return;

            if (mode.value === 'single') {
                if (newVal.length === 0) {
                    selectedHomeValueSlug.value = '';
                    return;
                }

                // In single mode, do not auto-select assessed value options.
                // Only preserve intent when a prior selection can be mapped to new options.
                const oldOptions = Array.isArray(oldVal) ? oldVal : [];
                const previousOption =
                    oldOptions.find((o) => o.slug === previousSlug) || null;
                const previousText = String(
                    previousOption?.slug ||
                        previousOption?.name ||
                        previousSlug ||
                        ''
                ).toLowerCase();

                let mapped = null;
                if (
                    previousText.includes('under') ||
                    previousText.includes('less')
                ) {
                    mapped =
                        newVal.find((o) => {
                            const t = String(
                                o?.slug || o?.name || ''
                            ).toLowerCase();
                            return t.includes('under') || t.includes('less');
                        }) || null;
                } else if (
                    previousText.includes('over') ||
                    previousText.includes('more')
                ) {
                    mapped =
                        newVal.find((o) => {
                            const t = String(
                                o?.slug || o?.name || ''
                            ).toLowerCase();
                            return t.includes('over') || t.includes('more');
                        }) || null;
                }

                selectedHomeValueSlug.value = mapped?.slug || '';
                return;
            }

            if (!selectedHomeValueSlug.value && newVal.length > 0) {
                // force remount and focus.
                fieldRenderKeys.value.homeValue++;
                await nextTick();
                activeEdit.value = 'homeValue';
            } else if (
                selectedHomeValueSlug.value &&
                !newVal.find((o) => o.slug === selectedHomeValueSlug.value)
            ) {
                selectedHomeValueSlug.value = '';
                fieldRenderKeys.value.homeValue++;
                await nextTick();
                activeEdit.value = 'homeValue';
            }
        });

        watch(incomeRangeOptions, async (newVal) => {
            if (!selectedIncomeRangeSlug.value && newVal.length > 0) {
                fieldRenderKeys.value.income++;
                await nextTick();
                activeEdit.value = 'income';
            } else if (
                selectedIncomeRangeSlug.value &&
                !newVal.find((o) => o.slug === selectedIncomeRangeSlug.value)
            ) {
                selectedIncomeRangeSlug.value = '';
                fieldRenderKeys.value.income++;
                await nextTick();
                activeEdit.value = 'income';
            }
        });
    } catch (e) {
        loadError.value = String(e);
        console.error('Failed to fetch rebates:', e);
    } finally {
        isLoading.value = false;
        if (!shouldRedirect) {
            isReadyToRender.value = true;
        }
    }

    // load the definitions links nextTick.
    nextTick(() => runOptionalGlobal('cleanbcdxBhDefinitions'));
    nextTick(() => runOptionalGlobal('cleanbcdxBhRebatesArchiveLoader'));
});

/**
 * Initialize form state from stored localStorage object.
 */
function initFromLocalStorage(data) {
    if (!data || typeof data !== 'object') return;

    const restoredBuildingTypeSlug = getRestoredBuildingTypeSlug({
        type: data.type,
        group: data.group,
        mode: mode.value,
        buildingTypeGroups: buildingTypeGroups.value,
    });
    if (restoredBuildingTypeSlug) {
        selectedBuildingTypeSlug.value = restoredBuildingTypeSlug;
    }

    if (data.tenure && (data.tenure === 'own' || data.tenure === 'rent'))
        murbTenure.value = data.tenure;

    if (
        data.home_value &&
        homeValueOptions.value.find((h) => h.slug === data.home_value)
    ) {
        selectedHomeValueSlug.value = data.home_value;
    }

    if (
        data.persons &&
        personCountOptions.value.some((p) => p.slug === data.persons)
    ) {
        selectedPersonsSlug.value = data.persons;
    }

    if (
        data.income &&
        incomeRangeOptions.value.some((r) => r.slug === data.income)
    ) {
        selectedIncomeRangeSlug.value = data.income;
    }

    if (data.location) {
        const loc =
            locationOptionsForInput.value.find(
                (l) => l.slug === data.location
            ) ||
            locationOptionsForInput.value.find((l) => l.name === data.location);
        if (loc) selectedLocationSlug.value = loc.slug;
    }

    if (data.heating) {
        const heating = findHeatingOptionByValue(
            heatingOptions.value,
            data.heating
        );
        if (heating) selectedHeatingSlug.value = heating.slug;
    }

    if (data.water_heating) {
        const waterHeating = findHeatingOptionByValue(
            waterHeatingOptions.value,
            data.water_heating
        );
        if (waterHeating) selectedWaterHeatingSlug.value = waterHeating.slug;
    }

    if (data.utility) {
        const utility =
            utilityOptions.value.find((u) => u.slug === data.utility) ||
            utilityOptions.value.find((u) => u.name === data.utility);
        if (utility) selectedUtilitySlug.value = utility.slug;
    }

    if (data.gas) {
        const gas =
            gasOptions.value.find((g) => g.slug === data.gas) ||
            gasOptions.value.find((g) => g.name === data.gas);
        if (gas) selectedGasSlug.value = gas.slug;
    }

    // After restoring state, update the URL and initialUrl.
    updateAddressBar();
}

// -- Building Types (hierarchical) --
const buildingTypeGroups = computed(() => {
    const raw = api.value?.['settings-selects']?.['building-types'] ?? [];

    // Sort children and groups alphabetically by slug, with `other` last.
    const withChildrenSorted = raw.map((group) => ({
        ...group,
        children: sortBySlugWithOtherLast(group.children ?? []),
    }));

    const sorted = sortBySlugWithOtherLast(withChildrenSorted);

    // Single mode: do NOT include the "other" group at all
    if (mode.value === 'single') {
        return sorted.filter((g) => g?.slug !== 'other');
    }

    return sorted;
});

const selectedBuildingTypeSlug = ref('');

watch(
    [() => mode.value, buildingTypeGroups],
    () => {
        const normalizedSelection = getRestoredBuildingTypeSlug({
            type: selectedBuildingTypeSlug.value,
            mode: mode.value,
            buildingTypeGroups: buildingTypeGroups.value,
        });

        if (normalizedSelection !== selectedBuildingTypeSlug.value) {
            selectedBuildingTypeSlug.value = normalizedSelection;
        }
    },
    { immediate: true }
);

const childToGroupSlug = computed(() => {
    const map = new Map();
    for (const g of buildingTypeGroups.value) {
        for (const c of g.children ?? []) map.set(c.slug, g.slug);
    }
    return map;
});

const selectedBuildingGroupSlug = computed(() => {
    if (!selectedBuildingTypeSlug.value) return '';
    if (
        buildingTypeGroups.value.some(
            (g) => g.slug === selectedBuildingTypeSlug.value
        )
    )
        return selectedBuildingTypeSlug.value;
    return childToGroupSlug.value.get(selectedBuildingTypeSlug.value) || '';
});

const selectedBuildingTypeName = computed(() => {
    const sel = selectedBuildingTypeSlug.value;
    if (!sel) return '';
    const group = buildingTypeGroups.value.find((g) => g.slug === sel);
    if (group) return group.name;
    for (const g of buildingTypeGroups.value) {
        const child = (g.children ?? []).find((c) => c.slug === sel);
        if (child) return child.name;
    }
    return '';
});

/**
 * Handle building type change by resetting home value and focusing next.
 */
async function onBuildingTypeChange() {
    selectedHomeValueSlug.value = '';
    await nextTick();
    if (!selectedHomeValueSlug.value) selectedHomeValueSlug.value = '';
    activeEdit.value = 'homeValue';
}

// -- MURB tenure --
const murbTenure = ref('');
const murbTenureLabel = computed(() =>
    murbTenure.value === 'own'
        ? 'Own'
        : murbTenure.value === 'rent'
          ? 'Rent'
          : ''
);

// -- Home Value --
const homeValueOptions = computed(() => {
    const hvGroups = api.value?.['settings-selects']?.['home-value'] ?? [];
    const groupSlug = selectedBuildingGroupSlug.value;
    if (!groupSlug) return [];

    const groupObj = (
        api.value?.['settings-selects']?.['building-types'] ?? []
    ).find((g) => g.slug === groupSlug);
    const groupName = groupObj?.name || '';
    const singularish = groupSlug.replace(/s$/, '');

    const hvGroup =
        hvGroups.find((g) => g.slug === `${groupSlug}-value`) ||
        hvGroups.find((g) => g.name === groupName) ||
        hvGroups.find((g) => g.slug === `${singularish}-value`) ||
        hvGroups.find((g) => g.slug.startsWith(singularish)) ||
        null;

    return hvGroup?.children ?? [];
});

const selectedHomeValueSlug = ref('');
const selectedHomeValueName = computed(() => {
    const match = homeValueOptions.value.find(
        (v) => v.slug === selectedHomeValueSlug.value
    );
    return match ? match.name : '';
});

// -- Income Bands --
const personCountOptions = computed(() =>
    (api.value?.['settings-selects']?.['income-bands'] ?? []).map((p) => ({
        name: p.name,
        slug: p.slug,
        id: p.id,
    }))
);

const selectedPersonsSlug = ref('');

const selectedPersonsGroup = computed(
    () =>
        (api.value?.['settings-selects']?.['income-bands'] ?? []).find(
            (p) => p.slug === selectedPersonsSlug.value
        ) || null
);

const selectedPersonsCount = computed(
    () => selectedPersonsGroup.value?.name || ''
);

const incomeRangeOptions = computed(() => {
    const children = selectedPersonsGroup.value?.children ?? [];
    return children
        .map((r) => ({
            ...r,
            name: r.name.replace(/^Range:\s*/, ''),
        }))
        .sort((a, b) => {
            const order = { t1: 1, t2: 2, t3: 3, t0: 4 };
            const aCode = a.slug.split('-').pop();
            const bCode = b.slug.split('-').pop();
            return (order[aCode] || 99) - (order[bCode] || 99);
        });
});

const selectedIncomeRangeSlug = ref('');

const selectedIncomeRangeName = computed(() => {
    const match = incomeRangeOptions.value.find(
        (r) => r.slug === selectedIncomeRangeSlug.value
    );
    return match ? match.name : '';
});

/**
 * Handle household size change by resetting income range and focusing next.
 */
async function onPersonsChange() {
    selectedIncomeRangeSlug.value = '';
    await nextTick();
    if (!selectedIncomeRangeSlug.value) selectedIncomeRangeSlug.value = '';
    activeEdit.value = 'income';
}

// -- Location --
const locationOptions = computed(
    () => api.value?.['settings-selects']?.['locations'] ?? []
);

const isAllLocationsOption = (opt) => {
    const name = opt?.name?.toLowerCase?.().trim();
    const slug = opt?.slug?.toLowerCase?.().trim();
    return (
        name === 'all locations' || slug === 'all' || slug === 'all-locations'
    );
};

const locationOptionsForInput = computed(() =>
    locationOptions.value.filter((opt) => !isAllLocationsOption(opt))
);

const selectedLocationSlug = ref('');

const selectedLocation = computed(
    () =>
        locationOptionsForInput.value.find(
            (l) => l.slug === selectedLocationSlug.value
        ) || null
);

const locationInputValue = ref('');

const isMobile = ref(false);
onMounted(() => {
    isMobile.value = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
});

const locationInputDisplay = ref('');

// Keep the display synced with the real model when that changes
watch(locationInputValue, (newVal) => {
    if (isMobile.value) {
        locationInputDisplay.value = newVal;
    }
});

const normalizeLocationQuery = (val) =>
    (val || '').toLowerCase().trim().replace(/\s+/g, '-');

const normalizedLocationOptions = computed(() =>
    locationOptionsForInput.value
        .filter((opt) => opt?.name)
        .map((opt) => ({
            ...opt,
            norm: normalizeLocationQuery(opt.name),
        }))
);

// Unified proxy for v-model (this is now a valid member expression)
const setLocationDisplayDebounced = debounce((v) => {
    locationInputDisplay.value = v;
}, 300);

const locationInputProxy = computed({
    get() {
        return isMobile.value
            ? locationInputDisplay.value
            : locationInputValue.value;
    },
    set(val) {
        if (isMobile.value) {
            setLocationDisplayDebounced(val); // <-- invoke the debounced setter
        } else {
            locationInputValue.value = val;
        }
    },
});

const locationQuery = computed(() => {
    const raw = isMobile.value
        ? locationInputDisplay.value
        : locationInputValue.value;
    return normalizeLocationQuery(raw);
});

const locationQueryIsEmpty = computed(() => !locationQuery.value);
const hasValidArchiveLocationSelection = computed(
    () =>
        mode.value === 'archive' &&
        isLocationValid.value &&
        Boolean(selectedLocationSlug.value)
);

function clearArchiveLocationSelection() {
    selectedLocationSlug.value = '';
    locationInputValue.value = '';
    locationInputDisplay.value = '';
    isLocationFocused.value = true;

    nextTick(() => {
        document.getElementById('locationSelect')?.focus();
    });
}

const mobileLocationOptions = computed(() => {
    const q = locationQuery.value;
    if (!q) return [];

    const list = normalizedLocationOptions.value;
    const starts = [];
    const includes = [];

    for (const opt of list) {
        if (!opt?.norm) continue;
        if (opt.norm.startsWith(q)) {
            starts.push(opt);
            if (starts.length >= 10) return starts;
        } else if (opt.norm.includes(q)) {
            includes.push(opt);
        }
    }

    for (const opt of includes) {
        starts.push(opt);
        if (starts.length >= 10) break;
    }

    return starts;
});

const selectedRegion = computed(
    () => selectedLocation.value?.children?.[0]?.slug || ''
);
const selectedLocationName = computed(() => selectedLocation.value?.name || '');
const selectedRegionName = computed(
    () => selectedLocation.value?.children?.[0]?.name || ''
);

// -- Heating --
const heatingOptions = computed(() => {
    const opts = sortOtherLast(
        api.value?.['settings-selects']?.['heating-types'] ?? []
    ).map((o) => {
        if (String(o?.slug ?? '').toLowerCase() !== 'electricity') {
            return o;
        }

        return {
            ...o,
            // name: `${o.name} (e.g. baseboard or furnace)`
            name: `Electric (e.g. baseboard or furnace)`,
        };
    });

    // Omit water-heating-specific electric HPWH option from room heating question.
    return opts.filter(
        (o) => String(o?.slug ?? '').toLowerCase() !== 'electric-hpwh'
    );
});
const selectedHeatingSlug = ref('');
const selectedHeating = computed(
    () =>
        heatingOptions.value.find(
            (l) => l.slug === selectedHeatingSlug.value
        ) || null
);
const selectedHeatingName = computed(() => selectedHeating.value?.name || '');

// -- Water Heating --
const waterHeatingOptions = computed(() => {
    const opts = sortOtherLast(
        api.value?.['settings-selects']?.['heating-types'] ?? []
    ).map((o) => {
        if (String(o?.slug ?? '').toLowerCase() !== 'electricity') {
            return o;
        }

        return {
            ...o,
            // name: `${o.name} (e.g. tank or tankless)`
            name: `Electric (e.g. tank or tankless)`,
        };
    });

    // Omit room-heating-only and non-water options for water heating question.
    return opts.filter((o) => {
        const slug = String(o?.slug ?? '').toLowerCase();
        const name = String(o?.name ?? '').toLowerCase();
        return (
            slug !== 'wood' && !name.includes('wood') && slug !== 'electric-hp'
        );
    });
});

const selectedWaterHeatingSlug = ref('');
const selectedWaterHeating = computed(
    () =>
        waterHeatingOptions.value.find(
            (l) => l.slug === selectedWaterHeatingSlug.value
        ) || null
);
const selectedWaterHeatingName = computed(
    () => selectedWaterHeating.value?.name || ''
);

watch(
    [selectedWaterHeatingSlug, waterHeatingOptions],
    ([slug, opts]) => {
        if (!slug) return;
        const exists = opts.some((o) => o.slug === slug);
        if (!exists) {
            selectedWaterHeatingSlug.value = '';
        }
    },
    { immediate: true }
);

// -- Utility --
const utilityOptions = computed(() =>
    sortOtherLast(api.value?.['settings-selects']?.['utilities'] ?? [])
);
const selectedUtilitySlug = ref('');
const selectedUtility = computed(
    () =>
        utilityOptions.value.find(
            (l) => l.slug === selectedUtilitySlug.value
        ) || null
);
const selectedUtilityName = computed(() => selectedUtility.value?.name || '');

// -- Gas --
const gasOptions = computed(() =>
    sortOtherLast(api.value?.['settings-selects']?.['gas'] ?? [])
);
const selectedGasSlug = ref('');
const selectedGas = computed(
    () => gasOptions.value.find((g) => g.slug === selectedGasSlug.value) || null
);
const selectedGasName = computed(() => selectedGas.value?.name || '');

const isNaturalGasOrPropaneOption = (opt) => {
    if (!opt) return false;
    const slug = String(opt.slug ?? '').toLowerCase();
    const name = String(opt.name ?? '').toLowerCase();
    return (
        /natural\s*gas/.test(name) ||
        /propane/.test(name) ||
        /natural[-\s]*gas/.test(slug) ||
        /propane/.test(slug)
    );
};

const findNoGasOptionSlug = (opts = []) => {
    const match = opts.find((opt) => {
        const slug = String(opt?.slug ?? '').toLowerCase();
        const name = String(opt?.name ?? '').toLowerCase();
        return (
            /no\s*gas/.test(name) ||
            /no[-\s]*gas/.test(slug) ||
            /no\s*provider/.test(name) ||
            /no[-\s]*provider/.test(slug)
        );
    });
    return match?.slug || '';
};

const isNoGasProviderOption = (opt) => {
    if (!opt) return false;
    const slug = String(opt.slug ?? '').toLowerCase();
    const name = String(opt.name ?? '').toLowerCase();
    return (
        /no\s*gas/.test(name) ||
        /no[-\s]*gas/.test(slug) ||
        /no\s*provider/.test(name) ||
        /no[-\s]*provider/.test(slug)
    );
};

watch(
    [selectedHeatingSlug, selectedWaterHeatingSlug, gasOptions],
    () => {
        if (selectedGasSlug.value) return;
        if (!selectedHeatingSlug.value || !selectedWaterHeatingSlug.value)
            return;
        if (
            isNaturalGasOrPropaneOption(selectedHeating.value) ||
            isNaturalGasOrPropaneOption(selectedWaterHeating.value)
        ) {
            return;
        }

        const noGasSlug = findNoGasOptionSlug(gasOptions.value);
        if (!noGasSlug) return;

        selectedGasSlug.value = noGasSlug;
        if (bootstrapped.value) {
            isExternalDirty.value = true;
        }
        updateAddressBar();
        debouncedUpdateRebateDetails();
    },
    { immediate: true }
);

watch(
    [selectedHeatingSlug, selectedWaterHeatingSlug, gasOptions],
    () => {
        if (!selectedGasSlug.value) return;

        const currentGasOption =
            gasOptions.value.find((g) => g.slug === selectedGasSlug.value) ||
            null;
        if (!isNoGasProviderOption(currentGasOption)) return;

        const heatingIsGasOrPropane = isNaturalGasOrPropaneOption(
            selectedHeating.value
        );
        const waterHeatingIsGasOrPropane = isNaturalGasOrPropaneOption(
            selectedWaterHeating.value
        );

        if (heatingIsGasOrPropane || waterHeatingIsGasOrPropane) {
            selectedGasSlug.value = '';
        }
    },
    { immediate: true }
);

// -- Selections summary --
const hasAnySelection = computed(
    () =>
        !!(
            selectedBuildingTypeName.value ||
            murbTenure.value ||
            selectedHomeValueName.value ||
            selectedPersonsCount.value ||
            selectedIncomeRangeName.value ||
            selectedLocationName.value ||
            selectedHeatingName.value ||
            selectedWaterHeatingName.value ||
            selectedUtilityName.value ||
            selectedGasName.value
        )
);

const hasAllSelection = computed(() => {
    const hasBuilding = !!selectedBuildingTypeSlug.value;
    const hasMurbTenure =
        selectedBuildingGroupSlug.value === 'murb' ? !!murbTenure.value : true;
    const hasHomeValue = !!selectedHomeValueSlug.value;
    const hasPersons = !!selectedPersonsSlug.value;
    const hasIncome = !!selectedIncomeRangeSlug.value;
    const hasLocation = !!selectedLocationSlug.value;
    const requiresRoomHeating = !(
        mode.value === 'single' && singleModePageRebateKind.value === 'hpwh'
    );
    const requiresWaterHeating = !(
        mode.value === 'single' && singleModePageRebateKind.value === 'hp'
    );
    const hasHeating = requiresRoomHeating ? !!selectedHeatingSlug.value : true;
    const hasWaterHeating = requiresWaterHeating
        ? !!selectedWaterHeatingSlug.value
        : true;
    const hasUtility = !!selectedUtilitySlug.value;
    const hasGas = !!selectedGasSlug.value;

    return (
        hasBuilding &&
        hasMurbTenure &&
        hasHomeValue &&
        hasPersons &&
        hasIncome &&
        hasLocation &&
        hasHeating &&
        hasWaterHeating &&
        hasUtility &&
        hasGas
    );
});

const isSingleModeEditToggleLocked = computed(
    () =>
        mode.value === 'single' &&
        !assistiveSimpleMode.value &&
        !hasAllSelection.value
);

const isSingleModeEditModeActive = computed(
    () =>
        editModeView.value && !(mode.value === 'single' && isCollapseView.value)
);

const isSingleModeEditToggleDisabled = computed(
    () =>
        mode.value === 'single' &&
        !assistiveSimpleMode.value &&
        (isCollapseView.value || isSingleModeEditToggleLocked.value)
);

const editModeToggleLabel = computed(() =>
    mode.value === 'single' && isCollapseView.value
        ? 'Expand home details to change edit mode.'
        : isSingleModeEditToggleLocked.value
          ? 'Edit mode is locked until all home details are completed.'
          : isSingleModeEditModeActive.value
            ? 'Exit edit mode'
            : 'Enter edit mode'
);

watchEffect(() => {
    if (mode.value !== 'single' || assistiveSimpleMode.value) return;

    if (isCollapseView.value) {
        activeEdit.value = '';
        if (editModeView.value) {
            editModeView.value = false;
        }
        return;
    }

    if (isSingleModeEditToggleLocked.value && !editModeView.value) {
        editModeView.value = true;
    }
});

watch(isSingleModeEditToggleLocked, (isLocked, wasLocked) => {
    if (
        !isLocked &&
        wasLocked &&
        mode.value === 'single' &&
        !assistiveSimpleMode.value &&
        !isCollapseView.value
    ) {
        editModeView.value = singleModeEditModePreference.value;
    }
});

watch(
    [bootstrapped, isReadyToRender, mode, hasAllSelection],
    async ([isBootstrapped, readyToRender, currentMode, allSelected]) => {
        if (!isBootstrapped || !readyToRender) return;
        if (currentMode !== 'archive' || !allSelected) return;
        if (hasArchiveAutoScrolledToResults.value) return;

        await nextTick();
        scrollToArchiveResultsOnce();
    },
    { immediate: true }
);

// -- URL assembly --
const assembledUrl = computed(() => assembleUrl());

const assembledQueryString = computed(() => {
    const q = assembledUrl.value.split('?')[1];
    return q ? `?${q}` : '';
});

const currentQueryString = ref(window.location.search);

function syncCurrentQueryStringFromWindow() {
    currentQueryString.value = window.location.search;
}

function queueHeatingTitleUpdate() {
    if (mode.value !== 'single') return;
    if (!isReadyToRender.value) {
        setSingleModeHeatingTitleVisibility(false);
        return;
    }
    if (isSingleModeTitleAwaitingAjax.value) return;

    nextTick(() => {
        applySingleModeHeatingTitle();
    });
}

function handleWindowLocationChange() {
    syncCurrentQueryStringFromWindow();
}

// Dirty states
// URL does not match the settings currently showing.
const urlOutOfSync = computed(
    () => assembledQueryString.value !== currentQueryString.value
);

// Use this everywhere inside Vue for warnings/outline.
const isDirty = urlOutOfSync;

const isUrlHeatingMismatch = computed(() => {
    // Only relevant in single mode where SSR heating type is defined
    if (mode.value !== 'single' || !pageHeatingType.value) return false;

    const params = new URLSearchParams(window.location.search);
    const heatingParam = params.get('heating');

    // Mismatch occurs if the URL has a heating param that differs from SSR value
    return heatingParam && heatingParam !== pageHeatingType.value;
});

const isUrlWaterHeatingMismatch = computed(() => {
    // Only relevant in single mode where SSR heating type is defined
    if (
        mode.value !== 'single' ||
        resolvedPageWaterHeatingSources.value.length === 0
    )
        return false;

    const params = new URLSearchParams(window.location.search);
    const waterHeatingParam = params.get('water_heating');
    if (!waterHeatingParam) return false;

    const normalizedWaterHeating = normalizeHeatingSlug(
        findHeatingOptionByValue(waterHeatingOptions.value, waterHeatingParam)
            ?.slug || waterHeatingParam
    );
    const allowedWaterHeating = resolvedPageWaterHeatingSources.value
        .flatMap((item) => extractHeatingTokens(item))
        .filter(Boolean);

    return normalizedWaterHeating
        ? !allowedWaterHeating.includes(normalizedWaterHeating)
        : false;
});

// Keep external spans in sync with URL mismatch.
watch(urlOutOfSync, (val) => applyDirtyClasses(val), { immediate: true });

// Keep input value in sync when a location is selected externally (e.g. from URL or localStorage).
watch(selectedLocationName, (newName) => {
    locationInputValue.value = newName || '';
});

function detectSingleModeRebateTypeClass(el) {
    if (typeof document === 'undefined') return '';

    if (typeof window !== 'undefined') {
        if (
            window.location.pathname
                .toLowerCase()
                .includes('heat-pump-water-heater')
        ) {
            return heatPumpWaterHeaterRebateSlug;
        }
    }

    return '';
}

onMounted(() => {
    const el = document.getElementById('vnextRebateFilterApp');
    if (el?.dataset?.mode) mode.value = el.dataset.mode;
    if (el?.dataset?.pageHeatingType) {
        pageHeatingType.value = el.dataset.pageHeatingType;
    }
    if (el?.dataset?.pageHeatingTypes) {
        pageHeatingTypes.value = el.dataset.pageHeatingTypes
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    if (el?.dataset?.pageWaterHeatingType) {
        pageWaterHeatingType.value = el.dataset.pageWaterHeatingType;
    }
    if (el?.dataset?.pageWaterHeatingTypes) {
        pageWaterHeatingTypes.value = el.dataset.pageWaterHeatingTypes
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
    if (el?.dataset?.pageBuildingGroup) {
        pageBuildingGroup.value = el.dataset.pageBuildingGroup;
    }
    if (el?.dataset?.pageRebateType) {
        pageRebateType.value = el.dataset.pageRebateType;
    }
    singleModeRebateTypeClass.value = detectSingleModeRebateTypeClass(el);

    // Keep page-provided heating metadata for eligibility checks only.
    // Do not auto-populate user selections from page metadata when no saved state exists.

    const savedLabelsVisible = localStorage.getItem('rebateLabelsVisible');
    if (savedLabelsVisible !== null) {
        labelsVisible.value = JSON.parse(savedLabelsVisible);
    }

    const savedReadOnly = localStorage.getItem('rebateShowReadOnlyFields');
    if (savedReadOnly !== null) {
        showReadOnlyFields.value = JSON.parse(savedReadOnly);
    }

    const savedEditUI = localStorage.getItem('rebateShowEditModeUI');
    if (savedEditUI !== null) {
        showEditModeUI.value = JSON.parse(savedEditUI);
    }

    const savedEditModeView = localStorage.getItem('rebateEditModeView');
    if (savedEditModeView !== null) {
        const parsedEditModeView = JSON.parse(savedEditModeView) === true;
        editModeView.value = parsedEditModeView;
        singleModeEditModePreference.value = parsedEditModeView;
    }

    const savedAssistiveSimpleMode = localStorage.getItem(
        ASSISTIVE_SIMPLE_MODE_KEY
    );
    if (savedAssistiveSimpleMode === 'true') {
        assistiveSimpleMode.value = true;
        editModeView.value = false;
        editable.value = true;
        activeEdit.value = '';
        isCollapseView.value = false;
    }

    if (!assistiveSimpleMode.value && mode.value === 'single') {
        isCollapseView.value = !singleModeOpenFromPlannerSource.value;
        editModeView.value = false;
    }

    const observer = new MutationObserver(() => {
        applyDirtyClasses(urlOutOfSync.value);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
        displayGridOrList.value = saved === 'true';
    }
    viewPreferenceLoaded.value = true;

    document.addEventListener(
        'pointerdown',
        handleSingleModeOutsidePointerDown,
        true
    );
    window.addEventListener('popstate', handleWindowLocationChange);
});

onBeforeUnmount(() => {
    document.removeEventListener(
        'pointerdown',
        handleSingleModeOutsidePointerDown,
        true
    );
    window.removeEventListener('popstate', handleWindowLocationChange);
    if (typeof window !== 'undefined' && singleModeTitleRevealFrame) {
        window.cancelAnimationFrame(singleModeTitleRevealFrame);
        singleModeTitleRevealFrame = 0;
    }
    if (typeof window !== 'undefined' && singleModeTitleSwapTimeout) {
        window.clearTimeout(singleModeTitleSwapTimeout);
        singleModeTitleSwapTimeout = 0;
    }
    if (typeof document !== 'undefined') {
        document.documentElement.classList.remove(
            SINGLE_MODE_TITLE_PENDING_CLASS
        );
    }
});

/**
 * Rebuild the current rebate tool URL including all selected params.
 */
function assembleUrl() {
    const baseUrl = window.location.origin + window.location.pathname;
    const urlParams = new URLSearchParams();
    urlParams.set('tool', 'rebates');

    if (selectedBuildingTypeSlug.value)
        urlParams.set('type', selectedBuildingTypeSlug.value);
    if (selectedBuildingGroupSlug.value)
        urlParams.set('group', selectedBuildingGroupSlug.value);
    if (murbTenure.value) urlParams.set('tenure', murbTenure.value);
    if (selectedHomeValueSlug.value)
        urlParams.set('home_value', selectedHomeValueSlug.value);
    if (selectedPersonsSlug.value)
        urlParams.set('persons', selectedPersonsSlug.value);
    if (selectedIncomeRangeSlug.value)
        urlParams.set('income', selectedIncomeRangeSlug.value);

    if (hasAllSelection.value && espTier.value) {
        urlParams.set('rebate_tier', espTier.value);
    } else {
        urlParams.delete('rebate_tier');
    }

    if (mode.value === 'single') {
        const isInvalid =
            hasAnyError.value ||
            !hasAllSelection.value ||
            !singleModePageEligible.value;
        urlParams.set('state', isInvalid ? 'invalid' : 'valid');
        if (singleModeOpenFromPlannerSource.value && !hasAllSelection.value) {
            urlParams.set('source', 'planner');
        } else {
            urlParams.delete('source');
        }
    } else {
        urlParams.delete('state');
    }

    if (selectedLocationSlug.value) {
        urlParams.set('location', selectedLocationName.value);
        if (selectedRegionName.value)
            urlParams.set('region', selectedRegionName.value);
    }

    if (selectedHeatingSlug.value) {
        urlParams.set('heating', getHeatingUrlValue(selectedHeating.value));
    }
    if (selectedWaterHeatingSlug.value) {
        urlParams.set(
            'water_heating',
            getHeatingUrlValue(selectedWaterHeating.value)
        );
    }
    if (selectedUtilitySlug.value)
        urlParams.set('utility', selectedUtilityName.value);
    if (selectedGasSlug.value) urlParams.set('gas', selectedGasName.value);

    return `${baseUrl}?${urlParams.toString()}`;
}

/**
 * Copy the assembled URL to clipboard and show a feedback message.
 */
function addLinkToClipboard(event) {
    const url = assembledUrl.value;
    navigator.clipboard
        ?.writeText(url)
        .then(() =>
            handleLinkCopiedMessageContent(
                event,
                '.selection-summary',
                'Link copied to clipboard'
            )
        )
        .catch((err) => {
            console.error('Failed to copy URL:', err);
            handleLinkCopiedMessageContent(
                event,
                '.selection-summary',
                'Copy failed'
            );
        });
}

/**
 * Show a temporary feedback message in the UI when link copied.
 */
function handleLinkCopiedMessageContent(event, targetSelector, msg) {
    const root = document.querySelector(targetSelector) || document.body;
    const el = root.querySelector('.copy-message');
    if (!el) return;

    el.textContent = msg;
    el.classList.remove('isFadedOut');

    setTimeout(() => el.classList.add('isFadedOut'), 1200);
    setTimeout(() => {
        el.textContent = '';
    }, 1800);
}

const normalizeHeatingLabelForMatch = (value) =>
    String(value || '')
        .toLowerCase()
        .replace(/\s*\(e\.g\.[^)]+\)\s*/g, '')
        .replace(/\s+/g, ' ')
        .trim();

const findHeatingOptionByValue = (options, value) => {
    if (!value) return null;

    const raw = String(value).trim();
    const rawSlug = raw.toLowerCase();
    const normalized = normalizeHeatingLabelForMatch(raw);
    const isElectricAlias =
        normalized === 'electric' || normalized === 'electricity';

    return (
        options.find(
            (opt) => String(opt?.slug || '').toLowerCase() === rawSlug
        ) ||
        options.find(
            (opt) => normalizeHeatingLabelForMatch(opt?.name) === normalized
        ) ||
        (isElectricAlias
            ? options.find(
                  (opt) =>
                      String(opt?.slug || '').toLowerCase() === 'electricity'
              )
            : null)
    );
};

const getHeatingUrlValue = (option) => {
    if (!option) return '';
    return String(option.slug || '').toLowerCase() === 'electricity'
        ? 'Electricity'
        : option.name;
};

const singleModeTitleHtmlByKind = {
    hp: {
        electricity:
            'For homes heated with <span class="electricity">electricity</span>',
        gas: 'For homes heated with <span class="gas">natural gas or propane</span>',
        oil: 'For homes heated with <span class="oil">oil</span>',
        wood: 'For homes heated with <span class="wood">wood</span>',
        other: 'For homes heated with <span class="other">other or unsure</span>',
    },
    hpwh: {
        electricity:
            'For homes with <span class="electricity">electric</span> water heating',
        'electric-hpwh':
            'For homes with <span class="electric-hpwh">electric heat pump water heater</span> water heating',
        gas: 'For homes with <span class="gas">natural gas or propane</span> water heating',
        oil: 'For homes with <span class="oil">oil</span> water heating',
        other: 'For homes with <span class="other">other or unsure</span> water heating',
    },
};

const currentUrlParams = computed(() => {
    return new URLSearchParams(
        (currentQueryString.value || '').replace(/^\?/, '')
    );
});

const currentUrlHeatingValue = computed(
    () => currentUrlParams.value.get('heating') || ''
);

const currentUrlWaterHeatingValue = computed(
    () => currentUrlParams.value.get('water_heating') || ''
);

const currentUrlHeatingOption = computed(() =>
    findHeatingOptionByValue(heatingOptions.value, currentUrlHeatingValue.value)
);

const currentUrlWaterHeatingOption = computed(() =>
    findHeatingOptionByValue(
        waterHeatingOptions.value,
        currentUrlWaterHeatingValue.value
    )
);

const singleModeCurrentTitleHeatingKey = computed(() => {
    if (singleModePageRebateKind.value === 'hp') {
        return normalizeHeatingTitleKey(
            currentUrlHeatingOption.value?.slug ||
                currentUrlHeatingOption.value?.name ||
                currentUrlHeatingValue.value
        );
    }

    if (singleModePageRebateKind.value === 'hpwh') {
        return normalizeHeatingTitleKey(
            currentUrlWaterHeatingOption.value?.slug ||
                currentUrlWaterHeatingOption.value?.name ||
                currentUrlWaterHeatingValue.value
        );
    }

    return '';
});

const singleModeCurrentPageAllowedTitleKeys = computed(() => {
    if (singleModePageRebateKind.value === 'hp') {
        const sources =
            pageHeatingTypes.value.length > 0
                ? pageHeatingTypes.value
                : [pageHeatingType.value];

        return Array.from(
            new Set(
                sources
                    .flatMap((item) => extractHeatingTitleKeys(item))
                    .filter(Boolean)
            )
        );
    }

    if (singleModePageRebateKind.value === 'hpwh') {
        return Array.from(
            new Set(
                resolvedPageWaterHeatingSources.value
                    .flatMap((item) => extractHeatingTitleKeys(item))
                    .filter(Boolean)
            )
        );
    }

    return [];
});

const singleModeCanRetainLastValidTitle = computed(
    () =>
        mode.value === 'single' &&
        Boolean(singleModePageRebateKind.value) &&
        singleModeCurrentPageAllowedTitleKeys.value.length > 1
);

const singleModeResolvedTitleHtml = computed(() => {
    if (!singleModeCanRetainLastValidTitle.value) return '';

    const selectedKey = singleModeCurrentTitleHeatingKey.value;
    if (!selectedKey) return '';

    if (!singleModeCurrentPageAllowedTitleKeys.value.includes(selectedKey)) {
        return '';
    }

    return (
        singleModeTitleHtmlByKind[singleModePageRebateKind.value]?.[
            selectedKey
        ] || ''
    );
});

watch(
    [
        currentPagePathname,
        singleModePageRebateKind,
        pageRebateType,
        pageHeatingType,
        pageWaterHeatingType,
        pageWaterHeatingTypes,
    ],
    () => {
        singleModeTitleOriginalText.value = '';
        singleModeLastValidTitleHtml.value = '';
    },
    { flush: 'post' }
);

/**
 * Initialize form state from current query string params.
 */
function initFromQueryString() {
    const urlParams = new URLSearchParams(window.location.search);
    const tool = urlParams.get('tool');
    if (tool && tool !== 'rebates') return;

    const type = urlParams.get('type');
    const group = urlParams.get('group');
    const tenure = urlParams.get('tenure');
    const homeValue = urlParams.get('home_value');
    const persons = urlParams.get('persons');
    const income = urlParams.get('income');
    const location = urlParams.get('location');
    const heating = urlParams.get('heating');
    const waterHeating = urlParams.get('water_heating');
    const utility = urlParams.get('utility');
    const gas = urlParams.get('gas');

    const restoredBuildingTypeSlug = getRestoredBuildingTypeSlug({
        type,
        group,
        mode: mode.value,
        buildingTypeGroups: buildingTypeGroups.value,
    });
    if (restoredBuildingTypeSlug) {
        selectedBuildingTypeSlug.value = restoredBuildingTypeSlug;
    }

    if (tenure && (tenure === 'own' || tenure === 'rent'))
        murbTenure.value = tenure;

    if (homeValue) {
        const foundHV = homeValueOptions.value.find(
            (h) => h.slug === homeValue
        );
        if (foundHV) selectedHomeValueSlug.value = homeValue;
    }

    if (persons) {
        const personsOk = personCountOptions.value.some(
            (p) => p.slug === persons
        );
        if (personsOk) selectedPersonsSlug.value = persons;
    }

    if (income) {
        const incomeOk = incomeRangeOptions.value.some(
            (r) => r.slug === income
        );
        if (incomeOk) selectedIncomeRangeSlug.value = income;
    }

    if (location) {
        const foundLoc = locationOptionsForInput.value.find(
            (l) => l.name === location
        );
        if (foundLoc) selectedLocationSlug.value = foundLoc.slug;
    }

    if (heating) {
        const foundHeat = findHeatingOptionByValue(
            heatingOptions.value,
            heating
        );
        if (foundHeat) selectedHeatingSlug.value = foundHeat.slug;
    }

    if (waterHeating) {
        const foundWaterHeat = findHeatingOptionByValue(
            waterHeatingOptions.value,
            waterHeating
        );
        if (foundWaterHeat)
            selectedWaterHeatingSlug.value = foundWaterHeat.slug;
    }

    if (utility) {
        const foundUtil = utilityOptions.value.find((l) => l.name === utility);
        if (foundUtil) selectedUtilitySlug.value = foundUtil.slug;
    }

    if (gas) {
        const foundGas = gasOptions.value.find((g) => g.name === gas);
        if (foundGas) selectedGasSlug.value = foundGas.slug;
    }
}

// -- URL state deps --
const urlStateDeps = computed(() => ({
    type: selectedBuildingTypeSlug.value,
    group: selectedBuildingGroupSlug.value,
    tenure: murbTenure.value,
    home_value: selectedHomeValueSlug.value,
    persons: selectedPersonsSlug.value,
    income: selectedIncomeRangeSlug.value,
    location: selectedLocationSlug.value,
    heating: selectedHeatingSlug.value,
    water_heating: selectedWaterHeatingSlug.value,
    utility: selectedUtilitySlug.value,
    gas: selectedGasSlug.value,
    region: selectedRegion.value,
}));

watch(
    [
        mode,
        isReadyToRender,
        currentQueryString,
        singleModeResolvedTitleHtml,
        singleModeCanRetainLastValidTitle,
        isSingleModeTitleAwaitingAjax,
    ],
    ([currentMode, readyToRender, , , , awaitingAjax]) => {
        if (currentMode !== 'single') {
            setSingleModeHeatingTitleVisibility(true);
            return;
        }
        if (!readyToRender) {
            setSingleModeHeatingTitleVisibility(false);
            return;
        }
        if (awaitingAjax) return;
        queueHeatingTitleUpdate();
    },
    { immediate: true, flush: 'post' }
);

watch(
    urlStateDeps,
    (currentState, previousState) => {
        if (!bootstrapped.value) return;
        if (!isReadyToRender.value) return;
        if (mode.value !== 'single') return;
        if (!previousState) return;
        if (!singleModePageLoadDialogHandled.value) return;
        if (isSingleModeDialogOpen.value) return;

        const changedField = getSingleModeChangedField(
            currentState,
            previousState
        );
        if (!changedField) return;

        void maybeOpenSingleModeAlternateRebateDialog(changedField);
    },
    { deep: true, flush: 'post' }
);

watch([hasAnyError, mode, singleModePageEligible], () => {
    if (!bootstrapped.value) return;
    if (mode.value !== 'single') return;
    updateAddressBar();
});

/**
 * Update the browser address bar to match assembled state.
 */
function updateAddressBar() {
    const url = assembledUrl.value;
    try {
        window.history.replaceState(null, '', url);
        currentQueryString.value = assembledQueryString.value;
    } catch (e) {
        // no-op.
    }
}

// -- ESP Tier derivation --
const espTier = computed(() => {
    const incomeSlug = selectedIncomeRangeSlug.value;
    if (!incomeSlug) return '';

    if (!hasAllSelection.value) return '';

    const selectedHV = homeValueOptions.value.find(
        (v) => v.slug === selectedHomeValueSlug.value
    );
    const hvSlug = selectedHV?.slug || '';
    const isMurb = selectedBuildingGroupSlug.value === 'murb';

    // Derive rebate tier from income.
    let derivedTier = '';

    if (/-t1$/.test(incomeSlug)) derivedTier = 'ESP-1';
    else if (/-t2$/.test(incomeSlug)) derivedTier = 'ESP-2';
    else if (/-t3$/.test(incomeSlug)) derivedTier = 'ESP-3';
    else if (/-t0$/.test(incomeSlug)) derivedTier = 'HRR';
    else return '';

    // Enforce minimum tier based on home value.

    // console.log('isMurb',isMurb)

    // MURB.
    if (isMurb) {
        const overLimit = hvSlug === 'over-754000';
        // Over threshold enforces HRR, otherwise preserve income-derived tier.
        return overLimit ? 'HRR' : derivedTier;
    }

    // Ground-oriented dwellings.
    if (hvSlug === 'over-1820000') {
        return 'HRR';
    }

    if (hvSlug === 'over-1230000') {
        if (derivedTier === 'HRR') return 'HRR';
        return 'ESP-3';
    }

    if (hvSlug === '1230000-or-less') {
        return derivedTier;
    }

    return '';
});

// Hydrate preferredSettings whenever location becomes valid
watch(
    [selectedLocationSlug, selectedLocationName, locationOptionsForInput],
    () => {
        if (!bootstrapped.value) return;
        hydratePreferredSettingsFromRebateToolSettings();
    },
    { deep: false, immediate: true }
);

// Save preferredSettings whenever a valid program tier is available
watch(
    espTier,
    (newTier) => {
        if (!bootstrapped.value) return;
        if (!newTier) return;
        writePreferredSettings({ esp_tier: newTier });
    },
    { immediate: true }
);

const normalizeUtilitySlug = (val) => {
    if (!val) return '';
    const v = val.toLowerCase().trim();
    if (v.includes('bc hydro')) return 'bc-hydro';
    if (v.includes('fortis')) return 'fortisbc';
    if (v.includes('grand forks')) return 'grand-forks';
    if (v.includes('nelson')) return 'nelson';
    if (v.includes('new west')) return 'new-westminster';
    if (v.includes('penticton')) return 'penticton';
    if (v.includes('summerland')) return 'summerland';
    return v.replace(/\s+/g, '-'); // fallback slugify.
};

const normalizeGasSlug = (val) => {
    if (!val) return '';
    const v = val.toLowerCase().trim();
    if (v.includes('fortis')) return 'fortisbc-gas';
    if (v.includes('no gas')) return 'no-gas';
    if (v.includes('pacific')) return 'png-gas';
    if (v.includes('tank propane')) return 'tank-gas';
    return v.replace(/\s+/g, '-'); // fallback slugify.
};

// Normalize region ("North" to "north").
const normalizeRegionSlug = (val) => {
    if (!val) return '';
    return val.toLowerCase().trim();
};

// Normalize location ("100 Mile House" to "100-mile-house").
const normalizeLocationSlug = (val) => {
    if (!val) return '';
    return val.toLowerCase().trim().replace(/\s+/g, '-');
};

const filteredResults = computed(() => {
    const normalizedHeating = normalizeHeatingSlug(selectedHeatingName.value);
    const normalizedWaterHeating = normalizeHeatingSlug(
        selectedWaterHeatingName.value
    );
    const normalizedUtility = normalizeUtilitySlug(selectedUtilityName.value);
    const normalizedGas = normalizeGasSlug(selectedGasName.value);
    const normalizedRegion = normalizeRegionSlug(selectedRegionName.value);
    const normalizedLocation = normalizeLocationSlug(
        selectedLocationName.value
    );
    const normalizedEspTier = espTier.value?.toLowerCase?.();
    const normalizedBuildingGroup =
        selectedBuildingGroupSlug.value?.toLowerCase?.();

    const results = api.value.results.filter((item) => {
        // Applicable rebates
        const applicable = Array.isArray(item.applicable_rebates)
            ? item.applicable_rebates
                  .map((r) => r?.slug?.toLowerCase?.())
                  .filter(Boolean)
            : [];
        const applicableSet = new Set(applicable);

        // Respect "no-show" unconditionally
        const showInResults = !applicableSet.has('no-show');
        if (!showInResults) return false;

        // ESP tier eligibility
        const hasApplicableRebates = applicable.length > 0;
        const rebateTierEligible = hasApplicableRebates
            ? normalizedEspTier
                ? applicableSet.has(normalizedEspTier)
                : true
            : !normalizedEspTier ||
              ['esp-1', 'esp-2', 'esp-3'].includes(normalizedEspTier);

        // HRR fallback rule
        const hasHRR = applicableSet.has('hrr');
        const isHrrTier = normalizedEspTier === 'hrr';
        const hasESP3 = applicableSet.has('esp-3');
        const isHighTier = ['esp-3', 'hrr'].includes(normalizedEspTier);
        const hrrEligible = hasHRR && !hasESP3 && isHighTier;

        const tierEligible = rebateTierEligible || hrrEligible;

        // Building type eligibility
        const hasTypeInfo = Array.isArray(item.types) && item.types.length > 0;
        const buildingTypeEligible = hasTypeInfo
            ? item.types.some(
                  (t) => t?.slug?.toLowerCase?.() === normalizedBuildingGroup
              )
            : true;

        const rebateClass = (item.rebate_type_class || '').toLowerCase();

        // Heating types present on the rebate
        const heatingTypeSlugs = Array.isArray(item.heating_types)
            ? item.heating_types
                  .map((sys) => sys?.slug?.toLowerCase?.())
                  .filter(Boolean)
            : [];

        // Eligibility against "How do you heat the rooms in your home?"
        const roomHeatingEligible =
            !normalizedHeating ||
            heatingTypeSlugs.length === 0 ||
            heatingTypeSlugs.includes(normalizedHeating);

        // Eligibility against "How do you heat your water?"
        const waterHeatingEligible =
            !normalizedWaterHeating ||
            heatingTypeSlugs.length === 0 ||
            heatingTypeSlugs.includes(normalizedWaterHeating);

        // Decide which heating question to use based on rebate type
        let heatingEligible;

        if (rebateClass === 'heat-pump-water-heater-rebates') {
            // Tie to "How do you heat your water?"
            heatingEligible = waterHeatingEligible;
        } else if (rebateClass === 'heat-pump-rebates') {
            // Tie to "How do you heat the rooms in your home?"
            heatingEligible = roomHeatingEligible;
        } else {
            // Default: space heating
            heatingEligible = roomHeatingEligible;
        }

        // STRICT GUARD : Heating must match (after we've chosen which one matters)
        if (!heatingEligible) {
            if (debug) {
                console.group(
                    'GUARD 1: ',
                    item.rebate_type_headline_card,
                    item.title.toLowerCase()
                );
                console.log(
                    'Not in rebate list:',
                    false,
                    '(blocked by heating)'
                );
                console.log('rebateClass:', rebateClass);
                console.log('normalizedHeating (rooms):', normalizedHeating);
                console.log(
                    'normalizedWaterHeating (water):',
                    normalizedWaterHeating
                );
                console.log('heatingTypeSlugs:', heatingTypeSlugs);
                console.groupEnd();
            }
            return false;
        }

        // BEGIN EDGE CASE GUARDS

        // Additional guard helpers
        const isMurbBuilding = normalizedBuildingGroup === 'murb';
        const isGodBuilding =
            normalizedBuildingGroup === 'ground-oriented-dwellings';
        const isHP = rebateClass === 'heat-pump-rebates';
        const isHPWH = rebateClass === 'heat-pump-water-heater-rebates';
        const isWindowsDoors = rebateClass === 'window-and-door-rebates';
        const isInsulation = rebateClass === 'insulation-rebates';
        const utilityIsBCHydro = normalizedUtility === 'bc-hydro';
        const utilityIsBCHydroOrNW =
            normalizedUtility === 'bc-hydro' ||
            normalizedUtility === 'new-westminster';
        const roomIsElectric = normalizedHeating === 'electricity';
        const roomIsOil = normalizedHeating === 'oil';
        const roomIsWood = normalizedHeating === 'wood';
        const waterIsElectric = normalizedWaterHeating === 'electricity';
        const waterIsWood = normalizedWaterHeating === 'wood';
        const roomIsElectricHP = selectedHeatingSlug.value === 'electric-hp';
        const waterIsElectricHPWH =
            selectedWaterHeatingSlug.value === 'electric-hpwh';
        const northernRequired =
            applicableSet.has('hrr') && applicableSet.has('north');
        const userRegionNorth = normalizedRegion === 'north';
        const currentUtility = normalizedUtility; // slug ('bc-hydro', 'fortisbc', etc.)
        const locationIsVancouver = normalizedLocation === 'vancouver';
        const utilityIsOther =
            selectedUtilitySlug.value === 'other' ||
            normalizedUtility === 'other';

        // GUARD : Utility "other" should return no eligible rebates.
        if (utilityIsOther) {
            if (debug) {
                console.group(
                    'GUARD utility-other:',
                    item.rebate_type_headline_card,
                    item.title?.toLowerCase?.()
                );
                console.log(
                    'Not in rebate list:',
                    false,
                    '(blocked: electricity provider is "other")'
                );
                console.log('selectedUtilitySlug:', selectedUtilitySlug.value);
                console.log('normalizedUtility:', normalizedUtility);
                console.groupEnd();
            }
            return false;
        }

        // Guard : Ground-oriented heat pump/hp water heaters rules for ESP-3 + HRR wood
        const godHPIneligible = isGroundOrientedHeatPumpIneligible({
            isGodBuilding,
            isHighTier,
            isHP,
            isHPWH,
            roomIsWood,
            waterIsWood,
        });

        if (godHPIneligible) {
            return false;
        }

        // // Guard : Ground-oriented windows and doors rules for ESP-3 + HRR wood/oil/non-FortisBC gas/Vancouver
        // const godWindowsWoodOilVanIneligible =
        // ( isGodBuilding && isHighTier && isWindowsDoors ) && (
        //   roomIsWood ||
        //   roomIsOil ||
        //   (normalizedHeating === 'gas' && normalizedGas !== 'fortisbc-gas') // room cannot be wood, oil, or non-FortisBC gas
        // ) || ( locationIsVancouver && isWindowsDoors )

        // if (godWindowsWoodOilVanIneligible) {
        //   return false
        // }

        // // Guard : Ground-oriented insulation rules for ESP-3 + HRR wood/oil/non-FortisBC gas
        // const godInsulationWoodOilIneligible =
        // ( isGodBuilding && isHighTier && isInsulation ) && (
        //   roomIsWood ||
        //   roomIsOil ||
        //   (normalizedHeating === 'gas' && normalizedGas !== 'fortisbc-gas') // room cannot be wood, oil, or non-FortisBC gas
        // )

        // if (godInsulationWoodOilIneligible) {
        //   return false
        // }

        // Guard : Ground-oriented windows and doors rules for ESP-3 + HRR wood/Vancouver
        const godWindowsWoodVanIneligible =
            (isGodBuilding && isHighTier && isWindowsDoors && roomIsWood) || // room cannot be wood
            (locationIsVancouver && isWindowsDoors);

        if (godWindowsWoodVanIneligible) {
            return false;
        }

        // Guard : Ground-oriented insulation rules for ESP-3 + HRR wood
        const godInsulationWoodIneligible =
            isGodBuilding && isHighTier && isInsulation && roomIsWood; // room cannot be wood

        if (godInsulationWoodIneligible) {
            return false;
        }

        // GUARD : Heat pump water heater business rules for MURB
        const hpwhIneligible =
            (isHPWH && isMurbBuilding && !waterIsElectric) || // water heating must be electricity
            (isHPWH && isMurbBuilding && isHighTier && !utilityIsBCHydroOrNW); // utility must be BC Hydro or New Westminster

        if (hpwhIneligible) {
            if (debug) {
                console.group(
                    'GUARD 0 (HPWH MURB):',
                    item.rebate_type_headline_card,
                    item.title?.toLowerCase?.()
                );
                console.log(
                    'Not in rebate list:',
                    false,
                    '(HPWH MURB rules: utility BC Hydro/New West, water electric)'
                );
                console.log(
                    'normalizedBuildingGroup:',
                    normalizedBuildingGroup
                );
                console.log('normalizedUtility:', normalizedUtility);
                console.log('normalizedHeating (rooms):', normalizedHeating);
                console.log(
                    'normalizedWaterHeating (water):',
                    normalizedWaterHeating
                );
                console.groupEnd();
            }
            return false;
        }

        // GUARD : Electric HP room-heating selection cannot qualify for generic HP rebates.
        if (isHP && roomIsElectricHP) {
            return false;
        }

        // GUARD : Electric HPWH water-heating selection cannot qualify for generic HPWH rebates.
        if (isHPWH && waterIsElectricHPWH) {
            return false;
        }

        // GUARD : MURB utility rules
        // Apply to room-heating rebates. HPWH utility logic is handled by GUARD 0 above.
        const murbUtilityBlocked =
            isMurbBuilding &&
            isHrrTier &&
            !isHPWH &&
            currentUtility &&
            !utilityIsBCHydroOrNW;

        if (murbUtilityBlocked) {
            if (debug) {
                console.group(
                    'GUARD 2: ',
                    item.rebate_type_headline_card,
                    item.title.toLowerCase()
                );
                console.log(
                    'Not in rebate list:',
                    false,
                    '(blocked by MURB+HRR room-heating rules: utility must be BC Hydro or New Westminster)'
                );
                console.log('isMurbBuilding', isMurbBuilding);
                console.log('isHrrTier', isHrrTier);
                console.log('isHPWH', isHPWH);
                console.log('currentUtility', currentUtility);
                console.groupEnd();
            }
            return false;
        }

        // GUARD : Ground utility rules
        // Disallow ANY non-BC Hydro utility for HRR + North restricted offers.
        const regionAndHRRBCHydro = (() => {
            // Rebate is explicitly marked as HRR + North in applicableSet.
            const rebateHRRNorthRestricted =
                isHrrTier && applicableSet.has('north');

            // If the rebate is NOT explicitly HRR+North restricted, this guard does nothing.
            if (!rebateHRRNorthRestricted) {
                return true;
            }

            const tierIsConstrained = isHrrTier;

            if (!(isGodBuilding && tierIsConstrained)) {
                return true;
            }
            // Only blocked case:
            const blocked =
                !userRegionNorth || // HRR user must be in North
                (userRegionNorth && !utilityIsBCHydro); // and if North, must be BC Hydro

            if (blocked) {
                if (debug) {
                    console.group(
                        'GUARD 3: ',
                        item.rebate_type_headline_card,
                        item.title.toLowerCase()
                    );
                    console.log(
                        'Not in rebate list:',
                        false,
                        '(blocked: HRR user must be in North for HRR+North/BC Hydro-restricted rebate)'
                    );
                    console.log('normalizedEspTier:', normalizedEspTier);
                    console.log('normalizedRegion:', normalizedRegion);
                    console.log(
                        'rebateHRRNorthRestricted:',
                        rebateHRRNorthRestricted
                    );
                    console.log('applicableSet:', applicableSet);
                    console.groupEnd();
                }
                return false;
            }

            // All other combinations are OK.
            return true;
        })();

        if (!regionAndHRRBCHydro) return false;

        // END OF EDGE CASE GUARDS

        // Region slugs + eligibility
        const regionSlugs = Array.isArray(item.regions)
            ? item.regions.map((r) => r?.toLowerCase?.()).filter(Boolean)
            : [];

        const regionEligible =
            !normalizedRegion ||
            regionSlugs.length === 0 ||
            regionSlugs.includes(normalizedRegion);

        // Utility slugs + eligibility
        const utilitySlugs = Array.isArray(item.utilities)
            ? item.utilities
                  .map((u) => u?.slug?.toLowerCase?.())
                  .filter(Boolean)
            : [];

        const utilityEligible =
            !normalizedUtility ||
            utilitySlugs.length === 0 ||
            utilitySlugs.includes(normalizedUtility);

        // Gas slugs + eligibility
        const gasSlugs = Array.isArray(item.gas)
            ? item.gas.map((g) => g?.slug?.toLowerCase?.()).filter(Boolean)
            : [];

        const gasEligible =
            !normalizedGas ||
            gasSlugs.length === 0 ||
            gasSlugs.includes(normalizedGas);

        // Location eligibility
        const locationEligible =
            !normalizedLocation ||
            !Array.isArray(item.locations) ||
            item.locations.length === 0 ||
            item.locations.some(
                (l) => l?.slug?.toLowerCase?.() === normalizedLocation
            );

        // cross-field slug matches (OR logic)
        // If any applicable slug matches a region/utility/gas slug,
        // treat that as eligible even if tier wouldn't otherwise match.
        const geoOrServiceSlugMatch =
            regionSlugs.some((slug) => applicableSet.has(slug)) ||
            utilitySlugs.some((slug) => applicableSet.has(slug)) ||
            gasSlugs.some((slug) => applicableSet.has(slug));

        // tier OR cross-field slug match
        const tierOrSlugEligible = tierEligible || geoOrServiceSlugMatch;

        // Standard strict checks (old behaviour).
        const strictEligibility = tierOrSlugEligible && buildingTypeEligible;

        // "Others" that can fail before additive kicks in.
        const baseEligibility =
            tierOrSlugEligible &&
            regionEligible &&
            utilityEligible &&
            buildingTypeEligible;

        // Additive eligibility: any match allows inclusion.
        const additiveEligibility =
            utilitySlugs.some((slug) => applicableSet.has(slug)) ||
            gasEligible ||
            regionEligible;

        // Final rule:
        // 1) Keep strict mode passing in all cases
        // 2) If strict mode fails:
        //    include item if heating passed (above)
        //    AND baseEligibility failed
        //    AND ANY additive field is true
        const shouldInclude =
            strictEligibility ||
            (!baseEligibility && buildingTypeEligible && additiveEligibility);

        if (debug) {
            console.group(
                'PASSED: ',
                item.rebate_type_headline_card,
                item.title.toLowerCase()
            );
            console.log(
                'tierOrSlugEligible:',
                tierOrSlugEligible,
                '| tier:',
                normalizedEspTier,
                '| geoOrServiceSlugMatch:',
                geoOrServiceSlugMatch
            );
            console.log(
                'buildingTypeEligible:',
                buildingTypeEligible,
                '| normalizedBuildingGroup:',
                normalizedBuildingGroup.split(' ')
            );
            console.log(
                'heatingEligible:',
                heatingEligible,
                '| normalizedHeating:',
                normalizedHeating.split(' '),
                '| normalizedWaterHeating:',
                normalizedWaterHeating.split(' ')
            );
            console.log(
                'locationEligible:',
                locationEligible,
                '| normalizedLocation:',
                normalizedLocation.split(' ')
            );
            console.log(
                'regionEligible:',
                regionEligible,
                '| regionSlugs:',
                regionSlugs,
                '| normalizedRegion:',
                normalizedRegion.split(' ')
            );
            console.log(
                'utilityEligible:',
                utilityEligible,
                '| utilitySlugsHasApplicable:',
                utilitySlugs.some((slug) => applicableSet.has(slug)),
                '| normalizedUtility:',
                normalizedUtility.split(' ')
            );
            console.log(
                'gasEligible:',
                gasEligible,
                '| gasSlugs:',
                gasSlugs,
                '| normalizedGas:',
                normalizedGas.split(' ')
            );
            console.log('applicableSet:', applicableSet);
            console.log('geoOrServiceSlugMatch:', geoOrServiceSlugMatch);
            console.log('strictEligibility:', strictEligibility);
            console.log('baseEligibility:', baseEligibility);
            console.log('additiveEligibility:', additiveEligibility);
            console.log('returns in rebate list:', shouldInclude);
            console.groupEnd();
        }

        return shouldInclude;
    });

    nextTick(() => runOptionalGlobal('cleanbcdxBhRebatesArchiveLoader'));

    return results.sort((a, b) => {
        const nameA = (a.rebate_type_headline_card || '').toLowerCase();
        const nameB = (b.rebate_type_headline_card || '').toLowerCase();
        return nameA.localeCompare(nameB);
    });
});

watch(
    [
        mode,
        isReadyToRender,
        hasAllSelection,
        singleModePrimaryFieldsCompleteForCurrentPage,
        () => filteredResults.value.length,
    ],
    () => {
        void maybeOpenSingleModeInvalidQueryDialogOnLoad();
    },
    { immediate: true }
);

// Archive UX: default to list view when results narrow to a single card.
watch(
    [mode, () => filteredResults.value.length, viewPreferenceLoaded],
    ([currentMode, resultCount, isLoaded], oldValues = []) => {
        if (!isLoaded) return;
        if (currentMode !== 'archive') return;

        const previousResultCount = oldValues[1];
        const enteredSingleResult =
            resultCount === 1 && previousResultCount !== 1;

        if (enteredSingleResult) {
            displayGridOrList.value = false;
            persistDisplayViewPreference();
        }
    },
    { immediate: true }
);

/**
 * Return a URL with the current query string appended.
 */
function withQueryString(baseUrl, queryOverrides = null) {
    if (!baseUrl) return '#';
    const qs = assembledQueryString.value;
    if (!qs && !queryOverrides) return baseUrl;
    try {
        const urlObj = new URL(baseUrl, window.location.origin);
        const params = new URLSearchParams((qs || '').replace(/^\?/, ''));

        if (queryOverrides && typeof queryOverrides === 'object') {
            Object.entries(queryOverrides).forEach(([key, value]) => {
                if (value === null || value === undefined || value === '') {
                    params.delete(key);
                    return;
                }

                params.set(key, String(value));
            });
        }

        const queryString = params.toString();
        return queryString
            ? `${urlObj.origin}${urlObj.pathname}?${queryString}`
            : `${urlObj.origin}${urlObj.pathname}`;
    } catch (e) {
        return baseUrl + (qs || '');
    }
}
</script>

<style scoped>
#vnextRebateFilterApp {
    /* Minimal utility styles to make the component usable without external scripts. */
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: clip;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }

    .inner {
        display: grid !important;
        gap: 1rem;
    }

    .filter-container {
        display: grid !important;
        gap: 1rem;
        padding: 0;
        grid-template-columns: 1fr;
    }

    .settings-headline {
        font-size: 0.75rem;
        margin-block-end: 0;
        margin-block-start: 0.25rem;
        padding: 1rem 2rem 0 2rem;

        @media (width > 550px) {
            margin-block-start: 0;
            font-size: 1.15rem;
        }

        &::before {
            display: inline-block;
            /* house icon */
            content: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxOCAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3Ljk2ODggOEMxNy45Njg4IDguNTYyNSAxNy41IDkgMTYuOTY4OCA5SDE1Ljk2ODhMMTYgMTRDMTYgMTQuMDkzOCAxNiAxNC4xODc1IDE2IDE0LjI1VjE0Ljc1QzE2IDE1LjQ2ODggMTUuNDM3NSAxNiAxNC43NSAxNkgxNC4yNUMxNC4xODc1IDE2IDE0LjE1NjIgMTYgMTQuMTI1IDE2QzE0LjA5MzggMTYgMTQuMDMxMiAxNiAxNCAxNkgxM0gxMi4yNUMxMS41MzEyIDE2IDExIDE1LjQ2ODggMTEgMTQuNzVWMTRWMTJDMTEgMTEuNDY4OCAxMC41MzEyIDExIDEwIDExSDhDNy40Mzc1IDExIDcgMTEuNDY4OCA3IDEyVjE0VjE0Ljc1QzcgMTUuNDY4OCA2LjQzNzUgMTYgNS43NSAxNkg1SDRDMy45Mzc1IDE2IDMuOTA2MjUgMTYgMy44NDM3NSAxNkMzLjgxMjUgMTYgMy43ODEyNSAxNiAzLjc1IDE2SDMuMjVDMi41MzEyNSAxNiAyIDE1LjQ2ODggMiAxNC43NVYxMS4yNUMyIDExLjI1IDIgMTEuMjE4OCAyIDExLjE4NzVWOUgxQzAuNDM3NSA5IDAgOC41NjI1IDAgOEMwIDcuNzE4NzUgMC4wOTM3NSA3LjQ2ODc1IDAuMzEyNSA3LjI1TDguMzEyNSAwLjI1QzguNTMxMjUgMC4wMzEyNSA4Ljc4MTI1IDAgOSAwQzkuMjE4NzUgMCA5LjQ2ODc1IDAuMDYyNSA5LjY1NjI1IDAuMjE4NzVMMTcuNjI1IDcuMjVDMTcuODc1IDcuNDY4NzUgMTggNy43MTg3NSAxNy45Njg4IDhaIiBmaWxsPSIjMzY5Ii8+Cjwvc3ZnPg==);
            margin-right: 0.5rem;
        }
    }

    #rebatesFilterControls {
        container-type: inline-size;
        container-name: filter;

        &.collapsed {
            height: 3.75rem;
            overflow: clip;
        }

        :is(button).rebate-collapse-setting {
            all: unset;
            height: calc(1.25rem + 2px);
            width: calc(100% - 2rem);
            border-radius: 0.5rem;
            font-size: 0;
            cursor: pointer;
            position: absolute;
            right: 0;
            top: 0.25rem;
            padding: 1rem;
            background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSIjMzY5IiBkPSJNMjM5IDQ5OC43bDE2MC0xMjggMTguNy0xNS0zMC0zNy41LTE4LjcgMTUtMTQ1IDExNkw3OSAzMzMuM2wtMTguNy0xNS0zMCAzNy41IDE4LjcgMTUgMTYwIDEyOCAxNSAxMiAxNS0xMnptMC00ODUuNWwtMTUtMTItMTUgMTJMNDkgMTQxLjNsLTE4LjcgMTUgMzAgMzcuNSAxOC43LTE1IDE0NS0xMTYgMTQ1IDExNiAxOC43IDE1IDMwLTM3LjUtMTguNy0xNUwyMzkgMTMuM3oiLz48L3N2Zz4=);
            background-repeat: no-repeat;
            background-position: center right 2rem;
            background-size: 1rem;

            /* &:is(:focus, :focus-visible) {
        outline: 2px solid #369;
        outline-offset: 0 -4px;
      } */
        }

        &:has(.stacked) {
            box-shadow: none;
            padding: 0;
        }
    }

    .rebate-collapse-setting[aria-expanded='false'] + .control-container {
        opacity: 0;
    }

    .control-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
        gap: 1rem;
        grid-column: 1 / -1;
        padding: 0px 2rem 2rem;

        &.stacked {
            counter-reset: question;

            .question-container {
                display: grid;
                grid-template-columns: 0 2.5rem 1fr; /* was: 3px 8rem 1fr */
                position: relative;

                &::before {
                    /* border-left: 3px solid #369; */
                    content: '';
                    height: 100%;
                    width: 3px;
                    position: relative;
                    /* left: calc(3rem + 2px); */
                    z-index: 0;
                }

                /* &:last-of-type::before {
          border-bottom: 3px solid #369;
          width: 1rem;
          margin-inline-start: 0.25rem;
        } */
            }

            .num-label {
                display: grid;
                justify-content: center;
                align-content: center;
                /* border: 3px solid #369;
        border-radius: 100vw; */
                background-color: white;
                width: 1.5rem;
                height: 1.5rem;
                z-index: 1;
                position: relative;

                /* &::before {
          counter-increment: question;
          content: counter(question);

          color: #369;
          font-size: 2rem;
          font-family: Verdana, Arial, sans-serif;
        } */

                &::after {
                    border: 3px solid darkgreen;
                    border-radius: 100vw;
                    background-color: white;
                    content: '';
                    /* Check mark – success */
                    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSJsaW1lZ3JlZW4iICBvcGFjaXR5PSIuMyIgZD0iTTAgMjU2YTI1NiAyNTYgMCAxIDAgNTEyIDBBMjU2IDI1NiAwIDEgMCAwIDI1NnptMTI2LjEgMEwxNjAgMjIyLjFjLjMgLjMgLjYgLjYgMSAxYzUuMyA1LjMgMTAuNyAxMC43IDE2IDE2YzE1LjcgMTUuNyAzMS40IDMxLjQgNDcgNDdjMzctMzcgNzQtNzQgMTExLTExMWM1LjMtNS4zIDEwLjctMTAuNyAxNi0xNmMuMy0uMyAuNi0uNiAxLTFMMzg1LjkgMTkyYy0uMyAuMy0uNiAuNi0xIDFsLTE2IDE2TDI0MSAzMzdsLTE3IDE3LTE3LTE3LTY0LTY0Yy01LjMtNS4zLTEwLjctMTAuNy0xNi0xNmwtMS0xeiIvPjxwYXRoIGZpbGw9ImRhcmtncmVlbiIgZD0iTTM4NSAxOTNMMjQxIDMzN2wtMTcgMTctMTctMTctODAtODBMMTYxIDIyM2w2MyA2M0wzNTEgMTU5IDM4NSAxOTN6Ii8+PC9zdmc+);
                    background-size: contain;
                    height: 1.5rem;
                    width: 1.5rem;
                    position: absolute;
                    right: -2px;
                    top: -2px;
                    z-index: 1;
                }
            }

            /* Question mark */
            .question-container:has(.location-input.is-empty) .num-label:after,
            :has(.select option[data-default='Select an option']:checked)
                .num-label::after {
                /* Pending */
                border: 3px solid #bfdfe7;
                background-image: none;
                /* background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSJ3aGl0ZSIgIGQ9Ik0wIDI1NmEyNTYgMjU2IDAgMSAwIDUxMiAwQTI1NiAyNTYgMCAxIDAgMCAyNTZ6bTE2OC03MmMwLS41IDAtMSAwIDB6bTY0IDE1Mmw0OCAwYzAgMTYgMCAzMiAwIDQ4bC00OCAwYzAtMTYgMC0zMiAwLTQ4eiIvPjxwYXRoIGZpbGw9IiMzNjkiIG9wYWNpdHk9IjAuNzUiIGQ9Ik0yMjQgMTI4Yy0zMC45IDAtNTYgMjUuMS01NiA1NmwwIDYuNSA0OCAwIDAtNi41YzAtNC40IDMuNi04IDgtOGw1Ni45IDBjOC40IDAgMTUuMSA2LjggMTUuMSAxNS4xYzAgNS40LTIuOSAxMC40LTcuNiAxMy4xbC00NC4zIDI1LjRMMjMyIDIzNi42bDAgMTMuOSAwIDIxLjUgMCAyNCA0OCAwIDAtMjQgMC03LjYgMzIuMy0xOC41YzE5LjYtMTEuMyAzMS43LTMyLjIgMzEuNy01NC44YzAtMzQuOS0yOC4zLTYzLjEtNjMuMS02My4xTDIyNCAxMjh6bTU2IDIwOGwtNDggMCAwIDQ4IDQ4IDAgMC00OHoiLz48L3N2Zz4=); */
            }

            /* Exclamation mark */
            .question-container:has(.location-input.is-invalid)
                .num-label:after,
            :has(.select:disabled:not(.transition)) .num-label::after {
                border: 3px solid lightgray !important;
                /* Invalid */
                background-color: rgb(243, 243, 243);
                background-image: none !important;
                /* background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSJkYXJrZ3JheSIgb3BhY2l0eT0iLjMiIGQ9Ik0wIDI1NmEyNTYgMjU2IDAgMSAwIDUxMiAwQTI1NiAyNTYgMCAxIDAgMCAyNTZ6TTIzMiAxMjhsNDggMCAwIDI0IDAgMTEyIDAgMjQtNDggMCAwLTI0IDAtMTEyIDAtMjR6bTAgMTkybDQ4IDAgMCA0OC00OCAwIDAtNDh6Ii8+PHBhdGggZmlsbD0iZGFya2dyYXkiIGQ9Ik0yODAgMTUybDAtMjQtNDggMCAwIDI0IDAgMTEyIDAgMjQgNDggMCAwLTI0IDAtMTEyem0wIDE2OGwtNDggMCAwIDQ4IDQ4IDAgMC00OHoiLz48L3N2Zz4=) !important; */
            }

            /* X mark */
            .question-container:has(.location-input.is-error) .num-label:after,
            :has(.select.error) .num-label::after {
                border: 3px solid #8b0000 !important;
                /* Error */
                background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSJyZWQiIG9wYWNpdHk9Ii40IiBkPSJNMCAyNTZhMjU2IDI1NiAwIDEgMCA1MTIgMEEyNTYgMjU2IDAgMSAwIDAgMjU2em0xNTguMS02NGMxMS4zLTExLjMgMjIuNi0yMi42IDMzLjktMzMuOWM1LjcgNS43IDExLjMgMTEuMyAxNyAxN2MxNS43IDE1LjcgMzEuMyAzMS4zIDQ3IDQ3YzE1LjctMTUuNyAzMS4zLTMxLjMgNDctNDdjNS43LTUuNyAxMS4zLTExLjMgMTctMTdjMTEuMyAxMS4zIDIyLjYgMjIuNiAzMy45IDMzLjljLTUuNyA1LjctMTEuMyAxMS4zLTE3IDE3Yy0xNS43IDE1LjctMzEuMyAzMS4zLTQ3IDQ3YzE1LjcgMTUuNyAzMS40IDMxLjQgNDcgNDdjNS43IDUuNyAxMS4zIDExLjMgMTcgMTdMMzIwIDM1My45bC0xNy0xNy00Ny00N2MtMTUuNyAxNS43LTMxLjMgMzEuMy00NyA0N2MtNS43IDUuNy0xMS4zIDExLjMtMTcgMTdjLTExLjMtMTEuMy0yMi42LTIyLjYtMzMuOS0zMy45YzUuNy01LjcgMTEuMy0xMS4zIDE3LTE3YzE1LjctMTUuNyAzMS40LTMxLjQgNDctNDdjLTE1LjctMTUuNy0zMS4zLTMxLjMtNDctNDdjLTUuNy01LjctMTEuMy0xMS4zLTE3LTE3eiIvPjxwYXRoIGZpbGw9ImRhcmtyZWQiIGQ9Ik0zMzcgMjA5bDE3LTE3TDMyMCAxNTguMWwtMTcgMTctNDcgNDctNDctNDctMTctMTdMMTU4LjEgMTkybDE3IDE3IDQ3IDQ3LTQ3IDQ3LTE3IDE3TDE5MiAzNTMuOWwxNy0xNyA0Ny00NyA0NyA0NyAxNyAxN0wzNTMuOSAzMjBsLTE3LTE3LTQ3LTQ3IDQ3LTQ3eiIvPjwvc3ZnPg==) !important;
            }

            gap: 0;
            grid-template-columns: 1fr;

            @container filter (width < 680px) {
                grid-template-columns: 1fr;
            }

            :is(a).icon-definition.icon-definition,
            :is(a).icon-definition.icon-definition * {
                color: var(--wp--preset--color--primary-brand);
                text-decoration-style: dashed;
                text-decoration-color: var(--wp--preset--color--primary-brand);
                display: inline;
                font-size: 0.85rem;
            }

            .control {
                justify-content: start;
                margin-block: 0;
                gap: 0.5rem;
                padding-block-end: 3rem;

                :is(label) {
                    text-wrap: wrap;

                    @supports (text-wrap: pretty) {
                        text-wrap: pretty;
                    }

                    &::before {
                        content: none;
                    }
                }

                .select {
                    max-width: fit-content;
                    font-weight: normal;

                    background-color: #fff;
                    border: 2px solid transparent;

                    &.error {
                        /* background-color: #ffe5e5; */
                        color: #8b0000;
                        outline-color: #8b0000 !important;
                    }

                    &:disabled {
                        color: rgb(243, 243, 243) !important;
                        background-color: rgb(243, 243, 243);
                    }

                    &:is(:focus-visible, :focus) {
                        border: 2px solid #369 !important;
                        outline: 2px solid #369 !important;
                    }
                }

                :is(figcaption) {
                    padding: 0;
                }

                .location-input {
                    border: 0;
                    border-radius: 0.4375rem;
                    color: #369;
                    font-size: 1rem;
                    margin-block: 0.25rem;
                    padding: 0.5rem;
                    outline-offset: 2px;
                    outline: 2px solid
                        var(--wp--preset--color--custom-info-border);
                }

                .location-input:invalid {
                    outline-color: #8b0000;
                    background-color: #ffe5e5;
                }

                .location-input:is(:focus-visible) {
                    outline-color: var(--wp--preset--color--primary-brand);
                }

                .location-input {
                    border: 2px solid transparent;
                    border-radius: 0.4375rem;
                    color: #369;
                    font-size: 1rem;
                    margin-block: 0.25rem;
                    padding: 0.5rem;
                    outline-offset: 2px;
                    outline: 2px solid
                        var(--wp--preset--color--custom-info-border);
                    background-color: #fff;
                    max-width: 320px;
                }

                .location-input::-webkit-list-button,
                .location-input::-webkit-calendar-picker-indicator {
                    opacity: 0;
                    filter: size(0);
                }

                .location-input:is(:focus, :focus-visible) {
                    border: 2px solid #369 !important;
                }

                .location-input {
                    outline-color: var(
                        --wp--preset--color--custom-info-border,
                        #bfdfe7
                    );
                    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSIjMzY5IiBkPSJNMjQxIDM2OWMtOS40IDkuNC0yNC42IDkuNC0zMy45IDBMNDcgMjA5Yy05LjQtOS40LTkuNC0yNC42IDAtMzMuOXMyNC42LTkuNCAzMy45IDBsMTQzIDE0M0wzNjcgMTc1YzkuNC05LjQgMjQuNi05LjQgMzMuOSAwczkuNCAyNC42IDAgMzMuOUwyNDEgMzY5eiIvPjwvc3ZnPg==);
                    background-repeat: no-repeat;
                    background-position: right 0.75rem center;
                    background-size: 0.85rem;
                }

                /*
        .location-input.is-empty {
          outline-color: var(--wp--preset--color--custom-info-border, #bfdfe7);
          background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMzY5IiBvcGFjaXR5PSIxIiBkPSJNMCAyNTZhMjU2IDI1NiAwIDEgMCA1MTIgMEEyNTYgMjU2IDAgMSAwIDAgMjU2em0xNjgtNzJjMC0uNSAwLTEgMCAwem02NCAxNTJsNDggMGMwIDE2IDAgMzIgMCA0OGwtNDggMGMwLTE2IDAtMzIgMC00OHoiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjI0IDEyOGMtMzAuOSAwLTU2IDI1LjEtNTYgNTZsMCA2LjUgNDggMCAwLTYuNWMwLTQuNCAzLjYtOCA4LThsNTYuOSAwYzguNCAwIDE1LjEgNi44IDE1LjEgMTUuMWMwIDUuNC0yLjkgMTAuNC03LjYgMTMuMWwtNDQuMyAyNS40TDIzMiAyMzYuNmwwIDEzLjkgMCAyMS41IDAgMjQgNDggMCAwLTI0IDAtNy42IDMyLjMtMTguNWMxOS42LTExLjMgMzEuNy0zMi4yIDMxLjctNTQuOGMwLTM0LjktMjguMy02My4xLTYzLjEtNjMuMUwyMjQgMTI4em01NiAyMDhsLTQ4IDAgMCA0OCA0OCAwIDAtNDh6Ii8+PC9zdmc+);
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.25rem
        }

        .location-input.is-valid {
          outline-color: var(--wp--preset--color--custom-success-border, green);
          background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSJsaW1lZ3JlZW4iICBvcGFjaXR5PSIuMyIgZD0iTTAgMjU2YTI1NiAyNTYgMCAxIDAgNTEyIDBBMjU2IDI1NiAwIDEgMCAwIDI1NnptMTI2LjEgMEwxNjAgMjIyLjFjLjMgLjMgLjYgLjYgMSAxYzUuMyA1LjMgMTAuNyAxMC43IDE2IDE2YzE1LjcgMTUuNyAzMS40IDMxLjQgNDcgNDdjMzctMzcgNzQtNzQgMTExLTExMWM1LjMtNS4zIDEwLjctMTAuNyAxNi0xNmMuMy0uMyAuNi0uNiAxLTFMMzg1LjkgMTkyYy0uMyAuMy0uNiAuNi0xIDFsLTE2IDE2TDI0MSAzMzdsLTE3IDE3LTE3LTE3LTY0LTY0Yy01LjMtNS4zLTEwLjctMTAuNy0xNi0xNmwtMS0xeiIvPjxwYXRoIGZpbGw9ImRhcmtncmVlbiIgZD0iTTM4NSAxOTNMMjQxIDMzN2wtMTcgMTctMTctMTctODAtODBMMTYxIDIyM2w2MyA2M0wzNTEgMTU5IDM4NSAxOTN6Ii8+PC9zdmc+);
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.25rem
        }

        .location-input.is-invalid {
          outline-color: darkgray;
          background-color: #fafafa;
          background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSJkYXJrZ3JheSIgb3BhY2l0eT0iLjMiIGQ9Ik0wIDI1NmEyNTYgMjU2IDAgMSAwIDUxMiAwQTI1NiAyNTYgMCAxIDAgMCAyNTZ6TTIzMiAxMjhsNDggMCAwIDI0IDAgMTEyIDAgMjQtNDggMCAwLTI0IDAtMTEyIDAtMjR6bTAgMTkybDQ4IDAgMCA0OC00OCAwIDAtNDh6Ii8+PHBhdGggZmlsbD0iZGFya2dyYXkiIGQ9Ik0yODAgMTUybDAtMjQtNDggMCAwIDI0IDAgMTEyIDAgMjQgNDggMCAwLTI0IDAtMTEyem0wIDE2OGwtNDggMCAwIDQ4IDQ4IDAgMC00OHoiLz48L3N2Zz4=);
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.25rem
        }

        .location-input.is-error {
          outline-color: #8b0000;
          background-color: #ffe5e5;
          background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSJyZWQiIG9wYWNpdHk9Ii40IiBkPSJNMCAyNTZhMjU2IDI1NiAwIDEgMCA1MTIgMEEyNTYgMjU2IDAgMSAwIDAgMjU2em0xNTguMS02NGMxMS4zLTExLjMgMjIuNi0yMi42IDMzLjktMzMuOWM1LjcgNS43IDExLjMgMTEuMyAxNyAxN2MxNS43IDE1LjcgMzEuMyAzMS4zIDQ3IDQ3YzE1LjctMTUuNyAzMS4zLTMxLjMgNDctNDdjNS43LTUuNyAxMS4zLTExLjMgMTctMTdjMTEuMyAxMS4zIDIyLjYgMjIuNiAzMy45IDMzLjljLTUuNyA1LjctMTEuMyAxMS4zLTE3IDE3Yy0xNS43IDE1LjctMzEuMyAzMS4zLTQ3IDQ3YzE1LjcgMTUuNyAzMS40IDMxLjQgNDcgNDdjNS43IDUuNyAxMS4zIDExLjMgMTcgMTdMMzIwIDM1My45bC0xNy0xNy00Ny00N2MtMTUuNyAxNS43LTMxLjMgMzEuMy00NyA0N2MtNS43IDUuNy0xMS4zIDExLjMtMTcgMTdjLTExLjMtMTEuMy0yMi42LTIyLjYtMzMuOS0zMy45YzUuNy01LjcgMTEuMy0xMS4zIDE3LTE3YzE1LjctMTUuNyAzMS40LTMxLjQgNDctNDdjLTE1LjctMTUuNy0zMS4zLTMxLjMtNDctNDdjLTUuNy01LjctMTEuMy0xMS4zLTE3LTE3eiIvPjxwYXRoIGZpbGw9ImRhcmtyZWQiIGQ9Ik0zMzcgMjA5bDE3LTE3TDMyMCAxNTguMWwtMTcgMTctNDcgNDctNDctNDctMTctMTdMMTU4LjEgMTkybDE3IDE3IDQ3IDQ3LTQ3IDQ3LTE3IDE3TDE5MiAzNTMuOWwxNy0xNyA0Ny00NyA0NyA0NyAxNyAxN0wzNTMuOSAzMjBsLTE3LTE3LTQ3LTQ3IDQ3LTQ3eiIvPjwvc3ZnPg==);
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1.25rem
        }
        */
            }
        }

        @container filter (width < 400px) {
            grid-template-columns: 1fr;
        }

        .control {
            display: grid;
            justify-content: stretch;
            gap: 0.5rem;
            margin-bottom: 0;

            &.instruction-group {
                height: fit-content;
                align-self: end;
                justify-content: end;
                grid-column: -2 / -1;
                grid-template-columns: 1fr 5.75rem;
                gap: 1rem;
                &:has(.show-edit-mode) {
                    grid-column: 1 / -1;
                }
                :is(label) {
                    margin-block-start: 0;
                }

                > div {
                    /* border: 1px solid rgba(33, 66, 99, 0.15);
          border-radius: 0.25rem;
          background-color: rgba(71, 141, 211, 0.05); */
                    padding: 0.25rem 0;
                    display: grid;
                    justify-content: start;
                    align-content: center;
                }
            }

            &.editable {
                color: #369;
                background-color: var(--wp--preset--color--white);
                outline: 2px solid var(--wp--preset--color--primary-brand);
                outline-offset: 2px;
                padding: 0.5rem;
                border-radius: 0.5rem;
                position: relative;

                & label {
                    color: #369;
                    padding-inline-end: 1.25rem;
                }

                & .close-btn {
                    position: absolute;
                    top: 0.5rem;
                    right: 0.25rem;
                    width: 1.5rem;
                    height: 1.5rem;
                    min-height: 1.65rem;
                    background: none;
                    border: none;
                    padding: 0;
                    cursor: pointer;
                    appearance: none;
                    min-width: unset;
                    filter: var(--blue-filter);

                    &[disabled] {
                        opacity: 0;
                    }
                }

                & .close-btn::before {
                    /* X icon */
                    content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjU2IDQ4YTIwOCAyMDggMCAxIDEgMCA0MTYgMjA4IDIwOCAwIDEgMSAwLTQxNnptMCA0NjRBMjU2IDI1NiAwIDEgMCAyNTYgMGEyNTYgMjU2IDAgMSAwIDAgNTEyek0xNzUgMTc1Yy05LjQgOS40LTkuNCAyNC42IDAgMzMuOWw0NyA0Ny00NyA0N2MtOS40IDkuNC05LjQgMjQuNiAwIDMzLjlzMjQuNiA5LjQgMzMuOSAwbDQ3LTQ3IDQ3IDQ3YzkuNCA5LjQgMjQuNiA5LjQgMzMuOSAwczkuNC0yNC42IDAtMzMuOWwtNDctNDcgNDctNDdjOS40LTkuNCA5LjQtMjQuNiAwLTMzLjlzLTI0LjYtOS40LTMzLjkgMGwtNDcgNDctNDctNDdjLTkuNC05LjQtMjQuNi05LjQtMzMuOSAweiIvPjwvc3ZnPg==);
                    width: 1.25rem;
                    height: 1.25rem;
                    display: inline-block;
                    position: absolute;
                    right: 0.15rem;
                    top: 3px;
                }

                &:has(select:disabled) .close-btn::before {
                    /* X + lock icons */
                    content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjU2IDQ4YTIwOCAyMDggMCAxIDEgMCA0MTYgMjA4IDIwOCAwIDEgMSAwLTQxNnptMCA0NjRBMjU2IDI1NiAwIDEgMCAyNTYgMGEyNTYgMjU2IDAgMSAwIDAgNTEyek0xNzUgMTc1Yy05LjQgOS40LTkuNCAyNC42IDAgMzMuOWw0NyA0Ny00NyA0N2MtOS40IDkuNC05LjQgMjQuNiAwIDMzLjlzMjQuNiA5LjQgMzMuOSAwbDQ3LTQ3IDQ3IDQ3YzkuNCA5LjQgMjQuNiA5LjQgMzMuOSAwczkuNC0yNC42IDAtMzMuOWwtNDctNDcgNDctNDdjOS40LTkuNCA5LjQtMjQuNiAwLTMzLjlzLTI0LjYtOS40LTMzLjkgMGwtNDcgNDctNDctNDdjLTkuNC05LjQtMjQuNi05LjQtMzMuOSAweiIvPjwvc3ZnPg==)
                        url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSIjZmZmIiBvcGFjaXR5PSIuNCIgZD0iTTMyIDI3MmMwLTI2LjUgMjEuNS00OCA0OC00OGwyODggMGMyNi41IDAgNDggMjEuNSA0OCA0OGwwIDE2MGMwIDI2LjUtMjEuNSA0OC00OCA0OEw4MCA0ODBjLTI2LjUgMC00OC0yMS41LTQ4LTQ4bDAtMTYweiIvPjxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xMjggMTI4bDAgNjQgMTkyIDAgMC02NGMwLTUzLTQzLTk2LTk2LTk2cy05NiA0My05NiA5NnpNOTYgMTkybDAtNjRDOTYgNTcuMyAxNTMuMyAwIDIyNCAwczEyOCA1Ny4zIDEyOCAxMjhsMCA2NCAxNiAwYzQ0LjIgMCA4MCAzNS44IDgwIDgwbDAgMTYwYzAgNDQuMi0zNS44IDgwLTgwIDgwTDgwIDUxMmMtNDQuMiAwLTgwLTM1LjgtODAtODBMMCAyNzJjMC00NC4yIDM1LjgtODAgODAtODBsMTYgMHpNMzIgMjcybDAgMTYwYzAgMjYuNSAyMS41IDQ4IDQ4IDQ4bDI4OCAwYzI2LjUgMCA0OC0yMS41IDQ4LTQ4bDAtMTYwYzAtMjYuNS0yMS41LTQ4LTQ4LTQ4TDgwIDIyNGMtMjYuNSAwLTQ4IDIxLjUtNDggNDh6Ii8+PC9zdmc+);
                }
            }

            :is(label) {
                margin-bottom: 0;
                font-weight: 400;
                line-height: 1.5;
                text-wrap: balance;
                text-wrap: pretty;
                text-align: left;
            }

            :is(figcaption) {
                border-radius: 0.5rem;
                background-color: #fff;
                color: var(--wp--preset--color--primary-brand);
                text-align: left;
                font-size: 0.85rem;
                padding: 0.5rem;
                opacity: 0.9;
            }

            :is(select) {
                -webkit-appearance: unset;
                appearance: unset;
            }

            .select {
                background-color: #fff;
                color: #369;
                font-size: 1rem;
                margin-block: 0.25rem;
                padding: 0.5rem 2.5rem 0.5rem 0.5rem;
                outline-offset: 2px;
                /* outline: 2px solid var(--wp--preset--color--custom-info-border); */
                outline: 1px solid #369;
                /* down arrow */
                background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSIjMzY5IiBkPSJNMjM5IDQ5OC43bDE2MC0xMjggMTguNy0xNS0zMC0zNy41LTE4LjcgMTUtMTQ1IDExNkw3OSAzMzMuM2wtMTguNy0xNS0zMCAzNy41IDE4LjcgMTUgMTYwIDEyOCAxNSAxMiAxNS0xMnptMC00ODUuNWwtMTUtMTItMTUgMTJMNDkgMTQxLjNsLTE4LjcgMTUgMzAgMzcuNSAxOC43LTE1IDE0NS0xMTYgMTQ1IDExNiAxOC43IDE1IDMwLTM3LjUtMTguNy0xNUwyMzkgMTMuM3oiLz48L3N2Zz4=);
                background-repeat: no-repeat;
                background-position: right 0.65rem center;
                background-size: 0.85rem;

                &:is(:focus-visible, :focus) {
                    outline: 3px solid #369 !important;
                }

                &.error {
                    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSIjOGIwMDAwIiBkPSJNMjM5IDQ5OC43bDE2MC0xMjggMTguNy0xNS0zMC0zNy41LTE4LjcgMTUtMTQ1IDExNkw3OSAzMzMuM2wtMTguNy0xNS0zMCAzNy41IDE4LjcgMTUgMTYwIDEyOCAxNSAxMiAxNS0xMnptMC00ODUuNWwtMTUtMTItMTUgMTJMNDkgMTQxLjNsLTE4LjcgMTUgMzAgMzcuNSAxOC43LTE1IDE0NS0xMTYgMTQ1IDExNiAxOC43IDE1IDMwLTM3LjUtMTguNy0xNUwyMzkgMTMuM3oiLz48L3N2Zz4=);
                    color: #8b0000;
                    outline: 2px solid #8b0000;

                    &:is(:focus-visible, :focus) {
                        outline: 3px solid #8b0000 !important;
                    }
                }

                &:has(option[data-default='Select an option']:checked) {
                    outline: 2px solid #bfdfe7;
                }

                &:disabled:not(.transition) {
                    color: #fff;
                    outline: 2px solid lightgray !important;
                    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSJsaWdodGdyYXkiIGQ9Ik0yMzkgNDk4LjdsMTYwLTEyOCAxOC43LTE1LTMwLTM3LjUtMTguNyAxNS0xNDUgMTE2TDc5IDMzMy4zbC0xOC43LTE1LTMwIDM3LjUgMTguNyAxNSAxNjAgMTI4IDE1IDEyIDE1LTEyem0wLTQ4NS41bC0xNS0xMi0xNSAxMkw0OSAxNDEuM2wtMTguNyAxNSAzMCAzNy41IDE4LjctMTUgMTQ1LTExNiAxNDUgMTE2IDE4LjcgMTUgMzAtMzcuNS0xOC43LTE1TDIzOSAxMy4zeiIvPjwvc3ZnPg==) !important;
                }
            }
        }
    }

    .clear-msg {
        margin-inline-start: 2.5rem;
        margin-block-start: -2.75rem;
        font-size: 0.85rem;

        :is(a) {
            font-size: 0.85rem;
        }
    }

    :is(label).small {
        font-size: 0.85rem;
        margin-block-end: 0;
        margin-block-start: 0.5rem;
    }

    .selection-summary {
        background: #fff;
        padding: 0;
        border-radius: 1rem;
        display: grid;
        grid-template-columns: 4fr 1fr;
        gap: 0.5rem;
        position: relative;
    }

    .selection-summary.assistive-simple-mode .control.editable {
        outline: none;
        border: 0;
        box-shadow: none;
    }

    .selection-summary.assistive-simple-mode .control.instruction-group {
        grid-template-columns: 1fr;
    }

    .simplify-assistive-toggle {
        z-index: 9;
        padding-inline: 1rem !important;
        margin: 0.665rem !important;
    }

    .reset-simplified-interface-btn {
        width: unset;
    }

    #rebatesFilterControls:focus-within {
        outline: 3px solid #369;
        outline-offset: -1px;
    }

    .link-tools {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .assembled-url {
        background: #111827;
        color: #e5e7eb;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            'Liberation Mono', 'Courier New', monospace;
    }

    .copy-link {
        padding: 0.4rem 0.7rem;
        border: 1px solid #e5e7eb;
        border-radius: 0.375rem;
        cursor: pointer;
    }

    .copy-message {
        font-size: 0.9rem;
        color: #4b5563;
        display: none;
    }

    #rebatesResults {
        container-type: inline-size;
        container-name: results;
        outline: none;

        :is(a) {
            height: 100%;
        }
    }

    .info-card {
        /* box-shadow: 0 0 .5rem rgb(0 0 0 / 0.3); */
        border-radius: 0.5rem;
        padding: 0;

        .info-card-content {
            padding: 1rem 1rem 0;
        }

        .wp-block-image {
            padding: 0;
            margin: 0;

            :is(img) {
                aspect-ratio: 3/2;
                object-fit: cover;
                margin-block: 0.5rem;
            }
        }

        :is(h3) {
            font-size: 1.25rem;
        }

        :is(p) {
            font-size: 0.9rem;
        }
    }

    .results-message {
        margin-block-end: 2rem;
        display: flex;
        align-items: flex-end;

        :is(div):first-child {
            flex: 1;
        }

        :is(h2) {
            &::before {
                content: '';
                display: block;
                background-color: var(--wp--preset--color--heading-line);
                border-top-width: 3rem;
                margin-block-end: 1rem;
                height: 3px;
                width: 3rem;
            }

            margin-block-end: 0;
        }
    }

    .results {
        display: grid;
        gap: 2rem;
        margin-top: 0.5rem;

        grid-template-columns: 1fr;

        &.no-results {
            grid-template-columns: repeat(3, 1fr);

            .rebate-card {
                grid-column: 2;
            }
        }

        @container (width > 601px) {
            grid-template-columns: repeat(
                auto-fit,
                minmax(min(320px, 100%), 1fr)
            );
        }

        &.list-view {
            grid-template-columns: 1fr;
        }
    }

    .rebate-card {
        isolation: isolate;
        background-color: #fff;
        box-shadow:
            0 0 3px rgb(0 0 0 / 0.2),
            0 0 6px rgb(0 0 0 / 0.1);
        border-radius: 1rem;
        padding: 0;
        overflow: clip;

        *,
        *:is(:hover, :focus-visible) {
            text-decoration: none;
        }

        .wp-block-image img {
            border-bottom: 3px solid #fff;
            aspect-ratio: 16/9;
            object-fit: cover;
        }

        &:has(a:is(:hover, :focus-visible)) {
            outline: 3px solid #369;
            outline-offset: 2px;
            box-shadow:
                inset 0 0 3px rgb(0 0 0 / 0.2),
                0 0 6px rgb(0 0 0 / 0.1);
        }
    }

    .results.list-view {
        @container (width > 500px) {
            .rebate-card :is(a) {
                min-height: 200px;
                width: 100%;
                display: grid;
                gap: 1rem;

                .rebate-details-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .rebate-value {
                    position: absolute;
                    left: auto;
                    right: -1rem;
                    top: 0;
                    z-index: 1;
                    outline: none;
                    border-radius: 0 0 0 0.5rem;
                    padding-block: 0.25rem;
                }

                .wp-block-image {
                    margin: -4px;
                    max-width: 20%;
                    min-width: 230px;
                    order: -1;
                    z-index: 0;

                    :is(img) {
                        max-width: 100%;
                        height: 100%;
                        aspect-ratio: 0.66;
                    }
                }

                .rebate-icons {
                    position: absolute;
                    bottom: 5rem;
                    top: auto;
                    z-index: 1;
                }

                grid-template-columns: minmax(230px, 20%) 1fr;
            }

            .info-card {
                .wp-block-image {
                    max-width: 30%;
                }
            }
        }

        @container (width > 700px) {
            .rebate-card :is(a) {
                .wp-block-image :is(img) {
                    aspect-ratio: 1;
                }
            }
        }
    }

    .rebate-title {
        font-size: 1.5rem;
        padding: 0 1rem;
        margin: 1.5rem 0 0.5rem;

        > div {
            margin-block-end: -0.5rem;
        }

        :is(small) {
            display: inline-block;
            font-size: 1rem;
            line-height: 1.5;
            margin-block-start: 0.5rem;
        }
    }

    .rebate-details {
        padding: 0 1rem 1rem;
    }

    a:is(:hover)
        .rebate-details.rebate-details
        .rebate-description.rebate-description
        * {
        text-decoration: none !important;
    }

    .rebate-icons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        margin-block-start: 0rem;
        position: relative;
        z-index: 1;
        gap: 0.15rem;
        margin-inline-start: 1rem;
        top: -3.25rem;
        bottom: auto;
        z-index: 9;
        width: 100%;
        max-width: 130px;
        margin-bottom: -4rem;
    }

    .rebate-icon {
        width: 3rem;
        height: 3rem;
        position: relative;
        margin-block-start: auto;

        &::after {
            content: '';
            background-color: #fff;
            background-size: 65%;
            background-repeat: no-repeat;
            background-position: center;
            box-shadow:
                0 0 3px rgb(0 0 0 / 0.2),
                0 0 6px rgb(0 0 0 / 0.1),
                0 0 9px rgb(0 0 0 / 0.05);
            border-radius: 50%;
            /* electric */
            background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNTEyIj48IS0tZWxlY3RyaWMtLT48cGF0aCBmaWxsPSIjMzY5IiAgZD0iTTI1NiA1MTJjNzMuNyAwIDE0MC4xLTMxLjEgMTg2LjgtODFsNy41LTE1TDQzMiA0MTZjLTIwLjQgMC0zOC41LTEyLjktNDUuMy0zMi4xcy0uNi00MC42IDE1LjMtNTMuNGwxMDkuNi04Ny43QzUwNC44IDEwNy41IDM5MyAwIDI1NiAwQzExNC42IDAgMCAxMTQuNiAwIDI1NlMxMTQuNiA1MTIgMjU2IDUxMnpNMTkyIDE2MGwwIDMyYzAgMTcuNy0xNC4zIDMyLTMyIDMycy0zMi0xNC4zLTMyLTMybDAtMzJjMC0xNy43IDE0LjMtMzIgMzItMzJzMzIgMTQuMyAzMiAzMnptOTYgMGwwIDMyYzAgMTcuNy0xNC4zIDMyLTMyIDMycy0zMi0xNC4zLTMyLTMybDAtMzJjMC0xNy43IDE0LjMtMzIgMzItMzJzMzIgMTQuMyAzMiAzMnptOTYgMGwwIDMyYzAgMTcuNy0xNC4zIDMyLTMyIDMycy0zMi0xNC4zLTMyLTMybDAtMzJjMC0xNy43IDE0LjMtMzIgMzItMzJzMzIgMTQuMyAzMiAzMnptMjE4LjEgNjcuNmMtNS44LTQuNy0xNC4yLTQuNy0yMC4xLS4xbC0xNjAgMTI4Yy01LjMgNC4yLTcuNCAxMS40LTUuMSAxNy44czguMyAxMC43IDE1LjEgMTAuN2w3MC4xIDBMNDQ5LjcgNDg4LjhjLTMuNCA2LjctMS42IDE0LjkgNC4zIDE5LjZzMTQuMiA0LjcgMjAuMSAuMWwxNjAtMTI4YzUuMy00LjIgNy40LTExLjQgNS4xLTE3LjhzLTguMy0xMC43LTE1LjEtMTAuN2wtNzAuMSAwIDUyLjQtMTA0LjhjMy40LTYuNyAxLjYtMTQuOS00LjItMTkuNnoiLz48L3N2Zz4=);
            width: 3rem;
            height: 3rem;
            max-width: 90%;
            max-height: 90%;
            display: inline-block;
            position: absolute;
            top: 0.65rem;
        }

        &.error::after {
            content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNOTQgMTg3LjFDMTIwLjggMTI0LjEgMTgzLjMgODAgMjU2IDgwYzM5LjcgMCA3Ny44IDE1LjggMTA1LjkgNDMuOUw0MTQuMSAxNzYgMzYwIDE3NmMtMTMuMyAwLTI0IDEwLjctMjQgMjRzMTAuNyAyNCAyNCAyNGwxMTIgMGMxMy4zIDAgMjQtMTAuNyAyNC0yNGwwLTExMmMwLTEzLjMtMTAuNy0yNC0yNC0yNHMtMjQgMTAuNy0yNCAyNGwwIDU0LjFMMzk1LjkgODkuOUMzNTguOCA1Mi44IDMwOC41IDMyIDI1NiAzMkMxNjMuNCAzMiA4My45IDg4LjIgNDkuOCAxNjguM2MtNS4yIDEyLjIgLjUgMjYuMyAxMi43IDMxLjVzMjYuMy0uNSAzMS41LTEyLjd6bTM2OCAxNTdjNS4yLTEyLjItLjQtMjYuMy0xMi42LTMxLjVzLTI2LjMgLjQtMzEuNSAxMi42QzM5MSAzODguMSAzMjguNiA0MzIgMjU2IDQzMmMtMzkuNyAwLTc3LjgtMTUuOC0xMDUuOS00My45TDk3LjkgMzM2bDU0LjEgMGMxMy4zIDAgMjQtMTAuNyAyNC0yNHMtMTAuNy0yNC0yNC0yNEw0MCAyODhjLTEzLjMgMC0yNCAxMC43LTI0IDI0bDAgMTEyYzAgMTMuMyAxMC43IDI0IDI0IDI0czI0LTEwLjcgMjQtMjRsMC01NC4xIDUyLjEgNTIuMUMxNTMuMiA0NTkuMiAyMDMuNSA0ODAgMjU2IDQ4MGM5Mi41IDAgMTcxLjgtNTYgMjA2LTEzNS45eiIgZmlsbD0iIzhiMDAwMCIvPjwvc3ZnPg==);
        }

        &.gas::after {
            background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNTEyIj48IS0tZ2FzIGZpcmUtLT48cGF0aCBmaWxsPSIjMzY5IiBkPSJNMzQ1LjcgNDguM0wzNTggMzQuNWM1LjQtNi4xIDEzLjMtOC44IDIwLjktOC45YzcuMiAwIDE0LjMgMi42IDE5LjkgNy44YzE5LjcgMTguMyAzOS44IDQzLjIgNTUgNzAuNkM0NjkgMTMxLjIgNDgwIDE2Mi4yIDQ4MCAxOTIuMkM0ODAgMjgwLjggNDA4LjcgMzUyIDMyMCAzNTJjLTg5LjYgMC0xNjAtNzEuMy0xNjAtMTU5LjhjMC0zNy4zIDE2LTczLjQgMzYuOC0xMDQuNWMyMC45LTMxLjMgNDcuNS01OSA3MC45LTgwLjJDMjczLjQgMi4zIDI4MC43LS4yIDI4OCAwYzE0LjEgLjMgMjMuOCAxMS40IDMyLjcgMjEuNmMwIDAgMCAwIDAgMGMyIDIuMyA0IDQuNiA2IDYuN2wxOSAxOS45ek0zODQgMjQwLjJjMC0zNi41LTM3LTczLTU0LjgtODguNGMtNS40LTQuNy0xMy4xLTQuNy0xOC41IDBDMjkzIDE2Ny4xIDI1NiAyMDMuNiAyNTYgMjQwLjJjMCAzNS4zIDI4LjcgNjQgNjQgNjRzNjQtMjguNyA2NC02NHpNMzIgMjg4YzAtMTcuNyAxNC4zLTMyIDMyLTMybDMyIDBjMTcuNyAwIDMyIDE0LjMgMzIgMzJzLTE0LjMgMzItMzIgMzJsMCA2NCA0NDggMCAwLTY0Yy0xNy43IDAtMzItMTQuMy0zMi0zMnMxNC4zLTMyIDMyLTMybDMyIDBjMTcuNyAwIDMyIDE0LjMgMzIgMzJsMCA5NmMxNy43IDAgMzIgMTQuMyAzMiAzMmwwIDY0YzAgMTcuNy0xNC4zIDMyLTMyIDMyTDMyIDUxMmMtMTcuNyAwLTMyLTE0LjMtMzItMzJsMC02NGMwLTE3LjcgMTQuMy0zMiAzMi0zMmwwLTk2ek0zMjAgNDgwYTMyIDMyIDAgMSAwIDAtNjQgMzIgMzIgMCAxIDAgMCA2NHptMTYwLTMyYTMyIDMyIDAgMSAwIC02NCAwIDMyIDMyIDAgMSAwIDY0IDB6TTE5MiA0ODBhMzIgMzIgMCAxIDAgMC02NCAzMiAzMiAwIDEgMCAwIDY0eiIvPjwvc3ZnPg==);
        }

        &.oil::after {
            background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzODQgNTEyIj48IS0tb2lsIGZpcmUtLT48cGF0aCBmaWxsPSIjMzY5IiAgZD0iTTM3Mi41IDI1Ni41bC0uNy0xLjlDMzM3LjggMTYwLjggMjgyIDc2LjUgMjA5LjEgOC41bC0zLjMtM0MyMDIuMSAyIDE5Ny4xIDAgMTkyIDBzLTEwLjEgMi0xMy44IDUuNWwtMy4zIDNDMTAyIDc2LjUgNDYuMiAxNjAuOCAxMi4yIDI1NC42bC0uNyAxLjlDMy45IDI3Ny4zIDAgMjk5LjQgMCAzMjEuNkMwIDQyNi43IDg2LjggNTEyIDE5MiA1MTJzMTkyLTg1LjMgMTkyLTE5MC40YzAtMjIuMi0zLjktNDQuMi0xMS41LTY1LjF6TTE4OC44IDE0OC4zYzItMi43IDUuMi00LjMgOC41LTQuM2M1LjkgMCAxMC43IDQuOCAxMC43IDEwLjdsMCAxMS40YzAgOC45IDMuNiAxNy40IDkuOSAyMy42bDUxLjUgNTAuN0MyOTEuNSAyNjIuMiAzMDQgMjkyIDMwNCAzMjNjMCA2MC4yLTQ4LjggMTA5LTEwOSAxMDlsLTMgMGMtNjEuOSAwLTExMi01MC4xLTExMi0xMTJsMC04LjJjMC0yMS4yIDcuOC00MS42IDIxLjgtNTcuNGw2LjktNy44YzIuMS0yLjQgNS4xLTMuNyA4LjMtMy43YzYuMSAwIDExIDQuOSAxMSAxMWwwIDQ0YzAgMjQuMyAxOS44IDQ0IDQ0LjEgNDRjMjQuMiAwIDQzLjktMTkuNiA0My45LTQzLjhjMC0xMS42LTQuNi0yMi44LTEyLjgtMzFsLTEzLjItMTMuMmMtMTQtMTQtMjEuOS0zMy4xLTIxLjktNTNjMC0xNi4yIDUuMy0zMiAxNS00NC45bDUuOC03Ljh6Ii8+PC9zdmc+);
            background-size: 50%;
        }

        &.wood::after {
            background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48IS0td29vZCBmaXJlLS0+PHBhdGggZmlsbD0iIzM2OSIgZD0iTTI3OS4xIDQzLjlMMjYyLjEgMjUuOGMtMS44LTEuOS0zLjYtNC01LjQtNi4xYzAgMCAwIDAgMCAwQzI0OC42IDEwLjQgMjM5LjkgLjMgMjI3LjIgMGMtNi41LS4yLTEzLjEgMi4xLTE4LjMgNi44Yy0yMS4xIDE5LjItNDUgNDQuNC02My44IDcyLjljLTE4LjcgMjguMy0zMy4xIDYxLTMzLjEgOTVDMTEyIDI1NS4yIDE3NS40IDMyMCAyNTYgMzIwYzc5LjggMCAxNDQtNjQuNyAxNDQtMTQ1LjNjMC0yNy4zLTkuOS01NS40LTIzLjYtODAuMUMzNjIuNyA2OS43IDM0NC43IDQ3IDMyNi45IDMwLjRjLTUtNC43LTExLjUtNy4xLTE3LjktNy4xYy02LjggMC0xNCAyLjUtMTguOCA4LjFsLTExIDEyLjV6bTM2LjUgMTc0LjRjMCAzMi4xLTI2IDU4LjItNTguMiA1OC4ycy01OC4yLTI2LTU4LjItNTguMmMwLTMzLjIgMzMuNy02Ni40IDQ5LjgtODAuNGM0LjktNC4yIDExLjktNC4yIDE2LjggMGMxNi4xIDE0IDQ5LjggNDcuMiA0OS44IDgwLjR6TTQyLjggMjg5LjljLTE2LjYtNS45LTM1IDIuNy00MC45IDE5LjRzMi43IDM1IDE5LjQgNDAuOUwxNjAuOSA0MDAgMjEuMiA0NDkuOUM0LjYgNDU1LjgtNC4xIDQ3NC4xIDEuOSA0OTAuOHMyNC4zIDI1LjMgNDAuOSAxOS40TDI1NiA0MzRsMjEzLjIgNzYuMmMxNi42IDUuOSAzNS0yLjcgNDAuOS0xOS40cy0yLjctMzUtMTkuNC00MC45TDM1MS4xIDQwMGwxMzkuNi00OS45YzE2LjYtNS45IDI1LjMtMjQuMyAxOS40LTQwLjlzLTI0LjMtMjUuMy00MC45LTE5LjRMMjU2IDM2NiA0Mi44IDI4OS45eiIvPjwvc3ZnPg==);
        }
    }

    .rebate-value {
        background-color: #369;
        border-radius: 100vw;
        color: #fff;
        outline: 3px solid #fff;
        font-size: 1.1rem;
        font-weight: 600;
        position: relative;
        top: 1rem;
        margin-inline-start: auto;
        margin-inline-end: 1rem;
        margin-block-start: 0;
        margin-block-end: -2rem;
        padding: 0 1rem;
        width: fit-content;
        z-index: 1;
    }

    .no-results {
        color: #6b7280;
    }

    .isFadedOut {
        opacity: 0;
        transition: opacity 0.25s ease;
    }

    .selection-summary:has(p + .small-text) p {
        margin-bottom: 0;
    }

    .small-text {
        margin-block: 0.5rem 0.1rem;
    }

    .small-text,
    .small-text * {
        margin: 0;
        font-size: 0.85rem;
        color: #5a5a5a;
    }

    .small-text a {
        color: #369;
    }

    .rebate-setting {
        background: #fff;
        color: #369;
        border: 1px solid #369;
        padding-inline: 0.5rem 0.25rem;
        border-radius: 0.25rem;
        box-decoration-break: clone;
        padding-right: 2rem;
        display: block;
        text-align: left;
        text-wrap: inherit;
        width: 100%;
        position: relative;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:is(:hover, :focus, :focus-visible) {
            color: #369;
        }

        &.error {
            color: #8b0000;
            border-color: #8b0000;
        }

        &::after {
            /* Pencil */
            content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMzY5IiBkPSJNMzk1LjggMzkuNmM5LjQtOS40IDI0LjYtOS40IDMzLjkgMGw0Mi42IDQyLjZjOS40IDkuNCA5LjQgMjQuNiAwIDMzLjlMNDE3LjYgMTcxIDM0MSA5NC40bDU0LjgtNTQuOHpNMzE4LjQgMTE3TDM5NSAxOTMuNmwtMjE5IDIxOSAwLTEyLjZjMC04LjgtNy4yLTE2LTE2LTE2bC0zMiAwIDAtMzJjMC04LjgtNy4yLTE2LTE2LTE2bC0xMi42IDAgMjE5LTIxOXpNNjYuOSAzNzkuNWMxLjItNCAyLjctNy45IDQuNy0xMS41TDk2IDM2OGwwIDMyYzAgOC44IDcuMiAxNiAxNiAxNmwzMiAwIDAgMjQuNGMtMy43IDEuOS03LjUgMy41LTExLjYgNC43TDM5LjYgNDcyLjRsMjcuMy05Mi44ek00NTIuNCAxN2MtMjEuOS0yMS45LTU3LjMtMjEuOS03OS4yIDBMNjAuNCAzMjkuN2MtMTEuNCAxMS40LTE5LjcgMjUuNC0yNC4yIDQwLjhMLjcgNDkxLjVjLTEuNyA1LjYtLjEgMTEuNyA0IDE1LjhzMTAuMiA1LjcgMTUuOCA0bDEyMS0zNS42YzE1LjQtNC41IDI5LjQtMTIuOSA0MC44LTI0LjJMNDk1IDEzOC44YzIxLjktMjEuOSAyMS45LTU3LjMgMC03OS4yTDQ1Mi40IDE3ek0zMzEuMyAyMDIuN2M2LjItNi4yIDYuMi0xNi40IDAtMjIuNnMtMTYuNC02LjItMjIuNiAwbC0xMjggMTI4Yy02LjIgNi4yLTYuMiAxNi40IDAgMjIuNnMxNi40IDYuMiAyMi42IDBsMTI4LTEyOHoiLz48L3N2Zz4=);
            transform-origin: 50% 62%;
            width: 1rem;
            height: 1rem;
            display: inline-block;
            margin-left: 0.5rem;
            position: absolute;
            right: 0.5rem;
            top: 0.65rem;
        }

        &.error::after {
            filter: var(--darkred-filter);
        }

        &:disabled {
            pointer-events: none;

            &::after {
                /* lock icon */
                content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSIjMzY5IiBvcGFjaXR5PSIuNCIgZD0iTTMyIDI3MmMwLTI2LjUgMjEuNS00OCA0OC00OGwyODggMGMyNi41IDAgNDggMjEuNSA0OCA0OGwwIDE2MGMwIDI2LjUtMjEuNSA0OC00OCA0OEw4MCA0ODBjLTI2LjUgMC00OC0yMS41LTQ4LTQ4bDAtMTYweiIvPjxwYXRoIGZpbGw9IiMzNjkiIGQ9Ik0xMjggMTI4bDAgNjQgMTkyIDAgMC02NGMwLTUzLTQzLTk2LTk2LTk2cy05NiA0My05NiA5NnpNOTYgMTkybDAtNjRDOTYgNTcuMyAxNTMuMyAwIDIyNCAwczEyOCA1Ny4zIDEyOCAxMjhsMCA2NCAxNiAwYzQ0LjIgMCA4MCAzNS44IDgwIDgwbDAgMTYwYzAgNDQuMi0zNS44IDgwLTgwIDgwTDgwIDUxMmMtNDQuMiAwLTgwLTM1LjgtODAtODBMMCAyNzJjMC00NC4yIDM1LjgtODAgODAtODBsMTYgMHpNMzIgMjcybDAgMTYwYzAgMjYuNSAyMS41IDQ4IDQ4IDQ4bDI4OCAwYzI2LjUgMCA0OC0yMS41IDQ4LTQ4bDAtMTYwYzAtMjYuNS0yMS41LTQ4LTQ4LTQ4TDgwIDIyNGMtMjYuNSAwLTQ4IDIxLjUtNDggNDh6Ii8+PC9zdmc+);
            }
        }

        &:is(:hover, :focus, :focus-visible)::after {
            content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNNDEwLjMgMjMxbDExLjMtMTEuMy0zMy45LTMzLjktNjIuMS02Mi4xTDI5MS43IDg5LjhsLTExLjMgMTEuMy0yMi42IDIyLjZMNTguNiAzMjIuOWMtMTAuNCAxMC40LTE4IDIzLjMtMjIuMiAzNy40TDEgNDgwLjdjLTIuNSA4LjQtLjIgMTcuNSA2LjEgMjMuN3MxNS4zIDguNSAyMy43IDYuMWwxMjAuMy0zNS40YzE0LjEtNC4yIDI3LTExLjggMzcuNC0yMi4yTDM4Ny43IDI1My43IDQxMC4zIDIzMXpNMTYwIDM5OS40bC05LjEgMjIuN2MtNCAzLjEtOC41IDUuNC0xMy4zIDYuOUw1OS40IDQ1MmwyMy03OC4xYzEuNC00LjkgMy44LTkuNCA2LjktMTMuM2wyMi43LTkuMSAwIDMyYzAgOC44IDcuMiAxNiAxNiAxNmwzMiAwek0zNjIuNyAxOC43TDM0OC4zIDMzLjIgMzI1LjcgNTUuOCAzMTQuMyA2Ny4xbDMzLjkgMzMuOSA2Mi4xIDYyLjEgMzMuOSAzMy45IDExLjMtMTEuMyAyMi42LTIyLjYgMTQuNS0xNC41YzI1LTI1IDI1LTY1LjUgMC05MC41TDQ1My4zIDE4LjdjLTI1LTI1LTY1LjUtMjUtOTAuNSAwem0tNDcuNCAxNjhsLTE0NCAxNDRjLTYuMiA2LjItMTYuNCA2LjItMjIuNiAwcy02LjItMTYuNCAwLTIyLjZsMTQ0LTE0NGM2LjItNi4yIDE2LjQtNi4yIDIyLjYgMHM2LjIgMTYuNCAwIDIyLjZ6Ii8+PC9zdmc+);
            filter: var(--blue-filter);
        }

        &.error:is(:hover, :focus, :focus-visible)::after {
            filter: var(--darkred-filter);
        }
    }
}

#vnextRebateFilterApp[data-mode='archive'] {
    .control-container {
        padding: 0 0 1rem;
    }

    .loader {
        display: grid;
        height: 75px;
        place-items: center;
        background-color: #727272;
        box-shadow:
            0 0 3px rgb(0 0 0 / 0.2),
            0 0 6px rgb(0 0 0 / 0.1);
        border: 1px solid #666;
        border-radius: 0.66rem;
        font-size: 1.125rem;
        color: #fff;
    }
}

#vnextRebateFilterApp[data-mode='single'] .loader {
    height: 3.75rem;
    display: grid;
    place-items: center;
    background-color: #fff;
    box-shadow:
        0 0 3px rgb(0 0 0 / 0.2),
        0 0 6px rgb(0 0 0 / 0.1);
    border: 0;
    border-radius: 0.66rem;
    font-size: 0.85rem;
    color: #fff;
}

#vnextRebateFilterApp[data-mode='single'] select,
#vnextRebateFilterApp[data-mode='single'] .select {
    overflow: clip;
}

#vnextRebateFilterApp[data-mode='single']
    #rebatesFilterControls
    .selection-summary {
    opacity: 0;
    animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

.rebate-setting.is-external-dirty::after {
    animation: spin1440 4s linear;
    content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBvcGFjaXR5PSIuNCIgZD0iTTAgMjU2QzAgMTE0LjkgMTE0LjEgLjUgMjU1LjEgMEMyMzcuOSAuNSAyMjQgMTQuNiAyMjQgMzJjMCAxNy43IDE0LjMgMzIgMzIgMzJDMTUwIDY0IDY0IDE1MCA2NCAyNTZzODYgMTkyIDE5MiAxOTJjNjkuNyAwIDEzMC43LTM3LjEgMTY0LjUtOTIuNmMtMyA2LjYtMy4zIDE0LjgtMSAyMi4yYzEuMiAzLjcgMyA3LjIgNS40IDEwLjNjMS4yIDEuNSAyLjYgMyA0LjEgNC4zYy44IC43IDEuNiAxLjMgMi40IDEuOWMuNCAuMyAuOCAuNiAxLjMgLjlzLjkgLjYgMS4zIC44YzUgMi45IDEwLjYgNC4zIDE2IDQuM2MxMSAwIDIxLjgtNS43IDI3LjctMTZjLTQ0LjMgNzYuNS0xMjcgMTI4LTIyMS43IDEyOEMxMTQuNiA1MTIgMCAzOTcuNCAwIDI1NnoiLz48cGF0aCBkPSJNMjI0IDMyYzAtMTcuNyAxNC4zLTMyIDMyLTMyQzM5Ny40IDAgNTEyIDExNC42IDUxMiAyNTZjMCA0Ni42LTEyLjUgOTAuNC0zNC4zIDEyOGMtOC44IDE1LjMtMjguNCAyMC41LTQzLjcgMTEuN3MtMjAuNS0yOC40LTExLjctNDMuN2MxNi4zLTI4LjIgMjUuNy02MSAyNS43LTk2YzAtMTA2LTg2LTE5Mi0xOTItMTkyYy0xNy43IDAtMzItMTQuMy0zMi0zMnoiLz48L3N2Zz4=) !important;
}

@keyframes spin1440 {
    from {
        transform: rotate(0turn);
    }

    to {
        transform: rotate(6turn);
    }
}

#vnextRebateFilterApp:not([data-mode='archive'])
    #rebatesFilterControls.filters-dirty {
    background: var(--wp--preset--color--custom-warning-bg);
    outline: 3px solid
        var(
            --wp--preset--color--custom-warning-border,
            rgba(255, 192, 23, 0.25)
        );
}

#vnextRebateFilterApp:not([data-mode='archive'])
    #rebatesFilterControls.filters-dirty::after {
    content: 'If your URL has been modified manually, you may need to edit your settings — or clear them completely and start over — to fix.';
    background-color: #ffc01757;
    display: block;
    border: 2px dashed #ffc017;
    border-radius: 0.66rem;
    padding: 0.5rem;
    font-weight: 700;
    font-size: 0.85rem;
}

.update-page-container {
    border: none !important;
}

p.rebate-detail.rebate-detail.rebate-detail {
    color: #369;
    font-weight: 600;
    margin-bottom: 0;
}

.filter-container.labels-hidden p.rebate-detail.rebate-detail.rebate-detail {
    font-weight: 400;
}

p.rebate-detail.rebate-detail.rebate-detail.error {
    color: #8b0000;
    background: transparent;
    border: 0;
}

.rebate-detail-warning,
.rebate-setting-warning {
    margin: 0.25rem 0 0;
    font-size: 0.85rem;
    color: #8b0000;
}

.rebate-setting-warning a {
    display: inline;
}

#vnextRebateFilterApp:not([data-mode='archive'])
    #rebatesFilterControls:has(.editBtn:is(:focus-visible, :focus, :hover)) {
    /* background-color: hsl(210, 100%, 96%);
  transition: all ease-in-out .3s; */
}

#vnextRebateFilterApp:not([data-mode='archive'])
    #rebatesFilterControls
    .editBtn {
    width: fit-content;
    padding: 0 0.66rem 0 0;
    height: 1rem;
    background-color: #fff;
    color: #369;
    display: flex;
    justify-content: end;
    align-items: center;
    border-radius: 0.25rem;
    transition: all ease-in-out 0.3s;
    border: 1px solid hsl(210, 94%, 86%) !important;

    :is(span) {
        font-size: 0.85rem;
        display: inline-block;
        text-align: right;
        padding-inline: 1rem;
    }

    &:is(:hover) {
        background-color: rgb(235, 245, 255);

        & :is(span) {
            text-decoration: underline;
            text-underline-offset: 3px;
            text-decoration-thickness: 1px;
        }
    }

    &:is(:focus-visible, :focus) {
        outline: 3px solid #369;
        outline-offset: 2px;
        background-color: rgb(235, 245, 255);

        & :is(span) {
            text-decoration: underline;
            text-underline-offset: 3px;
            text-decoration-thickness: 1px;
        }
    }

    &.saving {
        width: 100%;
        background-color: var(--wp--preset--color--primary-brand);
        text-align: center;
    }

    &.saving :is(span) {
        color: var(--wp--preset--color--white);
        text-align: right;
        text-align: center;
    }

    &::after {
        content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNTEyIj48cGF0aCBmaWxsPSIjOWY5ZDljIiBkPSJNMzguOCA1LjFDMjguNC0zLjEgMTMuMy0xLjIgNS4xIDkuMlMtMS4yIDM0LjcgOS4yIDQyLjlsNTkyIDQ2NGMxMC40IDguMiAyNS41IDYuMyAzMy43LTQuMXM2LjMtMjUuNS00LjEtMzMuN0w1MjUuNiAzODYuN2MzOS42LTQwLjYgNjYuNC04Ni4xIDc5LjktMTE4LjRjMy4zLTcuOSAzLjMtMTYuNyAwLTI0LjZjLTE0LjktMzUuNy00Ni4yLTg3LjctOTMtMTMxLjFDNDY1LjUgNjguOCA0MDAuOCAzMiAzMjAgMzJjLTY4LjIgMC0xMjUgMjYuMy0xNjkuMyA2MC44TDM4LjggNS4xem0xNTEgMTE4LjNDMjI2IDk3LjcgMjY5LjUgODAgMzIwIDgwYzY1LjIgMCAxMTguOCAyOS42IDE1OS45IDY3LjdDNTE4LjQgMTgzLjUgNTQ1IDIyNiA1NTguNiAyNTZjLTEyLjYgMjgtMzYuNiA2Ni44LTcwLjkgMTAwLjlsLTUzLjgtNDIuMmM5LjEtMTcuNiAxNC4yLTM3LjUgMTQuMi01OC43YzAtNzAuNy01Ny4zLTEyOC0xMjgtMTI4Yy0zMi4yIDAtNjEuNyAxMS45LTg0LjIgMzEuNWwtNDYuMS0zNi4xek0zOTQuOSAyODQuMmwtODEuNS02My45YzQuMi04LjUgNi42LTE4LjIgNi42LTI4LjNjMC01LjUtLjctMTAuOS0yLTE2Yy43IDAgMS4zIDAgMiAwYzQ0LjIgMCA4MCAzNS44IDgwIDgwYzAgOS45LTEuOCAxOS40LTUuMSAyOC4yem05LjQgMTMwLjNDMzc4LjggNDI1LjQgMzUwLjcgNDMyIDMyMCA0MzJjLTY1LjIgMC0xMTguOC0yOS42LTE1OS45LTY3LjdDMTIxLjYgMzI4LjUgOTUgMjg2IDgxLjQgMjU2YzguMy0xOC40IDIxLjUtNDEuNSAzOS40LTY0LjhMODMuMSAxNjEuNUM2MC4zIDE5MS4yIDQ0IDIyMC44IDM0LjUgMjQzLjdjLTMuMyA3LjktMy4zIDE2LjcgMCAyNC42YzE0LjkgMzUuNyA0Ni4yIDg3LjcgOTMgMTMxLjFDMTc0LjUgNDQzLjIgMjM5LjIgNDgwIDMyMCA0ODBjNDcuOCAwIDg5LjktMTIuOSAxMjYuMi0zMi41bC00MS45LTMzek0xOTIgMjU2YzAgNzAuNyA1Ny4zIDEyOCAxMjggMTI4YzEzLjMgMCAyNi4xLTIgMzguMi01LjhMMzAyIDMzNGMtMjMuNS01LjQtNDMuMS0yMS4yLTUzLjctNDIuM2wtNTYuMS00NC4yYy0uMiAyLjgtLjMgNS42LS4zIDguNXoiLz48L3N2Zz4=);
        display: inline-block;
    }

    &:is(:hover, :focus-visible)::after {
        content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNTEyIj48cGF0aCBmaWxsPSIjMDM2IiBkPSJNMzguOCA1LjFDMjguNC0zLjEgMTMuMy0xLjIgNS4xIDkuMlMtMS4yIDM0LjcgOS4yIDQyLjlsNTkyIDQ2NGMxMC40IDguMiAyNS41IDYuMyAzMy43LTQuMXM2LjMtMjUuNS00LjEtMzMuN0w1MjUuNiAzODYuN2MzOS42LTQwLjYgNjYuNC04Ni4xIDc5LjktMTE4LjRjMy4zLTcuOSAzLjMtMTYuNyAwLTI0LjZjLTE0LjktMzUuNy00Ni4yLTg3LjctOTMtMTMxLjFDNDY1LjUgNjguOCA0MDAuOCAzMiAzMjAgMzJjLTY4LjIgMC0xMjUgMjYuMy0xNjkuMyA2MC44TDM4LjggNS4xem0xNTEgMTE4LjNDMjI2IDk3LjcgMjY5LjUgODAgMzIwIDgwYzY1LjIgMCAxMTguOCAyOS42IDE1OS45IDY3LjdDNTE4LjQgMTgzLjUgNTQ1IDIyNiA1NTguNiAyNTZjLTEyLjYgMjgtMzYuNiA2Ni44LTcwLjkgMTAwLjlsLTUzLjgtNDIuMmM5LjEtMTcuNiAxNC4yLTM3LjUgMTQuMi01OC43YzAtNzAuNy01Ny4zLTEyOC0xMjgtMTI4Yy0zMi4yIDAtNjEuNyAxMS45LTg0LjIgMzEuNWwtNDYuMS0zNi4xek0zOTQuOSAyODQuMmwtODEuNS02My45YzQuMi04LjUgNi42LTE4LjIgNi42LTI4LjNjMC01LjUtLjctMTAuOS0yLTE2Yy43IDAgMS4zIDAgMiAwYzQ0LjIgMCA4MCAzNS44IDgwIDgwYzAgOS45LTEuOCAxOS40LTUuMSAyOC4yem05LjQgMTMwLjNDMzc4LjggNDI1LjQgMzUwLjcgNDMyIDMyMCA0MzJjLTY1LjIgMC0xMTguOC0yOS42LTE1OS45LTY3LjdDMTIxLjYgMzI4LjUgOTUgMjg2IDgxLjQgMjU2YzguMy0xOC40IDIxLjUtNDEuNSAzOS40LTY0LjhMODMuMSAxNjEuNUM2MC4zIDE5MS4yIDQ0IDIyMC44IDM0LjUgMjQzLjdjLTMuMyA3LjktMy4zIDE2LjcgMCAyNC42YzE0LjkgMzUuNyA0Ni4yIDg3LjcgOTMgMTMxLjFDMTc0LjUgNDQzLjIgMjM5LjIgNDgwIDMyMCA0ODBjNDcuOCAwIDg5LjktMTIuOSAxMjYuMi0zMi41bC00MS45LTMzek0xOTIgMjU2YzAgNzAuNyA1Ny4zIDEyOCAxMjggMTI4YzEzLjMgMCAyNi4xLTIgMzguMi01LjhMMzAyIDMzNGMtMjMuNS01LjQtNDMuMS0yMS4yLTUzLjctNDIuM2wtNTYuMS00NC4yYy0uMiAyLjgtLjMgNS42LS4zIDguNXoiLz48L3N2Zz4=);
    }

    &.hide-labels::after {
        content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NzYgNTEyIj48cGF0aCBmaWxsPSIjOWY5ZDljIiBkPSJNMjg4IDgwYy02NS4yIDAtMTE4LjggMjkuNi0xNTkuOSA2Ny43Qzg5LjYgMTgzLjUgNjMgMjI2IDQ5LjQgMjU2YzEzLjYgMzAgNDAuMiA3Mi41IDc4LjYgMTA4LjNDMTY5LjIgNDAyLjQgMjIyLjggNDMyIDI4OCA0MzJzMTE4LjgtMjkuNiAxNTkuOS02Ny43QzQ4Ni40IDMyOC41IDUxMyAyODYgNTI2LjYgMjU2Yy0xMy42LTMwLTQwLjItNzIuNS03OC42LTEwOC4zQzQwNi44IDEwOS42IDM1My4yIDgwIDI4OCA4MHpNOTUuNCAxMTIuNkMxNDIuNSA2OC44IDIwNy4yIDMyIDI4OCAzMnMxNDUuNSAzNi44IDE5Mi42IDgwLjZjNDYuOCA0My41IDc4LjEgOTUuNCA5MyAxMzEuMWMzLjMgNy45IDMuMyAxNi43IDAgMjQuNmMtMTQuOSAzNS43LTQ2LjIgODcuNy05MyAxMzEuMUM0MzMuNSA0NDMuMiAzNjguOCA0ODAgMjg4IDQ4MHMtMTQ1LjUtMzYuOC0xOTIuNi04MC42QzQ4LjYgMzU2IDE3LjMgMzA0IDIuNSAyNjguM2MtMy4zLTcuOS0zLjMtMTYuNyAwLTI0LjZDMTcuMyAyMDggNDguNiAxNTYgOTUuNCAxMTIuNnpNMjg4IDMzNmM0NC4yIDAgODAtMzUuOCA4MC04MHMtMzUuOC04MC04MC04MGMtLjcgMC0xLjMgMC0yIDBjMS4zIDUuMSAyIDEwLjUgMiAxNmMwIDM1LjMtMjguNyA2NC02NCA2NGMtNS41IDAtMTAuOS0uNy0xNi0yYzAgLjcgMCAxLjMgMCAyYzAgNDQuMiAzNS44IDgwIDgwIDgwem0wLTIwOGExMjggMTI4IDAgMSAxIDAgMjU2IDEyOCAxMjggMCAxIDEgMC0yNTZ6Ii8+PC9zdmc+);
        width: 1.1rem;
        max-width: 1.1rem !important;
        top: 0;
        position: relative;
    }

    &.hide-labels:is(:hover, :focus-visible)::after {
        content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1NzYgNTEyIj48cGF0aCBmaWxsPSIjMDM2IiBkPSJNMjg4IDgwYy02NS4yIDAtMTE4LjggMjkuNi0xNTkuOSA2Ny43Qzg5LjYgMTgzLjUgNjMgMjI2IDQ5LjQgMjU2YzEzLjYgMzAgNDAuMiA3Mi41IDc4LjYgMTA4LjNDMTY5LjIgNDAyLjQgMjIyLjggNDMyIDI4OCA0MzJzMTE4LjgtMjkuNiAxNTkuOS02Ny43QzQ4Ni40IDMyOC41IDUxMyAyODYgNTI2LjYgMjU2Yy0xMy42LTMwLTQwLjItNzIuNS03OC42LTEwOC4zQzQwNi44IDEwOS42IDM1My4yIDgwIDI4OCA4MHpNOTUuNCAxMTIuNkMxNDIuNSA2OC44IDIwNy4yIDMyIDI4OCAzMnMxNDUuNSAzNi44IDE5Mi42IDgwLjZjNDYuOCA0My41IDc4LjEgOTUuNCA5MyAxMzEuMWMzLjMgNy45IDMuMyAxNi43IDAgMjQuNmMtMTQuOSAzNS43LTQ2LjIgODcuNy05MyAxMzEuMUM0MzMuNSA0NDMuMiAzNjguOCA0ODAgMjg4IDQ4MHMtMTQ1LjUtMzYuOC0xOTIuNi04MC42QzQ4LjYgMzU2IDE3LjMgMzA0IDIuNSAyNjguM2MtMy4zLTcuOS0zLjMtMTYuNyAwLTI0LjZDMTcuMyAyMDggNDguNiAxNTYgOTUuNCAxMTIuNnpNMjg4IDMzNmM0NC4yIDAgODAtMzUuOCA4MC04MHMtMzUuOC04MC04MC04MGMtLjcgMC0xLjMgMC0yIDBjMS4zIDUuMSAyIDEwLjUgMiAxNmMwIDM1LjMtMjguNyA2NC02NCA2NGMtNS41IDAtMTAuOS0uNy0xNi0yYzAgLjcgMCAxLjMgMCAyYzAgNDQuMiAzNS44IDgwIDgwIDgwem0wLTIwOGExMjggMTI4IDAgMSAxIDAgMjU2IDEyOCAxMjggMCAxIDEgMC0yNTZ6Ii8+PC9zdmc+);
    }

    &.readonly-toggle {
        right: -1rem;

        &.saving::after {
            content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMzIgOTZjMC0xNy43IDE0LjMtMzIgMzItMzJsMCA5NmMwIDE3LjcgMTQuMyAzMiAzMiAzMmwxOTIgMGMxNy43IDAgMzItMTQuMyAzMi0zMmwwLTk0LjJjNC41IDEuNiA4LjcgNC4yIDEyLjEgNy42bDc0LjUgNzQuNWM2IDYgOS40IDE0LjEgOS40IDIyLjZMNDE2IDQxNmMwIDE3LjctMTQuMyAzMi0zMiAzMkw2NCA0NDhjLTE3LjcgMC0zMi0xNC4zLTMyLTMyTDMyIDk2ek05NiA2NGwxOTIgMCAwIDk2TDk2IDE2MGwwLTk2ek0wIDk2TDAgNDE2YzAgMzUuMyAyOC43IDY0IDY0IDY0bDMyMCAwYzM1LjMgMCA2NC0yOC43IDY0LTY0bDAtMjQ1LjVjMC0xNy02LjctMzMuMy0xOC43LTQ1LjNMMzU0LjcgNTAuN2MtMTItMTItMjguMy0xOC43LTQ1LjMtMTguN0w2NCAzMkMyOC43IDMyIDAgNjAuNyAwIDk2ek0yNzIgMzIwYTQ4IDQ4IDAgMSAxIC05NiAwIDQ4IDQ4IDAgMSAxIDk2IDB6bS00OC04MGE4MCA4MCAwIDEgMCAwIDE2MCA4MCA4MCAwIDEgMCAwLTE2MHoiLz48L3N2Zz4=);
            width: 1.1rem;
            max-width: 1.1rem !important;
        }
    }

    &.readonly-toggle.show-readonly-mode::after {
        /* pencil */
        content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMzY5IiBkPSJNMzk1LjggMzkuNmM5LjQtOS40IDI0LjYtOS40IDMzLjkgMGw0Mi42IDQyLjZjOS40IDkuNCA5LjQgMjQuNiAwIDMzLjlMNDE3LjYgMTcxIDM0MSA5NC40bDU0LjgtNTQuOHpNMzE4LjQgMTE3TDM5NSAxOTMuNmwtMjE5IDIxOSAwLTEyLjZjMC04LjgtNy4yLTE2LTE2LTE2bC0zMiAwIDAtMzJjMC04LjgtNy4yLTE2LTE2LTE2bC0xMi42IDAgMjE5LTIxOXpNNjYuOSAzNzkuNWMxLjItNCAyLjctNy45IDQuNy0xMS41TDk2IDM2OGwwIDMyYzAgOC44IDcuMiAxNiAxNiAxNmwzMiAwIDAgMjQuNGMtMy43IDEuOS03LjUgMy41LTExLjYgNC43TDM5LjYgNDcyLjRsMjcuMy05Mi44ek00NTIuNCAxN2MtMjEuOS0yMS45LTU3LjMtMjEuOS03OS4yIDBMNjAuNCAzMjkuN2MtMTEuNCAxMS40LTE5LjcgMjUuNC0yNC4yIDQwLjhMLjcgNDkxLjVjLTEuNyA1LjYtLjEgMTEuNyA0IDE1LjhzMTAuMiA1LjcgMTUuOCA0bDEyMS0zNS42YzE1LjQtNC41IDI5LjQtMTIuOSA0MC44LTI0LjJMNDk1IDEzOC44YzIxLjktMjEuOSAyMS45LTU3LjMgMC03OS4yTDQ1Mi40IDE3ek0zMzEuMyAyMDIuN2M2LjItNi4yIDYuMi0xNi40IDAtMjIuNnMtMTYuNC02LjItMjIuNiAwbC0xMjggMTI4Yy02LjIgNi4yLTYuMiAxNi40IDAgMjIuNnMxNi40IDYuMiAyMi42IDBsMTI4LTEyOHoiLz48L3N2Zz4=);
        width: 1.05rem;
        max-width: 1.05rem !important;
        right: 10px;
    }

    &.readonly-toggle::after {
        /* pencil slash */
        content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNTEyIj48cGF0aCBmaWxsPSIjMzY5IiBkPSJNMjUuOSAzLjRDMTktMiA4LjktLjggMy40IDYuMVMtLjggMjMuMSA2LjEgMjguNmw2MDggNDgwYzYuOSA1LjUgMTcgNC4zIDIyLjUtMi42czQuMy0xNy0yLjYtMjIuNUwyNS45IDMuNHpNNTU5IDEzOC44YzIxLjktMjEuOSAyMS45LTU3LjMgMC03OS4yTDUxNi40IDE3Yy0yMS45LTIxLjktNTcuMy0yMS45LTc5LjIgMEwyOTcuNSAxNTYuN2wyNS4zIDIwTDM4Mi40IDExNyA0NTkgMTkzLjZsLTUwLjYgNTAuNiAyNS4zIDIwTDU1OSAxMzguOHpNMzE3LjIgMzM1LjNMMjQwIDQxMi42bDAtMTIuNmMwLTguOC03LjItMTYtMTYtMTZsLTMyIDAgMC0zMmMwLTguOC03LjItMTYtMTYtMTZsLTEyLjYgMCA2OC4yLTY4LjItMjUuMy0yMC04MS45IDgxLjljLTExLjQgMTEuNC0xOS43IDI1LjQtMjQuMiA0MC44bC0zNS42IDEyMWMtMS43IDUuNi0uMSAxMS43IDQgMTUuOHMxMC4yIDUuNyAxNS44IDRsMTIxLTM1LjZjMTUuNC00LjUgMjkuNC0xMi45IDQwLjgtMjQuMmw5Ni4yLTk2LjItMjUuMy0yMHpNNDkzLjggMzkuNmw0Mi42IDQyLjZjOS40IDkuNCA5LjQgMjQuNiAwIDMzLjlMNDgxLjYgMTcxIDQwNSA5NC40bDU0LjgtNTQuOGM5LjQtOS40IDI0LjYtOS40IDMzLjkgMHpNMTM1LjYgMzY4bDI0LjQgMCAwIDMyYzAgOC44IDcuMiAxNiAxNiAxNmwzMiAwIDAgMjQuNGMtMy43IDEuOS03LjUgMy41LTExLjYgNC43bC05Mi44IDI3LjMgMjcuMy05Mi44YzEuMi00IDIuNy03LjkgNC43LTExLjZ6Ii8+PC9zdmc+);
        width: 1.3rem;
        max-width: 1.3rem !important;
    }
}
.error-message:before {
    content: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMSIgZD0iTTQ4IDI1NmEyMDggMjA4IDAgMSAwIDQxNiAwQTIwOCAyMDggMCAxIDAgNDggMjU2em0xMTAuMS02NEwxOTIgMTU4LjFsMTcgMTcgNDcgNDcgNDctNDcgMTctMTdMMzUzLjkgMTkybC0xNyAxNy00NyA0NyA0NyA0NyAxNyAxN0wzMjAgMzUzLjlsLTE3LTE3LTQ3LTQ3LTQ3IDQ3LTE3IDE3TDE1OC4xIDMyMGwxNy0xNyA0Ny00Ny00Ny00Ny0xNy0xN3oiLz48cGF0aCBmaWxsPSJkYXJrcmVkIiBkPSJNMjU2IDQ4YTIwOCAyMDggMCAxIDEgMCA0MTYgMjA4IDIwOCAwIDEgMSAwLTQxNnptMCA0NjRBMjU2IDI1NiAwIDEgMCAyNTYgMGEyNTYgMjU2IDAgMSAwIDAgNTEyem05Ny45LTMyMEwzMjAgMTU4LjFsLTE3IDE3LTQ3IDQ3LTQ3LTQ3LTE3LTE3TDE1OC4xIDE5MmwxNyAxNyA0NyA0Ny00NyA0Ny0xNyAxN0wxOTIgMzUzLjlsMTctMTcgNDctNDcgNDcgNDcgMTcgMTdMMzUzLjkgMzIwbC0xNy0xNy00Ny00NyA0Ny00NyAxNy0xN3oiLz48L3N2Zz4=);
    display: inline-block;
    height: 1rem;
    width: 1rem;
    position: absolute;
    top: 0.66rem;
    left: 0.5rem;
    pointer-events: none;
}
.message {
    background: #fff7e5;
    border: 1px solid transparent;
    color: #8b0000;
    padding: 0.5rem 0;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 1rem !important;
}
.error-message {
    background: #ffe5e5;
    outline: 2px solid #8b0000;
    outline-offset: 2px;
    padding-inline: 2rem 1rem;
    position: relative;
}
</style>
<style>
html.vnext-single-mode-title-pending .subtitle,
.subtitle[data-single-mode-title-managed='true'] {
    display: block;
    overflow: clip;
    transform-origin: top center;
}

body.single-incentives h2.subtitle {
    padding-bottom: none;
    border-bottom: none;
}

body.single-incentives .subtitle,
html.vnext-single-mode-title-pending .subtitle,
.subtitle[data-single-mode-title-managed='true'][data-single-mode-title-state='hidden'] {
    visibility: hidden;
    opacity: 0;
    max-height: 0;
    transform: scaleY(0.7) translateY(-0.2rem);
    transition:
        max-height 0.3s ease-out,
        opacity 0.3s ease-out,
        transform 0.3s ease-out,
        visibility 0s linear 0.15s;
}

.subtitle[data-single-mode-title-managed='true'][data-single-mode-title-state='visible'] {
    visibility: visible;
    opacity: 1;
    transform: scaleY(1) translateY(0);
    transition:
        max-height 0.3s ease-out,
        opacity 0.3s ease-out,
        transform 0.3s ease-out;
}

body.betterhomesbc #dialog .dialog-content h2 {
    border-bottom: 3px solid var(--wp--preset--color--primary-brand);
    color: var(--wp--preset--color--primary-brand);
    margin-bottom: 1rem;
}

body:has(#single-mode-dialog[open]) {
    overflow: hidden;
}

#single-mode-dialog {
    background-color: var(--wp--preset--color--white);
    border: 0;
    box-shadow: var(--box-shadow);
    color: var(--wp--preset--color--text-color);
    max-width: 600px;
}

#single-mode-dialog::backdrop {
    background-color: rgba(0 0 0 / 0.5);
    backdrop-filter: blur(2px);
}

#single-mode-dialog .dialog-content h2 {
    display: inline-block;
    font-size: 1.5rem;
    padding-top: 0.5rem;
    padding-inline: 3rem;
    padding-bottom: 0.5rem;
    margin-top: 0;
    margin-bottom: 0;
    position: relative;
    left: -2rem;
    outline: none;
}

#single-mode-dialog .dialog-content > * {
    padding-inline: 1rem;
}

#single-mode-dialog #single-mode-dialog-desc {
    padding-block-start: 1rem;
}

#single-mode-dialog .dialog-content > *:last-child {
    padding-bottom: 0.5rem;
}

#single-mode-dialog .close-dialog {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 0;
    background: top;
    border: thin solid var(--wp--preset--color--transparent);
    color: var(--wp--preset--color--text-color);
    padding-inline: 0.5rem;
    padding-top: 0.25rem;
    min-width: 3rem;
}

#single-mode-dialog .close-dialog::after {
    content: '×';
    font-family: Verdana, Geneva, Tahoma, sans-serif;
    font-size: 1rem;
    display: inline-block;
    padding: 0.25rem;
    width: 1rem;
}

#single-mode-dialog .close-dialog:hover,
#single-mode-dialog .close-dialog:focus-visible {
    border: thin solid var(--wp--preset--color--text-color);
    border-radius: 0.25rem;
    outline: none;
    cursor: pointer;
}

#single-mode-dialog .dialog-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding-top: 0.5rem;
}

#single-mode-dialog .rebate-title {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    align-items: baseline;
}

#single-mode-dialog :is(ul) {
    padding-inline: 2rem !important;
}

#single-mode-dialog :is(li) {
    margin-bottom: 0.33rem;
}
#single-mode-dialog .rebate-title-headline {
    font-weight: 400;
    font-size: 1rem;
}

#single-mode-dialog .rebate-title-link.rebate-title-link {
    display: inline;
    text-decoration: none;
}

#single-mode-dialog .rebate-title-link.rebate-title-link:focus-visible,
#single-mode-dialog .rebate-title-link.rebate-title-link:hover {
    text-decoration: underline;
}

#single-mode-dialog .wp-block-button .wp-block-button__link {
    border: 2px solid currentcolor;
    border-radius: 0.25rem;
    font-size: 0.85rem;
}

#single-mode-dialog .wp-block-button.is-style-outline .wp-block-button__link {
    border: 2px solid currentcolor;
}

.template {
    display: none;
}

.message {
    background: #fff7e5;
    border: 1px solid #facc15;
    color: #8b0000;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 1rem !important;

    &.tool-message {
        padding: 0.5rem 1rem 1rem;

        &::before {
            top: 0.8rem;
            margin-right: 0.5rem;
        }
    }

    :is(p) {
        margin: 0;
    }

    :is(span) {
        color: #440000 !important;
        font-weight: 700;
    }
}

.error-message {
    background: #ffe5e5;
    border: 2px solid #8b0000;
    padding-inline: 0.5rem !important;
    position: relative;

    &::before {
        content: '' !important;
        display: none !important;
    }
}

.p-2 {
    padding: 2rem;
}

.not-eligible .warning-message {
    padding: 2rem;
}

.warning-message {
    background: #fff7e5;
    border: 1px solid #facc15;
}

.warning-message .has-icon::before {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyNCAyMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1LjcxOTYgMi4zNTY4N0MxNC45MzU3IDEuMDQyOSAxMy41NDU3IDAuMjM0Mzc1IDEyLjAwNDggMC4yMzQzNzVDMTAuNDYyNyAwLjIzNDM3NSA5LjA3MjY0IDEuMDE4MjMgOC4yODk5NSAyLjM1Njg3TDAuNjMyMDkgMTUuMTk1NkMtMC4yMDIxMDkgMTYuNTU5OSAtMC4yMDIxMDkgMTguMTc3IDAuNTgxNzQxIDE5LjU2N0MxLjM2NTYgMjAuOTMxMyAyLjc4MDI2IDIxLjc2NTUgNC4zNDY4NiAyMS43NjU1SDE5LjY2MjZDMjEuMjU1IDIxLjc2NTUgMjIuNjQ1IDIwLjk1NyAyMy40Mjc3IDE5LjU2N0MyNC4yMTE1IDE4LjIwMjcgMjQuMTg1OSAxNi41NjAxIDIzLjM3NzMgMTUuMTk0NkwxNS43MTk2IDIuMzU2ODdaTTEyLjAwNDggMTguNDA1QzExLjA0NDIgMTguNDA1IDEwLjI2MTQgMTcuNjIxMSAxMC4yNjE0IDE2LjY2MTZDMTAuMjYxNCAxNS43MDEgMTEuMDQ1MiAxNC45MTgyIDEyLjAwNDggMTQuOTE4MkMxMi45NjUzIDE0LjkxODIgMTMuNzQ4MiAxNS43MDIgMTMuNzQ4MiAxNi42NjE2QzEzLjc0ODIgMTcuNjIxMSAxMi45NjUzIDE4LjQwNSAxMi4wMDQ4IDE4LjQwNVpNMTMuODI0MiA2LjU3NzE1TDEzLjMxODcgMTIuMzM5NkMxMy4yOTMxIDEyLjY5MyAxMy4xMTY0IDEzLjAyMTcgMTIuODM5IDEzLjI0OThDMTIuNjExOSAxMy40NTIyIDEyLjMwNzggMTMuNTUyOCAxMS45ODAxIDEzLjU1MjhIMTEuODUzN0MxMS4yMjE5IDEzLjUwMjUgMTAuNjkwOCAxMi45OTcxIDEwLjY0MDUgMTIuMzM5NkwxMC4xMzUgNi41NzcxNUMxMC4wODQ3IDYuMDk3MzcgMTAuMjM1NyA1LjYxNjU5IDEwLjU2NDQgNS4yMzc1QzEwLjg5MzIgNC44NTg0MSAxMS4zMjI2IDQuNjMxMzYgMTEuODAyNCA0LjU4QzEyLjMwNzggNC41Mjk2NiAxMi43NjMgNC42ODA3IDEzLjE0MiA1LjAwOTQ0QzEzLjUyMTEgNS4zMTI1MSAxMy43NDgyIDUuNzY3NjEgMTMuNzk5NSA2LjI0NzM5QzEzLjg0OTkgNi4zNzQ3NCAxMy44NDk5IDYuNDc2NDIgMTMuODI0MiA2LjU3NzEyTDEzLjgyNDIgNi41NzcxNVoiIGZpbGw9IiNGRkMwMTciLz4KPC9zdmc+);
    background-size: contain;
    content: '';
    display: inline-block;
    height: 1.5rem;
    min-width: 1.5rem;
    width: 1.5rem;
    margin-bottom: 0.5rem;
    background-repeat: no-repeat;
    background-position: center;
    border: none;
    position: relative;
    top: 0.35rem;
}

.query-conditional-group-block.is-dirty-variable::before,
.multi-query-content-block.is-dirty-variable::after {
    /* background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjIiIHZpZXdCb3g9IjAgMCAyNCAyMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1LjcxOTYgMi4zNTY4N0MxNC45MzU3IDEuMDQyOSAxMy41NDU3IDAuMjM0Mzc1IDEyLjAwNDggMC4yMzQzNzVDMTAuNDYyNyAwLjIzNDM3NSA5LjA3MjY0IDEuMDE4MjMgOC4yODk5NSAyLjM1Njg3TDAuNjMyMDkgMTUuMTk1NkMtMC4yMDIxMDkgMTYuNTU5OSAtMC4yMDIxMDkgMTguMTc3IDAuNTgxNzQxIDE5LjU2N0MxLjM2NTYgMjAuOTMxMyAyLjc4MDI2IDIxLjc2NTUgNC4zNDY4NiAyMS43NjU1SDE5LjY2MjZDMjEuMjU1IDIxLjc2NTUgMjIuNjQ1IDIwLjk1NyAyMy40Mjc3IDE5LjU2N0MyNC4yMTE1IDE4LjIwMjcgMjQuMTg1OSAxNi41NjAxIDIzLjM3NzMgMTUuMTk0NkwxNS43MTk2IDIuMzU2ODdaTTEyLjAwNDggMTguNDA1QzExLjA0NDIgMTguNDA1IDEwLjI2MTQgMTcuNjIxMSAxMC4yNjE0IDE2LjY2MTZDMTAuMjYxNCAxNS43MDEgMTEuMDQ1MiAxNC45MTgyIDEyLjAwNDggMTQuOTE4MkMxMi45NjUzIDE0LjkxODIgMTMuNzQ4MiAxNS43MDIgMTMuNzQ4MiAxNi42NjE2QzEzLjc0ODIgMTcuNjIxMSAxMi45NjUzIDE4LjQwNSAxMi4wMDQ4IDE4LjQwNVpNMTMuODI0MiA2LjU3NzE1TDEzLjMxODcgMTIuMzM5NkMxMy4yOTMxIDEyLjY5MyAxMy4xMTY0IDEzLjAyMTcgMTIuODM5IDEzLjI0OThDMTIuNjExOSAxMy40NTIyIDEyLjMwNzggMTMuNTUyOCAxMS45ODAxIDEzLjU1MjhIMTEuODUzN0MxMS4yMjE5IDEzLjUwMjUgMTAuNjkwOCAxMi45OTcxIDEwLjY0MDUgMTIuMzM5NkwxMC4xMzUgNi41NzcxNUMxMC4wODQ3IDYuMDk3MzcgMTAuMjM1NyA1LjYxNjU5IDEwLjU2NDQgNS4yMzc1QzEwLjg5MzIgNC44NTg0MSAxMS4zMjI2IDQuNjMxMzYgMTEuODAyNCA0LjU4QzEyLjMwNzggNC41Mjk2NiAxMi43NjMgNC42ODA3IDEzLjE0MiA1LjAwOTQ0QzEzLjUyMTEgNS4zMTI1MSAxMy43NDgyIDUuNzY3NjEgMTMuNzk5NSA2LjI0NzM5QzEzLjg0OTkgNi4zNzQ3NCAxMy44NDk5IDYuNDc2NDIgMTMuODI0MiA2LjU3NzEyTDEzLjgyNDIgNi41NzcxNVoiIGZpbGw9IiNGRkMwMTciLz4KPC9zdmc+);
  background-size: 15px;
  content: "Reloading settings update";
  display: inline-block;
  height: var(--wp--preset--font-size--small);
  background-repeat: no-repeat;
  background-position: center;
  border: none;
  position: relative;
  top: -1px;
  margin-left: 4px;
  font-size: .85rem;
  background-position: left 4px;
  padding-left: 1.15rem;
  color: #92400e; */
}

.query-conditional-group-block.is-dirty-variable:not(
        .query-conditional-group-block .query-conditional-group-block
    ) {
    filter: blur(2px);
    transition: all 0.2s ease;
}

#post-content:has(#vnextRebateFilterApp[data-mode='single']):has(
        .is-dirty-variable
    ) {
    --icon-gear: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBmaWxsPSIjMzY5IiBkPSJNNDk1LjkgMTY2LjZjMy4yIDguNyAuNSAxOC40LTYuNCAyNC42bC00My4zIDM5LjRjMS4xIDguMyAxLjcgMTYuOCAxLjcgMjUuNHMtLjYgMTcuMS0xLjcgMjUuNGw0My4zIDM5LjRjNi45IDYuMiA5LjYgMTUuOSA2LjQgMjQuNmMtNC40IDExLjktOS43IDIzLjMtMTUuOCAzNC4zbC00LjcgOC4xYy02LjYgMTEtMTQgMjEuNC0yMi4xIDMxLjJjLTUuOSA3LjItMTUuNyA5LjYtMjQuNSA2LjhsLTU1LjctMTcuN2MtMTMuNCAxMC4zLTI4LjIgMTguOS00NCAyNS40bC0xMi41IDU3LjFjLTIgOS4xLTkgMTYuMy0xOC4yIDE3LjhjLTEzLjggMi4zLTI4IDMuNS00Mi41IDMuNXMtMjguNy0xLjItNDIuNS0zLjVjLTkuMi0xLjUtMTYuMi04LjctMTguMi0xNy44bC0xMi41LTU3LjFjLTE1LjgtNi41LTMwLjYtMTUuMS00NC0yNS40TDgzLjEgNDI1LjljLTguOCAyLjgtMTguNiAuMy0yNC41LTYuOGMtOC4xLTkuOC0xNS41LTIwLjItMjIuMS0zMS4ybC00LjctOC4xYy02LjEtMTEtMTEuNC0yMi40LTE1LjgtMzQuM2MtMy4yLTguNy0uNS0xOC40IDYuNC0yNC42bDQzLjMtMzkuNEM2NC42IDI3My4xIDY0IDI2NC42IDY0IDI1NnMuNi0xNy4xIDEuNy0yNS40TDIyLjQgMTkxLjJjLTYuOS02LjItOS42LTE1LjktNi40LTI0LjZjNC40LTExLjkgOS43LTIzLjMgMTUuOC0zNC4zbDQuNy04LjFjNi42LTExIDE0LTIxLjQgMjIuMS0zMS4yYzUuOS03LjIgMTUuNy05LjYgMjQuNS02LjhsNTUuNyAxNy43YzEzLjQtMTAuMyAyOC4yLTE4LjkgNDQtMjUuNGwxMi41LTU3LjFjMi05LjEgOS0xNi4zIDE4LjItMTcuOEMyMjcuMyAxLjIgMjQxLjUgMCAyNTYgMHMyOC43IDEuMiA0Mi41IDMuNWM5LjIgMS41IDE2LjIgOC43IDE4LjIgMTcuOGwxMi41IDU3LjFjMTUuOCA2LjUgMzAuNiAxNS4xIDQ0IDI1LjRsNTUuNy0xNy43YzguOC0yLjggMTguNi0uMyAyNC41IDYuOGM4LjEgOS44IDE1LjUgMjAuMiAyMi4xIDMxLjJsNC43IDguMWM2LjEgMTEgMTEuNCAyMi40IDE1LjggMzQuM3pNMjU2IDMzNmE4MCA4MCAwIDEgMCAwLTE2MCA4MCA4MCAwIDEgMCAwIDE2MHoiLz48L3N2Zz4=);
    &::before {
        background-image: var(--icon-gear);
        background-size: 2rem;
        background-position: 1rem center;
        background-repeat: no-repeat;
        box-shadow: 0 0.25rem 0.7rem #31313240;
        content: 'Updating page information';
        background-color: #fff;
        border: 2px solid #369;
        border-radius: 1rem;
        color: #369;
        padding: 1rem 2rem 1rem 3.5rem;
        position: fixed;
        margin: auto;
        left: 0%;
        right: 0%;
        top: 10rem;
        width: fit-content;
        white-space: nowrap;
        z-index: 9;
    }
}

#post-content:has(#vnextRebateFilterApp[data-mode='archive']) {
    background-color: #f0f0f0;

    #rebatesFilterControls:has(.stacked) {
        padding: 2rem;
        box-shadow:
            0 0 3px rgb(0 0 0 / 0.2),
            0 0 6px rgb(0 0 0 / 0.1);
    }

    .not-eligible a,
    .not-eligible a > * {
        font-size: inherit !important;
    }
}

#rebatesFilterControls.labels-hidden label.small {
    display: none !important;
}

#grid-or-list-container {
    display: none;

    @media (width > 564px) {
        display: block;
    }

    border: 2px solid #fff;
    border-radius: 100vw;
    max-height: 2.5rem;

    &:focus-within {
        outline: 2px solid #369;
    }
}

#grid-or-list {
    + label {
        display: inline-block;
    }

    + label::before,
    + label::after {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        border: 2px solid #369;
        padding-inline: 0.25rem;
        background: #369;
        cursor: pointer;
    }

    + label::before {
        /* grid icon blue */
        content: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMzIgMzInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZmlsbD0nIzM2OScgZD0nTTcgN3Y3aDd2LTd6IE0xNyA3djdoN3YtN3pNNyAxN3Y3aDd2LTd6TTE3IDE3djdoN3YtN3onLz48L3N2Zz4=);
        border-radius: 100vw 0 0 100vw;
        padding-inline: 0.5rem 0.25rem;
        border-right: 0;
    }

    &:checked + label::before {
        /* grid icon white */
        content: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMzIgMzInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZmlsbD0nI2ZmZicgZD0nTTcgN3Y3aDd2LTd6IE0xNyA3djdoN3YtN3pNNyAxN3Y3aDd2LTd6TTE3IDE3djdoN3YtN3onLz48L3N2Zz4=);
    }

    + label::after {
        /* list icon blue */
        content: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMzIgMzInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZmlsbD0nIzM2OScgZD0nTTcgOXYyaDJ2LTJ6TTcgMTV2Mmgydi0yek03IDIxdjJoMnYtMnpNMTIgOXYyaDEydi0yek0xMiAxNXYyaDEydi0yek0xMiAyMXYyaDEydi0yeicvPjwvc3ZnPg==);
        border-radius: 0 100vw 100vw 0;
        padding-inline: 0.25rem 0.5rem;
        border-left: 0;
    }

    &:not(:checked) + label::after {
        /* list icon white */
        content: url(data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PScwIDAgMzIgMzInIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHBhdGggZmlsbD0nI2ZmZicgZD0nTTcgOXYyaDJ2LTJ6TTcgMTV2Mmgydi0yek03IDIxdjJoMnYtMnpNMTIgOXYyaDEydi0yek0xMiAxNXYyaDEydi0yek0xMiAyMXYyaDEydi0yeicvPjwvc3ZnPg==);
    }

    &:not(:checked) + label::before,
    &:checked + label::after {
        background: #ddd;
    }

    :is(ul) {
        padding: 0;
        display: flex;
    }

    :is(li) {
        list-style: none;
    }

    &:not(:checked) ~ ul {
        flex-flow: column;
    }

    &:not(:checked) ~ ul li {
        padding: 0.5em 0;
        border-top: 1px solid #369;
        width: 100%;
    }

    &:not(:checked) ~ ul li:last-child {
        border-bottom: 1px solid #369;
    }

    &:not(:checked) ~ ul h2,
    &:not(:checked) ~ ul p {
        display: inline-block;
        font-size: 1em;
        margin: 0 1em 0 0;
    }

    &:not(:checked) ~ ul p:last-child {
        float: right;
    }

    &:checked ~ ul {
        flex-flow: row wrap;
        gap: 1em;
    }

    &:checked ~ ul li {
        flex: 0 0 16em;
        padding: 1em;
        box-shadow: 0.5em 0.5em 0.5em #bbb;
    }

    &:checked ~ ul p {
        margin: 0;
    }
}
</style>
