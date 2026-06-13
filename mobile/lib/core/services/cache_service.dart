import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

final cacheServiceProvider = Provider<CacheService>((ref) {
  return CacheService.instance;
});

/// Hive-backed offline cache for dashboard reads.
class CacheService {
  CacheService._();
  static final CacheService instance = CacheService._();

  static const _boxName = 'healthhere_cache';
  static const _clientDashboardKey = 'client_dashboard';
  static const _proDashboardKey = 'professional_dashboard';

  Box<String>? _box;

  Future<void> init() async {
    await Hive.initFlutter();
    _box = await Hive.openBox<String>(_boxName);
  }

  Box<String> get box {
    final b = _box;
    if (b == null) throw StateError('CacheService not initialized');
    return b;
  }

  Future<void> putJson(String key, Map<String, dynamic> value) async {
    await box.put(key, jsonEncode(value));
  }

  Map<String, dynamic>? getJson(String key) {
    final raw = box.get(key);
    if (raw == null) return null;
    try {
      return Map<String, dynamic>.from(jsonDecode(raw) as Map);
    } catch (_) {
      return null;
    }
  }

  Future<void> clearClientDashboard() => box.delete(_clientDashboardKey);
  Future<void> clearProfessionalDashboard() => box.delete(_proDashboardKey);

  Future<void> cacheClientDashboard(Map<String, dynamic> data) =>
      putJson(_clientDashboardKey, data);

  Map<String, dynamic>? getCachedClientDashboard() => getJson(_clientDashboardKey);

  Future<void> cacheProfessionalDashboard(Map<String, dynamic> data) =>
      putJson(_proDashboardKey, data);

  Map<String, dynamic>? getCachedProfessionalDashboard() =>
      getJson(_proDashboardKey);
}
