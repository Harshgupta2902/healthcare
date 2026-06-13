import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';
import '../../../shared/widgets/glass_card.dart';
import '../../../shared/widgets/section_header.dart';
import '../data/blog_repository.dart';

class BlogListScreen extends ConsumerWidget {
  const BlogListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final posts = ref.watch(blogPostsProvider);
    final dateFmt = DateFormat('MMM d, yyyy');

    return SafeArea(
      child: posts.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (list) {
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(blogPostsProvider),
            color: AppColors.brand,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
              children: [
                const SectionHeader(
                  title: 'Health insights',
                  subtitle: 'Articles from verified professionals',
                ),
                if (list.isEmpty)
                  const EmptyState(
                    title: 'No articles yet',
                    subtitle: 'Check back soon for new health content.',
                    icon: Icons.article_outlined,
                  )
                else
                  ...list.map((post) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: GlassCard(
                        onTap: () => context.push('/blog/${post.slug}'),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (post.coverImageUrl != null)
                              ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: CachedNetworkImage(
                                  imageUrl: post.coverImageUrl!,
                                  height: 140,
                                  width: double.infinity,
                                  fit: BoxFit.cover,
                                ),
                              ),
                            if (post.coverImageUrl != null) const SizedBox(height: 12),
                            if (post.categoryName != null)
                              Text(
                                post.categoryName!.toUpperCase(),
                                style: AppTypography.sectionLabel.copyWith(fontSize: 10),
                              ),
                            Text(post.title, style: AppTypography.textTheme.titleMedium),
                            if (post.excerpt != null) ...[
                              const SizedBox(height: 6),
                              Text(
                                post.excerpt!,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: AppTypography.pageSubtitle,
                              ),
                            ],
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                if (post.publishedAt != null)
                                  Text(
                                    dateFmt.format(post.publishedAt!),
                                    style: AppTypography.pageSubtitle.copyWith(fontSize: 12),
                                  ),
                                const Spacer(),
                                const Icon(Icons.favorite_border, size: 14, color: AppColors.onSurfaceVariant),
                                const SizedBox(width: 4),
                                Text('${post.likeCount}', style: AppTypography.pageSubtitle.copyWith(fontSize: 12)),
                                const SizedBox(width: 12),
                                const Icon(Icons.chat_bubble_outline, size: 14, color: AppColors.onSurfaceVariant),
                                const SizedBox(width: 4),
                                Text('${post.commentCount}', style: AppTypography.pageSubtitle.copyWith(fontSize: 12)),
                              ],
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
              ],
            ),
          );
        },
      ),
    );
  }
}
