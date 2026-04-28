<?php
/**
 * Plugin Name: CleanBC Plugin Supplemental: Better Homes BC
 * Description: A plugin to load custom blocks (enables Vue-based posts filtering), scripts, styles and settings to augment the BCGov Block Theme Supplemental: CleanBC plugin and its capabilities on the Better Homes BC website.
 * Version: 0.1.0
 * Author: Nate King
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Repository: https://github.com/codewisenate/BCGov-Block-Theme-Helper-Plugin
 *
 * @package Bcgov\Plugin\CleanBCDX
 */


if ( ! defined( 'ABSPATH' ) ) {
	exit( 'Direct access denied.' );
}

// Include the Loader and Setup classes.
require_once plugin_dir_path( __FILE__ ) . '/Loader.php';
require_once plugin_dir_path( __FILE__ ) . '/Setup.php';

if ( class_exists( 'Bcgov\\Plugin\\CleanBCDX\\Loader' ) ) {
    $base_dir = plugin_dir_path( __FILE__ ) . '/';
    $loader   = new Bcgov\Plugin\CleanBCDX\Loader( [ $base_dir ] ); // Pass the base directory as an array.
    $loader->register();

    $local_composer  = __DIR__ . '/vendor/autoload.php';
    $server_composer = __DIR__ . '/../../../../vendor/autoload.php';
    if ( file_exists( $local_composer ) || file_exists( $server_composer ) ) {
        if ( file_exists( $server_composer ) ) {
            require_once $server_composer;
        }
        if ( file_exists( $local_composer ) ) {
            require_once $local_composer;
        }
    }
}

if ( class_exists( 'Bcgov\\Plugin\\CleanBCDX\\Setup' ) ) {
    new Bcgov\Plugin\CleanBCDX\Setup();
}
