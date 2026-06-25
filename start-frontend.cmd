@echo off
set NODE_ENV=development
set PORT=3000
set BASE_PATH=/
cd /d "D:\El-Nujoom Feeds Co"
start "Frontend" /MIN "C:\Users\usfmg\AppData\Roaming\npm\pnpm.cmd" --filter @workspace/feedflow-erp run dev
