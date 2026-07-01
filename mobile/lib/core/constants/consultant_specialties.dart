/// Consultant directory specialties — aligned with web `/consultants`.
const consultantDirectorySpecialties = <String>[
  'Cardiologist',
  'Dermatologist',
  'General Practitioner',
  'Neurologist',
  'Pediatrician',
  'Psychiatrist',
  'Orthopedic',
  'Gynecologist',
  'Ophthalmologist',
];

enum ConsultantSortOption {
  priceDesc,
  priceAsc,
  experienceDesc,
  experienceAsc,
}

extension ConsultantSortOptionX on ConsultantSortOption {
  String get label => switch (this) {
        ConsultantSortOption.priceDesc => 'Price · High to low',
        ConsultantSortOption.priceAsc => 'Price · Low to high',
        ConsultantSortOption.experienceDesc => 'Experience · High to low',
        ConsultantSortOption.experienceAsc => 'Experience · Low to high',
      };
}
