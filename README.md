# NamelessNote

NamelessNote is a Docker-friendly notes application for storing group-based properties with Google Sign-In, per-user data isolation, and backend-only encryption for sensitive values.

<img width="1181" height="768" alt="imagen" src="https://github.com/user-attachments/assets/3c577127-e2ab-42b8-98ac-ef389a6b4fd2" />


## What The App Does

- Authenticates users with Google OAuth in the frontend
- Creates an app JWT in the backend after validating the Google `id_token`
- Stores groups and properties per authenticated account
- Filters all data by:
  - `ownerId`
  - `ownerEmail`
  - `authProvider`
- Encrypts property HTML values in the backend with `AES-256-GCM`
- Decrypts only in the backend when returning data to the authorized user
- Supports Excel export and restore workflows for database portability

## Tech Stack

- Frontend: React + Vite + MUI
- Backend: Express + TypeScript + Mongoose
- Database: MongoDB 8
- Auth: Google OAuth + backend JWT
- Encryption: AES-256-GCM
- Local orchestration: Docker Compose

## Repository Structure

- [backend](./backend): Express API, auth, encryption, Mongo access, dump/restore scripts
- [frontend](./frontend): React SPA with Google Sign-In
- [docs](./docs): implementation notes and operational docs
- [certs](./certs): local development certificates
- [docker-compose.yml](./docker-compose.yml): main stack
- [docker-compose.dev.yml](./docker-compose.dev.yml): development override

## Environment Files

Create these before starting the app:

- [backend/.env.example](./backend/.env.example)
- [frontend/.env.example](./frontend/.env.example)

### Backend Variables

Required backend values:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,https://localhost:3000
MONGO_URI=mongodb://nameless_note_db:27017/namelessnote
GOOGLE_CLIENT_ID=PUT_YOUR_GOOGLE_CLIENT_ID
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=8h
DATA_ENCRYPTION_KEY=base64_or_hex_32_byte_key
DATA_ENCRYPTION_ALGORITHM=aes-256-gcm
DEBUG=false
HTTPS_ENABLED=false
HTTPS_CERT_FILE=../certs/namelessnote-local.pem
HTTPS_KEY_FILE=../certs/namelessnote-local-key.pem
```

### Frontend Variables

Required frontend values:

```env
VITE_APP_LANGUAGE=es
VITE_API_BASE_URL=https://localhost:4000
VITE_GOOGLE_CLIENT_ID=PUT_YOUR_GOOGLE_CLIENT_ID
DEV_HTTPS=false
DEV_HTTPS_CERT_FILE=../certs/namelessnote-local.pem
DEV_HTTPS_KEY_FILE=../certs/namelessnote-local-key.pem
```

## Google Sign-In Notes

Google OAuth must allow the exact frontend origin.

Examples:

- `http://localhost:3000`
- `https://localhost:3000`

If the protocol, host, or port do not match exactly, Google can reject the login with `origin_mismatch`.

## Local HTTPS

The project supports local HTTPS in both frontend and backend.

Certificates should live in:

- [certs](./certs)

Example backend settings:

```env
HTTPS_ENABLED=true
HTTPS_CERT_FILE=../certs/namelessnote-local.pem
HTTPS_KEY_FILE=../certs/namelessnote-local-key.pem
```

Example frontend settings:

```env
VITE_API_BASE_URL=https://localhost:4000
DEV_HTTPS=true
DEV_HTTPS_CERT_FILE=../certs/namelessnote-local.pem
DEV_HTTPS_KEY_FILE=../certs/namelessnote-local-key.pem
```

## Run With Docker

Start the full stack:

```powershell
docker compose up -d
```

Check status:

```powershell
docker compose ps
```

Tail logs:

```powershell
docker compose logs -f
```

The stack includes:

- MongoDB 8 on host port `27018`
- Backend API on host port `4000`
- Frontend app on host port `3000`

## Run Backend Locally

```powershell
cd backend
copy .env.example .env
npm install
npm run dev
```

API endpoints:

- `https://localhost:4000/health`
- `https://localhost:4000/docs`

## Run Frontend Locally

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Frontend URL:

- `https://localhost:3000`

## Data Security Model

Groups and properties are scoped per authenticated account.

Stored ownership metadata:

- `ownerId`
- `ownerEmail`
- `authProvider`

Property values are not stored in plaintext in MongoDB.

They are stored as encrypted fields:

```json
{
  "propertyValueEncrypted": "base64-ciphertext",
  "iv": "base64-iv",
  "authTag": "base64-auth-tag"
}
```

The frontend sends `valueHtml` in clear text over HTTPS, and the backend:

1. encrypts it before saving
2. decrypts it before returning it to the authorized user

## Database Dump And Restore

Backend scripts support Excel export and restore.

From [backend](./backend):

Export:

```powershell
$env:MONGO_URI="mongodb://localhost:27018/namelessnote"
npm run db_dump_data
```

Export to a custom file:

```powershell
$env:MONGO_URI="mongodb://localhost:27018/namelessnote"
npm run db_dump_data -- ./exports/my-backup.xlsx
```

Restore:

```powershell
$env:MONGO_URI="mongodb://localhost:27018/namelessnote"
npm run db_restore -- ./exports/my-backup.xlsx
```

Important:

- exported Excel files contain decrypted `valueHtml`
- treat those files as sensitive backups
- restore re-encrypts property values before saving to MongoDB

## Build Checks

Backend:

```powershell
cd backend
npm run build
```

Frontend:

```powershell
cd frontend
npm run build
```

## Operational Notes

- Do not use `docker compose down -v` unless you intentionally want to delete MongoDB data
- If running dump/restore from the host, use `mongodb://localhost:27018/namelessnote`
- If running dump/restore inside Docker, `nameless_note_db:27017` works
- MongoDB was updated to version 8 for fresh environments

## Additional Documentation

See:

- [google-login-workaround.md](./docs/google-login-workaround.md)
