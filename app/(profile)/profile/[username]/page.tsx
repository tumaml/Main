import { createServerSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { PublicProfileClient } from '@/components/profile/PublicProfileClient'
import { User } from '@/types/database'

interface UserProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { username } = await params
  const supabase = createServerSupabase()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !data) notFound()

  return <PublicProfileClient user={data as unknown as User} />
}
