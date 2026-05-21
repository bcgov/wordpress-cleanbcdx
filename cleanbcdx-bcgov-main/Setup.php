<?php

namespace Bcgov\Plugin\CleanBCDX;

use Bcgov\Plugin\CleanBCDX\Hooks\{
    EnqueueAndInject,
    SearchContext,
    Accessibility,
    RebateQueryTool,
    GravityForms
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
        $plugin_search             = new SearchContext();
        $accessibility             = new Accessibility();
        $rebate_query_tool         = new RebateQueryTool();
        $gravity_forms             = new GravityForms();

        // Filters.
        add_filter( 'wp_theme_json_data_theme', [ $plugin_enqueue_and_inject, 'filter_theme_json_theme_plugin' ] );
        add_filter( 'get_the_date', [ $plugin_search, 'bcgov_modify_search_result_date' ], 10, 2 );
        add_filter( 'body_class', [ $plugin_enqueue_and_inject, 'add_cleanbc_class_to_body' ] );

	    add_filter( 'the_content', [ $plugin_search, 'bcgov_filter_content_for_search' ], 1 );
        add_filter( 'get_the_excerpt', [ $plugin_search, 'bcgov_filter_excerpt_for_search' ], 10, 2 );
        add_filter( 'wp_trim_excerpt', [ $plugin_search, 'bcgov_filter_excerpt_for_search' ], 10, 2 );
        add_filter( 'the_title', [ $plugin_search, 'bcgov_prepend_rebates_type_to_search_title' ], 10, 2 );

        // Actions.
        add_action( 'pre_get_posts', [ $plugin_search, 'bcgov_included_post_types_in_search' ] );
        add_action( 'pre_get_posts', [ $plugin_search, 'bcgov_exclude_hide_from_search_pages' ], 10 );
        add_action( 'pre_get_posts', [ $plugin_search, 'bcgov_order_search_by_priority' ], 11 );
        add_action( 'wp_enqueue_scripts', [ $plugin_enqueue_and_inject, 'bcgov_plugin_enqueue_scripts' ] );
        add_action( 'admin_enqueue_scripts', [ $plugin_enqueue_and_inject, 'bcgov_plugin_enqueue_admin_scripts' ] );
        add_action( 'init', [ $rebate_query_tool, 'register_shortcode' ] );
        add_action( 'gform_after_submission', [ $gravity_forms, 'remove_form_entry' ], 10, 2 );

        add_action( 'init', [ $accessibility, 'pdf_proxy_rewrite' ] );
        add_filter( 'query_vars', [ $accessibility, 'pdf_proxy_size' ] );
        add_action( 'template_redirect', [ $accessibility, 'pdf_proxy' ] );
    }

    /**
	 * Get the plugin root directory.
	 *
	 * @return string
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

		return $plugin_data['Version'] ?? '1.0.0';
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
