import { supabaseClient } from '@/services/supabase-client'

export interface RoomSummary {
  id: string
  name: string
  ownerId: string
  ownerName: string
  memberCount: number
  isOwner: boolean
  createdAt: string
}

export interface RoomPreview {
  id: string
  name: string
  ownerName: string
  ownerAvatarUrl?: string
  memberCount: number
  isMember: boolean
  isBlocked: boolean
}

export interface AdministeredRoom {
  id: string
  name: string
  ownerId: string
  ownerName: string
  ownerAvatarUrl?: string
  memberCount: number
  blockedUserCount: number
  createdAt: string
  updatedAt: string
}

export interface RoomBlockedUser {
  userId: string
  displayName: string
  avatarUrl?: string
  blockedAt: string
  blockedByName?: string
}

export interface Room {
  id: string
  name: string
  ownerId: string
  createdAt: string
  updatedAt: string
}

export interface RoomMember {
  userId: string
  displayName: string
  avatarUrl?: string
  joinedAt: string
  isOwner: boolean
}

interface RoomRow {
  id: string
  name: string
  owner_id: string
  created_at: string
  updated_at: string
}

interface RoomSummaryRow {
  room_id: string
  room_name: string
  owner_id: string
  owner_name: string
  member_count: number
  is_owner: boolean
  created_at: string
}

interface RoomPreviewRow {
  room_id: string
  room_name: string
  owner_name: string
  owner_avatar_url: string | null
  member_count: number
  is_member: boolean
  is_blocked: boolean
}

interface AdministeredRoomRow {
  room_id: string
  room_name: string
  owner_id: string
  owner_name: string
  owner_avatar_url: string | null
  member_count: number
  blocked_user_count: number
  created_at: string
  updated_at: string
}

interface RoomBlockedUserRow {
  user_id: string
  display_name: string
  avatar_url: string | null
  blocked_at: string
  blocked_by_name: string | null
}

interface RoomMemberRow {
  user_id: string
  display_name: string
  avatar_url: string | null
  joined_at: string
  is_owner: boolean
}

const ROOM_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const MAXIMUM_ROOM_NAME_LENGTH = 60

export function isValidRoomId(possibleRoomId: string): boolean {
  return ROOM_ID_PATTERN.test(possibleRoomId)
}

export function buildRoomShareUrl(roomId: string): string {
  return `${window.location.origin}/rooms/${roomId}`
}

function mapRoomRowToRoom(roomRow: RoomRow): Room {
  return {
    id: roomRow.id,
    name: roomRow.name,
    ownerId: roomRow.owner_id,
    createdAt: roomRow.created_at,
    updatedAt: roomRow.updated_at,
  }
}

export async function fetchMyRooms(): Promise<RoomSummary[]> {
  const { data, error } = await supabaseClient.rpc('list_my_rooms')
  if (error) {
    throw error
  }
  const roomSummaryRows = (data ?? []) as RoomSummaryRow[]
  return roomSummaryRows.map((roomSummaryRow) => ({
    id: roomSummaryRow.room_id,
    name: roomSummaryRow.room_name,
    ownerId: roomSummaryRow.owner_id,
    ownerName: roomSummaryRow.owner_name,
    memberCount: Number(roomSummaryRow.member_count),
    isOwner: roomSummaryRow.is_owner,
    createdAt: roomSummaryRow.created_at,
  }))
}

export async function fetchRoomPreview(roomId: string): Promise<RoomPreview | undefined> {
  const { data, error } = await supabaseClient.rpc('get_room_preview', { target_room_id: roomId })
  if (error) {
    throw error
  }
  const previewRow = ((data ?? []) as RoomPreviewRow[])[0]
  if (!previewRow) {
    return undefined
  }
  return {
    id: previewRow.room_id,
    name: previewRow.room_name,
    ownerName: previewRow.owner_name,
    ownerAvatarUrl: previewRow.owner_avatar_url ?? undefined,
    memberCount: Number(previewRow.member_count),
    isMember: previewRow.is_member,
    isBlocked: previewRow.is_blocked,
  }
}

