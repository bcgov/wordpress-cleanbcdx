(function (window) {
    const registerBlockType = window.wp?.blocks?.registerBlockType;
    const createElement = window.wp?.element?.createElement;
    const Fragment = window.wp?.element?.Fragment;
    const InspectorControls = window.wp?.blockEditor?.InspectorControls;
    const PanelBody = window.wp?.components?.PanelBody;
    const ToggleControl = window.wp?.components?.ToggleControl;

    if (
        !registerBlockType ||
        !createElement ||
        !Fragment ||
        !InspectorControls ||
        !PanelBody ||
        !ToggleControl
    ) {
        return;
    }

    function VehicleFilterBlockEdit(props) {
        const { attributes, setAttributes } = props;
        const { className = '', hideFederalRebate = false } = attributes;

        return createElement(
            Fragment,
            null,
            createElement(
                InspectorControls,
                null,
                createElement(
                    PanelBody,
                    {
                        title: 'Settings',
                        initialOpen: true,
                    },
                    createElement(ToggleControl, {
                        label: 'Enable Federal Rebate',
                        checked: !!hideFederalRebate,
                        onChange: (value) =>
                            setAttributes({ hideFederalRebate: value }),
                        help: hideFederalRebate
                            ? 'Federal rebate is enabled.'
                            : 'Federal rebate is disabled.',
                    })
                )
            ),
            createElement(
                'div',
                {
                    id: 'vehicleFilterApp',
                    className,
                },
                createElement('strong', null, 'CleanBC DX GE Vehicle Filter'),
                createElement(
                    'p',
                    null,
                    'The vehicle filter app is rendered on the frontend.'
                )
            )
        );
    }

    const vehicleFilterBlockSettings = {
        title: 'CleanBC DX GE Vehicle Filter',
        description:
            "Use only one Vehicle Filter block per page. It is highly recommended to set this block's parent content width to the Wide alignment setting.",
        icon: 'car',
        category: 'cleanbcdx-dx-plugins',
        attributes: {
            className: {
                type: 'string',
                default: '',
            },
            hideFederalRebate: {
                type: 'boolean',
                default: false,
            },
        },
        edit: VehicleFilterBlockEdit,
        save: () => null,
    };

    registerBlockType(
        'cleanbcdx-plugin/vehicle-filter-block',
        vehicleFilterBlockSettings
    );

    registerBlockType('cleanbc-plugin/vehicle-filter-block', {
        ...vehicleFilterBlockSettings,
        supports: {
            inserter: false,
        },
    });
})(window);
