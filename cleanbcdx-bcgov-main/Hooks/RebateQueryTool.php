<?php

namespace Bcgov\Plugin\CleanBCDX\Hooks;

/**
 * Rebate query string parsing tool shortcode.
 *
 * @since 1.30.13
 */
class RebateQueryTool {
	/**
	 * Register the shortcode for the rebate query tool.
	 *
	 * @return void
	 */
	public function register_shortcode(): void {
		add_shortcode( 'cleanbc_rebate_query_tool', [ $this, 'render_shortcode' ] );
	}

	/**
	 * Render the rebate query tool markup.
	 *
	 * @param array $attributes Shortcode attributes.
	 * @return string
	 */
	public function render_shortcode( $attributes ): string {
		$attributes = shortcode_atts(
			[
				'format' => 'json',
				'title'  => 'Rebate query parser',
			],
			$attributes,
			'cleanbc_rebate_query_tool'
		);

		$format  = 'csv' === strtolower( $attributes['format'] ) ? 'csv' : 'json';
		$title   = sanitize_text_field( $attributes['title'] );
		$tool_id = wp_unique_id( 'cleanbc-rebate-query-tool-' );

		ob_start();
		?>
		<div class="cleanbc-rebate-query-tool" data-cleanbc-tool="rebate-query" data-output-format="<?php echo esc_attr( $format ); ?>">
			<h2><?php echo esc_html( $title ); ?></h2>

			<div class="cleanbc-rebate-query-tool__field">
				<label for="<?php echo esc_attr( $tool_id ); ?>-input">Rebate tool URL or query string</label>
				<input
					id="<?php echo esc_attr( $tool_id ); ?>-input"
					type="url"
					placeholder="https://betterhomes.gov.bc.ca/rebates/?tool=rebates&amp;type=detached-dwelling"
					autocomplete="off"
					data-input
				/>
			</div>

			<div class="cleanbc-rebate-query-tool__options">
				<h3>Output format:</h3>
				<label>
					<input type="radio" name="<?php echo esc_attr( $tool_id ); ?>-format" value="json" data-format <?php checked( 'json', $format ); ?> />
					JSON
				</label>
				<label>
					<input type="radio" name="<?php echo esc_attr( $tool_id ); ?>-format" value="csv" data-format <?php checked( 'csv', $format ); ?> />
					CSV
				</label>
			</div>

			<div class="cleanbc-rebate-query-tool__actions">
				<button type="button" class="parse-button" data-action="parse">Parse URL</button>
				<button type="button" class="copy-button" data-action="copy" disabled>Copy output</button>
				<button type="button" class="download-button" data-action="download" disabled>Download</button>
			</div>

			<p class="cleanbc-rebate-query-tool__message" data-message></p>

			<div class="cleanbc-rebate-query-tool__output">
				<label for="<?php echo esc_attr( $tool_id ); ?>-output">Output</label>
				<textarea
					id="<?php echo esc_attr( $tool_id ); ?>-output"
					rows="10"
					readonly
					data-output
				></textarea>
			</div>

			<div class="cleanbc-rebate-query-tool__unmapped" hidden>
				<strong>Unmapped query params</strong>
				<pre data-unmapped></pre>
			</div>
		</div>
		<?php
		return ob_get_clean();
	}
}
