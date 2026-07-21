<?php

namespace Bcgov\Plugin\CleanBCDXGE\Hooks;

/**
 * Adds Media Library support for plugin-managed file types.
 *
 * @since 1.0.1
 *
 * @package Bcgov\Plugin\CleanBCDXGE
 */
class MediaLibrary {

	/**
	 * Attachment meta key used to flag JSON uploads for the public unity retroactive feed.
	 */
	const UNITY_RETROACTIVE_FEED_META_KEY = '_cleanbcdx_ge_unity_retroactive_feed_active';

	/**
	 * Attachment meta key used to flag OEM feed uploads for the public unity OEM feed.
	 */
	const UNITY_OEM_FEED_META_KEY = '_cleanbcdx_ge_unity_oem_feed_active';

	/**
	 * Attachment meta key used to flag eligible vehicles feed uploads for the public unity eligible vehicles feed.
	 */
	const UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY = '_cleanbcdx_ge_unity_eligible_vehicles_feed_active';

	/**
	 * Attachment meta key used to flag intake class status feed uploads for the public unity intake class status feed.
	 */
	const UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY = '_cleanbcdx_ge_unity_intake_class_status_feed_active';

	/**
	 * REST namespace for the public unity feeds.
	 */
	const UNITY_FEED_NAMESPACE = 'custom/v1';

	/**
	 * REST route for the public unity retroactive feed.
	 */
	const UNITY_RETROACTIVE_FEED_ROUTE = '/unity-retroactive-feed';

	/**
	 * REST route alias for retroactive feed clients that expect a .json suffix.
	 */
	const UNITY_RETROACTIVE_FEED_JSON_ROUTE = '/unity-retroactive-feed.json';

	/**
	 * REST route for the public unity OEM feed.
	 */
	const UNITY_OEM_FEED_ROUTE = '/unity-oem-feed';

	/**
	 * REST route alias for OEM feed clients that expect a .json suffix.
	 */
	const UNITY_OEM_FEED_JSON_ROUTE = '/unity-oem-feed.json';

	/**
	 * REST route for the public unity eligible vehicles feed.
	 */
	const UNITY_ELIGIBLE_VEHICLES_FEED_ROUTE = '/unity-eligible-vehicles-feed';

	/**
	 * REST route alias for eligible vehicles feed clients that expect a .json suffix.
	 */
	const UNITY_ELIGIBLE_VEHICLES_FEED_JSON_ROUTE = '/unity-eligible-vehicles-feed.json';

	/**
	 * REST route for the public unity intake class status feed.
	 */
	const UNITY_INTAKE_CLASS_STATUS_FEED_ROUTE = '/unity-intake-class-status-feed';

	/**
	 * REST route alias for intake class status feed clients that expect a .json suffix.
	 */
	const UNITY_INTAKE_CLASS_STATUS_FEED_JSON_ROUTE = '/unity-intake-class-status-feed.json';

	/**
	 * Allow feed files to be uploaded via the Media Library.
	 *
	 * @param array $mimes The allowed mime types keyed by file extension.
	 * @return array
	 */
	public function allow_feed_uploads( $mimes ) {
		$mimes['json'] = 'application/json';
		$mimes['csv']  = 'text/csv';

		return $mimes;
	}

	/**
	 * Normalise feed file detection when the server reports a generic mime type.
	 *
	 * @param array  $data     Values for the extension, mime type, and corrected filename.
	 * @param string $file     Full path to the uploaded file.
	 * @param string $filename The original uploaded filename.
	 * @return array
	 */
	public function fix_feed_filetype( $data, $file, $filename ) {
		$extension = $this->get_file_extension( $filename );

		if ( empty( $extension ) ) {
			$extension = $this->get_file_extension( $file );
		}

		if ( 'json' === $extension ) {
			$data['ext']  = 'json';
			$data['type'] = 'application/json';
		}

		if ( 'csv' === $extension ) {
			$data['ext']  = 'csv';
			$data['type'] = 'text/csv';
		}

		return $data;
	}

