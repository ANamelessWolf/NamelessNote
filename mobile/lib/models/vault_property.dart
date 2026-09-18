/// Strips basic HTML tags so rich-text values (edited with the web rich text
/// editor) can be shown/copied as plain text, mirroring the web frontend's
/// `stripHtml` helper in PropertyRow.jsx.
String stripHtml(String value) {
  return value.replaceAll(RegExp(r'<[^>]+>'), '').trim();
}

class VaultProperty {
  final String id;
  final String groupId;
  final String groupName;
  final String propertyNameOriginal;
  final String propertyNameLower;
  final String valueHtml;

  const VaultProperty({
    required this.id,
    required this.groupId,
    required this.groupName,
    required this.propertyNameOriginal,
    required this.propertyNameLower,
    required this.valueHtml,
  });

  String get plainValue => stripHtml(valueHtml);

  factory VaultProperty.fromMap(Map<String, Object?> map) {
    return VaultProperty(
      id: map['id'] as String,
      groupId: map['groupId'] as String,
      groupName: map['groupName'] as String? ?? '',
      propertyNameOriginal: map['propertyNameOriginal'] as String,
      propertyNameLower: map['propertyNameLower'] as String,
      valueHtml: map['valueHtml'] as String? ?? '',
    );
  }
}
