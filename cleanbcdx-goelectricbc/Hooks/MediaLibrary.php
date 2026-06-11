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
}
