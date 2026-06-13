import 'package:equatable/equatable.dart';

enum UserRole { client, professional, admin, unknown }

class AppUser extends Equatable {
  const AppUser({
    required this.id,
    required this.email,
    this.fullName,
    this.avatarUrl,
    this.role = UserRole.unknown,
  });

  final String id;
  final String email;
  final String? fullName;
  final String? avatarUrl;
  final UserRole role;

  factory AppUser.fromSupabaseRow({
    required String authId,
    required String email,
    Map<String, dynamic>? usersRow,
    Map<String, dynamic>? metadata,
  }) {
    final roleStr = usersRow?['role'] as String? ??
        metadata?['role'] as String? ??
        'client';

    return AppUser(
      id: authId,
      email: email,
      fullName: usersRow?['full_name'] as String? ??
          metadata?['name'] as String? ??
          metadata?['full_name'] as String?,
      avatarUrl: usersRow?['avatar_url'] as String? ??
          metadata?['avatar_url'] as String?,
      role: _parseRole(roleStr),
    );
  }

  static UserRole _parseRole(String? value) {
    switch (value) {
      case 'client':
        return UserRole.client;
      case 'professional':
        return UserRole.professional;
      case 'admin':
        return UserRole.admin;
      default:
        return UserRole.unknown;
    }
  }

  bool get isClient => role == UserRole.client;
  bool get isProfessional => role == UserRole.professional;
  bool get isAdmin => role == UserRole.admin;

  @override
  List<Object?> get props => [id, email, fullName, avatarUrl, role];
}

class ProfessionalProfile extends Equatable {
  const ProfessionalProfile({
    required this.id,
    required this.userId,
    this.specialization,
    this.city,
    this.bio,
    this.consultationFee,
    this.isVerified = false,
    this.yearsOfExperience,
    this.fullName,
    this.avatarUrl,
  });

  final String id;
  final String userId;
  final String? specialization;
  final String? city;
  final String? bio;
  final int? consultationFee;
  final bool isVerified;
  final int? yearsOfExperience;
  final String? fullName;
  final String? avatarUrl;

  factory ProfessionalProfile.fromJson(Map<String, dynamic> json) {
    final users = json['users'] as Map<String, dynamic>?;
    return ProfessionalProfile(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      specialization: json['specialization'] as String?,
      city: json['city'] as String?,
      bio: json['bio'] as String?,
      consultationFee: json['consultation_fee'] as int?,
      isVerified: json['is_verified'] as bool? ?? false,
      yearsOfExperience: json['years_of_experience'] as int?,
      fullName: users?['full_name'] as String?,
      avatarUrl: users?['avatar_url'] as String?,
    );
  }

  String get displayFee {
    if (consultationFee == null) return '—';
    return '\$${(consultationFee! / 100).toStringAsFixed(0)}';
  }

  @override
  List<Object?> get props => [id, userId, specialization, isVerified];
}

class AppointmentItem extends Equatable {
  const AppointmentItem({
    required this.id,
    required this.status,
    required this.scheduledAt,
    this.notes,
    this.professionalName,
    this.clientName,
  });

  final String id;
  final String status;
  final DateTime scheduledAt;
  final String? notes;
  final String? professionalName;
  final String? clientName;

  factory AppointmentItem.fromJson(Map<String, dynamic> json) {
    final pro = json['professional_profiles'] as Map<String, dynamic>?;
    final proUser = pro?['users'] as Map<String, dynamic>?;
    final client = json['users'] as Map<String, dynamic>?;

    return AppointmentItem(
      id: json['id'] as String,
      status: json['status'] as String? ?? 'pending',
      scheduledAt: DateTime.parse(json['scheduled_at'] as String),
      notes: json['notes'] as String?,
      professionalName: proUser?['full_name'] as String?,
      clientName: client?['full_name'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, status, scheduledAt];
}

class MedicalHistoryItem extends Equatable {
  const MedicalHistoryItem({
    required this.id,
    required this.condition,
    this.diagnosedDate,
    this.notes,
  });

  final String id;
  final String condition;
  final String? diagnosedDate;
  final String? notes;

  factory MedicalHistoryItem.fromJson(Map<String, dynamic> json) {
    return MedicalHistoryItem(
      id: json['id'] as String,
      condition: json['condition'] as String? ?? '',
      diagnosedDate: json['diagnosed_date'] as String?,
      notes: json['notes'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, condition];
}

class MedicationItem extends Equatable {
  const MedicationItem({
    required this.id,
    required this.name,
    this.dosage,
    this.frequency,
  });

  final String id;
  final String name;
  final String? dosage;
  final String? frequency;

  factory MedicationItem.fromJson(Map<String, dynamic> json) {
    return MedicationItem(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      dosage: json['dosage'] as String?,
      frequency: json['frequency'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, name];
}
