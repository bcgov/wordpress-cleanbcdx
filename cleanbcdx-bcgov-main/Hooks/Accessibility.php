<?php

namespace Bcgov\Plugin\CleanBCDX\Hooks;

/**
 * The Accessibility class provides methods for modifying accessibility needs in WordPress.
 *
 * @since 1.17.0
 *
 * @package Bcgov\Plugin\CleanBCDX
 */
class Accessibility {

	/**
	 * Registers a custom rewrite rule for the PDF size proxy endpoint.
	 *
	 * This allows requests to /pdf-size-proxy to be routed through WordPress
	 * and handled by the pdf_proxy() method.
	 *
	 * @since 1.17.0
	 * @return void
	 */
	public function pdf_proxy_rewrite() {
		add_rewrite_rule( '^pdf-size-proxy', 'index.php?pdf_size_proxy=1', 'top' );
	}

	/**
	 * Adds a custom query variable used to detect PDF size proxy requests.
	 *
	 * This ensures WordPress recognizes 'pdf_size_proxy' as a valid query var,
	 * enabling the template_redirect handler to intercept matching requests.
	 *
	 * @since 1.17.0
	 *
	 * @param array $vars The existing public query variables.
	 * @return array Modified query variables including 'pdf_size_proxy'.
	 */
	public function pdf_proxy_size( $vars ) {
		$vars[] = 'pdf_size_proxy';
		return $vars;
	}

	/**
	 * Handles the PDF size proxy request and returns the file size as JSON.
	 *
	 * Validates the request nonce and checks the provided URL. The method follows up to 5 HTTP 301/302 redirects
	 * to determine the final destination URL. After redirects are resolved, it verifies that the final URL
	 * points to a PDF file by inspecting the Content-Type header.
	 *
	 * If the initial HEAD request does not return a usable Content-Type or Content-Length header, the method
	 * performs a fallback GET request with a byte-range header to confirm the PDF type and attempts to determine
	 * the file size from the Content-Range header if Content-Length is unavailable.
	 *
	 * The determined file size is cached using a transient keyed by the final URL to optimize subsequent requests.
	 *
	 * Returns a JSON object containing the file size (in bytes), the final resolved URL, the HTTP status code,
	 * and a cached indicator. If the URL is invalid, the content is not a PDF, or if any network request fails,
	 * an error object is returned instead.
	 *
	 * @since 1.17.0
	 * @return void
	 */
	public function pdf_proxy() {
		if ( ! isset( $_GET['pdf_size_proxy'] ) ) {
			return;
		}

		header( 'Content-Type: application/json' );

		$nonce = $_SERVER['HTTP_X_WP_NONCE'] ?? '';
		if ( ! wp_verify_nonce( $nonce, 'pdf_size_check' ) ) {
			echo wp_json_encode( [ 'error' => 'Invalid or missing nonce' ] );
			exit;
		}

		if ( ! isset( $_GET['url'] ) ) {
			echo wp_json_encode( [ 'error' => 'Missing URL' ] );
			exit;
		}

		$url = esc_url_raw( $_GET['url'] );
		if ( ! filter_var( $url, FILTER_VALIDATE_URL ) ) {
			echo wp_json_encode( [ 'error' => 'Invalid URL' ] );
			exit;
		}

		// Follow redirects manually to check if final destination is a PDF.
		$redirect_limit = 5;
		$redirect_count = 0;
		$final_url      = $url;
		$status_code    = null;

		do {
			$response = wp_remote_request(
				$final_url,
				[
					'method'      => 'HEAD',
					'timeout'     => 10,
					'headers'     => [ 'User-Agent' => 'WordPress PDF Proxy' ],
					'redirection' => 0,
				]
			);

			if ( is_wp_error( $response ) ) {
				echo wp_json_encode( [ 'error' => 'Request failed' ] );
				exit;
			}

			$status_code = wp_remote_retrieve_response_code( $response );

			if ( in_array( $status_code, [ 301, 302 ], true ) ) {
				$headers  = wp_remote_retrieve_headers( $response );
				$location = $headers['location'] ?? '';
				if ( empty( $location ) ) {
					echo wp_json_encode( [ 'error' => 'Redirect without Location header' ] );
					exit;
				}
				$final_url = esc_url_raw( $location );
				++$redirect_count;
			} else {
				break;
			}
		} while ( $redirect_count < $redirect_limit );

		if ( $redirect_count === $redirect_limit ) {
			echo wp_json_encode( [ 'error' => 'Too many redirects' ] );
			exit;
		}

		$cache_key = 'pdf_size_' . md5( $final_url );
		$cached    = get_transient( $cache_key );
		if ( false !== $cached && $cached > 0 ) {
			echo wp_json_encode(
				[
					'size'   => $cached,
					'cached' => true,
					'url'    => $final_url,
					'status' => $status_code,
				]
			);
			exit;
		}

		$response = wp_remote_request(
			$final_url,
			[
				'method'  => 'HEAD',
				'timeout' => 10,
			]
		);

		$headers      = wp_remote_retrieve_headers( $response );
		$content_type = isset( $headers['content-type'] ) ? strtolower( $headers['content-type'] ) : '';

		if ( empty( $content_type ) || strpos( $content_type, 'application/pdf' ) === false ) {
			// Retry with GET if HEAD is not informative.
			$response = wp_remote_request(
				$final_url,
				[
					'method'  => 'GET',
					'timeout' => 10,
					'headers' => [ 'Range' => 'bytes=0-0' ],
				]
			);

			if ( is_wp_error( $response ) ) {
				echo wp_json_encode( [ 'error' => 'Final GET request failed' ] );
				exit;
			}

			$headers      = wp_remote_retrieve_headers( $response );
			$content_type = isset( $headers['content-type'] ) ? strtolower( $headers['content-type'] ) : '';

			if ( strpos( $content_type, 'application/pdf' ) === false ) {
				echo wp_json_encode(
					[
						'error'        => 'Final URL is not a PDF',
						'content_type' => $content_type,
					]
				);
				exit;
			}
		}

		$size = isset( $headers['content-length'] ) ? (int) $headers['content-length'] : 0;

		// Enhanced fallback for missing Content-Length.
		if ( empty( $size ) ) {
			$response = wp_remote_request(
				$final_url,
				[
					'method'  => 'GET',
					'timeout' => 10,
					'headers' => [ 'Range' => 'bytes=0-0' ],
				]
			);

			if ( ! is_wp_error( $response ) ) {
				$headers = wp_remote_retrieve_headers( $response );
				if ( isset( $headers['content-range'] ) && preg_match( '/bytes 0-0\/(\d+)/', $headers['content-range'], $matches ) ) {
					$size = (int) $matches[1];
				}
			}
		}

		if ( $size > 0 ) {
			set_transient( $cache_key, $size, DAY_IN_SECONDS );
			echo wp_json_encode(
				[
					'size'   => $size,
					'cached' => false,
					'url'    => $final_url,
					'status' => $status_code,
				]
			);
		} else {
			set_transient( $cache_key, 0, 15 * MINUTE_IN_SECONDS );
			echo wp_json_encode(
				[
					'error' => 'Could not determine size',
					'note'  => 'The server did not provide a valid Content-Length header.',
					'url'   => $final_url,
				]
			);
		}

		exit;
	}
}
