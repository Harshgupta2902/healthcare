import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/models/models.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../../shared/widgets/section_header.dart';
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
  String _date = '';
  String _time = '';
  List<PlacePrediction> _placeResults = [];

  static const _times = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
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
      final profile = await ref
          .read(consultantsRepositoryProvider)
          .getByUserId(widget.professionalUserId);

      final id = await ref.read(bookingRepositoryProvider).submitGuestBooking(
            firstName: _firstName.text.trim(),
            lastName: _lastName.text.trim(),
            age: int.parse(_age.text.trim()),
            phone: _phone.text.trim(),
            email: _email.text.trim(),
            category: _category.isNotEmpty ? _category : (profile?.specialization ?? 'General'),
            state: _state,
            city: _city,
            date: _date,
            time: _time,
            professionalId: widget.professionalUserId,
            message: _message.text.trim().isEmpty ? null : _message.text.trim(),
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

  void _next() {
    if (_step < 2) {
      setState(() => _step++);
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    } else {
      _submit();
    }
  }

  void _back() {
    if (_step > 0) {
      setState(() => _step--);
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    } else {
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final consultant = ref.watch(consultantDetailProvider(widget.professionalUserId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Book consultation'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: _back),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
            child: Row(
              children: List.generate(3, (i) {
                final active = i <= _step;
                return Expanded(
                  child: Container(
                    height: 4,
                    margin: EdgeInsets.only(right: i < 2 ? 6 : 0),
                    decoration: BoxDecoration(
                      color: active ? AppColors.brand : AppColors.surfaceContainer,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                );
              }),
            ),
          ),
          consultant.when(
            data: (p) => p != null
                ? Padding(
                    padding: const EdgeInsets.all(20),
                    child: SectionHeader(
                      title: 'With ${p.displayName}',
                      subtitle: p.specialization ?? 'Healthcare professional',
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
                _stepPersonal(),
                _stepLocation(),
                _stepSchedule(),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: PrimaryGradientButton(
              label: _step < 2 ? 'Continue' : (_submitting ? 'Booking…' : 'Confirm booking'),
              isLoading: _submitting,
              onPressed: _submitting ? null : _next,
            ),
          ),
        ],
      ),
    );
  }

  Widget _stepPersonal() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      children: [
        Text('YOUR DETAILS', style: AppTypography.sectionLabel),
        const SizedBox(height: 12),
        GlassCard(
          child: Column(
            children: [
              AppTextField(controller: _firstName, label: 'First name'),
              const SizedBox(height: 12),
              AppTextField(controller: _lastName, label: 'Last name'),
              const SizedBox(height: 12),
              AppTextField(controller: _age, label: 'Age', keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              AppTextField(controller: _phone, label: 'Phone (10 digits)', keyboardType: TextInputType.phone),
              const SizedBox(height: 12),
              AppTextField(controller: _email, label: 'Email', keyboardType: TextInputType.emailAddress),
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
        Text('LOCATION', style: AppTypography.sectionLabel),
        const SizedBox(height: 12),
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AppTextField(
                controller: _citySearch,
                label: 'Search city',
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

  Widget _stepSchedule() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      children: [
        Text('SCHEDULE', style: AppTypography.sectionLabel),
        const SizedBox(height: 12),
        GlassCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AppTextField(
                controller: _categoryController,
                label: 'Medical category',
                onChanged: (v) => _category = v,
              ),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text(_date.isEmpty ? 'Select date' : _date, style: AppTypography.bodyMedium),
                trailing: const Icon(Icons.calendar_today_outlined),
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 90)),
                    initialDate: DateTime.now().add(const Duration(days: 1)),
                  );
                  if (picked != null) {
                    setState(() => _date =
                        '${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}');
                  }
                },
              ),
              const Divider(),
              Text('Preferred time', style: AppTypography.fieldLabel),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _times.map((t) {
                  final selected = _time == t;
                  return ChoiceChip(
                    label: Text(t),
                    selected: selected,
                    onSelected: (_) => setState(() => _time = t),
                    selectedColor: AppColors.brand.withValues(alpha: 0.2),
                  );
                }).toList(),
              ),
              const SizedBox(height: 12),
              AppTextField(controller: _message, label: 'Message (optional)', maxLines: 3),
            ],
          ),
        ),
      ],
    );
  }
}
