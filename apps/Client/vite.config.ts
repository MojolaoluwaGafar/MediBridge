import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // The framework every page needs, in its own file. It changes far
            // less often than our code, so returning visitors keep it cached
            // across deploys. Only list libraries the first page needs anyway:
            // a catch-all /node_modules/ group would pull lazily loaded ones
            // (e.g. the phone-number validator) back into the first download.
            {
              name: 'framework',
              test: /node_modules[\\/](react|react-dom|scheduler|react-router|axios|react-toastify)[\\/]/,
            },
          ],
        },
      },
    },
  },
})
