<?php
    $contact_details = $content_block['contact_details'];
?>
<div class="<?php foreach ( $content_block_classes as $class_key => $class ) { echo esc_attr( $class ); } ?>">
    <?php
    foreach ( $contact_details as $key => $contact ) :
        $numbers_and_links = $contact['phone_numbers_and_links'];
		?>
        <address>
            <h3>
                <?php echo wp_kses( $contact['contact_name'], $allowed_html ); ?>
            </h3>
            <ul>
                <?php
                foreach ( $numbers_and_links as $item ) :
                    $contact_item_string = '';
                    $list_item_class     = '';
                    $link_target         = '';
                    $link_rel            = '';
                    $link_title          = '';
                    $link_classes        = 'link';
                    $link_href           = $item['contact_item']['value']['url'];
                    $link_text           = $item['contact_item']['value']['title'];

                    // Some posts have this field saved in the secondary
                    // format shown below.  Otherwise the data is structured
                    // the same.
                    if ( 'email' === $item['contact_item']['type'] || 'email: Email' === $item['contact_item']['type'] ) {
                        $list_item_class = 'email';
                    }
                    if ( 'phone' === $item['contact_item']['type'] || 'phone: Phone Number' === $item['contact_item']['type'] ) {
                        $list_item_class = 'phone';
                    }
                    if ( 'form' === $item['contact_item']['type'] || 'form: Form' === $item['contact_item']['type'] ) {
                        $list_item_class = 'form';
                        $link_classes   .= ' external';
                    }
                    if ( 'site' === $item['contact_item']['type'] || 'site: Website' === $item['contact_item']['type'] ) {
                        $list_item_class = 'site';
                        $link_classes   .= ' external';
                    }

                    if ( str_contains( $link_classes, 'external' ) ) {
                        $link_target = '_blank';
                        $link_rel    = 'noreferrer noopener';
                        $link_title  = 'Opens in a new tab/window.';
                    }

                    $contact_item_string = '<a class="' . $link_classes . '" href="' . $link_href . '" title="' . $link_title . '" target="' . $link_target . '" rel="' . $link_rel . '">' . $link_text . '</a>';

                    echo '<li class="' . esc_attr( $list_item_class ) . '">' . wp_kses( $contact_item_string, $allowed_html ) . '</li>';
                endforeach;
                ?>
            </ul>
        </address>
    <?php endforeach; ?>
</div>