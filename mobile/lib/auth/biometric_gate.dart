import 'package:local_auth/local_auth.dart';

enum BiometricCheckResult { success, notAvailable, failed, error }

/// Wraps `local_auth` to require the device's fingerprint/face unlock or the
/// device PIN/pattern/password before the vault contents are shown.
class BiometricGate {
  final LocalAuthentication _auth = LocalAuthentication();

  Future<BiometricCheckResult> authenticate() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isSupported = await _auth.isDeviceSupported();
      if (!canCheck && !isSupported) {
        return BiometricCheckResult.notAvailable;
      }

      final didAuthenticate = await _auth.authenticate(
        localizedReason: 'Autentícate para ver tus notas',
        biometricOnly: false, // allow falling back to device PIN/pattern
        persistAcrossBackgrounding: true,
      );

      return didAuthenticate
          ? BiometricCheckResult.success
          : BiometricCheckResult.failed;
    } catch (_) {
      return BiometricCheckResult.error;
    }
  }
}
