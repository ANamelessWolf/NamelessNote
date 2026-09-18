import 'package:flutter/material.dart';

import 'screens/home_screen.dart';
import 'screens/lock_screen.dart';

void main() {
  runApp(const NamelessNoteVaultApp());
}

class NamelessNoteVaultApp extends StatefulWidget {
  const NamelessNoteVaultApp({super.key});

  @override
  State<NamelessNoteVaultApp> createState() => _NamelessNoteVaultAppState();
}

class _NamelessNoteVaultAppState extends State<NamelessNoteVaultApp> with WidgetsBindingObserver {
  bool _unlocked = false;

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
    // Re-lock the vault whenever the app goes to the background, so a lost
    // or unlocked phone doesn't leave the data exposed.
    if (state == AppLifecycleState.paused || state == AppLifecycleState.detached) {
      setState(() => _unlocked = false);
    }
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
      home: _unlocked
          ? const HomeScreen()
          : LockScreen(onUnlocked: () => setState(() => _unlocked = true)),
    );
  }
}
