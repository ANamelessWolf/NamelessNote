import 'dart:convert' show utf8;
import 'dart:typed_data';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart' show compute;

/// Number of PBKDF2 iterations. MUST match `ITERATIONS` in
/// `scripts/build-mobile-apk.js`, which produces the hash baked into the app.
const accessPasswordIterations = 50000;

/// PBKDF2-HMAC-SHA256 with a 32-byte output (a single block), so it matches
/// Node's `crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256')`.
Uint8List pbkdf2Sha256(List<int> password, List<int> salt, int iterations) {
  final hmac = Hmac(sha256, password);
  var u = hmac.convert([...salt, 0, 0, 0, 1]).bytes;
  final t = List<int>.from(u);
  for (var i = 1; i < iterations; i++) {
    u = hmac.convert(u).bytes;
    for (var j = 0; j < t.length; j++) {
      t[j] ^= u[j];
    }
  }
  return Uint8List.fromList(t);
}

String _toHex(List<int> bytes) =>
    bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();

List<int> _fromHex(String hex) => [
      for (var i = 0; i + 1 < hex.length; i += 2)
        int.parse(hex.substring(i, i + 2), radix: 16),
    ];

/// Hex PBKDF2 hash of a password. Top-level so it can run inside `compute`;
/// [args] is `[password, saltHex, iterations]`.
String hashAccessPassword(List<Object> args) {
  final password = args[0] as String;
  final saltHex = args[1] as String;
  final iterations = args[2] as int;
  return _toHex(pbkdf2Sha256(utf8.encode(password), _fromHex(saltHex), iterations));
}

/// The optional "second factor" shown after the biometric/PIN unlock.
///
/// Set `MOBILE_ACCESS_PASSWORD` in backend/.env; `npm run mobile:apk` turns it
/// into a salted hash and passes it here via `--dart-define`. The plain
/// password is never stored in the app. If no hash is configured the feature
/// is off and the app behaves exactly as before.
///
/// Note: this is a deterrent against someone who enrolls their own fingerprint
/// on the phone, not strong protection — the hash lives in the APK.
class AccessPassword {
  const AccessPassword({
    required this.saltHex,
    required this.hashHex,
    this.iterations = accessPasswordIterations,
  });

  const AccessPassword.fromEnvironment()
      : saltHex = const String.fromEnvironment('ACCESS_PASSWORD_SALT'),
        hashHex = const String.fromEnvironment('ACCESS_PASSWORD_HASH'),
        iterations = accessPasswordIterations;

  final String saltHex;
  final String hashHex;
  final int iterations;

  bool get isConfigured => saltHex.isNotEmpty && hashHex.isNotEmpty;

  Future<bool> verify(String input) async {
    if (!isConfigured) return true;
    final candidate =
        await compute(hashAccessPassword, [input, saltHex, iterations]);
    return _constantTimeEquals(candidate, hashHex.toLowerCase());
  }
}

bool _constantTimeEquals(String a, String b) {
  if (a.length != b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) {
    diff |= a.codeUnitAt(i) ^ b.codeUnitAt(i);
  }
  return diff == 0;
}
