import { createApp } from 'vue';
import App from './app.vue';
import router from './router/index.js';
import 'element-plus/theme-chalk/dark/css-vars.css'; // 引入暗黑模式变量
import './index.css';

const app = createApp(App);
app.use(router);
app.mount('#app');