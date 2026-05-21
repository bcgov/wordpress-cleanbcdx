<?php
    $rows = $content_block['rows'];
?>
<table class="<?php foreach ( $content_block_classes as $class_key => $class ) { echo esc_attr( $class ); } ?>">
    <caption class="sr-only">
        <?php echo wp_kses( $requirements['heading'], $allowed_html ); ?>
    </caption>
    <colgroup>
        <col span="1" style="width: 50%;">
        <col span="1" style="width: 50%;">
    </colgroup>
    <thead>
        <th class="odd" scope="col">I am...</th>
        <th class="even" scope="col">Apply Here</th>
    </thead>
    <tbody>
        <?php
        foreach ( $rows as $row_key => $row ) :
            $i_am_description = $row['i_am_description'];
            $apply_here_text  = $row['apply_here_text'];
            $apply_here_link  = $row['link'];
            $link_classes     = 'link';

            wp_parse_url( get_site_url(), PHP_URL_HOST ) !== wp_parse_url( $apply_here_link, PHP_URL_HOST )
                ? $link_classes .= ' external'
                : null;
			?>
            <tr class="<?php echo( ( $row_key + 1 ) % 2 === 0 ? 'even' : 'odd' ); ?>">
                <td class="odd">
                    <?php echo wp_kses( wpautop( $i_am_description ), $allowed_html ); ?>
                </td>
                <td class="even">
                    <a class="<?php echo esc_attr( $link_classes ); ?>" href="<?php echo esc_url( $apply_here_link ); ?>">
                        <?php echo wp_kses( $apply_here_text, $allowed_html ); ?>
                    </a>
                </td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>
