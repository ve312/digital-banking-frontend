import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const serveIndexHtml = () => '/index.html';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://54.226.164.38:8080',
        changeOrigin: true,
      },
      '/clientes': {
        target: 'http://54.226.164.38:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return serveIndexHtml();
        },
      },
      '/cuentas': {
        target: 'http://54.226.164.38:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return serveIndexHtml();
        },
      },
      '/transacciones': {
        target: 'http://54.226.164.38:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return serveIndexHtml();
        },
      },
      '/usuarios': {
        target: 'http://54.226.164.38:8080',
        changeOrigin: true,
        bypass: (req) => {
          if (req.headers.accept?.includes('text/html')) return serveIndexHtml();
        },
      },
    },
  },
})
