import 'dart:io';
import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:namelessnote/data/vault_database.dart';

Uint8List _bytes(String s) => Uint8List.fromList(s.codeUnits);

void main() {
  late Directory dir;
  late String dbPath;

  setUp(() {
    dir = Directory.systemTemp.createTempSync('vault_sync_test');
    dbPath = '${dir.path}${Platform.pathSeparator}vault.sqlite';
  });

  tearDown(() => dir.deleteSync(recursive: true));

  test('copies on first run, then not again while the asset is unchanged', () async {
    expect(await syncBundledDatabase(assetBytes: _bytes('v1'), dbPath: dbPath), isTrue);
    expect(File(dbPath).readAsStringSync(), 'v1');

    expect(await syncBundledDatabase(assetBytes: _bytes('v1'), dbPath: dbPath), isFalse);
    expect(File(dbPath).readAsStringSync(), 'v1');
  });

  test('copies again when a new APK ships a different export', () async {
    await syncBundledDatabase(assetBytes: _bytes('old export'), dbPath: dbPath);

    expect(await syncBundledDatabase(assetBytes: _bytes('new export'), dbPath: dbPath), isTrue);
    expect(File(dbPath).readAsStringSync(), 'new export');

    expect(await syncBundledDatabase(assetBytes: _bytes('new export'), dbPath: dbPath), isFalse);
  });

  test('replaces a stale copy restored without our marker (e.g. from a backup)', () async {
    File(dbPath).writeAsStringSync('stale restored copy');

    expect(await syncBundledDatabase(assetBytes: _bytes('fresh'), dbPath: dbPath), isTrue);
    expect(File(dbPath).readAsStringSync(), 'fresh');
  });

  test('re-copies if the database file went missing but the marker is still there', () async {
    await syncBundledDatabase(assetBytes: _bytes('v1'), dbPath: dbPath);
    File(dbPath).deleteSync();

    expect(await syncBundledDatabase(assetBytes: _bytes('v1'), dbPath: dbPath), isTrue);
    expect(File(dbPath).existsSync(), isTrue);
  });

  test('leaves no temp file behind', () async {
    await syncBundledDatabase(assetBytes: _bytes('v1'), dbPath: dbPath);
    expect(File('$dbPath.tmp').existsSync(), isFalse);
  });
}
