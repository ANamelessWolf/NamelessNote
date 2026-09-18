import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:namelessnote/auth/biometric_gate.dart';
import 'package:namelessnote/main.dart';
import 'package:namelessnote/screens/home_screen.dart';
import 'package:namelessnote/screens/password_screen.dart';
import 'package:namelessnote/security/access_password.dart';

class _PassingGate extends BiometricGate {
  @override
  Future<BiometricCheckResult> authenticate() async => BiometricCheckResult.success;
}

const _password = AccessPassword(
  saltHex: '00112233445566778899aabbccddeeff',
  hashHex: '819288fa27a84a5aa11818107d09508b618ff8e8ee5b719ccc03096e96a3e51a', // "correct horse"
);

Future<void> _unlock(WidgetTester tester) async {
  // LockScreen delays its biometric prompt by 400 ms (see lock_screen.dart).
  await tester.pump(const Duration(milliseconds: 500));
  await tester.pump();
}

Future<void> _type(WidgetTester tester, String value) async {
  await tester.enterText(find.byType(TextField), value);
  await tester.tap(find.byType(FilledButton));
  // The hash runs in an isolate (compute); give it real time to finish.
  await tester.runAsync(() => Future.delayed(const Duration(seconds: 3)));
  await tester.pump();
}

Future<void> _background(WidgetTester tester) async {
  tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.paused);
  await tester.pump();
  tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
  await tester.pump();
}

void main() {
  testWidgets('starts on the lock screen', (tester) async {
    await tester.pumpWidget(const NamelessNoteVaultApp());
    await tester.pump();

    expect(find.byIcon(Icons.lock_outline), findsOneWidget);
    await tester.pump(const Duration(milliseconds: 500)); // flush delayed prompt
    await tester.pump();
  });

  testWidgets('password screen is one input and one button', (tester) async {
    await tester.pumpWidget(
      NamelessNoteVaultApp(accessPassword: _password, biometricGate: _PassingGate()),
    );
    await _unlock(tester);

    expect(find.byType(PasswordScreen), findsOneWidget);
    expect(find.byType(TextField), findsOneWidget);
    expect(find.byType(FilledButton), findsOneWidget);
  });

  testWidgets('correct password opens the normal home', (tester) async {
    // The real DB can't open in a unit test; HomeScreen shows its error text,
    // which is enough to prove we reached the normal (non-empty) home.
    await tester.pumpWidget(
      NamelessNoteVaultApp(accessPassword: _password, biometricGate: _PassingGate()),
    );
    await _unlock(tester);
    await _type(tester, 'correct horse');

    expect(find.byType(PasswordScreen), findsNothing);
    final home = tester.widget<HomeScreen>(find.byType(HomeScreen));
    expect(home.emptyMode, isFalse);
  });

  testWidgets('wrong password shows an empty app with search disabled, and stays that way',
      (tester) async {
    await tester.pumpWidget(
      NamelessNoteVaultApp(accessPassword: _password, biometricGate: _PassingGate()),
    );
    await _unlock(tester);
    await _type(tester, 'wrong');

    expect(find.byType(PasswordScreen), findsNothing);
    expect(tester.widget<HomeScreen>(find.byType(HomeScreen)).emptyMode, isTrue);
    expect(find.text('No hay grupos guardados.'), findsOneWidget);
    expect(tester.widget<TextField>(find.byType(TextField)).enabled, isFalse);
    expect(tester.widget<SegmentedButton<SearchMode>>(find.byType(SegmentedButton<SearchMode>)).onSelectionChanged,
        isNull);

    // Backgrounding and unlocking again must NOT give another attempt.
    await _background(tester);
    await _unlock(tester);
    expect(find.byType(PasswordScreen), findsNothing);
    expect(tester.widget<HomeScreen>(find.byType(HomeScreen)).emptyMode, isTrue);
  });

  testWidgets('password is asked again after backgrounding when it was correct', (tester) async {
    await tester.pumpWidget(
      NamelessNoteVaultApp(accessPassword: _password, biometricGate: _PassingGate()),
    );
    await _unlock(tester);
    await _type(tester, 'correct horse');
    expect(find.byType(HomeScreen), findsOneWidget);

    await _background(tester);
    await _unlock(tester);
    expect(find.byType(PasswordScreen), findsOneWidget);
  });

  testWidgets('feature is off when no password is configured', (tester) async {
    await tester.pumpWidget(
      NamelessNoteVaultApp(
        accessPassword: const AccessPassword(saltHex: '', hashHex: ''),
        biometricGate: _PassingGate(),
      ),
    );
    await _unlock(tester);
    expect(find.byType(PasswordScreen), findsNothing);
    expect(find.byType(HomeScreen), findsOneWidget);
  });
}
