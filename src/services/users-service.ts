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
  review_message: string | null
  created_at: string
}

const USER_COLUMNS =
  'id, display_name, avatar_url, email, role, approval_status, review_message, created_at'

function mapUserRowToPlatformUser(userRow: UserRow): PlatformUser {
  return {
    id: userRow.id,
    displayName: userRow.display_name,
    avatarUrl: userRow.avatar_url ?? undefined,
    email: userRow.email ?? undefined,
    role: userRow.role,
    approvalStatus: userRow.approval_status,
    reviewMessage: userRow.review_message ?? undefined,
    createdAt: userRow.created_at,
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
    .order('created_at', { ascending: true })
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
