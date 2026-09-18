import 'package:flutter_test/flutter_test.dart';
import 'package:namelessnote/security/access_password.dart';

// Vectors produced by Node: crypto.pbkdf2Sync(pw, salt, 50000, 32, 'sha256').
// They prove the app verifies the exact hash scripts/build-mobile-apk.js makes.
const salt = '00112233445566778899aabbccddeeff';
const hashAscii = '819288fa27a84a5aa11818107d09508b618ff8e8ee5b719ccc03096e96a3e51a';
const hashUnicode = 'e75f670316ecaeeb8b430f3f9e7f07d7c8a78c30fe3059734aa010c34f0e5761';

void main() {
  test('matches the Node-generated PBKDF2 hash (ASCII and UTF-8)', () async {
    const ascii = AccessPassword(saltHex: salt, hashHex: hashAscii);
    expect(await ascii.verify('correct horse'), isTrue);
    const unicode = AccessPassword(saltHex: salt, hashHex: hashUnicode);
    expect(await unicode.verify('contraseña-ñ€'), isTrue);
  });

  test('rejects a wrong or empty password', () async {
    const cfg = AccessPassword(saltHex: salt, hashHex: hashAscii);
    expect(await cfg.verify('correct horsE'), isFalse);
    expect(await cfg.verify(''), isFalse);
  });

  test('is disabled (always passes) when no hash is configured', () async {
    const cfg = AccessPassword(saltHex: '', hashHex: '');
    expect(cfg.isConfigured, isFalse);
    expect(await cfg.verify('anything'), isTrue);
  });
}
