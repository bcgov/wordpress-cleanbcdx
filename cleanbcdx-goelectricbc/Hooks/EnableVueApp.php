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

		$plugin_dir                    = plugin_dir_path( __DIR__ );
		$vehicle_filter_script_path    = $plugin_dir . 'blocks/vue-blocks/vehicle-filter-vue-block.js';
		$eligible_vehicles_script_path = $plugin_dir . 'blocks/vue-blocks/eligible-commercial-vehicles-vue-block.js';
		$plugin_data                   = get_plugin_data( $plugin_dir . 'index.php' );
		$plugin_version                = $plugin_data['Version'];
		$vehicle_filter_version        = file_exists( $vehicle_filter_script_path ) ? (string) filemtime( $vehicle_filter_script_path ) : $plugin_version;
		$eligible_vehicles_version     = file_exists( $eligible_vehicles_script_path ) ? (string) filemtime( $eligible_vehicles_script_path ) : $plugin_version;

		wp_enqueue_script(
			'cleanbcdx-plugin/vehicle-filter-block',
			plugin_dir_url( __DIR__ ) . 'blocks/vue-blocks/vehicle-filter-vue-block.js',
			[ 'wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components' ],
			$vehicle_filter_version,
			true
		);

		wp_enqueue_script(
			'cleanbcdx-plugin/eligible-commercial-vehicles-block',
			plugin_dir_url( __DIR__ ) . 'blocks/vue-blocks/eligible-commercial-vehicles-vue-block.js',
			[ 'wp-blocks', 'wp-element' ],
			$eligible_vehicles_version,
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
		if ( ! is_admin() ) {
			// Definition modal content injects Vue mount nodes after the initial page render,
			// so the shared frontend bundle needs to be available on the host page first.
			$this->enqueue_vue_app_assets();
			return;
		}

		// Check if the current editor page contains the block.
		if ( $this->page_has_vue_app_block() ) {
			$plugin_dir = plugin_dir_path( __DIR__ );
			$assets_dir = $plugin_dir . 'dist/assets/';

			$public_css_files = glob( $assets_dir . 'vue*.css' );

			foreach ( $public_css_files as $file ) {
				$version  = filemtime( $file );
				$file_url = plugins_url( str_replace( $plugin_dir, '', $file ), __DIR__ );
				wp_enqueue_style( 'vue-app-' . basename( $file, '.css' ), $file_url, [], $version );
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

		$this->enqueue_vue_app_assets();

		// Set up the attributes passed to the Vue frontend, with defaults.
		$class_name           = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$hide_federal_rebates = isset( $attributes['hideFederalRebate'] ) && $attributes['hideFederalRebate'] ? 'true' : 'false';

		// Return the Vehicle Filter App's container with appropriate class names.
		return '<div id="vehicleFilterApp" class="' . esc_attr( $class_name ) . '" data-show-federal-rebates="' . esc_attr( $hide_federal_rebates ) . '">Loading...</div>';
	}

	/**
	 * Load VueJS assets and return the Eligible Commercial Vehicles app mount point.
	 *
	 * @param array $attributes The block attributes.
	 * @return string
	 */
	public function vuejs_eligible_commercial_vehicles_dynamic_block_plugin( $attributes ) {

		$this->enqueue_vue_app_assets();

		$class_name = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$app_id     = wp_unique_id( 'eligible-commercial-vehicles-app-' );
		$endpoint   = rest_url( MediaLibrary::UNITY_FEED_NAMESPACE . MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_ROUTE );

		return sprintf(
			'<div id="%1$s" class="%2$s" data-vue-app="eligible-commercial-vehicles" data-endpoint="%3$s">Loading eligible commercial vehicles...</div>',
			esc_attr( $app_id ),
			esc_attr( $class_name ),
			esc_url( $endpoint )
		);
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

		register_block_type(
			'cleanbcdx-plugin/eligible-commercial-vehicles-block',
			[
				'render_callback' => [ $this, 'vuejs_eligible_commercial_vehicles_dynamic_block_plugin' ],
			]
		);

		register_block_type(
			'cleanbc-plugin/eligible-commercial-vehicles-block',
			[
				'render_callback' => [ $this, 'vuejs_eligible_commercial_vehicles_dynamic_block_plugin' ],
			]
		);
	}

	/**
	 * Determine whether the current page contains one of the Vue-powered blocks.
	 *
	 * @return bool
	 */
	protected function page_has_vue_app_block() {
		$block_names = array(
			'cleanbcdx-plugin/vehicle-filter-block',
			'cleanbc-plugin/vehicle-filter-block',
			'cleanbcdx-plugin/eligible-commercial-vehicles-block',
			'cleanbc-plugin/eligible-commercial-vehicles-block',
		);

		foreach ( $block_names as $block_name ) {
			if ( has_block( $block_name ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Enqueue the compiled Vue app assets for frontend rendering.
	 *
	 * @return void
	 */
	protected function enqueue_vue_app_assets() {
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
	 * Build the catalog export data written to vehicles.json.
	 *
	 * This keeps the REST API payload flat for the existing Vue app while producing the
	 * manufacturer-grouped catalog structure required by external consumers.
	 *
	 * @return array
	 */
	protected function build_vehicle_catalog_export_data() {
		$vehicles      = $this->custom_api_vehicle_filter_callback();
		$manufacturers = array();

		foreach ( $vehicles as $vehicle ) {
			$catalog_settings = $this->get_vehicle_catalog_settings( $vehicle );

			if ( empty( $catalog_settings['include_in_export'] ) ) {
				continue;
			}

			$manufacturer_label = $catalog_settings['manufacturer_label'];
			$manufacturer_key   = strtolower( $manufacturer_label );
			$model_label        = trim( (string) $vehicle['model'] );
			$model_key          = strtolower( $model_label );

			if ( ! isset( $manufacturers[ $manufacturer_key ] ) ) {
				$manufacturers[ $manufacturer_key ] = array(
					'label'       => $manufacturer_label,
					'value'       => $manufacturer_label,
					'models'      => array(),
					'sourceScope' => array(),
				);
			}

			if ( ! isset( $manufacturers[ $manufacturer_key ]['models'][ $model_key ] ) ) {
				$model_data = array(
					'label'            => $model_label,
					'value'            => $model_label,
					'category'         => $catalog_settings['category'],
					'availability'     => $catalog_settings['availability'],
					'eligibilityScope' => $catalog_settings['eligibility_scope'],
					'__sourceScope'    => $catalog_settings['source_scope'],
				);

				if ( ! empty( $catalog_settings['notes'] ) ) {
					$model_data['notes'] = $catalog_settings['notes'];
				}

				if ( ! empty( $catalog_settings['canonical_label'] ) ) {
					$model_data['canonicalLabel'] = $catalog_settings['canonical_label'];
				}

				$manufacturers[ $manufacturer_key ]['models'][ $model_key ] = $model_data;
			} else {
				$existing_model = $manufacturers[ $manufacturer_key ]['models'][ $model_key ];

				$existing_model['eligibilityScope'] = $this->sort_vehicle_catalog_scopes(
					array_merge( $existing_model['eligibilityScope'], $catalog_settings['eligibility_scope'] ),
					'eligibility'
				);

				$existing_model['__sourceScope'] = $this->sort_vehicle_catalog_scopes(
					array_merge( $existing_model['__sourceScope'], $catalog_settings['source_scope'] ),
					'source'
				);

				if ( empty( $existing_model['notes'] ) && ! empty( $catalog_settings['notes'] ) ) {
					$existing_model['notes'] = $catalog_settings['notes'];
				}

				if ( empty( $existing_model['canonicalLabel'] ) && ! empty( $catalog_settings['canonical_label'] ) ) {
					$existing_model['canonicalLabel'] = $catalog_settings['canonical_label'];
				}

				$manufacturers[ $manufacturer_key ]['models'][ $model_key ] = $existing_model;
			}

			$manufacturers[ $manufacturer_key ]['sourceScope'] = $this->sort_vehicle_catalog_scopes(
				array_merge(
					$manufacturers[ $manufacturer_key ]['sourceScope'],
					$catalog_settings['source_scope']
				),
				'source'
			);
		}

		foreach ( $manufacturers as &$manufacturer ) {
			$models = array_values( $manufacturer['models'] );

			usort(
				$models,
				function ( $first, $second ) {
					return $this->compare_vehicle_catalog_models( $first, $second );
				}
			);

			foreach ( $models as &$model ) {
				unset( $model['__sourceScope'] );
			}

			$manufacturer['models']           = $models;
			$manufacturer['sourceScope']      = $this->sort_vehicle_catalog_scopes( $manufacturer['sourceScope'], 'source' );
			$manufacturer['manufacturerType'] = $this->derive_vehicle_catalog_manufacturer_type( $manufacturer );
		}

		unset( $manufacturer, $model );

		$manufacturers = array_values( $manufacturers );

		usort(
			$manufacturers,
			static function ( $first, $second ) {
				return strcasecmp( $first['label'], $second['label'] );
			}
		);

		return array(
			'catalogName'          => 'North America ZEV Manufacturer Model Catalog',
			'generatedFrom'        => 'Go Electric BC website OEM manufacturers vehicle data.',
			'manufacturers'        => $manufacturers,
			'vehicleTypesIncluded' => $this->get_vehicle_catalog_types_included( $vehicles ),
		);
	}

	/**
	 * Build the vehicle type reference for the catalog export.
	 *
	 * Uses the vehicle types currently present on vehicle posts, then appends the
	 * broadened catalog marker required by external consumers.
	 *
	 * @param array $vehicles Flat vehicle records.
	 * @return array
	 */
	protected function get_vehicle_catalog_types_included( $vehicles ) {
		$vehicle_types = array();

		foreach ( $vehicles as $vehicle ) {
			$type = isset( $vehicle['type'] ) ? trim( (string) $vehicle['type'] ) : '';

			if ( '' === $type || in_array( $type, $vehicle_types, true ) ) {
				continue;
			}

			$vehicle_types[] = $type;
		}

		if ( ! in_array( 'broadened_prior_intake_classes', $vehicle_types, true ) ) {
			$vehicle_types[] = 'broadened_prior_intake_classes';
		}

		return $vehicle_types;
	}

	/**
	 * Resolve catalog export settings for a single vehicle entry.
	 *
	 * The catalog ACF fields override the export defaults when present.
	 *
	 * @param array $vehicle Vehicle data from the flat REST payload builder.
	 * @return array
	 */
	protected function get_vehicle_catalog_settings( $vehicle ) {
		$settings = $this->get_vehicle_catalog_default_settings( $vehicle );

		$settings = array_merge( $settings, $this->get_vehicle_catalog_acf_overrides( $vehicle['id'] ) );

		$settings['eligibility_scope']  = $this->sort_vehicle_catalog_scopes( $settings['eligibility_scope'], 'eligibility' );
		$settings['source_scope']       = $this->sort_vehicle_catalog_scopes( $settings['source_scope'], 'source' );
		$settings['manufacturer_label'] = trim( (string) $settings['manufacturer_label'] );
		$settings['category']           = trim( (string) $settings['category'] );
		$settings['availability']       = trim( (string) $settings['availability'] );
		$settings['notes']              = trim( (string) $settings['notes'] );
		$settings['canonical_label']    = trim( (string) $settings['canonical_label'] );
		$settings['include_in_export']  = (bool) $settings['include_in_export'];

		return $settings;
	}

	/**
	 * Get fallback export settings for a vehicle.
	 *
	 * @param array $vehicle Vehicle data from the flat REST payload builder.
	 * @return array
	 */
	protected function get_vehicle_catalog_default_settings( $vehicle ) {
		$vehicle_type  = strtoupper( trim( (string) $vehicle['type'] ) );
		$source_scopes = array( 'epa_current_passenger_zev' );

		if ( 'FCEV' === $vehicle_type || 'FCV' === $vehicle_type ) {
			$source_scopes = array( 'epa_current_fcv' );
		}

		return array(
			'include_in_export'  => true,
			'manufacturer_label' => trim( (string) $vehicle['make'] ),
			'category'           => 'light_duty_passenger',
			'availability'       => 'current_or_recent_north_america',
			'eligibility_scope'  => array( 'current_catalog' ),
			'source_scope'       => $source_scopes,
			'notes'              => '',
			'canonical_label'    => '',
		);
	}

	/**
	 * Get ACF-based metadata overrides for catalog export.
	 *
	 * Supported catalog ACF fields:
	 * - catalog_manufacturer_label
	 * - catalog_category
	 * - catalog_availability
	 * - catalog_eligibility_scope
	 * - catalog_source_scope
	 * - catalog_notes
	 * - catalog_canonical_label
	 * - catalog_include_in_export
	 *
	 * @param int $post_id Vehicle post ID.
	 * @return array
	 */
	protected function get_vehicle_catalog_acf_overrides( $post_id ) {
		$overrides = array();

		$manufacturer_label = get_field( 'catalog_manufacturer_label', $post_id );
		$category           = get_field( 'catalog_category', $post_id );
		$availability       = get_field( 'catalog_availability', $post_id );
		$eligibility_scope  = $this->normalize_vehicle_catalog_array_value( get_field( 'catalog_eligibility_scope', $post_id ) );
		$source_scope       = $this->normalize_vehicle_catalog_array_value( get_field( 'catalog_source_scope', $post_id ) );
		$notes              = get_field( 'catalog_notes', $post_id );
		$canonical_label    = get_field( 'catalog_canonical_label', $post_id );
		$include_in_export  = $this->normalize_vehicle_catalog_boolean_value( get_field( 'catalog_include_in_export', $post_id ), null );

		if ( is_string( $manufacturer_label ) && '' !== trim( $manufacturer_label ) ) {
			$overrides['manufacturer_label'] = trim( $manufacturer_label );
		}

		if ( is_string( $category ) && '' !== trim( $category ) ) {
			$overrides['category'] = trim( $category );
		}

		if ( is_string( $availability ) && '' !== trim( $availability ) ) {
			$overrides['availability'] = trim( $availability );
		}

		if ( ! empty( $eligibility_scope ) ) {
			$overrides['eligibility_scope'] = $eligibility_scope;
		}

		if ( ! empty( $source_scope ) ) {
			$overrides['source_scope'] = $source_scope;
		}

		if ( is_string( $notes ) && '' !== trim( $notes ) ) {
			$overrides['notes'] = trim( $notes );
		}

		if ( is_string( $canonical_label ) && '' !== trim( $canonical_label ) ) {
			$overrides['canonical_label'] = trim( $canonical_label );
		}

		if ( null !== $include_in_export ) {
			$overrides['include_in_export'] = $include_in_export;
		}

		return $overrides;
	}

	/**
	 * Normalize an ACF value into a boolean.
	 *
	 * @param mixed     $value Field value.
	 * @param bool|null $fallback Default value when input is empty.
	 * @return bool|null
	 */
	protected function normalize_vehicle_catalog_boolean_value( $value, $fallback = null ) {
		if ( null === $value || '' === $value ) {
			return $fallback;
		}

		if ( is_bool( $value ) ) {
			return $value;
		}

		if ( is_numeric( $value ) ) {
			return 1 === (int) $value;
		}

		$value = strtolower( trim( (string) $value ) );

		if ( in_array( $value, array( '1', 'true', 'yes', 'on' ), true ) ) {
			return true;
		}

		if ( in_array( $value, array( '0', 'false', 'no', 'off' ), true ) ) {
			return false;
		}

		return $fallback;
	}

	/**
	 * Normalize an ACF value into a clean array of strings.
	 *
	 * @param mixed $value Field value.
	 * @return array
	 */
	protected function normalize_vehicle_catalog_array_value( $value ) {
		if ( empty( $value ) ) {
			return array();
		}

		if ( is_string( $value ) ) {
			$value = array( $value );
		}

		if ( ! is_array( $value ) ) {
			return array();
		}

		$normalized = array();

		foreach ( $value as $item ) {
			$item = trim( (string) $item );

			if ( '' !== $item ) {
				$normalized[] = $item;
			}
		}

		return array_values( array_unique( $normalized ) );
	}

	/**
	 * Sort and de-duplicate catalog scope values.
	 *
	 * @param array  $values Scope values.
	 * @param string $type Either eligibility or source.
	 * @return array
	 */
	protected function sort_vehicle_catalog_scopes( $values, $type ) {
		$values = array_values( array_unique( array_filter( array_map( 'strval', $values ) ) ) );

		$priorities = array(
			'eligibility' => array(
				'current_catalog'     => 10,
				'prior_intake_subset' => 20,
				'broadened_catalog'   => 30,
			),
			'source'      => array(
				'epa_current_passenger_zev'       => 10,
				'epa_current_fcv'                 => 20,
				'commercial_catalog_extension'    => 30,
				'prior_intake_subset'             => 40,
				'official_manufacturer_reference' => 50,
			),
		);

		$priority_map = isset( $priorities[ $type ] ) ? $priorities[ $type ] : array();

		usort(
			$values,
			static function ( $first, $second ) use ( $priority_map ) {
				$first_priority  = isset( $priority_map[ $first ] ) ? $priority_map[ $first ] : 999;
				$second_priority = isset( $priority_map[ $second ] ) ? $priority_map[ $second ] : 999;

				if ( $first_priority === $second_priority ) {
					return strcasecmp( $first, $second );
				}

				return $first_priority - $second_priority;
			}
		);

		return $values;
	}

	/**
	 * Compare two catalog models for output ordering.
	 *
	 * Current-catalog models are listed before broadened/legacy entries.
	 *
	 * @param array $first First model.
	 * @param array $second Second model.
	 * @return int
	 */
	protected function compare_vehicle_catalog_models( $first, $second ) {
		$first_priority  = in_array( 'current_catalog', $first['eligibilityScope'], true ) ? 10 : 20;
		$second_priority = in_array( 'current_catalog', $second['eligibilityScope'], true ) ? 10 : 20;

		if ( $first_priority === $second_priority ) {
			return strcasecmp( $first['label'], $second['label'] );
		}

		return $first_priority - $second_priority;
	}

	/**
	 * Derive manufacturerType from the grouped manufacturer metadata.
	 *
	 * @param array $manufacturer Manufacturer export data.
	 * @return string
	 */
	protected function derive_vehicle_catalog_manufacturer_type( $manufacturer ) {
		$current_scopes = array( 'epa_current_passenger_zev', 'epa_current_fcv' );
		$legacy_scopes  = array( 'commercial_catalog_extension', 'prior_intake_subset', 'official_manufacturer_reference' );

		$has_current = (bool) array_intersect( $manufacturer['sourceScope'], $current_scopes );
		$has_legacy  = (bool) array_intersect( $manufacturer['sourceScope'], $legacy_scopes );

		if ( $has_current && $has_legacy ) {
			return 'current_and_broadened_catalog';
		}

		if ( $has_current ) {
			return 'current_catalog';
		}

		$categories = array();

		foreach ( $manufacturer['models'] as $model ) {
			$categories[] = $model['category'];
		}

		if ( array_intersect( $categories, array( 'commercial_van', 'commercial_truck' ) ) ) {
			return 'legacy_or_commercial_catalog';
		}

		if ( array_intersect( $categories, array( 'specialty_utility', 'ebike', 'motorcycle' ) ) ) {
			return 'legacy_or_specialty_catalog';
		}

		return 'broadened_catalog';
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
		$data = array( $this->build_vehicle_catalog_export_data() );

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
	public function regenerate_vehicle_filter_json_file_on_acf_save( $post_id ) {
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
	public function regenerate_vehicle_filter_json_file_on_post_status_change( $post_id, $context = null ) {
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
