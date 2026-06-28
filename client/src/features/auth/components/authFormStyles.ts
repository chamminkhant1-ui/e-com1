/** Shared layout and field styles for the public auth flow (`/` route). */

export const authFormCardClass =
  'glass-card relative z-20 w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low/90 p-5 shadow-lg sm:p-6 md:bg-white/80 md:p-7 md:shadow-xl';

export const authFormTitleClass =
  'font-headline text-xl font-bold tracking-tight text-primary-container sm:text-2xl';

export const authFormSubtitleClass =
  'text-sm leading-snug text-on-surface-variant';

export const authFieldLabelClass =
  'ml-0.5 text-xs font-semibold text-on-surface-variant';

export const authInputClass =
  'w-full rounded-lg border border-transparent bg-surface-container-high py-2.5 pl-10 pr-3 text-sm font-medium text-on-surface transition-colors focus:border-primary-container/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/20';

/** Password inputs: fixed right padding reserves toggle space (no layout shift on reveal). */
export const authInputWithToggleClass =
  'w-full rounded-lg border border-transparent bg-surface-container-high py-2.5 pl-10 pr-10 text-sm font-medium text-on-surface transition-[color,background-color,border-color,box-shadow] focus:border-primary-container/30 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/20';

export const authPasswordToggleClass =
  'absolute right-1 top-1/2 flex h-8 w-8 shrink-0 -translate-y-1/2 items-center justify-center rounded-md text-outline transition-colors hover:bg-surface-container-lowest hover:text-primary-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container/30';

export const authInputIconClass =
  'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-outline transition-colors group-focus-within:text-primary-container';

export const authSubmitButtonClass =
  'flex w-full items-center justify-center gap-2 rounded-lg border-t border-white/10 bg-primary-container py-2.5 text-sm font-semibold tracking-wide text-on-primary shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 md:academic-gradient';

export const authModeSwitcherWrapClass = 'mb-5 hidden justify-center md:flex';

export const authModeSwitcherTrackClass =
  'flex w-full max-w-[220px] rounded-full bg-surface-container-high p-0.5 shadow-inner';

export const authModeSwitcherActiveClass =
  'flex-1 rounded-full bg-primary-container py-1.5 text-xs font-semibold text-on-primary shadow-sm';

export const authModeSwitcherInactiveClass =
  'flex-1 rounded-full py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:text-primary-container';

export const authAlertSuccessClass =
  'mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5';

export const authAlertErrorClass =
  'mb-4 flex items-center gap-2 rounded-lg bg-error-container px-3 py-2.5';
