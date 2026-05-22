<?php
/**
 * Plugin Name: CleanBC DX Supplemental: Built Environment
 * Description: A plugin to load custom blocks enabling Vue-based custom posts (rebates, contractors, EAs, faqs, etc.) filtering, scripts, styles and settings to augment the Built Environemnt websites – both Better Homes BC and Better Buildings BC – managed by the CleanBC DX team.
 * Version: 1.0.0
 * Author: Nate King | CleanBC DX
 * Author URI: mailto:nate.king@gov.bc.ca
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Repository: https://github.com/bcgov/wordpress-cleanbcdx/
 * Plugin URI: https://github.com/bcgov/wordpress-cleanbcdx/tree/main/cleanbcdx-builtenvironment
 * Update URI: https://raw.githubusercontent.com/bcgov/wordpress-cleanbcdx/main/cleanbcdx-builtenvironment/index.php
 * Requires Plugins: cleanbcdx-bcgov-main
 *
 * @package Bcgov\Plugin\CleanBCDXBE
 */


if ( ! defined( 'ABSPATH' ) ) {
	exit( 'Direct access denied.' );
}

// Include the Loader and Setup classes.
require_once plugin_dir_path( __FILE__ ) . '/Loader.php';
require_once plugin_dir_path( __FILE__ ) . '/Setup.php';

if ( class_exists( 'Bcgov\\Plugin\\CleanBCDXBE\\Loader' ) ) {
    $base_dir = plugin_dir_path( __FILE__ ) . '/';
    $loader   = new Bcgov\Plugin\CleanBCDXBE\Loader( [ $base_dir ] ); // Pass the base directory as an array.
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

if ( class_exists( 'Bcgov\\Plugin\\CleanBCDXBE\\Setup' ) ) {
    new Bcgov\Plugin\CleanBCDXBE\Setup();
}
