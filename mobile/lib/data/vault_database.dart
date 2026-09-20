import 'dart:io';

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

class VaultDatabase {
  VaultDatabase._(this._db);

  final Database _db;
  static VaultDatabase? _instance;

  static Future<VaultDatabase> open() async {
    if (_instance != null) return _instance!;

    final documentsDir = await getApplicationDocumentsDirectory();
    final dbPath = p.join(documentsDir.path, _dbFileName);

    // Copy the bundled, backend-generated database into a writable location
    // (sqflite cannot open a file directly from the read-only asset bundle).
    // Refresh it on every start, not just the first: installing a new APK over
    // an old one keeps the app's files, so a "copy only if missing" check would
    // keep serving the previous export forever. The file is small and this
    // runs once per process (the opened instance is cached below).
    final bytes = await rootBundle.load(_assetDbPath);
    await File(dbPath).writeAsBytes(
      bytes.buffer.asUint8List(bytes.offsetInBytes, bytes.lengthInBytes),
      flush: true,
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
