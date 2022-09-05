import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import { Button, message, Switch } from 'ant-design-vue/es';
import 'ant-design-vue/dist/antd.css';

const app = createApp(App);

/* 会自动注册 Button 下的子组件, 例如 Button.Group */
app.use(Button);
app.use(Switch);

app.mount('#app');

app.config.globalProperties.$message = message;
