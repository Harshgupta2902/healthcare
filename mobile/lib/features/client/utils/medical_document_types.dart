import 'package:flutter/material.dart';

/// Medical document type labels — aligned with web `ClientDocumentsList`.
abstract final class MedicalDocumentTypes {
  static const all = 'all';
  static const report = 'report';
  static const prescription = 'prescription';
  static const imaging = 'imaging';
  static const other = 'other';

  static const filterOptions = [
    (value: all, label: 'All Reports'),
    (value: report, label: 'Lab Reports'),
    (value: imaging, label: 'Imaging'),
    (value: prescription, label: 'Prescriptions'),
    (value: other, label: 'Other'),
  ];

  static const uploadOptions = [
    (value: report, label: 'Lab Report'),
    (value: imaging, label: 'Imaging'),
    (value: prescription, label: 'Prescription'),
    (value: other, label: 'Other'),
  ];

  static String label(String type) {
    return switch (type) {
      report => 'Lab Report',
      prescription => 'Prescription',
      imaging => 'Imaging',
      other => 'Other',
      _ => type,
    };
  }

  static IconData iconFor(String type) {
    return switch (type) {
      report => Icons.biotech_outlined,
      prescription => Icons.medication_outlined,
      imaging => Icons.monitor_heart_outlined,
      other => Icons.description_outlined,
      _ => Icons.insert_drive_file_outlined,
    };
  }
}
