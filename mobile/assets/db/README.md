# Bundled database

`namelessnote.sqlite` in this folder is compiled directly into the APK as a
Flutter asset (see `pubspec.yaml`). The file currently here is a real
export (regenerate it if it's stale — see below) — SQLCipher-encrypted, so
it's unreadable without the passphrase even if extracted from the APK.

## Generating a real export

Easiest: from the repo root, `npm run mobile:apk` (or `npm run mobile:dump`
to only refresh this file without building) — it reads both `MONGO_URI`
and `MOBILE_DB_ENCRYPTION_KEY` from `backend/.env` for you. See
[../../README.md](../../README.md).

Manually, from `backend/`, with `MONGO_URI` (or `MONGO_URI_DUMP`),
`DATA_ENCRYPTION_KEY` and `MOBILE_DB_ENCRYPTION_KEY` set in `.env`:

```bash
npm run db_dump_sqlite -- ../mobile/assets/db/namelessnote.sqlite
```

This decrypts every property's value server-side (the mobile app has no
access to `DATA_ENCRYPTION_KEY` and never will), writes plain groups/
properties tables, then re-encrypts the whole file with SQLCipher using
`MOBILE_DB_ENCRYPTION_KEY`. If you build manually too (not via
`npm run mobile:apk`), pass the same key to Flutter:

```bash
cd ../mobile
flutter build apk --release --dart-define=VAULT_PASSPHRASE=<MOBILE_DB_ENCRYPTION_KEY value>
```

**This file contains decrypted note values, inside SQLCipher encryption.**
It's ignored by git (see the root `.gitignore`) — never force-add or commit
a populated `namelessnote.sqlite`. The SQLCipher layer means a copy that
leaks (lost phone, cloud backup, careless share) isn't openable in a
generic SQLite viewer, but it's still real data — keep it local and delete
copies you don't need.
