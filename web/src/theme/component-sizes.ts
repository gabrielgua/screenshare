export type ControlSize = 'sm' | 'md' | 'lg'

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export const iconSizeByControlSize: Record<ControlSize, IconSize> = {
  sm: 'xs',
  md: 'sm',
  lg: 'md',
}
