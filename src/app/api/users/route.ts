import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch users from public.users and presence
    const { data: usersData, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, surname, last_activity, created_at, user_profile, is_subscribed, presence(last_seen)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    const users = usersData?.map((u: any) => {
      let presenceUpdate = null;
      if (Array.isArray(u.presence) && u.presence.length > 0) {
        // Find the most recent last_seen timestamp
        const timestamps = u.presence
          .map((p: any) => p.last_seen)
          .filter(Boolean)
          .map((d: string) => new Date(d).getTime());
        if (timestamps.length > 0) {
          presenceUpdate = new Date(Math.max(...timestamps)).toISOString();
        }
      } else if (u.presence && !Array.isArray(u.presence) && u.presence.last_seen) {
        presenceUpdate = u.presence.last_seen;
      }
      return {
        ...u,
        last_activity: presenceUpdate || u.last_activity,
        presence: undefined
      };
    }) || [];

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
