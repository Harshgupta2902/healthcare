abstract final class ApiEndpoints {
  static const syncSession = '/api/v1/auth/sync-session';
  static const registerOtp = '/api/v1/auth/register-otp';
  static const verifyOtp = '/api/v1/auth/verify-otp';
  static const placesSearch = '/api/v1/places/search';
  static String bookingOrderRazorpay(String orderId) =>
      '/api/v1/booking/orders/$orderId/razorpay';
  static String bookingOrderVerify(String orderId) =>
      '/api/v1/booking/orders/$orderId/verify';
  static String bookingOrderConfirmFree(String orderId) =>
      '/api/v1/booking/orders/$orderId/confirm-free';
  static const meetingsCreate = '/api/v1/meetings/create';
  static const meetingsGuestPipeline = '/api/v1/meetings/guest/pipeline';
  static const contact = '/api/v1/contact';
  static const newsletterUnsubscribe = '/api/v1/newsletter/unsubscribe';
  static const universitiesSearch = '/api/v1/universities/search';
  static const prescriptionsSend = '/api/v1/prescriptions/send';
}
