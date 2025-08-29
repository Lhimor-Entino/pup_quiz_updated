import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    
// server: {
//         host: '0.0.0.0',
//         port: 5173,
//         strictPort: true,
//         cors: {
//             origin: 'http://192.168.68.129:8000', // Allow Laravel's origin
//             credentials: true,
//         },
//         watch: {
//             usePolling: true,
//         },
//     },
});
