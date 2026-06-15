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
	 * Attachment meta key used to flag JSON uploads for the public unity feed.
	 */
	const UNITY_FEED_META_KEY = '_cleanbcdx_ge_unity_feed_active';

	/**
	 * REST namespace for the public unity feed.
	 */
	const UNITY_FEED_NAMESPACE = 'custom/v1';

	/**
	 * REST route for the public unity feed.
	 */
	const UNITY_FEED_ROUTE = '/unity-feed';

	/**
	 * REST route alias for clients that expect a .json suffix.
	 */
	const UNITY_FEED_JSON_ROUTE = '/unity-feed.json';

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
	 * Add a selector to JSON attachments so editors can expose a file at the unity feed endpoint.
	 *
	 * @param array    $form_fields Attachment form fields.
	 * @param \WP_Post $post        The attachment post object.
	 * @return array
	 */
	public function add_unity_feed_attachment_field( $form_fields, $post ) {
		if ( ! $this->is_json_attachment( $post->ID ) ) {
			return $form_fields;
		}

		$form_fields['cleanbcdx_ge_unity_feed_active'] = array(
			'label' => \__( 'Partner feed', 'plugin' ),
			'input' => 'html',
			'html'  => sprintf(
				'<input type="checkbox" id="attachments-%1$d-cleanbcdx-ge-unity-feed-active" name="attachments[%1$d][cleanbcdx_ge_unity_feed_active]" value="1" %2$s />',
				(int) $post->ID,
				\checked( '1', \get_post_meta( $post->ID, self::UNITY_FEED_META_KEY, true ), false )
			),
			'helps' => \__( 'Expose this JSON file at the public unity feed endpoint. If multiple JSON files are marked active, the newest upload is served.', 'plugin' ),
		);

		return $form_fields;
	}

	/**
	 * Save the unity feed selector for a JSON attachment.
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
			\delete_post_meta( $post_id, self::UNITY_FEED_META_KEY );

			return $post;
		}

		if ( ! empty( $attachment['cleanbcdx_ge_unity_feed_active'] ) ) {
			\update_post_meta( $post_id, self::UNITY_FEED_META_KEY, '1' );
		} else {
			\delete_post_meta( $post_id, self::UNITY_FEED_META_KEY );
		}

		return $post;
	}

	/**
	 * Register the public unity feed REST route.
	 *
	 * @return void
	 */
	public function register_unity_feed_routes() {
		$route_args = array(
			'methods'             => 'GET',
			'callback'            => [ $this, 'get_unity_feed_response' ],
			'permission_callback' => '__return_true',
		);

		\register_rest_route( self::UNITY_FEED_NAMESPACE, self::UNITY_FEED_ROUTE, $route_args );
		\register_rest_route( self::UNITY_FEED_NAMESPACE, self::UNITY_FEED_JSON_ROUTE, $route_args );
	}

	/**
	 * Return the currently active JSON attachment as a public API response.
	 *
	 * If multiple JSON uploads are marked active, the newest upload wins and older uploads are ignored.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function get_unity_feed_response() {
		$attachment_id = $this->get_active_unity_feed_attachment_id();

		if ( $attachment_id <= 0 ) {
			return new \WP_Error(
				'cleanbcdx_ge_unity_feed_not_found',
				\__( 'No active unity feed JSON file is available.', 'plugin' ),
				array( 'status' => 404 )
			);
		}

		if ( ! $this->is_json_attachment( $attachment_id ) ) {
			return new \WP_Error(
				'cleanbcdx_ge_unity_feed_not_json',
				\__( 'The active unity feed attachment must be a JSON file.', 'plugin' ),
				array( 'status' => 422 )
			);
		}

		$file_path = \get_attached_file( $attachment_id );

		if ( empty( $file_path ) || ! file_exists( $file_path ) || ! is_readable( $file_path ) ) {
			return new \WP_Error(
				'cleanbcdx_ge_unity_feed_missing_file',
				\__( 'The active unity feed file could not be found.', 'plugin' ),
				array( 'status' => 404 )
			);
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Reading a verified local attachment path, not a remote URL.
		$json = file_get_contents( $file_path );

		if ( false === $json ) {
			return new \WP_Error(
				'cleanbcdx_ge_unity_feed_unreadable_file',
				\__( 'The active unity feed file could not be read.', 'plugin' ),
				array( 'status' => 500 )
			);
		}

		$data = json_decode( $json );

		if ( JSON_ERROR_NONE !== json_last_error() ) {
			return new \WP_Error(
				'cleanbcdx_ge_unity_feed_invalid_json',
				\__( 'The active unity feed file does not contain valid JSON.', 'plugin' ),
				array( 'status' => 422 )
			);
		}

		$response = \rest_ensure_response( $data );
		$response->header( 'X-Content-Type-Options', 'nosniff' );

		return $response;
	}

	/**
	 * Return the newest active JSON attachment ID for the unity feed.
	 *
	 * @return int
	 */
	protected function get_active_unity_feed_attachment_id() {
		$attachment_ids = \get_posts(
			array(
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'posts_per_page' => 1,
				'orderby'        => 'ID',
				'order'          => 'DESC',
				'fields'         => 'ids',
				'meta_key'       => self::UNITY_FEED_META_KEY,
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
