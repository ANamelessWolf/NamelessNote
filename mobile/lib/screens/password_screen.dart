import 'package:flutter/material.dart';

import '../security/access_password.dart';

/// Welcome prompt shown after the biometric/PIN unlock: one input, one button.
///
/// It gives no feedback on failure by design — [onResult] is called with
/// `false` and the caller shows the app as if it had no content.
class PasswordScreen extends StatefulWidget {
  const PasswordScreen({
    super.key,
    required this.accessPassword,
    required this.onResult,
  });

  final AccessPassword accessPassword;
  final ValueChanged<bool> onResult;

  @override
  State<PasswordScreen> createState() => _PasswordScreenState();
}

class _PasswordScreenState extends State<PasswordScreen> {
  final _controller = TextEditingController();
  bool _checking = false;

  Future<void> _submit() async {
    if (_checking) return;
    setState(() => _checking = true);
    final ok = await widget.accessPassword.verify(_controller.text);
    if (!mounted) return;
    widget.onResult(ok);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 360),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextField(
                    controller: _controller,
                    autofocus: true,
                    obscureText: true,
                    enableSuggestions: false,
                    autocorrect: false,
                    enabled: !_checking,
                    textInputAction: TextInputAction.done,
                    onSubmitted: (_) => _submit(),
                    decoration: const InputDecoration(
                      labelText: 'Who are you?',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: _checking ? null : _submit,
                    child: const Text('Entrar'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
