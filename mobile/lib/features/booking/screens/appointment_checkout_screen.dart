import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/booking_repository.dart';
import '../models/booking_models.dart';
import '../widgets/payment_success_dialog.dart';

class AppointmentCheckoutScreen extends ConsumerStatefulWidget {
  const AppointmentCheckoutScreen({super.key, required this.professionalUserId});

  final String professionalUserId;

  @override
  ConsumerState<AppointmentCheckoutScreen> createState() => _AppointmentCheckoutScreenState();
}

class _AppointmentCheckoutScreenState extends ConsumerState<AppointmentCheckoutScreen> {
  Razorpay? _razorpay;
  bool _processing = false;
  String? _orderId;
  CreateBookingOrderResult? _orderResult;

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay!.on(Razorpay.EVENT_PAYMENT_SUCCESS, _onPaymentSuccess);
    _razorpay!.on(Razorpay.EVENT_PAYMENT_ERROR, _onPaymentError);
    _razorpay!.on(Razorpay.EVENT_EXTERNAL_WALLET, _onExternalWallet);
  }

  @override
  void dispose() {
    _razorpay?.clear();
    super.dispose();
  }

  BookingDraft? get _draft => ref.read(bookingDraftProvider);

  String _formatDateLabel(String ymd, String time) {
    try {
      final parts = ymd.split('-');
      final date = DateTime(int.parse(parts[0]), int.parse(parts[1]), int.parse(parts[2]));
      final dateLabel = DateFormat('EEEE, MMM d, yyyy').format(date);
      return '$dateLabel | $time';
    } catch (_) {
      return '$ymd | $time';
    }
  }

  String _formatFee(int paise) {
    if (paise <= 0) return 'Free';
    return '₹ ${(paise / 100).toStringAsFixed(2)}';
  }

  Future<void> _handleBooking() async {
    final draft = _draft;
    if (draft == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Booking session expired. Please start again.')),
      );
      context.pop();
      return;
    }

    setState(() => _processing = true);
    try {
      final order = await ref.read(bookingRepositoryProvider).createBookingOrder(
            professionalId: draft.professionalUserId,
            holdId: draft.hold.holdId,
            snapshot: draft.snapshot,
          );

      setState(() {
        _orderId = order.orderId;
        _orderResult = order;
      });

      if (order.amountPaise <= 0) {
        await _fulfillFree(order.orderId);
        return;
      }

      if (order.paymentProvider != 'razorpay' || order.razorpayKeyId == null) {
        throw Exception('Razorpay is not configured.');
      }

      final checkout = await ref.read(bookingRepositoryProvider).createRazorpayCheckoutOrder(
            order.orderId,
          );

      final options = {
        'key': order.razorpayKeyId,
        'amount': checkout.amount,
        'currency': checkout.currency,
        'name': 'HealthHere',
        'order_id': checkout.orderId,
        'prefill': {
          'contact': draft.snapshot.phone,
          'email': draft.snapshot.email,
          'name': draft.snapshot.patientLabel,
        },
      };

      _razorpay!.open(options);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _processing = false);
    }
  }

  Future<void> _fulfillFree(String orderId) async {
    setState(() => _processing = true);
    try {
      final result = await ref.read(bookingRepositoryProvider).confirmFreeBookingOrder(orderId);
      await _runPipelineAndFinalize(result);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _processing = false);
    }
  }

  void _onPaymentSuccess(PaymentSuccessResponse response) async {
    final orderId = _orderId;
    if (orderId == null) return;

    setState(() => _processing = true);
    try {
      final result = await ref.read(bookingRepositoryProvider).verifyRazorpayPayment(
            orderId: orderId,
            razorpayOrderId: response.orderId ?? '',
            razorpayPaymentId: response.paymentId ?? '',
            razorpaySignature: response.signature ?? '',
          );
      await _runPipelineAndFinalize(result);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _processing = false);
    }
  }

  void _onPaymentError(PaymentFailureResponse response) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response.message ?? 'Payment failed')),
      );
    }
  }

  void _onExternalWallet(ExternalWalletResponse response) {}

  Future<void> _runPipelineAndFinalize(PaymentFulfillmentResult result) async {
    try {
      await ref.read(bookingRepositoryProvider).runMeetingPipeline(result.guestAppointmentId);
    } catch (_) {}

    await ref.read(bookingRepositoryProvider).finalizeBookingOrder(
          orderId: result.orderId,
          guestAppointmentId: result.guestAppointmentId,
          transactionId: result.transactionId,
        );

    ref.read(bookingDraftProvider.notifier).state = null;

    if (!mounted) return;
    await showPaymentSuccessDialog(context);
  }

  @override
  Widget build(BuildContext context) {
    final draft = ref.watch(bookingDraftProvider);

    if (draft == null) {
      return Scaffold(
        backgroundColor: AppColors.surface,
        appBar: AppBar(title: const Text('Appointment')),
        body: const Center(child: Text('No booking in progress.')),
      );
    }

    final feePaise = draft.consultationFeePaise ?? _orderResult?.amountPaise ?? 0;
    final snapshot = draft.snapshot;

    return Scaffold(
      backgroundColor: AppColors.surfaceContainerLowest,
      appBar: AppBar(
        backgroundColor: AppColors.surfaceContainerLowest,
        elevation: 0,
        centerTitle: true,
        title: Text('Appointment', style: AppTypography.pageTitle.copyWith(fontSize: 18)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: AmbientBackground(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                children: [
                  const SizedBox(height: 16),
                  Center(
                    child: CircleAvatar(
                      radius: 52,
                      backgroundColor: AppColors.surfaceContainer,
                      backgroundImage: draft.consultantImageUrl != null
                          ? CachedNetworkImageProvider(draft.consultantImageUrl!)
                          : null,
                      child: draft.consultantImageUrl == null
                          ? const Icon(Icons.person_rounded, size: 48, color: AppColors.onSurfaceVariant)
                          : null,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    draft.consultantName ?? 'Your doctor',
                    textAlign: TextAlign.center,
                    style: AppTypography.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  if (draft.consultantSpecialization != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      draft.consultantSpecialization!,
                      textAlign: TextAlign.center,
                      style: AppTypography.body.copyWith(color: AppColors.onSurfaceVariant),
                    ),
                  ],
                  const SizedBox(height: 28),
                  _SummaryRow(
                    label: 'Date',
                    value: _formatDateLabel(snapshot.date, snapshot.time),
                    onChange: () => context.pop(),
                  ),
                  const SizedBox(height: 16),
                  _SummaryRow(
                    label: 'Reason',
                    value: snapshot.message.isEmpty ? 'Consultation' : snapshot.message,
                    onChange: () => context.pop(),
                  ),
                  const SizedBox(height: 28),
                  Text('Payment Detail', style: AppTypography.textTheme.titleMedium),
                  const SizedBox(height: 12),
                  _FeeRow(label: 'Consultation', amount: _formatFee(feePaise)),
                  const Divider(height: 32),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Total', style: AppTypography.textTheme.titleMedium),
                      Text(
                        _formatFee(feePaise),
                        style: AppTypography.textTheme.titleMedium?.copyWith(
                          color: AppColors.tealSoft,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 28),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.06),
                    blurRadius: 16,
                    offset: const Offset(0, -4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Total',
                          style: AppTypography.body.copyWith(color: AppColors.onSurfaceVariant),
                        ),
                        Text(
                          _formatFee(feePaise),
                          style: AppTypography.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    flex: 2,
                    child: PrimaryGradientButton(
                      label: _processing ? 'Processing…' : 'Booking',
                      isLoading: _processing,
                      onPressed: _processing ? null : _handleBooking,
                      gradient: const LinearGradient(
                        colors: [AppColors.tealSoft, Color(0xFF45B8B8)],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    required this.onChange,
  });

  final String label;
  final String value;
  final VoidCallback onChange;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTypography.fieldLabel),
            GestureDetector(
              onTap: onChange,
              child: Text(
                'Change',
                style: AppTypography.bodyMedium.copyWith(color: AppColors.brand),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: AppColors.surfaceAlt,
            borderRadius: BorderRadius.circular(AppRadii.lg),
          ),
          child: Row(
            children: [
              Icon(
                label == 'Date' ? Icons.calendar_today_outlined : Icons.edit_outlined,
                size: 18,
                color: AppColors.onSurfaceVariant,
              ),
              const SizedBox(width: 12),
              Expanded(child: Text(value, style: AppTypography.bodyMedium)),
            ],
          ),
        ),
      ],
    );
  }
}

class _FeeRow extends StatelessWidget {
  const _FeeRow({required this.label, required this.amount});
  final String label;
  final String amount;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTypography.body.copyWith(color: AppColors.onSurfaceVariant)),
          Text(amount, style: AppTypography.bodyMedium),
        ],
      ),
    );
  }
}
