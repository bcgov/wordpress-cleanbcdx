<?php
/**
 * The Rebates Page Block - program_updates content
 *
 * @param boolean $is_gb_editor Is this being rendered in the Gutenberg editor. The post wont be available in the editor, so make sure to set some defaults if in editor.
 *
 * @package Bcgov\Plugin\BasicBlocks
 */

require dirname( __DIR__ ) . '/config/template-vars.php';

/**
 * ACF Fields
 */
$program_updates_section = get_field( 'program_updates_section' );
$content_blocks          = $program_updates_section['content_blocks'];

if ( $is_gb_editor ) : ?>
	<h2>Program Updates</h2>
	<p><b>Note to editors:</b> This content can be found in the <b>Program Updates</b> tab of the <b>Template Rebate</b> section in the post itself.</p>
<?php elseif ( $content_blocks ) : ?>
	<section id="program-updates" class="block block--program-updates program-updates-block">
		<div class="inner">
			<h2>Program Updates</h2>
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
