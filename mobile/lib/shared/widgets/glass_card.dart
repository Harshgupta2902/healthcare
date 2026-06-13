import 'dart:ui';

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';

class GlassCard extends StatelessWidget {
  const GlassCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
    this.borderRadius = AppRadii.xl,
    this.gradientBorder = false,
    this.elevated = true,
  });

  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;
  final double borderRadius;
  final bool gradientBorder;
  final bool elevated;

  @override
  Widget build(BuildContext context) {
    final inner = ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
        child: Container(
          width: double.infinity,
          padding: padding,
          decoration: BoxDecoration(
            color: AppColors.glassFill,
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: gradientBorder
                  ? AppColors.brand.withValues(alpha: 0.25)
                  : AppColors.glassBorder,
            ),
            boxShadow: elevated ? AppColors.cardShadow : null,
          ),
          child: child,
        ),
      ),
    );

    final card = gradientBorder
        ? DecoratedBox(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(borderRadius + 1),
              gradient: AppColors.brandGradient,
              boxShadow: elevated ? AppColors.brandGlow : null,
            ),
            child: Padding(
              padding: const EdgeInsets.all(1.2),
              child: inner,
            ),
          )
        : inner;

    if (onTap == null) return card;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(borderRadius),
        child: card,
      ),
    );
  }
}
