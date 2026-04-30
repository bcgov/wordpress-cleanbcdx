<?php

namespace Bcgov\Plugin\CleanBCDX;

use Bcgov\Plugin\CleanBCDX\Hooks\{
    EnqueueAndInject,
    EnableVueApp,
    BasicBlocks
};

/**
 * Initialization and setup of theme utilising an auto-loader.
 *
 * @since 1.0.1
 *
 * @package Bcgov/Theme/Block
 */
class Setup {
	/**
	 * Absolute path to the plugin bootstrap file.
	 *
	 * @var string
	 */
	public static $plugin_file = __DIR__ . '/index.php';

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	public static $plugin_name = 'cleanbc';

	/**
	 * Human-readable title of this plugin.
	 *
	 * @var string $plugin_title The string containing the human-readable title of this plugin.
	 */
	public static $plugin_title = 'BCGov CleanBC';

    /**
     * The plugin root directory.
     *
     * @var string $plugin_dir The path to this plugin's root directory.
     */
    public static $plugin_dir = __DIR__ . '/';

    /**
     * Constructor.
     */
    public function __construct() {
		self::$plugin_dir = plugin_dir_path( self::$plugin_file );

        $plugin_enqueue_and_inject = new EnqueueAndInject();
        $plugin_enable_vue_app     = new EnableVueApp();
        $basic_blocks              = new BasicBlocks();

        // Filters.
        add_filter( 'wp_theme_json_data_theme', [ $plugin_enqueue_and_inject, 'filter_theme_json_theme_plugin' ] );
        add_filter( 'block_categories_all', [ $plugin_enable_vue_app, 'custom_block_categories' ], 10, 2 );
        add_filter( 'body_class', [ $plugin_enqueue_and_inject, 'add_cleanbc_class_to_body' ] );
        add_filter( 'wp_script_attributes', [ $plugin_enable_vue_app, 'add_script_type_attribute' ], 10, 2 );

        // Actions.
        add_action( 'wp_enqueue_scripts', [ $plugin_enqueue_and_inject, 'bcgov_plugin_enqueue_scripts' ] );
        add_action( 'admin_enqueue_scripts', [ $plugin_enqueue_and_inject, 'bcgov_plugin_enqueue_admin_scripts' ] );
        add_action( 'enqueue_block_editor_assets', [ $plugin_enable_vue_app, 'vuejs_wordpress_block_plugin' ] );
        add_action( 'wp_enqueue_scripts', [ $plugin_enable_vue_app, 'vuejs_app_plugin' ] );
        add_action( 'admin_enqueue_scripts', [ $plugin_enable_vue_app, 'vuejs_app_plugin' ] );
        add_action( 'init', [ $plugin_enable_vue_app, 'vuejs_app_block_init_plugin' ] );
        add_action( 'rest_api_init', [ $plugin_enable_vue_app, 'custom_api_posts_routes' ] );

		// Allow embedding the iframe from Planner.
		add_action(
            'send_headers',
            function () {
				header( "Content-Security-Policy: frame-ancestors 'self' https://bchomeenergyplanner.ca always" );
			}
        );

		add_filter(
			'body_class',
			function ( $classes ) {
				// Read-only query var used only to add a body class; no state change occurs.
				// phpcs:ignore WordPress.Security.NonceVerification.Recommended
				if ( isset( $_GET['source'] ) ) {
					// phpcs:ignore WordPress.Security.NonceVerification.Recommended
					$source = sanitize_key( wp_unslash( $_GET['source'] ) );

					if ( 'planner' === $source ) {
						$classes[] = 'is-iframe-view';
					}
				}

				return $classes;
			}
		);
	}

    /**
	 * Get asset information including path to dist folder, asset dependencies and version.
	 *
	 * @return  array
	 */
	public static function get_plugin_dir(): string {
		return plugin_dir_path( self::$plugin_file );
	}

	/**
	 * Get the plugin base URL.
	 *
	 * @return string
	 */
	public static function get_plugin_url(): string {
		return plugin_dir_url( self::$plugin_file );
	}

	/**
	 * Get the plugin basename used in update checks.
	 *
	 * @return string
	 */
	public static function get_plugin_basename(): string {
		return plugin_basename( self::$plugin_file );
	}

	/**
	 * Get the plugin version from the header.
	 *
	 * @return string
	 */
	public static function get_plugin_version(): string {
		$plugin_data = get_plugin_data( self::$plugin_file );

		return $plugin_data['Version'] ?? '0.1.0';
	}

	/**
	 * Get asset information including path to dist folder, asset dependencies and version.
	 *
	 * @since   1.0.0
	 * @param   string $name Name of the asset (usually 'admin' or 'public').
	 * @param   string $folder The name of the folder with the asset. Normally 'dist'.
	 * @return  array
	 */
	public static function get_asset_information( string $name, string $folder = 'dist' ): array {
		$dist_path       = self::get_plugin_dir() . $folder . '/';
        $dist_url        = self::get_plugin_url() . $folder . '/';
        $asset_file_path = $dist_path . $name . '.asset.php';
        $dependencies    = [];
        $version         = false;

        if ( file_exists( $asset_file_path ) ) {
			$asset        = require $asset_file_path;
            $dependencies = $asset['dependencies'];
            $version      = $asset['version'];
        }

        return [
            'handle'       => self::$plugin_name . '-' . $name,
            'dist_url'     => $dist_url,
            'dependencies' => $dependencies,
            'version'      => $version,
        ];
	}
}
