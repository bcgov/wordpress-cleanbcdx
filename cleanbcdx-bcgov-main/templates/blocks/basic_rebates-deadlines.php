<?php
/**
 * The Rebates Page Block - deadlines content
 *
 * @param boolean $is_gb_editor Is this being rendered in the Gutenberg editor. The post wont be available in the editor, so make sure to set some defaults if in editor.
 *
 * @package Bcgov\Plugin\BasicBlocks
 */
require dirname( __DIR__ ) . '/config/template-vars.php';

/**
 * ACF Fields
 */
$deadlines_section = get_field( 'deadlines_section' );
$content_blocks    = $deadlines_section['content_blocks'];

if ( $is_gb_editor ) : ?>
	<h2>Deadlines</h2>
	<p><b>Note to editors:</b> This content can be found in the <b>Deadlines</b> tab of the <b>Template Rebate</b> section in the post itself.</p>
<?php elseif ( $content_blocks ) : ?>
	<section id="deadlines" class="block block--deadlines deadlines-block">
		<div class="inner">
			<h2>Deadlines</h2>
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
