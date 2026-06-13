import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';

class BlogPlaceholderScreen extends StatelessWidget {
  const BlogPlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Health blog', style: AppTypography.pageTitle),
            const SizedBox(height: 8),
            Text('Phase 2 — blog feed via Supabase SDK', style: AppTypography.pageSubtitle),
            const Spacer(),
            Center(
              child: Icon(Icons.article_outlined, size: 64, color: AppColors.outline),
            ),
            const Spacer(),
          ],
        ),
      ),
    );
  }
}
