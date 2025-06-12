import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

// Initialize Firebase before mounting the app
import { initializeFirebase } from './firebase/config';
import { useAuthStore } from './stores/auth';

// Initialize Firebase
initializeFirebase();

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);

// Initialize auth store and wait for authentication state
const authStore = useAuthStore();
authStore.initAuth().then(() => {
  app.mount('#app');
});
