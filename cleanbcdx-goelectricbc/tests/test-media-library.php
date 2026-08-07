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
	 * JSON attachments should expose all supported radio options with None selected by default.
	 *
	 * @return void
	 */
	public function test_json_attachment_shows_none_retroactive_oem_eligible_and_intake_class_status_radio_options() {
		$attachment_id = $this->create_attachment( 'unity-oem-feed.json', '{"status":"ok"}', 'application/json' );
		$form_fields   = $this->media_library->add_unity_feed_attachment_field( array(), \get_post( $attachment_id ) );
		$field_html    = $form_fields['cleanbcdx_ge_unity_feed_settings']['html'];

		$this->assertArrayHasKey( 'cleanbcdx_ge_unity_feed_settings', $form_fields );
		$this->assertStringContainsString( 'type="radio"', $field_html );
		$this->assertStringNotContainsString( 'type="checkbox"', $field_html );
		$this->assertStringContainsString( MediaLibrary::UNITY_FEED_ASSIGNMENT_FIELD, $field_html );
		$this->assertStringContainsString( 'value="none" checked=\'checked\'', $field_html );
		$this->assertStringContainsString( 'value="retroactive"', $field_html );
		$this->assertStringContainsString( 'value="oem"', $field_html );
		$this->assertStringContainsString( 'value="eligible_vehicles"', $field_html );
		$this->assertStringContainsString( 'value="intake_class_status"', $field_html );
		$this->assertStringNotContainsString( 'value="approved_sellers"', $field_html );
	}

	/**
	 * CSV attachments should only expose CSV-capable radio options and keep only the selected feed.
	 *
	 * @return void
	 */
	public function test_csv_attachment_shows_none_oem_eligible_and_intake_class_status_radio_options_and_clears_other_assignments() {
		$attachment_id = $this->create_attachment( 'unity-oem-feed.csv', $this->get_sample_oem_csv(), 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_RETROACTIVE_FEED_META_KEY, '1' );
		\update_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, '1' );

		$form_fields = $this->media_library->add_unity_feed_attachment_field( array(), \get_post( $attachment_id ) );
		$field_html  = $form_fields['cleanbcdx_ge_unity_feed_settings']['html'];

		$this->assertArrayHasKey( 'cleanbcdx_ge_unity_feed_settings', $form_fields );
		$this->assertStringContainsString( 'type="radio"', $field_html );
		$this->assertStringContainsString( 'value="none"', $field_html );
		$this->assertStringNotContainsString( 'value="retroactive"', $field_html );
		$this->assertStringContainsString( 'value="eligible_vehicles" checked=\'checked\'', $field_html );
		$this->assertStringContainsString( 'value="oem"', $field_html );
		$this->assertStringContainsString( 'value="intake_class_status"', $field_html );
		$this->assertStringContainsString( 'value="approved_sellers"', $field_html );

		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				MediaLibrary::UNITY_FEED_ASSIGNMENT_FIELD => 'oem',
			)
		);

		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_RETROACTIVE_FEED_META_KEY, true ) );
		$this->assertSame( '1', \get_post_meta( $attachment_id, MediaLibrary::UNITY_OEM_FEED_META_KEY, true ) );
		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, true ) );
		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY, true ) );
		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_META_KEY, true ) );
	}

	/**
	 * CSV attachments should allow the approved sellers assignment to be saved.
	 *
	 * @return void
	 */
	public function test_csv_attachment_can_save_approved_sellers_assignment() {
		$attachment_id = $this->create_attachment( 'unity-approved-sellers-feed.csv', $this->get_sample_approved_sellers_csv(), 'text/csv' );

		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				MediaLibrary::UNITY_FEED_ASSIGNMENT_FIELD => 'approved_sellers',
			)
		);

		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_RETROACTIVE_FEED_META_KEY, true ) );
		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_OEM_FEED_META_KEY, true ) );
		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, true ) );
		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY, true ) );
		$this->assertSame( '1', \get_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_META_KEY, true ) );
	}

	/**
	 * Selecting None should clear every Unity feed assignment for the attachment.
	 *
	 * @return void
	 */
	public function test_none_radio_option_clears_all_unity_feed_assignments() {
		$attachment_id = $this->create_attachment( 'unity-eligible-vehicles-feed.json', '{"status":"ok"}', 'application/json' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_RETROACTIVE_FEED_META_KEY, '1' );
		\update_post_meta( $attachment_id, MediaLibrary::UNITY_OEM_FEED_META_KEY, '1' );
		\update_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, '1' );
		\update_post_meta( $attachment_id, MediaLibrary::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY, '1' );
		\update_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_META_KEY, '1' );

		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				MediaLibrary::UNITY_FEED_ASSIGNMENT_FIELD => 'none',
			)
		);

		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_RETROACTIVE_FEED_META_KEY, true ) );
		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_OEM_FEED_META_KEY, true ) );
		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, true ) );
		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_INTAKE_CLASS_STATUS_FEED_META_KEY, true ) );
		$this->assertSame( '', \get_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_META_KEY, true ) );
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
	 * OEM route should normalize uploaded JSON attachments into the public make/model response shape.
	 *
	 * @return void
	 */
	public function test_oem_route_normalizes_and_sorts_json_attachments() {
		$expected      = array(
			array(
				'make'   => 'ARBOC',
				'models' => array(
					array(
						'model_name' => 'Equess CHARGE',
					),
				),
			),
			array(
				'make'   => 'Autocar',
				'models' => array(
					array(
						'model_name' => 'E-ACTT',
					),
				),
			),
			array(
				'make'   => 'BYD',
				'models' => array(
					array(
						'model_name' => '6F',
					),
					array(
						'model_name' => '8TT',
					),
					array(
						'model_name' => '8Y',
					),
				),
			),
		);
		$payload       = array(
			array(
				'make'   => 'BYD',
				'models' => array(
					array(
						'model_name'    => '8Y',
						'configuration' => array(
							array( 'configuration_name' => 'XL' ),
						),
					),
					array( 'model_name' => '6F' ),
					array( 'model_name' => '8TT' ),
					array( 'model_name' => '8Y' ),
				),
			),
			array(
				'make'   => 'Autocar',
				'models' => array(
					array( 'model_name' => 'E-ACTT' ),
				),
			),
			array(
				'make'   => 'ARBOC',
				'models' => array( 'Equess CHARGE' ),
			),
		);
		$attachment_id = $this->create_attachment( 'unity-oem-feed.json', \wp_json_encode( $payload ), 'application/json' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_OEM_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_oem_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( $expected, json_decode( \wp_json_encode( $response->get_data() ), true ) );
	}

	/**
	 * OEM route should transform CSV attachments into the expected make/model-only JSON structure.
	 *
	 * @return void
	 */
	public function test_oem_route_transforms_csv_into_simplified_response() {
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
		$expected[0]['models'][1]['configuration'][0]['model_years'][0]['vehicle_class'][0]['vehicle_type'][0]['fuel_type'][0]['battery'][0]['decision_date'] = '';

		$this->assertSame( $expected, $response->get_data() );
	}

	/**
	 * Eligible vehicles CSV history should preserve the original timestamp when the same file is reactivated.
	 *
	 * @return void
	 */
	public function test_eligible_vehicles_csv_history_reuses_original_timestamp_when_reactivated() {
		$attachment_id = $this->create_attachment( 'unity-eligible-vehicles-history.csv', $this->get_sample_oem_csv(), 'text/csv' );

		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				MediaLibrary::UNITY_FEED_ASSIGNMENT_FIELD => 'eligible_vehicles',
			)
		);

		$original_history = \get_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_HISTORY_META_KEY, true );

		$this->assertIsArray( $original_history );
		$this->assertCount( 1, $original_history );
		$this->assertNotSame( '', trim( (string) reset( $original_history ) ) );

		$this->media_library->save_unity_feed_attachment_field( array( 'ID' => $attachment_id ), array() );
		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				MediaLibrary::UNITY_FEED_ASSIGNMENT_FIELD => 'eligible_vehicles',
			)
		);

		$this->assertSame( $original_history, \get_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_HISTORY_META_KEY, true ) );
	}

	/**
	 * Eligible vehicles CSV route should expose the tracked last updated header for the active file.
	 *
	 * @return void
	 */
	public function test_eligible_vehicles_route_includes_csv_last_updated_header() {
		$attachment_id = $this->create_attachment( 'unity-eligible-vehicles-last-updated.csv', $this->get_sample_oem_csv(), 'text/csv' );

		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				MediaLibrary::UNITY_FEED_ASSIGNMENT_FIELD => 'eligible_vehicles',
			)
		);

		$expected_last_updated = '2026-07-23T00:00:00+00:00';
		$this->set_eligible_vehicles_csv_history_timestamp( $attachment_id, $expected_last_updated );

		$response = $this->media_library->get_unity_eligible_vehicles_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( $expected_last_updated, $response->get_headers()[ MediaLibrary::UNITY_ELIGIBLE_VEHICLES_LAST_UPDATED_HEADER ] );
	}

	/**
	 * Eligible vehicles JSON route should not expose a CSV last updated header.
	 *
	 * @return void
	 */
	public function test_eligible_vehicles_route_omits_last_updated_header_for_json() {
		$expected      = array(
			'generatedFor' => 'Eligible Commercial Vehicles',
			'items'        => array( 'BYD', 'Ford' ),
			'count'        => 2,
		);
		$attachment_id = $this->create_attachment( 'unity-eligible-vehicles-feed.json', \wp_json_encode( $expected ), 'application/json' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_eligible_vehicles_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertArrayNotHasKey( MediaLibrary::UNITY_ELIGIBLE_VEHICLES_LAST_UPDATED_HEADER, $response->get_headers() );
	}

	/**
	 * Approved sellers CSV history should preserve the original timestamp when the same file is reactivated.
	 *
	 * @return void
	 */
	public function test_approved_sellers_csv_history_reuses_original_timestamp_when_reactivated() {
		$attachment_id = $this->create_attachment( 'unity-approved-sellers-history.csv', $this->get_sample_approved_sellers_csv(), 'text/csv' );

		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				MediaLibrary::UNITY_FEED_ASSIGNMENT_FIELD => 'approved_sellers',
			)
		);

		$original_history = \get_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_HISTORY_META_KEY, true );

		$this->assertIsArray( $original_history );
		$this->assertCount( 1, $original_history );
		$this->assertNotSame( '', trim( (string) reset( $original_history ) ) );

		$this->media_library->save_unity_feed_attachment_field( array( 'ID' => $attachment_id ), array() );
		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				MediaLibrary::UNITY_FEED_ASSIGNMENT_FIELD => 'approved_sellers',
			)
		);

		$this->assertSame( $original_history, \get_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_HISTORY_META_KEY, true ) );
	}

	/**
	 * Approved sellers CSV route should expose the tracked last updated header for the active file.
	 *
	 * @return void
	 */
	public function test_approved_sellers_route_includes_csv_last_updated_header() {
		$attachment_id = $this->create_attachment( 'unity-approved-sellers-last-updated.csv', $this->get_sample_approved_sellers_csv(), 'text/csv' );

		$this->media_library->save_unity_feed_attachment_field(
			array( 'ID' => $attachment_id ),
			array(
				MediaLibrary::UNITY_FEED_ASSIGNMENT_FIELD => 'approved_sellers',
			)
		);

		$expected_last_updated = '2026-07-23T00:00:00+00:00';
		$this->set_approved_sellers_csv_history_timestamp( $attachment_id, $expected_last_updated );

		$response = $this->media_library->get_unity_approved_sellers_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( $expected_last_updated, $response->get_headers()[ MediaLibrary::UNITY_APPROVED_SELLERS_LAST_UPDATED_HEADER ] );
	}

	/**
	 * Eligible vehicles route should sort each nested level and battery arrays in ascending order.
	 *
	 * @return void
	 */
	public function test_eligible_vehicles_route_sorts_nested_levels_and_batteries_ascending() {
		$csv = implode(
			"\n",
			array(
				"\xEF\xBB\xBFmake,model,configuration,model_year,vehicle_type,vehicle_class,fuel_type,battery_size_range,decision_date,battery_size,lower_battery_range,upper_battery_range",
				'Zevo,Runner,Premium,2027,Truck,Class 7,FCEV,200 kWh - 300 kWh,6/20/2026,,200,300',
				'Zevo,Runner,Premium,2027,Truck,Class 7,BEV,300 kWh,6/19/2026,300,,',
				'Zevo,Runner,Premium,2027,Truck,Class 7,BEV,70 kWh,6/18/2026,70,,',
				'Zevo,Runner,Premium,2027,Coach,Class 7,BEV,90 kWh,6/17/2026,90,,',
				'Zevo,Runner,Premium,2027,Coach,Class 3,BEV,95 kWh,6/16/2026,95,,',
				'Zevo,Runner,Base,2028,Truck,Class 7,BEV,80 kWh,6/21/2026,80,,',
				'Zevo,Runner,Base,2026,Truck,Class 7,BEV,75 kWh,6/15/2026,75,,',
				'Zevo,Roadster,Base,2026,Truck,Class 7,BEV,85 kWh,6/14/2026,85,,',
				'Alpha,Runner,Base,2026,Truck,Class 7,BEV,60 kWh,6/13/2026,60,,',
			)
		);

		$attachment_id = $this->create_attachment( 'unity-eligible-vehicles-feed-sorted.csv', $csv, 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_eligible_vehicles_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );

		$data = $response->get_data();

		$this->assertSame( array( 'Alpha', 'Zevo' ), array_column( $data, 'make' ) );
		$this->assertSame( array( 'Roadster', 'Runner' ), array_column( $data[1]['models'], 'model_name' ) );
		$this->assertSame( array( 'Base', 'Premium' ), array_column( $data[1]['models'][1]['configuration'], 'configuration_name' ) );
		$this->assertSame( array( 2026, 2028 ), array_column( $data[1]['models'][1]['configuration'][0]['model_years'], 'year' ) );
		$this->assertSame( array( 'Class 3', 'Class 7' ), array_column( $data[1]['models'][1]['configuration'][1]['model_years'][0]['vehicle_class'], 'vehicle_class_name' ) );
		$this->assertSame( array( 'Coach', 'Truck' ), array_column( $data[1]['models'][1]['configuration'][1]['model_years'][0]['vehicle_class'][1]['vehicle_type'], 'vehicle_type_name' ) );
		$this->assertSame( array( 'BEV', 'FCEV' ), array_column( $data[1]['models'][1]['configuration'][1]['model_years'][0]['vehicle_class'][1]['vehicle_type'][1]['fuel_type'], 'fuel_type_name' ) );
		$this->assertSame(
			array( '70 kWh', '300 kWh' ),
			array_column( $data[1]['models'][1]['configuration'][1]['model_years'][0]['vehicle_class'][1]['vehicle_type'][1]['fuel_type'][0]['battery'], 'battery_size_range' )
		);
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
	 * Approved sellers route should transform CSV attachments into the expected flat response.
	 *
	 * @return void
	 */
	public function test_approved_sellers_route_transforms_csv_into_flat_response() {
		$attachment_id = $this->create_attachment( 'unity-approved-sellers-feed.csv', $this->get_sample_approved_sellers_csv(), 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_approved_sellers_feed_response();

		$this->assertInstanceOf( \WP_REST_Response::class, $response );
		$this->assertSame( $this->get_expected_approved_sellers_csv_response(), $response->get_data() );
	}

	/**
	 * Approved sellers route should reject JSON attachments.
	 *
	 * @return void
	 */
	public function test_approved_sellers_route_rejects_json_attachment() {
		$attachment_id = $this->create_attachment( 'unity-approved-sellers-feed.json', '{"status":"ok"}', 'application/json' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_approved_sellers_feed_response();

		$this->assertWPError( $response );
		$this->assertSame( 'cleanbcdx_ge_unity_approved_sellers_feed_not_csv', $response->get_error_code() );
		$this->assertSame( 422, $response->get_error_data()['status'] );
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
	 * Approved sellers route should reject malformed CSV uploads.
	 *
	 * @return void
	 */
	public function test_approved_sellers_route_rejects_invalid_csv() {
		$csv = implode(
			"\n",
			array(
				'operating_org_name,city,postal_code,email,website,phone_number,decision_date,mailing_street,mailing_unit,mailing_street_optional',
				'Three Point Motors,Victoria,V8T 4P7,,www.mercedes-benz-threepointmotors.ca,(250) 385-6737,2026-06-26,2546 Government Street,,',
			)
		);

		$attachment_id = $this->create_attachment( 'unity-approved-sellers-feed-invalid.csv', $csv, 'text/csv' );

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_META_KEY, '1' );

		$response = $this->media_library->get_unity_approved_sellers_feed_response();

		$this->assertWPError( $response );
		$this->assertSame( 'cleanbcdx_ge_unity_approved_sellers_feed_invalid_csv', $response->get_error_code() );
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
	 * Override the stored eligible vehicles CSV timestamp for the attachment's current fingerprint.
	 *
	 * @param int    $attachment_id Attachment ID.
	 * @param string $timestamp     ISO 8601 timestamp.
	 * @return void
	 */
	protected function set_eligible_vehicles_csv_history_timestamp( $attachment_id, $timestamp ) {
		$history = \get_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_HISTORY_META_KEY, true );

		$this->assertIsArray( $history );
		$this->assertNotEmpty( $history );

		reset( $history );
		$fingerprint             = key( $history );
		$history[ $fingerprint ] = $timestamp;

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_ELIGIBLE_VEHICLES_FEED_HISTORY_META_KEY, $history );
	}

	/**
	 * Override the stored approved sellers CSV timestamp for the attachment's current fingerprint.
	 *
	 * @param int    $attachment_id Attachment ID.
	 * @param string $timestamp     ISO 8601 timestamp.
	 * @return void
	 */
	protected function set_approved_sellers_csv_history_timestamp( $attachment_id, $timestamp ) {
		$history = \get_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_HISTORY_META_KEY, true );

		$this->assertIsArray( $history );
		$this->assertNotEmpty( $history );

		reset( $history );
		$fingerprint             = key( $history );
		$history[ $fingerprint ] = $timestamp;

		\update_post_meta( $attachment_id, MediaLibrary::UNITY_APPROVED_SELLERS_FEED_HISTORY_META_KEY, $history );
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
	 * Return the sample approved sellers CSV payload.
	 *
	 * @return string
	 */
	protected function get_sample_approved_sellers_csv() {
		return implode(
			"\n",
			array(
				"\xEF\xBB\xBFoperating_org_name,city,postal_code,email,website,phone_number,decision_date,mailing_street,mailing_unit,mailing_street_optional",
				'Three Point Motors,Victoria,V8T 4P7,info@threepointmotors.com,www.mercedes-benz-threepointmotors.ca,(250) 385-6737,2026-06-26,2546 Government Street,,',
				'West Coast Ford,Maple Ridge,V2X 2P8,ndavis@westcoastford.com,westcoastford.com,(604) 465-5434,2026-06-29,20370 Lougheed Highway,,',
				'PACIFIC COAST HEAVY TRUCK GROUP,Langley,V1M 4B9,rhys@pactrucks.com,pchtg.ca,(604) 888-5577,2026-07-23,9758 203rd Street,,',
			)
		);
	}

	/**
	 * Return the expected simplified OEM response for the sample CSV.
	 *
	 * @return array
	 */
	protected function get_expected_oem_csv_response() {
		return array(
			array(
				'make'   => 'BYD',
				'models' => array(
					array(
						'model_name' => 'Discover',
					),
					array(
						'model_name' => 'Explore',
					),
				),
			),
			array(
				'make'   => 'Ford',
				'models' => array(
					array(
						'model_name' => 'F150 Lightning',
					),
				),
			),
		);
	}

	/**
	 * Return the expected nested vehicle response for the sample CSV.
	 *
	 * @return array
	 */
	protected function get_expected_vehicle_csv_response() {
		return array(
			array(
				'make'   => 'BYD',
				'models' => array(
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
		$response       = $this->get_expected_vehicle_csv_response();
		$decision_dates = array( '6/14/2026', '6/12/2026', '6/13/2026', '6/15/2026', '6/15/2026' );
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

	/**
	 * Return the expected approved sellers response for the sample CSV.
	 *
	 * @return array
	 */
	protected function get_expected_approved_sellers_csv_response() {
		return array(
			array(
				'operating_org_name'      => 'Three Point Motors',
				'city'                    => 'Victoria',
				'postal_code'             => 'V8T 4P7',
				'email'                   => 'info@threepointmotors.com',
				'website'                 => 'www.mercedes-benz-threepointmotors.ca',
				'phone_number'            => '(250) 385-6737',
				'decision_date'           => '2026-06-26',
				'mailing_street'          => '2546 Government Street',
				'mailing_unit'            => '',
				'mailing_street_optional' => '',
			),
			array(
				'operating_org_name'      => 'West Coast Ford',
				'city'                    => 'Maple Ridge',
				'postal_code'             => 'V2X 2P8',
				'email'                   => 'ndavis@westcoastford.com',
				'website'                 => 'westcoastford.com',
				'phone_number'            => '(604) 465-5434',
				'decision_date'           => '2026-06-29',
				'mailing_street'          => '20370 Lougheed Highway',
				'mailing_unit'            => '',
				'mailing_street_optional' => '',
			),
			array(
				'operating_org_name'      => 'PACIFIC COAST HEAVY TRUCK GROUP',
				'city'                    => 'Langley',
				'postal_code'             => 'V1M 4B9',
				'email'                   => 'rhys@pactrucks.com',
				'website'                 => 'pchtg.ca',
				'phone_number'            => '(604) 888-5577',
				'decision_date'           => '2026-07-23',
				'mailing_street'          => '9758 203rd Street',
				'mailing_unit'            => '',
				'mailing_street_optional' => '',
			),
		);
	}
}
