import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_typography.dart';
import 'glass_card.dart';

/// Home header: avatar + greeting + notification bell.
class HomeGreetingHeader extends StatelessWidget {
  const HomeGreetingHeader({
    super.key,
    required this.name,
    this.imageUrl,
    this.onNotificationTap,
  });

  final String name;
  final String? imageUrl;
  final VoidCallback? onNotificationTap;

  String get _greeting {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          radius: 26,
          backgroundColor: AppColors.surfaceContainer,
          backgroundImage: imageUrl != null ? CachedNetworkImageProvider(imageUrl!) : null,
          child: imageUrl == null
              ? Text(
                  name.isNotEmpty ? name[0].toUpperCase() : '?',
                  style: AppTypography.textTheme.titleMedium!.copyWith(color: AppColors.brand),
                )
              : null,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Hello $name', style: AppTypography.pageTitle.copyWith(fontSize: 20)),
              Text(_greeting, style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
            ],
          ),
        ),
        Material(
          color: AppColors.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(AppRadii.md),
          elevation: 0,
          child: InkWell(
            onTap: onNotificationTap ?? () => context.push('/history'),
            borderRadius: BorderRadius.circular(AppRadii.md),
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadii.md),
                boxShadow: AppColors.softElevation,
              ),
              child: const Icon(Icons.notifications_none_rounded, color: AppColors.brand, size: 22),
            ),
          ),
        ),
      ],
    ).animate().fadeIn(duration: 400.ms).slideY(begin: 0.08, end: 0);
  }
}

/// Rounded pill search bar (Behance home).
class PillSearchBar extends StatelessWidget {
  const PillSearchBar({
    super.key,
    required this.hint,
    this.controller,
    this.onChanged,
    this.onTap,
    this.readOnly = false,
  });

  final String hint;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onTap;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      elevated: false,
      borderRadius: AppRadii.pill,
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      child: TextField(
        controller: controller,
        readOnly: readOnly,
        onTap: onTap,
        onChanged: onChanged,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle: AppTypography.body.copyWith(color: AppColors.onSurfaceVariant),
          prefixIcon: const Icon(Icons.search_rounded, color: AppColors.brand),
          suffixIcon: Icon(Icons.mic_none_rounded, color: AppColors.onSurfaceVariant.withValues(alpha: 0.7)),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
          filled: false,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    ).animate().fadeIn(delay: 80.ms, duration: 400.ms).slideY(begin: 0.06, end: 0);
  }
}

/// Blue gradient upcoming-visit hero card.
class UpcomingVisitHeroCard extends StatelessWidget {
  const UpcomingVisitHeroCard({
    super.key,
    required this.doctorName,
    required this.specialty,
    required this.dateLabel,
    required this.timeLabel,
    this.imageUrl,
    this.onTap,
  });

  final String doctorName;
  final String specialty;
  final String dateLabel;
  final String timeLabel;
  final String? imageUrl;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        child: Ink(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: AppColors.heroGradient,
            borderRadius: BorderRadius.circular(AppRadii.xl),
            boxShadow: AppColors.brandGlow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text('Upcoming Visit', style: AppTypography.bodyMedium.copyWith(color: Colors.white70)),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.videocam_rounded, color: Colors.white, size: 20),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: Colors.white24,
                    backgroundImage: imageUrl != null ? CachedNetworkImageProvider(imageUrl!) : null,
                    child: imageUrl == null
                        ? Text(
                            doctorName.isNotEmpty ? doctorName[0] : 'D',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                          )
                        : null,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          doctorName,
                          style: AppTypography.textTheme.titleMedium!.copyWith(color: Colors.white),
                        ),
                        Text(specialty, style: AppTypography.pageSubtitle.copyWith(color: Colors.white70, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _InfoPill(icon: Icons.calendar_today_rounded, label: 'Date', value: dateLabel)),
                  const SizedBox(width: 12),
                  Expanded(child: _InfoPill(icon: Icons.access_time_rounded, label: 'Time', value: timeLabel)),
                ],
              ),
            ],
          ),
        ),
      ),
    ).animate().fadeIn(delay: 120.ms, duration: 450.ms).scale(begin: const Offset(0.97, 0.97), end: const Offset(1, 1));
  }
}

