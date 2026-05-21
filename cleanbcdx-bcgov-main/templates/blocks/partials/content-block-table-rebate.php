<?php
    $requirements           = $content_block['requirements'];
	$rebate_amounts         = $content_block['rebate_amounts'];
    $requirements_heading   = $requirements['heading'];
    $rebate_amounts_heading = 0 < strlen( $rebate_amounts['heading'] ) ? $rebate_amounts['heading'] : 'Primary fuel before upgrade';
?>
<table class="<?php foreach ( $content_block_classes as $class_key => $class ) { echo esc_attr( $class ); } ?>">
    <caption class="sr-only">
        <?php echo wp_kses( $requirements['heading'], $allowed_html ); ?>
    </caption>
    <colgroup>
        <col span="1" style="width: 40%;">
        <col span="1" style="width: 40%;">
        <col span="1" style="width: 20%;">
    </colgroup>
    <thead>
        <th class="odd" scope="col"><?php echo wp_kses( $requirements_heading, $allowed_html ); ?></th>
        <th class="even" scope="col"><?php echo wp_kses( $rebate_amounts_heading, $allowed_html ); ?></th>
        <th class="odd" scope="col">Rebate</th>
    </thead>
    <tbody>
        <tr class="span-all--vert">
            <td rowspan="0"><?php echo wp_kses( wpautop( $requirements['content'] ), $allowed_html ); ?></td>
        </tr>
        <?php foreach ( $rebate_amounts['rebate_values'] as $value_key => $value ) : ?>
            <tr class="<?php echo( ( $value_key + 1 ) % 2 === 0 ? 'even' : 'odd' ); ?>">
                <td class="odd"><?php echo wp_kses( wpautop( $value['description'] ), $allowed_html ); ?></td>
                <td class="even"><?php echo wp_kses( wpautop( $value['amount'] ), $allowed_html ); ?></td>
            </tr>
        <?php endforeach; ?>
    </tbody>
</table>
