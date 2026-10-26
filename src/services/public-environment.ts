export type PublicEnvironmentVariableName = 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_PUBLISHABLE_KEY'

export function readPublicEnvironmentVariable(variableName: PublicEnvironmentVariableName): string {
  const variableValue: unknown = import.meta.env[variableName]
  if (typeof variableValue !== 'string' || variableValue.trim() === '') {
    throw new Error(
      `${variableName} is missing. Copy .env.example to .env.local for local development, or set it in the hosting provider's environment variables.`,
    )
  }
  return variableValue
}
