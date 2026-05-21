/** Shared class tokens for the admin liquid-glass panel (lp-brand theme). */
export const adminTheme = {
  pageTitle:
    "font-heading text-2xl sm:text-3xl font-bold bg-gradient-to-r from-lp-brand to-lp-brand-bright bg-clip-text text-transparent",
  ctaButton:
    "rounded-xl bg-gradient-to-r from-lp-brand to-lp-brand-bright text-lp-on-brand shadow-lg shadow-lp-brand/25 hover:shadow-xl hover:from-lp-brand hover:to-lp-brand-bright",
  input:
    "rounded-xl border-lp-outline-variant/40 bg-white/50 text-lp-on-surface placeholder:text-lp-on-surface-variant/70 backdrop-blur-sm focus-visible:ring-lp-brand/30 dark:bg-lp-primary-container/40 dark:border-white/10",
  iconMuted: "text-lp-on-surface-variant",
  hoverSurface: "hover:bg-lp-surface-container/80 dark:hover:bg-white/5",
  activeNav: "admin-nav-active text-lp-on-brand",
  inactiveNav:
    "text-lp-on-surface hover:bg-white/40 dark:text-lp-on-secondary-container dark:hover:bg-white/5",
  avatarRing: "border-lp-brand/50",
  avatarFallback: "bg-gradient-to-br from-lp-brand to-lp-brand-bright text-lp-on-brand font-bold",
  tableHeader: "bg-lp-surface-container/60 dark:bg-white/5",
  tableRowHover: "hover:bg-lp-surface-container-low/50 dark:hover:bg-white/5",
  link: "text-lp-brand hover:text-lp-brand-bright",
  mobileCard: "liquid-glass liquid-glass-interactive rounded-2xl p-4",
  emptyState: "liquid-glass rounded-2xl border border-dashed border-lp-outline-variant/50 p-6 text-center text-sm text-lp-on-surface-variant",
} as const
