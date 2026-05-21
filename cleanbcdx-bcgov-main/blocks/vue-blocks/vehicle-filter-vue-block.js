// const { registerBlockType } = wp.blocks;
// const { createElement, Fragment } = wp.element;
// const { InspectorControls } = wp.blockEditor;
// const { PanelBody, TextControl, __experimentalNumberControl, SelectControl, ToggleControl, FontSizePicker } = wp.components;

/**
 * A custom WordPress block editor component for the CleanBC Post Filter block.
 *
 * @class VehicleFilterVueAppEditorComponent
 * @extends {wp.element.Component}
 */
class VehicleFilterVueAppEditorComponent extends wp.element.Component {

    /**
   * Constructor for the VehicleFilterVueAppEditorComponent class.
   * Initializes the component and sets the initial state.
   *
   * @constructor
   */
    constructor() {
        super(...arguments);

        this.state = {
            postTypes: [],
        };
    }

    /**
     * Lifecycle method called after the component is mounted.
     * Initializes the Vue app and fetches the available post types.
     *
     * @memberof VehicleFilterVueAppEditorComponent
     * @method componentDidMount
     * @returns {void}
     */
    componentDidMount() {
        this.initVueApp();
        this.fetchPostTypes();
    }

    /**
     * Lifecycle method called after the component is updated.
     * Re-initializes the Vue app if any attributes are updated.
     *
     * @memberof VehicleFilterVueAppEditorComponent
     * @method componentDidUpdate
     * @param {Object} prevProps - Previous props of the component.
     * @returns {void}
     */
    componentDidUpdate(prevProps) {
        if (prevProps.attributes !== this.props.attributes) {
            this.initVueApp();
        }
    }

    /**
     * Fetches the available post types from the WordPress REST API.
     * Filters out the blocked post types and updates the component state.
     *
     * @memberof VehicleFilterVueAppEditorComponent
     * @async
     * @method fetchPostTypes
     * @returns {void}
     */
    async fetchPostTypes() {
        try {
            const postTypes = await wp.apiFetch({ path: '/wp/v2/types' });

            // Add post types you want to exclude here
            const blockedPostTypes = ['attachment', 'revision', 'nav_menu_item', 'wp_block', 'wp_navigation', 'wp_template', 'wp_template_part', 'custom-pattern'];

            // Filter out the blocked post types and retrieve the label and slug for each post type
            const filteredPostTypes = Object.keys(postTypes)
                .filter((type) => !blockedPostTypes.includes(type))
                .map((type) => {
                    const postType = postTypes[type];
                    const label = postType.name ? postType.name : postType.rest_base;
                    return {
                        label,
                        value: postType.rest_base,
                    };
                });

            this.setState({ postTypes: filteredPostTypes });
        } catch (error) {
            console.error('Error fetching post types:', error);
        }
    }

      /**
     * Initializes the Vue app assuming 'initVueApp' is a function in the Vue JavaScript that starts the Vue app.
     *
     * @memberof VehicleFilterVueAppEditorComponent
     * @method initVueApp
     * @returns {void}
     */
    initVueApp() {
        // Assuming 'initVueApp' is a function in your Vue JavaScript that starts the Vue app
        // window.initVueApp('#vehicleFilterApp');
    }

    /**
     * Renders the component JSX.
     *
     * @memberof VehicleFilterVueAppEditorComponent
     * @method render
     * @returns {JSX.Element} The JSX element representing the VehicleFilterVueAppEditorComponent.
     */
    render() {
        // todo: make this into jsx and introduce build process for the block
        const { className, hideFederalRebate = false } = this.props.attributes;
        const { setAttributes } = this.props;


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
                        checked: !!hideFederalRebate,  // Double negation ensures it's always a boolean
                        onChange: (value) => setAttributes({ hideFederalRebate: value }),
                        help: hideFederalRebate ? 'Federal rebate is enabled.' : 'Federal rebate is disabled.',
                    })
                )
            ),
            createElement('div', {
                id: 'vehicleFilterApp',
                className: className,
            }, [
                createElement('span', { key: 'text-1' }, `Vehicle Filter Block Placeholder ( =`),
                createElement('span', { key: 'icon', className: 'dashicon dashicons dashicons-car' }),
                createElement('span', { key: 'text-2' }, ` vroom vroom )`),
            ])
            
        );
    }
}

/**
 * Registers a custom WordPress block type.
 *
 * @function registerBlockType
 * @param {string} name - The unique name for the block, including the namespace.
 * @param {Object} settings - The block settings and attributes.
 * @param {string} settings.title - The title of the block displayed in the block editor.
 * @param {string} settings.icon - The icon representing the block in the block editor interface.
 * @param {string} settings.category - The category under which the block will be displayed in the block editor.
 * @param {Object} settings.attributes - The attributes and their default values for the block.
 * @param {Object} settings.edit - The component used to render the block in the editor.
 * @param {Function} settings.save - Set to null – uses register_block_type in PHP to render block.
 * @returns {void}
 */
registerBlockType('cleanbc-plugin/vehicle-filter-block', {
    title: 'Go Electric Vehicle Filter',
    description: `Use only one Vehicle Filter block per page. It is highly recommended to set this block's parent content width to the 'Wide' alignment setting.`,
    icon: 'car',
    category: 'plugin',
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
    edit: VehicleFilterVueAppEditorComponent,
    save: () => null,
});
