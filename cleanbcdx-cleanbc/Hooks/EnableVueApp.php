<?php

namespace Bcgov\Plugin\CleanBCDXCBC\Hooks;

/**
 * Sets up VueJS based applications.
 *
 * @since 1.0.1
 *
 * @package Bcgov\Plugin\CleanBCDXCBC
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
			'cleanbcdx-plugin/post-filter-block',
			plugin_dir_url( __DIR__ ) . 'blocks/vue-blocks/post-filter-vue-block.js',
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
		if ( has_block( 'cleanbcdx-plugin/post-filter-block' ) || has_block( 'cleanbc-plugin/post-filter-block' ) ) {
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
	public function vuejs_post_filter_app_dynamic_block_plugin( $attributes ) {

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
		$columns             = isset( $attributes['columns'] ) ? $attributes['columns'] : 3;
		$class_name          = isset( $attributes['className'] ) ? $attributes['className'] : '';
		$post_type           = isset( $attributes['postType'] ) ? $attributes['postType'] : 'posts';
		$post_type_label     = isset( $attributes['postTypeLabel'] ) ? $attributes['postTypeLabel'] : 'Posts';
		$heading_size        = isset( $attributes['headingSize'] ) ? $attributes['headingSize'] : 'h3';
		$heading_link_active = isset( $attributes['headingLinkActive'] ) ? $attributes['headingLinkActive'] : 'false';
		$use_excerpt         = isset( $attributes['useExcerpt'] ) ? $attributes['useExcerpt'] : 'excerpt';

		// Return the Post Filter App's container with appropriate class names and data-columns.
		return '<div id="postFilterApp" class="' . esc_attr( $class_name ) . '" data-columns="' . esc_attr( $columns ) . '" data-post-type="' . esc_attr( $post_type ) . '"  data-heading-size="' . esc_attr( $heading_size ) . '" data-heading-link-active="' . esc_attr( $heading_link_active ) . '" data-use-excerpt="' . esc_attr( $use_excerpt ) . '" data-post-type-label="' . esc_attr( $post_type_label ) . '">Loading...</div>';
	}

	/**
	 * Initialize the VueJS app blocks.
	 */
	public function vuejs_app_block_init_plugin() {
		register_block_type(
			'cleanbcdx-plugin/post-filter-block',
			[
				'render_callback' => [ $this, 'vuejs_post_filter_app_dynamic_block_plugin' ],
			]
		);

		register_block_type(
			'cleanbc-plugin/post-filter-block',
			[
				'render_callback' => [ $this, 'vuejs_post_filter_app_dynamic_block_plugin' ],
			]
		);
	}

	/**
	 * Return ACF fields for vehiclepost content type.
	 *
	 * @return array
	 */
	public function custom_api_post_filter_callback() {
		$args = array(
			'post_type'      => 'project',
			'posts_per_page' => -1,
			'post_status'    => 'publish',
		);

		$projects = new \WP_Query( $args );

		$posts_data = [];

		foreach ( $projects->posts as $post ) {
			$categories = wp_get_post_categories( $post->ID, array( 'fields' => 'all' ) );

			$categories_data = array();
			foreach ( $categories as $category ) {
				$image             = get_field( 'category_image', 'category_' . $category->term_id );
				$categories_data[] = [
					'id'    => $category->term_id,
					'name'  => $category->name,
					'slug'  => $category->slug,
					'image' => $image ? $image : '', // return empty string if no image set.
				];
			}

			$content = apply_filters( 'the_content', $post->post_content );

			if ( ! empty( $post->post_excerpt ) ) {
				$excerpt = apply_filters( 'the_excerpt', $post->post_excerpt );
			} else {
				$excerpt = wp_trim_words( $content, 30, '...' ); // Generate excerpt with 30 words.
			}

			$posts_data[] = (object) array(
				'id'         => $post->ID,
				'title'      => $post->post_title,
				'link'       => get_permalink( $post->ID ),
				'content'    => $content,
				'excerpt'    => $excerpt,
				'categories' => $categories_data,
			);
		}

		return $posts_data;
	}


	/**
	 * Sets up route and callback for custom endpoint.
	 *
	 * @return void
	 */
	public function custom_api_posts_routes() {
		register_rest_route(
			'custom/v1',
			'/actions',
			array(
				'methods'             => 'GET',
				'callback'            => [ $this, 'custom_api_post_filter_callback' ],
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