class _InfoPill extends StatelessWidget {
  const _InfoPill({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(AppRadii.md),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white, size: 16),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: TextStyle(color: Colors.white.withValues(alpha: 0.75), fontSize: 10)),
                Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Horizontal specialty category chips.
class SpecialtyCategoryRow extends StatelessWidget {
  const SpecialtyCategoryRow({
    super.key,
    required this.categories,
    this.selected,
    this.onSelected,
  });

  final List<String> categories;
  final String? selected;
  final ValueChanged<String>? onSelected;

  static const _icons = [
    Icons.psychology_outlined,
    Icons.favorite_outline,
    Icons.hearing_outlined,
    Icons.medical_services_outlined,
    Icons.local_hospital_outlined,
    Icons.biotech_outlined,
  ];

  @override
  Widget build(BuildContext context) {
    if (categories.isEmpty) return const SizedBox.shrink();

    return SizedBox(
      height: 96,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 2),
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (_, i) {
          final cat = categories[i];
          final active = selected == cat;
          final icon = _icons[i % _icons.length];
          return GestureDetector(
            onTap: () => onSelected?.call(cat),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOutCubic,
              width: 72,
              child: Column(
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: active ? AppColors.brand : AppColors.surfaceContainerLowest,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: active ? AppColors.brand : AppColors.outline.withValues(alpha: 0.5),
                      ),
                      boxShadow: active ? AppColors.brandGlow : AppColors.softElevation,
                    ),
                    child: Icon(icon, color: active ? Colors.white : AppColors.brand, size: 24),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    cat,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    textAlign: TextAlign.center,
                    style: AppTypography.fieldLabel.copyWith(
                      fontSize: 9,
                      color: active ? AppColors.brand : AppColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ).animate(delay: (60 * i).ms).fadeIn(duration: 350.ms).slideX(begin: 0.1, end: 0);
        },
      ),
    );
  }
}

/// Popular doctor list row (Behance card).
class DoctorListCard extends StatelessWidget {
  const DoctorListCard({
    super.key,
    required this.name,
    required this.specialty,
    required this.fee,
    this.imageUrl,
    this.isVerified = false,
    this.onTap,
    this.animationIndex = 0,
  });

  final String name;
  final String specialty;
  final String fee;
  final String? imageUrl;
  final bool isVerified;
  final VoidCallback? onTap;
  final int animationIndex;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      onTap: onTap,
      borderRadius: AppRadii.xl,
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: isVerified ? Border.all(color: AppColors.brand, width: 2) : null,
            ),
            child: CircleAvatar(
              radius: 28,
              backgroundColor: AppColors.surfaceContainer,
              backgroundImage: imageUrl != null ? CachedNetworkImageProvider(imageUrl!) : null,
              child: imageUrl == null
                  ? Text(name.isNotEmpty ? name[0].toUpperCase() : '?', style: AppTypography.bodyMedium)
                  : null,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: AppTypography.textTheme.titleMedium),
                const SizedBox(height: 2),
                Text(specialty, style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
                const SizedBox(height: 4),
                Text(fee, style: AppTypography.statValue.copyWith(fontSize: 15, color: AppColors.brand)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              gradient: AppColors.brandGradient,
              borderRadius: BorderRadius.circular(14),
              boxShadow: AppColors.brandGlow,
            ),
            child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 18),
          ),
        ],
      ),
    )
        .animate(delay: (80 * animationIndex).ms)
        .fadeIn(duration: 400.ms)
        .slideX(begin: 0.04, end: 0, curve: Curves.easeOutCubic);
  }
}

/// Underline segmented tabs (Upcoming / Completed / Cancelled).
class SegmentedUnderlineTabs extends StatelessWidget {
  const SegmentedUnderlineTabs({
    super.key,
    required this.tabs,
    required this.selectedIndex,
    required this.onSelected,
  });

