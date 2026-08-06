(function (window) {
    const registerBlockType = window.wp?.blocks?.registerBlockType;
    const createElement = window.wp?.element?.createElement;

    if (!registerBlockType || !createElement) {
        return;
    }

    const approvedSellersBlockSettings = {
        title: 'Approved Sellers',
        description:
            'Displays a sortable and filterable table of approved sellers from the approved sellers feed.',
        icon: 'table-col-after',
        category: 'cleanbcdx-dx-plugins',
        attributes: {
            className: {
                type: 'string',
                default: '',
            },
        },
        edit: (props) =>
            createElement(
                'div',
                { className: props.attributes.className },
                createElement('strong', null, 'Approved Sellers'),
                createElement(
                    'p',
                    null,
                    'The sortable approved sellers table is rendered on the frontend from the approved sellers feed.'
                )
            ),
        save: () => null,
    };

    registerBlockType(
        'cleanbcdx-plugin/approved-sellers-block',
        approvedSellersBlockSettings
    );

    registerBlockType('cleanbc-plugin/approved-sellers-block', {
        ...approvedSellersBlockSettings,
        supports: {
            inserter: false,
        },
    });
})(window);
