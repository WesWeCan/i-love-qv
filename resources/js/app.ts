// import '../css/app.css';
import "../scss/index.scss";
import './bootstrap';
import 'vue3-emoji-picker/css'

import Popper from "vue3-popper";
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createApp, DefineComponent, h } from 'vue';
import { ZiggyVue } from '../../vendor/tightenco/ziggy';

const appName = import.meta.env.VITE_APP_NAME || 'Liquid Voting';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.vue`,
            import.meta.glob<DefineComponent>('./Pages/**/*.vue'),
        ),
    setup({ el, App, props, plugin }) {

        const app = createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(ZiggyVue)
           
            app.component('Popper', Popper)
            app.mount(el);
    },
    progress: {
        color: '#4B5563',
    },
});