  final List<String> tabs;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < tabs.length; i++)
          Expanded(
            child: GestureDetector(
              onTap: () => onSelected(i),
              behavior: HitTestBehavior.opaque,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                padding: const EdgeInsets.symmetric(vertical: 12),
                decoration: BoxDecoration(
                  border: Border(
                    bottom: BorderSide(
                      color: i == selectedIndex ? AppColors.brand : Colors.transparent,
                      width: 2.5,
                    ),
                  ),
                ),
                child: Text(
                  tabs[i],
                  textAlign: TextAlign.center,
                  style: AppTypography.bodyMedium.copyWith(
                    color: i == selectedIndex ? AppColors.brand : AppColors.onSurfaceVariant,
                    fontWeight: i == selectedIndex ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Appointment card with date/time + action buttons.
class AppointmentListCard extends StatelessWidget {
  const AppointmentListCard({
    super.key,
    required this.doctorName,
    required this.specialty,
    required this.dateLabel,
    required this.timeLabel,
    this.imageUrl,
    this.primaryLabel = 'Change Schedule',
    this.secondaryLabel = 'Cancel',
    this.onPrimary,
    this.onSecondary,
    this.animationIndex = 0,
  });

  final String doctorName;
  final String specialty;
  final String dateLabel;
  final String timeLabel;
  final String? imageUrl;
  final String primaryLabel;
  final String secondaryLabel;
  final VoidCallback? onPrimary;
  final VoidCallback? onSecondary;
  final int animationIndex;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      borderRadius: AppRadii.xl,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundColor: AppColors.surfaceContainer,
                backgroundImage: imageUrl != null ? CachedNetworkImageProvider(imageUrl!) : null,
                child: imageUrl == null
                    ? Text(doctorName.isNotEmpty ? doctorName[0] : 'D')
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(doctorName, style: AppTypography.textTheme.titleMedium),
                    Text(specialty, style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.videocam_outlined, color: AppColors.brand, size: 18),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _Meta(icon: Icons.calendar_today_outlined, label: 'Date', value: dateLabel),
              ),
              Expanded(
                child: _Meta(icon: Icons.access_time_outlined, label: 'Time', value: timeLabel),
              ),
            ],
          ),
          if (onPrimary != null || onSecondary != null) ...[
            const SizedBox(height: 14),
            Row(
              children: [
                if (onSecondary != null)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: onSecondary,
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.onSurfaceVariant,
                        side: BorderSide(color: AppColors.outline.withValues(alpha: 0.8)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadii.pill)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: Text(secondaryLabel, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    ),
                  ),
                if (onSecondary != null && onPrimary != null) const SizedBox(width: 10),
                if (onPrimary != null)
                  Expanded(
                    child: DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: AppColors.brandGradient,
                        borderRadius: BorderRadius.circular(AppRadii.pill),
                        boxShadow: AppColors.brandGlow,
                      ),
                      child: Material(
                        color: Colors.transparent,
                        child: InkWell(
                          onTap: onPrimary,
                          borderRadius: BorderRadius.circular(AppRadii.pill),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            child: Text(
                              primaryLabel,
                              textAlign: TextAlign.center,
                              style: AppTypography.button.copyWith(fontSize: 13),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    )
        .animate(delay: (70 * animationIndex).ms)
        .fadeIn(duration: 400.ms)
        .slideY(begin: 0.05, end: 0);
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.label, required this.value});
  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.brand),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppTypography.fieldLabel.copyWith(fontSize: 9)),
            Text(value, style: AppTypography.bodyMedium.copyWith(fontSize: 13)),
          ],
        ),
      ],
    );
  }
}

/// Profile menu row (Behance profile screen).
class ProfileMenuTile extends StatelessWidget {
  const ProfileMenuTile({
    super.key,
    required this.icon,
    required this.label,
    this.onTap,
    this.trailing,
    this.animationIndex = 0,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;
  final Widget? trailing;
  final int animationIndex;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        onTap: onTap,
        borderRadius: AppRadii.xl,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        elevated: false,
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.brand, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(child: Text(label, style: AppTypography.bodyMedium)),
            trailing ?? const Icon(Icons.chevron_right_rounded, color: AppColors.onSurfaceVariant),
          ],
        ),
      ),
    )
        .animate(delay: (60 * animationIndex).ms)
        .fadeIn(duration: 380.ms)
        .slideX(begin: 0.03, end: 0);
  }
}

/// Stat chip for doctor detail (Experience / Rating / Patients).
class StatHighlightCard extends StatelessWidget {
  const StatHighlightCard({
    super.key,
    required this.value,
    required this.label,
  });

  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GlassCard(
        elevated: false,
        borderRadius: AppRadii.lg,
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        child: Column(
          children: [
            Text(value, style: AppTypography.statValue.copyWith(fontSize: 18)),
            const SizedBox(height: 4),
            Text(
              label,
              textAlign: TextAlign.center,
              style: AppTypography.fieldLabel.copyWith(fontSize: 9),
            ),
          ],
        ),
      ),
    );
  }
}

/// Booking step progress bar.
class BookingStepBar extends StatelessWidget {
  const BookingStepBar({super.key, required this.step, this.total = 3});

