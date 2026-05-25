<?php

namespace Bcgov\Plugin\CleanBCDXGE\Hooks;

/**
 * Sets up VueJS based applications.
 *
 * @since 1.0.1
 *
 * @package Bcgov\Plugin\CleanBCDXGE
 */
class EnableVueApp {

	/**
	 * Register block to load the Vue.js app.
	 */
	public function vuejs_wordpress_block_plugin() {

		$plugin_dir     = plugin_dir_path( __DIR__ );
		$plugin_data    = get_plugin_data( $plugin_dir . 'index.php' );
		$plugin_version = $plugin_data['Version'];
		$latest_version = $plugin_version; // Fallback to the installed version.

		wp_enqueue_script(
			'cleanbcdx-plugin/vehicle-filter-block',
			plugin_dir_url( __DIR__ ) . 'blocks/vue-blocks/vehicle-filter-vue-block.js',
			[ 'wp-blocks', 'wp-element', 'wp-editor' ],
			$latest_version,
			true
		);
	}



	/**
	 * Add/modify the enqueued scripts attributes. From https://stackoverflow.com/a/77863823
	 *   Specifically change the type to 'module' for the Vue includes. Used for Vue/Vite to be loaded as a module and not override the global namespace.
	 *
	 * @param array $attributes The attributes already set when the hook is called.
	 * @return array $attributes The modified attributes
	 */
	public function add_script_type_attribute( $attributes ) {
		$plugin_dir = plugin_dir_path( __DIR__ );
		$assets_dir = $plugin_dir . 'dist/assets/';

		$public_js_files = glob( $assets_dir . 'vue*.js' );

		foreach ( $public_js_files as $file ) {
			if ( isset( $attributes['id'] ) && 'vue-app-' . basename( $file, '.js' ) . '-js' === $attributes['id'] ) {
				$attributes['type'] = 'module';
			}
		}

		return $attributes;
	}

	/**
	 * Load VueJS app assets onto the client.
	 */
	public function vuejs_app_plugin() {
		// Check if the current page contains the block.
		if ( has_block( 'cleanbcdx-plugin/vehicle-filter-block' ) || has_block( 'cleanbc-plugin/vehicle-filter-block' ) ) {
			$plugin_dir = plugin_dir_path( __DIR__ );
			$assets_dir = $plugin_dir . 'dist/assets/';

			$public_css_files = glob( $assets_dir . 'vue*.css' );

			if ( is_admin() ) {
				foreach ( $public_css_files as $file ) {
					$version  = filemtime( $file );
					$file_url = plugins_url( str_replace( $plugin_dir, '', $file ), __DIR__ );
					wp_enqueue_style( 'vue-app-' . basename( $file, '.css' ), $file_url, [], $version );
				}
			}
		}
	}

	/**
	 * Load VueJS app assets when the block is on the page.
	 *
	 * @param array $attributes The block attributes.
	 * @return string The HTML output for the block.
	 */
	public function vuejs_vehicle_filter_app_dynamic_block_plugin( $attributes ) {

		$plugin_dir = plugin_dir_path( __DIR__ );
		$assets_dir = $plugin_dir . 'dist/assets/';

		$plugin_data    = get_plugin_data( $plugin_dir . 'index.php' );
		$plugin_version = $plugin_data['Version'];
		$latest_version = $plugin_version; // Fallback to the installed version.

		$public_css_files = glob( $assets_dir . 'vue*.css' );
		$public_js_files  = glob( $assets_dir . 'vue*.js' );

		foreach ( $public_css_files as $file ) {
			$file_url = plugins_url( str_replace( $plugin_dir, '', $file ), __DIR__ );
			wp_enqueue_style( 'vue-app-' . basename( $file, '.css' ), $file_url, [], $latest_version );
		}

		foreach ( $public_js_files as $file ) {
			$file_url = plugins_url( str_replace( $plugin_dir, '', $file ), __DIR__ );
			wp_enqueue_script( 'vue-app-' . basename( $file, '.js' ), $file_url, [ 'bcgov-block-theme-public' ], $latest_version, true ); // Sets the dependency to Block Theme to enqueue after.
		}

		// Set up the attributes passed to the Vue frontend, with defaults.
		$class_name           = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$hide_federal_rebates = isset( $attributes['hideFederalRebate'] ) && $attributes['hideFederalRebate'] ? 'true' : 'false';

		// Return the Vehicle Filter App's container with appropriate class names.
		return '<div id="vehicleFilterApp" class="' . esc_attr( $class_name ) . '" data-show-federal-rebates="' . esc_attr( $hide_federal_rebates ) . '">Loading...</div>';
	}

	/**
	 * Initialize the VueJS app blocks.
	 */
	public function vuejs_app_block_init_plugin() {
		register_block_type(
			'cleanbcdx-plugin/vehicle-filter-block',
			[
				'render_callback' => [ $this, 'vuejs_vehicle_filter_app_dynamic_block_plugin' ],
			]
		);

		register_block_type(
			'cleanbc-plugin/vehicle-filter-block',
			[
				'render_callback' => [ $this, 'vuejs_vehicle_filter_app_dynamic_block_plugin' ],
			]
		);
	}

