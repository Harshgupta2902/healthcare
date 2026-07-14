import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Bottom tab bar — scrollable when many tabs (matches web dashboard mobile nav).
class GlassNavBar extends StatelessWidget {
  const GlassNavBar({
    super.key,
    required this.selectedIndex,
    required this.onSelected,
    required this.destinations,
    this.scrollable = false,
  });

  final int selectedIndex;
  final ValueChanged<int> onSelected;
  final List<GlassNavDestination> destinations;
  final bool scrollable;

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.paddingOf(context).bottom;

    final items = [
      for (var i = 0; i < destinations.length; i++)
        _NavItem(
          destination: destinations[i],
          selected: i == selectedIndex,
          onTap: () => onSelected(i),
          compact: scrollable,
        ),
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.outline.withValues(alpha: 0.25))),
        boxShadow: [
          BoxShadow(
            color: AppColors.onSurface.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      padding: EdgeInsets.fromLTRB(8, 8, 8, bottom + 8),
      child: scrollable
          ? SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: items),
            )
          : Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                for (var i = 0; i < items.length; i++) Expanded(child: items[i]),
              ],
            ),
    );
  }
}

class GlassNavDestination {
  const GlassNavDestination({
    required this.label,
    required this.icon,
    required this.selectedIcon,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.destination,
    required this.selected,
    required this.onTap,
    this.compact = false,
  });

  final GlassNavDestination destination;
  final bool selected;
  final VoidCallback onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    const activeColor = AppColors.brand;
    final inactiveColor = AppColors.onSurfaceVariant.withValues(alpha: 0.8);
    final color = selected ? activeColor : inactiveColor;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          constraints: BoxConstraints(minWidth: compact ? 72 : 0),
          padding: EdgeInsets.symmetric(horizontal: compact ? 12 : 4, vertical: 8),
          decoration: BoxDecoration(
            color: selected ? AppColors.brand.withValues(alpha: 0.1) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                selected ? destination.selectedIcon : destination.icon,
                size: 22,
                color: color,
              ),
              const SizedBox(height: 4),
              Text(
                destination.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.fieldLabel.copyWith(
                  fontSize: 10,
                  color: color,
                  fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
