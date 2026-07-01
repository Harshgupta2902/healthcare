class RegistrationSettings {
  const RegistrationSettings({
    required this.emailOtpEnabled,
    required this.otpLength,
    required this.otpExpiryMinutes,
    required this.resendCooldownSeconds,
  });

  final bool emailOtpEnabled;
  final int otpLength;
  final int otpExpiryMinutes;
  final int resendCooldownSeconds;

  factory RegistrationSettings.defaults() => const RegistrationSettings(
        emailOtpEnabled: false,
        otpLength: 6,
        otpExpiryMinutes: 10,
        resendCooldownSeconds: 60,
      );

  factory RegistrationSettings.fromJson(Map<String, dynamic> json) {
    return RegistrationSettings(
      emailOtpEnabled: json['emailOtpEnabled'] as bool? ?? false,
      otpLength: json['otpLength'] as int? ?? 6,
      otpExpiryMinutes: json['otpExpiryMinutes'] as int? ?? 10,
      resendCooldownSeconds: json['resendCooldownSeconds'] as int? ?? 60,
    );
  }
}

class RegisterOtpSentResult {
  const RegisterOtpSentResult({
    required this.expiresInMinutes,
    required this.otpLength,
    required this.resendCooldownSeconds,
  });

  final int expiresInMinutes;
  final int otpLength;
  final int resendCooldownSeconds;

  factory RegisterOtpSentResult.fromJson(Map<String, dynamic> json) {
    return RegisterOtpSentResult(
      expiresInMinutes: json['expiresInMinutes'] as int? ?? 10,
      otpLength: json['otpLength'] as int? ?? 6,
      resendCooldownSeconds: json['resendCooldownSeconds'] as int? ?? 60,
    );
  }
}
