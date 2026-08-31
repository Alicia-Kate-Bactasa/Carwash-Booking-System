/**
 * Vue 3 entrypoint module for Montage Auto Studio.
 * Initializes the root app, registers global plugins (@vueuse/motion, Vue Router), and mounts to the DOM.
 */

import { createApp } from 'vue';
import { MotionPlugin } from '@vueuse/motion';
import App from './App.vue';
import router from './router';
import './style.css';

// Create and configure the Vue 3 application instance
const app = createApp(App);

app.use(MotionPlugin);
app.use(router);

// Mount application to DOM element (#app)
app.mount('#app');


