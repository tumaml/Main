import { createServerSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { VideoPageClient } from './VideoPageClient'
import { Video } from '@/types/database'

interface VideoPageProps {
  params: { id: string }
}

export default async function VideoPage({ params }: VideoPageProps) {
  const supabase = createServerSupabase()

  const { data } = await supabase
    .from('videos')
    .select('*, user:users(id, username, display_name, avatar_url, is_verified, follower_count)')
    .eq('id', params.id)
    .single()

  if (!data) notFound()

  return <VideoPageClient video={data as unknown as Video} />
}
