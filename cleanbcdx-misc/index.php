<?php

/**
 * Plugin Name: CLEANBCDX - miscellaneous
 * Description: Miscellaneous features for managing from GithubActions on OpenShift; CLI Keycloak SSO/Miniorange adjuster, and increment a hit count whenever Safe Redirect Manager performs a redirect.
 * Version: 1.2.10
 * Author: CleanBC DX
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Plugin URI: https://github.com/bcgov/wordpress-cleanbcdx/tree/main/cleanbcdx-misc
 * Update URI: https://raw.githubusercontent.com/bcgov/wordpress-cleanbcdx/main/cleanbcdx-misc/index.php
 */

/* 
Changelog
1.2.8 - Safe Redirect Manager hit count
1.2.7 - Forked from DIGIMOD-misc
*/

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}



// Begin function to check for updates to plugin
require_once "cleanbcdx-update-check.php";

add_action('init', 'cleanbcdx_misc_update_check_init');
function cleanbcdx_misc_update_check_init()
{
    if (class_exists('cleanbcdx_plugin_update_check')) {
        new cleanbcdx_plugin_update_check(__FILE__, plugin_basename(__FILE__));
    }
}
//End update check code.


add_action( 'plugins_loaded', function() {

	if ( ! class_exists( 'SRM_Redirect' ) ) {
		return;
	}

	// Increment hits
    add_action( 'srm_do_redirect', function( $requested_path ) {

        if (
            isset( $_GET['pdf_size_check'] ) ||
            isset( $_GET['pdf_size_proxy'] ) ||
            ( isset( $_SERVER['REQUEST_METHOD'] ) && 'HEAD' === $_SERVER['REQUEST_METHOD'] )
        ) {
            return;
        }

        $matched_redirect = SRM_Redirect::factory()->match_redirect( $requested_path );

        if ( empty( $matched_redirect['redirect_id'] ) ) {
            return;
        }

        $redirect_id = absint( $matched_redirect['redirect_id'] );

        $count = (int) get_post_meta( $redirect_id, '_srm_redirect_hit_count', true );
        update_post_meta( $redirect_id, '_srm_redirect_hit_count', $count + 1 );

    }, 10, 1 );

	// Admin column
	add_filter( 'manage_redirect_rule_posts_columns', function( $columns ) {
		$columns['srm_redirect_hits'] = 'Hits';
		return $columns;
	});

	add_action( 'manage_redirect_rule_posts_custom_column', function( $column, $post_id ) {
		if ( 'srm_redirect_hits' === $column ) {
			echo (int) get_post_meta( $post_id, '_srm_redirect_hit_count', true );
		}
	}, 10, 2 );

});

// Have the temporary ability to zero out hit counts with /wp-admin/?reset_srm_hits=1
add_action( 'admin_init', function() {

    if ( ! current_user_can( 'manage_options' ) ) {
        return;
    }

    if ( ! isset( $_GET['reset_srm_hits'] ) ) {
        return;
    }

    $redirects = get_posts( [
        'post_type'      => 'redirect_rule',
        'posts_per_page' => -1,
        'fields'         => 'ids',
    ] );

    foreach ( $redirects as $id ) {
        update_post_meta( $id, '_srm_redirect_hit_count', 0 );
    }

    wp_die( 'SRM redirect hit counts reset.' );

});

/* Prevent WP password protected pages from showing in web searches
*/
/*function cleanbcdx_misc_noindex_protected_pages($robots) {
    global $post;
    if ( $post && post_password_required( $post ) ) {
        $robots['nofollow'] = true;
        $robots['noindex'] = true;
    }
    return $robots;
}
function cleanbcdx_misc_noindex_protected_pages_aioseo($attributes){
    global $post;
    if ( $post && post_password_required( $post ) ) {
        $attributes['noindex']  = 'noindex';
        $attributes['nofollow'] = 'nofollow';
    }
    return $attributes;
}
add_filter( 'wp_robots', 'cleanbcdx_misc_noindex_protected_pages' );
add_filter( 'aioseo_robots_meta', 'cleanbcdx_misc_noindex_protected_pages_aioseo' );
*/

