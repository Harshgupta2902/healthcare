import 'package:flutter/material.dart';

/// Booking / browse categories — kept in sync with web `healthCategories`.
class HealthCategory {
  const HealthCategory({required this.label, required this.icon});

  final String label;
  final IconData icon;
}

const healthCategories = <HealthCategory>[
  HealthCategory(label: 'General Medicine', icon: Icons.medical_services_outlined),
  HealthCategory(label: 'Mental Health', icon: Icons.psychology_outlined),
  HealthCategory(label: "Women's Health", icon: Icons.pregnant_woman_outlined),
  HealthCategory(label: 'Child Health', icon: Icons.child_care_outlined),
  HealthCategory(label: 'Eye Problems', icon: Icons.visibility_outlined),
  HealthCategory(label: 'Psychiatric Care', icon: Icons.healing_outlined),
  HealthCategory(label: 'Bone & Joint Pain', icon: Icons.accessibility_new_outlined),
  HealthCategory(label: 'Skin Issues', icon: Icons.face_retouching_natural_outlined),
  HealthCategory(label: 'Heart Health', icon: Icons.favorite_outline),
  HealthCategory(label: 'Family Medicine', icon: Icons.family_restroom_outlined),
];

/// Loose match from browse category → consultant specialization text.
const healthCategorySearchTerms = <String, List<String>>{
  'General Medicine': ['general', 'physician', 'medicine', 'internal'],
  'Mental Health': ['mental', 'psycholog', 'therapy', 'counsel'],
  "Women's Health": ['women', 'gynec', 'obstet', 'reproductive'],
  'Child Health': ['child', 'pediatr', 'neonatal'],
  'Eye Problems': ['eye', 'ophthalm', 'optomet', 'vision'],
  'Psychiatric Care': ['psychiatr', 'psych'],
  'Bone & Joint Pain': ['ortho', 'bone', 'joint', 'rheumat', 'sports med'],
  'Skin Issues': ['dermat', 'skin'],
  'Heart Health': ['cardio', 'heart'],
  'Family Medicine': ['family', 'general', 'primary'],
};

bool professionalMatchesHealthCategory(
  String? specialization,
  String categoryLabel,
) {
  final spec = (specialization ?? '').toLowerCase();
  if (spec.isEmpty) return false;
  final terms = healthCategorySearchTerms[categoryLabel] ??
      [categoryLabel.toLowerCase()];
  return terms.any(spec.contains);
}
