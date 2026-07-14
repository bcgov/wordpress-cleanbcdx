import './assets/shared.css';
import { createApp } from 'vue';
import VehicleFilterApp from './vehicleFilterApp.vue';
import EligibleCommercialVehiclesApp from './eligibleCommercialVehiclesApp.vue';

/**
 * Initialize a Vue.js application for a specific component and selector.
 *
 * @param {object} component Vue component.
 * @param {string} selector CSS selector for mount points.
 * @param {Function} getProps Returns props for each matching element.
 */
function initVueApp(component, selector, getProps = () => ({})) {
    const elements = document.querySelectorAll(selector);

    elements.forEach((element, index) => {
        if (element.dataset.vueMounted === 'true') {
            return;
        }

        const app = createApp(component, getProps(element, index));
        app.mount(element);
        element.dataset.vueMounted = 'true';
    });
}

/**
 * Main initialization function to set up all Vue apps.
 */
function initializeApps() {
    const apps = [
        {
            component: VehicleFilterApp,
            selector: '#vehicleFilterApp',
            getProps: () => ({ appProp: 'Vehicle Data' }),
        },
        {
            component: EligibleCommercialVehiclesApp,
            selector: '[data-vue-app="eligible-commercial-vehicles"]',
            getProps: (element) => ({
                endpoint: element.dataset.endpoint || '',
                appId: element.id || 'eligible-commercial-vehicles-app',
            }),
        },
    ];

    apps.forEach(({ component, selector, getProps }) => {
        const element = document.querySelector(selector);

        if (element) {
            initVueApp(component, selector, getProps);
        }
    });
}

let initializeAppsScheduled = false;

/**
 * Schedule app initialization once per animation frame.
 */
function scheduleInitializeApps() {
    if (initializeAppsScheduled) {
        return;
    }

    initializeAppsScheduled = true;

    window.requestAnimationFrame(() => {
        initializeAppsScheduled = false;
        initializeApps();
    });
}

/**
 * Observe DOM mutations so content injected into modals can mount apps.
 */
function observeDynamicAppMounts() {
    if (!document.body || 'undefined' === typeof MutationObserver) {
        return;
    }

    const appSelector =
        '#vehicleFilterApp, [data-vue-app="eligible-commercial-vehicles"]';

    const observer = new MutationObserver((mutations) => {
        const hasRelevantAddition = mutations.some((mutation) => {
            return Array.from(mutation.addedNodes).some((node) => {
                if (!node || Node.ELEMENT_NODE !== node.nodeType) {
                    return false;
                }

                if (node.matches?.(appSelector)) {
                    return true;
                }

                return !!node.querySelector?.(appSelector);
            });
        });

        if (hasRelevantAddition) {
            scheduleInitializeApps();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

/**
 * Add a safe event listener to ensure compatibility with the target.
 *
 * @param {EventTarget} el Event target.
 * @param {string} event Event name.
 * @param {Function} handler Event handler.
 * @param {object} options Listener options.
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

if ('loading' !== document.readyState) {
    initializeApps();
    observeDynamicAppMounts();
} else {
    addSafeEventListener(document, 'DOMContentLoaded', () => {
        initializeApps();
        observeDynamicAppMounts();
    });
}
