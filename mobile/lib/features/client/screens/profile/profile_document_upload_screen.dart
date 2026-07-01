import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/primary_button.dart';
import '../../data/client_repository.dart';
import '../../utils/medical_document_types.dart';

class ProfileDocumentUploadScreen extends ConsumerStatefulWidget {
  const ProfileDocumentUploadScreen({super.key});

  @override
  ConsumerState<ProfileDocumentUploadScreen> createState() => _ProfileDocumentUploadScreenState();
}

class _ProfileDocumentUploadScreenState extends ConsumerState<ProfileDocumentUploadScreen> {
  final _title = TextEditingController();
  final _doctor = TextEditingController();
  String _documentType = MedicalDocumentTypes.report;
  DateTime? _reportDate;
  PlatformFile? _pickedFile;
  bool _uploading = false;

  static const _maxBytes = 10 * 1024 * 1024;

  @override
  void dispose() {
    _title.dispose();
    _doctor.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      withData: true,
    );
    if (result == null || result.files.isEmpty) return;
    final file = result.files.first;
    if (file.size > _maxBytes) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('File must be 10MB or smaller.')),
        );
      }
      return;
    }
    setState(() => _pickedFile = file);
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _reportDate ?? now,
      firstDate: DateTime(now.year - 10),
      lastDate: now,
    );
    if (picked != null) setState(() => _reportDate = picked);
  }

  Future<void> _submit() async {
    if (_title.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Report title is required.')),
      );
      return;
    }
    if (_reportDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Report date is required.')),
      );
      return;
    }
    final file = _pickedFile;
    if (file == null || file.bytes == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a file to upload.')),
      );
      return;
    }

    setState(() => _uploading = true);
    try {
      final notesParts = <String>[
        if (_doctor.text.trim().isNotEmpty) 'Doctor: ${_doctor.text.trim()}',
        'Report date: ${DateFormat('yyyy-MM-dd').format(_reportDate!)}',
      ];

      await ref.read(clientRepositoryProvider).uploadDocument(
            documentName: _title.text.trim(),
            documentType: _documentType,
            fileName: file.name,
            bytes: Uint8List.fromList(file.bytes!),
            notes: notesParts.join('\n'),
            mimeType: _mimeForExtension(file.extension),
          );

      ref.invalidate(clientDashboardProvider);
      if (!mounted) return;
      context.go('/profile/documents/upload/success');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  String? _mimeForExtension(String? ext) {
    return switch (ext?.toLowerCase()) {
      'pdf' => 'application/pdf',
      'jpg' || 'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      _ => null,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Text(
          'Upload Medical Report',
          style: AppTypography.pageTitle.copyWith(fontSize: 18),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          AppTextField(
            controller: _title,
            hint: 'e.g., Blood Test Report',
            prefixIcon: Icons.title_outlined,
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(AppRadii.lg),
              border: Border.all(color: AppColors.outline.withValues(alpha: 0.3)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _documentType,
                isExpanded: true,
                items: MedicalDocumentTypes.uploadOptions
                    .map(
                      (o) => DropdownMenuItem(
                        value: o.value,
                        child: Text('Report Type: ${o.label}'),
                      ),
                    )
                    .toList(),
                onChanged: (v) {
                  if (v != null) setState(() => _documentType = v);
                },
              ),
            ),
          ),
          const SizedBox(height: 16),
          InkWell(
            onTap: _pickDate,
            borderRadius: BorderRadius.circular(AppRadii.lg),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLowest,
                borderRadius: BorderRadius.circular(AppRadii.lg),
                border: Border.all(color: AppColors.outline.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Icon(Icons.calendar_today_outlined, color: AppColors.onSurfaceVariant, size: 20),
                  const SizedBox(width: 12),
                  Text(
                    _reportDate != null
                        ? DateFormat('dd/MM/yyyy').format(_reportDate!)
                        : 'Report date * (dd/mm/yyyy)',
                    style: AppTypography.bodyMedium.copyWith(
                      color: _reportDate != null
                          ? AppColors.onSurface
                          : AppColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          AppTextField(
            controller: _doctor,
            hint: 'e.g., Dr. Sarah Wilson',
            prefixIcon: Icons.person_outline,
          ),
          const SizedBox(height: 20),
          Text('Upload File *', style: AppTypography.fieldLabel),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: _uploading ? null : _pickFile,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.surfaceAlt,
                borderRadius: BorderRadius.circular(AppRadii.xl),
                border: Border.all(
                  color: AppColors.outline.withValues(alpha: 0.4),
                  style: BorderStyle.solid,
                ),
              ),
              child: Column(
                children: [
                  Icon(Icons.cloud_upload_outlined, size: 40, color: AppColors.onSurfaceVariant),
                  const SizedBox(height: 8),
                  Text(
                    _pickedFile?.name ?? 'Click to upload file',
                    textAlign: TextAlign.center,
                    style: AppTypography.bodyMedium.copyWith(
                      fontWeight: _pickedFile != null ? FontWeight.w600 : FontWeight.w400,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'PDF, JPG, PNG up to 10MB',
                    style: AppTypography.pageSubtitle.copyWith(fontSize: 12),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 28),
          PrimaryGradientButton(
            label: _uploading ? 'Uploading…' : 'Upload Report',
            isLoading: _uploading,
            onPressed: _uploading ? null : _submit,
            gradient: const LinearGradient(
              colors: [AppColors.tealSoft, Color(0xFF45B8B8)],
            ),
          ),
        ],
      ),
    );
  }
}
