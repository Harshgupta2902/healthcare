import '../../../core/constants/consultant_specialties.dart';
import '../../../core/constants/health_categories.dart';
import '../../../shared/models/models.dart';

class ConsultantSearchFilters {
  const ConsultantSearchFilters({
    this.query = '',
    this.specialty,
    this.city,
    this.healthCategory,
    this.sort = ConsultantSortOption.priceDesc,
  });

  final String query;
  final String? specialty;
  final String? city;
  final String? healthCategory;
  final ConsultantSortOption sort;

  static const allSpecialty = 'all';
  static const allCity = 'all';

  bool get hasActiveFilters =>
      query.trim().isNotEmpty ||
      (specialty != null && specialty != allSpecialty) ||
      (city != null && city != allCity) ||
      (healthCategory != null && healthCategory!.isNotEmpty);

  int get activeFilterCount {
    var count = 0;
    if (specialty != null && specialty != allSpecialty) count++;
    if (city != null && city != allCity) count++;
    if (healthCategory != null && healthCategory!.isNotEmpty) count++;
    if (sort != ConsultantSortOption.priceDesc) count++;
    return count;
  }

  ConsultantSearchFilters copyWith({
    String? query,
    String? specialty,
    bool clearSpecialty = false,
    String? city,
    bool clearCity = false,
    String? healthCategory,
    bool clearHealthCategory = false,
    ConsultantSortOption? sort,
  }) {
    return ConsultantSearchFilters(
      query: query ?? this.query,
      specialty: clearSpecialty ? null : specialty ?? this.specialty,
      city: clearCity ? null : city ?? this.city,
      healthCategory:
          clearHealthCategory ? null : healthCategory ?? this.healthCategory,
      sort: sort ?? this.sort,
    );
  }

  ConsultantSearchFilters cleared() => const ConsultantSearchFilters();
}

List<ProfessionalProfile> filterAndSortConsultants(
  List<ProfessionalProfile> consultants,
  ConsultantSearchFilters filters,
) {
  final q = filters.query.trim().toLowerCase();

  var list = consultants.where((p) {
    if (q.isNotEmpty) {
      final hay =
          '${p.displayName} ${p.specialization ?? ''} ${p.city ?? ''}'
              .toLowerCase();
      if (!hay.contains(q)) return false;
    }

    final specialty = filters.specialty;
    if (specialty != null &&
        specialty.isNotEmpty &&
        specialty != ConsultantSearchFilters.allSpecialty) {
      final spec = (p.specialization ?? '').toLowerCase();
      if (!spec.contains(specialty.toLowerCase())) return false;
    }

    final city = filters.city;
    if (city != null &&
        city.isNotEmpty &&
        city != ConsultantSearchFilters.allCity) {
      if ((p.city ?? '').toLowerCase() != city.toLowerCase()) return false;
    }

    final category = filters.healthCategory;
    if (category != null && category.isNotEmpty) {
      if (!professionalMatchesHealthCategory(p.specialization, category)) {
        return false;
      }
    }

    return true;
  }).toList();

  final dir = switch (filters.sort) {
    ConsultantSortOption.priceAsc || ConsultantSortOption.experienceAsc => 1,
    ConsultantSortOption.priceDesc || ConsultantSortOption.experienceDesc => -1,
  };

  list.sort((a, b) {
    if (filters.sort == ConsultantSortOption.priceAsc ||
        filters.sort == ConsultantSortOption.priceDesc) {
      final feeA = a.consultationFee ?? 0;
      final feeB = b.consultationFee ?? 0;
      return (feeA - feeB) * dir;
    }
    final expA = a.yearsOfExperience ?? 0;
    final expB = b.yearsOfExperience ?? 0;
    return (expA - expB) * dir;
  });

  return list;
}

List<String> extractConsultantCities(List<ProfessionalProfile> consultants) {
  final cities = consultants
      .map((p) => p.city?.trim())
      .whereType<String>()
      .where((c) => c.isNotEmpty)
      .toSet()
      .toList()
    ..sort();
  return cities;
}
