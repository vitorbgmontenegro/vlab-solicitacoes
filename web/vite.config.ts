/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  test: {
    // Os componentes precisam de DOM para renderizar; jsdom simula um.
    environment: 'jsdom',

    // Deixa `describe`, `it` e `expect` disponiveis sem importar em cada
    // arquivo, como no Jest.
    globals: true,

    // Roda antes de cada arquivo de teste.
    setupFiles: ['./src/test/setup.ts'],
  },
})
