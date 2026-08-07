# 📘 Panduan Lengkap Deployment: cPanel & VPS Ubuntu

Dokumen ini berisi panduan langkah-demi-langkah untuk menyebarkan (deploy) aplikasi **Audio Converter** ke **cPanel Hosting** (Frontend) dan **VPS Ubuntu** (Backend API & Audio Processing).

---

## 🗺️ Gambaran Arsitektur
*   **Frontend (cPanel):** `https://pakhuang.store`
    *   Berisi file statis HTML, CSS, JS, dan i18n JSON.
    *   Sangat ringan, meminimalkan penggunaan RAM/CPU cPanel sehingga terhindar dari limit LVE cPanel.
*   **Backend (VPS Ubuntu):** `https://api.pakhuang.store`
    *   Berisi server Node.js Express yang menjalankan konversi audio (`ffmpeg` & `yt-dlp`).
    *   Menggunakan semua daya CPU VPS untuk konversi tanpa terganggu limit hosting.

---

## 🛠️ Langkah 1: Pengaturan DNS di Rumahweb (Clientzone)

Sesuai dengan pengaturan domain Anda di Rumahweb, Anda harus membagi lalu lintas domain utama ke cPanel dan subdomain API ke VPS.

Arahkan DNS Record Anda seperti berikut:
1.  **A Record Domain Utama:**
    *   **Nama:** `pakhuang.store` (atau kosong / `@`)
    *   **Tipe:** `A`
    *   **Destinasi / IP:** **[Masukkan IP Address cPanel Anda]**
        *(Dapat dilihat di cPanel sebelah kanan bagian "Shared IP Address" atau "Site IP")*
2.  **A Record WWW:**
    *   **Nama:** `www` (atau `www.pakhuang.store`)
    *   **Tipe:** `A`
    *   **Destinasi / IP:** **[Masukkan IP Address cPanel Anda]**
3.  **A Record API (Subdomain VPS):**
    *   **Nama:** `api` (atau `api.pakhuang.store`)
    *   **Tipe:** `A`
    *   **Destinasi / IP:** `202.10.44.254` (IP VPS Anda)

*Catatan: Setelah mengubah DNS, biasanya diperlukan waktu propagasi sekitar 10 menit hingga beberapa jam.*

---

## 📂 Langkah 2: Upload Frontend ke cPanel Hosting

Karena frontend sekarang menggunakan **Vite + React JS**, Anda harus meng-compile file sumber menjadi file statis terlebih dahulu sebelum di-upload:

1.  Buka Command Prompt atau PowerShell di komputer Anda, lalu masuk ke direktori frontend React:
    ```cmd
    cd c:\Users\aguzu\audio-converter\frontend-react
    ```
2.  Jalankan perintah build untuk meng-compile file React:
    ```cmd
    npm.cmd run build
    ```
    *(Perintah ini akan menghasilkan folder `dist/` di dalam direktori `frontend-react/`)*
3.  Buka **cPanel File Manager** Anda.
4.  Masuk ke direktori **`public_html`**.
5.  **Penting**: Jika ada sisa-sisa file HTML, CSS, JS, atau folder `client` lama di dalam `public_html`, silakan hapus atau pindahkan terlebih dahulu agar tidak terjadi konflik aset.
6.  Upload **seluruh isi folder `dist/`** dari komputer lokal Anda ke direktori `public_html` cPanel tersebut.
    *   *Pastikan file-file di dalam folder `dist/` berada langsung di dalam `public_html`, bukan di dalam subfolder `dist/` lagi.*
    *   **Struktur di cPanel `public_html` seharusnya:**
        ```text
        public_html/
        ├── assets/
        │   ├── index-[hash].css
        │   └── index-[hash].js
        ├── favicon.svg
        ├── icons.svg
        └── index.html
        ```

---

## 🖥️ Langkah 3: Setup Backend pada VPS Ubuntu

### 1. Hubungkan ke VPS via SSH
Buka terminal (Command Prompt or PowerShell) di komputer Anda, lalu masuk ke VPS menggunakan perintah berikut:
```bash
ssh root@202.10.44.254
```
*(Masukkan password root VPS Anda saat diminta)*

### 2. Update System & Install Dependencies
Jalankan perintah berikut untuk mengupdate system dan menginstall tools yang diperlukan:
```bash
apt update && apt upgrade -y
apt install -y curl git build-essential ffmpeg nginx certbot python3-certbot-nginx
```

### 3. Install Node.js (Versi 20 LTS)
Jalankan perintah ini untuk menginstall Node.js versi terbaru yang stabil:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```
*Verifikasi instalasi dengan mengetik `node -v` dan `npm -v`.*

### 4. Upload & Persiapkan Project di VPS
Anda bisa mengupload folder project Anda (kecuali folder `node_modules` dan `client`) ke VPS menggunakan SCP/SFTP (seperti FileZilla), atau menyalinnya langsung. Letakkan project di direktori `/var/www/audio-converter`:

```bash
# Buat direktori project di VPS
mkdir -p /var/www/audio-converter
```
Upload semua file backend berikut ke `/var/www/audio-converter`:
*   `server/` (seluruh folder)
*   `package.json`
*   `package-lock.json`

Setelah file backend terupload ke VPS, masuk ke folder tersebut dan install dependencies:
```bash
cd /var/www/audio-converter
npm install --production
```

---

## ⚙️ Langkah 4: Konfigurasi Environment (`.env`) di VPS

Buat file `.env` di direktori root project VPS `/var/www/audio-converter/.env` dan isi seperti berikut:

```env
PORT=3000
NODE_ENV=production