export async function fetchRoom(roomId: string): Promise<Room | undefined> {
  const { data, error } = await supabaseClient
    .from('rooms')
    .select('id, name, owner_id, created_at, updated_at')
    .eq('id', roomId)
    .maybeSingle<RoomRow>()
  if (error) {
    throw error
  }
  return data ? mapRoomRowToRoom(data) : undefined
}

export async function fetchRoomMembers(roomId: string): Promise<RoomMember[]> {
  const { data, error } = await supabaseClient.rpc('list_room_members', { target_room_id: roomId })
  if (error) {
    throw error
  }
  const roomMemberRows = (data ?? []) as RoomMemberRow[]
  return roomMemberRows.map((roomMemberRow) => ({
    userId: roomMemberRow.user_id,
    displayName: roomMemberRow.display_name,
    avatarUrl: roomMemberRow.avatar_url ?? undefined,
    joinedAt: roomMemberRow.joined_at,
    isOwner: roomMemberRow.is_owner,
  }))
}

export async function createRoom(roomName: string): Promise<Room> {
  const { data, error } = await supabaseClient
    .rpc('create_room', { room_name: roomName })
    .single<RoomRow>()
  if (error) {
    throw error
  }
  return mapRoomRowToRoom(data)
}

export async function renameRoom(roomId: string, newName: string): Promise<Room> {
  const { data, error } = await supabaseClient
    .rpc('rename_room', { target_room_id: roomId, new_name: newName })
    .single<RoomRow>()
  if (error) {
    throw error
  }
  return mapRoomRowToRoom(data)
}

export async function joinRoom(roomId: string): Promise<void> {
  const { error } = await supabaseClient.rpc('join_room', { target_room_id: roomId })
  if (error) {
    throw error
  }
}

export async function leaveRoom(roomId: string): Promise<void> {
  const { error } = await supabaseClient.rpc('leave_room', { target_room_id: roomId })
  if (error) {
    throw error
  }
}

export async function removeRoomMember(roomId: string, memberUserId: string): Promise<void> {
  const { error } = await supabaseClient.rpc('remove_room_member', {
    target_room_id: roomId,
    target_user_id: memberUserId,
  })
  if (error) {
    throw error
  }
}

export async function fetchAllRooms(): Promise<AdministeredRoom[]> {
  const { data, error } = await supabaseClient.rpc('list_all_rooms')
  if (error) {
    throw error
  }
  const administeredRoomRows = (data ?? []) as AdministeredRoomRow[]
  return administeredRoomRows.map((administeredRoomRow) => ({
    id: administeredRoomRow.room_id,
    name: administeredRoomRow.room_name,
    ownerId: administeredRoomRow.owner_id,
    ownerName: administeredRoomRow.owner_name,
    ownerAvatarUrl: administeredRoomRow.owner_avatar_url ?? undefined,
    memberCount: Number(administeredRoomRow.member_count),
    blockedUserCount: Number(administeredRoomRow.blocked_user_count),
    createdAt: administeredRoomRow.created_at,
    updatedAt: administeredRoomRow.updated_at,
  }))
}

export async function fetchRoomBlockedUsers(roomId: string): Promise<RoomBlockedUser[]> {
  const { data, error } = await supabaseClient.rpc('list_blocked_room_users', {
    target_room_id: roomId,
  })
  if (error) {
    throw error
  }
  const blockedUserRows = (data ?? []) as RoomBlockedUserRow[]
  return blockedUserRows.map((blockedUserRow) => ({
    userId: blockedUserRow.user_id,
    displayName: blockedUserRow.display_name,
    avatarUrl: blockedUserRow.avatar_url ?? undefined,
    blockedAt: blockedUserRow.blocked_at,
    blockedByName: blockedUserRow.blocked_by_name ?? undefined,
  }))
}

export async function unblockRoomUser(roomId: string, blockedUserId: string): Promise<void> {
  const { error } = await supabaseClient.rpc('unblock_room_user', {
    target_room_id: roomId,
    target_user_id: blockedUserId,
  })
  if (error) {
    throw error
  }
}
