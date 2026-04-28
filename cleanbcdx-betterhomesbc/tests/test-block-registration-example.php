<?php
/**
 * Class CoreBlockRegistrationTest
 *
 * @package Design_System_Wordpress_Theme
 */
class CoreBlockRegistrationTest extends WP_UnitTestCase {
    /**
     * Tests if the core block 'core/paragraph' is registered.
     */
    public function test_core_block_registered() {
        // The name of the core block to check.
        $block_name = 'core/paragraph';

        // Verify that the block is registered.
        $is_registered = WP_Block_Type_Registry::get_instance()->is_registered( $block_name );

        $this->assertTrue( $is_registered, "The block '{$block_name}' should be registered." );
    }
}
