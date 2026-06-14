import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';

/// Bottom tab bar matching reference: Home · Book · My doctor · Chat · Profile.
class GlassNavBar extends StatelessWidget {
  const GlassNavBar({
    super.key,
    required this.selectedIndex,
    required this.onSelected,
    required this.destinations,
  });

  final int selectedIndex;
  final ValueChanged<int> onSelected;
  final List<GlassNavDestination> destinations;

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.paddingOf(context).bottom;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.outline.withValues(alpha: 0.25))),
      ),
      padding: EdgeInsets.fromLTRB(4, 6, 4, bottom + 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          for (var i = 0; i < destinations.length; i++)
            Expanded(
              child: _NavItem(
                destination: destinations[i],
                selected: i == selectedIndex,
                onTap: () => onSelected(i),
              ),
            ),
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
    this.centerFab = false,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;
  /// Center tab (My doctor) — blue circle that rises above the bar when active.
  final bool centerFab;
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.destination,
    required this.selected,
    required this.onTap,
  });

  final GlassNavDestination destination;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final activeColor = AppColors.brand;
    final inactiveColor = AppColors.onSurfaceVariant.withValues(alpha: 0.75);
    final color = selected ? activeColor : inactiveColor;

    Widget iconChild;
    if (destination.centerFab && selected) {
      iconChild = Transform.translate(
        offset: const Offset(0, -10),
        child: Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: activeColor,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: activeColor.withValues(alpha: 0.35),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Icon(destination.selectedIcon, size: 26, color: Colors.white),
        ),
      );
    } else {
      iconChild = Icon(
        selected ? destination.selectedIcon : destination.icon,
        size: 24,
        color: color,
      );
    }

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: EdgeInsets.only(
            top: destination.centerFab && selected ? 0 : 4,
            bottom: 4,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              iconChild,
              SizedBox(height: destination.centerFab && selected ? 2 : 4),
              Text(
                destination.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.fieldLabel.copyWith(
                  fontSize: 11,
                  color: color,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
