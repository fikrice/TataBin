# TataBin Frontend

Frontend TataBin WMS adalah SPA berbasis Vue 3, Vite, Tailwind CSS, DaisyUI, Pinia, Vue Router, dan Axios.

## Development

```bash
npm install
npm run dev
```

Server development berjalan di `http://localhost:5173`.

## Backend API

Axios client berada di `src/services/api.js` dan mengarah ke:

```txt
http://localhost:3000/api
```

Token JWT disimpan di `localStorage` dan dikirim otomatis melalui header `Authorization: Bearer <token>`.