add_action('admin_bar_menu', function ($wp_admin_bar) {
	if (!is_user_logged_in() || !is_admin_bar_showing()) {
		return;
	}

	$sites = [
		[
			'title' => 'Better Homes BC',
			'url'   => 'https://betterhomesbc.ca/wp-admin/',
		],
		[
			'title' => 'Better Buildings BC',
			'url'   => 'https://betterbuildingsbc.ca/wp-admin/',
		],
		[
			'title' => 'CleanBC',
			'url'   => 'https://cleanbc.gov.bc.ca/wp-admin/',
		],
		[
			'title' => 'Go Electric BC',
			'url'   => 'https://goelectricbc.gov.bc.ca/wp-admin/',
		],
	];

	$wp_admin_bar->add_node([
		'id'    => 'my-sites',
		'title' => 'CleanBC DX Sites',
		'href'  => false,
		'meta'  => [
            'menu_order' => 1,
		],
	]);

	foreach ($sites as $index => $site) {
		$wp_admin_bar->add_node([
			'id'     => 'my-sites-' . $index,
			'parent' => 'my-sites',
			'title'  => esc_html($site['title']),
			'href'   => esc_url($site['url']),
			'meta'   => [
				'target' => '_blank',
				'rel'    => 'noopener noreferrer',
			],
		]);
	}
}, 20);

// CLI command to modify keycloak config (used for when the site gets imported to a different instance)
if (defined('WP_CLI')) {
    class Cleanbcdx_config_mo extends WP_CLI_Command
    {
        public function __invoke($args)
        {

            // [ssoprotocol] => xxx
            // [apptype] => xxx
            // [clientid] => xxx
            // [clientsecret] => xxx
            // [redirecturi] => xxx DO NOT CHANGE THIS - plugin hardcodes for this automatically
            // [send_headers] => xx
            // [send_body] => xx
            // [send_state] => xx
            // [show_on_login_page] => xx
            // [appId] => xx
            // [scope] => xxx
            // [authorizeurl] => "auth-server-url": "https://test.loginproxy.gov.bc.ca/auth"
            // [accesstokenurl] => xxx
            // [resourceownerdetailsurl] => 
            // [username_attr] => xxx

            if(!is_array($args) || count($args) != 3){
                WP_CLI::error('Missing arguments!');
                return;
            }

            $clientSecret = $args[0];
            $ssoURI = $args[1];
            $siteURL = $args[2];

            $appslist = get_option('mo_oauth_apps_list');
            $app = $appslist['keycloak'];
            // WP_CLI::log('clientSecret: ');
            // WP_CLI::log($app['clientsecret']);

            //WP_CLI::log(implode(', ', $app));
            // WP_CLI::log(implode(', ', array_keys($app)));


            $app['clientsecret'] = $clientSecret; //$clientSecret;
            $app['authorizeurl'] = $ssoURI . '/realms/standard/protocol/openid-connect/auth';
            $app['accesstokenurl'] = $ssoURI . '/realms/standard/protocol/openid-connect/token';
            $app['redirecturi'] = $siteURL;
            $appslist['keycloak'] = $app;
            update_option('mo_oauth_apps_list', $appslist);

            WP_CLI::success('Miniorange settings reconfigured!');
        }
    }

    class Cleanbcdx_fix_mo extends WP_CLI_Command
    {
        public function __invoke($args)
        {

            //Turn off the new setting (6.26.4+) to enforce email_verified that breaks IDIR login as IDIR provider does not provide that field=1
            WP_CLI::log('Checking "Allow login to Verified IDP Account" setting.');
            $mo_oauth_email_verify_config = get_option( 'mo_oauth_login_settings_option' );
            if($mo_oauth_email_verify_config && isset($mo_oauth_email_verify_config['mo_oauth_email_verify_check']) && $mo_oauth_email_verify_config['mo_oauth_email_verify_check'] != ''){
                $mo_oauth_email_verify_config['mo_oauth_email_verify_check'] = '';
                update_option( 'mo_oauth_login_settings_option', $mo_oauth_email_verify_config );

                WP_CLI::log('Disabled setting.');

            }else{
                WP_CLI::log('Setting already disabled');
            }


            WP_CLI::success('Miniorange reconfigured!');
        }
    }


    WP_CLI::add_command('cleanbcdx-config-mo', 'Cleanbcdx_config_mo');
    WP_CLI::add_command('cleanbcdx-fix-mo', 'Cleanbcdx_fix_mo');
}