  final int step;
  final int total;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(total, (i) {
        final active = i <= step;
        return Expanded(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 280),
            height: 5,
            margin: EdgeInsets.only(right: i < total - 1 ? 8 : 0),
            decoration: BoxDecoration(
              gradient: active ? AppColors.brandGradient : null,
              color: active ? null : AppColors.outline.withValues(alpha: 0.4),
              borderRadius: BorderRadius.circular(AppRadii.pill),
            ),
          ),
        );
      }),
    );
  }
}

/// Horizontal scrolling date oval chips.
class DateOvalScroller extends StatelessWidget {
  const DateOvalScroller({
    super.key,
    required this.dates,
    required this.selected,
    required this.onSelected,
  });

  final List<DateTime> dates;
  final DateTime? selected;
  final ValueChanged<DateTime> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 88,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: dates.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (_, i) {
          final d = dates[i];
          final isSelected = selected != null &&
              d.year == selected!.year &&
              d.month == selected!.month &&
              d.day == selected!.day;
          final dayLabel = const ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][d.weekday - 1];

          return GestureDetector(
            onTap: () => onSelected(d),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              width: 56,
              decoration: BoxDecoration(
                gradient: isSelected ? AppColors.brandGradient : null,
                color: isSelected ? null : AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(28),
                border: Border.all(
                  color: isSelected ? Colors.transparent : AppColors.outline.withValues(alpha: 0.5),
                ),
                boxShadow: isSelected ? AppColors.brandGlow : AppColors.softElevation,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    '${d.day}',
                    style: TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 18,
                      color: isSelected ? Colors.white : AppColors.onSurface,
                    ),
                  ),
                  Text(
                    dayLabel,
                    style: TextStyle(
                      fontSize: 11,
                      color: isSelected ? Colors.white70 : AppColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

/// Time slot pill selector.
class TimeSlotRow extends StatelessWidget {
  const TimeSlotRow({
    super.key,
    required this.times,
    required this.selected,
    required this.onSelected,
  });

  final List<String> times;
  final String? selected;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: times.map((t) {
        final isSelected = selected == t;
        return GestureDetector(
          onTap: () => onSelected(t),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            decoration: BoxDecoration(
              gradient: isSelected ? AppColors.brandGradient : null,
              color: isSelected ? null : AppColors.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(AppRadii.pill),
              border: Border.all(
                color: isSelected ? Colors.transparent : AppColors.outline.withValues(alpha: 0.5),
              ),
              boxShadow: isSelected ? AppColors.brandGlow : null,
            ),
            child: Text(
              t,
              style: AppTypography.bodyMedium.copyWith(
                color: isSelected ? Colors.white : AppColors.onSurface,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

/// Package / consultation type radio row.
class PackageOptionTile extends StatelessWidget {
  const PackageOptionTile({
    super.key,
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: GlassCard(
        onTap: onTap,
        borderRadius: AppRadii.xl,
        gradientBorder: selected,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppColors.brand),
            ),
            const SizedBox(width: 14),
            Expanded(child: Text(label, style: AppTypography.bodyMedium)),
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_off,
              color: selected ? AppColors.brand : AppColors.onSurfaceVariant,
            ),
          ],
        ),
      ),
    );
  }
}

/// Two-option toggle (For Myself / Other).
class DualChoiceToggle extends StatelessWidget {
  const DualChoiceToggle({
    super.key,
    required this.leftLabel,
    required this.rightLabel,
    required this.leftSelected,
    required this.onLeft,
    required this.onRight,
  });

  final String leftLabel;
  final String rightLabel;
  final bool leftSelected;
  final VoidCallback onLeft;
  final VoidCallback onRight;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ChoiceCard(label: leftLabel, selected: leftSelected, onTap: onLeft),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _ChoiceCard(label: rightLabel, selected: !leftSelected, onTap: onRight),
        ),
      ],
    );
  }
}

class _ChoiceCard extends StatelessWidget {
  const _ChoiceCard({required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      onTap: onTap,
      gradientBorder: selected,
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Column(
        children: [
          Icon(
            selected ? Icons.radio_button_checked : Icons.radio_button_off,
            color: selected ? AppColors.brand : AppColors.onSurfaceVariant,
          ),
          const SizedBox(height: 8),
          Text(label, style: AppTypography.bodyMedium),
        ],
      ),
    );
  }
}
