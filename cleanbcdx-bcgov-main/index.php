<?php
/**
 * Plugin Name: CleanBC DX BCGov Block Theme Plugin
 * Description: A plugin to load custom blocks, scripts, styles and theme settings to augment the default BCGov Block Theme capabilities on the CleanBC DX websites. Forked from the BCGov Block Theme Supplemental: CleanBC plugin and moved into the Wordpress-CleanBCDX repo for DX Team management.
 * Version: 1.0.5
 * Author: Nate King | CleanBC DX
 * Author URI: mailto:nate.king@gov.bc.ca
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Repository: https://github.com/bcgov/wordpress-cleanbcdx/
 * Plugin URI: https://github.com/bcgov/wordpress-cleanbcdx/tree/main/cleanbcdx-bcgov-main
 * Update URI: https://raw.githubusercontent.com/bcgov/wordpress-cleanbcdx/main/cleanbcdx-bcgov-main/index.php
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
    if ( ! class_exists( 'Composer\\Autoload\\ClassLoader', false ) ) {
        if ( file_exists( $local_composer ) ) {
            require_once $local_composer;
        } elseif ( file_exists( $server_composer ) ) {
            require_once $server_composer;
        }
    }
}

if ( class_exists( 'Bcgov\\Plugin\\CleanBCDX\\Setup' ) ) {
    new Bcgov\Plugin\CleanBCDX\Setup();
}
