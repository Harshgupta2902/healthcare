import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/registration_settings.dart';

final registrationSettingsProvider =
    FutureProvider<RegistrationSettings>((ref) async {
  return RegistrationSettingsService.load();
});

/// Reads registration flags from Supabase RPC (`get_registration_settings`).
class RegistrationSettingsService {
  RegistrationSettingsService._();

  static const int otpLength = 6;
  static const int otpExpiryMinutes = 10;

  static Future<RegistrationSettings> load() async {
    try {
      final settings =
          await Supabase.instance.client.rpc('get_registration_settings');
      if (settings is Map) {
        final parsed = RegistrationSettings(
          emailOtpEnabled: settings['email_otp_enabled'] as bool? ?? false,
          otpLength: otpLength,
          otpExpiryMinutes: otpExpiryMinutes,
          resendCooldownSeconds:
              settings['resend_cooldown_seconds'] as int? ?? 60,
        );
        await _cache(parsed);
        return parsed;
      }
    } catch (_) {
      // Fall through to cache.
    }

    final cached = await _readCache();
    return cached ?? RegistrationSettings.defaults();
  }

  static Future<void> _cache(RegistrationSettings settings) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('email_otp_enabled', settings.emailOtpEnabled);
    await prefs.setInt('otp_length', settings.otpLength);
    await prefs.setInt('otp_expiry_minutes', settings.otpExpiryMinutes);
    await prefs.setInt(
      'resend_cooldown_seconds',
      settings.resendCooldownSeconds,
    );
  }

  static Future<RegistrationSettings?> _readCache() async {
    final prefs = await SharedPreferences.getInstance();
    if (!prefs.containsKey('email_otp_enabled')) return null;
    return RegistrationSettings(
      emailOtpEnabled: prefs.getBool('email_otp_enabled') ?? false,
      otpLength: prefs.getInt('otp_length') ?? otpLength,
      otpExpiryMinutes: prefs.getInt('otp_expiry_minutes') ?? otpExpiryMinutes,
      resendCooldownSeconds: prefs.getInt('resend_cooldown_seconds') ?? 60,
    );
  }
}
