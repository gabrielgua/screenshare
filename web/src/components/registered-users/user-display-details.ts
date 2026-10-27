import type { UserApprovalStatus, UserRole } from '@/services/users-service'
import {
  AdminShieldIcon,
  ApproveIcon,
  DenyIcon,
  PendingIcon,
  UserIcon,
  type AppIcon,
} from '@/theme/app-icons'
import type { ColorVariant } from '@/theme/color-variants'

export interface UserDisplayDetails {
  label: string
  icon: AppIcon
  variant: ColorVariant
}

export const displayDetailsByRole: Record<UserRole, UserDisplayDetails> = {
  admin: { label: 'Admin', icon: AdminShieldIcon, variant: 'primary' },
  member: { label: 'Member', icon: UserIcon, variant: 'neutral' },
}

export const displayDetailsByApprovalStatus: Record<UserApprovalStatus, UserDisplayDetails> = {
  approved: { label: 'Approved', icon: ApproveIcon, variant: 'success' },
  denied: { label: 'Denied', icon: DenyIcon, variant: 'danger' },
  pending: { label: 'Pending', icon: PendingIcon, variant: 'warning' },
}

export const FILTERABLE_ROLES: UserRole[] = ['admin', 'member']

export const FILTERABLE_APPROVAL_STATUSES: UserApprovalStatus[] = ['approved', 'denied', 'pending']
