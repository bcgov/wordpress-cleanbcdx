## 1.0.7 July 20, 2026
– Minor style update for quick link SVG

## 1.0.6 July 17, 2026
– Protected area prompt message html allowances

## 1.0.5 July 15, 2026
– Pin to top feature for definitions modal based on class 'pin-to-top'

## 1.0.4 July 14, 2026
– Updated defintions and protected area block to work together and with custom post types

## 1.0.3 June 29, 2026
– Protected area block feature added

## 1.0.2 June 11, 2026
– Added commercial 5 up variant icons

## 1.0.1 June 10, 2026
– Style updates for rebate icons in headlines

## 1.0.0 – May 2026
– New plugin for CleanBC specific WordPress upgrades – based on efforts from original CleanBC plugin

## 0.31.4 May 11, 2026
– Updated to remove BB scripts and styles (as temporary inclusion in BH plugin)

## 0.31.3 April 30, 2026
– Updated redirect hit count to reject PDF size checks

## 0.31.2 April 28, 2026
– Better Buildings updates for PROD on OpenShift deployment

## 0.31.1 April 23, 2026
– Go Electric how it works diagrams

## 0.31.0 April 21, 2026
– Testing minor update to remove conditional blocks to align with standalone Better Homes plugin
– Fixed CleanBC drivers icon processing

## 0.30.39 April 1, 2026
– Updated MURB limit for new home values

## 0.30.38 March 31, 2026
– Updated ESP/HRR rebate tier restrictions based on assessed value
– GoElectric icon styles for rebates

## 0.30.37 March 30, 2026
– Linked card DOM processing

## 0.30.36 March 25, 2026
– Reverted ineligible state for Insulation and Window and doors rebates for oil + non-Fortis gas room heating types

## 0.30.35 March 23-25, 2026
– Updated contractor and PQEA share links to append 'source=share' only when copied from the Share button
– Contractor and PQEA shared-link hydration to ignore preferred local settings when 'source=share' is present
– Refined contractor condo/apartment heat pump type handling for ESP/HRR child terms, including display-label and filter-option behaviour
– Synced fetched stylesheet and style nodes during single mode rebate AJAX content refresh so injected content styles are applied after partial page updates

## 0.30.34 March 19, 2026
– Added ineligible stae for Insulation and Window and doors rebates for oil + non-Fortis gas room heating types

## 0.30.33 March 17, 2026
– Fixed restored building type selection so single mode only keeps valid child types, while archive mode still preserves "other"
– Added tests for restored buildi3ng type selection handling
– Updated error messaging

## 0.30.32 March 11, 2026
– Enabled hash in URL for side menu links

## 0.30.31 March 9-10, 2026
– Single mode suppression of invalid query modal if current page is target
– Updated single-mode rebate headings to react to URL/page state and animate title changes only when the displayed heading actually changes

## 0.30.30 March 6, 2026
– Remove entries from Gravity Forms submissions

## 0.30.29 March 5-6, 2026
– Updated single-mode modal behavior to wait until all required fields are completed before opening
– Added 'source=planner' handling to auto-expand single mode on load
– Kept 'source=planner' in single-mode URLs only while the form is incomplete

## March 4, 2026 – New vNext site launched

## 0.30.28 March 3, 2026
– Updated single-mode initialization to stop auto-populating room and water heating when user details are missing
– Updated single mode so assessed property value is not auto-selected after choosing type of home
– Added single-mode edit-mode lock while required home details are incomplete
– Updated single mode collapse behavior to force edit mode off and default to collapsed on page load

## 0.30.27 February 27, 2026
– Updated search omission rules for Definitions to exclude posts tagged 'hide-from-search'
– Updated single-mode alternate rebate modal links to set destination URL state to valid
– Added modal scroll lock position reset after close – fixed positioning bug

## 0.30.26 February 26, 2026
– Added wide modal injection for home types in questionnaire
– Removed archive mode find-rebates page details injection
– Reordered questionnaire form fields
– Set scroll lock on body when definitions modal is opened
– Updated single-mode modal copy and actions, including dedicated load-mismatch messaging
– Improved single-mode mismatch checks to run from full form-state changes with queued re-checks during rapid edits
– Added fallback invalid-query handling when no alternate rebate is available after a mismatch
– Updated single-mode warning copy for installed heat pump selections and kept warning links inline
– Fixed HP/HWHP + no-results + injection bug
– Modal click outside to close added + single mode modal scroll lock

## 0.30.25 February 25, 2026
– Refined single-mode dialog decision branches for load and first-change scenarios
– Updated same-type alternate routing in single mode to use verified eligibility results
– Added dynamic change-modal copy/actions (context-aware title/content/button labels) and stabilized modal state handling

## 0.30.24 February 20-24, 2026
– Improved single-mode disclosure semantics, focus behavior, and dialog accessibility
– Fixed single-mode heating guards so HP and HPWH settings do not conflict
– Added tests for single-mode eligibility behavior
– Reworked "Your home's details" for screen readers and removed roving-grid navigation
– Improved edit/select announcements, focus handoff, and duplicate readback handling
– Added Screen reader enhanced mode with skip/reset controls and simplified styling
– Updated skip flow to focus the reset control after enhanced mode is enabled
– Reduced duplicate archive-mode announcements by removing redundant semantics and label numbering
– Updated PDF label/icon punctuation order so trailing punctuation always appears after the icon

## 0.30.23 February 19, 2026
– Added new icons

