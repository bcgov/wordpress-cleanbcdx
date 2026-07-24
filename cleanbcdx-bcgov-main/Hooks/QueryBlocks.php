<?php

namespace Bcgov\Plugin\CleanBCDX\Hooks;

/**
 * Sets up basic php template blocks for CleanBC
 *
 * @since 1.0.8
 *
 * @package Bcgov\Plugin\QueryBlocks
 */
class QueryBlocks {

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
        add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_scripts' ], 10 );
    }


    /**
     * Register the stylesheets and JavaScript for the admin area.
     *
     * @since 1.5.0
     */
    public function enqueue_admin_scripts() {
        $name       = 'admin';
        $asset_info = \Bcgov\Plugin\CleanBCDX\Setup::get_asset_information( $name, 'dist-basic' );

        wp_enqueue_script(
            $asset_info['handle'],
            $asset_info['dist_url'] . $name . '.js',
            $asset_info['dependencies'],
            $asset_info['version'],
            true
        );

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
            $asset_info['handle'],
            'queryFilterBlockData',
            [
                'query' => $current_query,
                'nonce' => wp_create_nonce( 'wp_rest' ), // For authenticated REST API usage.
            ]
        );
    }


    /**
     * Registers blocks and callbacks for dynamic blocks.
     *
     * @return void
     */
    public function register_blocks(): void {
        $block_definitions = [
            [
                'directory'       => plugin_dir_path( __DIR__ ) . 'scripts/blocks/multi-query',
                'render_callback' => [ $this, 'render_multi_query_block' ],
            ],
            [
                'directory'       => plugin_dir_path( __DIR__ ) . 'scripts/blocks/query-conditional-group',
                'render_callback' => [ $this, 'render_query_conditional_group' ],
            ],
            [
                'directory'       => plugin_dir_path( __DIR__ ) . 'scripts/blocks/query-filter-block',
                'render_callback' => [ $this, 'render_query_filter_block' ],
            ],
        ];

        foreach ( $block_definitions as $block_definition ) {
            $block_json = trailingslashit( $block_definition['directory'] ) . 'block.json';

            if ( ! file_exists( $block_json ) ) {
                continue;
            }

            register_block_type_from_metadata(
                $block_definition['directory'],
                [
                    'render_callback' => $block_definition['render_callback'],
                ]
            );
        }
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
}
