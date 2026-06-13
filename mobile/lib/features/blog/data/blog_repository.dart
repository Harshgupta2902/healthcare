import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../../core/supabase/supabase_client.dart';
import '../../../shared/models/models.dart';

final blogRepositoryProvider = Provider<BlogRepository>((ref) {
  return BlogRepository(supabase: ref.watch(supabaseClientProvider));
});

class BlogRepository {
  BlogRepository({required SupabaseClient supabase}) : _supabase = supabase;

  final SupabaseClient _supabase;

  static const _postSelect =
      '*, blog_categories(name), author:users!blog_posts_author_id_fkey(name)';

  static const _commentSelect =
      '*, author:users!blog_comments_user_id_fkey(name)';

  Future<List<BlogPostItem>> getPublishedPosts({String? categoryId}) async {
    var query = _supabase
        .from('blog_posts')
        .select(_postSelect)
        .eq('status', 'published');

    if (categoryId != null && categoryId.isNotEmpty) {
      query = query.eq('category_id', categoryId);
    }

    final rows = await query.order('published_at', ascending: false);
    return (rows as List)
        .map((e) => BlogPostItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<BlogPostDetail?> getPostBySlug(String slug) async {
    final uid = _supabase.auth.currentUser?.id;

    final row = await _supabase
        .from('blog_posts')
        .select(_postSelect)
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

    if (row == null) return null;

    var likedByMe = false;
    if (uid != null) {
      final like = await _supabase
          .from('blog_post_likes')
          .select('post_id')
          .eq('post_id', row['id'] as String)
          .eq('user_id', uid)
          .maybeSingle();
      likedByMe = like != null;
    }

    await _supabase.rpc('increment_blog_post_view', params: {
      'p_post_id': row['id'],
      'p_viewer_key': uid ?? 'anon',
    });

    return BlogPostDetail.fromJson(
      Map<String, dynamic>.from(row),
      likedByMe: likedByMe,
    );
  }

  Future<List<BlogCommentItem>> getComments(String postId) async {
    final rows = await _supabase
        .from('blog_comments')
        .select(_commentSelect)
        .eq('post_id', postId)
        .eq('status', 'approved')
        .isFilter('deleted_at', null)
        .order('created_at', ascending: true);

    return (rows as List)
        .map((e) => BlogCommentItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  Future<BlogCommentItem> addComment({
    required String postId,
    required String body,
    String? parentId,
  }) async {
    final uid = _supabase.auth.currentUser?.id;
    if (uid == null) throw const AuthException('Sign in to comment');

    final row = await _supabase
        .from('blog_comments')
        .insert({
          'post_id': postId,
          'user_id': uid,
          'body': body,
          if (parentId != null) 'parent_id': parentId,
        })
        .select(_commentSelect)
        .single();

    return BlogCommentItem.fromJson(Map<String, dynamic>.from(row));
  }

  Future<int> toggleLike(String postId) async {
    final uid = _supabase.auth.currentUser?.id;
    if (uid == null) throw const AuthException('Sign in to like posts');

    final result = await _supabase.rpc('toggle_blog_post_like', params: {
      'p_post_id': postId,
      'p_user_id': uid,
    });

    return (result as num?)?.toInt() ?? 0;
  }
}

final blogPostsProvider = FutureProvider<List<BlogPostItem>>((ref) async {
  return ref.watch(blogRepositoryProvider).getPublishedPosts();
});

final blogPostDetailProvider =
    FutureProvider.family<BlogPostDetail?, String>((ref, slug) async {
  return ref.watch(blogRepositoryProvider).getPostBySlug(slug);
});

final blogCommentsProvider =
    FutureProvider.family<List<BlogCommentItem>, String>((ref, postId) async {
  return ref.watch(blogRepositoryProvider).getComments(postId);
});
