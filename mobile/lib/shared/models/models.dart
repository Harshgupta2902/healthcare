import 'package:equatable/equatable.dart';
import 'package:intl/intl.dart';

enum UserRole { client, professional, admin, unknown }

class AppUser extends Equatable {
  const AppUser({
    required this.id,
    required this.email,
    this.name,
    this.image,
    this.phone,
    this.role = UserRole.unknown,
  });

  final String id;
  final String email;
  final String? name;
  final String? image;
  final String? phone;
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
      name: usersRow?['name'] as String? ??
          metadata?['name'] as String? ??
          metadata?['full_name'] as String?,
      image:
          usersRow?['image'] as String? ?? metadata?['avatar_url'] as String?,
      phone: usersRow?['phone'] as String?,
      role: _parseRole(roleStr),
    );
  }

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] as String,
      email: json['email'] as String? ?? '',
      name: json['name'] as String?,
      image: json['image'] as String?,
      phone: json['phone'] as String?,
      role: _parseRole(json['role'] as String?),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'email': email,
        if (name != null) 'name': name,
        if (image != null) 'image': image,
        if (phone != null) 'phone': phone,
        'role': role.name,
      };

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
  List<Object?> get props => [id, email, name, image, phone, role];
}

class ProfessionalProfile extends Equatable {
  const ProfessionalProfile({
    required this.id,
    this.profileId,
    required this.userId,
    this.specialization,
    this.city,
    this.bio,
    this.consultationFee,
    this.isVerified = false,
    this.yearsOfExperience,
    this.name,
    this.nameTitle,
    this.image,
    this.licenseNumber,
  });

  /// Directory routing id — same as [userId].
  final String id;
  final String? profileId;
  final String userId;
  final String? specialization;
  final String? city;
  final String? bio;
  final int? consultationFee;
  final bool isVerified;
  final int? yearsOfExperience;
  final String? name;
  final String? nameTitle;
  final String? image;
  final String? licenseNumber;

  String get displayName {
    if (nameTitle != null && nameTitle!.isNotEmpty && name != null) {
      return '$nameTitle $name';
    }
    return name ?? 'Professional';
  }

  factory ProfessionalProfile.fromJson(Map<String, dynamic> json) {
    final users = json['users'] as Map<String, dynamic>?;
    final userId = json['user_id'] as String? ?? json['id'] as String;
    return ProfessionalProfile(
      id: userId,
      profileId: json['id'] as String?,
      userId: userId,
      specialization: json['specialization'] as String?,
      city: json['city'] as String?,
      bio: json['bio'] as String?,
      consultationFee: json['consultation_fee'] as int?,
      isVerified: json['is_verified'] as bool? ?? false,
      yearsOfExperience: json['years_of_experience'] as int?,
      name: users?['name'] as String? ?? json['name'] as String?,
      nameTitle: json['name_title'] as String?,
      image: users?['image'] as String? ?? json['image'] as String?,
      licenseNumber: json['license_number'] as String?,
    );
  }

  String get displayFee {
    if (consultationFee == null) return '—';
    final rupees = consultationFee! / 100;
    return '₹${NumberFormat('#,##,###', 'en_IN').format(rupees)}';
  }

  @override
  List<Object?> get props => [id, userId, specialization, isVerified];
}

class AppointmentItem extends Equatable {
  const AppointmentItem({
    required this.id,
    required this.status,
    required this.startTime,
    required this.endTime,
    this.clientId,
    this.professionalId,
    this.appointmentType,
    this.notes,
    this.meetingUrl,
    this.professionalName,
    this.clientName,
    this.professionalImage,
  });

  final String id;
  final String status;
  final DateTime startTime;
  final DateTime endTime;
  final String? clientId;
  final String? professionalId;
  final String? appointmentType;
  final String? notes;
  final String? meetingUrl;
  final String? professionalName;
  final String? clientName;
  final String? professionalImage;

