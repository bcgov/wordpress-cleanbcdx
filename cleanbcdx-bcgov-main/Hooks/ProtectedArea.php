<?php

namespace Bcgov\Plugin\CleanBCDX\Hooks;

/**
 * Sets up basic php template blocks for CleanBC
 *
 * @since 1.0.8
 *
 * @package Bcgov\Plugin\ProtectedArea
 */
class ProtectedArea {

	/**
	 * Meta key used to store per-block password hashes.
	 */
	private const PROTECTED_AREA_META_KEY = '_cleanbcdx_protected_area_password_map';

	/**
	 * Cookie name prefix for unlocked protected areas.
	 */
	private const PROTECTED_AREA_COOKIE_PREFIX = 'cleanbcdx_pa_';

	/**
	 * Cookie name prefix for page-level protected area unlocks.
	 */
	private const PROTECTED_AREA_PAGE_COOKIE_PREFIX = 'cleanbcdx_pa_page_';

	/**
	 * Validation errors collected during a password submission.
	 *
	 * @var array<string, array<string, string>>
	 */
	private $protected_area_unlock_errors = [];

	/**
	 * Post types already configured for protected-area meta support.
	 *
	 * @var array<string, bool>
	 */
	private $protected_area_meta_post_types = [];

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
		add_action( 'init', [ $this, 'register_protected_area_post_meta' ], 100 );
		add_action( 'registered_post_type', [ $this, 'register_protected_area_post_meta_for_post_type' ], 10, 1 );
        add_action( 'init', [ $this, 'handle_protected_area_unlock_submission' ], 20 );
    }


    /**
     * Helper function to check if the block render call is coming from Gutenburg or the website.
     *
     * @return bool $is_gb_editor
     */
    private function check_is_gb_editor() {
        $is_gb_editor = defined( 'REST_REQUEST' ) && true === REST_REQUEST && ! empty( $_REQUEST['context'] ) && 'edit' === filter_input( INPUT_GET, 'context', FILTER_SANITIZE_SPECIAL_CHARS ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        return $is_gb_editor;
    }


	/**
     * Registers blocks and callbacks for dynamic blocks.
     *
     * @return void
     */
    public function register_blocks(): void {
        $block_definitions = [
            [
                'directory'       => plugin_dir_path( __DIR__ ) . 'scripts/blocks/protected-area',
                'render_callback' => [ $this, 'render_protected_area_block' ],
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
         * Register protected-area post meta for every currently registered block-editor post type.
         *
         * @return void
         */
	public function register_protected_area_post_meta(): void {
		foreach ( get_post_types( [], 'names' ) as $post_type ) {
			$this->register_protected_area_post_meta_for_post_type( $post_type );
		}
	}


	/**
	 * Register protected-area post meta for one block-editor post type.
	 *
	 * @param string $post_type Post type slug.
	 * @return void
	 */
	public function register_protected_area_post_meta_for_post_type( string $post_type ): void {
		$post_type = sanitize_key( $post_type );

		if ( '' === $post_type || isset( $this->protected_area_meta_post_types[ $post_type ] ) || ! $this->is_protected_area_meta_supported_post_type( $post_type ) ) {
			return;
		}

		if ( ! post_type_supports( $post_type, 'custom-fields' ) ) {
			add_post_type_support( $post_type, 'custom-fields' );
		}

		register_post_meta(
			$post_type,
			self::PROTECTED_AREA_META_KEY,
			[
				'type'              => 'string',
				'single'            => true,
				'default'           => '{}',
				'sanitize_callback' => [ $this, 'sanitize_protected_area_password_map' ],
				'auth_callback'     => [ $this, 'authorize_protected_area_post_meta' ],
				'show_in_rest'      => [
					'schema' => [
						'type'    => 'string',
						'default' => '{}',
						'context' => [ 'edit' ],
					],
				],
			]
		);

		$this->protected_area_meta_post_types[ $post_type ] = true;
	}


	/**
	 * Determine whether a post type can persist protected-area passwords through the block editor.
	 *
	 * @param string $post_type Post type slug.
	 * @return bool
	 */
	private function is_protected_area_meta_supported_post_type( string $post_type ): bool {
		if ( ! post_type_exists( $post_type ) ) {
			return false;
		}

		if ( function_exists( 'use_block_editor_for_post_type' ) ) {
			return use_block_editor_for_post_type( $post_type );
		}

		$post_type_object = get_post_type_object( $post_type );

		return $post_type_object instanceof \WP_Post_Type && $post_type_object->show_in_rest && post_type_supports( $post_type, 'editor' );
	}


	/**
	 * Restrict protected-area meta access to editors of the current post.
	 *
	 * @param bool   $allowed  Whether the current user can access the meta field.
	 * @param string $meta_key Meta key.
	 * @param int    $post_id  Post ID.
	 * @return bool
	 */
	public function authorize_protected_area_post_meta( $allowed, $meta_key, $post_id ): bool {
		return current_user_can( 'edit_post', (int) $post_id );
	}


	/**
	 * Sanitize the protected-area password map before it is stored.
	 *
	 * @param mixed $meta_value Meta value received from the editor.
	 * @return string
	 */
	public function sanitize_protected_area_password_map( $meta_value ): string {
		$decoded = is_array( $meta_value ) ? $meta_value : json_decode( (string) $meta_value, true );

		if ( ! is_array( $decoded ) ) {
			return wp_json_encode( [] );
		}

		$sanitized = [];

		foreach ( $decoded as $instance_id => $entry ) {
			$instance_id = sanitize_key( (string) $instance_id );

			if ( '' === $instance_id || ! is_array( $entry ) ) {
				continue;
			}

			$hash      = isset( $entry['hash'] ) && is_string( $entry['hash'] ) ? $entry['hash'] : '';
			$plain     = isset( $entry['plain'] ) && is_string( $entry['plain'] ) ? $entry['plain'] : '';
			$has_plain = '' !== trim( $plain );

			if ( $has_plain ) {
				$hash = wp_hash_password( $plain );
			}

			if ( '' === $hash ) {
				continue;
			}

			$sanitized[ $instance_id ] = [
				'hash' => $hash,
			];

			if ( $has_plain ) {
				$sanitized[ $instance_id ]['plain'] = $plain;
			}
		}

		return wp_json_encode( $sanitized );
	}


	/**
	 * Handle password form submissions for protected-area blocks.
	 *
	 * @return void
	 */
	public function handle_protected_area_unlock_submission(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- This form only unlocks content for the current visitor and does not modify privileged site data.
		$request_method = isset( $_SERVER['REQUEST_METHOD'] ) ? strtoupper( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_METHOD'] ) ) ) : '';

		if ( 'POST' !== $request_method ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Read-only processing of this public password form.
		$action = isset( $_POST['cleanbcdx_protected_area_action'] ) ? sanitize_key( wp_unslash( $_POST['cleanbcdx_protected_area_action'] ) ) : '';

		if ( 'unlock' !== $action ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Read-only processing of this public password form.
		$post_id = isset( $_POST['cleanbcdx_protected_area_post_id'] ) ? absint( wp_unslash( $_POST['cleanbcdx_protected_area_post_id'] ) ) : 0;
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Read-only processing of this public password form.
		$instance_id = isset( $_POST['cleanbcdx_protected_area_instance_id'] ) ? sanitize_key( wp_unslash( $_POST['cleanbcdx_protected_area_instance_id'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Read-only processing of this public password form.
		$password = isset( $_POST['cleanbcdx_protected_area_password'] ) ? (string) wp_unslash( $_POST['cleanbcdx_protected_area_password'] ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Read-only processing of this public password form.
		$redirect_to = isset( $_POST['cleanbcdx_protected_area_redirect_to'] ) ? esc_url_raw( wp_unslash( $_POST['cleanbcdx_protected_area_redirect_to'] ) ) : '';

		if ( ! $post_id || '' === $instance_id ) {
			return;
		}

		$password_map              = $this->get_protected_area_password_map( $post_id );
		$entry                     = $password_map[ $instance_id ] ?? [];
		$hash                      = is_array( $entry ) && isset( $entry['hash'] ) && is_string( $entry['hash'] ) ? $entry['hash'] : '';
		$block_attributes          = $this->get_protected_area_block_attributes( $post_id, $instance_id );
		$access_expires_in         = $this->sanitize_protected_area_access_expiry( $block_attributes['accessExpiresIn'] ?? 'day' );
		$access_expires_in_seconds = $this->get_protected_area_access_expiry_seconds( $access_expires_in );

		if ( '' === $hash || '' === trim( $password ) || ! wp_check_password( $password, $hash ) ) {
			$this->protected_area_unlock_errors[ $post_id ][ $instance_id ] = __( 'Incorrect password. Enter the correct password and try again.', 'bcgov-plugin-cleanbc' );
			return;
		}

		$cookie_name  = $this->get_protected_area_cookie_name( $post_id, $instance_id );
		$cookie_value = $this->get_protected_area_cookie_value( $post_id, $instance_id, $hash );

		$this->set_protected_area_cookie( $cookie_name, $cookie_value, $access_expires_in_seconds );

		$_COOKIE[ $cookie_name ] = $cookie_value;

		$page_cookie_name  = $this->get_protected_area_page_cookie_name( $post_id );
		$page_cookie_value = $this->get_protected_area_page_cookie_value( $post_id, $password_map, $access_expires_in_seconds );

		$this->set_protected_area_cookie( $page_cookie_name, $page_cookie_value, $access_expires_in_seconds );

		$_COOKIE[ $page_cookie_name ] = $page_cookie_value;

		if ( '' === $redirect_to ) {
			$redirect_to = get_permalink( $post_id );

			if ( ! $redirect_to ) {
				$redirect_to = home_url( '/' );
			}
		}

		wp_safe_redirect( $redirect_to );
		exit;
	}


	/**
	 * Render a protected-area block.
	 *
	 * @param array          $attributes Block attributes.
	 * @param string         $content    Rendered inner block content.
	 * @param \WP_Block|null $block      Current block instance.
	 * @return string
	 */
	public function render_protected_area_block( $attributes, $content, $block = null ) {
		$wrapper_attributes = get_block_wrapper_attributes(
			[
				'class' => 'cleanbcdx-protected-area-block',
			]
		);

		$instance_id = isset( $attributes['instanceId'] ) ? sanitize_key( $attributes['instanceId'] ) : '';

		if ( '' === $instance_id || $this->check_is_gb_editor() ) {
			return sprintf( '<div %1$s>%2$s</div>', $wrapper_attributes, $content );
		}

		$post_id           = $this->get_protected_area_post_id( $block );
		$password_map      = $post_id ? $this->get_protected_area_password_map( $post_id ) : [];
		$entry             = $password_map[ $instance_id ] ?? [];
		$hash              = is_array( $entry ) && isset( $entry['hash'] ) && is_string( $entry['hash'] ) ? $entry['hash'] : '';
		$allow_page_unlock = ! empty( $attributes['allowPageUnlock'] );

		if ( '' !== $hash && ! headers_sent() ) {
			nocache_headers();
		}

		if ( ! $post_id || '' === $hash || $this->is_protected_area_unlocked( $post_id, $instance_id, $hash ) ) {
			return sprintf( '<div %1$s>%2$s</div>', $wrapper_attributes, $content );
		}

		$access_expires_in_seconds = $this->get_protected_area_access_expiry_seconds(
			$this->sanitize_protected_area_access_expiry( $attributes['accessExpiresIn'] ?? 'day' )
		);

		if ( $allow_page_unlock && $this->is_protected_area_page_unlocked( $post_id, $password_map, $access_expires_in_seconds ) ) {
			return sprintf( '<div %1$s>%2$s</div>', $wrapper_attributes, $content );
		}

		$prompt_message       = isset( $attributes['promptMessage'] ) && is_string( $attributes['promptMessage'] ) && '' !== trim( $attributes['promptMessage'] )
			? $attributes['promptMessage']
			: __( 'Enter the password to view this content.', 'bcgov-plugin-cleanbc' );
		$prompt_heading       = isset( $attributes['promptHeading'] ) && is_string( $attributes['promptHeading'] ) && '' !== trim( $attributes['promptHeading'] )
			? $attributes['promptHeading']
			: __( 'Protected content', 'bcgov-plugin-cleanbc' );
		$prompt_heading_level = $this->sanitize_protected_area_heading_level( $attributes['promptHeadingLevel'] ?? 'h2' );
		$prompt_width         = $this->sanitize_protected_area_width( $attributes['promptWidth'] ?? '' );
		$prompt_justification = $this->sanitize_protected_area_justification( $attributes['promptJustification'] ?? 'left' );
		$show_border          = ! array_key_exists( 'showBorder', $attributes ) || ! empty( $attributes['showBorder'] );

		$error_message          = $this->protected_area_unlock_errors[ $post_id ][ $instance_id ] ?? '';
		$heading_id             = sprintf( 'cleanbcdx-protected-area-heading-%s', $instance_id );
		$input_id               = sprintf( 'cleanbcdx-protected-area-password-%s', $instance_id );
		$error_id               = sprintf( 'cleanbcdx-protected-area-error-%s', $instance_id );
		$redirect_to            = $this->get_protected_area_redirect_url( $post_id );
		$error_markup           = '';
		$form_styles            = [];
		$input_error_attributes = '';
		$input_focus_attributes = '';

		if ( '' !== $prompt_width ) {
			$form_styles[] = sprintf( 'max-width:%s', $prompt_width );
			$form_styles[] = 'width:100%';
		}

		$form_styles[] = $show_border ? 'border-width:1px' : 'border-width:0';

		if ( 'center' === $prompt_justification ) {
			$form_styles[] = 'margin-left:auto';
			$form_styles[] = 'margin-right:auto';
		} elseif ( 'right' === $prompt_justification ) {
			$form_styles[] = 'margin-left:auto';
		} else {
			$form_styles[] = 'margin-right:auto';
		}

		$form_style = '';

		if ( ! empty( $form_styles ) ) {
			$form_style = sprintf( ' style="%s"', esc_attr( implode( ';', $form_styles ) . ';' ) );
		}

		if ( '' !== $error_message ) {
			$input_focus_attributes = ' autofocus';

			$input_error_attributes = sprintf(
				' aria-invalid="true" aria-errormessage="%s"',
				esc_attr( $error_id )
			);

			$error_markup = sprintf(
				'<p class="cleanbcdx-protected-area__error" id="%1$s" role="alert">%2$s</p>',
				esc_attr( $error_id ),
				esc_html( $error_message )
			);
		}

		$heading_markup = sprintf(
			'<%1$s class="cleanbcdx-protected-area__heading" id="%2$s">%3$s</%1$s>',
			tag_escape( $prompt_heading_level ),
			esc_attr( $heading_id ),
			esc_html( $prompt_heading )
		);

		$prompt_message_markup = nl2br(
			wp_kses(
				$prompt_message,
				[
					'a'      => [
						'href'       => true,
						'target'     => true,
						'rel'        => true,
						'title'      => true,
						'aria-label' => true,
					],
					'br'     => [],
					'strong' => [],
					'b'      => [],
					'em'     => [],
					'i'      => [],
				]
			)
		);

		$form_markup = sprintf(
			'<form class="cleanbcdx-protected-area__form" method="post" aria-labelledby="%10$s"%9$s>'
			. '%11$s'
			. '<p class="cleanbcdx-protected-area__message">%1$s</p>'
			. '%2$s'
			. '<label class="cleanbcdx-protected-area__label" for="%3$s">%4$s</label>'
			. '<input class="cleanbcdx-protected-area__input" id="%3$s" name="cleanbcdx_protected_area_password" type="password" required autocomplete="new-password"%12$s%13$s />'
			. '<input name="cleanbcdx_protected_area_action" type="hidden" value="unlock" />'
			. '<input name="cleanbcdx_protected_area_post_id" type="hidden" value="%5$d" />'
			. '<input name="cleanbcdx_protected_area_instance_id" type="hidden" value="%6$s" />'
			. '<input name="cleanbcdx_protected_area_redirect_to" type="hidden" value="%7$s" />'
			. '<button class="cleanbcdx-protected-area__submit" type="submit">%8$s</button>'
			. '</form>',
			$prompt_message_markup,
			$error_markup,
			esc_attr( $input_id ),
			esc_html__( 'Enter password', 'bcgov-plugin-cleanbc' ),
			$post_id,
			esc_attr( $instance_id ),
			esc_url( $redirect_to ),
			esc_html__( 'Unlock content', 'bcgov-plugin-cleanbc' ),
			$form_style,
			esc_attr( $heading_id ),
			$heading_markup,
			$input_error_attributes,
			$input_focus_attributes
		);

		return sprintf( '<div %1$s>%2$s</div>', $wrapper_attributes, $form_markup );
	}


	/**
	 * Get the current post ID for the protected-area block context.
	 *
	 * @param \WP_Block|null $block Current block instance.
	 * @return int
	 */
	private function get_protected_area_post_id( $block ): int {
		if ( $block instanceof \WP_Block && ! empty( $block->context['postId'] ) ) {
			return absint( $block->context['postId'] );
		}

		$post_id = get_the_ID();

		if ( $post_id ) {
			return absint( $post_id );
		}

		return absint( get_queried_object_id() );
	}


	/**
	 * Get the stored password map for a post.
	 *
	 * @param int $post_id Post ID.
	 * @return array<string, array<string, string>>
	 */
	private function get_protected_area_password_map( int $post_id ): array {
		$stored_value = get_post_meta( $post_id, self::PROTECTED_AREA_META_KEY, true );
		$decoded      = is_array( $stored_value ) ? $stored_value : json_decode( (string) $stored_value, true );

		return is_array( $decoded ) ? $decoded : [];
	}


	/**
	 * Build the unlock cookie name for a protected-area block.
	 *
	 * @param int    $post_id     Post ID.
	 * @param string $instance_id Block instance ID.
	 * @return string
	 */
	private function get_protected_area_cookie_name( int $post_id, string $instance_id ): string {
		return self::PROTECTED_AREA_COOKIE_PREFIX . substr( md5( $post_id . '|' . $instance_id ), 0, 20 );
	}


	/**
	 * Build the page-level unlock cookie name for shared protected areas.
	 *
	 * @param int $post_id Post ID.
	 * @return string
	 */
	private function get_protected_area_page_cookie_name( int $post_id ): string {
		return self::PROTECTED_AREA_PAGE_COOKIE_PREFIX . substr( md5( (string) $post_id ), 0, 20 );
	}


	/**
	 * Build the signed cookie value used to remember an unlocked area.
	 *
	 * @param int    $post_id     Post ID.
	 * @param string $instance_id Block instance ID.
	 * @param string $hash        Stored password hash.
	 * @return string
	 */
	private function get_protected_area_cookie_value( int $post_id, string $instance_id, string $hash ): string {
		return hash_hmac( 'sha256', $post_id . '|' . $instance_id . '|' . $hash, wp_salt( 'auth' ) );
	}


	/**
	 * Build the signed cookie value used to remember a page-level unlock.
	 *
	 * @param int   $post_id                  Post ID.
	 * @param array $password_map             Stored password map.
	 * @param int   $access_expires_in_seconds Duration of the unlocking block.
	 * @return string
	 */
	private function get_protected_area_page_cookie_value( int $post_id, array $password_map, int $access_expires_in_seconds ): string {
		$issued_at = time();

		return sprintf(
			'%1$d|%2$d|%3$s',
			$issued_at,
			$access_expires_in_seconds,
			$this->get_protected_area_page_cookie_signature( $post_id, $password_map, $issued_at, $access_expires_in_seconds )
		);
	}


	/**
	 * Build the signature used to validate a page-level unlock cookie.
	 *
	 * @param int   $post_id                  Post ID.
	 * @param array $password_map             Stored password map.
	 * @param int   $issued_at                Unix timestamp when the unlock was created.
	 * @param int   $access_expires_in_seconds Duration of the unlocking block.
	 * @return string
	 */
	private function get_protected_area_page_cookie_signature( int $post_id, array $password_map, int $issued_at, int $access_expires_in_seconds ): string {
		$hashes = [];

		foreach ( $password_map as $instance_id => $entry ) {
			if ( ! is_array( $entry ) || empty( $entry['hash'] ) || ! is_string( $entry['hash'] ) ) {
				continue;
			}

			$hashes[ sanitize_key( (string) $instance_id ) ] = $entry['hash'];
		}

		ksort( $hashes );

		return hash_hmac( 'sha256', $post_id . '|' . wp_json_encode( $hashes ) . '|' . $issued_at . '|' . $access_expires_in_seconds, wp_salt( 'auth' ) );
	}


	/**
	 * Persist a protected-area cookie with the standard options for this plugin.
	 *
	 * @param string $cookie_name                Cookie name.
	 * @param string $cookie_value               Cookie value.
	 * @param int    $access_expires_in_seconds  Duration in seconds.
	 * @return void
	 */
	private function set_protected_area_cookie( string $cookie_name, string $cookie_value, int $access_expires_in_seconds ): void {
		setcookie(
			$cookie_name,
			$cookie_value,
			[
				'expires'  => time() + $access_expires_in_seconds,
				'path'     => defined( 'COOKIEPATH' ) && COOKIEPATH ? COOKIEPATH : '/',
				'domain'   => defined( 'COOKIE_DOMAIN' ) ? COOKIE_DOMAIN : '',
				'secure'   => is_ssl(),
				'httponly' => true,
				'samesite' => 'Strict',
			]
		);
	}


	/**
	 * Determine whether the current visitor has already unlocked a block.
	 *
	 * @param int    $post_id     Post ID.
	 * @param string $instance_id Block instance ID.
	 * @param string $hash        Stored password hash.
	 * @return bool
	 */
	private function is_protected_area_unlocked( int $post_id, string $instance_id, string $hash ): bool {
		$cookie_name = $this->get_protected_area_cookie_name( $post_id, $instance_id );

		if ( empty( $_COOKIE[ $cookie_name ] ) ) {
			return false;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Cookie is only used to remember an unlocked content area for the current visitor.
		$cookie_value = sanitize_text_field( wp_unslash( $_COOKIE[ $cookie_name ] ) );
		$expected     = $this->get_protected_area_cookie_value( $post_id, $instance_id, $hash );

		return hash_equals( $expected, $cookie_value );
	}


	/**
	 * Determine whether the current visitor has unlocked any protected area on the page.
	 *
	 * @param int   $post_id                  Post ID.
	 * @param array $password_map             Stored password map.
	 * @param int   $access_expires_in_seconds Duration configured for the current block.
	 * @return bool
	 */
	private function is_protected_area_page_unlocked( int $post_id, array $password_map, int $access_expires_in_seconds ): bool {
		$cookie_name = $this->get_protected_area_page_cookie_name( $post_id );

		if ( empty( $_COOKIE[ $cookie_name ] ) ) {
			return false;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Cookie is only used to remember an unlocked content area for the current visitor.
		$cookie_value = sanitize_text_field( wp_unslash( $_COOKIE[ $cookie_name ] ) );
		$cookie_parts = explode( '|', $cookie_value, 3 );

		if ( 3 !== count( $cookie_parts ) ) {
			return false;
		}

		$issued_at               = absint( $cookie_parts[0] );
		$unlock_duration_seconds = absint( $cookie_parts[1] );
		$cookie_signature        = sanitize_text_field( $cookie_parts[2] );

		if ( ! in_array( $unlock_duration_seconds, [ DAY_IN_SECONDS, WEEK_IN_SECONDS, MONTH_IN_SECONDS ], true ) ) {
			return false;
		}

		if ( time() > $issued_at + min( $access_expires_in_seconds, $unlock_duration_seconds ) ) {
			return false;
		}

		$expected = $this->get_protected_area_page_cookie_signature( $post_id, $password_map, $issued_at, $unlock_duration_seconds );

		return hash_equals( $expected, $cookie_signature );
	}


	/**
	 * Get saved block attributes for a protected-area instance.
	 *
	 * @param int    $post_id     Post ID.
	 * @param string $instance_id Block instance ID.
	 * @return array<string, mixed>
	 */
	private function get_protected_area_block_attributes( int $post_id, string $instance_id ): array {
		$post = get_post( $post_id );

		if ( ! $post instanceof \WP_Post ) {
			return [];
		}

		$matched_block = $this->find_protected_area_block_by_instance_id( parse_blocks( $post->post_content ), $instance_id );

		if ( empty( $matched_block['attrs'] ) || ! is_array( $matched_block['attrs'] ) ) {
			return [];
		}

		return $matched_block['attrs'];
	}


	/**
	 * Recursively find a protected-area block by instance ID.
	 *
	 * @param array  $blocks      Parsed blocks.
	 * @param string $instance_id Block instance ID.
	 * @return array<string, mixed>
	 */
	private function find_protected_area_block_by_instance_id( array $blocks, string $instance_id ): array {
		foreach ( $blocks as $block ) {
			$block_name        = isset( $block['blockName'] ) && is_string( $block['blockName'] ) ? $block['blockName'] : '';
			$attrs             = isset( $block['attrs'] ) && is_array( $block['attrs'] ) ? $block['attrs'] : [];
			$block_instance_id = isset( $attrs['instanceId'] ) && is_string( $attrs['instanceId'] ) ? $attrs['instanceId'] : '';

			if ( 'bcgovcleanbc/protected-area' === $block_name && $block_instance_id === $instance_id ) {
				return $block;
			}

			$inner_blocks = isset( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ? $block['innerBlocks'] : [];

			if ( empty( $inner_blocks ) ) {
				continue;
			}

			$matched_block = $this->find_protected_area_block_by_instance_id( $inner_blocks, $instance_id );

			if ( ! empty( $matched_block ) ) {
				return $matched_block;
			}
		}

		return [];
	}


	/**
	 * Get the URL to return to after a successful unlock.
	 *
	 * @param int $post_id Post ID.
	 * @return string
	 */
	private function get_protected_area_redirect_url( int $post_id ): string {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Request URI is only reused as a local redirect target after a successful unlock.
		if ( ! empty( $_SERVER['REQUEST_URI'] ) ) {
			return home_url( wp_unslash( $_SERVER['REQUEST_URI'] ) );
		}

		$redirect_to = get_permalink( $post_id );

		if ( ! $redirect_to ) {
			$redirect_to = home_url( '/' );
		}

		return $redirect_to;
	}


	/**
	 * Sanitize a protected-area prompt width value for safe inline CSS use.
	 *
	 * @param mixed $width_value Width attribute value.
	 * @return string
	 */
	private function sanitize_protected_area_width( $width_value ): string {
		if ( ! is_string( $width_value ) ) {
			return '';
		}

		$width_value = trim( sanitize_text_field( $width_value ) );

		if ( '' === $width_value ) {
			return '';
		}

		if ( preg_match( '/^\d+(?:\.\d+)?(?:px|%|em|rem|vw)$/', $width_value ) ) {
			return $width_value;
		}

		return '';
	}


	/**
	 * Sanitize a protected-area prompt justification value.
	 *
	 * @param mixed $justification_value Justification attribute value.
	 * @return string
	 */
	private function sanitize_protected_area_justification( $justification_value ): string {
		if ( ! is_string( $justification_value ) ) {
			return 'left';
		}

		$justification_value = sanitize_key( $justification_value );

		if ( in_array( $justification_value, [ 'left', 'center', 'right' ], true ) ) {
			return $justification_value;
		}

		return 'left';
	}


	/**
	 * Sanitize a protected-area prompt heading level.
	 *
	 * @param mixed $heading_level Heading level attribute value.
	 * @return string
	 */
	private function sanitize_protected_area_heading_level( $heading_level ): string {
		if ( ! is_string( $heading_level ) ) {
			return 'h2';
		}

		$heading_level = sanitize_key( $heading_level );

		if ( in_array( $heading_level, [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ], true ) ) {
			return $heading_level;
		}

		return 'h2';
	}


	/**
	 * Sanitize a protected-area access expiry option.
	 *
	 * @param mixed $access_expiry Access expiry attribute value.
	 * @return string
	 */
	private function sanitize_protected_area_access_expiry( $access_expiry ): string {
		if ( ! is_string( $access_expiry ) ) {
			return 'day';
		}

		$access_expiry = sanitize_key( $access_expiry );

		if ( in_array( $access_expiry, [ 'day', 'week', 'month' ], true ) ) {
			return $access_expiry;
		}

		return 'day';
	}


	/**
	 * Map a protected-area access expiry option to seconds.
	 *
	 * @param string $access_expiry Access expiry option.
	 * @return int
	 */
	private function get_protected_area_access_expiry_seconds( string $access_expiry ): int {
		switch ( $access_expiry ) {
			case 'week':
				return WEEK_IN_SECONDS;

			case 'month':
				return MONTH_IN_SECONDS;

			case 'day':
			default:
				return DAY_IN_SECONDS;
		}
	}
}
