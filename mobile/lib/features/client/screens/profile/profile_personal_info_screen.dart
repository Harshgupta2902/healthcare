import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/widgets/glass_card.dart';
import '../../../../shared/widgets/primary_button.dart';
import '../../../auth/data/auth_repository.dart';
import '../../../auth/providers/auth_providers.dart';
import '../../data/client_repository.dart';

class ProfilePersonalInfoScreen extends ConsumerStatefulWidget {
  const ProfilePersonalInfoScreen({super.key});

  @override
  ConsumerState<ProfilePersonalInfoScreen> createState() => _ProfilePersonalInfoScreenState();
}

class _ProfilePersonalInfoScreenState extends ConsumerState<ProfilePersonalInfoScreen> {
  bool _uploadingPhoto = false;

  Future<void> _changePhoto() async {
    final picked = await ImagePicker().pickImage(source: ImageSource.gallery, maxWidth: 1200);
    if (picked == null) return;

    setState(() => _uploadingPhoto = true);
    try {
      final bytes = await picked.readAsBytes();
      final url = await ref.read(authRepositoryProvider).uploadProfileImage(picked.name, bytes);
      await ref.read(authRepositoryProvider).updateUserProfile(image: url);
      ref.invalidate(currentAppUserProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _uploadingPhoto = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentAppUserProvider).valueOrNull;
    final dashboard = ref.watch(clientDashboardProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text('Personal Information', style: AppTypography.pageTitle.copyWith(fontSize: 18)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: dashboard.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (data) {
          final profile = data.medicalProfile;
          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Center(
                child: GestureDetector(
                  onTap: _uploadingPhoto ? null : _changePhoto,
                  child: Stack(
                    children: [
                      CircleAvatar(
                        radius: 52,
                        backgroundColor: AppColors.surfaceContainer,
                        backgroundImage: user?.image != null
                            ? CachedNetworkImageProvider(user!.image!)
                            : null,
                        child: user?.image == null
                            ? Text(
                                (user?.name ?? user?.email ?? '?')[0].toUpperCase(),
                                style: AppTypography.pageTitle.copyWith(
                                  fontSize: 32,
                                  color: AppColors.brand,
                                ),
                              )
                            : null,
                      ),
                      if (_uploadingPhoto)
                        const Positioned.fill(
                          child: CircleAvatar(
                            radius: 52,
                            backgroundColor: Colors.black38,
                            child: CircularProgressIndicator(color: Colors.white),
                          ),
                        )
                      else
                        Positioned(
                          right: 0,
                          bottom: 0,
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: const BoxDecoration(
                              color: AppColors.brand,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.camera_alt_outlined, color: Colors.white, size: 16),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'Tap photo to change',
                  style: AppTypography.pageSubtitle.copyWith(fontSize: 12),
                ),
              ),
              const SizedBox(height: 12),
              Center(
                child: Text(
                  user?.name ?? 'Patient',
                  style: AppTypography.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
              Center(
                child: Text(user?.email ?? '', style: AppTypography.pageSubtitle),
              ),
              const SizedBox(height: 24),
              GlassCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _InfoRow(label: 'Phone', value: user?.phone ?? '—'),
                    _InfoRow(label: 'Date of birth', value: profile?.dateOfBirth ?? '—'),
                    _InfoRow(label: 'Gender', value: profile?.gender ?? '—'),
                    _InfoRow(label: 'Blood type', value: profile?.bloodType ?? '—'),
                    _InfoRow(
                      label: 'Height',
                      value: profile?.height != null ? '${profile!.height} cm' : '—',
                    ),
                    _InfoRow(
                      label: 'Weight',
                      value: profile?.weight != null ? '${profile!.weight} kg' : '—',
                    ),
                    _InfoRow(label: 'Address', value: profile?.address ?? '—'),
                    _InfoRow(
                      label: 'City / State',
                      value: [profile?.city, profile?.state]
                              .whereType<String>()
                              .where((s) => s.isNotEmpty)
                              .join(', ')
                              .isEmpty
                          ? '—'
                          : [profile?.city, profile?.state]
                              .whereType<String>()
                              .where((s) => s.isNotEmpty)
                              .join(', '),
                    ),
                    _InfoRow(label: 'Postal code', value: profile?.postalCode ?? '—'),
                    _InfoRow(
                      label: 'Emergency contact',
                      value: profile?.emergencyContactName ?? '—',
                    ),
                    _InfoRow(
                      label: 'Emergency phone',
                      value: profile?.emergencyContactPhone ?? '—',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              PrimaryGradientButton(
                label: 'Edit information',
                icon: Icons.edit_outlined,
                onPressed: () => context.push('/profile/edit'),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(label, style: AppTypography.pageSubtitle.copyWith(fontSize: 13)),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}
