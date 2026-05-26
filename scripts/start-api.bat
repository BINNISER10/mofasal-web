@echo off
cd /d "C:\Users\Administrator\AppData\Local\Temp\mufasal-api-tmp"
set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mufasal
start "MUFASAL-API" /B node dist\index.js
echo API started on port 4001
