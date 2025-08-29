import axios from 'axios';
import Echo from 'laravel-echo';
 
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<any>;
    axios: any; // Or more specific type for axios if you have it
  }
}

window.Pusher = Pusher;
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.Echo = new Echo({
    broadcaster: 'pusher',
    key: "8804906b3ffb07747ef5",
    cluster:"ap1",
    // wsHost: import.meta.env.VITE_REVERB_HOST,
    // wsPort: import.meta.env.VITE_REVERB_PORT,
    // wssPort: import.meta.env.VITE_REVERB_PORT,
   // forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    // enabledTransports: ['ws', 'wss'],
    forceTLS:true
});