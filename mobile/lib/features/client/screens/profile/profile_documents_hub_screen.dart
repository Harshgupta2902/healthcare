import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:healthhere_mobile/features/client/data/client_repository.dart';
import 'package:healthhere_mobile/features/client/utils/medical_document_types.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_radii.dart';
import '../../../../core/theme/app_typography.dart';
import '../../../../shared/models/models.dart';
import '../../../../shared/widgets/empty_state.dart';
import '../../../../shared/widgets/glass_card.dart';

class ProfileDocumentsHubScreen extends ConsumerStatefulWidget {
  const ProfileDocumentsHubScreen({super.key});

  @override
  ConsumerState<ProfileDocumentsHubScreen> createState() => _ProfileDocumentsHubScreenState();
}

class _ProfileDocumentsHubScreenState extends ConsumerState<ProfileDocumentsHubScreen> {
  String _query = '';
  String _filter = MedicalDocumentTypes.all;

  List<MedicalDocumentItem> _filterDocs(List<MedicalDocumentItem> docs) {
    return docs.where((d) {
      final matchesType = _filter == MedicalDocumentTypes.all || d.documentType == _filter;
      final q = _query.trim().toLowerCase();
      final matchesQuery = q.isEmpty ||
          d.documentName.toLowerCase().contains(q) ||
          (d.notes?.toLowerCase().contains(q) ?? false);
      return matchesType && matchesQuery;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final dashboard = ref.watch(clientDashboardProvider);

    return Scaffold(
      backgroundColor: AppColors.surfaceContainerLowest,
      body: dashboard.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (data) {
          final filtered = _filterDocs(data.documents);
          final labCount =
              data.documents.where((d) => d.documentType == MedicalDocumentTypes.report).length;
          final imagingCount =
              data.documents.where((d) => d.documentType == MedicalDocumentTypes.imaging).length;
          final otherCount = data.documents.length - labCount - imagingCount;

          return RefreshIndicator(
            color: AppColors.brand,
            onRefresh: () async => ref.invalidate(clientDashboardProvider),
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: _DocumentsHeader(
                    onBack: () => context.pop(),
                    onUpload: () => context.push('/profile/documents/upload'),
                  ),
                ),
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                    child: Column(
                      children: [
                        TextField(
                          onChanged: (v) => setState(() => _query = v),
                          decoration: InputDecoration(
                            hintText: 'Search Reports...',
                            prefixIcon: const Icon(Icons.search, size: 20),
                            filled: true,
                            fillColor: Colors.white,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(AppRadii.pill),
                              borderSide: BorderSide.none,
                            ),
                            contentPadding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(AppRadii.lg),
                                ),
                                child: DropdownButtonHideUnderline(
                                  child: DropdownButton<String>(
                                    value: _filter,
                                    isExpanded: true,
                                    items: MedicalDocumentTypes.filterOptions
                                        .map(
                                          (o) => DropdownMenuItem(
                                            value: o.value,
                                            child: Text(o.label, style: AppTypography.bodyMedium),
                                          ),
                                        )
                                        .toList(),
                                    onChanged: (v) {
                                      if (v != null) setState(() => _filter = v);
                                    },
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            FilledButton.icon(
                              onPressed: () => context.push('/profile/documents/upload'),
                              style: FilledButton.styleFrom(
                                backgroundColor: AppColors.brand,
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(AppRadii.lg),
                                ),
                              ),
                              icon: const Icon(Icons.upload_rounded, size: 18),
                              label: const Text('Upload'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: _StatChip(
                                label: 'Total Reports',
                                count: data.documents.length,
                                color: const Color(0xFFFFE8E8),
                                textColor: const Color(0xFFE57373),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _StatChip(
                                label: 'Lab Reports',
                                count: labCount,
                                color: const Color(0xFFE8F4FC),
                                textColor: AppColors.brand,
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: _StatChip(
                                label: 'Other',
                                count: otherCount + imagingCount,
                                color: const Color(0xFFF0E8FF),
                                textColor: const Color(0xFF7E57C2),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                if (filtered.isEmpty)
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: EmptyState(
                        icon: Icons.folder_open_outlined,
                        title: 'Your document vault is empty',
                        subtitle: 'Upload lab reports, prescriptions, and imaging files securely.',
                        actionLabel: 'Upload Report',
                        onAction: () => context.push('/profile/documents/upload'),
                      ),
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                    sliver: SliverList.separated(
                      itemCount: filtered.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (_, i) => _DocumentCard(
                        doc: filtered[i],
                        onDelete: () async {
                          final ok = await showDialog<bool>(
                            context: context,
                            builder: (ctx) => AlertDialog(
                              title: const Text('Delete report?'),
                              content: const Text('This will permanently remove the file.'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx, false),
                                  child: const Text('Cancel'),
                                ),
                                TextButton(
                                  onPressed: () => Navigator.pop(ctx, true),
                                  child: const Text('Delete'),
                                ),
                              ],
                            ),
                          );
                          if (ok == true) {
                            await ref.read(clientRepositoryProvider).deleteDocument(filtered[i].id);
                            ref.invalidate(clientDashboardProvider);
                          }
                        },
                      ),
                    ),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _DocumentsHeader extends StatelessWidget {
  const _DocumentsHeader({required this.onBack, required this.onUpload});

  final VoidCallback onBack;
  final VoidCallback onUpload;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.fromLTRB(8, MediaQuery.paddingOf(context).top + 8, 20, 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF2B9FD9), Color(0xFF5EC4C4)],
        ),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(28),
          bottomRight: Radius.circular(28),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              IconButton(
                onPressed: onBack,
                icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
              ),
              Expanded(
                child: Text(
                  'Medical Reports',
                  style: AppTypography.pageTitle.copyWith(color: Colors.white, fontSize: 22),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  const _StatChip({
    required this.label,
    required this.count,
    required this.color,
    required this.textColor,
  });

  final String label;
  final int count;
  final Color color;
  final Color textColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(AppRadii.lg),
      ),
      child: Column(
        children: [
          Text(
            count.toString().padLeft(2, '0'),
            style: AppTypography.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w800,
              color: textColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            textAlign: TextAlign.center,
            style: AppTypography.fieldLabel.copyWith(fontSize: 9, color: textColor),
          ),
        ],
      ),
    );
  }
}

class _DocumentCard extends StatelessWidget {
  const _DocumentCard({required this.doc, required this.onDelete});

  final MedicalDocumentItem doc;
  final VoidCallback onDelete;

  String _formatDate() {
    final d = doc.uploadDate;
    if (d == null) return '—';
    return DateFormat('MMM d, yyyy').format(d);
  }

  String? _doctorFromNotes() {
    final notes = doc.notes?.trim();
    if (notes == null || notes.isEmpty) return null;
    if (notes.startsWith('Doctor:')) return notes.replaceFirst('Doctor:', '').trim();
    return notes;
  }

  @override
  Widget build(BuildContext context) {
    final doctor = _doctorFromNotes();

    return GlassCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: const Color(0xFFE8F4FC),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              MedicalDocumentTypes.iconFor(doc.documentType),
              color: AppColors.brand,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  doc.documentName,
                  style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700),
                ),
                if (doctor != null) ...[
                  const SizedBox(height: 2),
                  Text(doctor, style: AppTypography.pageSubtitle.copyWith(fontSize: 12)),
                ],
                const SizedBox(height: 4),
                Text(_formatDate(), style: AppTypography.pageSubtitle.copyWith(fontSize: 12)),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerLow,
                    borderRadius: BorderRadius.circular(AppRadii.pill),
                  ),
                  child: Text(
                    MedicalDocumentTypes.label(doc.documentType),
                    style: AppTypography.fieldLabel.copyWith(fontSize: 10),
                  ),
                ),
              ],
            ),
          ),
          Column(
            children: [
              IconButton(
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.visibility_outlined, color: AppColors.brand, size: 20),
                onPressed: () => launchUrl(Uri.parse(doc.fileUrl), mode: LaunchMode.externalApplication),
              ),
              IconButton(
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.download_outlined, color: AppColors.tealSoft, size: 20),
                onPressed: () => launchUrl(Uri.parse(doc.fileUrl), mode: LaunchMode.externalApplication),
              ),
              IconButton(
                visualDensity: VisualDensity.compact,
                icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
                onPressed: onDelete,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
