// const { registerBlockType } = wp.blocks;
// const { createElement, Fragment } = wp.element;
// const { InspectorControls } = wp.blockEditor;
// const { PanelBody, TextControl, __experimentalNumberControl, SelectControl, ToggleControl, FontSizePicker } = wp.components;

/**
 * A custom WordPress block editor component for the CleanBC Post Filter block.
 *
 * @class BetterHomesRebateVueAppEditorComponent
 * @extends {wp.element.Component}
 */
class BetterHomesRebateVueAppEditorComponent extends wp.element.Component {

    /**
   * Constructor for the BetterHomesRebateVueAppEditorComponent class.
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
     * @memberof BetterHomesRebateVueAppEditorComponent
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
     * @memberof BetterHomesRebateVueAppEditorComponent
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
     * @memberof BetterHomesRebateVueAppEditorComponent
     * @async
     * @method fetchPostTypes
     * @returns {void}
     */
    async fetchPostTypes() {
        try {
            const postTypes = await wp.apiFetch({ path: '/wp/v2/types' });

            // Add post types you want to include here
            const allowedPostTypes = ['rebates'];

            // Filter out the blocked post types and retrieve the label and slug for each post type
            const filteredPostTypes = Object.keys(postTypes)
                .filter((type) => allowedPostTypes.includes(type))
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
     * @memberof BetterHomesRebateVueAppEditorComponent
     * @method initVueApp
     * @returns {void}
     */
    initVueApp() {
        // Assuming 'initVueApp' is a function in your Vue JavaScript that starts the Vue app
        // window.initVueApp('#rebateFilterApp');
    }

    /**
     * Renders the component JSX.
     *
     * @memberof BetterHomesRebateVueAppEditorComponent
     * @method render
     * @returns {JSX.Element} The JSX element representing the BetterHomesRebateVueAppEditorComponent.
     */
    render() {
        // todo: make this into jsx and introduce build process for the block
        const { className } = this.props.attributes;


        return createElement(
            Fragment,
            null,
            createElement(
                InspectorControls,
                null,
            ),
            createElement('div', {
                id: 'rebateFilterApp',
                class: `rebateFilterApp ${className}`,
            }, [
                createElement('span', {
                    class: 'dashicon dashicons dashicons-tag'
                }),
                `Rebate Filter Block Placeholder `
,            ])
            
        );
    }
}

/**
 * Registers a custom WordPress block type for the Rebate Filter.
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
registerBlockType('cleanbc-plugin/betterhomes-rebate-filter-block', {
    title: 'Better Homes Rebate Filter',
    description: `Use only once per page. It is highly recommended to set this block's parent content width to the 'Wide' alignment setting.`,
    icon: 'tag',
    category: 'plugin',
    attributes: {
        className: {
            type: 'string',
            default: '',
        },
    },
    edit: BetterHomesRebateVueAppEditorComponent,
    save: () => null,
});
