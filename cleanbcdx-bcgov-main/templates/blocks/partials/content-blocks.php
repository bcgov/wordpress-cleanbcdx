<?php
if ( 'block_text_box' === $content_block_layout || 'block_text_block' === $content_block_layout ) :
	include __DIR__ . '/content-block-textbox.php';
    elseif ( 'block_information_box' === $content_block_layout ) :
		include __DIR__ . '/content-block-infobox.php';
    elseif ( 'block_rebate_table' === $content_block_layout ) :
		include __DIR__ . '/content-block-table-rebate.php';
    elseif ( 'block_ready_to_apply_table' === $content_block_layout ) :
		include __DIR__ . '/content-block-table-howtoapply.php';
    elseif ( 'block_accordion' === $content_block_layout ) :
		include __DIR__ . '/content-block-accordion.php';
    elseif ( 'block_contact_list' === $content_block_layout ) :
		include __DIR__ . '/content-block-contact-list.php';
    endif;
