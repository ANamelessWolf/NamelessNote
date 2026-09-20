# NamelessNote Backend

The backend is an Express + TypeScript API responsible for authentication, authorization, encrypted property storage, and Excel-based data export/restore.

## Responsibilities

- Validate Google `id_token` values
- Issue app-specific JWT access tokens
- Protect API routes with bearer authentication
- Scope groups and properties to the authenticated owner
- Encrypt property values with AES-256-GCM before saving
- Decrypt property values before returning them to the authorized user
- Export decrypted data to Excel
- Restore Excel data and re-encrypt it before persistence
- Export a decrypted-then-SQLCipher-re-encrypted SQLite snapshot for the mobile app

## Stack

- Express
- TypeScript
- Mongoose
- MongoDB 8
- `google-auth-library`
- `jsonwebtoken`
- `xlsx`
- `better-sqlite3-multiple-ciphers` (optional; SQLCipher-capable SQLite driver, used only by `db_dump_sqlite`, host-only)

## Auth Model

The backend receives a Google `credential` from the frontend:

```json
{
  "credential": "<google_id_token>"
}
```

It validates that token using `GOOGLE_CLIENT_ID`, extracts:

- `sub`
- `email`
- `name`
- `picture`

and then returns its own JWT.

Main files:

- [src/routes/auth.ts](/z:/dev/node/NamelessNote/backend/src/routes/auth.ts)
- [src/controllers/authController.ts](/z:/dev/node/NamelessNote/backend/src/controllers/authController.ts)
- [src/utils/auth.ts](/z:/dev/node/NamelessNote/backend/src/utils/auth.ts)

## Authorization Model

Authenticated requests use:

```http
Authorization: Bearer <app_jwt>
```

The JWT payload is validated in:

- [src/middleware/auth.ts](/z:/dev/node/NamelessNote/backend/src/middleware/auth.ts)

The authenticated user identity is then used to filter data by:

- `ownerId`
- `ownerEmail`
- `authProvider`

## Data Model

### Groups

Groups now store ownership metadata:

```json
{
  "groupName": "Personal",
  "ownerId": "google-sub",
  "ownerEmail": "user@example.com",
  "authProvider": "google"
}
```

File:

- [src/models/Group.ts](/z:/dev/node/NamelessNote/backend/src/models/Group.ts)

### Properties

Properties store ownership metadata and encrypted values:

```json
{
  "groupId": "ObjectId(...)",
  "ownerId": "google-sub",
  "ownerEmail": "user@example.com",
  "authProvider": "google",
  "propertyNameOriginal": "Api Key",
  "propertyNameLower": "api key",
  "propertyValueEncrypted": "base64-ciphertext",
  "iv": "base64-iv",
  "authTag": "base64-auth-tag"
}
```

File:

- [src/models/Property.ts](/z:/dev/node/NamelessNote/backend/src/models/Property.ts)

## Encryption

Property values are encrypted only in the backend using:

- algorithm: `aes-256-gcm`
- key source: `DATA_ENCRYPTION_KEY`

The frontend sends `valueHtml` in clear text over HTTPS.

The backend encrypts it before saving and decrypts it before returning it.

File:

- [src/utils/crypto.ts](/z:/dev/node/NamelessNote/backend/src/utils/crypto.ts)

## API Routes

Public:

- `GET /health`
- `POST /auth/google`

Protected:

- `GET /api/groups`
- `POST /api/groups`
- `DELETE /api/groups/:groupId`
- `GET /api/groups/:groupId/properties`
- `POST /api/groups/:groupId/properties`
- `DELETE /api/groups/:groupId/properties/:propertyName`

## Environment Variables

Create `backend/.env` from:

- [backend/.env.example](/z:/dev/node/NamelessNote/backend/.env.example)

Required values:

```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000,https://localhost:3000
MONGO_URI=mongodb://nameless_note_db:27017/namelessnote
# Optional: overrides MONGO_URI for db_dump_sqlite/db_dump_data when run from
# the host (outside Docker), where the compose service hostname doesn't
# resolve. Example: mongodb://localhost:27018/namelessnote
MONGO_URI_DUMP=
GOOGLE_CLIENT_ID=PUT_YOUR_GOOGLE_CLIENT_ID
JWT_SECRET=CHANGE_ME_TO_A_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=8h
DATA_ENCRYPTION_KEY=base64_or_hex_32_byte_key
DATA_ENCRYPTION_ALGORITHM=aes-256-gcm
# SQLCipher passphrase for the mobile app's bundled .sqlite export (generate
# with `openssl rand -base64 32`). Must match `vaultPassphrase`/
# VAULT_PASSPHRASE used to build mobile/.
MOBILE_DB_ENCRYPTION_KEY=
DEBUG=false
HTTPS_ENABLED=false
HTTPS_CERT_FILE=../certs/namelessnote-local.pem
HTTPS_KEY_FILE=../certs/namelessnote-local-key.pem
```

