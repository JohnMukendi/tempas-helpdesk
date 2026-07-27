import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/segments - Fetch all custom audience segments
export async function GET() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin
      .from('audience_segments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ segments: data });
  } catch (error: any) {
    console.error('Fetch segments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/segments - Create a new audience segment
export async function POST(req: NextRequest) {
  try {
    const { name, filters } = await req.json();

    if (!name || !filters) {
      return NextResponse.json({ error: 'Name and filters are required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin
      .from('audience_segments')
      .insert([{ name, filters }])
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ segment: data });
  } catch (error: any) {
    console.error('Create segment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
