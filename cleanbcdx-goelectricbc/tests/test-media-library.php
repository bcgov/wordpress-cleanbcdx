<?php
/**
 * Media Library feed tests.
 *
 * @package Bcgov\Plugin\CleanBCDXGE
 */

use Bcgov\Plugin\CleanBCDXGE\Hooks\MediaLibrary;

require_once dirname( __DIR__ ) . '/Hooks/MediaLibrary.php';

/**
 * Tests feed attachment handling and vehicle feed CSV transformations.
 */
class MediaLibraryTest extends WP_UnitTestCase {
	/**
	 * Media library hook instance.
	 *
	 * @var MediaLibrary
	 */
	protected $media_library;

	/**
	 * Created attachment IDs.
	 *
	 * @var array
	 */
	protected $attachment_ids = array();

	/**
	 * Created file paths.
	 *
	 * @var array
	 */
	protected $file_paths = array();

	/**
	 * Set up each test.
	 *
	 * @return void
	 */
	public function set_up(): void {
		parent::set_up();

		$this->media_library = new MediaLibrary();
	}

	/**
	 * Tear down each test.
	 *
	 * @return void
	 */
	public function tear_down(): void {
		foreach ( array_reverse( $this->attachment_ids ) as $attachment_id ) {
			\wp_delete_attachment( $attachment_id, true );
		}

		foreach ( array_unique( $this->file_paths ) as $file_path ) {
			if ( ! empty( $file_path ) && file_exists( $file_path ) ) {
				unlink( $file_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.unlink_unlink -- Cleaning up test artifacts.
			}
		}

		parent::tear_down();
	}

	/**
	 * JSON attachments should expose all supported feed options.
	 *
	 * @return void
	 */
	public function test_json_attachment_shows_retroactive_oem_and_eligible_options() {
		$attachment_id = $this->create_attachment( 'unity-oem-feed.json', '{"status":"ok"}', 'application/json' );
		$form_fields   = $this->media_library->add_unity_feed_attachment_field( array(), \get_post( $attachment_id ) );

		$this->assertArrayHasKey( 'cleanbcdx_ge_unity_feed_settings', $form_fields );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_retroactive_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_oem_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_eligible_vehicles_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
	}

	/**
	 * CSV attachments should only expose CSV-capable options and clear retroactive state on save.
	 *
	 * @return void
	 */
	public function test_csv_attachment_shows_oem_and_eligible_options_and_clears_retroactive_state() {
		$attachment_id = $this->create_attachment( 'unity-oem-feed.csv', $this->get_sample_oem_csv(), 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_RETROACTIVE_FEED_META_KEY, '1' );

		$form_fields = $this->media_library->add_unity_feed_attachment_field( array(), \get_post( $attachment_id ) );

		$this->assertArrayHasKey( 'cleanbcdx_ge_unity_feed_settings', $form_fields );
		$this->assertStringNotContainsString( 'cleanbcdx_ge_unity_retroactive_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_oem_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_eligible_vehicles_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );

		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				'cleanbcdx_ge_unity_retroactive_feed_active' => '1',
				'cleanbcdx_ge_unity_oem_feed_active' => '1',
				'cleanbcdx_ge_unity_eligible_vehicles_feed_active' => '1',
			)
		);

		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_RETROACTIVE_FEED_META_KEY, true ) );
		$this->assertSame( '1', \get_post_meta( $attachment_id, MediaLibrary::UNITY_OEM_FEED_META_KEY, true ) );
		$this->assertSame( '1', \get_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, true ) );
	}

	/**
	 * Retroactive feed should remain JSON-only.
	 *
	 * @return void
	 */
	public function test_retroactive_route_rejects_csv_attachment() {
		$attachment_id = $this->create_attachment( 'unity-retroactive-feed.csv', $this->get_sample_oem_csv(), 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_RETROACTIVE_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_retroactive_feed_response();

		$this->assertWPError( $response );
		$this->assertSame( 'cleanbcdx_ge_unity_retroactive_feed_not_json', $response->get_error_code() );
		$this->assertSame( 422, $response->get_error_data()['status'] );
	}

	/**
	 * OEM route should return uploaded JSON attachments verbatim.
	 *
	 * @return void
	 */
	public function test_oem_route_returns_json_verbatim() {
		$expected      = array(
			'make'        => 'BYD',
			'models'      => array( 'Explore', 'Discover' ),
			'generatedAt' => '2026-07-08',
		);
		$attachment_id = $this->create_attachment( 'unity-oem-feed.json', \wp_json_encode( $expected ), 'application/json' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_OEM_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_oem_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( $expected, json_decode( \wp_json_encode( $response->get_data() ), true ) );
	}

	/**
	 * OEM route should transform CSV attachments into the expected nested JSON structure.
	 *
	 * @return void
	 */
	public function test_oem_route_transforms_csv_into_nested_response() {
		$attachment_id = $this->create_attachment( 'unity-oem-feed.csv', $this->get_sample_oem_csv(), 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_OEM_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_oem_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( $this->get_expected_oem_csv_response(), $response->get_data() );
	}

	/**
	 * Eligible vehicles route should return uploaded JSON attachments verbatim.
	 *
	 * @return void
	 */
	public function test_eligible_vehicles_route_returns_json_verbatim() {
		$expected      = array(
			'generatedFor' => 'Eligible Commercial Vehicles',
			'items'        => array( 'BYD', 'Ford' ),
			'count'        => 2,
		);
		$attachment_id = $this->create_attachment( 'unity-eligible-vehicles-feed.json', \wp_json_encode( $expected ), 'application/json' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_eligible_vehicles_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( $expected, json_decode( \wp_json_encode( $response->get_data() ), true ) );
	}

	/**
	 * Eligible vehicles route should transform CSV attachments into the expected nested JSON structure.
	 *
	 * @return void
	 */
	public function test_eligible_vehicles_route_transforms_csv_into_nested_response_with_decision_dates() {
		$attachment_id = $this->create_attachment( 'unity-eligible-vehicles-feed.csv', $this->get_sample_oem_csv(), 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_eligible_vehicles_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( $this->get_expected_eligible_vehicles_csv_response(), $response->get_data() );
	}

	/**
	 * OEM route should reject malformed CSV uploads.
	 *
	 * @return void
	 */
	public function test_oem_route_rejects_invalid_csv() {
		$csv = implode(
			"\n",
			array(
				'make,model_name,configuration_name,year,vehicle_class_name,vehicle_type_name,battery_size,lower_battery_range,upper_battery_range,battery_size_range,decision_date',
				'BYD,Explore,XL,2028,Class 4,Coach,70,,,70 kWh,6/12/2026',
			)
		);

		$attachment_id = $this->create_attachment( 'unity-oem-feed-invalid.csv', $csv, 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_OEM_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_oem_feed_response();

		$this->assertWPError( $response );
		$this->assertSame( 'cleanbcdx_ge_unity_oem_feed_invalid_csv', $response->get_error_code() );
		$this->assertSame( 422, $response->get_error_data()['status'] );
	}

	/**
	 * Create an attachment backed by a real uploaded file.
	 *
	 * @param string $filename Uploaded filename.
	 * @param string $contents Uploaded file contents.
	 * @param string $mime_type Attachment mime type.
	 * @return int
	 */
	protected function create_attachment( $filename, $contents, $mime_type ) {
		$upload = \wp_upload_bits( $filename, null, $contents );

		$this->assertIsArray( $upload );
		$this->assertArrayHasKey( 'file', $upload );
		$this->assertEmpty( $upload['error'] );

		$attachment_id = \wp_insert_attachment(
			array(
				'post_mime_type' => $mime_type,
				'post_title'     => pathinfo( $filename, PATHINFO_FILENAME ),
				'post_status'    => 'inherit',
			),
			$upload['file']
		);

		$this->assertIsInt( $attachment_id );

		\update_attached_file( $attachment_id, $upload['file'] );

		$this->attachment_ids[] = $attachment_id;
		$this->file_paths[]     = $upload['file'];

		return $attachment_id;
	}

	/**
	 * Return the sample OEM CSV payload.
	 *
	 * @return string
	 */
	protected function get_sample_oem_csv() {
		return implode(
			"\n",
			array(
				"\xEF\xBB\xBFmake,model_name,configuration_name,year,vehicle_class_name,vehicle_type_name,fuel_type_name,battery_size,lower_battery_range,upper_battery_range,battery_size_range,decision_date",
				'BYD,Explore,XL,2028,Class 4,Coach,BEV,70,,,70 kWh,6/12/2026',
				'BYD,Explore,XL,2028,Class 4,Coach,BEV,,200,300,200 kWh - 300 kWh,6/13/2026',
				'BYD,Discover,6 Feet,2027,Class 7,Coach,BEV,500,,,500 kWh,6/14/2026',
				'',
				'Ford,F150 Lightning,Not specified,2026,Class 3,Truck,BEV,70,,,70 kWh,6/15/2026',
				'Ford,F150 Lightning,Not specified,2026,Class 3,Truck,FCEV,,100,200,100 kWh - 200kwh,6/15/2026 ',
			)
		);
	}

	/**
	 * Return the expected nested OEM response for the sample CSV.
	 *
	 * @return array
	 */
	protected function get_expected_oem_csv_response() {
		return array(
			array(
				'make'   => 'BYD',
				'models' => array(
					array(
						'model_name'    => 'Explore',
						'configuration' => array(
							array(
								'configuration_name' => 'XL',
								'model_years'        => array(
									array(
										'year'          => 2028,
										'vehicle_class' => array(
											array(
												'vehicle_class_name' => 'Class 4',
												'vehicle_type'       => array(
													array(
														'vehicle_type_name' => 'Coach',
														'fuel_type'         => array(
															array(
																'fuel_type_name' => 'BEV',
																'battery'        => array(
																	array(
																		'battery_size'        => 70,
																		'lower_battery_range' => null,
																		'upper_battery_range' => null,
																		'battery_size_range'  => '70 kWh',
																	),
																	array(
																		'battery_size'        => null,
																		'lower_battery_range' => 200,
																		'upper_battery_range' => 300,
																		'battery_size_range'  => '200 kWh - 300 kWh',
																	),
																),
															),
														),
													),
												),
											),
										),
									),
								),
							),
						),
					),
					array(
						'model_name'    => 'Discover',
						'configuration' => array(
							array(
								'configuration_name' => '6 Feet',
								'model_years'        => array(
									array(
										'year'          => 2027,
										'vehicle_class' => array(
											array(
												'vehicle_class_name' => 'Class 7',
												'vehicle_type'       => array(
													array(
														'vehicle_type_name' => 'Coach',
														'fuel_type'         => array(
															array(
																'fuel_type_name' => 'BEV',
																'battery'        => array(
																	array(
																		'battery_size'        => 500,
																		'lower_battery_range' => null,
																		'upper_battery_range' => null,
																		'battery_size_range'  => '500 kWh',
																	),
																),
															),
														),
													),
												),
											),
										),
									),
								),
							),
						),
					),
				),
			),
			array(
				'make'   => 'Ford',
				'models' => array(
					array(
						'model_name'    => 'F150 Lightning',
						'configuration' => array(
							array(
								'configuration_name' => 'Not specified',
								'model_years'        => array(
									array(
										'year'          => 2026,
										'vehicle_class' => array(
											array(
												'vehicle_class_name' => 'Class 3',
												'vehicle_type'       => array(
													array(
														'vehicle_type_name' => 'Truck',
														'fuel_type'         => array(
															array(
																'fuel_type_name' => 'BEV',
																'battery'        => array(
																	array(
																		'battery_size'        => 70,
																		'lower_battery_range' => null,
																		'upper_battery_range' => null,
																		'battery_size_range'  => '70 kWh',
																	),
																),
															),
															array(
																'fuel_type_name' => 'FCEV',
																'battery'        => array(
																	array(
																		'battery_size'        => null,
																		'lower_battery_range' => 100,
																		'upper_battery_range' => 200,
																		'battery_size_range'  => '100 kWh - 200kwh',
																	),
																),
															),
														),
													),
												),
											),
										),
									),
								),
							),
						),
					),
				),
			),
		);
	}

	/**
	 * Return the expected nested eligible vehicles response for the sample CSV.
	 *
	 * @return array
	 */
	protected function get_expected_eligible_vehicles_csv_response() {
		$response       = $this->get_expected_oem_csv_response();
		$decision_dates = array( '6/12/2026', '6/13/2026', '6/14/2026', '6/15/2026', '6/15/2026' );
		$index          = 0;

		foreach ( $response as &$manufacturer ) {
			foreach ( $manufacturer['models'] as &$model ) {
				foreach ( $model['configuration'] as &$configuration ) {
					foreach ( $configuration['model_years'] as &$model_year ) {
						foreach ( $model_year['vehicle_class'] as &$vehicle_class ) {
							foreach ( $vehicle_class['vehicle_type'] as &$vehicle_type ) {
								foreach ( $vehicle_type['fuel_type'] as &$fuel_type ) {
									foreach ( $fuel_type['battery'] as &$battery ) {
										$battery['decision_date'] = $decision_dates[ $index ];
										++$index;
									}
								}
							}
						}
					}
				}
			}
		}

		unset( $manufacturer, $model, $configuration, $model_year, $vehicle_class, $vehicle_type, $fuel_type, $battery );

		return $response;
	}
}