	/**
	 * Add grouped feed selectors to compatible attachments so editors can expose a file at the public feed endpoints.
	 *
	 * @param array    $form_fields Attachment form fields.
	 * @param \WP_Post $post        The attachment post object.
	 * @return array
	 */
	public function add_unity_feed_attachment_field( $form_fields, $post ) {
		$is_json_attachment = $this->is_json_attachment( $post->ID );
		$is_csv_attachment  = $this->is_csv_attachment( $post->ID );

		if ( ! $is_json_attachment && ! $is_csv_attachment ) {
			return $form_fields;
		}

		$field_html = sprintf(
			'<fieldset><legend class="screen-reader-text">%1$s</legend>',
			\esc_attr__( 'Unity feed data', 'plugin' )
		);

		if ( $is_json_attachment ) {
			$field_html .= sprintf(
				'<label for="attachments-%1$d-cleanbcdx-ge-unity-retroactive-feed-active">' .
				'<input type="checkbox" id="attachments-%1$d-cleanbcdx-ge-unity-retroactive-feed-active" name="attachments[%1$d][cleanbcdx_ge_unity_retroactive_feed_active]" value="1" %2$s /> %3$s' .
				'</label><br />',
				(int) $post->ID,
				\checked( '1', \get_post_meta( $post->ID, self::UNITY_RETROACTIVE_FEED_META_KEY, true ), false ),
				\esc_html__( 'Retroactive feed – custom/v1/unity-retroactive-feed(.json)', 'plugin' )
			);
		}

		$field_html .= sprintf(
			'<label for="attachments-%1$d-cleanbcdx-ge-unity-oem-feed-active">' .
			'<input type="checkbox" id="attachments-%1$d-cleanbcdx-ge-unity-oem-feed-active" name="attachments[%1$d][cleanbcdx_ge_unity_oem_feed_active]" value="1" %2$s /> %3$s' .
			'</label><br />',
			(int) $post->ID,
			\checked( '1', \get_post_meta( $post->ID, self::UNITY_OEM_FEED_META_KEY, true ), false ),
			\esc_html__( 'OEM feed – custom/v1/unity-oem-feed(.json)', 'plugin' )
		);

		$field_html .= sprintf(
			'<label for="attachments-%1$d-cleanbcdx-ge-unity-eligible-vehicles-feed-active">' .
			'<input type="checkbox" id="attachments-%1$d-cleanbcdx-ge-unity-eligible-vehicles-feed-active" name="attachments[%1$d][cleanbcdx_ge_unity_eligible_vehicles_feed_active]" value="1" %2$s /> %3$s' .
			'</label><br />',
			(int) $post->ID,
			\checked( '1', \get_post_meta( $post->ID, self::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, true ), false ),
			\esc_html__( 'Eligible Commercial Vehicles – custom/v1/unity-eligible-vehicles-feed(.json)', 'plugin' )
		);

		$field_html .= sprintf(
			'<label for="attachments-%1$d-cleanbcdx-ge-unity-intake-class-status-feed-active">' .
			'<input type="checkbox" id="attachments-%1$d-cleanbcdx-ge-unity-intake-class-status-feed-active" name="attachments[%1$d][cleanbcdx_ge_unity_intake_class_status_feed_active]" value="1" %2$s /> %3$s' .
			'</label></fieldset>',
			(int) $post->ID,
			\checked( '1', \get_post_meta( $post->ID, self::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY, true ), false ),
			\esc_html__( 'Intake Class Status – custom/v1/unity-intake-class-status-feed(.json)', 'plugin' )
		);

		$form_fields['cleanbcdx_ge_unity_feed_settings'] = array(
			'label' => \__( 'Unity feed data', 'plugin' ),
			'input' => 'html',
			'html'  => $field_html,
			'helps' => $is_csv_attachment
				? \__( 'Expose the selected CSV file at the public Unity OEM, Eligible Commercial Vehicles, and/or Intake Class Status feed endpoints. The CSV will be transformed into the public JSON response. If multiple compatible files are marked active for the same feed, the newest upload is served.', 'plugin' )
				: \__( 'Expose the selected JSON file at the public Unity Retroactive, OEM, Eligible Commercial Vehicles, and/or Intake Class Status feed endpoints. If multiple compatible files are marked active for the same feed, the newest upload is served.', 'plugin' ),
		);

		return $form_fields;
	}

	/**
	 * Save the feed selectors for a compatible attachment.
	 *
	 * @param array $post       Attachment post data.
	 * @param array $attachment Submitted attachment fields.
	 * @return array
	 */
	public function save_unity_feed_attachment_field( $post, $attachment ) {
		$post_id = isset( $post['ID'] ) ? (int) $post['ID'] : 0;

		if ( $post_id <= 0 ) {
			return $post;
		}

		$is_json_attachment = $this->is_json_attachment( $post_id );
		$is_csv_attachment  = $this->is_csv_attachment( $post_id );

		if ( ! $is_json_attachment && ! $is_csv_attachment ) {
			\delete_post_meta( $post_id, self::UNITY_RETROACTIVE_FEED_META_KEY );
			\delete_post_meta( $post_id, self::UNITY_OEM_FEED_META_KEY );
			\delete_post_meta( $post_id, self::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY );
			\delete_post_meta( $post_id, self::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY );

			return $post;
		}

		$this->update_unity_feed_attachment_flag(
			$post_id,
			self::UNITY_RETROACTIVE_FEED_META_KEY,
			$is_json_attachment && ! empty( $attachment['cleanbcdx_ge_unity_retroactive_feed_active'] )
		);

		$this->update_unity_feed_attachment_flag(
			$post_id,
			self::UNITY_OEM_FEED_META_KEY,
			( $is_json_attachment || $is_csv_attachment ) && ! empty( $attachment['cleanbcdx_ge_unity_oem_feed_active'] )
		);

		$this->update_unity_feed_attachment_flag(
			$post_id,
			self::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY,
			( $is_json_attachment || $is_csv_attachment ) && ! empty( $attachment['cleanbcdx_ge_unity_eligible_vehicles_feed_active'] )
		);

		$this->update_unity_feed_attachment_flag(
			$post_id,
			self::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY,
			( $is_json_attachment || $is_csv_attachment ) && ! empty( $attachment['cleanbcdx_ge_unity_intake_class_status_feed_active'] )
		);

		return $post;
	}

