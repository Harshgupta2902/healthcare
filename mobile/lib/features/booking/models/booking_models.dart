import 'package:equatable/equatable.dart';

class BookableDatesResult extends Equatable {
  const BookableDatesResult({
    required this.dates,
    required this.availableDayLabels,
    required this.advanceWeeks,
    required this.hasAvailability,
    required this.hasValidSlotWindows,
  });

  final List<String> dates;
  final String availableDayLabels;
  final int advanceWeeks;
  final bool hasAvailability;
  final bool hasValidSlotWindows;

  factory BookableDatesResult.fromJson(Map<String, dynamic> json) {
    return BookableDatesResult(
      dates: (json['dates'] as List?)?.map((e) => e.toString()).toList() ?? [],
      availableDayLabels: json['availableDayLabels'] as String? ?? '',
      advanceWeeks: json['advanceWeeks'] as int? ?? 2,
      hasAvailability: json['hasAvailability'] as bool? ?? false,
      hasValidSlotWindows: json['hasValidSlotWindows'] as bool? ?? false,
    );
  }

  @override
  List<Object?> get props => [dates, availableDayLabels, advanceWeeks];
}

class BookableSlot extends Equatable {
  const BookableSlot({
    required this.slotStartAt,
    required this.slotEndAt,
    required this.timeValue,
    required this.label,
    required this.state,
  });

  final String slotStartAt;
  final String slotEndAt;
  final String timeValue;
  final String label;
  final String state;

  bool get isAvailable => state == 'available';

  factory BookableSlot.fromJson(Map<String, dynamic> json) {
    return BookableSlot(
      slotStartAt: json['slotStartAt'] as String? ?? '',
      slotEndAt: json['slotEndAt'] as String? ?? '',
      timeValue: json['timeValue'] as String? ?? '',
      label: json['label'] as String? ?? '',
      state: json['state'] as String? ?? 'booked',
    );
  }

  @override
  List<Object?> get props => [slotStartAt, timeValue, state];
}

class AvailableSlotsResult extends Equatable {
  const AvailableSlotsResult({
    required this.slots,
    this.emptyReason,
  });

  final List<BookableSlot> slots;
  final String? emptyReason;

  factory AvailableSlotsResult.fromJson(Map<String, dynamic> json) {
    return AvailableSlotsResult(
      slots: (json['slots'] as List?)
              ?.map((e) => BookableSlot.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList() ??
          [],
      emptyReason: json['emptyReason'] as String?,
    );
  }

  @override
  List<Object?> get props => [slots, emptyReason];
}

class SlotHold extends Equatable {
  const SlotHold({
    required this.holdId,
    required this.expiresAt,
    required this.slotStartAt,
    required this.date,
    required this.time,
  });

  final String holdId;
  final String expiresAt;
  final String slotStartAt;
  final String date;
  final String time;

  factory SlotHold.fromJson(Map<String, dynamic> json) {
    return SlotHold(
      holdId: json['holdId'] as String? ?? '',
      expiresAt: json['expiresAt'] as String? ?? '',
      slotStartAt: json['slotStartAt'] as String? ?? '',
      date: json['date'] as String? ?? '',
      time: json['time'] as String? ?? '',
    );
  }

  @override
  List<Object?> get props => [holdId, expiresAt, date, time];
}

class BookingSnapshot extends Equatable {
  const BookingSnapshot({
    required this.firstName,
    required this.lastName,
    required this.age,
    required this.phone,
    required this.email,
    required this.category,
    required this.state,
    required this.city,
    required this.date,
    required this.time,
    this.message = '',
  });

  final String firstName;
  final String lastName;
  final int age;
  final String phone;
  final String email;
  final String category;
  final String state;
  final String city;
  final String date;
  final String time;
  final String message;

  Map<String, dynamic> toJson() => {
        'firstName': firstName,
        'lastName': lastName,
        'age': age,
        'phone': phone,
        'email': email,
        'category': category,
        'state': state,
        'city': city,
        'date': date,
        'time': time,
        'message': message,
      };

  factory BookingSnapshot.fromJson(Map<String, dynamic> json) {
    return BookingSnapshot(
      firstName: json['firstName'] as String? ?? '',
      lastName: json['lastName'] as String? ?? '',
      age: json['age'] as int? ?? 0,
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String? ?? '',
      category: json['category'] as String? ?? '',
      state: json['state'] as String? ?? '',
      city: json['city'] as String? ?? '',
      date: json['date'] as String? ?? '',
      time: json['time'] as String? ?? '',
      message: json['message'] as String? ?? '',
    );
  }

  String get patientLabel => '$firstName $lastName'.trim();

  @override
  List<Object?> get props => [firstName, lastName, date, time];
}

class CreateBookingOrderResult extends Equatable {
  const CreateBookingOrderResult({
    required this.orderId,
    required this.orderNumber,
    required this.amountPaise,
    required this.paymentProvider,
    this.razorpayKeyId,
  });

  final String orderId;
  final String orderNumber;
  final int amountPaise;
  final String paymentProvider;
  final String? razorpayKeyId;

  factory CreateBookingOrderResult.fromJson(Map<String, dynamic> json) {
    return CreateBookingOrderResult(
      orderId: json['orderId'] as String? ?? '',
      orderNumber: json['orderNumber'] as String? ?? '',
      amountPaise: json['amountPaise'] as int? ?? 0,
      paymentProvider: json['paymentProvider'] as String? ?? 'razorpay',
      razorpayKeyId: json['razorpayKeyId'] as String?,
    );
  }

  @override
  List<Object?> get props => [orderId, amountPaise];
}

class RazorpayCheckoutPayload extends Equatable {
  const RazorpayCheckoutPayload({
    required this.orderId,
    required this.amount,
    required this.currency,
  });

  final String orderId;
  final int amount;
  final String currency;

  factory RazorpayCheckoutPayload.fromJson(Map<String, dynamic> json) {
    return RazorpayCheckoutPayload(
      orderId: json['orderId'] as String? ?? '',
      amount: json['amount'] as int? ?? 0,
      currency: json['currency'] as String? ?? 'INR',
    );
  }

  @override
  List<Object?> get props => [orderId, amount];
}

class PaymentFulfillmentResult extends Equatable {
  const PaymentFulfillmentResult({
    required this.orderId,
    required this.guestAppointmentId,
    this.transactionId,
  });

  final String orderId;
  final String guestAppointmentId;
  final String? transactionId;

  factory PaymentFulfillmentResult.fromJson(Map<String, dynamic> json) {
    return PaymentFulfillmentResult(
      orderId: json['orderId'] as String? ?? '',
      guestAppointmentId: json['guestAppointmentId'] as String? ?? '',
      transactionId: json['transactionId'] as String?,
    );
  }

  @override
  List<Object?> get props => [orderId, guestAppointmentId];
}

/// Draft passed from booking form → checkout.
class BookingDraft extends Equatable {
  const BookingDraft({
    required this.professionalUserId,
    required this.snapshot,
    required this.hold,
    this.consultantName,
    this.consultantSpecialization,
    this.consultantImageUrl,
    this.consultationFeePaise,
  });

  final String professionalUserId;
  final BookingSnapshot snapshot;
  final SlotHold hold;
  final String? consultantName;
  final String? consultantSpecialization;
  final String? consultantImageUrl;
  final int? consultationFeePaise;

  @override
  List<Object?> get props => [professionalUserId, hold.holdId];
}
