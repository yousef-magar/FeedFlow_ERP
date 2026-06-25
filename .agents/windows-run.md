# تشغيل المشروع على Windows

## التعديلات اللي اتعملت

1. **`pnpm-workspace.yaml`**: اتشالت exclusions بتاعت `win32-x64` من esbuild, lightningcss, tailwindcss/oxide, rollup, @expo/ngrok-bin عشان تشتغل على Windows.

2. **`package.json`**: الـ `preinstall` script اتغير من `sh -c` (Unix) لـ `node -e` (Windows-compatible).

3. **`artifacts/api-server/package.json`**: الـ `dev` script اتغير من `export` (Unix) لـ `set` (Windows).

## أوامر التشغيل

- **API Server**: `http://localhost:5000`
  ```powershell
  $env:DATABASE_URL="postgres://postgres:123@localhost:5432/elnujoom"
  $env:PORT="5000"
  $env:NODE_ENV="development"
  pnpm --filter @workspace/api-server run dev
  ```

- **Frontend**: `http://localhost:3000`
  ```powershell
  $env:PORT="3000"
  $env:BASE_PATH="/"
  $env:NODE_ENV="development"
  pnpm --filter @workspace/feedflow-erp run dev
  ```

## قاعدة البيانات

- PostgreSQL 17, password: `123`, database: `elnujoom`
- Connection string: `postgres://postgres:123@localhost:5432/elnujoom`

## الخدمات الشغالة دلوقتي

| الخدمة | الرابط | الـ PID |
|--------|--------|---------|
| API Server | http://localhost:5000 | 2988 |
| Frontend | http://localhost:3000 | 13692 |
