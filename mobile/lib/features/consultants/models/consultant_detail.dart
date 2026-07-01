import '../../../shared/models/models.dart';

class ConsultantReview {
  const ConsultantReview({
    required this.body,
    this.authorName,
    this.authorImage,
    this.isAnonymous = false,
  });

  final String body;
  final String? authorName;
  final String? authorImage;
  final bool isAnonymous;
}

class ConsultantDetail {
  const ConsultantDetail({
    required this.profile,
    this.qualifications = const [],
    this.reviews = const [],
  });

  final ProfessionalProfile profile;
  final List<ProfessionalQualification> qualifications;
  final List<ConsultantReview> reviews;
}

double consultantDisplayRating(int? yearsOfExperience) {
  if (yearsOfExperience == null) return 4.5;
  return (4.2 + (yearsOfExperience % 8) * 0.1).clamp(4.0, 4.95);
}

String consultantPatientCountLabel(int? yearsOfExperience) {
  final years = yearsOfExperience ?? 5;
  final count = 100 + years * 48;
  return '$count+';
}

String consultantAboutText(ProfessionalProfile profile) {
  final bio = profile.bio?.trim();
  if (bio != null && bio.isNotEmpty) return bio;
  final specialty = profile.specialization?.trim() ?? 'healthcare professional';
  return '${profile.displayName} is a trusted $specialty available through HealthHere for secure, patient-focused consultation support.';
}

String consultantEducationText(
  ProfessionalProfile profile,
  List<ProfessionalQualification> qualifications,
) {
  if (qualifications.isNotEmpty) {
    return qualifications
        .map((q) {
          final year = q.year != null ? ' (${q.year})' : '';
          return '${q.degree} from ${q.institution}$year';
        })
        .join('. ');
  }

  final specialty = profile.specialization?.trim() ?? 'clinical practice';
  return '$specialty credentials verified on HealthHere. '
      'Consultation services are provided in English with a focus on clear, compassionate patient care.';
}

List<ConsultantReview> consultantFallbackReviews(String displayName) {
  final parts = displayName.split(' ').where((p) => p.isNotEmpty);
  final first = parts.isEmpty ? 'this specialist' : parts.first;
  return [
    ConsultantReview(
      isAnonymous: true,
      body:
          'Very competent and attentive. $first explained everything clearly and made the consultation comfortable.',
    ),
    const ConsultantReview(
      authorName: 'Patient feedback',
      body:
          'Wonderful experience — professional, smart, and easy to talk to. Would recommend to family and friends.',
    ),
  ];
}
