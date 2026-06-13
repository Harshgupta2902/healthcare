import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app.dart';
import 'core/config/env.dart';
import 'core/services/cache_service.dart';
import 'core/supabase/supabase_client.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await CacheService.instance.init();

  if (Env.isConfigured) {
    await initializeSupabase();
  }

  runApp(const ProviderScope(child: HealthHereApp()));
}
