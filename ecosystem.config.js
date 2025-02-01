// ecosystem.config.mjs
export default {
  apps: [
    {
      name: 'nextjs-app', // Nama aplikasi kamu
      script: 'pnpm start', // Gunakan pnpm untuk menjalankan perintah
      env: {
        NODE_ENV: 'production' // Pastikan ini untuk production
      },
      exec_mode: 'fork', // Mode untuk menjalankan aplikasi dalam mode cluster
      watch: false, // Tidak perlu watch file secara default
      log_date_format: 'YYYY-MM-DD HH:mm:ss', // Format waktu log
      merge_logs: true, // Gabungkan logs
      autorestart: true // Otomatis restart jika aplikasi crash
    }
  ]
}
