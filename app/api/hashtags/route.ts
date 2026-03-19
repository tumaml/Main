import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

interface HashtagCount {
  name: string
  count: number
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 30)

  const supabase = createServerSupabase()

  // Pull tags arrays from recent public videos and count occurrences
  const { data: videos } = await supabase
    .from('videos')
    .select('tags, caption')
    .eq('privacy', 'public')
    .not('tags', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500)

  const counts: Record<string, number> = {}

  if (videos) {
    for (const v of videos) {
      // Count from tags array
      for (const tag of (v.tags ?? [])) {
        const t = (tag as string).toLowerCase().replace(/^#/, '')
        if (t) counts[t] = (counts[t] ?? 0) + 1
      }
      // Also extract #hashtags from caption text
      const matches = (v.caption ?? '').match(/#(\w+)/g) ?? []
      for (const match of matches) {
        const t = match.slice(1).toLowerCase()
        counts[t] = (counts[t] ?? 0) + 1
      }
    }
  }

  const sorted: HashtagCount[] = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))

  // If no data (empty DB), return sensible defaults
  if (sorted.length === 0) {
    return NextResponse.json({
      hashtags: [
        { name: 'fyp', count: 9800000 },
        { name: 'viral', count: 7200000 },
        { name: 'dance', count: 8900000 },
        { name: 'food', count: 5600000 },
        { name: 'fashion', count: 4100000 },
        { name: 'travel', count: 3400000 },
        { name: 'tech', count: 2800000 },
        { name: 'comedy', count: 6300000 },
        { name: 'beauty', count: 3900000 },
        { name: 'fitness', count: 2100000 },
      ].slice(0, limit),
    })
  }

  return NextResponse.json({ hashtags: sorted })
}
