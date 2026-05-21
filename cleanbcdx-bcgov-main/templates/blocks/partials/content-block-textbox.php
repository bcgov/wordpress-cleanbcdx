<div class="<?php foreach ( $content_block_classes as $class_key => $class ) { echo esc_attr( $class ); } ?>">
    <div class="inner">
        <?php
            $block_markup  = '';
            $block_markup .= $content_block['block_text'];
            echo wp_kses( do_blocks( $block_markup ), $allowed_html );
        ?>
    </div>
</div>