@echo off
echo =======================================================
echo       V STUDIO - DEPLOY BACKEND KE VPS (202.10.44.254)
echo =======================================================
echo.
echo Script ini akan mengupload 5 file yang diperbarui/baru ke VPS Anda.
echo Anda akan diminta memasukkan password root VPS Anda untuk setiap file.
echo.
pause
echo.
echo [1/4] Mengunggah package.json...
scp package.json root@202.10.44.254:/var/www/audio-converter/package.json

echo.
echo [2/4] Mengunggah server/services/roblox.js...
scp server/services/roblox.js root@202.10.44.254:/var/www/audio-converter/server/services/roblox.js

echo.
echo [3/5] Mengunggah server/services/userStats.js...
scp server/services/userStats.js root@202.10.44.254:/var/www/audio-converter/server/services/userStats.js

echo.
echo [4/5] Mengunggah server/routes/convert.js...
scp server/routes/convert.js root@202.10.44.254:/var/www/audio-converter/server/routes/convert.js

echo.
echo [5/5] Mengunggah server/app.js...
scp server/app.js root@202.10.44.254:/var/www/audio-converter/server/app.js

echo.
echo =======================================================
echo             PENGIRIMAN FILE SELESAI!
echo =======================================================
echo Langkah selanjutnya:
echo 1. Hubungkan ke VPS via SSH:
echo    ssh root@202.10.44.254
echo.
echo 2. Masuk ke folder & install library baru + restart PM2:
echo    cd /var/www/audio-converter && npm install && pm2 restart all
echo =======================================================
pause
