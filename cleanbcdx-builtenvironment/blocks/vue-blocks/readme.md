# Vue.js WordPress Block

This WordPress plugin integrates a Vue.js application into a custom block in the WordPress editor. The plugin enqueues the necessary assets, registers the block, and renders the Vue.js app on the front end.

## Functions (as found in /index.php)

### `vuejs_wordpress_block()`

Registers the block's script to be loaded in the block editor. The script handles the functionality of the Vue.js app within the block.

### `vuejs_app()`

Loads the Vue.js app's assets onto the client. It checks if the current page contains the Vue.js block and enqueues the CSS files required for the app.

### `vuejs_app_dynamic_block($attributes)`

The render callback for the Vue.js app block. This function is responsible for enqueuing the CSS and JS files, accessing the block attributes, and returning the HTML output for the block.

- Parameters:
  - `$attributes` (array): The attributes of the block.

- Returns:
  - (string) The HTML output for the block.

### `vuejs_app_block_init()`

Initializes the Vue.js app block by registering it with the WordPress editor. This function sets the render callback to `vuejs_app_dynamic_block()`.

## Usage

1. Install and activate the plugin in your WordPress installation.
2. Create a new block using the WordPress editor.
3. Locate the "Vue.js WordPress Block" in the block inserter.
4. Customize the block's attributes as needed.
5. Save the changes and view the block on the front end.

Make sure to have the necessary Vue.js assets in the plugin's `dist/assets/` directory.

## Requirements

- WordPress 6.0 or higher
- Vue.js 3.3 or higher – <script setup> is a compile-time syntactic sugar for using Composition API inside Single-File Components (SFCs)
