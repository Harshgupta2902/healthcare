import 'package:flutter/material.dart';

/// Behance Healthcare Doctor Appointment palette + HealthHere tokens.
abstract final class AppColors {
  // Behance reference swatches
  static const brand = Color(0xFF3775E0);
  static const brandBright = Color(0xFF4B8AFF);
  static const brandDeep = Color(0xFF2D5FCC);

  static const surface = Color(0xFFF2F8FF);
  static const surfaceAlt = Color(0xFFF7F7F7);
  static const surfaceContainerLowest = Color(0xFFFFFFFF);
  static const surfaceContainerLow = Color(0xFFF2F8FF);
  static const surfaceContainer = Color(0xFFE8F1FF);

  static const onSurface = Color(0xFF121027);
  static const onSurfaceVariant = Color(0xFF9694A0);
  static const onBrand = Color(0xFFFFFFFF);

  static const outline = Color(0xFFE0E0E0);
  static const border = Color(0xFFE0E0E0);
  static const ctaBackground = Color(0xFF121027);
  static const error = Color(0xFFE57373);
  static const focusRing = Color(0xFF64B5F6);
  static const success = Color(0xFFA5D6A7);

  static const tealSoft = Color(0xFF5EC4C4);
  static const violetSoft = Color(0xFFCE93D8);
  static const skyGlow = Color(0xFF64B5F6);

  static const brandGradient = LinearGradient(
    colors: [brandBright, brand],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const brandGradientVertical = LinearGradient(
    colors: [brandBright, brandDeep],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );

  static const heroGradient = LinearGradient(
    colors: [Color(0xFF4B8AFF), Color(0xFF3775E0), Color(0xFF2D5FCC)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const surfaceMesh = LinearGradient(
    colors: [surface, surfaceContainerLow, surface],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    stops: [0, 0.5, 1],
  );

  static const glassFill = Color(0xD9FFFFFF);
  static const glassBorder = Color(0x66FFFFFF);

  static List<BoxShadow> get brandGlow => [
        BoxShadow(
          color: brand.withValues(alpha: 0.28),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ];

  static List<BoxShadow> get softElevation => [
        BoxShadow(
          color: onSurface.withValues(alpha: 0.05),
          blurRadius: 16,
          offset: const Offset(0, 6),
        ),
      ];

  static List<BoxShadow> get cardShadow => [
        BoxShadow(
          color: onSurface.withValues(alpha: 0.04),
          blurRadius: 24,
          offset: const Offset(0, 8),
        ),
      ];
}