## 0.30.22 February 18, 2026
– Added side scrolling navigation observer and related styles
– Border fix on in-page nav highlighting
– Fixed side-nav nested width overflow so inner items stay within parent container width
– Updated single-mode rebate controls to close on outside click/close button/select change and return focus to the control button
– Updated definitions dialog width detection to apply 'wide' when the trigger link or an ancestor has '.wide'
– Updated contractor, PQEA, and rebate archive location inputs to swap arrow-to-clear icon on valid selection, with clear/reset + refocus behavior
– Updated rebate archive auto-scroll to results to trigger only once after full questionnaire completion
– Updated archive keyboard flow to suppress auto-scroll on reverse tabbing and during completed-form review
– Updated single-mode collapsed settings to be inert and aria-hidden so hidden controls are removed from keyboard and screen-reader navigation
– Added electric-hp / electric-hpwh handling: labels, field option exclusions, and HP/HPWH-specific eligibility/error guards
– Patched URL serialization to keep the legacy "Electricity" value for room and water heating key/values
– Various styles updated

## 0.30.21 February 17, 2026
– Updated styles for PQEA tool additions
– Styles for full rebates tables

## 0.30.20 February 13, 2026
– Added PQEA post-type filtering for 'pqeas-renovation' and 'pqeas-construction' with a select control, defaulting to renovation
– Added PQEA URL/state support for post type ('post_type' query param), including share-link syncing and hydration
– Added 'post_type' to the PQEA API response payload for explicit client-side filtering
– Updated PQEA post-type select to use the same select class styling pattern as contractor tool selects
– Reordered PQEA filter controls so service region appears first and advisor type appears last
– Reordered contractor filter controls so service region appears first

## 0.30.19 February 12, 2026
– Updated contact form mobile styles
– Expanded PDF link checker to include links with "PDF" in href values
– Set text-wrap default to pretty with balance as fallback
– Added archive results guard to return no rebates when electricity provider is set to "other"
– Reset gas provider selection from "no provider" to "Select an option" when heating or water heating is changed to natural gas/propane
– Added descriptions to questionnaire selects in archive mode
– Sorting building types by slug for manual ordering
– Removed region from home location button label
– Updated MURB + HPWH guard logic to differentiate room vs water heating, allowing HPWH eligibility based on electric water heating with BC Hydro/New Westminster utility rules
– Added archive-mode view behavior to default to list view when filtered results narrow to a single rebate (while still allowing users to toggle back to grid)
– Added explicit rebate guard so selecting electricity provider "other" returns no eligible archive results
– Updated archive insertion handling to run only in archive mode and only inject eligible/not-eligible content when source description content exists
– Updated archive question captions to render 'description' when present (in addition to existing 'filter_desc'/'disabled_desc' content)
– Sorted grouped building options by slug (with 'other' last) for both archive and single mode
– Added gas-provider reset behavior: when heating or water heating is changed to natural gas/propane and gas is currently set to no provider, gas resets to "Select an option"

## 0.30.18 February 11, 2026
– Updated window and doors rebate type reference for validity guard
– Modified modal style

## 0.30.17 February 10, 2026
– Rebate headline style adjustments
– Hide external link svg repetition
– Support icon style adjustments
– Patched hiding Window and door subhead in results
– Fixed HPWH guard to allow alternate room heating type

## 0.30.16 February 6-7, 2026
– Minor style adjustments
– Added support/contact icons
– Contact form styling

## 0.30.15 February 5, 2026
- Expanded heating/water heating validation for multi-fuel pages
– Refine single-mode rebate validation and eligibility UX
- Fix state sync, initial AJAX refresh, and warning template output

## 0.30.14 February 4, 2026
– Error message applied to single mode fields when invalid
– Restyled update warning message for single mode tool
– New state query key with valid|invalid applied for better condition checks
– Include no-results state in single mode error tracking
– Ensure single mode initial load syncs state query param without marking the tool dirty
– Delay single mode render until after redirect decision to avoid flash
– Keep single mode collapsed on load when required settings are missing
– Single mode state now reflects eligibility of the current page’s rebate type against filtered results
– Added single mode eligibility modal with alternative rebate links and MURB ineligibility messaging
– Fixed validation to support multiple allowed types for heating and water heating
– Fixed single mode error message template interpolation and updated error messages and field labels

## 0.30.13 February 3, 2026
– Remmoved locking of page specific fields to allow editing (and errors)
– Added rebate page context tracking for building group, rebate type, and heating types
– Added HPWH-aware validation logic for single mode rebate tool selections
– Added error styling to single mode rebate settings, details, and selects when selections conflict with page settings
– Updated the definitions dialog to prevent it from being re‑created 

## 0.30.12 January 30, 2026
– Added glossary page handling 
– Added unique IDs to glossary h3 headings based on their title
– Added lang attribution to elements that use 'lang-*' classes for accessibility
– First pass at URL parsing tool with shortcode [cleanbc_rebate_query_tool]
– Output JSON and CSV format with clipboard copy and datestamped file download 
– Exclude search results when a page has a custom body class of "hide-from-search"

## 0.30.11 January 27, 2026
– Contractor and PQEA tool design updates

## 0.30.10 January 27, 2026
– Enhanced search priority ordering to persist across pagination using a LEFT JOIN + COALESCE
– Added teardown hook to remove search priority query clauses after the main search query runs
– Fixed priority ORDER BY injection to avoid SQL syntax errors

