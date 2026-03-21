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

## Stack

- Express
- TypeScript
- Mongoose
- MongoDB 8
- `google-auth-library`
- `jsonwebtoken`
- `xlsx`

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

## Database Dump And Restore

The backend includes two Excel-based scripts:

- `npm run db_dump_data`
- `npm run db_restore`

### Dump

From the host:

```powershell
$env:MONGO_URI="mongodb://localhost:27018/namelessnote"
npm run db_dump_data
```

This exports:

- groups
- properties

into an `.xlsx` file with decrypted `valueHtml`.

### Restore

From the host:

```powershell
$env:MONGO_URI="mongodb://localhost:27018/namelessnote"
npm run db_restore -- ./exports/my-backup.xlsx
```

Restore preserves:

- `groupId`
- `propertyId`
- `ownerId`
- `ownerEmail`
- `authProvider`

and re-encrypts `valueHtml` before storing it.

## Important Notes

- if you run scripts from the host, `nameless_note_db` will not resolve; use `mongodb://localhost:27018/namelessnote`
- if you run scripts inside the Docker network, `mongodb://nameless_note_db:27017/namelessnote` works
- exported Excel files contain decrypted property values, so they must be treated as sensitive backups
- the backend currently uses practical TypeScript workarounds for `jsonwebtoken` and `req.user` in development mode

## Related Documentation

- [README.md](/z:/dev/node/NamelessNote/README.md)
- [google-login-workaround.md](/z:/dev/node/NamelessNote/docs/google-login-workaround.md)
