<?php

namespace Bcgov\Plugin\CleanBCDX\Hooks;

/**
 * Sets up basic php template blocks for CleanBC
 *
 * @since 1.5.0
 *
 * @package Bcgov\Plugin\BasicBlocks
 */
class BasicBlocks {


    /**
     * Constructor.
     */
    public function __construct() {
        $this->init();
    }

    /**
     * Sets up hooks for Blocks.
     *
     * @return void
     */
    public function init() {
        add_action( 'init', [ $this, 'register_blocks' ] );
        add_action( 'wp_loaded', [ $this, 'register_custom_incentive_page_pattern' ] );
        add_action( 'wp_loaded', [ $this, 'register_custom_rebates_page_pattern' ] );
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_scripts' ], 10 );
    }


    /**
     * Register the stylesheets and JavaScript for the admin area.
     *
     * @since 1.5.0
     */
    public function enqueue_admin_scripts() {
        wp_enqueue_script( 'cleanbc-admin' );

        /**
         * Safely extract and sanitize query parameters.
         *
         * Note: This is read-only, used solely for populating UI filters.
         * No privileged actions or sensitive data are processed.
         */
        $current_query = [];

        // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( ! empty( $_GET ) ) {
            // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            foreach ( $_GET as $key => $value ) {
                // Skip any unexpected keys just to be cautious (optional hardening).
                if ( str_starts_with( $key, '_' ) ) {
                    continue;
                }

                $current_query[ sanitize_key( $key ) ] = is_array( $value )
                    ? array_map( 'sanitize_text_field', $value )
                    : [ sanitize_text_field( $value ) ];
            }
        }

        wp_localize_script(
            'cleanbc-admin',
            'queryFilterBlockData',
            [
                'query' => $current_query,
                'nonce' => wp_create_nonce( 'wp_rest' ), // For authenticated REST API usage.
            ]
        );
    }

    /**
     * Helper function to check if the block render call is coming from Gutenburg or the website.
     *
     * @return bool $is_gb_editor
     */
    private function check_is_gb_editor() {
        $is_gb_editor = defined( 'REST_REQUEST' ) && true === REST_REQUEST && ! empty( $_REQUEST['context'] ) && 'edit' === filter_input( INPUT_GET, 'context', FILTER_SANITIZE_SPECIAL_CHARS ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        return $is_gb_editor;
    }


    /**
     * Registers blocks and callbacks for dynamic blocks.
     *
     * @return void
     */
    public function register_blocks(): void {
        $plugin_dir = \Bcgov\Plugin\CleanBCDX\Setup::get_plugin_dir();

        // Path to block.json folders.
        $multiquery_block_dir            = $plugin_dir . 'scripts/blocks/multi-query';
        $queryconditionalgroup_block_dir = $plugin_dir . 'scripts/blocks/query-conditional-group';
        $queryfilter_block_dir           = $plugin_dir . 'scripts/blocks/query-filter-block';

        $this->register_query_block_assets();

        register_block_type_from_metadata(
            $multiquery_block_dir,
            [
                'editor_script_handles' => [ 'cleanbc-admin' ],
                'view_script_handles'   => [ 'cleanbc-multi-query-frontend' ],
                'render_callback'       => [ $this, 'render_multi_query_block' ],
            ]
        );
        register_block_type_from_metadata(
            $queryconditionalgroup_block_dir,
            [
                'editor_script_handles' => [ 'cleanbc-admin' ],
                'view_script_handles'   => [ 'cleanbc-query-conditional-group-frontend' ],
                'render_callback'       => [ $this, 'render_query_conditional_group' ],
            ]
        );
        register_block_type_from_metadata(
            $queryfilter_block_dir,
            [
                'editor_script_handles' => [ 'cleanbc-admin' ],
                'editor_style_handles'  => [ 'cleanbc-query-filter-editor' ],
                'view_script_handles'   => [ 'cleanbc-query-filter-frontend' ],
                'render_callback'       => [ $this, 'render_query_filter_block' ],
            ]
        );
    }

    /**
     * Register the shared editor bundle and per-block frontend assets.
     *
     * @return void
     */
    private function register_query_block_assets(): void {
        $plugin_dir = \Bcgov\Plugin\CleanBCDX\Setup::get_plugin_dir();
        $plugin_url = \Bcgov\Plugin\CleanBCDX\Setup::get_plugin_url();
        $asset_info = \Bcgov\Plugin\CleanBCDX\Setup::get_asset_information( 'admin', 'dist-basic' );
        $asset_deps = array_merge( $asset_info['dependencies'], [ 'wp-api-fetch' ] );
        $asset_ver  = $asset_info['version'] ?? \Bcgov\Plugin\CleanBCDX\Setup::get_plugin_version();

        wp_register_script(
            'cleanbc-admin',
            $asset_info['dist_url'] . 'admin.js',
            $asset_info['dependencies'],
            $asset_ver,
            true
        );

        wp_register_script(
            'cleanbc-multi-query-frontend',
            $plugin_url . 'scripts/blocks/multi-query/frontend.js',
            [],
            filemtime( $plugin_dir . 'scripts/blocks/multi-query/frontend.js' ),
            true
        );

        wp_register_script(
            'cleanbc-query-conditional-group-frontend',
            $plugin_url . 'scripts/blocks/query-conditional-group/frontend.js',
            [],
            filemtime( $plugin_dir . 'scripts/blocks/query-conditional-group/frontend.js' ),
            true
        );

        wp_register_script(
            'cleanbc-query-filter-frontend',
            $plugin_url . 'scripts/blocks/query-filter-block/frontend.js',
            $asset_deps,
            filemtime( $plugin_dir . 'scripts/blocks/query-filter-block/frontend.js' ),
            true
        );

        wp_register_style(
            'cleanbc-query-filter-editor',
            $plugin_url . 'scripts/blocks/query-filter-block/editor.css',
            [],
            filemtime( $plugin_dir . 'scripts/blocks/query-filter-block/editor.css' )
        );
    }



    /**
     * Render callback for the multi-query block.
     *
     * @param array $attributes Block attributes.
     * @return string Rendered HTML output.
     */
	public function render_multi_query_block( $attributes ) {
		$placeholder            = $attributes['placeholderText'] ?? '';
		$fallback               = $attributes['fallbackText'] ?? '';
		$keys                   = $attributes['paramKeys'] ?? [];
		$combinations           = $attributes['combinations'] ?? [];
		$use_or                 = $attributes['useOrLogic'] ?? false;
		$alignment              = $attributes['alignment'] ?? 'left';
		$use_param_value_direct = $attributes['useParamValueDirect'] ?? false;

		// Collect current query param values.
		$current = [];
		foreach ( $keys as $key ) {
			$current[ $key ] = sanitize_text_field( filter_input( INPUT_GET, $key ) ?? '' );
		}

		$rendered = $placeholder;

		/**
		 * Helper to evaluate a single rule.
		 */
		$evaluate_rule = static function ( $operator, $required, $actual ) {
			switch ( $operator ) {
				case 'equals':
					return $actual === $required;
				case 'notEquals':
					return $actual !== $required;
				case 'contains':
					return str_contains( (string) $actual, (string) $required );
                case 'notContains':
					return ! str_contains( (string) $actual, (string) $required );
				case 'startsWith':
					return str_starts_with( (string) $actual, (string) $required );
				case 'endsWith':
					return str_ends_with( (string) $actual, (string) $required );
				case 'exists':
					return '' !== (string) $actual;
				case 'notExists':
					return '' === (string) $actual;
				default:
					return false;
			}
		};

		if ( $use_param_value_direct ) {
			// Regex match all placeholders like {{value}}, {{value_2}}, etc.
			preg_match_all( '/{{\s*value(?:_(\d+))?\s*}}/', $placeholder, $matches, PREG_SET_ORDER );

			$all_present = true;
			foreach ( $matches as $match ) {
				$index = isset( $match[1] ) ? intval( $match[1] ) - 1 : 0;
				$key   = $keys[ $index ] ?? null;

				if ( ! $key || '' === $current[ $key ] ) {
					$all_present = false;
					break;
				}
			}

			if ( $all_present ) {
				foreach ( $matches as $match ) {
					$index       = isset( $match[1] ) ? intval( $match[1] ) - 1 : 0;
					$key         = $keys[ $index ] ?? null;
					$value       = $key ? esc_html( $current[ $key ] ) : '';
					$token       = $match[0];
					$span_name   = 0 === $index ? 'value' : 'value_' . ( $index + 1 );
					$replacement = sprintf(
                        '<span data-replace="%s">%s</span>',
                        esc_attr( $span_name ),
                        $value
					);
					$rendered    = str_replace( $token, $replacement, $rendered );
				}
			} else {
				$rendered = '' !== $fallback ? esc_html( $fallback ) : 'No fallback text provided.';
			}
		} else {
			// Evaluate combination logic with per-key operators.
			$match_value = null;

			foreach ( $combinations as $combo ) {
				$evaluations = [];

				foreach ( $keys as $key ) {
					if ( ! array_key_exists( $key, $combo ) ) {
						$evaluations[] = false;
						continue;
					}

					$rule = $combo[ $key ];

					// Backward compatibility: pre-operator blocks used raw strings.
					if ( ! is_array( $rule ) ) {
						$rule = [
							'value'    => (string) $rule,
							'operator' => 'equals',
						];
					}

					$required      = (string) ( $rule['value'] ?? '' );
					$operator      = (string) ( $rule['operator'] ?? 'equals' );
					$actual        = (string) ( $current[ $key ] ?? '' );
					$evaluations[] = $evaluate_rule( $operator, $required, $actual );
				}

				$is_match = $use_or
                ? in_array( true, $evaluations, true )
                : ! in_array( false, $evaluations, true );

				if ( $is_match && isset( $combo['value'] ) ) {
					$match_value = $combo['value'];
					break;
				}
			}

			if ( null !== $match_value && '' !== $match_value ) {
				$rendered = str_replace(
                    '{{value}}',
                    sprintf(
                        '<span data-replace="value">%s</span>',
                        esc_html( $match_value )
                    ),
                    $placeholder
				);
			} else {
				$rendered = '' !== $fallback ? esc_html( $fallback ) : 'No fallback text provided.';
			}
		}

		// Add data-key/data-value attributes for possible JS use.
		$wrapper_data_attrs = [];
		foreach ( $keys as $i => $key ) {
			$index                                       = $i + 1;
			$wrapper_data_attrs[ "data-key-{$index}" ]   = esc_attr( $key );
			$wrapper_data_attrs[ "data-value-{$index}" ] = esc_attr( $current[ $key ] ?? '' );
		}

		// Add dynamic evaluation metadata.
		$wrapper_data_attrs['data-use-param-direct'] = $use_param_value_direct ? 'true' : 'false';
		$wrapper_data_attrs['data-combinations']     = esc_attr( wp_json_encode( $combinations ) );
		$wrapper_data_attrs['data-use-or']           = $use_or ? 'true' : 'false';
		$wrapper_data_attrs['data-fallback']         = esc_attr( $fallback );

		$wrapper_attrs = get_block_wrapper_attributes(
            array_merge(
                [
					'class' => 'multi-query-content-block',
					'style' => 'text-align:' . esc_attr( $alignment ),
                ],
                $wrapper_data_attrs
            )
		);

		return sprintf(
            '<div %s>%s</div>',
            $wrapper_attrs,
            wp_kses_post( $rendered )
		);
	}



    /**
     * Render the Query Conditional Group block.
     *
     * @param array  $attributes Block attributes.
     * @param string $content    Block inner content.
     *
     * @return string HTML content or empty string.
     */
    public function render_query_conditional_group( $attributes, $content ) {
		// Verify nonce to prevent tampering.
		if ( isset( $_GET['_nonce'] ) && ! wp_verify_nonce( $_GET['_nonce'], 'query_conditional_group_nonce' ) ) {
			return '';
		}

		$case_sensitive = ! empty( $attributes['caseSensitive'] );
		$client_side    = ! empty( $attributes['clientSideCheck'] );
		$hide_until_js  = ! empty( $attributes['hideUntilJs'] );

		$params = $_GET;

		// New grouped model (preferred if present).
		$groups        = isset( $attributes['groups'] ) && is_array( $attributes['groups'] ) ? $attributes['groups'] : [];
		$group_logic   = isset( $attributes['groupLogic'] ) ? $attributes['groupLogic'] : 'OR';
		$invert_groups = ! empty( $attributes['invertGroups'] );

		$has_groups = ! empty( $groups );

		if ( $has_groups ) {
			$matches = $this->query_conditional_group_evaluate_groups( $groups, $params, $group_logic, $invert_groups, $case_sensitive );
		} else {
			// Legacy fallback.
			$rules  = isset( $attributes['rules'] ) ? $attributes['rules'] : [];
			$logic  = isset( $attributes['logic'] ) ? $attributes['logic'] : 'AND';
			$invert = ! empty( $attributes['invert'] );

			$matches = $this->query_conditional_group_evaluate_rules( $rules, $params, $logic, $case_sensitive );
			if ( $invert ) {
				$matches = ! $matches;
			}
		}

		if ( ! $matches && ! $client_side ) {
			return '';
		}

		$wrapper_attrs = get_block_wrapper_attributes(
            [
				'class'              => 'query-conditional-group-block',
				'data-groups'        => $has_groups ? esc_attr( wp_json_encode( $groups ) ) : null,
				'data-group-logic'   => $has_groups ? esc_attr( $group_logic ) : null,
				'data-invert-groups' => $has_groups ? ( $invert_groups ? 'true' : 'false' ) : null,
				'data-rules'         => esc_attr( wp_json_encode( $has_groups ? [] : ( $attributes['rules'] ?? [] ) ) ),
				'data-logic'         => esc_attr( $attributes['logic'] ?? 'AND' ),
				'data-invert'        => ! empty( $attributes['invert'] ) ? 'true' : 'false',
				'data-case'          => $case_sensitive ? 'true' : 'false',
				'style'              => ( $client_side && $hide_until_js ) ? 'display:none;' : '',
            ]
		);

		return sprintf( '<div %1$s>%2$s</div>', $wrapper_attrs, $content );
	}


    /**
     * Render the Query Filter block.
     *
     * Outputs a placeholder div and localizes the current query string
     * values to be available to frontend JavaScript for hydration.
     *
     * @param array $attributes Block attributes.
     *
     * @return string HTML content for frontend rendering.
     */
    public function render_query_filter_block( $attributes ) {
        $taxonomy = sanitize_key( $attributes['selectedTaxonomy'] ?? '' );
        $label    = sanitize_text_field( $attributes['label'] ?? 'Filter' );

        if ( empty( $taxonomy ) ) {
            return '<div class="query-filter-block error">No taxonomy selected for filter block.</div>';
        }

        $current_query = [];
        // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only access to $_GET is safe in this context.
        foreach ( $_GET as $key => $value ) {
            if ( str_starts_with( $key, '_' ) ) {
                continue;
            }

            $current_query[ sanitize_key( $key ) ] = is_array( $value )
                ? array_map( 'sanitize_text_field', $value )
                : [ sanitize_text_field( $value ) ];
        }

        $wrapper_attributes = get_block_wrapper_attributes(
            [
                'class' => 'query-filter-block',
            ]
        );

        return sprintf(
            '<div %s data-taxonomy="%s" data-label="%s" data-query=\'%s\'>Loading filters…</div>',
            $wrapper_attributes,
            esc_attr( $taxonomy ),
            esc_attr( $label ),
            esc_js( wp_json_encode( $current_query ) )
        );
    }


    /**
     * Evaluate grouped conditional rules against query parameters.
     *
     * @param array  $groups         Array of groups (each with rules, logic, invert).
     * @param array  $params         $_GET parameters.
     * @param string $group_logic    'AND' or 'OR' between groups.
     * @param bool   $invert_groups  Whether to invert final group result.
     * @param bool   $global_case    Whether comparisons are case sensitive.
     *
     * @return bool Whether the grouped rules match the params.
     */
    private function query_conditional_group_evaluate_groups( $groups, $params, $group_logic = 'OR', $invert_groups = false, $global_case = false ) {
        if ( empty( $groups ) || ! is_array( $groups ) ) {
            return false;
        }

        $group_results = array_map(
            function ( $group ) use ( $params, $global_case ) {
                $rules  = isset( $group['rules'] ) && is_array( $group['rules'] ) ? $group['rules'] : [];
                $logic  = isset( $group['logic'] ) ? $group['logic'] : 'AND';
                $invert = ! empty( $group['invert'] );

                $matches = $this->query_conditional_group_evaluate_rules( $rules, $params, $logic, $global_case );

                if ( $invert ) {
                    $matches = ! $matches;
                }

                return $matches;
            },
            $groups
        );

        $matches = ( 'AND' === $group_logic )
            ? ! in_array( false, $group_results, true )
            : in_array( true, $group_results, true );

        if ( $invert_groups ) {
            $matches = ! $matches;
        }

        return $matches;
    }


	/**
	 * Evaluate conditional rules against query parameters.
	 *
	 * @param array  $rules        Rules to evaluate.
	 * @param array  $params       $_GET parameters.
	 * @param string $logic        'AND' or 'OR'.
	 * @param bool   $global_case  Whether comparisons are case sensitive.
	 *
	 * @return bool Whether the rules match the params.
	 */
	private function query_conditional_group_evaluate_rules( $rules, $params, $logic = 'AND', $global_case = false ) {
		if ( empty( $rules ) ) { return false;
		}

		$to_array        = static function ( $v ) {
			if ( is_array( $v ) ) { return $v;
			}
			if ( null === $v || '' === $v ) { return array();
			}
			return array( $v );
		};
		$split_csv       = static function ( $s ) {
			if ( ! is_string( $s ) ) { return array();
			}
			$parts = array_map( 'trim', explode( ',', $s ) );
			return array_values( array_filter( $parts, fn( $x ) => '' !== $x ) );
		};
		$norm_array_case = static function ( array $arr, $case_sensitive ) {
			if ( $case_sensitive ) { return $arr;
			}
			return array_map( static fn( $v ) => is_string( $v ) ? strtolower( $v ) : $v, $arr );
		};

		$results = array_map(
            function ( $rule ) use ( $params, $global_case, $to_array, $split_csv, $norm_array_case ) {
                $key      = $rule['key'] ?? '';
                $operator = $rule['operator'] ?? 'equals';
                if ( 'oneOf' === $operator ) {  $operator = 'in';
                }
                if ( 'noneOf' === $operator ) { $operator = 'notIn';
                }

                $case_sensitive = array_key_exists( 'caseSensitive', $rule ) ? (bool) $rule['caseSensitive'] : (bool) $global_case;

                $param_values = $norm_array_case( $to_array( $params[ $key ] ?? null ), $case_sensitive );

                // Single.
                $value = $rule['value'] ?? '';
                if ( ! $case_sensitive && is_string( $value ) ) { $value = strtolower( $value );
                }

                // Multi (prefer values, else CSV from value/valueCSV).
                $values = array();
                if ( ! empty( $rule['values'] ) && is_array( $rule['values'] ) ) {
                    $values = $rule['values'];
                } else {
                    $values = $split_csv( $rule['valueCSV'] ?? ( $rule['value'] ?? '' ) );
                }
                $values = $norm_array_case( $values, $case_sensitive );

                switch ( $operator ) {
                    case 'equals':
                        foreach ( $param_values as $p ) { if ( $p === $value ) { return true;
                        }
                        }
                        return false;

                    case 'notEquals':
                        if ( empty( $param_values ) ) { return true;
                        }
                        foreach ( $param_values as $p ) { if ( $p === $value ) { return false;
                        }
                        }
                        return true;

                    case 'contains':
                        foreach ( $param_values as $p ) {
                            if ( is_string( $p ) && is_string( $value ) && str_contains( $p, $value ) ) { return true;
                            }
                        }
                        return false;

                    case 'startsWith':
                        foreach ( $param_values as $p ) {
                            if ( is_string( $p ) && is_string( $value ) && str_starts_with( $p, $value ) ) { return true;
                            }
                        }
                        return false;

                    case 'endsWith':
                        foreach ( $param_values as $p ) {
                            if ( is_string( $p ) && is_string( $value ) && str_ends_with( $p, $value ) ) { return true;
                            }
                        }
                        return false;

                    case 'regex':
						if ( empty( $param_values ) || ! is_string( $value ) ) {
							return false;
						}

						foreach ( $param_values as $p ) {
							if ( ! is_string( $p ) ) {
								continue;
							}

							$result = preg_match( $value, $p );

							if ( false === $result ) {
								// Invalid pattern: treat as non-match.
								break;
							}

							if ( 1 === $result ) {
								return true;
							}
						}

                        return false;

                    case 'exists':
                        return array_key_exists( $key, $params );

                    case 'notExists':
                        return ! array_key_exists( $key, $params );

                    case 'in': // equals any.
                        if ( empty( $values ) ) { return false;
                        }
                        foreach ( $param_values as $p ) { if ( in_array( $p, $values, true ) ) { return true;
                        }
                        }
                        return false;

                    case 'notIn': // not equal to any.
                        if ( empty( $values ) ) { return true;
                        }
                        if ( empty( $param_values ) ) { return true;
                        }
                        foreach ( $param_values as $p ) { if ( in_array( $p, $values, true ) ) { return false;
                        }
                        }
                        return true;

                    case 'containsAny':
                        if ( empty( $values ) ) { return false;
                        }
                        foreach ( $param_values as $p ) {
							foreach ( $values as $v ) {
								if ( is_string( $p ) && is_string( $v ) && str_contains( $p, $v ) ) { return true;
								}
							}
						}
                        return false;

                    case 'containsAll':
                        if ( empty( $values ) ) { return false;
                        }
                        foreach ( $values as $v ) {
                            $found = false;
                            foreach ( $param_values as $p ) {
                                if ( is_string( $p ) && is_string( $v ) && str_contains( $p, $v ) ) { $found = true;
                                    break; }
                            }
                            if ( ! $found ) { return false;
                            }
                        }
                        return true;

                    default:
                        return false;
                }
            },
            $rules
		);

		return ( 'OR' === $logic )
        ? in_array( true, $results, true )
        : ! in_array( false, $results, true );
	}



    /**
     * Register custom block pattern for Single Incentive (aka rebates) page.
     * Incentive page pattern includes general information to facilitate easier inclusion and more consistent editing of Program Contact Information and Other links.
     *
     * @since 1.11.0
     */
    public function register_custom_incentive_page_pattern() {

        $pattern_content = '<!-- wp:group {"metadata":{"name":"Incentive Page Container"},"align":"full","style":{"spacing":{"padding":{"top":"2rem","bottom":"4rem","left":"2rem","right":"2rem"}}},"layout":{"type":"constrained"}} -->
        <div class="wp-block-group alignfull" style="padding-top:2rem;padding-right:2rem;padding-bottom:4rem;padding-left:2rem"><!-- wp:group {"align":"wide","layout":{"type":"default"}} -->
        <div class="wp-block-group alignwide"><!-- wp:columns -->
        <div class="wp-block-columns"><!-- wp:column {"width":"25%","className":"sticky-side-nav","style":{"elements":{"link":{"color":{"text":"var:preset|color|primary-brand"}}}},"textColor":"primary-brand"} -->
        <div class="wp-block-column sticky-side-nav has-primary-brand-color has-text-color has-link-color" style="flex-basis:25%"><!-- wp:group {"tagName":"aside","layout":{"type":"constrained"}} -->
        <aside id="side-nav-container" class="wp-block-group"><!-- wp:paragraph {"style":{"spacing":{"padding":{"right":"1.15rem","left":"1.15rem","top":"0.5rem","bottom":"0rem"}},"elements":{"link":{"color":{"text":"var:preset|color|tertiary"}}},"typography":{"fontSize":"1.5rem"}},"textColor":"tertiary"} -->
        <p class="has-tertiary-color has-text-color has-link-color" style="padding-top:0.5rem;padding-right:1.15rem;padding-bottom:0rem;padding-left:1.15rem;font-size:1.5rem"><strong>On this page</strong></p>
        <!-- /wp:paragraph -->

        <!-- wp:group {"className":"admin-instructions","layout":{"type":"constrained"}} -->
        <div id="incentive-side-nav" class="wp-block-group admin-instructions"><!-- wp:group {"className":"instructions","style":{"border":{"width":"2px"}},"backgroundColor":"custom-info-bg","borderColor":"custom-info-border","layout":{"type":"constrained"}} -->
        <div class="wp-block-group instructions has-border-color has-custom-info-border-border-color has-custom-info-bg-background-color has-background" style="border-width:2px"><!-- wp:paragraph {"className":"admin-warning","style":{"typography":{"fontSize":"1rem"}}} -->
        <p class="admin-warning" style="font-size:1rem"><strong>Do not edit</strong> – <strong>the in-page navigation menu is generated here.</strong> </p>
        <!-- /wp:paragraph -->

        <!-- wp:paragraph {"className":"admin-warning","style":{"typography":{"fontSize":"1rem"}}} -->
        <p class="admin-warning" style="font-size:1rem">Adding (or removing) H2 headings to the body of the page will create this menu when the page is viewed. The heading must have a unique <strong>HTML anchor</strong> – found under the <strong>Advanced</strong> section in the Heading Block Inspector.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group --></aside>
        <!-- /wp:group --></div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"75%"} -->
        <div class="wp-block-column" style="flex-basis:75%" id="incentive-details-container"><!-- wp:post-title {"level":1,"align":"wide","style":{"spacing":{"margin":{"bottom":"3rem"}},"elements":{"link":{"color":{"text":"var:preset|color|tertiary"}}}},"textColor":"tertiary"} /-->

        <!-- wp:group {"align":"wide","layout":{"type":"default"}} -->
        <div class="wp-block-group alignwide"><!-- wp:columns -->
        <div class="wp-block-columns"><!-- wp:column -->
        <div class="wp-block-column"><!-- wp:paragraph -->
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column"><!-- wp:post-featured-image {"aspectRatio":"4/3","align":"center"} /--></div>
        <!-- /wp:column --></div>
        <!-- /wp:columns -->

        <!-- wp:group {"style":{"spacing":{"padding":{"right":"2rem","left":"2rem","top":"1rem","bottom":"1rem"}},"border":{"width":"1px","color":"#aca6a2","radius":"1rem"}},"backgroundColor":"transparent","layout":{"type":"default"}} -->
        <div class="wp-block-group has-border-color has-transparent-background-color has-background" style="border-color:#aca6a2;border-width:1px;border-radius:1rem;padding-top:1rem;padding-right:2rem;padding-bottom:1rem;padding-left:2rem"><!-- wp:heading {"align":"wide","className":"is-style-default"} -->
        <h2 class="wp-block-heading alignwide is-style-default" id="available">Available Incentives</h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</p>
        <!-- /wp:paragraph -->

        <!-- wp:table {"className":"is-style-stripes"} -->
        <figure class="wp-block-table is-style-stripes"><table class="has-fixed-layout"><tbody><tr><td><strong>Incentive type</strong></td><td><strong>Incentive</strong> amount</td></tr><tr><td>Type A</td><td>$1,000 </td></tr><tr><td>Type B</td><td>$2,000 </td></tr></tbody></table></figure>
        <!-- /wp:table -->

        <!-- wp:group {"metadata":{"name":"Warning alert","categories":[],"patternName":"core/block/9387"},"className":"warning has-icon","style":{"border":{"radius":"0.5rem","width":"2px"},"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"},"margin":{"top":"1rem","bottom":"1rem"}}},"backgroundColor":"custom-warning-bg","borderColor":"custom-warning-border","layout":{"type":"default"}} -->
        <div class="wp-block-group warning has-icon has-border-color has-custom-warning-border-border-color has-custom-warning-bg-background-color has-background" style="border-width:2px;border-radius:0.5rem;margin-top:1rem;margin-bottom:1rem;padding-top:0.5rem;padding-right:1rem;padding-bottom:0.5rem;padding-left:1rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0rem","bottom":"0rem"},"margin":{"top":"0.25rem","bottom":"0.25rem"}}}} -->
        <p style="margin-top:0.25rem;margin-bottom:0.25rem;padding-top:0rem;padding-bottom:0rem">This is a warning alert. Modify or delete as needed.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group -->

        <!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="eligibility" style="margin-top:2rem">Eligibility Requirements</h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="upgrade" style="margin-top:2rem">Upgrade Requirements</h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="apply" style="margin-top:2rem">How to Apply</h2>
        <!-- /wp:heading -->

        <!-- wp:list {"ordered":true} -->
        <ol class="wp-block-list"><!-- wp:list-item -->
        <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
        <!-- /wp:list-item --></ol>
        <!-- /wp:list -->

        <!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="dealines" style="margin-top:2rem">Deadlines</h2>
        <!-- /wp:heading -->

        <!-- wp:list -->
        <ul class="wp-block-list"><!-- wp:list-item -->
        <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
        <!-- /wp:list-item --></ul>
        <!-- /wp:list -->

        <!-- wp:group {"metadata":{"name":"Info alert","categories":[],"patternName":"core/block/9382"},"className":"info has-icon","style":{"border":{"radius":"0.5rem","width":"2px"},"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"},"margin":{"top":"1rem","bottom":"1rem"}}},"backgroundColor":"custom-info-bg","borderColor":"custom-info-border","layout":{"type":"default"}} -->
        <div class="wp-block-group info has-icon has-border-color has-custom-info-border-border-color has-custom-info-bg-background-color has-background" style="border-width:2px;border-radius:0.5rem;margin-top:1rem;margin-bottom:1rem;padding-top:0.5rem;padding-right:1rem;padding-bottom:0.5rem;padding-left:1rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0rem","bottom":"0rem"},"margin":{"top":"0.25rem","bottom":"0.25rem"}}}} -->
        <p style="margin-top:0.25rem;margin-bottom:0.25rem;padding-top:0rem;padding-bottom:0rem">This is an info alert. Modify or delete as needed.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group -->

        <!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="other" style="margin-top:2rem">Other</h2>
        <!-- /wp:heading -->

        <!-- wp:group {"metadata":{"name":"Error alert","categories":[],"patternName":"core/block/9392"},"className":"error has-icon admin-instructions","style":{"border":{"width":"2px","color":"#d23b3740","radius":"0.5rem"},"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"},"margin":{"top":"1rem","bottom":"1rem"}}},"backgroundColor":"custom-error-bg","layout":{"type":"default"}} -->
        <div class="wp-block-group error has-icon admin-instructions has-border-color has-custom-error-bg-background-color has-background" style="border-color:#d23b3740;border-width:2px;border-radius:0.5rem;margin-top:1rem;margin-bottom:1rem;padding-top:0.5rem;padding-right:1rem;padding-bottom:0.5rem;padding-left:1rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0rem","bottom":"0rem"},"margin":{"top":"0.25rem","bottom":"0.25rem"}}}} -->
        <p style="margin-top:0.25rem;margin-bottom:0.25rem;padding-top:0rem;padding-bottom:0rem"><strong>Instructions</strong>: Delete this instruction and update – and/or remove – the information below as needed</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group -->

        <!-- wp:list -->
        <ul class="wp-block-list"><!-- wp:list-item -->
        <li>Check out the&nbsp;<a href="https://www.fortisbc.com/rebates/home/free-home-energy-evaluation-and-upgrades" target="_blank" rel="noreferrer noopener">Energy Conservation Assistance Program</a>&nbsp;that can help income-qualified residents save energy with a free home energy evaluation, installation of energy-saving products and advice.</li>
        <!-- /wp:list-item -->

        <!-- wp:list-item -->
        <li>Check out our&nbsp;<a href="https://www.betterbuildingsbc.ca/incentive-search-tool/">incentive search tool</a>&nbsp;for other energy efficiency upgrades incentives.</li>
        <!-- /wp:list-item -->

        <!-- wp:list-item -->
        <li>Did you see a building science or energy efficiency term you did not understand? Check out our&nbsp;<a href="https://www.betterbuildingsbc.ca/glossary/">glossary</a>.</li>
        <!-- /wp:list-item -->

        <!-- wp:list-item -->
        <li>Learn more and apply for incentives by visiting&nbsp;<a href="https://www.fortisbc.com/Rebates/RebatesOffers/Pages/default.aspx?utm_source=offersbrochure&amp;utm_medium=print&amp;utm_campaign=cemcom&amp;utm_content=genrebates" target="_blank" rel="noreferrer noopener">FortisBC</a>.</li>
        <!-- /wp:list-item -->

        <!-- wp:list-item -->
        <li>By using, visiting, or browsing CleanBC and the Energy Coach service, you accept and agree to these&nbsp;<a href="https://www.betterbuildingsbc.ca/terms-and-conditions/">Terms of Use</a>.</li>
        <!-- /wp:list-item --></ul>
        <!-- /wp:list -->

        <!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="contact" style="margin-top:2rem">Program Contact Information</h2>
        <!-- /wp:heading -->

        <!-- wp:group {"metadata":{"name":"Contact options"},"layout":{"type":"default"}} -->
        <div class="wp-block-group"><!-- wp:group {"metadata":{"name":"Error alert","categories":[],"patternName":"core/block/9392"},"className":"error has-icon admin-instructions","style":{"border":{"width":"2px","color":"#d23b3740","radius":"0.5rem"},"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"},"margin":{"top":"1rem","bottom":"1rem"}}},"backgroundColor":"custom-error-bg","layout":{"type":"default"}} -->
        <div class="wp-block-group error has-icon admin-instructions has-border-color has-custom-error-bg-background-color has-background" style="border-color:#d23b3740;border-width:2px;border-radius:0.5rem;margin-top:1rem;margin-bottom:1rem;padding-top:0.5rem;padding-right:1rem;padding-bottom:0.5rem;padding-left:1rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0rem","bottom":"0rem"},"margin":{"top":"0.25rem","bottom":"0.25rem"}}}} -->
        <p style="margin-top:0.25rem;margin-bottom:0.25rem;padding-top:0rem;padding-bottom:0rem"><strong>Instructions</strong>: Delete this instruction and update – and/or remove – the information below as needed</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group -->

        <!-- wp:group {"metadata":{"name":"CleanBC"},"style":{"spacing":{"margin":{"top":"1rem","bottom":"1rem"}}},"layout":{"type":"default"}} -->
        <div class="wp-block-group" style="margin-top:1rem;margin-bottom:1rem"><!-- wp:paragraph -->
        <p>CleanBC Small Buildings Energy Coach&nbsp;<a href="mailto:smallbuildings@betterbuildingsbc.ca" target="_blank" rel="noreferrer noopener">smallbuildings@betterbuildingsbc.ca</a>.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group -->

        <!-- wp:group {"metadata":{"name":"BC Hydro"},"style":{"spacing":{"margin":{"top":"1rem","bottom":"1rem"}}},"layout":{"type":"default"}} -->
        <div class="wp-block-group" style="margin-top:1rem;margin-bottom:1rem"><!-- wp:paragraph -->
        <p>Contact your BC Hydro Key Account Manager or Energy Savings Business Help Desk.</p>
        <!-- /wp:paragraph -->

        <!-- wp:paragraph -->
        <p>BC Hydro Energy Savings Business Help Desk&nbsp;<a href="mailto:incentives@bchydro.com" target="_blank" rel="noreferrer noopener">incentives@bchydro.com</a>&nbsp;<a href="tel:+18665224713" title="">1-866-522-4713</a> Lower Mainland&nbsp;<a href="tel:+16045224713" title="">604-522-4713</a>.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group -->

        <!-- wp:group {"metadata":{"name":"CMHC"},"style":{"spacing":{"margin":{"top":"1rem","bottom":"1rem"}}},"layout":{"type":"default"}} -->
        <div class="wp-block-group" style="margin-top:1rem;margin-bottom:1rem"><!-- wp:paragraph -->
        <p>CMHC Contact Centre&nbsp;<a href="mailto:contactcentre@cmhc.ca" target="_blank" rel="noreferrer noopener">contactcentre@cmhc.ca</a>&nbsp;<a href="tel:604-737-4035">604-737-4035</a>.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group -->

        <!-- wp:group {"metadata":{"name":"Fortis"},"style":{"spacing":{"margin":{"top":"1rem","bottom":"1rem"}}},"layout":{"type":"default"}} -->
        <div class="wp-block-group" style="margin-top:1rem;margin-bottom:1rem"><!-- wp:paragraph -->
        <p>For further information, please contact your FortisBC&nbsp;<a href="https://www.fortisbc.com/services/commercial-industrial-services/account-managers-for-commercial-industrial-and-business-customers" target="_blank" rel="noreferrer noopener">electricity technical advisor</a>&nbsp;or via one of the contacts below.</p>
        <!-- /wp:paragraph -->

        <!-- wp:paragraph -->
        <p>FortisBC&nbsp;<a href="mailto:businessrebates@fortisbc.com" target="_blank" rel="noreferrer noopener">businessrebates@fortisbc.com</a>&nbsp;<a href="tel:+18558577411" title="">1-866-436-7847</a>.</p>
        <!-- /wp:paragraph -->

        <!-- wp:paragraph -->
        <p>FortisBC <a href="mailto:commercialrebates@fortisbc.com" target="_blank" rel="noreferrer noopener">commercialrebates@fortisbc.com</a> &nbsp;<a href="tel:+18558577411" title="">1-866-436-7847</a>.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group -->

        <!-- wp:group {"metadata":{"name":"Government of Canada"},"style":{"spacing":{"margin":{"top":"1rem","bottom":"1rem"}}},"layout":{"type":"default"}} -->
        <div class="wp-block-group" style="margin-top:1rem;margin-bottom:1rem"><!-- wp:paragraph -->
        <p>Government of Canada&nbsp;<a href="tel:+18009598287" title="">1-800-959-8287</a>.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group -->

        <!-- wp:group {"metadata":{"name":"PNG"},"style":{"spacing":{"margin":{"top":"1rem","bottom":"1rem"}}},"layout":{"type":"default"}} -->
        <div class="wp-block-group" style="margin-top:1rem;margin-bottom:1rem"><!-- wp:paragraph -->
        <p>Pacific Northern Gas&nbsp;<a href="mailto:savingenergy@png.ca" target="_blank" rel="noreferrer noopener">savingenergy@png.ca</a>&nbsp;<a href="tel:+18006672297" title="">1-800-667-2297</a>.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group --></div>
        <!-- /wp:column --></div>
        <!-- /wp:columns --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group -->';

        if ( post_type_exists( 'incentives' ) ) {
            register_block_pattern(
                'bcgov-plugin-cleanbcdx/single-incentive-page',
                [
                    'title'      => __( 'Single incentive page (Better Buildings)', 'bcgov-plugin-cleanbcdx' ),
                    'blockTypes' => [ 'core/post-content' ],
                    'content'    => $pattern_content,
                    'postTypes'  => [ 'incentives', 'rebates' ],
                    'categories' => [ 'featured' ],
                ]
            );
        }
    }

    /**
     * Register custom block pattern for Single Incentive (akak rebates) page.
     * Incentive page pattern includes general information to facilitate easier inclusion and more consistent editing of Program Contact Information and Other links.
     *
     * @since 1.11.0
     */
    public function register_custom_rebates_page_pattern() {

        $pattern_content = '<!-- wp:group {"metadata":{"name":"Rebate Page Container","categories":["bh-layout"],"patternName":"core/block/38852"},"align":"full","className":"v2-rebate-content","layout":{"type":"default"}} -->
        <div class="wp-block-group alignfull v2-rebate-content" id="v2-rebate-content"><!-- wp:group {"align":"wide","style":{"spacing":{"padding":{"right":"0","left":"0"}}},"layout":{"type":"default"}} -->
        <div class="wp-block-group alignwide" id="incentive-details-container" style="padding-right:0;padding-left:0"><!-- wp:columns -->
        <div class="wp-block-columns"><!-- wp:column {"width":"25%","className":"sticky-side-nav","style":{"elements":{"link":{"color":{"text":"var:preset|color|primary-brand"}}}},"textColor":"primary-brand"} -->
        <div class="wp-block-column sticky-side-nav has-primary-brand-color has-text-color has-link-color" style="flex-basis:25%"><!-- wp:group {"tagName":"aside","layout":{"type":"constrained"}} -->
        <aside id="side-nav-container" class="wp-block-group"><!-- wp:paragraph {"style":{"spacing":{"padding":{"right":"1.15rem","left":"1.15rem","top":"0.5rem","bottom":"1rem"}},"elements":{"link":{"color":{"text":"var:preset|color|tertiary"}}},"typography":{"fontSize":"1.5rem"}},"textColor":"tertiary"} -->
        <p class="has-tertiary-color has-text-color has-link-color" style="padding-top:0.5rem;padding-right:1.15rem;padding-bottom:1rem;padding-left:1.15rem;font-size:1.5rem"><strong>On this page</strong></p>
        <!-- /wp:paragraph -->

        <!-- wp:group {"className":"admin-instructions","layout":{"type":"constrained"}} -->
        <div id="incentive-side-nav" class="wp-block-group admin-instructions"><!-- wp:group {"className":"instructions","style":{"border":{"width":"2px"}},"backgroundColor":"custom-info-bg","borderColor":"custom-info-border","layout":{"type":"constrained"}} -->
        <div class="wp-block-group instructions has-border-color has-custom-info-border-border-color has-custom-info-bg-background-color has-background" style="border-width:2px"><!-- wp:paragraph {"className":"admin-warning","style":{"typography":{"fontSize":"1rem"}}} -->
        <p class="admin-warning" style="font-size:1rem"><strong>Do not edit</strong> – <strong>the in-page navigation menu is generated here.</strong> </p>
        <!-- /wp:paragraph -->

        <!-- wp:paragraph {"className":"admin-warning","style":{"typography":{"fontSize":"1rem"}}} -->
        <p class="admin-warning" style="font-size:1rem">Adding (or removing) H2 headings to the body of the page will create this menu when the page is viewed. The heading must have a unique <strong>HTML anchor</strong> – found under the <strong>Advanced</strong> section in the Heading Block Inspector.</p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group --></aside>
        <!-- /wp:group --></div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"75%"} -->
        <div class="wp-block-column" style="flex-basis:75%" id="rebate-details-container"><!-- wp:post-title {"level":1,"align":"wide","className":"hide-from-search","style":{"spacing":{"margin":{"bottom":"3rem","top":"0.5rem"}},"elements":{"link":{"color":{"text":"var:preset|color|tertiary"}}},"typography":{"fontSize":"2.25rem"}},"textColor":"tertiary"} /-->

        <!-- wp:group {"metadata":{"name":"Rebate content"},"align":"wide","layout":{"type":"default"}} -->
        <div class="wp-block-group alignwide"><!-- wp:columns {"metadata":{"name":"Rebate description"}} -->
        <div class="wp-block-columns"><!-- wp:column -->
        <div class="wp-block-column"><!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:column -->

        <!-- wp:column -->
        <div class="wp-block-column"><!-- wp:post-featured-image {"aspectRatio":"4/3","align":"center"} /--></div>
        <!-- /wp:column --></div>
        <!-- /wp:columns -->

        <!-- wp:group {"tagName":"section","metadata":{"name":"Overview"},"style":{"spacing":{"padding":{"right":"2rem","left":"2rem","top":"1rem","bottom":"1rem"},"margin":{"bottom":"3rem"}},"border":{"width":"1px","color":"#aca6a2","radius":"1rem"}},"backgroundColor":"transparent","layout":{"type":"default"}} -->
        <section id="overview" class="wp-block-group has-border-color has-transparent-background-color has-background" style="border-color:#aca6a2;border-width:1px;border-radius:1rem;margin-bottom:3rem;padding-top:1rem;padding-right:2rem;padding-bottom:1rem;padding-left:2rem"><!-- wp:heading {"align":"wide","className":"is-style-default"} -->
        <h2 class="wp-block-heading alignwide is-style-default" id="overview-headline">Overview</h2>
        <!-- /wp:heading -->

        <!-- wp:columns {"metadata":{"name":"Rebate amount"},"className":"item amount"} -->
        <div class="wp-block-columns item amount"><!-- wp:column {"width":"33.33%"} -->
        <div class="wp-block-column" style="flex-basis:33.33%"><!-- wp:heading {"level":3} -->
        <h3 class="wp-block-heading">Rebate amount:</h3>
        <!-- /wp:heading --></div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"66.66%"} -->
        <div class="wp-block-column" style="flex-basis:66.66%"><!-- wp:paragraph -->
        <p><strong>$500</strong></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:column --></div>
        <!-- /wp:columns -->

        <!-- wp:columns {"metadata":{"name":"Who can apply"}} -->
        <div class="wp-block-columns"><!-- wp:column {"width":"33.33%"} -->
        <div class="wp-block-column" style="flex-basis:33.33%"><!-- wp:heading {"level":3} -->
        <h3 class="wp-block-heading">Who can apply:</h3>
        <!-- /wp:heading --></div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"66.66%"} -->
        <div class="wp-block-column" style="flex-basis:66.66%"><!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:column --></div>
        <!-- /wp:columns -->

        <!-- wp:columns {"metadata":{"name":"Deadline"}} -->
        <div class="wp-block-columns"><!-- wp:column {"width":"33.33%"} -->
        <div class="wp-block-column" style="flex-basis:33.33%"><!-- wp:heading {"level":3} -->
        <h3 class="wp-block-heading">Deadline:</h3>
        <!-- /wp:heading --></div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"66.66%"} -->
        <div class="wp-block-column" style="flex-basis:66.66%"><!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:column --></div>
        <!-- /wp:columns -->

        <!-- wp:columns {"metadata":{"name":"Qualifying products"}} -->
        <div class="wp-block-columns"><!-- wp:column {"width":"33.33%"} -->
        <div class="wp-block-column" style="flex-basis:33.33%"><!-- wp:heading {"level":3} -->
        <h3 class="wp-block-heading">Qualifying products:</h3>
        <!-- /wp:heading --></div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"66.66%"} -->
        <div class="wp-block-column" style="flex-basis:66.66%"><!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:column --></div>
        <!-- /wp:columns -->

        <!-- wp:columns {"metadata":{"name":"Funding provided by"}} -->
        <div class="wp-block-columns"><!-- wp:column {"width":"33.33%"} -->
        <div class="wp-block-column" style="flex-basis:33.33%"><!-- wp:heading {"level":3} -->
        <h3 class="wp-block-heading">Funding provided by:</h3>
        <!-- /wp:heading --></div>
        <!-- /wp:column -->

        <!-- wp:column {"width":"66.66%"} -->
        <div class="wp-block-column" style="flex-basis:66.66%"><!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:column --></div>
        <!-- /wp:columns -->

        <!-- wp:group {"metadata":{"name":"Info alert"},"className":"info has-icon","style":{"border":{"radius":"0.5rem","width":"2px"},"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"},"margin":{"top":"1rem","bottom":"1rem"}}},"backgroundColor":"custom-info-bg","borderColor":"custom-info-border","layout":{"type":"default"}} -->
        <div class="wp-block-group info has-icon has-border-color has-custom-info-border-border-color has-custom-info-bg-background-color has-background" style="border-width:2px;border-radius:0.5rem;margin-top:1rem;margin-bottom:1rem;padding-top:0.5rem;padding-right:1rem;padding-bottom:0.5rem;padding-left:1rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem"}}},"fontSize":"extra-small"} -->
        <p class="has-extra-small-font-size" style="padding-top:0.5rem;padding-bottom:0.5rem"></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group -->

        <!-- wp:group {"metadata":{"name":"Warning alert"},"className":"warning has-icon","style":{"border":{"radius":"0.5rem","width":"2px"},"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"},"margin":{"top":"1rem","bottom":"1rem"}}},"backgroundColor":"custom-warning-bg","borderColor":"custom-warning-border","layout":{"type":"default"}} -->
        <div class="wp-block-group warning has-icon has-border-color has-custom-warning-border-border-color has-custom-warning-bg-background-color has-background" style="border-width:2px;border-radius:0.5rem;margin-top:1rem;margin-bottom:1rem;padding-top:0.5rem;padding-right:1rem;padding-bottom:0.5rem;padding-left:1rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem"}}},"fontSize":"extra-small"} -->
        <p class="has-extra-small-font-size" style="padding-top:0.5rem;padding-bottom:0.5rem"></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group --></section>
        <!-- /wp:group -->

        <!-- wp:group {"tagName":"section","metadata":{"name":"Rebate Amount"},"style":{"spacing":{"margin":{"bottom":"3rem"}}},"layout":{"type":"default"}} -->
        <section class="wp-block-group" style="margin-bottom:3rem"><!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="rebate-section" style="margin-top:2rem">Rebate amount</h2>
        <!-- /wp:heading -->

        <!-- wp:table {"className":"is-style-stripes","style":{"border":{"width":"1px"}},"borderColor":"quadenary"} -->
        <figure class="wp-block-table is-style-stripes"><table class="has-border-color has-quadenary-border-color has-fixed-layout" style="border-width:1px"><thead><tr><th class="has-text-align-left" data-align="left">Requirements</th><th class="has-text-align-left" data-align="left">Primary fuel before upgrade</th><th class="has-text-align-left" data-align="left">Rebate</th></tr></thead><tbody><tr><td class="has-text-align-left" data-align="left">description</td><td class="has-text-align-left" data-align="left">Fossil Fuel (oil, propane, or natural gas)</td><td class="has-text-align-left" data-align="left">$500</td></tr></tbody></table></figure>
        <!-- /wp:table -->

        <!-- wp:group {"metadata":{"name":"Info alert"},"className":"info has-icon","style":{"border":{"radius":"0.5rem","width":"2px"},"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"},"margin":{"top":"1rem","bottom":"1rem"}}},"backgroundColor":"custom-info-bg","borderColor":"custom-info-border","layout":{"type":"default"}} -->
        <div class="wp-block-group info has-icon has-border-color has-custom-info-border-border-color has-custom-info-bg-background-color has-background" style="border-width:2px;border-radius:0.5rem;margin-top:1rem;margin-bottom:1rem;padding-top:0.5rem;padding-right:1rem;padding-bottom:0.5rem;padding-left:1rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem"}}},"fontSize":"extra-small"} -->
        <p class="has-extra-small-font-size" style="padding-top:0.5rem;padding-bottom:0.5rem"></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group --></section>
        <!-- /wp:group -->

        <!-- wp:group {"tagName":"section","metadata":{"name":"Eligibility Requirements"},"style":{"spacing":{"margin":{"bottom":"3rem"}}},"layout":{"type":"default"}} -->
        <section class="wp-block-group" style="margin-bottom:3rem"><!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="eligibility-requirements" style="margin-top:2rem">Eligibility requirements</h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p>In order to qualify for this rebate,&nbsp;<strong>all</strong>&nbsp;of the following requirements must be met. Please read them carefully. Contact an Energy Coach if you have questions.</p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h3 class="wp-block-heading" style="margin-top:2rem">Income qualification requirements</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h3 class="wp-block-heading" style="margin-top:2rem">Requirements for the home</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h3 class="wp-block-heading" style="margin-top:2rem">Requirements for the installation</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h3 class="wp-block-heading" style="margin-top:2rem">Requirements for your contractor</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h3 class="wp-block-heading" style="margin-top:2rem">Requirements for the upgrade</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h3 class="wp-block-heading" style="margin-top:2rem">Requirements for the equipment being replaced</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph --></section>
        <!-- /wp:group -->

        <!-- wp:group {"tagName":"section","metadata":{"name":"Deadlines"},"style":{"spacing":{"margin":{"bottom":"3rem"}}},"layout":{"type":"default"}} -->
        <section class="wp-block-group" style="margin-bottom:3rem"><!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="deadlines" style="margin-top:2rem">Deadlines</h2>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph --></section>
        <!-- /wp:group -->

        <!-- wp:group {"tagName":"section","metadata":{"name":"How to Apply"},"style":{"spacing":{"margin":{"bottom":"3rem"}}},"layout":{"type":"default"}} -->
        <section class="wp-block-group" style="margin-bottom:3rem"><!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="howtoapply" style="margin-top:2rem">How to apply</h2>
        <!-- /wp:heading -->

        <!-- wp:heading {"level":3} -->
        <h3 class="wp-block-heading">Before you begin</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph -->

        <!-- wp:table {"className":"is-style-stripes","style":{"border":{"width":"1px"}},"borderColor":"quadenary"} -->
        <figure class="wp-block-table is-style-stripes"><table class="has-border-color has-quadenary-border-color has-fixed-layout" style="border-width:1px"><thead><tr><th class="has-text-align-left" data-align="left">I am...</th><th class="has-text-align-left" data-align="left">Apply here</th></tr></thead><tbody><tr><td class="has-text-align-left" data-align="left">A BC Hydro Electric customer that is converting to a heat pump from natural gas, propane, or oil.</td><td class="has-text-align-left" data-align="left"><a href="https://app.bchydro.com/hero">BC Hydro online application</a></td></tr></tbody></table></figure>
        <!-- /wp:table -->

        <!-- wp:group {"metadata":{"name":"Info alert"},"className":"info has-icon","style":{"border":{"radius":"0.5rem","width":"2px"},"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem","left":"1rem","right":"1rem"},"margin":{"top":"1rem","bottom":"1rem"}}},"backgroundColor":"custom-info-bg","borderColor":"custom-info-border","layout":{"type":"default"}} -->
        <div class="wp-block-group info has-icon has-border-color has-custom-info-border-border-color has-custom-info-bg-background-color has-background" style="border-width:2px;border-radius:0.5rem;margin-top:1rem;margin-bottom:1rem;padding-top:0.5rem;padding-right:1rem;padding-bottom:0.5rem;padding-left:1rem"><!-- wp:paragraph {"style":{"spacing":{"padding":{"top":"0.5rem","bottom":"0.5rem"}}},"fontSize":"extra-small"} -->
        <p class="has-extra-small-font-size" style="padding-top:0.5rem;padding-bottom:0.5rem"></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group --></section>
        <!-- /wp:group -->

        <!-- wp:group {"tagName":"section","metadata":{"name":"Who to Contact"},"className":"whotocontact-block block_contact_list","style":{"spacing":{"margin":{"bottom":"3rem"}}},"layout":{"type":"default"}} -->
        <section class="wp-block-group whotocontact-block block_contact_list" style="margin-bottom:3rem"><!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="whotocontact" style="margin-top:2rem">Who to contact</h2>
        <!-- /wp:heading -->

        <!-- wp:heading {"level":3} -->
        <h3 class="wp-block-heading">Questions about the rebate?</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p><a href="https://www.betterhomesbc.ca/connect/">Contact an Energy Coach</a>&nbsp;to get clarification or help with understanding this rebate.</p>
        <!-- /wp:paragraph -->

        <!-- wp:heading {"level":3,"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h3 class="wp-block-heading" style="margin-top:2rem">Questions about your application?</h3>
        <!-- /wp:heading -->

        <!-- wp:group {"metadata":{"name":"Contact list"},"className":"address","layout":{"type":"default"}} -->
        <div class="wp-block-group address"><!-- wp:heading {"level":4} -->
        <h4 class="wp-block-heading">BC Hydro customers</h4>
        <!-- /wp:heading -->

        <!-- wp:list {"className":"block_contact_list"} -->
        <ul class="wp-block-list block_contact_list"><!-- wp:list-item {"className":"phone"} -->
        <li class="phone">phone</li>
        <!-- /wp:list-item -->

        <!-- wp:list-item {"className":"site"} -->
        <li class="site">site</li>
        <!-- /wp:list-item -->

        <!-- wp:list-item {"className":"form"} -->
        <li class="form">form</li>
        <!-- /wp:list-item -->

        <!-- wp:list-item {"className":"email"} -->
        <li class="email">email</li>
        <!-- /wp:list-item --></ul>
        <!-- /wp:list -->

        <!-- wp:heading {"level":4} -->
        <h4 class="wp-block-heading">FortisBC customers</h4>
        <!-- /wp:heading -->

        <!-- wp:list {"className":"block_contact_list"} -->
        <ul class="wp-block-list block_contact_list"><!-- wp:list-item {"className":"phone"} -->
        <li class="phone">phone</li>
        <!-- /wp:list-item -->

        <!-- wp:list-item {"className":"site"} -->
        <li class="site">site</li>
        <!-- /wp:list-item -->

        <!-- wp:list-item {"className":"form"} -->
        <li class="form">form</li>
        <!-- /wp:list-item -->

        <!-- wp:list-item {"className":"email"} -->
        <li class="email">email</li>
        <!-- /wp:list-item --></ul>
        <!-- /wp:list --></div>
        <!-- /wp:group --></section>
        <!-- /wp:group -->

        <!-- wp:group {"metadata":{"name":"Program updates"},"style":{"spacing":{"margin":{"bottom":"3rem"}}},"layout":{"type":"default"}} -->
        <div class="wp-block-group" style="margin-bottom:3rem"><!-- wp:heading -->
        <h2 class="wp-block-heading" id="program-updates">Program updates</h2>
        <!-- /wp:heading -->

        <!-- wp:bcgov-block-theme/collapse {"collapseId":"collapse-container-5c41e676-cd0a-49a3-9e12-703c5824fff3"} -->
        <div id="collapse-container-5c41e676-cd0a-49a3-9e12-703c5824fff3" data-open-first-item="false" class="wp-block-bcgov-block-theme-collapse"><div class="collapse-container-nav"><span><button data-target="#collapse-container-5c41e676-cd0a-49a3-9e12-703c5824fff3" class="collapse-expand-all">Expand all</button></span><span><button data-target="#collapse-container-5c41e676-cd0a-49a3-9e12-703c5824fff3" class="collapse-collapse-all">Collapse all</button></span></div><!-- wp:bcgov-block-theme/collapse-item {"itemId":"collapse-item-04f575e8-87f8-4ee5-9c40-f3d0d03a5b83","headingId":"heading-04f575e8-87f8-4ee5-9c40-f3d0d03a5b83"} -->
        <div class="wp-block-bcgov-block-theme-collapse-item"><div class="collapse-header" id="heading-04f575e8-87f8-4ee5-9c40-f3d0d03a5b83"><h3><button data-toggle="collapse" data-target="#collapse-item-04f575e8-87f8-4ee5-9c40-f3d0d03a5b83" aria-expanded="false" aria-controls="collapse-item-04f575e8-87f8-4ee5-9c40-f3d0d03a5b83" class="collapsed"><span class="collapse-title"></span></button></h3></div><div class="collapse collapse-container hide" id="collapse-item-04f575e8-87f8-4ee5-9c40-f3d0d03a5b83"><div class="collapse-body"><div class="collapse-close"><a data-toggle="collapse" data-target="#collapse-item-04f575e8-87f8-4ee5-9c40-f3d0d03a5b83" href="#collapse-item-04f575e8-87f8-4ee5-9c40-f3d0d03a5b83" role="button" aria-expanded="true" aria-controls="collapse-item-04f575e8-87f8-4ee5-9c40-f3d0d03a5b83">Collapse</a></div></div></div></div>
        <!-- /wp:bcgov-block-theme/collapse-item --></div>
        <!-- /wp:bcgov-block-theme/collapse --></div>
        <!-- /wp:group -->

        <!-- wp:group {"tagName":"section","metadata":{"name":"FAQs and more"},"className":"block block\u002d\u002dfaqs faqs-block","style":{"spacing":{"margin":{"top":"3rem","bottom":"3rem"}}},"layout":{"type":"default"}} -->
        <section id="faqs-and-more" class="wp-block-group block block--faqs faqs-block" style="margin-top:3rem;margin-bottom:3rem"><!-- wp:heading {"style":{"spacing":{"margin":{"top":"2rem"}}}} -->
        <h2 class="wp-block-heading" id="faq-section" style="margin-top:2rem">FAQs and more</h2>
        <!-- /wp:heading -->

        <!-- wp:group {"className":"gap-2","layout":{"type":"grid","minimumColumnWidth":"20rem"}} -->
        <div class="wp-block-group gap-2"><!-- wp:group {"className":"grid-item grid-item\u002d\u002dfaqs overflow-hidden","style":{"border":{"radius":"1rem"}},"layout":{"type":"constrained","contentSize":"100%"}} -->
        <div class="wp-block-group grid-item grid-item--faqs overflow-hidden" style="border-radius:1rem"><!-- wp:cover {"url":"https://www.betterhomesbc.ca/app/uploads/sites/956/2022/09/Frame-7412.jpg","id":9976,"dimRatio":0,"focalPoint":{"x":0.54,"y":0.78},"minHeight":215,"minHeightUnit":"px","isDark":false,"align":"full","style":{"layout":{"selfStretch":"fit","flexSize":null},"elements":{"link":{"color":{"text":"var:preset|color|custom-info-bg"}}},"border":{"bottom":{"color":"var:preset|color|primary-brand","width":"0.25rem"},"top":[],"right":[],"left":[]}},"textColor":"custom-info-bg"} -->
        <div class="wp-block-cover alignfull is-light has-custom-info-bg-color has-text-color has-link-color" style="border-bottom-color:var(--wp--preset--color--primary-brand);border-bottom-width:0.25rem;min-height:215px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim"></span><img class="wp-block-cover__image-background wp-image-9976" alt="" src="https://www.betterhomesbc.ca/app/uploads/sites/956/2022/09/Frame-7412.jpg" style="object-position:54% 78%" data-object-fit="cover" data-object-position="54% 78%"/><div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","fontSize":"large"} -->
        <p class="has-text-align-center has-large-font-size"></p>
        <!-- /wp:paragraph --></div></div>
        <!-- /wp:cover -->

        <!-- wp:group {"align":"full","className":"body","style":{"spacing":{"padding":{"bottom":"2rem"}}},"backgroundColor":"accent","layout":{"type":"flex","orientation":"vertical"}} -->
        <div class="wp-block-group alignfull body has-accent-background-color has-background" style="padding-bottom:2rem"><!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"400"}}} -->
        <h3 class="wp-block-heading" style="font-style:normal;font-weight:400">Learn about heat pumps</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group -->

        <!-- wp:group {"className":"grid-item grid-item\u002d\u002dfaqs overflow-hidden","style":{"border":{"radius":"1rem"}},"layout":{"type":"constrained","contentSize":"100%"}} -->
        <div class="wp-block-group grid-item grid-item--faqs overflow-hidden" style="border-radius:1rem"><!-- wp:cover {"url":"https://www.betterhomesbc.ca/app/uploads/sites/956/2022/09/Frame-7411.jpg","id":9977,"dimRatio":0,"customOverlayColor":"#a47864","isUserOverlayColor":false,"focalPoint":{"x":0.63,"y":0.48},"minHeight":215,"minHeightUnit":"px","isDark":false,"align":"full","style":{"layout":{"selfStretch":"fit","flexSize":null},"elements":{"link":{"color":{"text":"var:preset|color|custom-info-bg"}}},"border":{"bottom":{"color":"var:preset|color|primary-brand","width":"0.25rem"},"top":[],"right":[],"left":[]}},"textColor":"custom-info-bg"} -->
        <div class="wp-block-cover alignfull is-light has-custom-info-bg-color has-text-color has-link-color" style="border-bottom-color:var(--wp--preset--color--primary-brand);border-bottom-width:0.25rem;min-height:215px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim" style="background-color:#a47864"></span><img class="wp-block-cover__image-background wp-image-9977" alt="" src="https://www.betterhomesbc.ca/app/uploads/sites/956/2022/09/Frame-7411.jpg" style="object-position:63% 48%" data-object-fit="cover" data-object-position="63% 48%"/><div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","fontSize":"large"} -->
        <p class="has-text-align-center has-large-font-size"></p>
        <!-- /wp:paragraph --></div></div>
        <!-- /wp:cover -->

        <!-- wp:group {"align":"full","className":"body","style":{"spacing":{"padding":{"bottom":"2rem"}}},"backgroundColor":"accent","layout":{"type":"flex","orientation":"vertical"}} -->
        <div class="wp-block-group alignfull body has-accent-background-color has-background" style="padding-bottom:2rem"><!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"400"}}} -->
        <h3 class="wp-block-heading" style="font-style:normal;font-weight:400">Rebate FAQs</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph -->
        <p></p>
        <!-- /wp:paragraph --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group -->

        <!-- wp:group {"className":"grid-item grid-item\u002d\u002dfaqs overflow-hidden","style":{"border":{"radius":"1rem"}},"layout":{"type":"constrained","contentSize":"100%"}} -->
        <div class="wp-block-group grid-item grid-item--faqs overflow-hidden" style="border-radius:1rem"><!-- wp:cover {"url":"https://www.betterhomesbc.ca/app/uploads/sites/956/2022/10/Frame-741-4.png","id":10177,"alt":"A woman wearing a hard hat, plaid shirt, puffer vest and jeans is working on building the frame of a roof.","dimRatio":0,"customOverlayColor":"#bdb1a3","isUserOverlayColor":false,"minHeight":215,"minHeightUnit":"px","isDark":false,"align":"full","style":{"layout":{"selfStretch":"fit","flexSize":null},"elements":{"link":{"color":{"text":"var:preset|color|custom-info-bg"}}},"border":{"bottom":{"color":"var:preset|color|primary-brand","width":"0.25rem"},"top":[],"right":[],"left":[]}},"textColor":"custom-info-bg"} -->
        <div class="wp-block-cover alignfull is-light has-custom-info-bg-color has-text-color has-link-color" style="border-bottom-color:var(--wp--preset--color--primary-brand);border-bottom-width:0.25rem;min-height:215px"><span aria-hidden="true" class="wp-block-cover__background has-background-dim-0 has-background-dim" style="background-color:#bdb1a3"></span><img class="wp-block-cover__image-background wp-image-10177" alt="A woman wearing a hard hat, plaid shirt, puffer vest and jeans is working on building the frame of a roof." src="https://www.betterhomesbc.ca/app/uploads/sites/956/2022/10/Frame-741-4.png" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:paragraph {"align":"center","fontSize":"large"} -->
        <p class="has-text-align-center has-large-font-size"></p>
        <!-- /wp:paragraph --></div></div>
        <!-- /wp:cover -->

        <!-- wp:group {"align":"full","className":"body","style":{"spacing":{"padding":{"bottom":"2rem"}}},"backgroundColor":"accent","layout":{"type":"flex","orientation":"vertical"}} -->
        <div class="wp-block-group alignfull body has-accent-background-color has-background" style="padding-bottom:2rem"><!-- wp:heading {"level":3,"style":{"typography":{"fontStyle":"normal","fontWeight":"400"}}} -->
        <h3 class="wp-block-heading" style="font-style:normal;font-weight:400">Get help from professionals</h3>
        <!-- /wp:heading -->

        <!-- wp:paragraph {"style":{"spacing":{"margin":{"bottom":"2rem"}}}} -->
        <p style="margin-bottom:2rem">Finding the right contractor is key to having a successful home energy retrofit.</p>
        <!-- /wp:paragraph -->

        <!-- wp:buttons -->
        <div class="wp-block-buttons"><!-- wp:button -->
        <div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://www.betterhomesbc.ca/find-a-contractor/">Find a registered contractor</a></div>
        <!-- /wp:button --></div>
        <!-- /wp:buttons --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group --></section>
        <!-- /wp:group --></div>
        <!-- /wp:group --></div>
        <!-- /wp:column --></div>
        <!-- /wp:columns --></div>
        <!-- /wp:group --></div>
        <!-- /wp:group -->';

        if ( post_type_exists( 'incentives' ) ) {
            register_block_pattern(
                'bcgov-plugin-cleanbcdx/single-rebate-page',
                [
                    'title'      => __( 'Single rebate page (Better Homes)', 'bcgov-plugin-cleanbcdx' ),
                    'blockTypes' => [ 'core/post-content' ],
                    'content'    => $pattern_content,
                    'postTypes'  => [ 'incentives', 'rebates' ],
                    'categories' => [ 'featured' ],
                ]
            );
        }
    }
}
