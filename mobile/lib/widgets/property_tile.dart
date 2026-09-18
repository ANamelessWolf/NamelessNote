import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../models/vault_property.dart';

/// Shows one property with masked value + copy/show-hide actions, mirroring
/// PropertyRow.jsx from the web frontend (password-style field, "eye" icon
/// to reveal, copy icon to copy the plain-text value to the clipboard).
class PropertyTile extends StatefulWidget {
  const PropertyTile({
    super.key,
    required this.property,
    this.showGroupName = false,
  });

  final VaultProperty property;
  final bool showGroupName;

  @override
  State<PropertyTile> createState() => _PropertyTileState();
}

class _PropertyTileState extends State<PropertyTile> {
  bool _showValue = false;

  Future<void> _copyValue() async {
    await Clipboard.setData(ClipboardData(text: widget.property.plainValue));
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Valor copiado'), duration: Duration(seconds: 1)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final property = widget.property;
    final maskedValue = '•' * (property.plainValue.isEmpty ? 8 : property.plainValue.length.clamp(4, 24));

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              property.propertyNameOriginal,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.bold),
            ),
            if (widget.showGroupName) ...[
              const SizedBox(height: 2),
              Text(
                property.groupName,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                    ),
              ),
            ],
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: SelectableText(
                    _showValue ? property.plainValue : maskedValue,
                    style: const TextStyle(fontFamily: 'monospace'),
                  ),
                ),
                IconButton(
                  tooltip: _showValue ? 'Ocultar' : 'Mostrar',
                  icon: Icon(_showValue ? Icons.visibility_off : Icons.visibility),
                  onPressed: () => setState(() => _showValue = !_showValue),
                ),
                IconButton(
                  tooltip: 'Copiar',
                  icon: const Icon(Icons.copy),
                  onPressed: _copyValue,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
