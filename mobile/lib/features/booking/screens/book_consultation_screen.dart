import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/behance_ui.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../auth/providers/auth_providers.dart';
import '../../client/data/client_repository.dart';
import '../../consultants/data/consultants_repository.dart';
import '../data/booking_repository.dart';
import '../models/booking_models.dart';

class BookConsultationScreen extends ConsumerStatefulWidget {
  const BookConsultationScreen({super.key, required this.professionalUserId});

  final String professionalUserId;

  @override
  ConsumerState<BookConsultationScreen> createState() =>
      _BookConsultationScreenState();
}

class _BookConsultationScreenState
    extends ConsumerState<BookConsultationScreen> {
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _age = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _message = TextEditingController();
  final _citySearch = TextEditingController();
  final _stateController = TextEditingController();

  List<String> _bookableDates = [];
  List<BookableSlot> _slots = [];
  String? _slotsEmptyReason;
  bool _loadingDates = true;
  bool _loadingSlots = false;
  bool _reservingSlot = false;
  String _category = '';
  String _state = '';
  String _city = '';
  String _selectedDateYmd = '';
  SlotHold? _hold;
  Timer? _holdTimer;
  String _holdCountdown = '';
  List<PlacePrediction> _placeResults = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInitialData();
    });
  }

  @override
  void dispose() {
    _holdTimer?.cancel();
    _firstName.dispose();
    _lastName.dispose();
    _age.dispose();
    _phone.dispose();
    _email.dispose();
    _message.dispose();
    _citySearch.dispose();
    _stateController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    await _prefillPatientFields();
    await _loadBookableDates();
    await _restoreActiveHold();
  }

  Future<void> _prefillPatientFields() async {
    final appUser = ref.read(currentAppUserProvider).valueOrNull;
    if (appUser == null) return;

    _email.text = appUser.email;
    if (appUser.phone != null) _phone.text = appUser.phone!;

    final nameParts = (appUser.name ?? '').trim().split(RegExp(r'\s+'));
    if (nameParts.isNotEmpty) _firstName.text = nameParts.first;
    if (nameParts.length > 1) _lastName.text = nameParts.sublist(1).join(' ');

    try {
      final profile =
          await ref.read(clientRepositoryProvider).getMedicalProfile();
      if (profile?.city != null) {
        _city = profile!.city!;
        _citySearch.text = profile.city!;
      }
      if (profile?.state != null) {
        _state = profile!.state!;
        _stateController.text = profile.state!;
      }
      if (profile?.dateOfBirth != null) {
        final dob = DateTime.tryParse(profile!.dateOfBirth!);
        if (dob != null) {
          final age = DateTime.now().year - dob.year;
          if (age >= 0 && age <= 100) _age.text = age.toString();
        }
      }
    } catch (_) {}

    if (mounted) setState(() {});
  }

  Future<void> _loadBookableDates() async {
    setState(() => _loadingDates = true);
    try {
      final result = await ref
          .read(bookingRepositoryProvider)
          .getBookableDates(widget.professionalUserId);
      setState(() {
        _bookableDates = result.dates;
        if (_selectedDateYmd.isEmpty && result.dates.isNotEmpty) {
          _selectedDateYmd = result.dates.first;
        }
      });
      if (_selectedDateYmd.isNotEmpty) {
        await _loadSlots(_selectedDateYmd);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _loadingDates = false);
    }
  }

  Future<void> _restoreActiveHold() async {
    try {
      final hold = await ref
          .read(bookingRepositoryProvider)
          .getActiveHold(widget.professionalUserId);
      if (hold != null && mounted) {
        setState(() {
          _hold = hold;
          _selectedDateYmd = hold.date;
        });
        _startHoldCountdown(hold.expiresAt);
        await _loadSlots(hold.date);
      }
    } catch (_) {}
  }

  Future<void> _loadSlots(String dateYmd) async {
    setState(() => _loadingSlots = true);
    try {
      final result =
          await ref.read(bookingRepositoryProvider).getAvailableSlots(
                professionalId: widget.professionalUserId,
                date: dateYmd,
              );
      if (mounted) {
        setState(() {
          _slots = result.slots;
          _slotsEmptyReason = result.emptyReason;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _loadingSlots = false);
    }
  }

  Future<void> _onDateSelected(String ymd) async {
    if (_hold != null && _hold!.date != ymd) {
      await ref.read(bookingRepositoryProvider).releaseSlot(_hold!.holdId);
      _holdTimer?.cancel();
      setState(() => _hold = null);
    }
    setState(() => _selectedDateYmd = ymd);
    await _loadSlots(ymd);
  }

  Future<void> _onSlotTap(BookableSlot slot) async {
    if (!slot.isAvailable || _reservingSlot) return;

    setState(() => _reservingSlot = true);
    try {
      if (_hold != null) {
        await ref.read(bookingRepositoryProvider).releaseSlot(_hold!.holdId);
        _holdTimer?.cancel();
      }

      final hold = await ref.read(bookingRepositoryProvider).reserveSlot(
            professionalId: widget.professionalUserId,
            slotStartAt: slot.slotStartAt,
          );

      if (mounted) {
        setState(() => _hold = hold);
        _startHoldCountdown(hold.expiresAt);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _reservingSlot = false);
    }
  }

  void _startHoldCountdown(String expiresAt) {
    _holdTimer?.cancel();
    _updateCountdown(expiresAt);
    _holdTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      _updateCountdown(expiresAt);
    });
  }

  void _updateCountdown(String expiresAt) {
    final ms = DateTime.parse(expiresAt).difference(DateTime.now()).inSeconds;
    if (ms <= 0) {
      _holdTimer?.cancel();
      if (mounted) {
        setState(() {
          _hold = null;
          _holdCountdown = '';
        });
      }
      return;
    }
    final m = ms ~/ 60;
    final s = ms % 60;
    if (mounted) {
      setState(() => _holdCountdown = '$m:${s.toString().padLeft(2, '0')}');
    }
  }

  Future<void> _searchPlaces(String q) async {
    if (q.length < 3) {
      setState(() => _placeResults = []);
      return;
    }
    final results = await ref.read(bookingRepositoryProvider).searchPlaces(q);
    setState(() => _placeResults = results);
  }

  bool _validate() {
    if (_firstName.text.trim().length < 2) return false;
    if (_lastName.text.trim().length < 2) return false;
    final age = int.tryParse(_age.text.trim());
    if (age == null || age < 0 || age > 100) return false;
    if (_phone.text.trim().length != 10) return false;
    if (!_email.text.contains('@')) return false;
    if (_city.isEmpty || _state.isEmpty) return false;
    if (_hold == null) return false;
    return true;
  }

  void _continueToCheckout() {
    if (!_validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please complete all fields and reserve a time slot.'),
        ),
      );
      return;
    }

    final consultant = ref
        .read(consultantDetailProvider(widget.professionalUserId))
        .valueOrNull;
    final profile = consultant?.profile;

    final snapshot = BookingSnapshot(
      firstName: _firstName.text.trim(),
      lastName: _lastName.text.trim(),
      age: int.parse(_age.text.trim()),
      phone: _phone.text.trim(),
      email: _email.text.trim(),
      category: _category,
      state: _state,
      city: _city,
      date: _hold!.date,
      time: _hold!.time,
      message: _message.text.trim(),
    );

    ref.read(bookingDraftProvider.notifier).state = BookingDraft(
      professionalUserId: widget.professionalUserId,
      snapshot: snapshot,
      hold: _hold!,
      consultantName: profile?.displayName,
      consultantSpecialization: profile?.specialization,
      consultantImageUrl: profile?.image,
      consultationFeePaise: profile?.consultationFee,
    );

    context.push('/book/${widget.professionalUserId}/checkout');
  }

  List<DateTime> get _dateObjects {
    return _bookableDates.map((ymd) {
      final parts = ymd.split('-');
      return DateTime(
          int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
    }).toList();
  }

  DateTime? get _selectedDateObject {
    if (_selectedDateYmd.isEmpty) return null;
    final parts = _selectedDateYmd.split('-');
    return DateTime(
        int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
  }

  @override
  Widget build(BuildContext context) {
    final consultant =
        ref.watch(consultantDetailProvider(widget.professionalUserId));

    consultant.whenData((detail) {
      if (detail != null && _category.isEmpty) {
        final spec = detail.profile.specialization?.trim();
        if (spec != null && spec.isNotEmpty) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted && _category.isEmpty) setState(() => _category = spec);
          });
        }
      }
    });

    return Scaffold(
      backgroundColor: AppColors.surface,
      extendBody: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Book consultation'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () async {
            if (_hold != null) {
              try {
                await ref
                    .read(bookingRepositoryProvider)
                    .releaseSlot(_hold!.holdId);
              } catch (_) {}
            }
            if (context.mounted) context.pop();
          },
        ),
      ),
      body: AmbientBackground(
        child: Column(
          children: [
            consultant.when(
              data: (detail) => detail != null
                  ? Padding(
                      padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
                      child: DoctorListCard(
                        name: detail.profile.displayName,
                        specialty: detail.profile.specialization ??
                            'Healthcare professional',
                        fee: '${detail.profile.displayFee} / Consultation',
                        imageUrl: detail.profile.image,
                        isVerified: detail.profile.isVerified,
                      ),
                    )
                  : const SizedBox.shrink(),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
                children: [
                  const _SectionTitle(title: 'Patient details'),
                  const SizedBox(height: 12),
                  GlassCard(
                    child: Column(
                      children: [
                        AppTextField(
                            controller: _firstName,
                            label: 'First name',
                            hint: 'Jane'),
                        const SizedBox(height: 12),
                        AppTextField(
                            controller: _lastName,
                            label: 'Last name',
                            hint: 'Doe'),
                        const SizedBox(height: 12),
                        AppTextField(
                          controller: _age,
                          label: 'Age',
                          keyboardType: TextInputType.number,
                        ),
                        const SizedBox(height: 12),
                        AppTextField(
                          controller: _phone,
                          label: 'Phone (10 digits)',
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 12),
                        AppTextField(
                          controller: _email,
                          label: 'Email',
                          keyboardType: TextInputType.emailAddress,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
                  const _SectionTitle(title: 'Appointment'),
                  const SizedBox(height: 12),
                  if (_loadingDates)
                    const Center(
                      child: Padding(
                        padding: EdgeInsets.all(24),
                        child:
                            CircularProgressIndicator(color: AppColors.brand),
                      ),
                    )
                  else if (_bookableDates.isEmpty)
                    Text(
                      'No bookable dates for this consultant.',
                      style: AppTypography.body
                          .copyWith(color: AppColors.onSurfaceVariant),
                    )
                  else ...[
                    DateOvalScroller(
                      dates: _dateObjects,
                      selected: _selectedDateObject,
                      onSelected: (d) {
                        final ymd =
                            '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
                        _onDateSelected(ymd);
                      },
                    ),
                    const SizedBox(height: 16),
                    if (_holdCountdown.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: AppColors.surfaceContainer,
                          borderRadius: BorderRadius.circular(AppRadii.lg),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.timer_outlined,
                                size: 18, color: AppColors.brand),
                            const SizedBox(width: 8),
                            Text(
                              'Slot held — $_holdCountdown remaining',
                              style: AppTypography.bodyMedium
                                  .copyWith(color: AppColors.brand),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 12),
                    if (_loadingSlots)
                      const Center(
                          child:
                              CircularProgressIndicator(color: AppColors.brand))
                    else if (_slots.isEmpty)
                      Text(
                        _emptySlotsMessage(_slotsEmptyReason),
                        style: AppTypography.body
                            .copyWith(color: AppColors.onSurfaceVariant),
                      )
                    else
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: _slots.map((slot) {
                          final isSelected =
                              _hold?.slotStartAt == slot.slotStartAt;
                          final enabled = slot.isAvailable || isSelected;
                          return GestureDetector(
                            onTap: enabled ? () => _onSlotTap(slot) : null,
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 12),
                              decoration: BoxDecoration(
                                gradient:
                                    isSelected ? AppColors.brandGradient : null,
                                color: isSelected
                                    ? null
                                    : enabled
                                        ? AppColors.surfaceContainerLowest
                                        : AppColors.surfaceAlt,
                                borderRadius:
                                    BorderRadius.circular(AppRadii.pill),
                                border: Border.all(
                                  color: isSelected
                                      ? Colors.transparent
                                      : AppColors.outline
                                          .withValues(alpha: 0.5),
                                ),
                              ),
                              child: Text(
                                slot.label,
                                style: AppTypography.bodyMedium.copyWith(
                                  color: isSelected
                                      ? Colors.white
                                      : enabled
                                          ? AppColors.onSurface
                                          : AppColors.onSurfaceVariant,
                                  fontWeight: isSelected
                                      ? FontWeight.w600
                                      : FontWeight.w500,
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    if (_reservingSlot) ...[
                      const SizedBox(height: 12),
                      const LinearProgressIndicator(color: AppColors.brand),
                    ],
                    const SizedBox(height: 16),
                    _ReadOnlyField(
                        label: 'Category',
                        value: _category.isEmpty ? '—' : _category),
                    const SizedBox(height: 12),
                    AppTextField(
                      controller: _message,
                      label: 'Reason (optional)',
                      hint: 'Describe your concern…',
                      maxLines: 3,
                    ),
                  ],
                  const SizedBox(height: 24),
                  const _SectionTitle(title: 'Location'),
                  const SizedBox(height: 12),
                  GlassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        AppTextField(
                          controller: _citySearch,
                          label: 'Search city',
                          hint: 'Start typing…',
                          onChanged: _searchPlaces,
                        ),
                        if (_placeResults.isNotEmpty)
                          ..._placeResults.take(5).map(
                                (p) => ListTile(
                                  title: Text(p.description,
                                      style: AppTypography.body),
                                  onTap: () {
                                    setState(() {
                                      _city =
                                          p.description.split(',').first.trim();
                                      _state = p.description.contains(',')
                                          ? p.description.split(',').last.trim()
                                          : '';
                                      _citySearch.text = p.description;
                                      _stateController.text = _state;
                                      _placeResults = [];
                                    });
                                  },
                                ),
                              ),
                        const SizedBox(height: 12),
                        AppTextField(
                          controller: _stateController,
                          label: 'State',
                          onChanged: (v) => _state = v,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              child: PrimaryGradientButton(
                label: 'Continue to checkout',
                onPressed: _continueToCheckout,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _emptySlotsMessage(String? reason) {
    switch (reason) {
      case 'no_availability_window':
        return 'This consultant has no working hours for this day.';
      case 'invalid_time_window':
        return 'Working hours look invalid for this day.';
      case 'all_slots_past':
        return 'All slots for today have passed. Pick a later date.';
      case 'occupied_only':
        return 'All slots are booked or held. Try another day.';
      default:
        return 'No slots available for this date.';
    }
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(title, style: AppTypography.textTheme.titleMedium);
  }
}

class _ReadOnlyField extends StatelessWidget {
  const _ReadOnlyField({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.fieldLabel),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: AppColors.surfaceAlt,
            borderRadius: BorderRadius.circular(AppRadii.lg),
            border: Border.all(color: AppColors.outline.withValues(alpha: 0.4)),
          ),
          child: Text(value, style: AppTypography.bodyMedium),
        ),
      ],
    );
  }
}
