import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/primary_button.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _index = 0;

  static const _slides = [
    _Slide(
      icon: Icons.search_rounded,
      iconColor: Color(0xFF3775E0),
      title: 'Accurate specialist search made simple',
      illustration: Icons.person_search_rounded,
    ),
    _Slide(
      icon: Icons.calendar_month_rounded,
      iconColor: Color(0xFF3775E0),
      title: 'Book appointments effortlessly',
      illustration: Icons.event_available_rounded,
    ),
    _Slide(
      icon: Icons.chat_rounded,
      iconColor: Color(0xFF3775E0),
      title: 'Expert advice & chat at your fingertips',
      illustration: Icons.support_agent_rounded,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: _slides.length,
                onPageChanged: (i) => setState(() => _index = i),
                itemBuilder: (_, i) {
                  final slide = _slides[i];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 28),
                    child: Column(
                      children: [
                        const SizedBox(height: 48),
                        Text(
                          slide.title,
                          style: AppTypography.pageTitle.copyWith(
                            fontSize: 26,
                            height: 1.25,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const Spacer(),
                        _IllustrationPlaceholder(icon: slide.illustration),
                        const Spacer(),
                      ],
                    ),
                  );
                },
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(_slides.length, (i) {
                final active = i == _index;
                return AnimatedContainer(
                  duration: const Duration(milliseconds: 220),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: active ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: active ? AppColors.brand : AppColors.outline.withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(4),
                  ),
                );
              }),
            ),
            const SizedBox(height: 28),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 12),
              child: PrimaryGradientButton(
                label: 'Create an account',
                onPressed: () async {
                  await OnboardingPrefs.setComplete();
                  if (!mounted) return;
                  context.go('/register');
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
              child: SecondaryButton(
                label: 'Login',
                onPressed: () async {
                  await OnboardingPrefs.setComplete();
                  if (!mounted) return;
                  context.go('/login');
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _IllustrationPlaceholder extends StatelessWidget {
  const _IllustrationPlaceholder({required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      height: 260,
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLow,
        borderRadius: BorderRadius.circular(AppRadii.xxl),
      ),
      child: Icon(icon, size: 100, color: AppColors.brand.withValues(alpha: 0.6)),
    ).animate().fadeIn(duration: 500.ms).scale(begin: const Offset(0.9, 0.9));
  }
}

class _Slide {
  const _Slide({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.illustration,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final IconData illustration;
}
