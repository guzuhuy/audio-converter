# Audio Converter

A complete Node.js + Express audio conversion system for:
- YouTube / SoundCloud URL audio download
- MP3 upload
- Speed change
- Amplify / volume adjustment
- Maximum duration trimming
- Conversion to OGG Vorbis

## Struktur Project

```
audio-converter/
│
├── server/
│   ├── app.js
│   ├── routes/
│   │   └── convert.js
│   ├── services/
│   │   ├── cleanup.js
│   │   ├── ffmpeg.js
│   │   └── youtube.js
│   ├── uploads/
│   ├── outputs/
│   └── temp/
│
├── client/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
│
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Fitur

- Frontend UI dengan URL input atau MP3 drag/drop
- Preset speed + amplify + max duration
- Backend processing via `ffmpeg`
- Optional split output ke beberapa OGG part jika durasi lebih panjang dari batas
- Zip otomatis saat split menghasilkan banyak file
- Download OGG atau ZIP hasil konversi
- Auto-create temporary directories
- Periodic cleanup file lama

## Install

```bash
npm install
```

## Jalankan

```bash
npm start
```

Buka `http://localhost:3000`

## Requirements

- Node.js
- `ffmpeg` dan `ffprobe` di PATH, atau set `FFMPEG_PATH` ke executable ffmpeg
- `yt-dlp` di PATH atau `yt-dlp-exec` tersedia
- `ADMIN_DISCORD_ID` untuk membuat admin hanya bisa login lewat Discord

> Jika mendapat error `ffprobe and ffmpeg not found`, install ffmpeg secara global atau atur `FFMPEG_PATH` di `.env`.

## Environment

Tambahkan baris berikut ke file `.env` jika ingin menggunakan admin Discord-only:

```env
ADMIN_DISCORD_ID=1389687197447225495
```

## Discord Bot & Membership Check

This project supports Discord OAuth login and can optionally require that users are members
of a specific Discord server (guild) before they can access the converter UI.

Configuration (add to your `.env`):

```env
# OAuth app credentials (Discord Developer Portal)
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback

# Optional: require users to be a member of this guild
DISCORD_GUILD_ID=your_guild_id
DISCORD_INVITE_URL=https://discord.gg/your-invite-here

# Optional fallback: Bot token to query guild/member endpoint
DISCORD_BOT_TOKEN=your_bot_token
```

Behavior:
- The app requests the `guilds` OAuth scope so `req.user.guilds` will list the guilds the user belongs to.
- If `DISCORD_GUILD_ID` is set the server will first check `req.user.guilds` for membership. If not present
  it will (optionally) call the Guild Member REST endpoint with `DISCORD_BOT_TOKEN` as a fallback.
- If the user is not a member, they are redirected to `/join-discord` which contains an invite link and a
  `Saya Sudah Gabung` verification button.

Security notes:
- Keep `DISCORD_BOT_TOKEN` secret. Store it in `.env` and do not commit it to source control.
- If you prefer not to request `guilds` scope, you can rely solely on the bot-check fallback (requires the bot
  to be invited into the guild with appropriate permissions).
```

Setelah menambahkan, restart server agar konfigurasi baru dibaca.

## API Endpoints

### Upload MP3

`POST /api/upload`

FormData:
- `file` (MP3)
- `speed`
- `amplify`
- `maxDuration`

### YouTube / SoundCloud

`POST /api/youtube`

Body JSON:
- `url`
- `speed`
- `amplify`
- `maxDuration`

Response contoh:

```json
{
  "success": true,
  "download": "/download/1690000000000.ogg"
}
```

## Notes

- Hasil OGG tersedia di `/download/<nama-file>.ogg`
- Durasi output dipotong setelah kecepatan diterapkan
- `ffmpeg` akan menggunakan beberapa `atempo` filter untuk nilai speed > 2.0

## Opsional

Untuk antrian dan worker, ada folder `server/queue` dan `server/worker` sebagai contoh integrasi BullMQ.
