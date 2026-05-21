<?php
/**
 * The Rebates Page Block - faq content
 *
 * @param boolean $is_gb_editor Is this being rendered in the Gutenberg editor. The post wont be available in the editor, so make sure to set some defaults if in editor.
 *
 * @package Bcgov\Plugin\BasicBlocks
 */

require dirname( __DIR__ ) . '/config/template-vars.php';

/**
 * ACF Fields
 */
$faq_section = get_field( 'faqs_and_more_section' );

if ( $is_gb_editor ) : ?>
	<h2>FAQs and More</h2>
	<p><b>Note to editors:</b> This content can be found in the <b>FAQs and more</b> tab of the <b>Template Rebate</b> section in the post itself.</p>
<?php elseif ( $faq_section['block_faqs_lists'] || $more_content_block ) : ?>
	<section id="faqs-and-more" class="block block--faqs faqs-block">
		<div class="inner">
			<h2>FAQs and More</h2>
			<div class="grid">
				<?php
                foreach ( $faq_section['block_faqs_lists'] as $key => $faq ) :
					$image_url                      = $faq['faqs_image'];
					$heading                        = $faq['faqs_heading'];
					$post_ref_ids                   = $faq['faqs'];
					$item_classes                   = 'grid-item grid-item--faqs grid-item--' . ( $key + 1 );
					0 === $key % 2 ? $item_classes .= ' odd' : $item_classes .= ' even';
					?>
					<div class="<?php echo esc_attr( $item_classes ); ?>">
						<div class="image" style="background-image: url(<?php echo esc_attr( $image_url ); ?>);">
						</div>
						<div class="body">
							<div class="heading">
								<h3><?php echo wp_kses( $heading, $allowed_html ); ?></h3>
							</div>
							<?php
								$block_markup  = '';
								$block_markup .= '<!-- wp:list -->
									<ul class="faqs-list"><!-- wp:list-item -->';

							foreach ( $post_ref_ids as $post_ref_id ) {
								$post_ref_title     = get_the_title( $post_ref_id );
								$post_ref_permalink = get_permalink( $post_ref_id );

								$block_markup .= '<!-- wp:list-item -->
											<li class="item faq"><a href="' . $post_ref_permalink . '">' . $post_ref_title . '</a></li>
										<!-- /wp:list-item -->';
							}
								$block_markup .= '<ul><!-- /wp:list -->';

								echo wp_kses( do_blocks( $block_markup ), $allowed_html );
							?>
						</div>
					</div>
					<?php
                endforeach;
					$more_content_block  = $faq_section['block_more_content'];
					$more_content_button = $more_content_block['button_link'];
					$item_classes        = 'grid-item grid-item--more-content grid-item--3 odd';
				?>
				<div class="<?php echo esc_attr( $item_classes ); ?>">
					<div class="image" style="background-image:url(<?php echo esc_url( $more_content_block['content_image'] ); ?>)"></div>
					<div class="body">
						<?php
							echo wp_kses( $more_content_block['content_body'], $allowed_html );

							$block_markup = '<!-- wp:buttons -->
							<div class="wp-block-buttons"><!-- wp:button -->
								<div class="wp-block-button">
									<a class="wp-block-button__link wp-element-button" target="' . $more_content_button['target'] . '" href="' . $more_content_button['url'] . '">
										' . $more_content_button['title'] . '
									</a>
								</div><!-- /wp:button -->
							</div><!-- /wp:buttons -->';

							echo wp_kses( do_blocks( $block_markup ), $allowed_html );
						?>
					</div>
				</div>
			</div>
		</div>
	</section>
<?php endif; ?>
