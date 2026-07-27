import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/campaigns - Fetch all campaigns
export async function GET() {
  try {
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ campaigns: data });
  } catch (error: any) {
    console.error('Fetch campaigns error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/campaigns - Create a new draft
export async function POST(req: NextRequest) {
  try {
    const { name, subject, body_html, mode } = await req.json();

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert([{ name, subject, body_html, mode, status: 'draft' }])
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ campaign: data });
  } catch (error: any) {
    console.error('Create campaign error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/campaigns - Update an existing draft
export async function PATCH(req: NextRequest) {
  try {
    const { id, name, subject, body_html, mode, recipients_count, status, sent_at } = await req.json();

    if (!id) return NextResponse.json({ error: 'Missing campaign id' }, { status: 400 });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (body_html !== undefined) updateData.body_html = body_html;
    if (mode !== undefined) updateData.mode = mode;
    if (recipients_count !== undefined) updateData.recipients_count = recipients_count;
    if (status !== undefined) updateData.status = status;
    if (sent_at !== undefined) updateData.sent_at = sent_at;

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ campaign: data });
  } catch (error: any) {
    console.error('Update campaign error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
