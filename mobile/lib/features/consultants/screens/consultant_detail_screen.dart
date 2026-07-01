import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/services/saved_doctors_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../client/screens/my_doctor_screen.dart';
import '../data/consultants_repository.dart';
import '../models/consultant_detail.dart';

class ConsultantDetailScreen extends ConsumerWidget {
  const ConsultantDetailScreen({super.key, required this.userId});

  final String userId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detailAsync = ref.watch(consultantDetailProvider(userId));

    return Scaffold(
      backgroundColor: AppColors.surface,
      extendBody: true,
      body: AmbientBackground(
        child: SafeArea(
          child: detailAsync.when(
            loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.brand),
            ),
            error: (e, _) => EmptyState(
              icon: Icons.error_outline_rounded,
              title: 'Could not load profile',
              subtitle: e.toString(),
              actionLabel: 'Retry',
              onAction: () => ref.invalidate(consultantDetailProvider(userId)),
            ),
            data: (detail) {
              if (detail == null) {
                return const Center(child: Text('Doctor not found'));
              }

              final profile = detail.profile;
              final rating = consultantDisplayRating(profile.yearsOfExperience);

              return Column(
                children: [
                  _ProfileTopBar(
                    userId: userId,
                    onBack: () => context.pop(),
                    onMessage: () => context.push('/contact'),
                  ),
                  Expanded(
                    child: ListView(
                      padding: const EdgeInsets.fromLTRB(20, 4, 20, 24),
                      children: [
                        _DoctorSummaryCard(
                          name: profile.displayName,
                          specialty:
                              profile.specialization ?? 'Healthcare professional',
                          imageUrl: profile.image,
                          patientsLabel:
                              consultantPatientCountLabel(profile.yearsOfExperience),
                          experienceLabel: profile.yearsOfExperience != null
                              ? '${profile.yearsOfExperience} years'
                              : '—',
                          ratingLabel: rating.toStringAsFixed(1),
                          isVerified: profile.isVerified,
                        ),
                        const SizedBox(height: 16),
                        _SectionCard(
                          title: 'About',
                          child: Text(
                            consultantAboutText(profile),
                            style: AppTypography.body.copyWith(
                              color: AppColors.onSurfaceVariant,
                              height: 1.55,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        _SectionCard(
                          title: 'Education',
                          child: Text(
                            consultantEducationText(
                              profile,
                              detail.qualifications,
                            ),
                            style: AppTypography.body.copyWith(
                              color: AppColors.onSurfaceVariant,
                              height: 1.55,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        _ReviewsSection(
                          rating: rating,
                          reviews: detail.reviews,
                        ),
                        const SizedBox(height: 100),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
      bottomNavigationBar: detailAsync.maybeWhen(
        data: (detail) => detail == null
            ? null
            : SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
                  child: PrimaryGradientButton(
                    label: 'Make an appointment',
                    icon: Icons.calendar_month_rounded,
                    onPressed: () => context.push('/book/${detail.profile.userId}'),
                  ),
                ),
              ),
        orElse: () => null,
      ),
    );
  }
}

class _ProfileTopBar extends ConsumerWidget {
  const _ProfileTopBar({
    required this.userId,
    required this.onBack,
    required this.onMessage,
  });

  final String userId;
  final VoidCallback onBack;
  final VoidCallback onMessage;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 4, 12, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _CircleIconButton(
                icon: Icons.chevron_left_rounded,
                onTap: onBack,
              ),
              Expanded(
                child: Text(
                  'Profile',
                  textAlign: TextAlign.center,
                  style: AppTypography.pageTitle.copyWith(fontSize: 18),
                ),
              ),
              Consumer(
                builder: (context, ref, _) {
                  final savedAsync = ref.watch(savedDoctorIdsProvider);
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      savedAsync.maybeWhen(
                        data: (ids) {
                          final isSaved = ids.contains(userId);
                          return _CircleIconButton(
                            icon: isSaved
                                ? Icons.favorite_rounded
                                : Icons.favorite_border_rounded,
                            iconColor: isSaved ? Colors.red : AppColors.brand,
                            onTap: () async {
                              await ref
                                  .read(savedDoctorsServiceProvider)
                                  .toggle(userId);
                              ref.invalidate(savedDoctorIdsProvider);
                            },
                          );
                        },
                        orElse: () => const SizedBox(width: 40),
                      ),
                      const SizedBox(width: 8),
                      _CircleIconButton(
                        icon: Icons.mail_outline_rounded,
                        onTap: onMessage,
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({
    required this.icon,
    required this.onTap,
    this.iconColor = AppColors.brand,
  });

  final IconData icon;
  final VoidCallback onTap;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surfaceContainer,
      shape: const CircleBorder(),
      child: InkWell(
        onTap: onTap,
        customBorder: const CircleBorder(),
        child: SizedBox(
          width: 40,
          height: 40,
          child: Icon(icon, color: iconColor, size: 22),
        ),
      ),
    );
  }
}

class _DoctorSummaryCard extends StatelessWidget {
  const _DoctorSummaryCard({
    required this.name,
    required this.specialty,
    required this.patientsLabel,
    required this.experienceLabel,
    required this.ratingLabel,
    this.imageUrl,
    this.isVerified = false,
  });

  final String name;
  final String specialty;
  final String patientsLabel;
  final String experienceLabel;
  final String ratingLabel;
  final String? imageUrl;
  final bool isVerified;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        boxShadow: AppColors.cardShadow,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(AppRadii.lg),
                child: imageUrl != null
                    ? CachedNetworkImage(
                        imageUrl: imageUrl!,
                        width: 88,
                        height: 88,
                        fit: BoxFit.cover,
                      )
                    : Container(
                        width: 88,
                        height: 88,
                        color: AppColors.surfaceContainer,
                        alignment: Alignment.center,
                        child: Text(
                          name.isNotEmpty ? name[0].toUpperCase() : '?',
                          style: AppTypography.pageTitle.copyWith(
                            fontSize: 28,
                            color: AppColors.brand,
                          ),
                        ),
                      ),
              ),
              if (isVerified)
                Positioned(
                  left: 4,
                  top: 4,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.verified_rounded,
                      size: 14,
                      color: AppColors.brand,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: AppTypography.bodyMedium.copyWith(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.ctaBackground,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  specialty,
                  style: AppTypography.pageSubtitle.copyWith(fontSize: 13),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    _SummaryStat(label: 'Patients', value: patientsLabel),
                    _SummaryStat(label: 'Exp.', value: experienceLabel),
                    _SummaryStat(label: 'ratings', value: ratingLabel),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryStat extends StatelessWidget {
  const _SummaryStat({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: AppTypography.bodyMedium.copyWith(
              fontWeight: FontWeight.w700,
              fontSize: 13,
              color: AppColors.ctaBackground,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: AppTypography.pageSubtitle.copyWith(fontSize: 11),
          ),
        ],
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  const _SectionCard({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        boxShadow: AppColors.softElevation,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTypography.pageTitle.copyWith(
              fontSize: 16,
              color: AppColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _ReviewsSection extends StatefulWidget {
  const _ReviewsSection({required this.rating, required this.reviews});

  final double rating;
  final List<ConsultantReview> reviews;

  @override
  State<_ReviewsSection> createState() => _ReviewsSectionState();
}

class _ReviewsSectionState extends State<_ReviewsSection> {
  var _expanded = false;

  @override
  Widget build(BuildContext context) {
    final visible = _expanded ? widget.reviews : widget.reviews.take(2).toList();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppRadii.xl),
        boxShadow: AppColors.softElevation,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppColors.surfaceAlt,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.star_rounded,
                  color: Color(0xFFFF9800),
                  size: 20,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    style: AppTypography.body.copyWith(
                      color: AppColors.onSurfaceVariant,
                    ),
                    children: [
                      const TextSpan(
                        text: 'Rating ',
                        style: TextStyle(fontWeight: FontWeight.w500),
                      ),
                      TextSpan(
                        text: '${widget.rating.toStringAsFixed(2)} out of 5',
                        style: AppTypography.bodyMedium.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.ctaBackground,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (widget.reviews.length > 2)
                FilledButton(
                  onPressed: () => setState(() => _expanded = !_expanded),
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.brand,
                    foregroundColor: AppColors.onBrand,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppRadii.pill),
                    ),
                  ),
                  child: Text(_expanded ? 'Show less' : 'See all >'),
                ),
            ],
          ),
          const SizedBox(height: 18),
          for (var i = 0; i < visible.length; i++) ...[
            if (i > 0) const SizedBox(height: 16),
            _ReviewTile(review: visible[i]),
          ],
        ],
      ),
    );
  }
}

class _ReviewTile extends StatelessWidget {
  const _ReviewTile({required this.review});

  final ConsultantReview review;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (review.isAnonymous)
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.surfaceAlt,
              shape: BoxShape.circle,
            ),
            alignment: Alignment.center,
            child: Text(
              '?',
              style: AppTypography.bodyMedium.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.onSurfaceVariant,
              ),
            ),
          )
        else
          CircleAvatar(
            radius: 18,
            backgroundColor: AppColors.surfaceContainer,
            backgroundImage: review.authorImage != null
                ? CachedNetworkImageProvider(review.authorImage!)
                : null,
            child: review.authorImage == null
                ? Text(
                    (review.authorName ?? 'P')[0].toUpperCase(),
                    style: AppTypography.bodyMedium.copyWith(
                      color: AppColors.brand,
                      fontWeight: FontWeight.w700,
                    ),
                  )
                : null,
          ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                review.isAnonymous
                    ? 'Anonymous feedback'
                    : (review.authorName ?? 'Patient feedback'),
                style: AppTypography.bodyMedium.copyWith(
                  fontWeight: FontWeight.w700,
                  color: AppColors.ctaBackground,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                review.body,
                style: AppTypography.pageSubtitle.copyWith(
                  fontSize: 13,
                  height: 1.45,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