	/**
	 * Return ACF fields for vehiclepost content type.
	 *
	 * @return array
	 */
	public function custom_api_vehicle_filter_callback() {
		$args = array(
			'post_type'      => 'vehiclepost',
			'posts_per_page' => -1,
			'post_status'    => 'publish',
		);

		$vehicles   = new \WP_Query( $args );
		$posts_data = array();

		foreach ( $vehicles->posts as $vehicle ) {
			$model_year_terms = get_the_terms( $vehicle->ID, 'model_year' );

			$years = array();

			if ( ! is_wp_error( $model_year_terms ) && ! empty( $model_year_terms ) ) {
				foreach ( $model_year_terms as $term ) {
					$years[] = $term->name;
				}
			}

			$posts_data[] = array(
				'id'                    => $vehicle->ID,
				'make'                  => $vehicle->make,
				'model'                 => $vehicle->model,
				'vehicle_class'         => $vehicle->vehicle_class,
				'minMsrp'               => (int) $vehicle->minMsrp,
				'maxMsrp'               => (int) $vehicle->maxMsrp,
				'rebate_provincial'     => (int) $vehicle->rebate_provincial,
				'rebate_federal'        => (int) $vehicle->rebate_federal,
				'rebate_federal_status' => ! empty( $vehicle->federal_rebate_status ) ? $vehicle->federal_rebate_status[0] : 'processed',
				'rangeElectricKm'       => (int) $vehicle->rangeElectricKm,
				'rangeFullKm'           => (int) $vehicle->rangeFullKm,
				'type'                  => $vehicle->vehicle_type,
				'url'                   => $vehicle->url,
				'image'                 => get_field( 'vehicle_image', $vehicle->ID ),
				'post_url'              => get_permalink( $vehicle->ID ),
				'year'                  => $years,
			);
		}

		wp_reset_postdata();

		return $posts_data;
	}

	/**
	 * Generate the vehicle JSON file if it does not already exist.
	 *
	 * @return void
	 */
	public function maybe_generate_vehicle_filter_json_file() {
		$upload_dir = wp_upload_dir();

		if ( ! empty( $upload_dir['error'] ) ) {
			return;
		}

		$file_path = trailingslashit( $upload_dir['basedir'] ) . 'vehicle-filter-data/vehicles.json';

		if ( ! file_exists( $file_path ) ) {
			$this->generate_vehicle_filter_json_file();
		}
	}

	/**
	 * Generate the vehicle filter JSON file.
	 *
	 * @return int|false Number of bytes written, or false on failure.
	 */
	public function generate_vehicle_filter_json_file() {
		$data = $this->custom_api_vehicle_filter_callback();

		$upload_dir = wp_upload_dir();

		if ( ! empty( $upload_dir['error'] ) ) {
			return false;
		}

		$directory = trailingslashit( $upload_dir['basedir'] ) . 'vehicle-filter-data/';
		$file_path = $directory . 'vehicles.json';

		if ( ! file_exists( $directory ) ) {
			wp_mkdir_p( $directory );
		}

		$json = wp_json_encode(
			$data,
			JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
		);

		if ( false === $json ) {
			return false;
		}

		global $wp_filesystem;

		if ( ! function_exists( 'WP_Filesystem' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}

		WP_Filesystem();

		if ( ! $wp_filesystem ) {
			return false;
		}

		return $wp_filesystem->put_contents(
			$file_path,
			$json,
			FS_CHMOD_FILE
		);
	}

	/**
	 * Get the public URL for the vehicle filter JSON file.
	 *
	 * @return string
	 */
	public function get_vehicle_filter_json_file_url() {
		$upload_dir = wp_upload_dir();

		return trailingslashit( $upload_dir['baseurl'] ) . 'vehicle-filter-data/vehicles.json';
	}

	/**
	 * Regenerate the vehicle JSON file after ACF saves a vehicle post.
	 *
	 * @param int|string $post_id The saved object ID.
	 * @return void
	 */
	public function regenerate_vehicle_filter_json_on_acf_save( $post_id ) {
		if ( ! is_numeric( $post_id ) ) {
			return;
		}

		$post_id = (int) $post_id;

		if ( 'vehiclepost' !== get_post_type( $post_id ) ) {
			return;
		}

		if ( wp_is_post_autosave( $post_id ) || wp_is_post_revision( $post_id ) ) {
			return;
		}

		$this->generate_vehicle_filter_json_file();
	}

	/**
	 * Regenerate the vehicle JSON file when a vehicle post is trashed, restored, or deleted.
	 *
	 * @param int                  $post_id The post ID.
	 * @param string|\WP_Post|null $context The hook context value.
	 * @return void
	 */
	public function regenerate_vehicle_filter_json_on_post_status_change( $post_id, $context = null ) {
		$post_type = $context instanceof \WP_Post ? $context->post_type : get_post_type( $post_id );

		if ( 'vehiclepost' !== $post_type ) {
			return;
		}

		$this->generate_vehicle_filter_json_file();
	}

	/**
	 * Sets up route and callback for custom endpoint.
	 *
	 * @return void
	 */
	public function custom_api_posts_routes() {
		register_rest_route(
			'custom/v1',
			'/vehicles',
			array(
				'methods'             => 'GET',
				'callback'            => [ $this, 'custom_api_vehicle_filter_callback' ],
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Appends a custom block category "CleanBC DX Plugins".
	 *
	 * @param array  $block_categories An array of block categories.
	 * @param object $editor_context The editor context, which may include a post object.
	 * @return array The modified array of block categories.
	 */
	public function custom_block_categories( $block_categories, $editor_context ) {
		if ( ! empty( $editor_context->post ) ) {
			array_push(
				$block_categories,
				array(
					'slug'  => 'cleanbcdx-dx-plugins',
					'title' => __( 'CleanBC DX Plugins', 'plugin' ),
					'icon'  => null,
				)
			);
		}
		return $block_categories;
	}
}
