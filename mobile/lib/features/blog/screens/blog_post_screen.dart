import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/ambient_background.dart';
import '../../../shared/widgets/app_text_field.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/primary_button.dart';
import '../data/blog_repository.dart';

class BlogPostScreen extends ConsumerStatefulWidget {
  const BlogPostScreen({super.key, required this.slug});

  final String slug;

  @override
  ConsumerState<BlogPostScreen> createState() => _BlogPostScreenState();
}

class _BlogPostScreenState extends ConsumerState<BlogPostScreen> {
  final _commentController = TextEditingController();
  bool _submitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final post = ref.watch(blogPostDetailProvider(widget.slug));
    final dateFmt = DateFormat('MMMM d, yyyy');

    return Scaffold(
      backgroundColor: AppColors.surface,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Article'),
      ),
      body: AmbientBackground(
        child: post.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
          error: (e, _) => Center(child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(e.toString(), textAlign: TextAlign.center),
          )),
          data: (detail) {
            if (detail == null) {
              return const Center(child: Text('Article not found'));
            }

            final comments = ref.watch(blogCommentsProvider(detail.id));

            return RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(blogPostDetailProvider(widget.slug));
                ref.invalidate(blogCommentsProvider(detail.id));
              },
              color: AppColors.brand,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
                children: [
                  if (detail.coverImageUrl != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(AppRadii.xl),
                      child: CachedNetworkImage(
                        imageUrl: detail.coverImageUrl!,
                        height: 200,
                        width: double.infinity,
                        fit: BoxFit.cover,
                      ),
                    ).animate().fadeIn(duration: 400.ms),
                  const SizedBox(height: 16),
                  if (detail.categoryName != null)
                    Text(detail.categoryName!.toUpperCase(), style: AppTypography.sectionLabel),
                  Text(detail.title, style: AppTypography.pageTitle.copyWith(fontSize: 24)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      if (detail.authorName != null)
                        Text(detail.authorName!, style: AppTypography.pageSubtitle),
                      if (detail.publishedAt != null) ...[
                        const Text(' • '),
                        Text(dateFmt.format(detail.publishedAt!), style: AppTypography.pageSubtitle),
                      ],
                    ],
                  ),
                  const SizedBox(height: 12),
                  GlassCard(
                    elevated: false,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: Row(
                      children: [
                        IconButton(
                          icon: Icon(
                            detail.likedByMe ? Icons.favorite : Icons.favorite_border,
                            color: detail.likedByMe ? AppColors.brand : null,
                          ),
                          onPressed: () async {
                            await ref.read(blogRepositoryProvider).toggleLike(detail.id);
                            ref.invalidate(blogPostDetailProvider(widget.slug));
                          },
                        ),
                        Text('${detail.likeCount} likes'),
                        const Spacer(),
                        const Icon(Icons.remove_red_eye_outlined, size: 18, color: AppColors.brand),
                        const SizedBox(width: 4),
                        Text('${detail.viewCount}'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 12),
                  Html(
                    data: detail.contentHtml,
                    style: {
                      'body': Style(
                        margin: Margins.zero,
                        fontSize: FontSize(15),
                        lineHeight: const LineHeight(1.6),
                        color: AppColors.onSurface,
                      ),
                    },
                  ),
                  const SizedBox(height: 24),
                  Text('Comments', style: AppTypography.textTheme.titleMedium),
                  const SizedBox(height: 12),
                  GlassCard(
                    child: Column(
                      children: [
                        AppTextField(
                          controller: _commentController,
                          label: 'Add a comment',
                          maxLines: 3,
                        ),
                        const SizedBox(height: 12),
                        PrimaryGradientButton(
                          label: _submitting ? 'Posting…' : 'Post comment',
                          isLoading: _submitting,
                          onPressed: _submitting
                              ? null
                              : () async {
                                  final body = _commentController.text.trim();
                                  if (body.isEmpty) return;
                                  setState(() => _submitting = true);
                                  try {
                                    await ref.read(blogRepositoryProvider).addComment(
                                          postId: detail.id,
                                          body: body,
                                        );
                                    _commentController.clear();
                                    ref.invalidate(blogCommentsProvider(detail.id));
                                    ref.invalidate(blogPostDetailProvider(widget.slug));
                                  } finally {
                                    if (mounted) setState(() => _submitting = false);
                                  }
                                },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  comments.when(
                    loading: () => const LinearProgressIndicator(color: AppColors.brand),
                    error: (e, _) => Text(e.toString()),
                    data: (items) => Column(
                      children: items
                          .asMap()
                          .entries
                          .map(
                            (e) => Padding(
                              padding: const EdgeInsets.only(bottom: 8),
                              child: GlassCard(
                                elevated: false,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      e.value.authorName ?? 'Reader',
                                      style: AppTypography.textTheme.titleMedium,
                                    ),
                                    const SizedBox(height: 4),
                                    Text(e.value.body, style: AppTypography.body),
                                  ],
                                ),
                              )
                                  .animate(delay: (50 * e.key).ms)
                                  .fadeIn(duration: 350.ms),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}
