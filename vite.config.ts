import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Recharts (dashboard) já é carregado sob demanda; o restante do vendor
    // (React, Supabase, Framer) fica num único chunk aceitável para um app local.
    chunkSizeWarningLimit: 1000,
  },
})
