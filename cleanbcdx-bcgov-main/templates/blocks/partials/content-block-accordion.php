<?php
    $accordion_items = $content_block['accordion_items'];
    $container_hash  = md5( wp_rand() );
?>
<div class="<?php foreach ( $content_block_classes as $class_key => $class ) { echo esc_attr( $class ); } ?>">
    <div class="inner">
        <div class="accordions">
            <div class="inner">
            <?php
                $block_markup = '';

                // Open Collapsible Container.
                $block_markup .= '<!-- wp:bcgov-block-theme/collapse {"collapseId":"collapse-container-' . $container_hash . '","className":"is-style-bcgov"} -->
                    <div id="collapse-container-' . $container_hash . '" data-open-first-item="false" class="wp-block-bcgov-block-theme-collapse is-style-bcgov">
                        <div class="collapse-container-nav">
                            <span><button data-target="#collapse-container-' . $container_hash . '" class="collapse-expand-all">Expand all</button></span>
                            <span><button data-target="#collapse-container-' . $container_hash . '" class="collapse-collapse-all">Collapse all</button></span>
                        </div>';

                // Items loop.
			foreach ( $accordion_items as $item_key => $item ) {
				$heading     = $item['accordion_heading'];
				$body_blocks = $item['accordion_body'];
				$item_hash   = md5( wp_rand() );
				$item_id     = '' !== $item['item_id'] ? $item['item_id'] : $item_hash;

				// Open collapse item.
				$block_markup .= '<!-- wp:bcgov-block-theme/collapse-item {"title":"' . $heading . '","itemId":"collapse-item-' . $item_id . '","headingId":"heading-' . $item_key . '"} -->
                        <div class="wp-block-bcgov-block-theme-collapse-item" id="' . $item_id . '">';

				// Add item heading.
				$block_markup .= '<div class="collapse-header" id="heading-' . $item_hash . '">
                            <h3>
                            <button data-toggle="collapse" data-target="#collapse-item-' . $item_hash . '" aria-expanded="false" aria-controls="collapse-item-' . $item_hash . '" class="collapsed">
                                <span class="collapse-title">' . $heading . '</span>
                            </button>
                            </h3>
                        </div>';

				// Open item body.
				$block_markup .= '<div class="collapse collapse-container hide" id="collapse-item-' . $item_hash . '">
                        <div class="collapse-body">';

				// Add item blocks.
				foreach ( $body_blocks as $body_block ) {
					$content_block           = [];
					$content_block_classes   = [
						'content-block ',
					];
					$content_block_layout    = $body_block['acf_fc_layout'];
					$content_block_classes[] = $content_block_layout . ' ';

					if ( 'block_text_block' === $content_block_layout ) {
						$block_markup .= $body_block['block_text'];
					} elseif ( 'block_rebate_table' === $content_block_layout ) {
						$block_markup .= '<pre>Accordion nested table goes here.</pre>';
					}
				}

				// Collapse item.
				$block_markup .= '<div class="collapse-close"><a data-toggle="collapse" data-target="#collapse-item-' . $item_hash . '" href="#collapse-item-' . $item_hash . '" role="button" aria-expanded="true" aria-controls="collapse-item-' . $item_hash . '">Collapse</a></div>';

				// Item close.
				$block_markup .= '</div></div></div><!-- /wp:bcgov-block-theme/collapse-item -->';
			}

                // Close container.
                $block_markup .= '</div><!-- /wp:bcgov-block-theme/collapse -->';

                echo wp_kses( do_blocks( $block_markup ), $allowed_html );
            ?>
            </div>
        </div>
    </div>
</div>