## 0.30.9 January 26, 2026
– Rebate pages styling updates
– Added a search priority option based on an ACF field "search_priority"

## 0.30.8 January 23, 2026
– Style updates, including datalist icon
– Auto-set gas provider to "no gas" when heating and water choices are non-gas and gas is unset
– Linked "Contact an Energy Coach" in rebate tool error messages
– Added "janky mobile" fix to questionnaire location

## 0.30.7 January 22, 2026
– Modified null results for contractors including styles that impact PQEA results

## 0.30.6 January 21, 2026
– Re-run definitions handling after Gravity Forms (currently hardcoded for ID 2) submission only when the form is present
– Hydration of Contractor and PQEA tools with preferred location details

## 0.30.5 January 21, 2026
– Updated Vue-based tool input and select styles to be consistent
– Icon updates
– Additional form styling for contact page, including error validation styling
– Updated definitions dialog to allow 'wide' class passed from the link class

## 0.30.4 January 20, 2026
– Initial Gravity Form styles

## 0.30.3 January 19-20, 2026
– Switched the vNext rebate block to its own selector so it mounts independently from the legacy rebate app
– Resolved style issue arising from moving to new rebate selector
– Single mode vNext rebates now prefer query string heating parameters over SSR defaults
– Image card and missing-link style updates

## 0.30.2 January 16, 2026
– Single mode rebate tool instructions reveal update

## 0.30.1 January 15, 2026
- Added support for shorthand program values in contractor filter URLs:
-- program=ESP -> Energy Savings Program (ESP)
-- program=HRR -> Home Renovation Rebate (HRR)
- Updated query string hydration to accept both shorthand and full program names for backward compatibility
- Updated share (copy) link behavior to output shorthand program values (ESP / HRR) for cleaner, shorter URLs
- Ensured program validation still occurs against the known program list to prevent invalid values
- Maintained compatibility with shared links using full program names
– Filter out 'wood' from the options for "How do you heat your water?" question
– Added a check for HWHP in the page slug to disable option in rebate single mode tool
– General styles and card meta cleanup 

## 0.30.0 January 14, 2026
– Added copy-to-clipboard links for filter states, allowing users to share pre-filtered Contractor and Energy Advisor (PQEA) results
– Implemented query-string hydration so shared links restore filter state on page load
– Added support for company name filtering via URL parameter (company) in both tools
– Added support for service region filtering via URL parameter (region) in both tools
– Standardized tool identification using the tool query parameter (contractors, pqeas) to prevent cross-tool hydration
– Prevented double URL encoding by using URL / URLSearchParams for query construction
– Improved clipboard reliability, including a fallback for browsers without navigator.clipboard support (e.g. Safari)
– Prevented double-firing of copy actions on touch devices by removing redundant touchend handlers
– Ensured filter hydration runs only once after required data is loaded, avoiding repeated re-application of state
– Added optional URL synchronization as filters change (debounced) so the address bar reflects current selections
– Added back/forward browser navigation support (popstate) to rehydrate filters from the URL
– Updated Reset selection behaviour to clear filters and update the URL consistently
– Fixed disabled state logic on Copy link buttons to reflect only available filters per tool
– Aligned PQEA filtering behaviour with Contractor tool patterns for consistency
– Corrected handling of the show=off query parameter to properly hide filter controls when present

## 0.29.1 January 7, 2026
– Added PDF link check to rebates page reload.
– Single mode rebates tooling updated to:
–– Solve "same setting" refresh bug. 
–– Remove 'other' from type of home select.
–– Restyled active select options.

## 0.29.0 January 6, 2026
– Conditional groups block updated to enable grouped conditions 
– e.g.: (region = south AND rebate_tier = HRR) OR (region = north AND rebate_tier = HRR AND utility ≠ BC Hydro)

## 0.28.3 January 5, 2026
– Set up 'preferredSettings' local storage key for enabling auto-population of upgrade type and rebate program on contractor and pqea tools.

## 0.28.2 January 2, 2026
– Basic styles update with new icons.
– Rebates subtitle show/hide feature.
– Rerun a rebate tool specific external link check after is-dirty.

## 0.28.1 December 24, 2025
– Contractor tool refactoring for vNext functionality
– Filtering typography updates + styles

## 0.28.0 December 23, 2025
– PQEA tooling updated to use text based search filtering for company name and location.
– Full refactoring of PQEA tool to match contractors.

## 0.27.1 December 18, 2025
– Icon style update.

## 0.27.0 December 18, 2025
– Extensive refactor of the contractor filter tool to enable location text input filter with mobile support.
– Added mobile proxy of datalist to keep the device from being overloaded when filtering. 
– Streamlined contractor input handling and removed debounce.
– Modified colour style.

## 0.26.5 December 16, 2025
– Added text based search filtering to contractor service region filtering to better match archive rebates tooling.
– Mobile debouncing of location filtering.
– Updated search placement style + template.
– Adjusted tool design to match rebate in-page headline.
– Mobile table headings adjusted.

## 0.26.4 December 16, 2025
– Removed pagination default for "load more" button feature and disabled progressive loading.
– Modified contractors tool load more interface.
– Added focus state to find the first focusable link in the newly-added rows and focus it for accessibility.
– Modified "Rebates program(s)" column to output only the selected program if set + styling.
– Updated head office location information with icon.

## 0.26.3 December 15, 2025
– Contractor tool filtering by company name + layout adjustments to combine details.
– Progressive loading option.

