import 'dart:convert';

import 'package:crypto/crypto.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

/// Stable per-install device identifier for API rate limits (64-char hex SHA-256).
class DeviceHashService {
  DeviceHashService._();
  static const _prefsKey = 'healthhere_device_install_id';

  static Future<String> getDeviceHash() async {
    final prefs = await SharedPreferences.getInstance();
    var installId = prefs.getString(_prefsKey);
    if (installId == null || installId.isEmpty) {
      installId = const Uuid().v4();
      await prefs.setString(_prefsKey, installId);
    }

    final platform = defaultTargetPlatform.name;
    final payload = utf8.encode('healthhere|$platform|$installId');
    return sha256.convert(payload).toString();
  }
}
