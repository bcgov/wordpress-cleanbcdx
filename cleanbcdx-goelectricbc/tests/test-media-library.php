<?php
/**
 * Media Library feed tests.
 *
 * @package Bcgov\Plugin\CleanBCDXGE
 */

use Bcgov\Plugin\CleanBCDXGE\Hooks\MediaLibrary;

require_once dirname( __DIR__ ) . '/Hooks/MediaLibrary.php';

/**
 * Tests feed attachment handling and CSV transformations.
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
	public function test_json_attachment_shows_retroactive_oem_eligible_and_intake_class_status_options() {
		$attachment_id = $this->create_attachment( 'unity-oem-feed.json', '{"status":"ok"}', 'application/json' );
		$form_fields   = $this->media_library->add_unity_feed_attachment_field( array(), \get_post( $attachment_id ) );

		$this->assertArrayHasKey( 'cleanbcdx_ge_unity_feed_settings', $form_fields );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_retroactive_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_oem_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_eligible_vehicles_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_intake_class_status_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
	}

	/**
	 * CSV attachments should only expose CSV-capable options and clear retroactive state on save.
	 *
	 * @return void
	 */
	public function test_csv_attachment_shows_oem_eligible_and_intake_class_status_options_and_clears_retroactive_state() {
		$attachment_id = $this->create_attachment( 'unity-oem-feed.csv', $this->get_sample_oem_csv(), 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_RETROACTIVE_FEED_META_KEY, '1' );

		$form_fields = $this->media_library->add_unity_feed_attachment_field( array(), \get_post( $attachment_id ) );

		$this->assertArrayHasKey( 'cleanbcdx_ge_unity_feed_settings', $form_fields );
		$this->assertStringNotContainsString( 'cleanbcdx_ge_unity_retroactive_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_oem_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_eligible_vehicles_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );
		$this->assertStringContainsString( 'cleanbcdx_ge_unity_intake_class_status_feed_active', $form_fields['cleanbcdx_ge_unity_feed_settings']['html'] );

		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				'cleanbcdx_ge_unity_retroactive_feed_active' => '1',
				'cleanbcdx_ge_unity_oem_feed_active' => '1',
				'cleanbcdx_ge_unity_eligible_vehicles_feed_active' => '1',
				'cleanbcdx_ge_unity_intake_class_status_feed_active' => '1',
			)
		);

		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_RETROACTIVE_FEED_META_KEY, true ) );
		$this->assertSame( '1', \get_post_meta( $attachment_id, MediaLibrary::UNITY_OEM_FEED_META_KEY, true ) );
		$this->assertSame( '1', \get_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, true ) );
		$this->assertSame( '1', \get_post_meta( $attachment_id, MediaLibrary::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY, true ) );
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
	 * Eligible vehicles route should allow blank decision date cells in CSV rows.
	 *
	 * @return void
	 */
	public function test_eligible_vehicles_route_allows_blank_decision_date_cells() {
		$csv = implode(
			"\n",
			array(
				"\xEF\xBB\xBFmake,model,configuration,model_year,vehicle_type,vehicle_class,fuel_type,battery_size_range,decision_date,battery_size,lower_battery_range,upper_battery_range",
				'BYD,Explore,XL,2028,Coach,Class 4,BEV,70 kWh,,70,,',
				'BYD,Explore,XL,2028,Coach,Class 4,BEV,200 kWh - 300 kWh,6/13/2026,,200,300',
				'BYD,Discover,6 Feet,2027,Coach,Class 7,BEV,500 kWh,6/14/2026,500,,',
				'Ford,F150 Lightning,Not specified,2026,Truck,Class 3,BEV,70 kWh,6/15/2026,70,,',
				'Ford,F150 Lightning,Not specified,2026,Truck,Class 3,FCEV,100 kWh - 200kwh,6/15/2026, ,100,200',
			)
		);

		$attachment_id = $this->create_attachment( 'unity-eligible-vehicles-feed-blank-date.csv', $csv, 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_eligible_vehicles_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );

		$expected = $this->get_expected_eligible_vehicles_csv_response();
		$expected[0]['models'][0]['configuration'][0]['model_years'][0]['vehicle_class'][0]['vehicle_type'][0]['fuel_type'][0]['battery'][0]['decision_date'] = '';

		$this->assertSame( $expected, $response->get_data() );
	}

	/**
	 * Intake class status route should only return open rows from uploaded JSON attachments.
	 *
	 * @return void
	 */
	public function test_intake_class_status_route_returns_only_open_rows_from_json() {
		$expected      = $this->get_expected_intake_class_status_csv_response();
		$payload       = $expected;
		$payload[]     = array(
			'label'  => 'Class 1 (0 to 6,000 lbs)',
			'value'  => 'Class 1',
			'intake' => 'closed',
		);
		$attachment_id = $this->create_attachment( 'unity-intake-class-status-feed.json', \wp_json_encode( $payload ), 'application/json' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_intake_class_status_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( $expected, json_decode( \wp_json_encode( $response->get_data() ), true ) );
	}

	/**
	 * Intake class status route should transform CSV attachments into the expected flat JSON structure.
	 *
	 * @return void
	 */
	public function test_intake_class_status_route_transforms_csv_into_flat_response() {
		$attachment_id = $this->create_attachment( 'unity-intake-class-status-feed.csv', $this->get_sample_intake_class_status_csv(), 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_intake_class_status_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( $this->get_expected_intake_class_status_csv_response(), $response->get_data() );
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
				'make,model,configuration,model_year,vehicle_type,vehicle_class,battery_size_range,decision_date,battery_size,lower_battery_range,upper_battery_range',
				'BYD,Explore,XL,2028,Coach,Class 4,70 kWh,6/12/2026,70,,',
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
	 * Intake class status route should reject malformed CSV uploads.
	 *
	 * @return void
	 */
	public function test_intake_class_status_route_rejects_invalid_csv() {
		$csv = implode(
			"\n",
			array(
				'label,value',
				'"Class 2B (8,500 to 10,000 lbs)",Class 2B',
			)
		);

		$attachment_id = $this->create_attachment( 'unity-intake-class-status-feed-invalid.csv', $csv, 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_intake_class_status_feed_response();

		$this->assertWPError( $response );
		$this->assertSame( 'cleanbcdx_ge_unity_intake_class_status_feed_invalid_csv', $response->get_error_code() );
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
				"\xEF\xBB\xBFmake,model,configuration,model_year,vehicle_type,vehicle_class,fuel_type,battery_size_range,decision_date,battery_size,lower_battery_range,upper_battery_range",
				'BYD,Explore,XL,2028,Coach,Class 4,BEV,70 kWh,6/12/2026,70,,',
				'BYD,Explore,XL,2028,Coach,Class 4,BEV,200 kWh - 300 kWh,6/13/2026,,200,300',
				'BYD,Discover,6 Feet,2027,Coach,Class 7,BEV,500 kWh,6/14/2026,500,,',
				'',
				'Ford,F150 Lightning,Not specified,2026,Truck,Class 3,BEV,70 kWh,6/15/2026,70,,',
				'Ford,F150 Lightning,Not specified,2026,Truck,Class 3,FCEV,100 kWh - 200kwh,6/15/2026 , ,100,200',
			)
		);
	}

	/**
	 * Return the sample intake class status CSV payload.
	 *
	 * @return string
	 */
	protected function get_sample_intake_class_status_csv() {
		return implode(
			"\n",
			array(
				"\xEF\xBB\xBFlabel,value,intake",
				'"Class 2B (8,500 to 10,000 lbs)",Class 2B,open',
				'"Class 3 (10,001 to 14,000 lbs)",Class 3,open',
				'"Class 4 (14,001 to 16,000 lbs)",Class 4,open',
				'"Class 5 (16,001 to 19,500 lbs)",Class 5,open',
				'"Class 6 (19,501 to 26,000 lbs)",Class 6,open',
				'"Class 7 (26,001 to 33,000 lbs)",Class 7,open',
				'"Class 8 (>33,000 lbs)",Class 8,open',
				'"Class 1 (0 to 6,000 lbs)",Class 1,closed',
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

	/**
	 * Return the expected intake class status response for the sample CSV.
	 *
	 * @return array
	 */
	protected function get_expected_intake_class_status_csv_response() {
		return array(
			array(
				'label'  => 'Class 2B (8,500 to 10,000 lbs)',
				'value'  => 'Class 2B',
				'intake' => 'open',
			),
			array(
				'label'  => 'Class 3 (10,001 to 14,000 lbs)',
				'value'  => 'Class 3',
				'intake' => 'open',
			),
			array(
				'label'  => 'Class 4 (14,001 to 16,000 lbs)',
				'value'  => 'Class 4',
				'intake' => 'open',
			),
			array(
				'label'  => 'Class 5 (16,001 to 19,500 lbs)',
				'value'  => 'Class 5',
				'intake' => 'open',
			),
			array(
				'label'  => 'Class 6 (19,501 to 26,000 lbs)',
				'value'  => 'Class 6',
				'intake' => 'open',
			),
			array(
				'label'  => 'Class 7 (26,001 to 33,000 lbs)',
				'value'  => 'Class 7',
				'intake' => 'open',
			),
			array(
				'label'  => 'Class 8 (>33,000 lbs)',
				'value'  => 'Class 8',
				'intake' => 'open',
			),
		);
	}
}
