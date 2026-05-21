<?php

namespace Bcgov\Plugin\CleanBCDX\Hooks;

/**
 * The SearchContext class provides methods for modifying the search query context in WordPress.
 *
 * @since 1.0.7
 *
 * @package Bcgov\Plugin\CleanBCDX
 */
class SearchContext {

	/**
	 * Include which post types are included in search results.
	 *
	 * @since 1.0.7
	 *
	 * @param param $query – object representing the current query.
	 * @return void
	 */
	public function bcgov_included_post_types_in_search( $query ) {
		// Default post types.
		$post_types = [ 'page', 'post', 'definitions', 'incentives' ];

		$site_url = home_url(); // Base URL (e.g., https://test.vanity.blog.gov.bc.ca).
        $path     = untrailingslashit( $_SERVER['REQUEST_URI'] ); // Path (e.g., /betterbuildingsbc).

		if ( strpos( $site_url, 'betterhomesbc.ca' ) !== false || strpos( $path, 'betterhomesbc' ) !== false ) {
		    $post_types = array_merge( $post_types, [ 'faqs', 'incentives', 'project', 'products' ] );
		}

		if ( strpos( $site_url, 'betterbuildingsbc.ca' ) !== false || strpos( $path, 'betterbuildingsbc' ) !== false ) {
		    $post_types = array_merge( $post_types, [ 'definitions', 'faqs', 'incentives', 'project', 'products' ] );
		}

		if ( $query->is_search() && ! is_admin() && $query->is_main_query() ) {
			$query->set( 'post_type', $post_types );
		}
	}

	/**
	 * Exclude configured content from search when marked hide-from-search.
	 *
	 * This currently supports:
	 * - pages marked via body-class meta
	 * - definitions posts tagged with setting=hide-from-search
	 *
	 * @since 1.30.12
	 *
	 * @param \WP_Query $query The current query.
	 * @return void
	 */
	public function bcgov_exclude_hide_from_search_pages( $query ) {
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() ) {
			return;
		}

		$post_types = $query->get( 'post_type' );
		$post_types = empty( $post_types ) ? [] : (array) $post_types;
		$hidden_ids = [];

		$can_check_pages = post_type_exists( 'page' ) && ( empty( $post_types ) || in_array( 'page', $post_types, true ) );
		if ( $can_check_pages ) {
			$hidden_ids = array_merge( $hidden_ids, $this->bcgov_get_hide_from_search_ids( 'page' ) );
		}

		$can_check_definitions = post_type_exists( 'definitions' ) && ( empty( $post_types ) || in_array( 'definitions', $post_types, true ) );
		if ( $can_check_definitions ) {
			$hidden_ids = array_merge( $hidden_ids, $this->bcgov_get_hide_from_search_definitions_ids() );
		}

		if ( empty( $hidden_ids ) ) {
			return;
		}

