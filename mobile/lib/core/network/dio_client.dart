import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../config/env.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(
    BaseOptions(
      baseUrl: Env.apiBaseUrl.isNotEmpty ? Env.apiBaseUrl : 'http://localhost:3000',
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) {
        final session = Supabase.instance.client.auth.currentSession;
        final token = session?.accessToken;
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
    ),
  );

  return dio;
});

/// Standard API response envelope from Next.js `/api/v1/*` routes.
class ApiResponse<T> {
  const ApiResponse({required this.success, this.data, this.error});

  final bool success;
  final T? data;
  final Map<String, dynamic>? error;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic)? parseData,
  ) {
    return ApiResponse(
      success: json['success'] as bool? ?? false,
      data: json['data'] != null && parseData != null ? parseData(json['data']) : null,
      error: json['error'] as Map<String, dynamic>?,
    );
  }
}
