<?php
/**
 * The Rebates Page Block - Overview content
 *
 * @param boolean $is_gb_editor Is this being rendered in the Gutenberg editor. The post wont be available in the editor, so make sure to set some defaults if in editor.
 *
 * @package Bcgov\Plugin\BasicBlocks
 */

require dirname( __DIR__ ) . '/config/template-vars.php';

/**
 * ACF Fields
 */
$overview_section       = get_field( 'overview_section' );
$block_overview_details = $overview_section['block_overview_details'];
$content_blocks         = $overview_section['content_blocks'];

if ( $is_gb_editor ) : ?>
	<h2>Overview</h2>
	<p><b>Note to editors:</b> This content can be found in the <b>Overview</b> tab of the <b>Template Rebate</b> section in the post itself.</p>
<?php elseif ( $block_overview_details ) : ?>
	<section id="overview" class="block block--rebates overview-block">
		<div class="overview-block__details">
			<div class="inner">
				<h2>Overview</h2>
				<!-- Rebate Amount -->
				<?php if ( $block_overview_details['detail_rebate_amount'] ) : ?>
					<div class="item amount">
						<h3 class="title">Rebate Amount:</h3>
						<div class="body">
							<?php echo wp_kses( wpautop( $block_overview_details['detail_rebate_amount'] ), $allowed_html ); ?>
						</div>
					</div>
				<?php endif; ?>
				<!-- Who Can Apply -->
				<?php if ( $block_overview_details['detail_who_can_apply'] ) : ?>
					<div class="item who">
						<h3 class="title">Who Can Apply:</h3>
						<div class="body">
							<?php echo wp_kses( wpautop( $block_overview_details['detail_who_can_apply'] ), $allowed_html ); ?>
						</div>
					</div>
				<?php endif; ?>
				<!-- Deadline -->
				<?php if ( $block_overview_details['detail_deadline'] ) : ?>
					<div class="item deadline">
						<h3 class="title">Deadline:</h3>
						<div class="body">
							<?php echo wp_kses( wpautop( $block_overview_details['detail_deadline'] ), $allowed_html ); ?>
						</div>
					</div>
				<?php endif; ?>
				<!-- Qualifying Products -->
				<?php if ( $block_overview_details['detail_qualifying_products'] ) : ?>
					<div class="item products">
						<h3 class="title">Qualifying Products:</h3>
						<div class="body">
							<?php echo wp_kses( wpautop( $block_overview_details['detail_qualifying_products'] ), $allowed_html ); ?>						</div>
					</div>
				<?php endif; ?>
				<!-- Funding Provided By -->
				<?php if ( $block_overview_details['detail_funding_provided_by'] ) : ?>
					<div class="item funding">
						<h3 class="title">Funding Provided By:</h3>
						<div class="body">
							<?php echo wp_kses( wpautop( $block_overview_details['detail_funding_provided_by'] ), $allowed_html ); ?>
						</div>
					</div>
				<?php endif; ?>
			</div>
		</div>
		<?php if ( $content_blocks ) : ?>
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
		<?php endif; ?>
	</section>
<?php endif; ?>
