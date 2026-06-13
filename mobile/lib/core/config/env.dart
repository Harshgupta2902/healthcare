/// Runtime configuration via `--dart-define`.
///
/// Example:
/// `flutter run --dart-define=SUPABASE_URL=https://xxx.supabase.co`
class Env {
  Env._();

  static const supabaseUrl = String.fromEnvironment('SUPABASE_URL');
  static const supabaseAnonKey = String.fromEnvironment('SUPABASE_ANON_KEY');
  static const apiBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const webBaseUrl = String.fromEnvironment('WEB_BASE_URL');

  static bool get isConfigured =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

  static String get adminWebUrl {
    final base = webBaseUrl.isNotEmpty ? webBaseUrl : apiBaseUrl;
    if (base.isEmpty) return 'https://healthhere.com/application/enter';
    return '${base.replaceAll(RegExp(r'/$'), '')}/application/enter';
  }
}
