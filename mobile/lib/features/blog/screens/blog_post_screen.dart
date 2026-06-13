import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
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
      appBar: AppBar(title: const Text('Article')),
      body: post.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
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
              padding: const EdgeInsets.all(20),
              children: [
                if (detail.coverImageUrl != null)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: CachedNetworkImage(
                      imageUrl: detail.coverImageUrl!,
                      height: 200,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                const SizedBox(height: 16),
                if (detail.categoryName != null)
                  Text(detail.categoryName!.toUpperCase(), style: AppTypography.sectionLabel),
                Text(detail.title, style: AppTypography.pageTitle),
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
                Row(
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
                    Text('${detail.likeCount}'),
                    const SizedBox(width: 16),
                    const Icon(Icons.remove_red_eye_outlined, size: 18),
                    const SizedBox(width: 4),
                    Text('${detail.viewCount}'),
                  ],
                ),
                const SizedBox(height: 8),
                Html(
                  data: detail.contentHtml,
                  style: {
                    'body': Style(
                      margin: Margins.zero,
                      fontSize: FontSize(15),
                      lineHeight: const LineHeight(1.5),
                    ),
                  },
                ),
                const SizedBox(height: 24),
                Text('COMMENTS', style: AppTypography.sectionLabel),
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
                        .map(
                          (c) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: GlassCard(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    c.authorName ?? 'Reader',
                                    style: AppTypography.textTheme.titleSmall,
                                  ),
                                  const SizedBox(height: 4),
                                  Text(c.body, style: AppTypography.body),
                                ],
                              ),
                            ),
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
    );
  }
}
