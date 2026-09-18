import 'package:flutter/material.dart';

import '../data/vault_database.dart';
import '../models/vault_group.dart';
import '../models/vault_property.dart';
import '../widgets/property_tile.dart';

enum SearchMode { group, property }

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, this.emptyMode = false});

  /// Shown after a wrong access password: the app looks like it has no
  /// content. The database is never opened and searching is disabled.
  final bool emptyMode;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _searchController = TextEditingController();
  SearchMode _mode = SearchMode.group;

  VaultDatabase? _db;
  List<VaultGroup> _groups = [];
  String? _error;

  VaultSearchResult? _searchResult;
  Map<String, List<VaultProperty>> _propertiesByGroup = {};
  String? _expandedGroupId;

  @override
  void initState() {
    super.initState();
    if (!widget.emptyMode) _load();
  }

  Future<void> _load() async {
    try {
      final db = await VaultDatabase.open();
      final groups = await db.getGroups();
      if (!mounted) return;
      setState(() {
        _db = db;
        _groups = groups;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = 'No se pudo abrir la base de datos local.\n$e';
      });
    }
  }

  Future<void> _onSearchChanged(String value) async {
    final db = _db;
    if (db == null) return;

    if (value.trim().isEmpty) {
      setState(() => _searchResult = null);
      return;
    }

    final result = await db.search(value);
    if (!mounted) return;
    setState(() => _searchResult = result);
  }

  Future<void> _toggleGroup(VaultGroup group) async {
    final db = _db;
    if (db == null) return;

    if (_expandedGroupId == group.id) {
      setState(() => _expandedGroupId = null);
      return;
    }

    if (!_propertiesByGroup.containsKey(group.id)) {
      final props = await db.getPropertiesForGroup(group.id);
      _propertiesByGroup = {..._propertiesByGroup, group.id: props};
    }

    if (!mounted) return;
    setState(() => _expandedGroupId = group.id);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('NamelessNote Vault')),
      body: _error != null ? _buildError() : _buildBody(),
    );
  }

  Widget _buildError() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Text(_error!, textAlign: TextAlign.center),
      ),
    );
  }

  Widget _buildBody() {
    return Column(
      children: [
        _buildSearchBar(),
        Expanded(
          child: _searchController.text.trim().isEmpty
              ? _buildGroupsList()
              : _buildSearchResults(),
        ),
      ],
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 4),
      child: Column(
        children: [
          TextField(
            controller: _searchController,
            enabled: !widget.emptyMode,
            onChanged: (value) {
              setState(() {}); // refresh to switch between list/search views
              _onSearchChanged(value);
            },
            decoration: InputDecoration(
              hintText: _mode == SearchMode.group
                  ? 'Buscar por nombre de grupo...'
                  : 'Buscar por nombre de propiedad...',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear),
                      onPressed: () {
                        _searchController.clear();
                        _onSearchChanged('');
                        setState(() {});
                      },
                    )
                  : null,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 8),
          SegmentedButton<SearchMode>(
            segments: const [
              ButtonSegment(
                value: SearchMode.group,
                label: Text('Por grupo'),
                icon: Icon(Icons.folder_outlined),
              ),
              ButtonSegment(
                value: SearchMode.property,
                label: Text('Por propiedad'),
                icon: Icon(Icons.key_outlined),
              ),
            ],
            selected: {_mode},
            onSelectionChanged: widget.emptyMode
                ? null
                : (selection) {
                    setState(() => _mode = selection.first);
                    _onSearchChanged(_searchController.text);
                  },
          ),
        ],
      ),
    );
  }

  Widget _buildGroupsList() {
    if (_db == null && !widget.emptyMode) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_groups.isEmpty) {
      return const Center(child: Text('No hay grupos guardados.'));
    }

    return ListView.builder(
      itemCount: _groups.length,
      itemBuilder: (context, index) {
        final group = _groups[index];
        final expanded = _expandedGroupId == group.id;
        final properties = _propertiesByGroup[group.id] ?? const <VaultProperty>[];

        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ListTile(
              leading: const Icon(Icons.folder_outlined),
              title: Text(group.groupName),
              trailing: Icon(expanded ? Icons.expand_less : Icons.expand_more),
              onTap: () => _toggleGroup(group),
            ),
            if (expanded)
              if (properties.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(left: 24, bottom: 8),
                  child: Text('Este grupo no tiene propiedades.'),
                )
              else
                ...properties.map((p) => PropertyTile(property: p)),
          ],
        );
      },
    );
  }

  Widget _buildSearchResults() {
    final result = _searchResult;
    if (result == null) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_mode == SearchMode.group) {
      if (result.groups.isEmpty) {
        return const Center(child: Text('Ningún grupo coincide con la búsqueda.'));
      }
      return ListView.builder(
        itemCount: result.groups.length,
        itemBuilder: (context, index) {
          final group = result.groups[index];
          final expanded = _expandedGroupId == group.id;
          final properties = _propertiesByGroup[group.id] ?? const <VaultProperty>[];
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ListTile(
                leading: const Icon(Icons.folder_outlined),
                title: Text(group.groupName),
                trailing: Icon(expanded ? Icons.expand_less : Icons.expand_more),
                onTap: () => _toggleGroup(group),
              ),
              if (expanded)
                if (properties.isEmpty)
                  const Padding(
                    padding: EdgeInsets.only(left: 24, bottom: 8),
                    child: Text('Este grupo no tiene propiedades.'),
                  )
                else
                  ...properties.map((p) => PropertyTile(property: p)),
            ],
          );
        },
      );
    }

    // Search by property: show "group + property" list, as requested.
    if (result.properties.isEmpty) {
      return const Center(child: Text('Ninguna propiedad coincide con la búsqueda.'));
    }
    return ListView.builder(
      itemCount: result.properties.length,
      itemBuilder: (context, index) {
        return PropertyTile(property: result.properties[index], showGroupName: true);
      },
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
