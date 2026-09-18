// Basic smoke test: the app boots straight into the biometric lock screen.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:namelessnote/main.dart';

void main() {
  testWidgets('shows the lock screen on startup', (WidgetTester tester) async {
    await tester.pumpWidget(const NamelessNoteVaultApp());
    await tester.pump();

    expect(find.text('NamelessNote Vault'), findsOneWidget);
    expect(find.byIcon(Icons.lock_outline), findsOneWidget);

    // LockScreen schedules a delayed biometric prompt attempt (see
    // lib/screens/lock_screen.dart); flush it (and the platform-channel
    // call it makes, which errors out with no test binding — caught and
    // surfaced as an error state) so no timer/future is left pending when
    // the test ends.
    await tester.pump(const Duration(milliseconds: 500));
    await tester.pump();
  });
}
