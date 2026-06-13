import 'dart:math' as math;
import 'dart:ui';

import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

/// Flowing mesh background with soft gradient orbs (web dashboard aesthetic).
class AmbientBackground extends StatefulWidget {
  const AmbientBackground({
    super.key,
    required this.child,
    this.animate = true,
    this.intensity = 1,
  });

  final Widget child;
  final bool animate;
  final double intensity;

  @override
  State<AmbientBackground> createState() => _AmbientBackgroundState();
}

class _AmbientBackgroundState extends State<AmbientBackground>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 12),
    );
    if (widget.animate) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final t = widget.animate ? _controller.value : 0.35;
        return Stack(
          fit: StackFit.expand,
          children: [
            const DecoratedBox(
              decoration: BoxDecoration(gradient: AppColors.surfaceMesh),
            ),
            _Orb(
              color: AppColors.brandBright.withValues(alpha: 0.18 * widget.intensity),
              size: 280,
              top: -60 + math.sin(t * math.pi * 2) * 18,
              left: -80 + math.cos(t * math.pi * 2) * 12,
            ),
            _Orb(
              color: AppColors.tealSoft.withValues(alpha: 0.14 * widget.intensity),
              size: 220,
              top: 120 + math.cos(t * math.pi * 2) * 22,
              right: -70,
            ),
            _Orb(
              color: AppColors.violetSoft.withValues(alpha: 0.12 * widget.intensity),
              size: 200,
              bottom: 80 + math.sin(t * math.pi * 2 + 1) * 16,
              left: 40,
            ),
            _Orb(
              color: AppColors.skyGlow.withValues(alpha: 0.1 * widget.intensity),
              size: 160,
              bottom: -40,
              right: 30 + math.cos(t * math.pi * 2) * 10,
            ),
            child!,
          ],
        );
      },
      child: widget.child,
    );
  }
}

class _Orb extends StatelessWidget {
  const _Orb({
    required this.color,
    required this.size,
    this.top,
    this.left,
    this.right,
    this.bottom,
  });

  final Color color;
  final double size;
  final double? top;
  final double? left;
  final double? right;
  final double? bottom;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: top,
      left: left,
      right: right,
      bottom: bottom,
      child: ImageFiltered(
        imageFilter: ImageFilter.blur(sigmaX: 48, sigmaY: 48),
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: RadialGradient(
              colors: [color, color.withValues(alpha: 0)],
            ),
          ),
        ),
      ),
    );
  }
}

/// Decorative flowing gradient strip for dashboard headers.
class FlowingHeaderBand extends StatelessWidget {
  const FlowingHeaderBand({
    super.key,
    this.height = 140,
    this.borderRadius = 28,
  });

  final double height;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(borderRadius),
        gradient: AppColors.heroGradient,
        boxShadow: AppColors.brandGlow,
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            right: -30,
            top: -20,
            child: ImageFiltered(
              imageFilter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.15),
                ),
              ),
            ),
          ),
          Positioned(
            left: -40,
            bottom: -30,
            child: ImageFiltered(
              imageFilter: ImageFilter.blur(sigmaX: 40, sigmaY: 40),
              child: Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.tealSoft.withValues(alpha: 0.25),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
