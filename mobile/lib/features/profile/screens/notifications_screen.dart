import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final _toggles = <String, bool>{
    'appointment_reminders': true,
    'medication_alerts': false,
    'lab_results': true,
    'health_check_reminders': false,
    'doctor_availability': true,
    'insurance_updates': true,
    'feature_updates': false,
  };

  static const _items = [
    _NotificationItem(
      key: 'appointment_reminders',
      icon: Icons.event_outlined,
      title: 'Appointment reminders',
      subtitle: 'Upcoming appointment alerts',
    ),
    _NotificationItem(
      key: 'medication_alerts',
      icon: Icons.medication_outlined,
      title: 'Medication alerts',
      subtitle: 'Time to take medication',
    ),
    _NotificationItem(
      key: 'lab_results',
      icon: Icons.science_outlined,
      title: 'Lab results',
      subtitle: 'New lab results available',
    ),
    _NotificationItem(
      key: 'health_check_reminders',
      icon: Icons.favorite_outline,
      title: 'Health check reminders',
      subtitle: 'Routine health check reminders',
    ),
    _NotificationItem(
      key: 'doctor_availability',
      icon: Icons.person_search_outlined,
      title: 'Doctor availability',
      subtitle: 'Doctor has open slots',
    ),
    _NotificationItem(
      key: 'insurance_updates',
      icon: Icons.shield_outlined,
      title: 'Insurance updates',
      subtitle: 'Insurance changes alert',
    ),
    _NotificationItem(
      key: 'feature_updates',
      icon: Icons.new_releases_outlined,
      title: 'Feature updates',
      subtitle: 'New app features alert',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfaceAlt,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.outline.withValues(alpha: 0.4)),
            ),
            child: const Icon(Icons.arrow_back_rounded, size: 20),
          ),
        ),
        title: Text('Notifications', style: AppTypography.pageTitle.copyWith(fontSize: 20)),
        centerTitle: true,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(20),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (_, i) {
          final item = _items[i];
          return Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppRadii.lg),
              border: Border.all(color: AppColors.outline.withValues(alpha: 0.35)),
            ),
            child: SwitchListTile(
              secondary: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(item.icon, color: AppColors.brand, size: 20),
              ),
              title: Text(item.title, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
              subtitle: Text(item.subtitle, style: AppTypography.pageSubtitle.copyWith(fontSize: 12)),
              value: _toggles[item.key] ?? false,
              activeThumbColor: AppColors.brand,
              onChanged: (v) => setState(() => _toggles[item.key] = v),
            ),
          );
        },
      ),
    );
  }
}

class _NotificationItem {
  const _NotificationItem({
    required this.key,
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final String key;
  final IconData icon;
  final String title;
  final String subtitle;
}
