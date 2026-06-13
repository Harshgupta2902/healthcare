import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/behance_ui.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../consultants/data/consultants_repository.dart';
import '../data/booking_repository.dart';

class BookConsultationScreen extends ConsumerStatefulWidget {
  const BookConsultationScreen({super.key, required this.professionalUserId});

  final String professionalUserId;

  @override
  ConsumerState<BookConsultationScreen> createState() => _BookConsultationScreenState();
}

class _BookConsultationScreenState extends ConsumerState<BookConsultationScreen> {
  final _pageController = PageController();
  int _step = 0;
  bool _submitting = false;
  bool _forMyself = true;
  String _package = 'Video Call';

  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _age = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _message = TextEditingController();
  final _citySearch = TextEditingController();
  final _stateController = TextEditingController();
  final _categoryController = TextEditingController();

  String _category = '';
  String _state = '';
  String _city = '';
  DateTime? _selectedDate;
  String _time = '';
  List<PlacePrediction> _placeResults = [];

  late final List<DateTime> _dates = List.generate(
    14,
    (i) => DateTime.now().add(Duration(days: i + 1)),
  );

  static const _times = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '08:00 PM',
  ];

  @override
  void dispose() {
    _pageController.dispose();
    _firstName.dispose();
    _lastName.dispose();
    _age.dispose();
    _phone.dispose();
    _email.dispose();
    _message.dispose();
    _citySearch.dispose();
    _stateController.dispose();
    _categoryController.dispose();
    super.dispose();
  }

  String get _dateIso {
    if (_selectedDate == null) return '';
    final d = _selectedDate!;
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  Future<void> _searchPlaces(String q) async {
    if (q.length < 3) {
      setState(() => _placeResults = []);
      return;
    }
    final results = await ref.read(bookingRepositoryProvider).searchPlaces(q);
    setState(() => _placeResults = results);
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    try {
      final profile = await ref.read(consultantsRepositoryProvider).getByUserId(widget.professionalUserId);

      final id = await ref.read(bookingRepositoryProvider).submitGuestBooking(
            firstName: _firstName.text.trim(),
            lastName: _lastName.text.trim(),
            age: int.parse(_age.text.trim()),
            phone: _phone.text.trim(),
            email: _email.text.trim(),
            category: _category.isNotEmpty ? _category : (profile?.specialization ?? 'General'),
            state: _state,
            city: _city,
            date: _dateIso,
            time: _time,
            professionalId: widget.professionalUserId,
            message: [
              if (_package.isNotEmpty) 'Package: $_package',
              if (_message.text.trim().isNotEmpty) _message.text.trim(),
            ].join('\n').trim().isEmpty
                ? null
                : [
                    if (_package.isNotEmpty) 'Package: $_package',
                    if (_message.text.trim().isNotEmpty) _message.text.trim(),
                  ].join('\n'),
          );

      if (!mounted) return;
      context.go('/booking/success/$id');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  bool _validateStep() {
    switch (_step) {
      case 0:
        if (_firstName.text.trim().isEmpty || _lastName.text.trim().isEmpty) return false;
        if (_age.text.trim().isEmpty || _phone.text.trim().length < 10) return false;
        if (!_email.text.contains('@')) return false;
        return true;
      case 1:
        return _package.isNotEmpty;
      case 2:
        return _selectedDate != null && _time.isNotEmpty;
      case 3:
        return _city.isNotEmpty && _state.isNotEmpty;
      default:
        return true;
    }
  }

  void _next() {
    if (!_validateStep()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete all required fields.')),
      );
      return;
    }
    if (_step < 3) {
      setState(() => _step++);
      _pageController.nextPage(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutCubic,
      );
    } else {
      _submit();
    }
  }

  void _back() {
    if (_step > 0) {
      setState(() => _step--);
      _pageController.previousPage(
        duration: const Duration(milliseconds: 320),
        curve: Curves.easeOutCubic,
      );
    } else {
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final consultant = ref.watch(consultantDetailProvider(widget.professionalUserId));

    return Scaffold(
      backgroundColor: AppColors.surface,
      extendBody: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text(
          switch (_step) {
            0 => 'Patient Details',
            1 => 'Select Package',
            2 => 'Booking Appointment',
            _ => 'Location',
          },
        ),
        leading: IconButton(icon: const Icon(Icons.arrow_back_rounded), onPressed: _back),
      ),
      body: AmbientBackground(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
              child: BookingStepBar(step: _step, total: 4),
            ),
            consultant.when(
              data: (p) => p != null
                  ? Padding(
                      padding: const EdgeInsets.all(20),
                      child: DoctorListCard(
                        name: p.displayName,
                        specialty: p.specialization ?? 'Healthcare professional',
                        fee: '${p.displayFee} / Consultation',
                        imageUrl: p.image,
                        isVerified: p.isVerified,
                      ),
                    )
                  : const SizedBox.shrink(),
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [
                  _stepPatient(),
                  _stepPackage(),
                  _stepSchedule(),
                  _stepLocation(),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              child: PrimaryGradientButton(
                label: _step < 3 ? 'Continue' : (_submitting ? 'Booking…' : 'Make Appointment'),
                isLoading: _submitting,
                onPressed: _submitting ? null : _next,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _stepPatient() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      children: [
        Text('Who is this for?', style: AppTypography.textTheme.titleMedium),
        const SizedBox(height: 12),
        DualChoiceToggle(
          leftLabel: 'For Myself',
          rightLabel: 'Other',
          leftSelected: _forMyself,
          onLeft: () => setState(() => _forMyself = true),
          onRight: () => setState(() => _forMyself = false),
        ),
        const SizedBox(height: 20),
        GlassCard(
          child: Column(
            children: [
              AppTextField(controller: _firstName, label: 'First name', hint: 'Jane'),
              const SizedBox(height: 12),
              AppTextField(controller: _lastName, label: 'Last name', hint: 'Doe'),
              const SizedBox(height: 12),
              AppTextField(controller: _age, label: 'Age', keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              AppTextField(controller: _phone, label: 'Phone', keyboardType: TextInputType.phone),
              const SizedBox(height: 12),
              AppTextField(
                controller: _email,
                label: 'Email',
                keyboardType: TextInputType.emailAddress,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _stepPackage() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      children: [
        PackageOptionTile(
          icon: Icons.chat_bubble_outline,
          label: 'Message',
          selected: _package == 'Message',
          onTap: () => setState(() => _package = 'Message'),
        ),
        PackageOptionTile(
          icon: Icons.phone_outlined,
          label: 'Voice Call',
          selected: _package == 'Voice Call',
          onTap: () => setState(() => _package = 'Voice Call'),
        ),
        PackageOptionTile(
          icon: Icons.videocam_outlined,
          label: 'Video Call',
          selected: _package == 'Video Call',
          onTap: () => setState(() => _package = 'Video Call'),
        ),
      ],
    );
  }

  Widget _stepSchedule() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      children: [
        Text('Select Date', style: AppTypography.textTheme.titleMedium),
        const SizedBox(height: 12),
        DateOvalScroller(
          dates: _dates,
          selected: _selectedDate,
          onSelected: (d) => setState(() => _selectedDate = d),
        ),
        const SizedBox(height: 24),
        Text('Select Time', style: AppTypography.textTheme.titleMedium),
        const SizedBox(height: 12),
        TimeSlotRow(
          times: _times,
          selected: _time.isEmpty ? null : _time,
          onSelected: (t) => setState(() => _time = t),
        ),
        const SizedBox(height: 20),
        GlassCard(
          child: Column(
            children: [
              AppTextField(
                controller: _categoryController,
                label: 'Medical category',
                onChanged: (v) => _category = v,
              ),
              const SizedBox(height: 12),
              AppTextField(controller: _message, label: 'Notes (optional)', maxLines: 3),
            ],
          ),
        ),
      ],
    );
  }

  Widget _stepLocation() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      children: [
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
                        title: Text(p.description, style: AppTypography.body),
                        onTap: () {
                          setState(() {
                            _city = p.description.split(',').first.trim();
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
    );
  }
}