  factory AppointmentItem.fromJson(Map<String, dynamic> json) {
    final proUser = json['professional'] as Map<String, dynamic>?;
    final clientUser = json['client'] as Map<String, dynamic>?;

    return AppointmentItem(
      id: json['id'] as String,
      status: json['status'] as String? ?? 'pending',
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: DateTime.parse(json['end_time'] as String),
      clientId: json['client_id'] as String?,
      professionalId: json['professional_id'] as String?,
      appointmentType: json['appointment_type'] as String?,
      notes: json['notes'] as String?,
      meetingUrl: json['meeting_url'] as String?,
      professionalName: proUser?['name'] as String?,
      clientName: clientUser?['name'] as String?,
      professionalImage: proUser?['image'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, status, startTime];
}

extension AppointmentItemUpcoming on AppointmentItem {
  /// True when appointment should appear on client home (future, not cancelled/done).
  bool isUpcomingForClientHome([DateTime? now]) {
    final at = now ?? DateTime.now();
    final s = status.toLowerCase();
    if (s == 'cancelled' || s == 'canceled' || s == 'completed') {
      return false;
    }
    return startTime.isAfter(at);
  }
}

class MedicalHistoryItem extends Equatable {
  const MedicalHistoryItem({
    required this.id,
    required this.conditionName,
    this.diagnosisDate,
    this.status = 'active',
    this.notes,
  });

  final String id;
  final String conditionName;
  final String? diagnosisDate;
  final String status;
  final String? notes;

  factory MedicalHistoryItem.fromJson(Map<String, dynamic> json) {
    return MedicalHistoryItem(
      id: json['id'] as String,
      conditionName: json['condition_name'] as String? ?? '',
      diagnosisDate: json['diagnosis_date'] as String?,
      status: json['status'] as String? ?? 'active',
      notes: json['notes'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, conditionName];
}

class MedicationItem extends Equatable {
  const MedicationItem({
    required this.id,
    required this.medicationName,
    required this.dosage,
    required this.frequency,
    this.startDate,
    this.endDate,
    this.prescribingDoctor,
    this.notes,
    this.isActive = true,
  });

  final String id;
  final String medicationName;
  final String dosage;
  final String frequency;
  final String? startDate;
  final String? endDate;
  final String? prescribingDoctor;
  final String? notes;
  final bool isActive;

  factory MedicationItem.fromJson(Map<String, dynamic> json) {
    return MedicationItem(
      id: json['id'] as String,
      medicationName: json['medication_name'] as String? ?? '',
      dosage: json['dosage'] as String? ?? '',
      frequency: json['frequency'] as String? ?? '',
      startDate: json['start_date'] as String?,
      endDate: json['end_date'] as String?,
      prescribingDoctor: json['prescribing_doctor'] as String?,
      notes: json['notes'] as String?,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  @override
  List<Object?> get props => [id, medicationName];
}

class MedicalDocumentItem extends Equatable {
  const MedicalDocumentItem({
    required this.id,
    required this.documentName,
    required this.documentType,
    required this.fileUrl,
    this.fileSize,
    this.uploadDate,
    this.notes,
  });

  final String id;
  final String documentName;
  final String documentType;
  final String fileUrl;
  final int? fileSize;
  final DateTime? uploadDate;
  final String? notes;

  factory MedicalDocumentItem.fromJson(Map<String, dynamic> json) {
    return MedicalDocumentItem(
      id: json['id'] as String,
      documentName: json['document_name'] as String? ?? '',
      documentType: json['document_type'] as String? ?? 'other',
      fileUrl: json['file_url'] as String? ?? '',
      fileSize: json['file_size'] as int?,
      uploadDate: json['upload_date'] != null
          ? DateTime.tryParse(json['upload_date'] as String)
          : json['created_at'] != null
              ? DateTime.tryParse(json['created_at'] as String)
              : null,
      notes: json['notes'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, documentName];
}

class InsuranceItem extends Equatable {
  const InsuranceItem({
    required this.id,
    required this.providerName,
    required this.policyNumber,
    required this.policyHolderName,
    this.groupNumber,
    this.relationshipToHolder,
    this.expirationDate,
    this.notes,
  });

  final String id;
  final String providerName;
  final String policyNumber;
  final String policyHolderName;
  final String? groupNumber;
  final String? relationshipToHolder;
  final String? expirationDate;
  final String? notes;

  factory InsuranceItem.fromJson(Map<String, dynamic> json) {
    return InsuranceItem(
      id: json['id'] as String,
      providerName: json['provider_name'] as String? ?? '',
      policyNumber: json['policy_number'] as String? ?? '',
      policyHolderName: json['policy_holder_name'] as String? ?? '',
      groupNumber: json['group_number'] as String?,
      relationshipToHolder: json['relationship_to_holder'] as String?,
      expirationDate: json['expiration_date'] as String?,
      notes: json['notes'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, providerName];
}

class ClientMedicalProfile extends Equatable {
  const ClientMedicalProfile({
    this.dateOfBirth,
    this.gender,
    this.bloodType,
    this.height,
    this.weight,
    this.address,
    this.city,
    this.state,
    this.postalCode,
    this.emergencyContactName,
    this.emergencyContactPhone,
    this.emergencyContactRelationship,
  });

  final String? dateOfBirth;
  final String? gender;
  final String? bloodType;
  final String? height;
  final String? weight;
  final String? address;
  final String? city;
  final String? state;
  final String? postalCode;
  final String? emergencyContactName;
  final String? emergencyContactPhone;
  final String? emergencyContactRelationship;

  factory ClientMedicalProfile.fromJson(Map<String, dynamic>? json) {
    if (json == null) return const ClientMedicalProfile();
    return ClientMedicalProfile(
      dateOfBirth: json['date_of_birth'] as String?,
      gender: json['gender'] as String?,
      bloodType: json['blood_type'] as String?,
      height: json['height'] as String?,
      weight: json['weight'] as String?,
      address: json['address'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      postalCode: json['postal_code'] as String?,
      emergencyContactName: json['emergency_contact_name'] as String?,
      emergencyContactPhone: json['emergency_contact_phone'] as String?,
      emergencyContactRelationship:
          json['emergency_contact_relationship'] as String?,
    );
  }

  Map<String, dynamic> toUpsertPayload(String userId) => {
        'user_id': userId,
        if (dateOfBirth != null) 'date_of_birth': dateOfBirth,
        if (gender != null) 'gender': gender,
        if (bloodType != null) 'blood_type': bloodType,
        if (height != null) 'height': height,
        if (weight != null) 'weight': weight,
        if (address != null) 'address': address,
        if (city != null) 'city': city,
        if (state != null) 'state': state,
        if (postalCode != null) 'postal_code': postalCode,
        if (emergencyContactName != null)
          'emergency_contact_name': emergencyContactName,
        if (emergencyContactPhone != null)
          'emergency_contact_phone': emergencyContactPhone,
        if (emergencyContactRelationship != null)
          'emergency_contact_relationship': emergencyContactRelationship,
      };

  @override
  List<Object?> get props => [dateOfBirth, gender, city];
}

class AvailabilitySlot extends Equatable {
  const AvailabilitySlot({
    required this.id,
    required this.professionalId,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.isAvailable = true,
  });

  final String id;
  final String professionalId;
  final int dayOfWeek;
  final String startTime;
  final String endTime;
  final bool isAvailable;

  factory AvailabilitySlot.fromJson(Map<String, dynamic> json) {
    return AvailabilitySlot(
      id: json['id'] as String,
      professionalId: json['professional_id'] as String,
      dayOfWeek: json['day_of_week'] as int,
      startTime: json['start_time'] as String,
      endTime: json['end_time'] as String,
      isAvailable: json['is_available'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toInsertPayload(String professionalId) => {
        'professional_id': professionalId,
        'day_of_week': dayOfWeek,
        'start_time': startTime,
        'end_time': endTime,
        'is_available': isAvailable,
      };

  @override
  List<Object?> get props => [id, dayOfWeek, startTime];
}

class ProfessionalQualification extends Equatable {
  const ProfessionalQualification({
    required this.id,
    required this.degree,
    required this.institution,
    this.year,
    this.documentUrl,
    this.documentApproved,
  });

  final String id;
  final String degree;
  final String institution;
  final int? year;
  final String? documentUrl;
  final bool? documentApproved;

  factory ProfessionalQualification.fromJson(Map<String, dynamic> json) {
    return ProfessionalQualification(
      id: json['id'] as String,
      degree: json['degree'] as String? ?? '',
      institution: json['institution'] as String? ?? '',
      year: json['year'] as int?,
      documentUrl: json['document_url'] as String?,
      documentApproved: json['document_approved'] as bool?,
    );
  }

  @override
  List<Object?> get props => [id, degree, institution];
}

class GuestAppointmentItem extends Equatable {
  const GuestAppointmentItem({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.category,
    required this.state,
    required this.city,
    required this.appointmentDate,
    required this.appointmentTime,
    this.message,
    this.age,
    this.prescriptionHtml,
    this.prescriptionUpdatedAt,
    this.calendarInviteUrl,
    this.professionalId,
    this.professionalName,
    this.createdAt,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String category;
  final String state;
  final String city;
  final String appointmentDate;
  final String appointmentTime;
  final String? message;
  final int? age;
  final String? prescriptionHtml;
  final String? prescriptionUpdatedAt;
  final String? calendarInviteUrl;
  final String? professionalId;
  final String? professionalName;
  final DateTime? createdAt;

  String get patientName => '$firstName $lastName'.trim();

  String get specialistLabel =>
      professionalName?.trim().isNotEmpty == true ? professionalName! : 'Consultation';

  factory GuestAppointmentItem.fromJson(Map<String, dynamic> json) {
    return GuestAppointmentItem(
      id: json['id'] as String,
      firstName: json['first_name'] as String? ?? '',
      lastName: json['last_name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      category: json['category'] as String? ?? '',
      state: json['state'] as String? ?? '',
      city: json['city'] as String? ?? '',
      appointmentDate: json['appointment_date'] as String? ?? '',
      appointmentTime: json['appointment_time'] as String? ?? '',
      message: json['message'] as String?,
      age: json['age'] as int?,
      prescriptionHtml: json['prescription_html'] as String?,
      prescriptionUpdatedAt: json['prescription_updated_at'] as String?,
      calendarInviteUrl: json['calendar_invite_url'] as String?,
      professionalId: json['professional_id'] as String?,
      professionalName: json['professional_name'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
    );
  }

  @override
  List<Object?> get props => [id, appointmentDate, appointmentTime, professionalId];
}

class ClientBookingOrderItem extends Equatable {
  const ClientBookingOrderItem({
    required this.id,
    required this.orderNumber,
    required this.status,
    required this.amountPaise,
    required this.consultantName,
    required this.appointmentDate,
    required this.appointmentTime,
    required this.createdAt,
    this.failureReason,
    this.guestAppointmentId,
    this.professionalId,
  });

  final String id;
  final String orderNumber;
  final String status;
  final String? failureReason;
  final int amountPaise;
  final String consultantName;
  final String appointmentDate;
  final String appointmentTime;
  final DateTime createdAt;
  final String? guestAppointmentId;
  final String? professionalId;

  String get amountLabel {
    if (amountPaise <= 0) return 'Free';
    return '₹ ${(amountPaise / 100).toStringAsFixed(2)}';
  }

  factory ClientBookingOrderItem.fromJson(Map<String, dynamic> json) {
    final snapshot = json['booking_snapshot'];
    final snap = snapshot is Map
        ? Map<String, dynamic>.from(snapshot)
        : <String, dynamic>{};

    return ClientBookingOrderItem(
      id: json['id'] as String,
      orderNumber: json['order_number'] as String? ?? '',
      status: json['status'] as String? ?? 'pending',
      failureReason: json['failure_reason'] as String?,
      amountPaise: (json['amount_paise'] as num?)?.toInt() ?? 0,
      consultantName: json['consultant_name'] as String? ?? 'Consultation',
      appointmentDate: snap['date'] as String? ?? '',
      appointmentTime: snap['time'] as String? ?? '',
      createdAt: DateTime.parse(json['created_at'] as String),
      guestAppointmentId: json['guest_appointment_id'] as String?,
      professionalId: json['professional_id'] as String?,
    );
  }

  @override
  List<Object?> get props => [id, status, orderNumber];
}

class PlacePrediction extends Equatable {
  const PlacePrediction({required this.placeId, required this.description});

  final String placeId;
  final String description;

  factory PlacePrediction.fromJson(Map<String, dynamic> json) {
    return PlacePrediction(
      placeId: json['place_id'] as String? ?? json['placeId'] as String? ?? '',
      description: json['description'] as String? ?? '',
    );
  }

  @override
  List<Object?> get props => [placeId, description];
}
