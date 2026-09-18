/// SQLCipher passphrase used to open the bundled, backend-generated
/// database (see `backend/src/scripts/db_dump_sqlite.ts`).
///
/// This MUST match `MOBILE_DB_ENCRYPTION_KEY` in the backend's `.env` at the
/// time the .sqlite export was produced — whoever generates the export and
/// whoever builds the app need to agree on the same value.
///
/// Passed in at build time with `--dart-define=VAULT_PASSPHRASE=...` so the
/// real key never has to be committed to source control (unlike the
/// database file itself, this .dart file IS tracked by git). See
/// mobile/README.md for the exact build command. The fallback below is only
/// used by `flutter analyze`/`flutter test` and by an accidental build that
/// forgot the flag — it intentionally will not open a real export.
const String vaultPassphrase = String.fromEnvironment(
  'VAULT_PASSPHRASE',
  defaultValue: 'CHANGE_ME_SAME_AS_BACKEND_MOBILE_DB_ENCRYPTION_KEY',
);

/// IMPORTANT — realistic threat model, read before relying on this:
///
/// This gives you "a file extracted from the APK is useless without the
/// app" protection, not "unbreakable" protection. A release build compiles
/// Dart to native machine code (AOT), so this constant isn't a plain
/// grep-able string the way it would be in a debug build; building with
/// `flutter build apk --obfuscate --split-debug-info=<dir>` (see
/// mobile/README.md) strips symbol names too, raising the bar further. But
/// anyone willing to fully reverse-engineer the compiled binary can still
/// recover it — there is no way around that for an app that must decrypt
/// data completely offline, with no server to gatekeep the key.
///
/// This stops "open the extracted .sqlite file in any SQLite viewer",
/// which is the realistic risk for a lost phone, a cloud backup, or a
/// carelessly shared file. It does not replace the backend's real
/// encryption-at-rest — the properties are encrypted at rest in MongoDB
/// with a key that never leaves the server, and the device never has that
/// key.
