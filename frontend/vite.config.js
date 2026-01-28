import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 5173,
        host: true,
        allowedHosts: ['localhost', '.ngrok-free.app', '.ngrok.io'],
    },
    build: {
        target: 'es2020',
        outDir: 'dist',
        sourcemap: true,
    },
});
