import { supabaseClient } from '@/services/supabase-client'

export type UserRole = 'member' | 'admin'

export type UserApprovalStatus = 'pending' | 'approved' | 'denied'

export type UserReviewDecision = 'approved' | 'denied'

export interface PlatformUser {
  id: string
  displayName: string
  avatarUrl?: string
  email?: string
  role: UserRole
  approvalStatus: UserApprovalStatus
  isActive: boolean
  reviewMessage?: string
  createdAt: string
}

interface UserRow {
  id: string
  display_name: string
  avatar_url: string | null
  email: string | null
  role: UserRole
  approval_status: UserApprovalStatus
  is_active: boolean
  review_message: string | null
  created_at: string
}

const USER_COLUMNS =
  'id, display_name, avatar_url, email, role, approval_status, is_active, review_message, created_at'

function mapUserRowToPlatformUser(userRow: UserRow): PlatformUser {
  return {
    id: userRow.id,
    displayName: userRow.display_name,
    avatarUrl: userRow.avatar_url ?? undefined,
    email: userRow.email ?? undefined,
    role: userRow.role,
    approvalStatus: userRow.approval_status,
    isActive: userRow.is_active,
    reviewMessage: userRow.review_message ?? undefined,
    createdAt: userRow.created_at,
  }
}

export interface PlatformUserDetails extends PlatformUser {
  reviewedAt?: string
  reviewerName?: string
}

interface UserDetailsRow extends UserRow {
  reviewed_at: string | null
  reviewer: { display_name: string } | null
}

const USER_DETAILS_COLUMNS = `${USER_COLUMNS}, reviewed_at, reviewer:reviewed_by(display_name)`

export async function fetchUserDetails(userId: string): Promise<PlatformUserDetails | undefined> {
  const { data, error } = await supabaseClient
    .from('users')
    .select(USER_DETAILS_COLUMNS)
    .eq('id', userId)
    .maybeSingle<UserDetailsRow>()
  if (error) {
    throw error
  }
  if (!data) {
    return undefined
  }
  return {
    ...mapUserRowToPlatformUser(data),
    reviewedAt: data.reviewed_at ?? undefined,
    reviewerName: data.reviewer?.display_name ?? undefined,
  }
}

export async function fetchUserById(userId: string): Promise<PlatformUser | undefined> {
  const { data, error } = await supabaseClient
    .from('users')
    .select(USER_COLUMNS)
    .eq('id', userId)
    .maybeSingle<UserRow>()
  if (error) {
    throw error
  }
  return data ? mapUserRowToPlatformUser(data) : undefined
}

export async function fetchPendingUsers(): Promise<PlatformUser[]> {
  const { data, error } = await supabaseClient
    .from('users')
    .select(USER_COLUMNS)
    .eq('approval_status', 'pending')
    .eq('is_active', true)
    .order('created_at', { ascending: true })
    .returns<UserRow[]>()
  if (error) {
    throw error
  }
  return data.map(mapUserRowToPlatformUser)
}

export async function fetchAllUsers(): Promise<PlatformUser[]> {
  const { data, error } = await supabaseClient
    .from('users')
    .select(USER_COLUMNS)
    .order('created_at', { ascending: false })
    .returns<UserRow[]>()
  if (error) {
    throw error
  }
  return data.map(mapUserRowToPlatformUser)
}

export async function reviewUser(
  targetUserId: string,
  decision: UserReviewDecision,
  message?: string,
): Promise<void> {
  const { error } = await supabaseClient.rpc('review_user', {
    target_user_id: targetUserId,
    decision,
    message: message ?? null,
  })
  if (error) {
    throw error
  }
}

export async function setUserActive(
  targetUserId: string,
  shouldBeActive: boolean,
): Promise<PlatformUser> {
  const { data, error } = await supabaseClient
    .rpc('set_user_active', { target_user_id: targetUserId, should_be_active: shouldBeActive })
    .single<UserRow>()
  if (error) {
    throw error
  }
  return mapUserRowToPlatformUser(data)
}

export async function setUserRole(targetUserId: string, newRole: UserRole): Promise<PlatformUser> {
  const { data, error } = await supabaseClient
    .rpc('set_user_role', { target_user_id: targetUserId, new_role: newRole })
    .single<UserRow>()
  if (error) {
    throw error
  }
  return mapUserRowToPlatformUser(data)
}
