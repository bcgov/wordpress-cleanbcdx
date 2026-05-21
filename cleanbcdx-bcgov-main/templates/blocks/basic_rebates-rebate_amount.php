<?php
/**
 * The Rebates Page Block - rebate_amount content
 *
 * @param boolean $is_gb_editor Is this being rendered in the Gutenberg editor. The post wont be available in the editor, so make sure to set some defaults if in editor.
 *
 * @package Bcgov\Plugin\BasicBlocks
 */

require dirname( __DIR__ ) . '/config/template-vars.php';

/**
 * ACF Fields
 */
$rebate_amount_section = get_field( 'rebate_amount_section' );
$content_blocks        = $rebate_amount_section['content_blocks'];

if ( $is_gb_editor ) : ?>
	<h2>Rebate Amount</h2>
	<p><b>Note to editors:</b> This content can be found in the <b>Rebate Amount</b> tab of the <b>Template Rebate</b> section in the post itself.</p>
<?php elseif ( $content_blocks ) : ?>
	<section id="rebate-amount" class="block block--rebate-amount rebate-amount-block">
		<div class="inner">
			<h2>Rebate Amount</h2>
			<div class="content-blocks">
				<div class="inner">
					<?php
                    foreach ( $content_blocks as $key => $content_block ) :
						$content_block_classes   = [
							'content-block ',
						];
						$content_block_layout    = $content_block['acf_fc_layout'];
						$content_block_classes[] = $content_block_layout . ' ';

						include __DIR__ . '/partials/content-blocks.php';
					endforeach;
                    ?>
				</div>
			</div>
		</div>
	</section>
<?php endif; ?>
