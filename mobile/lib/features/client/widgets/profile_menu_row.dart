import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

/// Profile hub list row — reference: circular icon chip, label, chevron.
class ProfileMenuRow extends StatelessWidget {
  const ProfileMenuRow({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.iconColor = AppColors.brand,
    this.destructive = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color iconColor;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: destructive
                      ? AppColors.error.withValues(alpha: 0.08)
                      : const Color(0xFFE8F4FC),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  size: 22,
                  color: destructive ? AppColors.error : iconColor,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Text(
                  label,
                  style: AppTypography.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                    color: destructive ? AppColors.error : AppColors.onSurface,
                  ),
                ),
              ),
              Icon(
                Icons.chevron_right_rounded,
                color: AppColors.onSurfaceVariant.withValues(alpha: 0.6),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ProfileMenuDivider extends StatelessWidget {
  const ProfileMenuDivider({super.key});

  @override
  Widget build(BuildContext context) {
    return Divider(
      height: 1,
      thickness: 1,
      indent: 80,
      color: AppColors.outline.withValues(alpha: 0.25),
    );
  }
}
