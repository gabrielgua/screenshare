export function formatMemberCount(memberCount: number): string {
  return `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`
}