# Konfigurasi Direktori Penyimpanan
UPLOADS_DIR=/var/www/audio-converter/server/uploads
OUTPUTS_DIR=/var/www/audio-converter/server/outputs
TEMP_DIR=/var/www/audio-converter/server/temp

# Konfigurasi TTL File Sementara
CLEANUP_INTERVAL_MINUTES=10
TEMP_TTL_MINUTES=10

# Executable Path FFmpeg
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe

# Rahasia Sesi (Ganti dengan string acak panjang untuk keamanan)
SESSION_SECRET=kunci_rahasia_sesi_anda_yang_aman_dan_panjang_12345

# URL Frontend (cPanel) tanpa slash di akhir
FRONTEND_URL=https://pakhuang.store

# Discord OAuth & API Settings (Isi dari Discord Developer Portal)
DISCORD_CLIENT_ID=1389687197447225495
DISCORD_CLIENT_SECRET=isi_client_secret_discord_anda_di_sini
DISCORD_CALLBACK_URL=https://api.pakhuang.store/auth/discord/callback

# Opsi Cek Membership Server Discord
DISCORD_GUILD_ID=1192735749372252190
DISCORD_INVITE_URL=https://discord.gg/invitation_link_anda
DISCORD_BOT_TOKEN=isi_token_bot_discord_anda_di_sini

# Admin Discord (ID Akun Discord Anda)
ADMIN_DISCORD_ID=1389687197447225495
```

---

## 🔒 Langkah 5: Setup Nginx Reverse Proxy & SSL (HTTPS) di VPS

Agar backend VPS dapat diakses dengan aman via `https://api.pakhuang.store`, kita menggunakan Nginx sebagai reverse proxy ke port internal `3000` dan mengamankannya dengan SSL Let's Encrypt.

### 1. Buat Konfigurasi Blok Server Nginx
Buat file konfigurasi baru untuk subdomain API:
```bash
nano /etc/nginx/sites-available/api.pakhuang.store
```

Salin dan tempel konfigurasi berikut:
```nginx
server {
    listen 80;
    server_name api.pakhuang.store;

    # Body size limit untuk mendukung upload file audio besar
    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Dukungan cookie session CORS
        proxy_cookie_path / "/; HTTPOnly; Secure; SameSite=None";
    }
}
```
*Simpan dan keluar dari editor (`Ctrl+O` lalu `Enter`, kemudian `Ctrl+X`).*

### 2. Aktifkan Konfigurasi & Restart Nginx
```bash
ln -s /etc/nginx/sites-available/api.pakhuang.store /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 3. Install SSL Certificate Gratis (Let's Encrypt)
Jalankan perintah Certbot untuk mengkonfigurasi SSL secara otomatis di Nginx:
```bash
certbot --nginx -d api.pakhuang.store
```
*Ikuti petunjuk di layar (masukkan email, setujui ketentuan, dan pilih opsi redirect HTTP ke HTTPS).*

---

## 🚀 Langkah 6: Jalankan Node.js Backend menggunakan PM2 di VPS

PM2 akan menjaga aplikasi backend Anda tetap berjalan 24/7 di latar belakang dan melakukan restart otomatis jika terjadi error atau server reboot.

### 1. Install PM2 Secara Global
```bash
npm install -g pm2
```

### 2. Jalankan Backend Server
Masuk ke direktori backend di VPS Anda dan jalankan perintah PM2:
```bash
cd /var/www/audio-converter
pm2 start server/app.js --name "audio-converter-api"
```

### 3. Setup PM2 Startup Script
Agar aplikasi otomatis berjalan saat VPS reboot:
```bash
pm2 startup
```
*PM2 akan menghasilkan sebuah perintah konfigurasi systemd di terminal. Copy dan paste perintah tersebut ke terminal Anda dan jalankan.*

Setelah itu, simpan status aplikasi PM2 saat ini:
```bash
pm2 save
```

### 4. Perintah Berguna PM2:
*   Melihat logs real-time: `pm2 logs`
*   Melihat status aplikasi: `pm2 status`
*   Merestart backend: `pm2 restart audio-converter-api`

---

## 🎉 Selesai!
Aplikasi Anda sekarang siap digunakan. Pengguna dapat mengunjungi `https://pakhuang.store` (cPanel) untuk login dengan Discord, mengonversi audio dengan cepat, dan semua proses berat akan ditangani dengan aman oleh VPS Anda di `https://api.pakhuang.store`.