## 0.26.2 December 12, 2025
– Rebate page styling.

## 0.26.2 December 10, 2025
– Added in-page no results message for visual editing.
– Reinforced and updated the ineligble guards for various cases outlined in the content ready for review documents.

## 0.26.1 December 8-9, 2025
– Questionnaire (archive mode) updates for filtering the results against differing heating types.
– Removed scroll transition select disabling for better user interaction.
– Better error handling support.
– Archive mode page visual hierarchy layout styles updated.
– Changed Guard 0 for HPWH & MURB.

## 0.26.0 December 4, 2025
– Questionnaire modifications for addition questions, style changes to sequence numbering, and related icon handling, as well as error states for questions with 'other' options (and related disabled questions), including sorting for 'other' to bottom of the select options.
– Eligible home types details injection into 'building' field for visual editing of content.
– Set Vite output chunkSizeWarningLimit to 600kB.

## 0.25.13 November 27, 2025
– Search results modified output for rebates split title.
– Modified search results to use excerpt ahead of filtered content if available.
– Search output style adjustment.

## 0.25.12 November 25, 2025
– Revamped filteredResults guards and espTier income level logic.

## 0.25.11 November 24, 2025
– Revised filtered Results return for adaptive results.
– Added guard for BC Hydro + MURB + HRR.

## 0.25.10 November 21, 2025
– Rebate change effect updates. Fixed archive mode update effect collision.
– Testing/logging archive mode settings and output.

## 0.25.9 November 20, 2025
– Added definitions handling post rebate refresh.
– Testing rebate blur on change effect.
– Icon updates.

## 0.25.8 November 19, 2025
– New homepage and layout styles.
– New rebates pages and layout styles.
– Added contact icons for rebates.

## 0.25.7 November 18, 2025
– Pattern development for vNext specific designs. Added "How it works" styling.
– Minor style adjustments for mobile.

## 0.25.6 November 14, 2025
– Bootstrap guard manages initial mounted watch to ensure proper content initialisation.

## 0.25.5 November 13, 2025
– Single mode tool warning update.
– Added 'no-show' condition to rebates to hide from archive mode search tool results.

## 0.25.4 November 12, 2025
– Table pattern development. Scripts and styles to drive visual as well as accessibility.
– Updated 'ESP tier' to 'Rebate tier' and output HRR as value.
– Added 'One of' and 'None of' evaluation rules to Conditional Query Group logic checks to allow for comma separated list of options against a query single key.
– Removed rental error state and added keyboard accessibility interactions for single mode tool.

## 0.25.2 November 7, 2025
– Added gas provider option to rebates tooling.
– Added collapse capability to rebates single mode.

