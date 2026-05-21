/**
 * General Better Homes DOM manipulation for rebates archive page.
 */
function cleanbcdxBhRebatesArchiveLoader() {
    /*
     * SafarIE iOS requires window.requestAnimationFrame update.
     */
    window.requestAnimationFrame(() => {
        const source_details = document.querySelector(
            'details.eligible-home-types'
        );
        const target_details = document.querySelector(
            'div.eligible-homes-insertion'
        );
        if (source_details && target_details) {
            target_details.replaceChildren(source_details.cloneNode(true));
            target_details.firstElementChild?.classList.remove('template');
        }

        const source_not_eligible = document.querySelector(
            '.wp-block-group.not-eligible-content'
        );
        const target_not_eligible = document.querySelector(
            'div.not-eligible-insertion'
        );
        if (source_not_eligible && target_not_eligible) {
            target_not_eligible.replaceChildren(
                source_not_eligible.cloneNode(true)
            );
            target_not_eligible.firstElementChild?.classList.remove('template');
        }
    });
}

window.cleanbcdxBhRebatesArchiveLoader = cleanbcdxBhRebatesArchiveLoader;

if ('complete' === document.readyState) {
    cleanbcdxBhRebatesArchiveLoader();
} else {
    document.addEventListener(
        'DOMContentLoaded',
        cleanbcdxBhRebatesArchiveLoader
    );
}
