import 'package:flutter/material.dart';
import '../../../core/theme/app_typography.dart';
import '../../../shared/widgets/empty_state.dart';

class ChatScreen extends StatelessWidget {
  const ChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
            child: Text('Chat', style: AppTypography.pageTitle.copyWith(fontSize: 24)),
          ),
          const Expanded(
            child: Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: EmptyState(
                  title: 'Messages coming soon',
                  subtitle: 'Chat with your doctors and care team directly from here.',
                  icon: Icons.chat_bubble_outline_rounded,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
