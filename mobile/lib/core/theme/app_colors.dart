import 'package:flutter/material.dart';

/// HealthHere lp-* tokens from web `globals.css`.
abstract final class AppColors {
  static const surface = Color(0xFFF8F9FF);
  static const onSurface = Color(0xFF0B1C30);
  static const onSurfaceVariant = Color(0xFF44474D);
  static const brand = Color(0xFF0059BB);
  static const brandBright = Color(0xFF0070EA);
  static const onBrand = Color(0xFFFFFFFF);
  static const surfaceContainerLow = Color(0xFFEFF4FF);
  static const surfaceContainer = Color(0xFFE5EEFF);
  static const surfaceContainerLowest = Color(0xFFFFFFFF);
  static const outline = Color(0xFFC5C6CD);
  static const ctaBackground = Color(0xFF000000);
  static const error = Color(0xFFEF4444);
  static const focusRing = Color(0xFF4EA4FF);
  static const border = Color(0xFFE4E9F2);

  static const brandGradient = LinearGradient(
    colors: [brand, brandBright],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );
}
