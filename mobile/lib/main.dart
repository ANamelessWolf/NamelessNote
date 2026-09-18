import 'package:flutter/material.dart';

import 'auth/biometric_gate.dart';
import 'screens/home_screen.dart';
import 'screens/lock_screen.dart';
import 'screens/password_screen.dart';
import 'security/access_password.dart';

void main() {
  runApp(const NamelessNoteVaultApp());
}

class NamelessNoteVaultApp extends StatefulWidget {
  const NamelessNoteVaultApp({
    super.key,
    this.accessPassword = const AccessPassword.fromEnvironment(),
    this.biometricGate,
  });

  /// Optional second factor asked after the biometric/PIN unlock.
  final AccessPassword accessPassword;

  /// Override in tests; defaults to the real `local_auth` gate.
  final BiometricGate? biometricGate;

  @override
  State<NamelessNoteVaultApp> createState() => _NamelessNoteVaultAppState();
}

class _NamelessNoteVaultAppState extends State<NamelessNoteVaultApp> with WidgetsBindingObserver {
  bool _unlocked = false; // biometric/PIN passed
  bool _passwordVerified = false; // access password typed correctly
  // Sticky for the life of the process: after one wrong password the app
  // shows as empty until it is closed and reopened (backgrounding it is not
  // enough), so the password can't be guessed by retrying.
  bool _passwordFailed = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    // Re-lock whenever the app goes to the background, so a lost or
    // unlocked phone doesn't leave the data exposed. The password is asked
    // again on every unlock (someone else's enrolled fingerprint must not be
    // able to resume a session), but a failed attempt is not forgotten.
    if (state == AppLifecycleState.paused || state == AppLifecycleState.detached) {
      setState(() {
        _unlocked = false;
        _passwordVerified = false;
      });
    }
  }

  Widget _buildHome() {
    if (!_unlocked) {
      return LockScreen(
        gate: widget.biometricGate,
        onUnlocked: () => setState(() => _unlocked = true),
      );
    }
    if (!widget.accessPassword.isConfigured || _passwordVerified) {
      return const HomeScreen();
    }
    if (_passwordFailed) {
      return const HomeScreen(emptyMode: true);
    }
    return PasswordScreen(
      accessPassword: widget.accessPassword,
      onResult: (ok) => setState(() {
        _passwordVerified = ok;
        _passwordFailed = !ok;
      }),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NamelessNote Vault',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(colorSchemeSeed: Colors.indigo, useMaterial3: true),
      darkTheme: ThemeData(
        colorSchemeSeed: Colors.indigo,
        brightness: Brightness.dark,
        useMaterial3: true,
      ),
      home: _buildHome(),
    );
  }
}
