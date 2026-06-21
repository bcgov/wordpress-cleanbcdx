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
	 * Attachment meta key used to flag JSON uploads for the public unity OEM feed.
	 */
	const UNITY_OEM_FEED_META_KEY = '_cleanbcdx_ge_unity_oem_feed_active';

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
	 * Allow JSON files to be uploaded via the Media Library.
	 *
	 * @param array $mimes The allowed mime types keyed by file extension.
	 * @return array
	 */
	public function allow_json_uploads( $mimes ) {
		$mimes['json'] = 'application/json';

		return $mimes;
	}

	/**
	 * Normalise JSON file detection when the server reports a generic mime type.
	 *
	 * @param array  $data     Values for the extension, mime type, and corrected filename.
	 * @param string $file     Full path to the uploaded file.
	 * @param string $filename The original uploaded filename.
	 * @return array
	 */
	public function fix_json_filetype( $data, $file, $filename ) {
		$extension = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );

		if ( empty( $extension ) ) {
			$extension = strtolower( pathinfo( $file, PATHINFO_EXTENSION ) );
		}

		if ( 'json' !== $extension ) {
			return $data;
		}

		$data['ext']  = 'json';
		$data['type'] = 'application/json';

		return $data;
	}

	/**
	 * Add grouped feed selectors to JSON attachments so editors can expose a file at the public feed endpoints.
	 *
	 * @param array    $form_fields Attachment form fields.
	 * @param \WP_Post $post        The attachment post object.
	 * @return array
	 */
	public function add_unity_feed_attachment_field( $form_fields, $post ) {
		if ( ! $this->is_json_attachment( $post->ID ) ) {
			return $form_fields;
		}

		$form_fields['cleanbcdx_ge_unity_feed_settings'] = array(
			'label' => \__( 'Unity JSON data', 'plugin' ),
			'input' => 'html',
			'html'  => sprintf(
				'<fieldset><legend class="screen-reader-text">%1$s</legend>' .
				'<label for="attachments-%2$d-cleanbcdx-ge-unity-retroactive-feed-active">' .
				'<input type="checkbox" id="attachments-%2$d-cleanbcdx-ge-unity-retroactive-feed-active" name="attachments[%2$d][cleanbcdx_ge_unity_retroactive_feed_active]" value="1" %3$s /> %4$s' .
				'</label><br />' .
				'<label for="attachments-%2$d-cleanbcdx-ge-unity-oem-feed-active">' .
				'<input type="checkbox" id="attachments-%2$d-cleanbcdx-ge-unity-oem-feed-active" name="attachments[%2$d][cleanbcdx_ge_unity_oem_feed_active]" value="1" %5$s /> %6$s' .
				'</label></fieldset>',
				\esc_attr__( 'Unity JSON data', 'plugin' ),
				(int) $post->ID,
				\checked( '1', \get_post_meta( $post->ID, self::UNITY_RETROACTIVE_FEED_META_KEY, true ), false ),
				\esc_html__( 'Retroactive feed – custom/v1/unity-retroactive-feed(.json)', 'plugin' ),
				\checked( '1', \get_post_meta( $post->ID, self::UNITY_OEM_FEED_META_KEY, true ), false ),
				\esc_html__( 'OEM feed – custom/v1/unity-oem-feed(.json)', 'plugin' )
			),
			'helps' => \__( 'Expose the selected file at the public Unity Retroactive and/or OEM feed endpoints. If multiple JSON files are marked active for the same feed, the newest upload is served.', 'plugin' ),
		);

		return $form_fields;
	}

	/**
	 * Save the feed selectors for a JSON attachment.
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

		if ( ! $this->is_json_attachment( $post_id ) ) {
			\delete_post_meta( $post_id, self::UNITY_RETROACTIVE_FEED_META_KEY );
			\delete_post_meta( $post_id, self::UNITY_OEM_FEED_META_KEY );

			return $post;
		}

		$this->update_unity_feed_attachment_flag(
			$post_id,
			self::UNITY_RETROACTIVE_FEED_META_KEY,
			! empty( $attachment['cleanbcdx_ge_unity_retroactive_feed_active'] )
		);

		$this->update_unity_feed_attachment_flag(
			$post_id,
			self::UNITY_OEM_FEED_META_KEY,
			! empty( $attachment['cleanbcdx_ge_unity_oem_feed_active'] )
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
			array_merge( $route_args, array( 'callback' => [ $this, 'get_unity_retroactive_feed_response' ] ) )
		);
		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_RETROACTIVE_FEED_JSON_ROUTE,
			array_merge( $route_args, array( 'callback' => [ $this, 'get_unity_retroactive_feed_response' ] ) )
		);
		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_OEM_FEED_ROUTE,
			array_merge( $route_args, array( 'callback' => [ $this, 'get_unity_oem_feed_response' ] ) )
		);
		\register_rest_route(
			self::UNITY_FEED_NAMESPACE,
			self::UNITY_OEM_FEED_JSON_ROUTE,
			array_merge( $route_args, array( 'callback' => [ $this, 'get_unity_oem_feed_response' ] ) )
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
	 * Return the currently active unity OEM feed JSON attachment as a public API response.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_unity_oem_feed_response() {
		return $this->get_unity_feed_response_for_meta_key(
			self::UNITY_OEM_FEED_META_KEY,
			'cleanbcdx_ge_unity_oem_feed',
			\__( 'Unity OEM feed', 'plugin' )
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

		$file_path = \get_attached_file( $attachment_id );

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
	 * Return the newest active JSON attachment ID for a feed.
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

		$file_path = \get_attached_file( $attachment_id );

		if ( empty( $file_path ) ) {
			$file_path = (string) \get_post_meta( $attachment_id, '_wp_attached_file', true );
		}

		return 'json' === strtolower( pathinfo( $file_path, PATHINFO_EXTENSION ) );
	}
}