		$existing = (array) $query->get( 'post__not_in' );
		$query->set( 'post__not_in', array_values( array_unique( array_merge( $existing, $hidden_ids ) ) ) );
	}

	/**
	 * Fetch IDs for definitions posts tagged with setting=hide-from-search.
	 *
	 * @since 1.30.27
	 *
	 * @return int[] Array of post IDs.
	 */
	private function bcgov_get_hide_from_search_definitions_ids() {
		static $cache = null;

		if ( null !== $cache ) {
			return $cache;
		}

		$taxonomy = '';
		if ( taxonomy_exists( 'site-settings' ) ) {
			$taxonomy = 'site-settings';
		}

		if ( '' === $taxonomy ) {
			$cache = [];
			return $cache;
		}

		$cache = get_posts(
			[
				'post_type'      => 'definitions',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'no_found_rows'  => true,
				'tax_query'      => [
					[
						'taxonomy' => $taxonomy,
						'field'    => 'slug',
						'terms'    => [ 'hide-from-search' ],
					],
				],
			]
		);

		return $cache;
	}

	/**
	 * Fetch IDs for pages with a hide-from-search body class.
	 *
	 * @since 1.30.12
	 *
	 * @param string|array $post_types Post types to query (default: any).
	 * @return int[] Array of post IDs.
	 */
	private function bcgov_get_hide_from_search_ids( $post_types = 'any' ) {
		static $cache = [];
		$cache_key    = md5( (string) wp_json_encode( $post_types ) );

		if ( array_key_exists( $cache_key, $cache ) ) {
			return $cache[ $cache_key ];
		}

		$meta_keys = $this->bcgov_get_hide_from_search_meta_keys();
		if ( empty( $meta_keys ) ) {
			$cache[ $cache_key ] = [];
			return $cache[ $cache_key ];
		}

		$meta_query = [ 'relation' => 'OR' ];
		foreach ( $meta_keys as $meta_key ) {
			$meta_query[] = [
				'key'     => $meta_key,
				'value'   => 'hide-from-search',
				'compare' => 'LIKE',
			];
		}

		$cache[ $cache_key ] = get_posts(
			[
				'post_type'      => $post_types,
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'no_found_rows'  => true,
				'meta_query'     => $meta_query,
			]
		);

		return $cache[ $cache_key ];
	}

	/**
	 * Returns meta keys that may store body class values.
	 *
	 * @since 1.30.12
	 *
	 * @return string[] Array of meta keys.
	 */
	private function bcgov_get_hide_from_search_meta_keys() {
		$keys = [
			'body_class',
			'body_classes',
			'custom_body_class',
			'custom_body_classes',
			'_custom_page_class',
		];

		/**
		 * Filter the meta keys checked for hide-from-search.
		 *
		 * @param string[] $keys Meta keys to check.
		 */
		return apply_filters( 'bcgov_hide_from_search_meta_keys', $keys );
	}

	/**
	 * Order search results by optional ACF search priority, then relevance/date.
	 *
	 * @since 1.30.9
	 *
	 * @param \WP_Query $query The current query.
	 * @return void
	 */
	public function bcgov_order_search_by_priority( $query ) {
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() ) {
			return;
		}

		if ( ! function_exists( 'acf_get_field' ) ) {
			return;
		}

		$field = acf_get_field( 'search_priority' );
		if ( empty( $field ) ) {
			return;
		}

		if ( ! $this->bcgov_has_search_priority_meta() ) {
			return;
		}

		$query->set(
			'orderby',
			[
				'relevance' => 'DESC',
				'date'      => 'DESC',
			]
		);

		add_filter( 'posts_join', [ $this, 'bcgov_search_priority_join' ], 10, 2 );
		add_filter( 'posts_orderby', [ $this, 'bcgov_search_priority_orderby' ], 10, 2 );
		add_filter( 'posts_distinct', [ $this, 'bcgov_search_priority_distinct' ], 10, 2 );
		add_filter( 'the_posts', [ $this, 'bcgov_remove_search_priority_clauses' ], 10, 2 );
	}

	/**
	 * Adds the priority meta LEFT JOIN without excluding posts.
	 *
	 * @since 1.30.9
	 *
	 * @param string    $join  The JOIN clause.
	 * @param \WP_Query $query   The current query.
	 * @return string Modified JOIN clause.
	 */
	public function bcgov_search_priority_join( $join, $query ) {
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() ) {
			return $join;
		}

		if ( ! function_exists( 'acf_get_field' ) ) {
			return $join;
		}

		$field = acf_get_field( 'search_priority' );
		if ( empty( $field ) ) {
			return $join;
		}

		if ( ! $this->bcgov_has_search_priority_meta() ) {
			return $join;
		}

		global $wpdb;

		$priority_join = " LEFT JOIN {$wpdb->postmeta} AS pm_search_priority ON ({$wpdb->posts}.ID = pm_search_priority.post_id AND pm_search_priority.meta_key = 'search_priority') ";
		if ( false === strpos( $join, 'pm_search_priority' ) ) {
			$join .= $priority_join;
		}

		return $join;
	}

	/**
	 * Prepends priority ordering to the existing ORDER BY clause.
	 *
	 * @since 1.30.9
	 *
	 * @param string    $orderby The ORDER BY clause.
	 * @param \WP_Query $query   The current query.
	 * @return string Modified ORDER BY clause.
	 */
	public function bcgov_search_priority_orderby( $orderby, $query ) {
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() ) {
			return $orderby;
		}

		if ( ! function_exists( 'acf_get_field' ) ) {
			return $orderby;
		}

		$field = acf_get_field( 'search_priority' );
		if ( empty( $field ) ) {
			return $orderby;
		}

		if ( ! $this->bcgov_has_search_priority_meta() ) {
			return $orderby;
		}

		$priority_order = 'COALESCE(pm_search_priority.meta_value+0, 0) DESC';
		$clean_orderby  = preg_replace( '/^ORDER BY\\s+/i', '', $orderby );

		if ( '' !== trim( $clean_orderby ) ) {
			return "{$priority_order}, {$clean_orderby}";
		}

		return $priority_order;
	}

	/**
	 * Ensures DISTINCT to avoid duplicate rows from the priority join.
	 *
	 * @since 1.30.10
	 *
	 * @param string    $distinct The DISTINCT clause.
	 * @param \WP_Query $query    The current query.
	 * @return string Modified DISTINCT clause.
	 */
	public function bcgov_search_priority_distinct( $distinct, $query ) {
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() ) {
			return $distinct;
		}

		if ( ! function_exists( 'acf_get_field' ) ) {
			return $distinct;
		}

		$field = acf_get_field( 'search_priority' );
		if ( empty( $field ) ) {
			return $distinct;
		}

		if ( ! $this->bcgov_has_search_priority_meta() ) {
			return $distinct;
		}

		return 'DISTINCT';
	}

	/**
	 * Checks if any posts have a search priority meta value.
	 *
	 * @since 1.30.10
	 *
	 * @return bool True if the meta key exists.
	 */
	private function bcgov_has_search_priority_meta() {
		static $has_meta = null;

		if ( null !== $has_meta ) {
			return $has_meta;
		}

		global $wpdb;
		$has_meta = (bool) $wpdb->get_var(
			"SELECT 1 FROM {$wpdb->postmeta} WHERE meta_key = 'search_priority' LIMIT 1"
		);

		return $has_meta;
	}

	/**
	 * Removes the search priority clause filter after the main query runs.
	 *
	 * @since 1.30.9
	 *
	 * @param array     $posts Array of post objects.
	 * @param \WP_Query $query The current query.
	 * @return array Unmodified posts.
	 */
	public function bcgov_remove_search_priority_clauses( $posts, $query ) {
		if ( is_admin() || ! $query->is_main_query() || ! $query->is_search() ) {
			return $posts;
		}

		remove_filter( 'posts_join', [ $this, 'bcgov_search_priority_join' ], 10 );
		remove_filter( 'posts_orderby', [ $this, 'bcgov_search_priority_orderby' ], 10 );
		remove_filter( 'posts_distinct', [ $this, 'bcgov_search_priority_distinct' ], 10 );
		remove_filter( 'the_posts', [ $this, 'bcgov_remove_search_priority_clauses' ], 10 );

		return $posts;
	}


	/**
	 * Modify search results post date to include the post type.
	 *
	 * @since 1.0.7
	 *
	 * @param string  $date The original post date of the search result.
	 * @param WP_Post $post The post object.
	 * @return string Modified post date.
	 */
	public function bcgov_modify_search_result_date( $date, $post ) {
		if ( is_search() ) {
			$post_type = get_post_type( $post );
			if ( $post_type ) {
				$date = "$date | $post_type";
			}
		}
		return $date;
	}

	/**
     * Removes content inside elements with specific classes from search results excerpts.
	 *
	 * @since 1.13.0
     *
     * @param string $content The post content.
     * @return string The filtered content with hidden elements removed.
     */
	public function bcgov_filter_content_for_search( $content ) {
		if ( is_search() && ! empty( $content ) ) {
			// List of classes to exclude from the excerpt.
			$excluded_classes = [ 'hide-from-search', 'sticky-side-nav' ];

			$class_pattern   = implode( '|', array_map( 'preg_quote', $excluded_classes ) );
			$pattern_hidden  = '/<([a-z0-9\-]+)(?=[^>]*\bclass=["\'][^"\']*(' . $class_pattern . ')[^"\']*["\'])[^>]*>.*?<\/\1>/is';
			$cleaned_content = preg_replace( [ $pattern_hidden ], '', $content );

			// Ensure there's still valid excerpt content.
			if ( empty( trim( wp_strip_all_tags( $cleaned_content ) ) ) ) {
				return wp_trim_words( $content, 40, '...' );
			}

			return $cleaned_content;
		}

		return $content;
	}

	/**
	 * Ensures the search excerpt is generated from filtered content.
	 *
	 * @since 1.13.0
	 *
	 * @param string  $excerpt The post excerpt.
	 * @param WP_Post $post The post object.
	 * @return string The cleaned excerpt.
	 */
	public function bcgov_filter_excerpt_for_search( $excerpt, $post ) {

		$post = get_post( $post );

		if ( ! is_search() || ! $post ) {
			return $excerpt;
		}

		// If a manual excerpt exists, always use it (any post type).
		if ( has_excerpt( $post ) ) {
			// Optionally trim to match your current length.
			return wp_trim_words(
				wp_strip_all_tags( $post->post_excerpt ),
				40,
				'...'
			);
		}

		// Otherwise, generate from filtered content (your existing behavior).
		if ( isset( $post->post_content ) ) {
			$cleaned_content = apply_filters( 'the_content', $post->post_content );

			return wp_trim_words( $cleaned_content, 40, '...' );
		}

		return $excerpt;
	}

	/**
	 * Prepend rebates_type term to incentives titles in search results.
	 *
	 * Example:
	 *   Term: "Heat pump rebates"
	 *   Title: "For all fuel types"
	 *   Output: "Heat pump rebates for all fuel types"
	 *
	 * @since 1.25.13
	 *
	 * @param string $title   The original post title.
	 * @param int    $post_id The post ID.
	 * @return string         The modified title.
	 */
	public function bcgov_prepend_rebates_type_to_search_title( $title, $post_id ) {

		// Only touch front-end main query search results.
		if ( ! is_search() || ! in_the_loop() || ! is_main_query() ) {
			return $title;
		}

		// Limit to the "incentives" post type.
		if ( 'incentives' !== get_post_type( $post_id ) ) {
			return $title;
		}

		if ( ! function_exists( 'get_field' ) ) {
			return $title;
		}

		$rebate_types = get_field( 'rebate_types', $post_id );

		if ( empty( $rebate_types ) ) {
			return $title;
		}

		$rebate_type_name = '';

		// ACF taxonomy field can return: array of terms, IDs, or strings.
		if ( is_array( $rebate_types ) ) {
			$first = reset( $rebate_types );

			if ( $first instanceof \WP_Term ) {
				$rebate_type_name = $first->name;
			} elseif ( is_numeric( $first ) ) {
				$term = get_term( (int) $first );
				if ( $term && ! is_wp_error( $term ) ) {
					$rebate_type_name = $term->name;
				}
			} else {
				// Assume it's a label string.
				$rebate_type_name = (string) $first;
			}
		} elseif ( $rebate_types instanceof \WP_Term ) {
			$rebate_type_name = $rebate_types->name;
		} elseif ( is_string( $rebate_types ) ) {
			// If field is configured as "Return: Label".
			$rebate_type_name = $rebate_types;
		}

		if ( '' === trim( $rebate_type_name ) ) {
			return $title;
		}

		// Build "Term + original title".
		$combined = trim( $rebate_type_name . ' ' . ltrim( $title ) );

		// Convert to sentence case:
		// lower-case everything, then uppercase first character.
		$combined_lower = mb_strtolower( $combined, 'UTF-8' );
		$first_char     = mb_substr( $combined_lower, 0, 1, 'UTF-8' );
		$rest           = mb_substr( $combined_lower, 1, null, 'UTF-8' );

		return mb_strtoupper( $first_char, 'UTF-8' ) . $rest;
	}
}
