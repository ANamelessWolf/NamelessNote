import 'package:flutter/material.dart';

import '../auth/biometric_gate.dart';

class LockScreen extends StatefulWidget {
  const LockScreen({super.key, required this.onUnlocked});

  final VoidCallback onUnlocked;

  @override
  State<LockScreen> createState() => _LockScreenState();
}

class _LockScreenState extends State<LockScreen> {
  final _gate = BiometricGate();
  bool _authenticating = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    // Prompt once the lock screen appears. A short delay is required: on
    // Android, calling authenticate() immediately after the first frame can
    // race the Activity's onSaveInstanceState/onResume lifecycle and the
    // biometric prompt silently fails to show ("Unable to start
    // authentication. Called after onSaveInstanceState()").
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Future.delayed(const Duration(milliseconds: 400), _tryUnlock);
    });
  }

  Future<void> _tryUnlock() async {
    setState(() {
      _authenticating = true;
      _error = null;
    });

    final result = await _gate.authenticate();

    if (!mounted) return;

    switch (result) {
      case BiometricCheckResult.success:
        widget.onUnlocked();
        break;
      case BiometricCheckResult.notAvailable:
        setState(() {
          _authenticating = false;
          _error =
              'Este dispositivo no tiene biométricos ni PIN configurado. '
              'Configura un bloqueo de pantalla para usar la app.';
        });
        break;
      case BiometricCheckResult.failed:
        setState(() {
          _authenticating = false;
          _error = 'Autenticación cancelada o fallida.';
        });
        break;
      case BiometricCheckResult.error:
        setState(() {
          _authenticating = false;
          _error = 'Ocurrió un error al validar tu identidad.';
        });
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.lock_outline, size: 72),
                const SizedBox(height: 16),
                Text(
                  'NamelessNote Vault',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Usa tu huella o el PIN del celular para continuar',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                if (_authenticating) const CircularProgressIndicator(),
                if (!_authenticating && _error != null) ...[
                  Text(
                    _error!,
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: _tryUnlock,
                    icon: const Icon(Icons.fingerprint),
                    label: const Text('Reintentar'),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