## 0.18.4 Nov 4, 2025 (changes made to main)
- [DESCW-3206 bcgov-plugin-cleanbc dependabot fixes](https://citz-gdx.atlassian.net/browse/DESCW-3206)
- Update Dev Dependencies to Resolve most warnings found by 'npm audit'
- Update composer.json reference to satis
- rebuild for production
- tested that build works without error
- tested that tests (vite test) runs without error

## 0.25.1 October 31, 2025
– State management for results list/grid views. Added enter key handling for toggling checkbox mechanism.

## 0.25.0 October 29, 2025
– Added grid and list layout for results display.

## 0.24.5 October 28, 2025
– Unifying select field form display across browser variants.

## 0.24.4 October 17, 2025
– No results card and details.

## 0.24.3 October 16, 2025
– Updated filtering results to include "available rebates" taxonomy + added murb/god meta check.
– Sorted filteredResults by rebate_type_headline_card from API.
– HRR fallback for archive results (query string TBD)
– Heat pump info card tied to relevant rebates.

## 0.24.2 October 15, 2025
– Results cards styling updates with accessible labeling of icons.
– Results messaging content and styling.

## 0.24.1 October 14, 2025
– Updated rebate taxonomy to include "applicable rebates" meta details for better search filtering/management.
– Updated rebates v2 API for better results handling.
– Various archive mode results styling changes.

## 0.24.0 October 10, 2025
– Modified Multy-Query Content block to better handle operations. Added various pattern matching options: contains, starts with, etc.

## 0.23.1 October 9, 2025
– Single mode updates for ensuring the heating type cannot be mismanaged or faked for specific rebate pages of that type.

## 0.23.0 October 8, 2025
– Initial results output: tests against esp tier, heating type, utility provider and region. Additional checks to come.
– Rebates custom/v2 API output modified to match newer taxonomies/meta.
– Initial card design and additional ACF fields for rebates card descriptions.

## 0.22.3 October 8, 2025
– iOS and input list icon fixes.
– Input field invalid check fix.
– General styling updates. Typo fix.

## 0.22.2 October 7, 2025
– Modified archive mode to use input + datalist for locations.
– Related change handling and styling updates.
– Improved mobile input handling.

## 0.22.1 October 2, 2025
– Archive mode styling and error handling to add design and realtime feedback + gamification of answering questions.
– Mobile and scroll position handling.
– Augments the scroll positioning to keep previous question in sight.
– iOS select focus fix.

## 0.22.0 October 2, 2025
– Scaffolded aggregation "archive mode" form and structure to match single mode output without edit mode.
– Added modal defintions for popover links on filter form labels.
– Additional form styling.

## 0.21.7 September 29, 2025
– Added heating types to taxonomies for rebates.
– Updated single mode filter to include heating types, reordered and updated logic to accomodate.
– Updated rebates v2 API for heating type incusion in settings.

## 0.21.6 September 26, 2025
– Changed single mode interaction to an edit mode.
– Filter tool styling changes.

## 0.21.5 September 25, 2025
– Minor single mode style adjustments.
– Adjusted template to match in-page wireframe positioning.

## 0.21.4 September 24, 2025
– Better descriptions, ARIA and accessibility updates for single mode settings.
– Minor styling updates.
– Added better labels on settings with show/hide persisent state feature.

## 0.21.3 September 23, 2025
– Added single mode filtering captions.
– Single mode re-renders side scrolling menu if available.

## 0.21.2 September 17, 2025
– Added ajax loading and replacement of in-page server side rendered content.
– Fixed dirty state when messing with URL manually.

## 0.21.1 September 16, 2025
– Update startup logic for single mode to account for page initialisation from localStorage and force reload if persistent state information available.

## 0.21.0 September 16, 2025
– Large update to add Rebates vNext Vue-based filter tool block for querystring-based variability management. Utilises localStorage for persistence and enables filtering of multi-query and query conditional block output.
– v2 rebates API endpoint to work with vNext Rebate Filter Tool.

## 0.20.2 August 8, 2025
– Query Filter Block and Multi Query Content block improvements.

## 0.20.1 August 8, 2025
– Query Filter Block for updating query string parameters. Inital pass for testing purposes.

## 0.20.0 August 5, 2025
– Query Conditional Group custom block added support for conditionally displaying block content based on query string parameters. Rules can be configured with multiple operators (e.g., equals, contains, regex), logic types (AND/OR), and optional case sensitivity. Server-side and client-side evaluation is supported, with secure handling of request data via nonce verification.
- Updated PQEA API filter callback to return data from new post types ('pqeas-renovation' and 'pqeas-construction') using a unified ACF field structure. The response now includes normalized taxonomy data for locations and services, and adds a 'service_organizations' array within 'details' for linked organizations (with IDs, titles, websites, and permalinks). Maintains parity with the previous API structure while extending data coverage.

## 0.19.2 June 10, 2025
– Multi-Query Content block query string parameter passthrough as value options. Augmented preview and help information. Bolstered placeholder and fallback display.

## 0.19.1 June 6, 2025
– Multi-Query Content block styling options added.

## 0.19.0 June 5, 2025
– Added Multi-Query Content block for query string lookup table content insertion.
– Removed v1 block render the Sections for the Rebates pages.

## 0.18.4 June 2, 2025
– Improvements to PDF proxy.
– Added 'hide-from-sr' class to enable aria-hidden=''true' to be added to elements.
– Updated CleanBC drivers query loop category image link handling to point to custom API for Actions.
– Modified breadcrumb navigation to meet AGP pattern: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/.

## 0.18.3 May 22, 2025
– Adding radio group interactions (keyboard support, roles and attributes) per AGP radio group: https://www.w3.org/WAI/ARIA/apg/patterns/radio/ for better accessibility in CleanBC filter mechanism.

## 0.18.2 May 21, 2025
– Adding grid/gridcell interactions (keyboard support, roles and attributes) per AGP layout grid: https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/layout-grids/ for better accessibility in CleanBC filter mechanism.

## 0.18.1 May 20, 2025
– Additional scroll padding check in plugin when DOM loaded.
– More screen reader accessibility updates to Actions filter tool.

## 0.18.0 May 16, 2025
– Modified the CleanBC Actions tool to use a custom API endpoint.
– Improved Actions card layout to accomodate new API structure and augment layout for screen reader readback.
- Minor style adjustments for Actions tag checkboxes.

## 0.17.3 May 15, 2025
– Add a check for PDF label injection inside Vue-based Better Homes/Buildings FAQs and CleanBC Actions.
– Updated styles to remove external icons if injected as well as PDF icon.

## 0.17.2 May 14, 2025
– Added GET check as fallback for PDF check as HEAD can be unreliable. Some servers (like IIS, older .NET apps) serve PDF content at non-.pdf URLs — like .ashx, .php, or extensionless URLs — while returning a valid PDF in the response. This attempts to resolve this issue.
– Fixes PDF tag exclusion by adding typical brackets to the matching for PDF, MB and KB.

## 0.17.1 May 13, 2025
– Augmented PDF link feature to insert PDF specific SVG into links including externally processed.
– Added 'pdf' in title or class name checks on links to pass to proxy to allow redirect checking.
– Added following HTTP 301/302 redirects (up to a limit) for URLs passed into the proxy.

## 0.17.0 May 9, 2025
– Automated PDF link label augmentation with type and size identifiers.
– PDF link PDF size proxy request to avoid CORS issues with third party PDF linking.

## 0.16.2 May 2, 2025
– Enhanced accessibility and mobile table display, works with styles/public/tables.scss styles. 
– Adds ARIA roles to all table elements. 
– Copies the original cell content ('innerHTML') and 'data-label' into visually hidden cells. 
– Adds 'aria-hidden="true"' to hidden cells to improve screen reader behavior.

## 0.16.1 May 2, 2025
– Added accessibility features for visual rebates content: ARIA labels to inline contact links and stripping legacy links targeting new tab/windows.
- Modified the register_custom_rebates_page_pattern to inlude the latest layout.

## 0.16.0 April 2, 2025
- Registered Better Homes Rebates page default layout pattern option for new Rebates pages.
- Added complex table spanning through class pattern. eg: 'col-1-span-2', 'row-4-col-2-span-3', 'cell-2-3-span-2x3'

## 0.15.5 March 26, 2025
– Updated rebates API to skip published rebates/incentives if they include an exclusion conditional.

## 0.15.4 March 25, 2025
– Accessibility update for back to top. Allows assitive technology to pass the focus to the body when activated.
– Fixed CleanBC accessibility site custom body class check for logo ALT.

## 0.15.3 March 25, 2025
– Site specific accessibility DOM updates scripts – alters header logo ALT attributes.
- Accessibility remediation, includes: breadcrumb navigation pattern improvements, grid pattern setup on "detailsWithNumbersContainers".

## 0.15.2 March 18, 2025
– Removed duplicate for loop in rebates/incentives results table.

## 0.15.1 March 17, 2025
- Fixed undefined filterName issue.

## 0.15.0 March 17, 2025
- Preliminary integration of Snowplow analytics event tracking in Rebates tool.
- Tracks Rebates/Incentives button clicks, filter type/region/system changes and upgrade type selection/deselection.
- Initial pass at FAQ and Providers tracking utilising non-existent schemas.

## 0.14.7 March 5, 2025
- Added null check on search components.
- Removed unnecessary console logging.
- Modified active state on tool selects to adjust font weight.

## 0.14.6 March 2, 2025
- Fixed mouse related loss of focus interaction issue with search bar.

## 0.14.5 February 27, 2025
- Safari quota handling added a fall back to localStorage on quota errors.

## 0.14.4 February 20, 2025
– Revised sessionStorage and fetch of custom API data for Better Homes/Buildings tools.
– Removed additiona filters count from Rebates side menu title to reduce confusion.

## 0.14.3 February 18, 2025
– Modified ARIA roles and settings to facilitate better Screen Reader.

## 0.14.2 February 14, 2025
- Added APG Menubar Pattern support to navigation menu.
– Rmoeved top level 'enter' handling.

## 0.14.1 February 11, 2025
- Added escape key handling to the navigation control.

## 0.14.0 February 11, 2025
- Added WordPress 6.5+ keyboard navigation overrides for dropdown menus.

## 0.13.1 February 7, 2025
- Fixed PHP notice "Trying to get property 'post_content' of non-object" on search results page.

## 0.13.0 February 6, 2025
- Added search excerpt filtering to remove incentive side menu navigation based on class names.
- Fixed screen reader output for vehicle rebates total to account for active/inactive Federal rebates.
- Removed external link icon from vehicle results in screen reader rotor/link lists.
- Added corrected ARIA live announcements to the "Find a vehicle (showing x of y)" details that are updated with activation of filter options.
– Modified slider controls to better announce live region changes politely, with vehicle count being more assertive.
– Vehicle items now behave as layout grid elements for screen readers per the APG (https://www.w3.org/WAI/ARIA/apg/patterns/grid/).

## 0.12.9 January 21, 2025
- Modified vehicle sorting algorithm to use direct subtraction rather than ternary operations.
- Check the selection exists in sortFunctions before attempting to sort to avoid invalid selection.

## 0.12.8 January 20, 2025
- QA testing: disabled GoEV sort filtering buttons when selected (removed for time being).
- Disabled span wrapping of SVG on vue-card-content.

## 0.12.7 January 17, 2025
- Contractor/PQEA table style updates to add sticky thead row.

## 0.12.6 January 17, 2025
- Go Electric vehicle filter option settings to remove federal rebate information from output.
- The vehicle type key dynamically reflects the available results hiding EV Types not in the current list.
- New classes and data attributes are implemented without breaking existing styles.
- Minor style updates for improved responsive output.

## 0.12.5 January 15, 2025
- Improved FAQ pagination display to hide controls when pagination is not needed.

## 0.12.4 January 10, 2025
- Font size adjustments to better work with site settings.
- Minor adjustment to incentives template pattern.

## 0.12.3 January 9, 2025
- Added Search escape suppression for keyboard accessibility.
- Added a mutation observer to handle link wrapping of external icons injected by the Block Theme.
- Modified styles to accomodate nowrap/no-wrap classing outside of the definitions links 'last-word' span.
- Incentives layout adjuments for BetterBuildings.
- Removed external link icons from mailto and tel links. Excluded last-word span maipulation from such links.

## 0.12.2 January 8, 2025
- Revising link styles across the sites.
- Added element wrappers to keep definitions links from wrapping end-of-line icons to next line on their own.
- Removed currentColor variable where the color value is not excepted.

## 0.12.1 January 7, 2025
- Added invisible html entity as breakpoints for email address as labels when output in filtering tables for PQEAs and Contractors.
- Tweaked focus and hover style for links in filtered tables.
- Modified base WP font sizing options.

## 0.12.0 December 20, 2024
- Modified Contractor and PQEA tool to allow for hiding controls in WordPress admin settings.
- Improved pagination display to work with controls when hidden or when pagination is not needed.

## 0.11.1 December 18, 2024
- Side navigation scroll generator scrupts and styles updated to work with Better Buildings/Homes functional styling conflict.
- Updated Single Incentive page pattern.
- Added admin and visitor facing patterns.scss for admin editor pattern styling.
- Disabled sourcemap generation in Vite config.
- Refactored styles structure to merge Better Homes and Better Building SCSS into BHBB combination.

## 0.11.0 December 13, 2024
- Incentives/rebates new page "choose a pattern" option for multi-column Single incentives page starter layout. Pattern template included in 'register_custom_incentive_page_pattern' function in Hooks/BasicBlocks.php.
- Added in-page side scrolling menu generation for incentives layout pattern based on headlines used in content.
- Cleaned up unscoped or undefined body styles and resolved sticky side menu bug.

## 0.10.0 December 11, 2024
- Fixed search results marking header link href and ARIA labels bug.
- Refactored various javascript to use es6 arrow functions and expand on JSDoc comments.

## 0.9.3 December 10, 2024
- Modified default PQEA choice to "Renovating a home".

## 0.9.2 December 6, 2024
- Removed custom qs (querySelector) /qsa (querySelectorAll) / addSafeEventListenerPlugin (addEventListener) wrapper methods.
- Passes the function reference for all DOMContentLoaded event listeners rather than invoking.
- Scoped Go Electric styles to body.custom-goelectricbc.

## 0.9.1 December 6, 2024
- Refined CSS by site. Cleaned up SCSS variables and removed mixins.
- Additional style updates.

## 0.9.0 December 6, 2024
- Added definitions post glossary query loop (.glossary-results) aggregation processing to add separation headlines by letter of the alphabet.
- Updated site styles to accomodate general styling for Better Homes and Better Buildings.
- Modified search highlighting.

## 0.8.2 December 5, 2024
- Add custom post types to search context based on site domain.
- Highlight search result page matches with mark tags.

## 0.8.1 December 2, 2024
- Re-initialize the definitions links after using the Category filtering on CleanBC Actons Vue tool.

## 0.8.0 December 1, 2024
- Added isolation of Vue component initialization.

## 0.7.2 November 28, 2024
- Added Rebates query string ability to instantiate the tool based on preset values with copy link.
- Update includes all relevant features from other tools eg: hide/show lower pagination, assemble URLs, clipboard copy, etc.
- Added Rebates pagination to bottom of results table with scroll to top of results button.
- Auto-expand Filter by upgrade accordion is any options are pre-selected.
- Added HTML decoding guard to rebate title display.
- Fixed comma bug in link Upgrade filters list options by parsing quoted values.

## 0.7.1 November 27, 2024
- Added text filtering to FAQ link generation and if a single result is show, auto expands the FAQ result.
- Suppress the lower pagination on single page results for FAQs.
- Disabled Copy Link on PQEAs until lregion/location is selected.
- Added user feedback interaction to Copy Link buttons.

## 0.7.0 November 26, 2024
- Added watchEffect in Contractors, PQEAs and FAQs tools to look for query string values able to instantiate the tools based on preset values.
- Also includes the ability to hide tools based on the '&show=off' query string addition.
- Added the ability to assemble and copy a link to the clipboard with the specific filter values.
- Added scaffolding to sort an array of objects asc or desc based on a specified property.
- Style updates: added light site link icon variant and general copy-link style for buttons.

## 0.6.3 November 25, 2024
- Removed redundant functions in Contractor and PQEA SFC causing an error on CleanBC.
- Fixed a scoping issue with FireFox causing a definitions error on CleanBC when using the keyboard to open the modal.
- Added HTML decoding to FAQ titles, Contractor and PQEA names with a shared decodeHtmlEntities function.
- Fixed an ARIA label issue on Contractors company name.

## 0.6.2 November 24, 2024
- Added FAQ, Contractor and PQEA pagination to bottom of results table with scroll to top of results button.
- Created a 'shared functions' import script to add DRY functionality across Vue-based apps.

## 0.6.1 November 23, 2024
- Modified Contractor and PQEA output to randomise results when applications are refiltered or reloaded (but not paginated).
- Added BH additional styles wrapping with body.betterhomesbc.

## 0.6.0 November 21, 2024
- Added GitHub Actions linting and testing workflows.
- Added and removed composer dependencies to fscilitate github.com deployment.
- Added various node dependencies and support packages
- Moved Vite based script test to "Vite-test", added jest config to exclude Vite specific tests.

## 0.5.1 November 13, 2024
- Modified Vehicle filter app to include year mechanism and bolstered ARIA for accessibility including live readback and sort button state.

## 0.5.0 May 13, 2024
- Rebates and FAQs app bugfixing.
- Improved keyboard nav for PQEA/Contractor/Rebates/FAQ Vue apps.
- FAQs app functionality.
- Refactored styles to /styles/betterhomes/_vue-apps.scss.
- Code clean up and improved documentation.
- Rebates block partials.
- Accessibility improvements for Rebates app filters.
- PQEAs, Rebates, and Contractors Vue apps, fixed sessionStorage purge, style clean-up and reorg.
- Rebates app: updated filtering logic and display for Offers and Types.
- Rebates app: improved UX, term counts, updated filtering logic.
- Rebates: added Vue app for Rebate Search Tool.
- Contractors filter block: API endpoint and VueJS block.
- Rebates page block to show the content sections.
- PQEA filter block CSS animations for pagination & results.
- PQEA filter block accessibility feature refinement.
- PQEA filter block and output ready for inclusion on beta site. Added script module fix for Vite/Vue. ([CLEANBC-189](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-189))
- Added scaffolding for PQEA filter block.

## 0.4.0 February 16, 2024
- Vite builder and composer/wp-scripts living in harmony – codebase now lints using the code standards eg: 'composer production' now works as required. ([CLEANBC-189](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-189))

## 0.3.1 February 15, 2024
- Updated definition link to enable session caching of content. ([CLEANBC-173](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-173))

## 0.3.0 February 12, 2024
- Auto-generated dialog for definitions custom post type allows for links that include the path 'definitions' to generate an accessible dialog with the content of the CPT. Modifies the display of the link to include icon. Also added link/dialog handling to the Vue posts filter mechanism. ([CLEANBC-173](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-173))

## 0.2.5 January 23, 2024
- Fixed rebate output to align with API output. ([CLEANBC-153](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-153))

## 0.2.4 January 15, 2024
- Migrated patched css from customizer to plugin ([CLEANBC-153](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-153))
- Added design related update to Go Electric vehicle filter output. Fixed undefined value on plugin directory variable coming from WordPress using computed property.
- Fixed php notice for uninitialized string offset in vehicles custom API
- Added Federal rebate pending option to vehicle fields and API output. Modified the Vue interface to show alternative rebate pending option and combined rebate calculation.
- Fixed the "Show External Link Icons" setting inside BCGov Block Theme settings not working with previous plugin update. Updated front end scripts to utilise unique arrow function naming and window.requestAnimationFrame execution – removing previous setTimeout 0 – to modify the DOM and align with the browser's rendering cycle. ([CLEANBC-154](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-154))
- Includes a new addSafeEventListener utility function update and related tests used to fix external links icon issues and fixes outstanding body and navigation padding issues.

## 0.2.3 December 28, 2023
- Added coding standards to the plugin including npm scripts for linting and better build management. Includes fix for Vue initialisation and event listener not a function issue. Uses domain reference for previous fetching of filterable cards. ([DESCW-1862](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1862))

## 0.2.2 December 23, 2023
- Initialises category icons for cards on Drivers pages utilising Query Loops. Adds cached fetch to generate ability to match display of filterable action cards. ([CLEANBC-144](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-144))

## 0.2.1 November 23, 2023
- Add external link icons back to action cards ([CLEANBC-128](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-128))
- Bug fix: category icon referencing in actions filter. Was incorrectly pulling by inferred association. ([CLEANBC-129](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-129))

## 0.2.0 November 23, 2023
- Minor edits and alterations to card visuals. Added scroll to filter buttons when clearing the filter. ([CLEANBC-112](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-112))
- BC Government Actions filtering for CleanBC. Added new icons and layout based on designs, and uses icons instead of tags in cards. Auto fills the number of actions that fall under each action filter. Allow for ability to select filters with a radio select. Enables hash in URL to enable filtered category at page load. ([CLEANBC-112](https://apps.nrs.gov.bc.ca/int/jira/browse/CLEANBC-112))

## 0.1.1 September 25, 2023
- General styles and improved vehicle price range filtering. ([DESCW-1479](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1479))

## 0.1.0 September 19, 2023
- Mobile and other various style updates ([DESCW-1479](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1479))
- Custom pattern style updates for Go Electric. ([DESCW-1479](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1479))
- General style updates for Go Electric theming. Bootstrap 4 display properties moved to theme scope. ([DESCW-1479](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1479))
- Refactoring to incorporate the Go Electric styles and Vehicle filtering app. Adjusts the header display in conjunction with FSE updates. Various WordPress hooks to drive custom API and plugin specific blocks. ([DESCW-1477](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1477))
- Modified filtering price range. Fixed Vue 3 handling of no results display. ([DESCW-1477](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1477))
- Added 'cleanbc' custom body class to sites using plugin. Fixed scope issue in search toggle. ([DESCW-1477](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1477))
- Fixed secondary navigation offscreen offset. ([DESCW-1477](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1477))

## 0.0.7 August 23, 2023
- Modification of search results to omit custom post types (actions) and tags the search result with the post type ([DESCW-1391](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1391))
- added style support for notification banners and search bar interactions ([DESCW-1391](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1391))

## 0.0.6 August 22, 2023
- added search toggle icon and search field logic to expose the WordPress search capability ([DESCW-1391](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1391))
- Accessibility update to manage focus state of search field visibility ([DESCW-1391](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1391))

## 0.0.5 August 18, 2023
- fixed the highlighting state of menu items using :has() – fallback for unsupported browsers provided

## 0.0.4 August 17, 2023
- fixed the svg clip path injection to work with refactored output
- sweeping changes to header and menu system ([DESCW-1390](https://apps.itsm.gov.bc.ca/jira/browse/DESCW-1390))

## 0.0.2 July 27, 2023
- refactored plugin to OOP with PHP class loader
- modified the Vue component to check for the site domain exposed by the Block Theme as part of data fetch
- separated Vue and general scripts/styles into their own hook class files
- minor logging and styles cleanup

## 0.0.1 July 25, 2023
- Large update for "CleanBC Post Filter" block (added to Theme category in block inserter) includes:
- funcitonal post, page or custom post type filtering
- allows editorial selection of display parameters such as number of columns, post type, heading size in results set, enabling a heading link back to content, choosing whether the content is pulled from the rendered content or excerpt.
- block insertion in editor uses a placeholder that updates to show critical information without the need to focus and inspect
- tightly styled filter button and card results
- filters allow multi-select on available categories using AND logic
- works around WordPress v2 hard limits for 100 results by calling fetch recursively with an offset
- and more...

## 0.0.0 July 20, 2023
– Added CleanBC theme.json
– Initial Plugin Structure