	/**
	 * Register the public unity feed REST routes.
	 *
	 * @return void
	 */
	public function register_unity_feed_routes() {
		$route_args = array(
			'methods'             => 'GET',
			'permission_callback' => '__return_true',
		);

		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_RETROACTIVE_FEED_ROUTE,
			array_merge( $route_args, array( 'callback' => array( $this, 'get_unity_retroactive_feed_response' ) ) )
		);
		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_RETROACTIVE_FEED_JSON_ROUTE,
			array_merge( $route_args, array( 'callback' => array( $this, 'get_unity_retroactive_feed_response' ) ) )
		);
		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_OEM_FEED_ROUTE,
			array_merge( $route_args, array( 'callback' => array( $this, 'get_unity_oem_feed_response' ) ) )
		);
		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_OEM_FEED_JSON_ROUTE,
			array_merge( $route_args, array( 'callback' => array( $this, 'get_unity_oem_feed_response' ) ) )
		);
		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_ELIGIBLE_VEHICLES_FEED_ROUTE,
			array_merge( $route_args, array( 'callback' => array( $this, 'get_unity_eligible_vehicles_feed_response' ) ) )
		);
		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_ELIGIBLE_VEHICLES_FEED_JSON_ROUTE,
			array_merge( $route_args, array( 'callback' => array( $this, 'get_unity_eligible_vehicles_feed_response' ) ) )
		);
		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_INTAKE_CLASS_STATUS_FEED_ROUTE,
			array_merge( $route_args, array( 'callback' => array( $this, 'get_unity_intake_class_status_feed_response' ) ) )
		);
		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_INTAKE_CLASS_STATUS_FEED_JSON_ROUTE,
			array_merge( $route_args, array( 'callback' => array( $this, 'get_unity_intake_class_status_feed_response' ) ) )
		);
	}

	/**
	 * Return the currently active unity retroactive feed JSON attachment as a public API response.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_unity_retroactive_feed_response() {
		return $this->get_unity_feed_response_for_meta_key(
			self::UNITY_RETROACTIVE_FEED_META_KEY,
			'cleanbcdx_ge_unity_retroactive_feed',
			\__( 'Unity Retroactive feed', 'plugin' )
		);
	}

	/**
	 * Return the currently active unity OEM feed attachment as a public API response.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_unity_oem_feed_response() {
		$feed_label = \__( 'Unity OEM feed', 'plugin' );
		$response   = $this->get_unity_csv_capable_feed_response_for_meta_key(
			self::UNITY_OEM_FEED_META_KEY,
			'cleanbcdx_ge_unity_oem_feed',
			$feed_label
		);

		if ( \is_wp_error( $response ) ) {
			return $response;
		}

		$data = $this->normalize_unity_oem_feed_response_data( $response->get_data(), $feed_label );

		if ( \is_wp_error( $data ) ) {
			return $data;
		}

		$response->set_data( $data );

		return $response;
	}

	/**
	 * Return the currently active unity eligible vehicles feed attachment as a public API response.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_unity_eligible_vehicles_feed_response() {
		return $this->get_unity_csv_capable_feed_response_for_meta_key(
			self::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY,
			'cleanbcdx_ge_unity_eligible_vehicles_feed',
			\__( 'Unity Eligible Commercial Vehicles feed', 'plugin' ),
			array( 'include_decision_date' => true )
		);
	}

	/**
	 * Return the currently active unity intake class status feed attachment as a public API response.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_unity_intake_class_status_feed_response() {
		$feed_label = \__( 'Unity Intake Class Status feed', 'plugin' );
		$response   = $this->get_unity_csv_capable_feed_response_for_meta_key(
			self::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY,
			'cleanbcdx_ge_unity_intake_class_status_feed',
			$feed_label,
			array(
				'flat_headers' => array( 'label', 'value', 'intake' ),
			)
		);

		if ( \is_wp_error( $response ) ) {
			return $response;
		}

		$data = $response->get_data();

		if ( ! is_array( $data ) ) {
			return new \WP_Error(
				'cleanbcdx_ge_unity_intake_class_status_feed_invalid_data',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s must contain a JSON array or CSV rows.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 422 )
			);
		}

		$response->set_data( $this->normalize_unity_intake_class_status_feed_rows( $data ) );

		return $response;
	}

	/**
	 * Return the currently active JSON or CSV attachment for a feed as a public API response.
	 *
	 * @param string $meta_key          Attachment meta key that flags the active feed file.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @param array  $csv_options       CSV parsing options.
	 * @return \WP_REST_Response|\WP_Error
	 */
	protected function get_unity_csv_capable_feed_response_for_meta_key( $meta_key, $error_code_prefix, $feed_label, $csv_options = array() ) {
		$attachment_id = $this->get_active_unity_feed_attachment_id( $meta_key );

		if ( $attachment_id <= 0 ) {
			return new \WP_Error(
				$error_code_prefix . '_not_found',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'No active JSON or CSV file is available for the %s.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 404 )
			);
		}

		if ( $this->is_json_attachment( $attachment_id ) ) {
			return $this->get_unity_json_feed_response_for_attachment( $attachment_id, $error_code_prefix, $feed_label );
		}

		if ( $this->is_csv_attachment( $attachment_id ) ) {
			if ( ! empty( $csv_options['flat_headers'] ) ) {
				return $this->get_unity_flat_csv_feed_response_for_attachment( $attachment_id, $error_code_prefix, $feed_label, $csv_options['flat_headers'] );
			}

			return $this->get_unity_vehicle_csv_feed_response_for_attachment( $attachment_id, $error_code_prefix, $feed_label, $csv_options );
		}

		return new \WP_Error(
			$error_code_prefix . '_invalid_attachment',
			sprintf(
				/* translators: %s: feed label. */
				\__( 'The active attachment for the %s must be a JSON or CSV file.', 'plugin' ),
				$feed_label
			),
			array( 'status' => 422 )
		);
	}

	/**
	 * Return the currently active JSON attachment for a feed as a public API response.
	 *
	 * If multiple JSON uploads are marked active for the same feed, the newest upload wins and older uploads are ignored.
	 *
	 * @param string $meta_key          Attachment meta key that flags the active feed file.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @return \WP_REST_Response|\WP_Error
	 */
	protected function get_unity_feed_response_for_meta_key( $meta_key, $error_code_prefix, $feed_label ) {
		$attachment_id = $this->get_active_unity_feed_attachment_id( $meta_key );

		if ( $attachment_id <= 0 ) {
			return new \WP_Error(
				$error_code_prefix . '_not_found',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'No active JSON file is available for the %s.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 404 )
			);
		}

		if ( ! $this->is_json_attachment( $attachment_id ) ) {
			return new \WP_Error(
				$error_code_prefix . '_not_json',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active attachment for the %s must be a JSON file.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 422 )
			);
		}

		return $this->get_unity_json_feed_response_for_attachment( $attachment_id, $error_code_prefix, $feed_label );
	}

	/**
	 * Return a JSON attachment as a public API response.
	 *
	 * @param int    $attachment_id      Attachment ID.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @return \WP_REST_Response|\WP_Error
	 */
	protected function get_unity_json_feed_response_for_attachment( $attachment_id, $error_code_prefix, $feed_label ) {
		$file_path = $this->get_attachment_file_path( $attachment_id );

		if ( empty( $file_path ) || ! file_exists( $file_path ) || ! is_readable( $file_path ) ) {
			return new \WP_Error(
				$error_code_prefix . '_missing_file',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s could not be found.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 404 )
			);
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Reading a verified local attachment path, not a remote URL.
		$json = file_get_contents( $file_path );

		if ( false === $json ) {
			return new \WP_Error(
				$error_code_prefix . '_unreadable_file',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s could not be read.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 500 )
			);
		}

		$data = json_decode( $json );

		if ( JSON_ERROR_NONE !== json_last_error() ) {
			return new \WP_Error(
				$error_code_prefix . '_invalid_json',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s does not contain valid JSON.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 422 )
			);
		}

		$response = \rest_ensure_response( $data );
		$response->header( 'X-Content-Type-Options', 'nosniff' );

		return $response;
	}

	/**
	 * Return a CSV-backed vehicle feed attachment as a public API response.
	 *
	 * @param int    $attachment_id      Attachment ID.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @param array  $csv_options       CSV parsing options.
	 * @return \WP_REST_Response|\WP_Error
	 */
	protected function get_unity_vehicle_csv_feed_response_for_attachment( $attachment_id, $error_code_prefix, $feed_label, $csv_options = array() ) {
		$file_path = $this->get_attachment_file_path( $attachment_id );

		if ( empty( $file_path ) || ! file_exists( $file_path ) || ! is_readable( $file_path ) ) {
			return new \WP_Error(
				$error_code_prefix . '_missing_file',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s could not be found.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 404 )
			);
		}

		$data = $this->parse_unity_vehicle_csv_file( $file_path, $error_code_prefix, $feed_label, $csv_options );

		if ( \is_wp_error( $data ) ) {
			return $data;
		}

		$response = \rest_ensure_response( $data );
		$response->header( 'X-Content-Type-Options', 'nosniff' );

		return $response;
	}

	/**
	 * Return a CSV-backed flat feed attachment as a public API response.
	 *
	 * @param int    $attachment_id      Attachment ID.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @param array  $required_headers  Required CSV headers to return in each row.
	 * @return \WP_REST_Response|\WP_Error
	 */
	protected function get_unity_flat_csv_feed_response_for_attachment( $attachment_id, $error_code_prefix, $feed_label, $required_headers ) {
		$file_path = $this->get_attachment_file_path( $attachment_id );

		if ( empty( $file_path ) || ! file_exists( $file_path ) || ! is_readable( $file_path ) ) {
			return new \WP_Error(
				$error_code_prefix . '_missing_file',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s could not be found.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 404 )
			);
		}

		$data = $this->parse_unity_flat_csv_file( $file_path, $error_code_prefix, $feed_label, $required_headers );

		if ( \is_wp_error( $data ) ) {
			return $data;
		}

		$response = \rest_ensure_response( $data );
		$response->header( 'X-Content-Type-Options', 'nosniff' );

		return $response;
	}

	/**
	 * Parse a flat CSV feed attachment into an array of rows.
	 *
	 * @param string $file_path         Absolute file path.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @param array  $required_headers  Required CSV headers to return in each row.
	 * @return array|\WP_Error
	 */
	protected function parse_unity_flat_csv_file( $file_path, $error_code_prefix, $feed_label, $required_headers ) {
		$handle = fopen( $file_path, 'r' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen -- Reading a verified local attachment path.

		if ( false === $handle ) {
			return new \WP_Error(
				$error_code_prefix . '_unreadable_file',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s could not be read.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 500 )
			);
		}

		$headers = fgetcsv( $handle );

		if ( false === $headers ) {
			fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing a verified local file handle.

			return new \WP_Error(
				$error_code_prefix . '_invalid_csv',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s does not contain a valid CSV header row.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 422 )
			);
		}

		$headers      = $this->normalize_unity_csv_headers( $headers );
		$header_error = $this->validate_unity_required_csv_headers( $headers, $required_headers, $error_code_prefix, $feed_label );

		if ( \is_wp_error( $header_error ) ) {
			fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing a verified local file handle.

			return $header_error;
		}

		$rows        = array();
		$line_number = 1;

		while ( true ) {
			$row = fgetcsv( $handle );

			if ( false === $row ) {
				break;
			}

			++$line_number;

			if ( $this->is_unity_csv_row_blank( $row ) ) {
				continue;
			}

			if ( count( $row ) !== count( $headers ) ) {
				fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing a verified local file handle.

				return $this->get_unity_invalid_csv_error(
					$error_code_prefix,
					$feed_label,
					sprintf(
						/* translators: %1$s: feed label, %2$d: line number. */
						\__( 'The active file for the %1$s contains an invalid CSV row at line %2$d.', 'plugin' ),
						$feed_label,
						$line_number
					)
				);
			}

			$record = array_combine( $headers, $row );
			$entry  = array();

			foreach ( $required_headers as $header ) {
				$value = trim( (string) $record[ $header ] );

				if ( '' === $value ) {
					fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing a verified local file handle.

					return $this->get_unity_invalid_csv_error(
						$error_code_prefix,
						$feed_label,
						sprintf(
							/* translators: %1$s: feed label, %2$s: field name, %3$d: line number. */
							\__( 'The active file for the %1$s is missing a value for %2$s at line %3$d.', 'plugin' ),
							$feed_label,
							$header,
							$line_number
						)
					);
				}

				$entry[ $header ] = $value;
			}

			$rows[] = $entry;
		}

		fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing a verified local file handle.

		return $rows;
	}

	/**
	 * Normalize intake class status rows so the public feed only exposes open classes.
	 *
	 * @param array $rows Parsed intake class status rows.
	 * @return array
	 */
	protected function normalize_unity_intake_class_status_feed_rows( $rows ) {
		$normalized_rows = array();

		foreach ( $rows as $row ) {
			if ( is_object( $row ) ) {
				$row = get_object_vars( $row );
			}

			if ( ! is_array( $row ) ) {
				continue;
			}

			$intake = strtolower( trim( (string) ( isset( $row['intake'] ) ? $row['intake'] : '' ) ) );

			if ( 'open' !== $intake ) {
				continue;
			}

			$normalized_rows[] = array(
				'label'  => trim( (string) ( isset( $row['label'] ) ? $row['label'] : '' ) ),
				'value'  => trim( (string) ( isset( $row['value'] ) ? $row['value'] : '' ) ),
				'intake' => 'open',
			);
		}

		return $normalized_rows;
	}

	/**
	 * Normalize OEM feed data to the public make/model-only response shape.
	 *
	 * @param mixed  $data       Parsed OEM feed data.
	 * @param string $feed_label Human-readable feed label.
	 * @return array|\WP_Error
	 */
	protected function normalize_unity_oem_feed_response_data( $data, $feed_label ) {
		if ( is_object( $data ) ) {
			$data = get_object_vars( $data );
		}

		if ( ! is_array( $data ) ) {
			return new \WP_Error(
				'cleanbcdx_ge_unity_oem_feed_invalid_data',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s must contain an array of manufacturers or a single manufacturer object.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 422 )
			);
		}

		if ( isset( $data['make'] ) ) {
			$data = array( $data );
		} elseif ( array_keys( $data ) !== array_keys( array_values( $data ) ) ) {
			return new \WP_Error(
				'cleanbcdx_ge_unity_oem_feed_invalid_data',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s must contain an array of manufacturers or a single manufacturer object.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 422 )
			);
		}

		$manufacturers = array();

		foreach ( $data as $manufacturer ) {
			if ( is_object( $manufacturer ) ) {
				$manufacturer = get_object_vars( $manufacturer );
			}

			if ( ! is_array( $manufacturer ) ) {
				continue;
			}

			$make = trim( (string) ( isset( $manufacturer['make'] ) ? $manufacturer['make'] : '' ) );

			if ( '' === $make ) {
				continue;
			}

			$make_key = strtolower( $make );

			if ( ! isset( $manufacturers[ $make_key ] ) ) {
				$manufacturers[ $make_key ] = array(
					'make'   => $make,
					'models' => array(),
				);
			}

			$models = isset( $manufacturer['models'] ) ? $manufacturer['models'] : array();

			if ( is_object( $models ) ) {
				$models = get_object_vars( $models );
			}

			if ( ! is_array( $models ) ) {
				continue;
			}

			foreach ( $models as $model ) {
				$model_name = $this->get_unity_oem_model_name( $model );
				if ( '' === $model_name ) {
					continue;
				}

				$manufacturers[ $make_key ]['models'][ strtolower( $model_name ) ] = array(
					'model_name' => $model_name,
				);
			}
		}

		ksort( $manufacturers, SORT_NATURAL | SORT_FLAG_CASE );

		foreach ( $manufacturers as &$manufacturer ) {
			ksort( $manufacturer['models'], SORT_NATURAL | SORT_FLAG_CASE );
			$manufacturer['models'] = array_values( $manufacturer['models'] );
		}

		unset( $manufacturer );

		return array_values( $manufacturers );
	}

	/**
	 * Extract a model name from an OEM feed model entry.
	 *
	 * @param mixed $model OEM feed model entry.
	 * @return string
	 */
	protected function get_unity_oem_model_name( $model ) {
		if ( is_string( $model ) || is_numeric( $model ) ) {
			return trim( (string) $model );
		}

		if ( is_object( $model ) ) {
			$model = get_object_vars( $model );
		}

		if ( ! is_array( $model ) ) {
			return '';
		}

		return trim( (string) ( isset( $model['model_name'] ) ? $model['model_name'] : '' ) );
	}

	/**
	 * Parse a CSV vehicle feed attachment into the public response shape.
	 *
	 * @param string $file_path         Absolute file path.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @param array  $csv_options       CSV parsing options.
	 * @return array|\WP_Error
	 */
	protected function parse_unity_vehicle_csv_file( $file_path, $error_code_prefix, $feed_label, $csv_options = array() ) {
		$handle = fopen( $file_path, 'r' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen -- Reading a verified local attachment path.

		if ( false === $handle ) {
			return new \WP_Error(
				$error_code_prefix . '_unreadable_file',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s could not be read.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 500 )
			);
		}

		$headers = fgetcsv( $handle );

		if ( false === $headers ) {
			fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing a verified local file handle.

			return new \WP_Error(
				$error_code_prefix . '_invalid_csv',
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s does not contain a valid CSV header row.', 'plugin' ),
					$feed_label
				),
				array( 'status' => 422 )
			);
		}

		$headers      = $this->normalize_unity_csv_headers( $headers );
		$header_error = $this->validate_unity_vehicle_csv_headers( $headers, $error_code_prefix, $feed_label, $csv_options );

		if ( \is_wp_error( $header_error ) ) {
			fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing a verified local file handle.

			return $header_error;
		}

		$manufacturers = array();
		$line_number   = 1;

		while ( true ) {
			$row = fgetcsv( $handle );

			if ( false === $row ) {
				break;
			}

			++$line_number;

			if ( $this->is_unity_csv_row_blank( $row ) ) {
				continue;
			}

			if ( count( $row ) !== count( $headers ) ) {
				fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing a verified local file handle.

				return $this->get_unity_invalid_csv_error(
					$error_code_prefix,
					$feed_label,
					sprintf(
						/* translators: %1$s: feed label, %2$d: line number. */
						\__( 'The active file for the %1$s contains an invalid CSV row at line %2$d.', 'plugin' ),
						$feed_label,
						$line_number
					)
				);
			}

			$record = array_combine( $headers, $row );
			$entry  = $this->normalize_unity_vehicle_csv_record( $record, $line_number, $error_code_prefix, $feed_label, $csv_options );

			if ( \is_wp_error( $entry ) ) {
				fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing a verified local file handle.

				return $entry;
			}

			$this->append_unity_vehicle_csv_entry( $manufacturers, $entry, $csv_options );
		}

		fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose -- Closing a verified local file handle.

		return $this->finalize_unity_vehicle_csv_feed_data( $manufacturers );
	}

	/**
	 * Save a feed flag for an attachment.
	 *
	 * @param int    $post_id   Attachment ID.
	 * @param string $meta_key  Attachment meta key.
	 * @param bool   $is_active Whether the feed should be active.
	 * @return void
	 */
	protected function update_unity_feed_attachment_flag( $post_id, $meta_key, $is_active ) {
		if ( $is_active ) {
			\update_post_meta( $post_id, $meta_key, '1' );
		} else {
			\delete_post_meta( $post_id, $meta_key );
		}
	}

	/**
	 * Return the newest active attachment ID for a feed.
	 *
	 * @param string $meta_key Attachment meta key.
	 * @return int
	 */
	protected function get_active_unity_feed_attachment_id( $meta_key ) {
		$attachment_ids = \get_posts(
			array(
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'posts_per_page' => 1,
				'orderby'        => 'ID',
				'order'          => 'DESC',
				'fields'         => 'ids',
				'meta_key'       => $meta_key,
				'meta_value'     => '1',
			)
		);

		if ( empty( $attachment_ids ) ) {
			return 0;
		}

		return (int) $attachment_ids[0];
	}

	/**
	 * Determine whether the attachment is a JSON file.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool
	 */
	protected function is_json_attachment( $attachment_id ) {
		$attachment_id = (int) $attachment_id;

		if ( $attachment_id <= 0 ) {
			return false;
		}

		if ( 'application/json' === \get_post_mime_type( $attachment_id ) ) {
			return true;
		}

		return 'json' === $this->get_file_extension( $this->get_attachment_file_path( $attachment_id ) );
	}

	/**
	 * Determine whether the attachment is a CSV file.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool
	 */
	protected function is_csv_attachment( $attachment_id ) {
		$attachment_id = (int) $attachment_id;

		if ( $attachment_id <= 0 ) {
			return false;
		}

		return 'csv' === $this->get_file_extension( $this->get_attachment_file_path( $attachment_id ) );
	}

	/**
	 * Return the attached file path, falling back to stored attachment metadata.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return string
	 */
	protected function get_attachment_file_path( $attachment_id ) {
		$file_path = \get_attached_file( $attachment_id );

		if ( empty( $file_path ) ) {
			$file_path = (string) \get_post_meta( $attachment_id, '_wp_attached_file', true );
		}

		return (string) $file_path;
	}

	/**
	 * Return a lowercase file extension.
	 *
	 * @param string $file_path File path or filename.
	 * @return string
	 */
	protected function get_file_extension( $file_path ) {
		return strtolower( pathinfo( (string) $file_path, PATHINFO_EXTENSION ) );
	}

	/**
	 * Normalize the CSV header row.
	 *
	 * @param array $headers Raw CSV headers.
	 * @return array
	 */
	protected function normalize_unity_csv_headers( $headers ) {
		$normalized = array();

		foreach ( $headers as $index => $header ) {
			$header = trim( (string) $header );

			if ( 0 === $index ) {
				$header = preg_replace( '/^\xEF\xBB\xBF/', '', $header );
			}

			$normalized[] = $header;
		}

		return $normalized;
	}

	/**
	 * Validate that the CSV headers include the required vehicle feed columns.
	 *
	 * @param array  $headers           Normalized CSV headers.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @param array  $csv_options       CSV parsing options.
	 * @return true|\WP_Error
	 */
	protected function validate_unity_vehicle_csv_headers( $headers, $error_code_prefix, $feed_label, $csv_options = array() ) {
		$required_headers = array(
			'make',
			'model',
			'configuration',
			'model_year',
			'vehicle_class',
			'vehicle_type',
			'fuel_type',
			'battery_size',
			'lower_battery_range',
			'upper_battery_range',
			'battery_size_range',
		);

		if ( ! empty( $csv_options['include_decision_date'] ) ) {
			$required_headers[] = 'decision_date';
		}

		return $this->validate_unity_required_csv_headers( $headers, $required_headers, $error_code_prefix, $feed_label );
	}

	/**
	 * Validate that the CSV headers include the required columns.
	 *
	 * @param array  $headers           Normalized CSV headers.
	 * @param array  $required_headers  Required CSV headers.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @return true|\WP_Error
	 */
	protected function validate_unity_required_csv_headers( $headers, $required_headers, $error_code_prefix, $feed_label ) {

		if ( count( array_filter( $headers, 'strlen' ) ) !== count( array_unique( array_filter( $headers, 'strlen' ) ) ) || in_array( '', $headers, true ) ) {
			return $this->get_unity_invalid_csv_error(
				$error_code_prefix,
				$feed_label,
				sprintf(
					/* translators: %s: feed label. */
					\__( 'The active file for the %s contains duplicate or empty CSV headers.', 'plugin' ),
					$feed_label
				)
			);
		}

		$missing_headers = array_diff( $required_headers, $headers );

		if ( ! empty( $missing_headers ) ) {
			return $this->get_unity_invalid_csv_error(
				$error_code_prefix,
				$feed_label,
				sprintf(
					/* translators: %1$s: feed label, %2$s: missing headers. */
					\__( 'The active file for the %1$s is missing required CSV headers: %2$s.', 'plugin' ),
					$feed_label,
					implode( ', ', $missing_headers )
				)
			);
		}

		return true;
	}

	/**
	 * Determine whether a CSV row contains only blank values.
	 *
	 * @param array $row CSV row values.
	 * @return bool
	 */
	protected function is_unity_csv_row_blank( $row ) {
		foreach ( $row as $value ) {
			if ( '' !== trim( (string) $value ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Normalize a single CSV record into the vehicle feed response row structure.
	 *
	 * @param array  $record             CSV row indexed by header.
	 * @param int    $line_number        CSV line number.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @param array  $csv_options       CSV parsing options.
	 * @return array|\WP_Error
	 */
	protected function normalize_unity_vehicle_csv_record( $record, $line_number, $error_code_prefix, $feed_label, $csv_options = array() ) {
		$entry = array(
			'make'                => $this->get_unity_vehicle_required_csv_text( $record, 'make', $line_number, $error_code_prefix, $feed_label ),
			'model_name'          => $this->get_unity_vehicle_required_csv_text( $record, 'model', $line_number, $error_code_prefix, $feed_label ),
			'configuration_name'  => $this->get_unity_vehicle_required_csv_text( $record, 'configuration', $line_number, $error_code_prefix, $feed_label ),
			'year'                => $this->get_unity_vehicle_required_csv_integer( $record, 'model_year', $line_number, $error_code_prefix, $feed_label ),
			'vehicle_class_name'  => $this->get_unity_vehicle_required_csv_text( $record, 'vehicle_class', $line_number, $error_code_prefix, $feed_label ),
			'vehicle_type_name'   => $this->get_unity_vehicle_required_csv_text( $record, 'vehicle_type', $line_number, $error_code_prefix, $feed_label ),
			'fuel_type_name'      => $this->get_unity_vehicle_required_csv_text( $record, 'fuel_type', $line_number, $error_code_prefix, $feed_label ),
			'battery_size'        => $this->get_unity_vehicle_optional_csv_integer( $record, 'battery_size', $line_number, $error_code_prefix, $feed_label ),
			'lower_battery_range' => $this->get_unity_vehicle_optional_csv_integer( $record, 'lower_battery_range', $line_number, $error_code_prefix, $feed_label ),
			'upper_battery_range' => $this->get_unity_vehicle_optional_csv_integer( $record, 'upper_battery_range', $line_number, $error_code_prefix, $feed_label ),
			'battery_size_range'  => trim( (string) $record['battery_size_range'] ),
		);

		if ( ! empty( $csv_options['include_decision_date'] ) ) {
			$entry['decision_date'] = $this->get_unity_vehicle_optional_csv_text( $record, 'decision_date' );
		}

		foreach ( $entry as $value ) {
			if ( \is_wp_error( $value ) ) {
				return $value;
			}
		}

		return $entry;
	}

	/**
	 * Return a required CSV text value.
	 *
	 * @param array  $record             CSV row indexed by header.
	 * @param string $field              Field name.
	 * @param int    $line_number        CSV line number.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @return string|\WP_Error
	 */
	protected function get_unity_vehicle_required_csv_text( $record, $field, $line_number, $error_code_prefix, $feed_label ) {
		$value = trim( (string) $record[ $field ] );

		if ( '' === $value ) {
			return $this->get_unity_invalid_csv_error(
				$error_code_prefix,
				$feed_label,
				sprintf(
					/* translators: %1$s: feed label, %2$s: field name, %3$d: line number. */
					\__( 'The active file for the %1$s is missing a value for %2$s at line %3$d.', 'plugin' ),
					$feed_label,
					$field,
					$line_number
				)
			);
		}

		return $value;
	}

	/**
	 * Return an optional CSV text value.
	 *
	 * @param array  $record CSV row indexed by header.
	 * @param string $field  Field name.
	 * @return string
	 */
	protected function get_unity_vehicle_optional_csv_text( $record, $field ) {
		return trim( (string) $record[ $field ] );
	}

	/**
	 * Return a required CSV integer value.
	 *
	 * @param array  $record             CSV row indexed by header.
	 * @param string $field              Field name.
	 * @param int    $line_number        CSV line number.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @return int|\WP_Error
	 */
	protected function get_unity_vehicle_required_csv_integer( $record, $field, $line_number, $error_code_prefix, $feed_label ) {
		$value = trim( (string) $record[ $field ] );

		if ( '' === $value || ! is_numeric( $value ) ) {
			return $this->get_unity_invalid_csv_error(
				$error_code_prefix,
				$feed_label,
				sprintf(
					/* translators: %1$s: feed label, %2$s: field name, %3$d: line number. */
					\__( 'The active file for the %1$s contains an invalid numeric value for %2$s at line %3$d.', 'plugin' ),
					$feed_label,
					$field,
					$line_number
				)
			);
		}

		return (int) $value;
	}

	/**
	 * Return an optional CSV integer value.
	 *
	 * @param array  $record             CSV row indexed by header.
	 * @param string $field              Field name.
	 * @param int    $line_number        CSV line number.
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @return int|null|\WP_Error
	 */
	protected function get_unity_vehicle_optional_csv_integer( $record, $field, $line_number, $error_code_prefix, $feed_label ) {
		$value = trim( (string) $record[ $field ] );

		if ( '' === $value ) {
			return null;
		}

		if ( ! is_numeric( $value ) ) {
			return $this->get_unity_invalid_csv_error(
				$error_code_prefix,
				$feed_label,
				sprintf(
					/* translators: %1$s: feed label, %2$s: field name, %3$d: line number. */
					\__( 'The active file for the %1$s contains an invalid numeric value for %2$s at line %3$d.', 'plugin' ),
					$feed_label,
					$field,
					$line_number
				)
			);
		}

		return (int) $value;
	}

	/**
	 * Append a normalized CSV row into the nested vehicle feed response structure.
	 *
	 * @param array $manufacturers Nested manufacturer data.
	 * @param array $entry         Normalized CSV row.
	 * @param array $csv_options   CSV parsing options.
	 * @return void
	 */
	protected function append_unity_vehicle_csv_entry( &$manufacturers, $entry, $csv_options = array() ) {
		$make_key = $entry['make'];

		if ( ! isset( $manufacturers[ $make_key ] ) ) {
			$manufacturers[ $make_key ] = array(
				'make'   => $entry['make'],
				'models' => array(),
			);
		}

		if ( ! isset( $manufacturers[ $make_key ]['models'][ $entry['model_name'] ] ) ) {
			$manufacturers[ $make_key ]['models'][ $entry['model_name'] ] = array(
				'model_name'    => $entry['model_name'],
				'configuration' => array(),
			);
		}

		if ( ! isset( $manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ] ) ) {
			$manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ] = array(
				'configuration_name' => $entry['configuration_name'],
				'model_years'        => array(),
			);
		}

		$year_key = (string) $entry['year'];

		if ( ! isset( $manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ]['model_years'][ $year_key ] ) ) {
			$manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ]['model_years'][ $year_key ] = array(
				'year'          => $entry['year'],
				'vehicle_class' => array(),
			);
		}

		if ( ! isset( $manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ]['model_years'][ $year_key ]['vehicle_class'][ $entry['vehicle_class_name'] ] ) ) {
			$manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ]['model_years'][ $year_key ]['vehicle_class'][ $entry['vehicle_class_name'] ] = array(
				'vehicle_class_name' => $entry['vehicle_class_name'],
				'vehicle_type'       => array(),
			);
		}

		if ( ! isset( $manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ]['model_years'][ $year_key ]['vehicle_class'][ $entry['vehicle_class_name'] ]['vehicle_type'][ $entry['vehicle_type_name'] ] ) ) {
			$manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ]['model_years'][ $year_key ]['vehicle_class'][ $entry['vehicle_class_name'] ]['vehicle_type'][ $entry['vehicle_type_name'] ] = array(
				'vehicle_type_name' => $entry['vehicle_type_name'],
				'fuel_type'         => array(),
			);
		}

		if ( ! isset( $manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ]['model_years'][ $year_key ]['vehicle_class'][ $entry['vehicle_class_name'] ]['vehicle_type'][ $entry['vehicle_type_name'] ]['fuel_type'][ $entry['fuel_type_name'] ] ) ) {
			$manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ]['model_years'][ $year_key ]['vehicle_class'][ $entry['vehicle_class_name'] ]['vehicle_type'][ $entry['vehicle_type_name'] ]['fuel_type'][ $entry['fuel_type_name'] ] = array(
				'fuel_type_name' => $entry['fuel_type_name'],
				'battery'        => array(),
			);
		}

		$battery = array(
			'battery_size'        => $entry['battery_size'],
			'lower_battery_range' => $entry['lower_battery_range'],
			'upper_battery_range' => $entry['upper_battery_range'],
			'battery_size_range'  => $entry['battery_size_range'],
		);

		if ( ! empty( $csv_options['include_decision_date'] ) ) {
			$battery['decision_date'] = $entry['decision_date'];
		}

		$manufacturers[ $make_key ]['models'][ $entry['model_name'] ]['configuration'][ $entry['configuration_name'] ]['model_years'][ $year_key ]['vehicle_class'][ $entry['vehicle_class_name'] ]['vehicle_type'][ $entry['vehicle_type_name'] ]['fuel_type'][ $entry['fuel_type_name'] ]['battery'][] = $battery;
	}

	/**
	 * Convert the internal CSV grouping map into the public response arrays.
	 *
	 * @param array $manufacturers Nested manufacturer data.
	 * @return array
	 */
	protected function finalize_unity_vehicle_csv_feed_data( $manufacturers ) {
		foreach ( $manufacturers as &$manufacturer ) {
			foreach ( $manufacturer['models'] as &$model ) {
				foreach ( $model['configuration'] as &$configuration ) {
					foreach ( $configuration['model_years'] as &$model_year ) {
						foreach ( $model_year['vehicle_class'] as &$vehicle_class ) {
							foreach ( $vehicle_class['vehicle_type'] as &$vehicle_type ) {
								$vehicle_type['fuel_type'] = array_values( $vehicle_type['fuel_type'] );
							}

							$vehicle_class['vehicle_type'] = array_values( $vehicle_class['vehicle_type'] );
						}

						$model_year['vehicle_class'] = array_values( $model_year['vehicle_class'] );
					}

					$configuration['model_years'] = array_values( $configuration['model_years'] );
				}

				$model['configuration'] = array_values( $model['configuration'] );
			}

			$manufacturer['models'] = array_values( $manufacturer['models'] );
		}

		unset( $manufacturer, $model, $configuration, $model_year, $vehicle_class, $vehicle_type );

		return array_values( $manufacturers );
	}

	/**
	 * Create a standardized invalid CSV error response.
	 *
	 * @param string $error_code_prefix Error code prefix for feed-specific failures.
	 * @param string $feed_label        Human-readable feed label.
	 * @param string $message           Error message.
	 * @return \WP_Error
	 */
	protected function get_unity_invalid_csv_error( $error_code_prefix, $feed_label, $message ) {
		return new \WP_Error(
			$error_code_prefix . '_invalid_csv',
			$message,
			array(
				'status'     => 422,
				'feed_label' => $feed_label,
			)
		);
	}
}
