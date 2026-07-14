import 'package:flutter/material.dart';

import '../../../core/constants/consultant_specialties.dart';
import '../../../core/constants/health_categories.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../models/consultant_search_filters.dart';

class ConsultantFilterSheet extends StatefulWidget {
  const ConsultantFilterSheet({
    super.key,
    required this.initialFilters,
    required this.cities,
  });

  final ConsultantSearchFilters initialFilters;
  final List<String> cities;

  static Future<ConsultantSearchFilters?> show(
    BuildContext context, {
    required ConsultantSearchFilters initialFilters,
    required List<String> cities,
  }) {
    return showModalBottomSheet<ConsultantSearchFilters>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => ConsultantFilterSheet(
        initialFilters: initialFilters,
        cities: cities,
      ),
    );
  }

  @override
  State<ConsultantFilterSheet> createState() => _ConsultantFilterSheetState();
}

class _ConsultantFilterSheetState extends State<ConsultantFilterSheet> {
  late String? _specialty;
  late String? _city;
  late String? _healthCategory;
  late ConsultantSortOption _sort;

  @override
  void initState() {
    super.initState();
    _specialty = widget.initialFilters.specialty;
    _city = widget.initialFilters.city;
    _healthCategory = widget.initialFilters.healthCategory;
    _sort = widget.initialFilters.sort;
  }

  void _reset() {
    setState(() {
      _specialty = null;
      _city = null;
      _healthCategory = null;
      _sort = ConsultantSortOption.priceDesc;
    });
  }

  void _apply() {
    Navigator.of(context).pop(
      widget.initialFilters.copyWith(
        specialty: _specialty ?? ConsultantSearchFilters.allSpecialty,
        city: _city ?? ConsultantSearchFilters.allCity,
        healthCategory: _healthCategory,
        clearHealthCategory: _healthCategory == null || _healthCategory!.isEmpty,
        sort: _sort,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.viewInsetsOf(context).bottom;

    return Padding(
      padding: EdgeInsets.fromLTRB(24, 12, 24, 24 + bottomInset),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.outline.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(4),
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Text('Filters', style: AppTypography.pageTitle.copyWith(fontSize: 20)),
              const Spacer(),
              TextButton(onPressed: _reset, child: const Text('Reset')),
            ],
          ),
          const SizedBox(height: 8),
          Flexible(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const _SectionLabel('Specialty'),
                  const SizedBox(height: 8),
                  _FilterDropdown<String?>(
                    value: _specialty ?? ConsultantSearchFilters.allSpecialty,
                    items: [
                      const DropdownMenuItem(
                        value: ConsultantSearchFilters.allSpecialty,
                        child: Text('All specialists'),
                      ),
                      ...consultantDirectorySpecialties.map(
                        (s) => DropdownMenuItem(value: s, child: Text(s)),
                      ),
                    ],
                    onChanged: (v) => setState(() {
                      _specialty = v == ConsultantSearchFilters.allSpecialty
                          ? null
                          : v;
                    }),
                  ),
                  const SizedBox(height: 20),
                  const _SectionLabel('City'),
                  const SizedBox(height: 8),
                  _FilterDropdown<String?>(
                    value: _city ?? ConsultantSearchFilters.allCity,
                    items: [
                      const DropdownMenuItem(
                        value: ConsultantSearchFilters.allCity,
                        child: Text('Everywhere'),
                      ),
                      ...widget.cities.map(
                        (c) => DropdownMenuItem(value: c, child: Text(c)),
                      ),
                    ],
                    onChanged: (v) => setState(() {
                      _city = v == ConsultantSearchFilters.allCity ? null : v;
                    }),
                  ),
                  const SizedBox(height: 20),
                  const _SectionLabel('Health category'),
                  const SizedBox(height: 8),
                  _FilterDropdown<String?>(
                    value: _healthCategory ?? '',
                    items: [
                      const DropdownMenuItem(value: '', child: Text('Any category')),
                      ...healthCategories.map(
                        (c) => DropdownMenuItem(
                          value: c.label,
                          child: Text(c.label),
                        ),
                      ),
                    ],
                    onChanged: (v) => setState(() {
                      _healthCategory = v == null || v.isEmpty ? null : v;
                    }),
                  ),
                  const SizedBox(height: 20),
                  const _SectionLabel('Sort by'),
                  const SizedBox(height: 8),
                  _FilterDropdown<ConsultantSortOption>(
                    value: _sort,
                    items: ConsultantSortOption.values
                        .map(
                          (o) => DropdownMenuItem(
                            value: o,
                            child: Text(o.label),
                          ),
                        )
                        .toList(),
                    onChanged: (v) {
                      if (v != null) setState(() => _sort = v);
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _apply,
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.brand,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              child: const Text('Apply filters'),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: AppTypography.fieldLabel.copyWith(
        color: AppColors.onSurfaceVariant,
        letterSpacing: 0.8,
      ),
    );
  }
}

class _FilterDropdown<T> extends StatelessWidget {
  const _FilterDropdown({
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final T value;
  final List<DropdownMenuItem<T>> items;
  final ValueChanged<T?> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.outline.withValues(alpha: 0.25)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          isExpanded: true,
          icon: const Icon(Icons.keyboard_arrow_down_rounded),
          items: items,
          onChanged: onChanged,
        ),
      ),
    );
  }
}
