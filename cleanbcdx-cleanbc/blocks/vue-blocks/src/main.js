import './assets/shared.css';
import { createApp } from 'vue';
import PostFilterApp from './postFilterApp.vue';

/**
 * Initialize a Vue.js application for a specific component and element.
 *
 * @param {object} component - The Vue component to be initialized.
 * @param {string} selector - The CSS selector of the element to mount the app.
 * @param {object} [props={}] - Optional props to pass to the Vue app.
 */
function initVueApp(component, selector, props = {}) {
    const element = document.querySelector(selector);
    if (element) {
        const app = createApp(component, props);
        app.mount(element);
    }
}

/**
 * Main initialization function to set up all Vue apps.
 */
function initializeApps() {
    // List of all apps with their selectors and optional props
    const apps = [
        { component: PostFilterApp, selector: '#postFilterApp', props: { appProp: 'Post Filter Data' } },
    ];

    // Dynamically initialize only apps with existing DOM elements
    apps.forEach(({ component, selector, props }) => {
        const element = document.querySelector(selector);
        if (element) {
            initVueApp(component, selector, props);
        }
    });
}

/**
 * Add a safe event listener to ensure compatibility with the target.
 */
function addSafeEventListener(el, event, handler, options) {
    if (el && typeof el.addEventListener === 'function') {
        el.addEventListener(event, handler, options);
    } else {
        console.warn(
            'Invalid EventTarget or unsupported method: addEventListener'
        );
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'complete') {
    initializeApps();
} else {
    addSafeEventListener(document, 'DOMContentLoaded', initializeApps);
}
