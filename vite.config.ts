import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    // Добавляем оптимизации для продакшена
    build: {
      outDir: 'dist',
      sourcemap: false, // отключаем sourcemaps для уменьшения размера
      chunkSizeWarningLimit: 1500, // увеличиваем лимит предупреждений
      rollupOptions: {
        output: {
          // Разделяем код на чанки для оптимизации загрузки
          manualChunks: {
            vendor: ['react', 'react-dom'],
            three: ['three', '@react-three/fiber'],
            // добавьте другие тяжелые библиотеки
          }
        }
      }
    },
    // Настройки для превью
    preview: {
      port: 3000,
      host: true
    }
  }
})