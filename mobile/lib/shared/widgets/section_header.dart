import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import 'gradient_text.dart';

class SectionHeader extends StatelessWidget {
  const SectionHeader({
    super.key,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
    this.gradientTitle = true,
    this.lightOnDark = false,
  });

  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool gradientTitle;
  final bool lightOnDark;

  @override
  Widget build(BuildContext context) {
    final titleStyle = AppTypography.pageTitle.copyWith(fontSize: 22);
    final subtitleStyle = lightOnDark
        ? AppTypography.pageSubtitle.copyWith(color: Colors.white.withValues(alpha: 0.85))
        : AppTypography.pageSubtitle;

    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (gradientTitle && !lightOnDark)
                  GradientText(title, style: titleStyle)
                else
                  Text(
                    title,
                    style: lightOnDark ? titleStyle.copyWith(color: Colors.white) : titleStyle,
                  ),
                if (subtitle != null) ...[
                  const SizedBox(height: 4),
                  Text(subtitle!, style: subtitleStyle),
                ],
              ],
            ),
          ),
          if (actionLabel != null && onAction != null)
            TextButton(
              onPressed: onAction,
              child: Text(
                actionLabel!,
                style: AppTypography.bodyMedium.copyWith(
                  color: lightOnDark ? Colors.white : AppColors.brand,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class StatTile extends StatelessWidget {
  const StatTile({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
  });

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.surfaceContainerLowest.withValues(alpha: 0.9),
            AppColors.surfaceContainerLow.withValues(alpha: 0.75),
          ],
        ),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withValues(alpha: 0.55)),
        boxShadow: AppColors.softElevation,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              gradient: AppColors.brandGradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: AppColors.brand.withValues(alpha: 0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: Icon(icon, color: AppColors.onBrand, size: 20),
          ),
          const SizedBox(height: 6),
          Text(label.toUpperCase(), style: AppTypography.fieldLabel),
          const SizedBox(height: 2),
          Text(value, style: AppTypography.statValue),
        ],
      ),
    );
  }
}

class VerifiedBadge extends StatelessWidget {
  const VerifiedBadge({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.brand.withValues(alpha: 0.14),
            AppColors.brandBright.withValues(alpha: 0.1),
          ],
        ),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.brand.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.verified, size: 14, color: AppColors.brand),
          const SizedBox(width: 4),
          Text(
            'VERIFIED',
            style: AppTypography.fieldLabel.copyWith(color: AppColors.brand),
          ),
        ],
      ),
    );
  }
}
