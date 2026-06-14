import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:healthhere_mobile/shared/widgets/app_text_field.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../auth/data/auth_repository.dart';
import '../../auth/providers/auth_providers.dart';
import '../data/client_repository.dart';

class ClientProfileEditScreen extends ConsumerStatefulWidget {
  const ClientProfileEditScreen({super.key});

  @override
  ConsumerState<ClientProfileEditScreen> createState() =>
      _ClientProfileEditScreenState();
}

class _ClientProfileEditScreenState
    extends ConsumerState<ClientProfileEditScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _dob = TextEditingController();
  final _gender = TextEditingController();
  final _bloodType = TextEditingController();
  final _address = TextEditingController();
  final _city = TextEditingController();
  final _state = TextEditingController();
  final _postal = TextEditingController();
  final _emergencyName = TextEditingController();
  final _emergencyPhone = TextEditingController();
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final user = ref.read(currentAppUserProvider).valueOrNull;
    final med = await ref.read(clientRepositoryProvider).getMedicalProfile();
    if (user != null) {
      _name.text = user.name ?? '';
      _phone.text = user.phone ?? '';
    }
    if (med != null) {
      _dob.text = med.dateOfBirth ?? '';
      _gender.text = med.gender ?? '';
      _bloodType.text = med.bloodType ?? '';
      _address.text = med.address ?? '';
      _city.text = med.city ?? '';
      _state.text = med.state ?? '';
      _postal.text = med.postalCode ?? '';
      _emergencyName.text = med.emergencyContactName ?? '';
      _emergencyPhone.text = med.emergencyContactPhone ?? '';
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _dob.dispose();
    _gender.dispose();
    _bloodType.dispose();
    _address.dispose();
    _city.dispose();
    _state.dispose();
    _postal.dispose();
    _emergencyName.dispose();
    _emergencyPhone.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await ref.read(authRepositoryProvider).updateUserProfile(
            name: _name.text.trim(),
            phone: _phone.text.trim().isEmpty ? null : _phone.text.trim(),
          );
      await ref.read(clientRepositoryProvider).updateMedicalProfile(
            ClientMedicalProfile(
              dateOfBirth: _dob.text.trim().isEmpty ? null : _dob.text.trim(),
              gender: _gender.text.trim().isEmpty ? null : _gender.text.trim(),
              bloodType: _bloodType.text.trim().isEmpty
                  ? null
                  : _bloodType.text.trim(),
              address:
                  _address.text.trim().isEmpty ? null : _address.text.trim(),
              city: _city.text.trim().isEmpty ? null : _city.text.trim(),
              state: _state.text.trim().isEmpty ? null : _state.text.trim(),
              postalCode:
                  _postal.text.trim().isEmpty ? null : _postal.text.trim(),
              emergencyContactName: _emergencyName.text.trim().isEmpty
                  ? null
                  : _emergencyName.text.trim(),
              emergencyContactPhone: _emergencyPhone.text.trim().isEmpty
                  ? null
                  : _emergencyPhone.text.trim(),
            ),
          );
      ref.invalidate(currentAppUserProvider);
      ref.invalidate(clientDashboardProvider);
      if (!mounted) return;
      context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Edit profile'),
      ),
      body: AmbientBackground(
        child: _loading
            ? const Center(
                child: CircularProgressIndicator(color: AppColors.brand))
            : ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Text('Account & medical profile',
                      style: AppTypography.pageTitle.copyWith(fontSize: 22)),
                  const SizedBox(height: 4),
                  Text('Updates sync securely to your account',
                      style: AppTypography.pageSubtitle),
                  const SizedBox(height: 16),
                  GlassCard(
                    gradientBorder: true,
                    child: Column(
                      children: [
                        AppTextField(controller: _name, label: 'Full name'),
                        const SizedBox(height: 12),
                        AppTextField(
                            controller: _phone,
                            label: 'Phone',
                            keyboardType: TextInputType.phone),
                        const SizedBox(height: 12),
                        AppTextField(controller: _dob, label: 'Date of birth'),
                        const SizedBox(height: 12),
                        AppTextField(controller: _gender, label: 'Gender'),
                        const SizedBox(height: 12),
                        AppTextField(
                            controller: _bloodType, label: 'Blood type'),
                        const SizedBox(height: 12),
                        AppTextField(controller: _address, label: 'Address'),
                        const SizedBox(height: 12),
                        AppTextField(controller: _city, label: 'City'),
                        const SizedBox(height: 12),
                        AppTextField(controller: _state, label: 'State'),
                        const SizedBox(height: 12),
                        AppTextField(controller: _postal, label: 'Postal code'),
                        const SizedBox(height: 12),
                        AppTextField(
                            controller: _emergencyName,
                            label: 'Emergency contact name'),
                        const SizedBox(height: 12),
                        AppTextField(
                          controller: _emergencyPhone,
                          label: 'Emergency contact phone',
                          keyboardType: TextInputType.phone,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  PrimaryGradientButton(
                    label: _saving ? 'Saving…' : 'Save changes',
                    isLoading: _saving,
                    onPressed: _saving ? null : _save,
                  ),
                ],
              ),
      ),
    );
  }
}
