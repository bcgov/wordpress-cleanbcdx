<?php

/**
 * Plugin Name: CLEANBCDX - miscellaneous
 * Description: Miscellaneous features for managing from GithubActions on OpenShift; CLI Keycloak SSO/Miniorange adjuster.
 * Version: 1.2.7
 * Author: CleanBC DX
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Plugin URI: https://github.com/bcgov/wordpress-cleanbcdx/tree/main/cleanbcdx-misc
 * Update URI: https://raw.githubusercontent.com/bcgov/wordpress-cleanbcdx/main/cleanbcdx-misc/index.php
 */

/* 
Changelog

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