## Local Development

Install dependencies:

```powershell
cd backend
npm install
```

Run the API:

```powershell
npm run dev
```

Useful endpoints:

- `http://localhost:4000/health`
- `http://localhost:4000/docs`

If `HTTPS_ENABLED=true` and the cert files exist, the backend serves on:

- `https://localhost:4000`

## Build

```powershell
cd backend
npm run build
```

## Database Dump, Restore And Mobile Export

Three scripts, all one-off CLI commands (not HTTP endpoints):

- `npm run db_dump_data` — Excel export
- `npm run db_restore` — Excel restore
- `npm run db_dump_sqlite` — SQLCipher-encrypted SQLite export, for the mobile app

All three connect to Mongo the same way: `MONGO_URI_DUMP` if set in `.env`,
falling back to `MONGO_URI`. When run from the host (outside Docker), the
Docker Compose service hostname (`nameless_note_db`) doesn't resolve, so set
`MONGO_URI_DUMP=mongodb://localhost:27018/namelessnote` in `.env` once
instead of exporting `$env:MONGO_URI` before every command.

### Dump (Excel)

```powershell
npm run db_dump_data
npm run db_dump_data -- ./exports/my-backup.xlsx   # custom output path
```

Exports groups + properties into an `.xlsx` file with decrypted `valueHtml`.

### Restore (Excel)

```powershell
npm run db_restore -- ./exports/my-backup.xlsx
```

Restore preserves `groupId`, `propertyId`, `ownerId`, `ownerEmail`,
`authProvider`, and re-encrypts `valueHtml` (AES-256-GCM, `DATA_ENCRYPTION_KEY`)
before storing it.

### Dump for mobile (SQLCipher SQLite)

```powershell
npm run db_dump_sqlite -- ../mobile/assets/db/namelessnote.sqlite
# or, with a shortcut that already points at that path:
npm run db_dump_sqlite:mobile
```

Run it **on the host** (Node >= 22), not inside the Docker container.
`better-sqlite3-multiple-ciphers` is an *optional* dependency: it needs Node
22+ or a native build toolchain, so it is skipped when the `node:20-alpine`
dev container runs `npm install` (which keeps the API booting). If it's
missing, the script stops with a message saying so.

Requires `MOBILE_DB_ENCRYPTION_KEY` set in `.env`. Decrypts every property
with `DATA_ENCRYPTION_KEY` (same as the Excel export), writes `groups` /
`properties` tables, then re-encrypts the **entire file** with SQLCipher
(compatibility mode 4, matching `net.zetetic:sqlcipher-android` on the
Flutter side) using `MOBILE_DB_ENCRYPTION_KEY`. See
[db_dump_sqlite.ts](./src/scripts/db_dump_sqlite.ts) and
[../mobile/README.md](../mobile/README.md). Prefer `npm run mobile:apk`
from the repo root, which runs this and the Flutter build together and
keeps the SQLCipher key in sync automatically.

## Important Notes

- if you run scripts from the host, `nameless_note_db` will not resolve; set `MONGO_URI_DUMP=mongodb://localhost:27018/namelessnote` in `.env`
- if you run scripts inside the Docker network, `mongodb://nameless_note_db:27017/namelessnote` works
- exported `.xlsx` and `.sqlite` files both contain decrypted property values, so they must be treated as sensitive backups (both are gitignored — never force-add a populated one)
- the backend currently uses practical TypeScript workarounds for `jsonwebtoken` and `req.user` in development mode

## Related Documentation

- [README.md](/z:/dev/node/NamelessNote/README.md)
- [docs/architecture.md](/z:/dev/node/NamelessNote/docs/architecture.md)
- [mobile/README.md](/z:/dev/node/NamelessNote/mobile/README.md)
- [google-login-workaround.md](/z:/dev/node/NamelessNote/docs/google-login-workaround.md)
