(function (window) {
    const registerBlockType = window.wp?.blocks?.registerBlockType;
    const createElement = window.wp?.element?.createElement;

    if (!registerBlockType || !createElement) {
        return;
    }

    const eligibleCommercialVehiclesBlockSettings = {
        title: 'Eligible Commercial Vehicles',
        description:
            'Displays a sortable and filterable eligible commercial vehicles table grouped by vehicle class.',
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
                createElement('strong', null, 'Eligible Commercial Vehicles'),
                createElement(
                    'p',
                    null,
                    'The sortable vehicle tables are rendered on the frontend from the eligible vehicles feed.'
                )
            ),
        save: () => null,
    };

    registerBlockType(
        'cleanbcdx-plugin/eligible-commercial-vehicles-block',
        eligibleCommercialVehiclesBlockSettings
    );

    registerBlockType('cleanbc-plugin/eligible-commercial-vehicles-block', {
        ...eligibleCommercialVehiclesBlockSettings,
        supports: {
            inserter: false,
        },
    });
})(window);
