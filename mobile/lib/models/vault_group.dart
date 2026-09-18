class VaultGroup {
  final String id;
  final String groupName;
  final String ownerEmail;

  const VaultGroup({
    required this.id,
    required this.groupName,
    required this.ownerEmail,
  });

  factory VaultGroup.fromMap(Map<String, Object?> map) {
    return VaultGroup(
      id: map['id'] as String,
      groupName: map['groupName'] as String,
      ownerEmail: map['ownerEmail'] as String,
    );
  }
}
