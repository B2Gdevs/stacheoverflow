/**
 * Responsive Icon Sizing Utility
 * 
 * Provides consistent, mobile-friendly icon sizing that meets touch target requirements.
 * Works with any icon library (lucide-react, etc.)
 * 
 * Mobile icons are larger to meet 44x44px touch target minimums.
 * Desktop icons are appropriately sized for mouse interactions.
 */

export const iconSizes = {
  mobile: {
    sm: 'h-5 w-5',    // 20px - minimum for readability on mobile
    md: 'h-6 w-6',    // 24px - standard size for mobile
    lg: 'h-8 w-8',    // 32px - prominent actions on mobile
    xl: 'h-10 w-10',  // 40px - hero/featured icons on mobile
  },
  desktop: {
    sm: 'h-4 w-4',    // 16px - compact spaces on desktop
    md: 'h-5 w-5',    // 20px - standard size on desktop
    lg: 'h-6 w-6',    // 24px - prominent actions on desktop
    xl: 'h-8 w-8',    // 32px - hero icons on desktop
  }
} as const;

/**
 * Get responsive icon size classes
 * 
 * @param size - Icon size variant ('sm' | 'md' | 'lg' | 'xl')
 * @returns Tailwind classes for responsive icon sizing
 * 
 * @example
 * ```tsx
 * <Search className={getIconSize('md')} />
 * // Results in: "h-6 w-6 md:h-5 md:w-5"
 * ```
 */
export function getIconSize(size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  return `${iconSizes.mobile[size]} md:${iconSizes.desktop[size]}`;
}

/**
 * Get icon size classes for mobile only
 * 
 * @param size - Icon size variant
 * @returns Tailwind classes for mobile icon sizing
 */
export function getIconSizeMobile(size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  return iconSizes.mobile[size];
}

/**
 * Get icon size classes for desktop only
 * 
 * @param size - Icon size variant
 * @returns Tailwind classes for desktop icon sizing
 */
export function getIconSizeDesktop(size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  return iconSizes.desktop[size];
}

/**
 * Get touch-friendly button size classes for icons inside buttons
 * Ensures minimum 44x44px touch target on mobile
 * 
 * @param iconSize - Icon size variant
 * @returns Tailwind classes for button container with icon
 * 
 * @example
 * ```tsx
 * <button className={getIconButtonSize('md')}>
 *   <Heart className={getIconSize('sm')} />
 * </button>
 * // Button will be min-h-[44px] on mobile, normal size on desktop
 * ```
 */
export function getIconButtonSize(iconSize: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  return 'min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center';
}


