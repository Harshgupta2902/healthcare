import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/primary_button.dart';

class ProfileDocumentUploadSuccessScreen extends StatelessWidget {
  const ProfileDocumentUploadSuccessScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  color: const Color(0xFFE8F8EF),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_rounded,
                  size: 64,
                  color: Color(0xFF43A047),
                ),
              ),
              const SizedBox(height: 28),
              Text(
                'Upload Successful !',
                style: AppTypography.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text(
                'Your medical report has been uploaded successfully',
                textAlign: TextAlign.center,
                style: AppTypography.pageSubtitle,
              ),
              const Spacer(),
              PrimaryGradientButton(
                label: 'Done',
                onPressed: () => context.go('/profile/documents'),
                gradient: const LinearGradient(
                  colors: [AppColors.tealSoft, Color(0xFF45B8B8)],
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
