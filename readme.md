# CleanBC DX Ecosystem WordPress Plugins

This repository contains the custom WordPress plugins maintained by the CleanBC DX team. Together they extend the BCGov Block Theme and add shared, site-specific, operational, and security functionality for CleanBC DX-managed websites (CleanBC, Better Homes BC, Better Buildings BC, and Go Electric BC).

This is a plugin repository rather than a full WordPress site. Each plugin lives in its own directory and can be built, tested, versioned, and deployed independently. The repository also includes GitHub Actions workflows used for deployment and related operational tasks.

## How the plugins fit together

- `cleanbcdx-bcgov-main` is the shared foundation plugin for the other site-specific plugins.
- `cleanbcdx-builtenvironment`, `cleanbcdx-cleanbc`, and `cleanbcdx-goelectricbc` provide site-specific features and frontend assets.
- `cleanbcdx-misc` and `cleanbcdx-security` are lightweight PHP-only support plugins.
- Supplemental plugins declare `cleanbcdx-bcgov-main` as a dependency, so the base plugin must be available and activated first within a WordPress environment.

## Build and development

There is no root-level build command for this repository. Build from the plugin directory being worked in.

### Prerequisites

- Node.js `>=22.21.1 <23.0.0`
- `npm`
- `composer` for PHP dependencies, Composer scripts, and PHP test tooling
- A local WordPress environment with these plugins mounted in `wp-content/plugins`

### Frontend-enabled plugins

These plugins contain JavaScript, SCSS (note that some migration to modern CSS and vars has been accomplished – a future effort may remove SCSS entirely), and editor/frontend asset build steps:

- `cleanbcdx-bcgov-main`
- `cleanbcdx-builtenvironment`
- `cleanbcdx-cleanbc`
- `cleanbcdx-goelectricbc`

Example initial build flow for one plugin:

```bash
cd cleanbcdx-builtenvironment
composer install
npm ci
npm run build
```

Useful commands available in each frontend-enabled plugin:

- `npm run build` builds plugin assets for local development.
- `npm run build:watch` rebuilds assets when files change.
- `npm run build:production` runs linting, Vitest, and a production asset build.
- `npm test` runs Jest tests.
- `npm run test-vite` runs Vitest tests.
- `composer test` runs PHP unit tests.
- `composer run setup` runs `npm ci` and a one-time build after Composer dependencies are installed.

Build output is written inside each plugin, primarily to `dist/` and `dist-basic/`.

To do a deployment build any of the Frontend-enabled plugins: 

```bash
composer production
composer update
```

Note that the `composer update` process requires being logged into the VPN.

### PHP-only plugins

- `cleanbcdx-misc`
- `cleanbcdx-security`

These plugins do not have a frontend asset pipeline. Changes are typically PHP-only and do not require an npm build.

## Individual plugins

### `cleanbcdx-bcgov-main` – frontend-enabled plugin
#### Deployed on all CleanBC DX managed sites

Shared base plugin that augments the BCGov Block Theme across CleanBC DX websites.

- Provides common scripts, styles, and editor assets.
- Includes shared search-context customizations, accessibility helpers, Gravity Forms cleanup, and some query tooling.
- Acts as the foundation for the site-specific supplemental plugins.
- Build required when frontend or editor assets change.

---

### `cleanbcdx-builtenvironment` – frontend-enabled plugin
#### Deployed on Better Homes BC and Better Buildins BC

Supplemental plugin for the Built Environment properties, including Better Homes BC and Better Buildings BC.

- Adds site-specific scripts, styles, custom blocks and APIs.
- Supports Vue-powered filtering and custom post experiences for content such as rebates, contractors, energy advisors, and FAQs.
- Depends on `cleanbcdx-bcgov-main`.
- Build required when frontend, block-editor, or Vue assets change.

---

### `cleanbcdx-cleanbc` – frontend-enabled plugin
#### Deployed on CleanBC

Supplemental plugin for the CleanBC website.

- Adds site-specific scripts, styles, block/editor enhancements and custom APIs.
- Supports Vue-powered custom post filtering and related frontend interactions.
- Depends on `cleanbcdx-bcgov-main`.
- Build required when frontend, block-editor, or Vue assets change.

---

### `cleanbcdx-goelectricbc` – frontend-enabled plugin
#### Deployed on Go Electric BC

Supplemental plugin for the Go Electric BC website.

- Adds site-specific scripts, styles, block/editor enhancements and custom APIs.
- Supports Vue-powered vehicle filtering and related frontend experiences.
- Includes logic to regenerate vehicle-filter data in a JSON file for related CHEFS form ingestion when relevant content changes.
- Depends on `cleanbcdx-bcgov-main`.
- Build required when frontend, block-editor, or Vue assets change.

---

### `cleanbcdx-misc` – PHP-only plugin
#### Deployed on all CleanBC DX managed sites

PHP-only support plugin for operational and administrative helpers.

- Includes plugin update-check behavior.
- Adds Safe Redirect Manager hit counting and admin reporting helpers.
- Contains miscellaneous integration code used for GitHub Actions, OpenShift, and SSO-related operational tasks.
- No build step is required.

---

### `cleanbcdx-security` – PHP-only plugin
#### Deployed on all CleanBC DX managed sites

PHP-only plugin for lightweight WordPress hardening.

- Blocks form-based login for users whose usernames contain `@`.
- Disables the standard WordPress REST API user-listing endpoints.
- Intended to reduce exposure for SSO-managed environments.
- No build step is required.
