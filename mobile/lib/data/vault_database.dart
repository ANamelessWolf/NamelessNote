import 'dart:io';
import 'dart:typed_data';

import 'package:crypto/crypto.dart' show sha256;
import 'package:flutter/services.dart' show rootBundle;
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite_sqlcipher/sqflite.dart';

import '../models/vault_group.dart';
import '../models/vault_property.dart';
import 'vault_passphrase.dart';

/// Path (relative to the Flutter asset bundle) of the SQLite file generated
/// by the backend's `npm run db_dump_sqlite` command. Copy the generated
/// file here (mobile/assets/db/namelessnote.sqlite) before building the APK.
const _assetDbPath = 'assets/db/namelessnote.sqlite';
const _dbFileName = 'namelessnote_vault.sqlite';

/// Copies the bundled export to [dbPath] only when it is not already there.
///
/// sqflite cannot open a file straight from the read-only asset bundle, so the
/// asset has to be copied to writable storage. That copy survives app updates
/// and can even come back after an uninstall (Android Auto Backup), so
/// "copy if missing" would keep serving an old export forever. Instead the
/// SHA-256 of the copied asset is stored next to the database and the file is
/// rewritten only when the bundled asset differs, i.e. once per new export.
///
/// Returns true if the database file was (re)written.
Future<bool> syncBundledDatabase({
  required Uint8List assetBytes,
  required String dbPath,
}) async {
  final dbFile = File(dbPath);
  final markerFile = File('$dbPath.sha256');
  final digest = sha256.convert(assetBytes).toString();

  if (dbFile.existsSync() &&
      markerFile.existsSync() &&
      (await markerFile.readAsString()).trim() == digest) {
    return false;
  }

  // Write to a temp file and rename, so being killed mid-copy can't leave a
  // truncated database behind. The marker goes last: if we die before it is
  // written, the next start simply copies again.
  final tmpFile = File('$dbPath.tmp');
  await tmpFile.writeAsBytes(assetBytes, flush: true);
  await tmpFile.rename(dbPath);
  await markerFile.writeAsString(digest, flush: true);
  return true;
}

class VaultDatabase {
  VaultDatabase._(this._db);

  final Database _db;
  static VaultDatabase? _instance;

  static Future<VaultDatabase> open() async {
    if (_instance != null) return _instance!;

    final documentsDir = await getApplicationDocumentsDirectory();
    final dbPath = p.join(documentsDir.path, _dbFileName);

    final asset = await rootBundle.load(_assetDbPath);
    await syncBundledDatabase(
      assetBytes: asset.buffer.asUint8List(asset.offsetInBytes, asset.lengthInBytes),
      dbPath: dbPath,
    );

    final db = await openDatabase(
      dbPath,
      readOnly: true,
      password: vaultPassphrase,
    );
    _instance = VaultDatabase._(db);
    return _instance!;
  }

  Future<List<VaultGroup>> getGroups() async {
    final rows = await _db.query('groups', orderBy: 'groupName COLLATE NOCASE');
    return rows.map(VaultGroup.fromMap).toList();
  }

  Future<List<VaultProperty>> getPropertiesForGroup(String groupId) async {
    final rows = await _db.rawQuery(
      '''
      SELECT p.*, g.groupName as groupName
      FROM properties p
      JOIN groups g ON g.id = p.groupId
      WHERE p.groupId = ?
      ORDER BY p.propertyNameLower COLLATE NOCASE
      ''',
      [groupId],
    );
    return rows.map(VaultProperty.fromMap).toList();
  }

  /// Searches groups by `groupName` and properties by `propertyNameLower`,
  /// as requested (case-insensitive partial match).
  Future<VaultSearchResult> search(String query) async {
    final term = query.trim().toLowerCase();
    if (term.isEmpty) {
      return const VaultSearchResult(groups: [], properties: []);
    }

    final likeTerm = '%$term%';

    final groupRows = await _db.query(
      'groups',
      where: 'LOWER(groupName) LIKE ?',
      whereArgs: [likeTerm],
      orderBy: 'groupName COLLATE NOCASE',
    );

    final propertyRows = await _db.rawQuery(
      '''
      SELECT p.*, g.groupName as groupName
      FROM properties p
      JOIN groups g ON g.id = p.groupId
      WHERE p.propertyNameLower LIKE ?
      ORDER BY p.propertyNameLower COLLATE NOCASE
      ''',
      [likeTerm],
    );

    return VaultSearchResult(
      groups: groupRows.map(VaultGroup.fromMap).toList(),
      properties: propertyRows.map(VaultProperty.fromMap).toList(),
    );
  }
}

class VaultSearchResult {
  final List<VaultGroup> groups;
  final List<VaultProperty> properties;

  const VaultSearchResult({required this.groups, required this.properties});

  bool get isEmpty => groups.isEmpty && properties.isEmpty;
}
