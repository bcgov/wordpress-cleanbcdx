<?php

namespace Bcgov\Plugin\CleanBCDX\Hooks;

/**
 * Sets up Javascript variable handoff from WordPress to theme.
 *
 * @since 1.0.1
 *
 * @package Bcgov\Plugin\CleanBCDX
 */
class EnqueueAndInject {


	/**
	 * Enqueue scripts and styles for public website.
	 *
	 * @since 1.0.1
	 *
	 * @return void
	 */
	public function bcgov_plugin_enqueue_scripts(): void {
		$plugin_dir = \Bcgov\Plugin\CleanBCDX\Setup::get_plugin_dir();
		$assets_dir = $plugin_dir . 'dist/assets/';

		$plugin_version = \Bcgov\Plugin\CleanBCDX\Setup::get_plugin_version();
		$plugin_base    = \Bcgov\Plugin\CleanBCDX\Setup::get_plugin_basename();

		$update_check = get_site_transient( 'update_plugins' );
		if ( isset( $update_check->response[ $plugin_base ] ) ) {
			$latest_version = $update_check->response[ $plugin_base ]->new_version;
		} else {
			$latest_version = $plugin_version; // Fallback to the installed version.
		}

		$public_css_files = glob( $assets_dir . 'public*.css' );
		$public_js_files  = glob( $assets_dir . 'public*.js' );

		foreach ( $public_css_files as $file ) {
			$file_url = plugins_url( str_replace( $plugin_dir, '', $file ), __DIR__ );
			wp_enqueue_style( 'custom-public-' . basename( $file, '.css' ), $file_url, [], $latest_version );
		}

		// Important: localize after enqueuing the correct JS file.
		foreach ( $public_js_files as $file ) {
			$file_url = plugins_url( str_replace( $plugin_dir, '', $file ), __DIR__ );
			$handle   = 'custom-public-' . basename( $file, '.js' );

			wp_enqueue_script( $handle, $file_url, [], $latest_version, true );

			// Set JS variables, including the nonce.
			$javascript_variables          = $this->bcgov_plugin_set_javascript_variables();
			$javascript_variables['nonce'] = wp_create_nonce( 'pdf_size_check' );

			wp_localize_script( $handle, 'pluginCleanbc', $javascript_variables );
		}
	}


	/**
	 * Enqueue scripts and styles for admin.
	 *
	 * @since 1.0.1
	 *
	 * @return void
	 */
	public function bcgov_plugin_enqueue_admin_scripts(): void {
		$plugin_dir = \Bcgov\Plugin\CleanBCDX\Setup::get_plugin_dir();
		$assets_dir = $plugin_dir . 'dist/assets/';

		$plugin_version = \Bcgov\Plugin\CleanBCDX\Setup::get_plugin_version();
		$plugin_base    = \Bcgov\Plugin\CleanBCDX\Setup::get_plugin_basename();

		$update_check = get_site_transient( 'update_plugins' );
		if ( isset( $update_check->response[ $plugin_base ] ) ) {
			$latest_version = $update_check->response[ $plugin_base ]->new_version;
		} else {
			$latest_version = $plugin_version; // Fallback to the installed version.
		}

		$admin_css_files = glob( $assets_dir . 'admin*.css' );
		$admin_js_files  = glob( $assets_dir . 'admin*.js' );

		foreach ( $admin_css_files as $file ) {
			$file_url = plugins_url( str_replace( $plugin_dir, '', $file ), __DIR__ );
			wp_enqueue_style( 'custom-admin-' . basename( $file, '.css' ), $file_url, [], $latest_version );
		}

		foreach ( $admin_js_files as $file ) {
			$file_url = plugins_url( str_replace( $plugin_dir, '', $file ), __DIR__ );
			wp_enqueue_script( 'custom-admin-' . basename( $file, '.js' ), $file_url, [], $latest_version, true );
		}
	}


	/**
	 * Load the Override theme.json and update the provided theme.json object.
	 *
	 * Retrieves the contents of the 'theme.json' file contains configuration settings for the current theme.
	 *
	 * @param object $theme_json The original theme.json object to be filtered.
	 * @return object The updated theme.json object.
	 */
	public function filter_theme_json_theme_plugin( $theme_json ) {

		$plugin_theme_json_path = trailingslashit( plugin_dir_path( __FILE__ ) ) . '../theme/theme.json';

		$response = wp_remote_get( $plugin_theme_json_path );

		if ( is_wp_error( $response ) ) { return $theme_json; }

		$body = wp_remote_retrieve_body( $response );

		$plugin_theme_json = json_decode( $body, true );

		if ( ! is_array( $plugin_theme_json ) ) { return $theme_json; }

		return $theme_json->update_with( $plugin_theme_json );
	}

	/**
     * Enqueue JS variables.
     *
     * @example Sets array values for use in globally scoped JS.
     * @return array
     */
    public function bcgov_plugin_set_javascript_variables() {

		$javascript_variables = [
			'domain'    => home_url(),
			'siteName'  => 'cleanbc',
			'pluginDir' => plugin_dir_url( __DIR__ ),
		];

		return $javascript_variables;
	}

	/**
	 * Adds the cleanbc class to the body tag of the current page/post.
	 * This is a necessary body class for both CleanBC and Go Electric BC.
	 *
	 * @since 1.1.0
	 * @param array $classes An array of existing classes for the body tag.
	 * @return array The modified array of classes with the custom class added.
     */
	public function add_cleanbc_class_to_body( $classes ) {

		$custom_body_class_name = 'cleanbc';

		$classes[] = $custom_body_class_name;

		return $classes;
	}
}
