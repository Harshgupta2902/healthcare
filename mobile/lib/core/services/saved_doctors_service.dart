import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final savedDoctorsServiceProvider = Provider<SavedDoctorsService>((ref) {
  return SavedDoctorsService();
});

/// Local persistence for favorited doctors (Saved tab in My Doctor).
class SavedDoctorsService {
  static const _key = 'saved_doctor_ids';

  Future<Set<String>> getSavedIds() async {
    final prefs = await SharedPreferences.getInstance();
    return (prefs.getStringList(_key) ?? []).toSet();
  }

  Future<bool> isSaved(String doctorId) async {
    final ids = await getSavedIds();
    return ids.contains(doctorId);
  }

  Future<void> toggle(String doctorId) async {
    final prefs = await SharedPreferences.getInstance();
    final ids = (prefs.getStringList(_key) ?? []).toSet();
    if (ids.contains(doctorId)) {
      ids.remove(doctorId);
    } else {
      ids.add(doctorId);
    }
    await prefs.setStringList(_key, ids.toList());
  }

  Future<void> save(String doctorId) async {
    final prefs = await SharedPreferences.getInstance();
    final ids = (prefs.getStringList(_key) ?? []).toSet()..add(doctorId);
    await prefs.setStringList(_key, ids.toList());
  }

  Future<void> remove(String doctorId) async {
    final prefs = await SharedPreferences.getInstance();
    final ids = (prefs.getStringList(_key) ?? []).toSet()..remove(doctorId);
    await prefs.setStringList(_key, ids.toList());
  }
}
