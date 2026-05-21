<?php
switch ( $content_block['information_type'] ) {
	case '0':
		$content_block_classes[] = 'info-box info-box--info ';
		break;
	case '1':
		$content_block_classes[] = 'info-box info-box--warning ';
		break;
	case '2':
		$content_block_classes[] = 'info-box info-box--success ';
		break;
	case '3':
		$content_block_classes[] = 'info-box info-box--error ';
		break;
}
?>
<div class="<?php foreach ( $content_block_classes as $class_key => $class ) { echo esc_attr( $class ); } ?>">
    <div class="inner">
        <div class="icon"></div>
        <p><?php echo wp_kses( $content_block['information_text'], $allowed_html ); ?></p>
    </div>
</div>
