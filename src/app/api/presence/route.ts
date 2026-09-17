import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabaseAdmin
      .from('presence')
      .select('*')
      .order('last_seen', { ascending: false, nullsFirst: false })
      .limit(100);

    if (error) {
      throw error;
    }

    const { searchParams } = new URL(req.url);
    if (searchParams.get('all') === 'true') {
      return NextResponse.json({ presence: data || [] });
    }

    // Deduplicate by user_id to show each user's most recent activity
    const userMap = new Map<string, any>();
    for (const item of data || []) {
      const existing = userMap.get(item.user_id);
      if (!existing || new Date(item.last_seen).getTime() > new Date(existing.last_seen).getTime()) {
        userMap.set(item.user_id, item);
      }
    }

    const presence = Array.from(userMap.values()).sort(
      (a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
    );

    return NextResponse.json({ presence });
  } catch (err: any) {
    console.error('Error fetching presence:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch presence' }, { status: 500 });
  }
}
