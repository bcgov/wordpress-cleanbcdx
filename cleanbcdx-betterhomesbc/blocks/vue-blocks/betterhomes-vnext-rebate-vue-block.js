(() => {
    const { registerBlockType } = wp.blocks;
    const { createElement, Fragment } = wp.element;
    const { InspectorControls } = wp.blockEditor;
    const { PanelBody, SelectControl } = wp.components;

    class BetterHomesvNextRebateVueAppEditorComponent
        extends wp.element.Component
    {
        constructor() {
            super(...arguments);
            this.state = {
                postTypes: [],
            };
        }

        componentDidMount() {
            this.initVueApp();
            this.fetchPostTypes();
        }

        componentDidUpdate(prevProps) {
            if (prevProps.attributes !== this.props.attributes) {
                this.initVueApp();
            }
        }

        async fetchPostTypes() {
            try {
                const postTypes = await wp.apiFetch({ path: '/wp/v2/types' });
                const allowedPostTypes = ['rebates'];

                const filteredPostTypes = Object.keys(postTypes)
                    .filter((type) => allowedPostTypes.includes(type))
                    .map((type) => {
                        const postType = postTypes[type];
                        const label = postType.name
                            ? postType.name
                            : postType.rest_base;
                        return { label, value: postType.rest_base };
                    });

                this.setState({ postTypes: filteredPostTypes });
            } catch (error) {
                console.error('Error fetching post types:', error);
            }
        }

        initVueApp() {
            // window.initVueApp('#vnextRebateFilterApp');
        }

        render() {
            const { attributes, setAttributes } = this.props;
            const { className, mode } = attributes;

            return createElement(
                Fragment,
                null,
                createElement(
                    InspectorControls,
                    null,
                    createElement(
                        PanelBody,
                        { title: 'Rebate Filter Settings', initialOpen: true },
                        createElement(SelectControl, {
                            label: 'Mode',
                            value: mode,
                            options: [
                                {
                                    label: 'Archive (show results)',
                                    value: 'archive',
                                },
                                {
                                    label: 'Single (do not show results)',
                                    value: 'single',
                                },
                            ],
                            onChange: (newVal) =>
                                setAttributes({ mode: newVal }),
                        })
                    )
                ),
                createElement(
                    'div',
                    {
                        id: 'vnextRebateFilterApp',
                        class: `rebateFilterApp ${className}`,
                        'data-mode': mode, // pass mode into DOM if needed
                    },
                    [
                        createElement('span', {
                            class: 'dashicon dashicons dashicons-tag',
                        }),
                        `CleanBC DX vNext Rebate Filter Block Placeholder (${mode})`,
                    ]
                )
            );
        }
    }

    registerBlockType(
        'cleanbcdx-plugin/betterhomes-vnext-rebate-filter-block',
        {
            title: 'Better Homes vNext Rebate Filter',
            description: `Use only once per page. It is highly recommended to set this block's parent content width to the 'Wide' alignment setting.`,
            icon: 'tag',
            category: 'cleanbcdx-dx-plugins',
            attributes: {
                className: {
                    type: 'string',
                    default: '',
                },
                mode: {
                    type: 'string',
                    default: 'archive', // default mode
                },
            },
            edit: BetterHomesvNextRebateVueAppEditorComponent,
            save: () => null,
        }
    );
})();
