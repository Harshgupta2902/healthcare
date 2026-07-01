import 'package:flutter_dotenv/flutter_dotenv.dart';

/// Runtime configuration via `.env.mobile`.
class Env {
  Env._();

  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';
  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? '';
  static String get webBaseUrl => dotenv.env['WEB_BASE_URL'] ?? '';
  static String get razorpayKeyId => dotenv.env['RAZORPAY_KEY_ID'] ?? '';

  static bool get isConfigured =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

  static String get adminWebUrl {
    final base = webBaseUrl.isNotEmpty ? webBaseUrl : apiBaseUrl;
    if (base.isEmpty) return 'https://healthhere.com/application/enter';
    return '${base.replaceAll(RegExp(r'/$'), '')}/application/enter';
  }
}
