import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPPORT_TICKETS_BUCKET = process.env.SUPABASE_SUPPORT_TICKETS_BUCKET || 'support_tickets';
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

type StorageRef = { bucket: string; objectPath: string };

function parseStorageRef(value: string): StorageRef | null {
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      const publicMarker = '/storage/v1/object/public/';
      const signedMarker = '/storage/v1/object/sign/';
      const marker = parsed.pathname.includes(publicMarker) ? publicMarker : signedMarker;
      const markerIdx = parsed.pathname.indexOf(marker);
      if (markerIdx === -1) return null;

      const remainder = decodeURIComponent(parsed.pathname.slice(markerIdx + marker.length));
      const slashIdx = remainder.indexOf('/');
      if (slashIdx === -1) return null;

      return {
        bucket: remainder.slice(0, slashIdx),
        objectPath: remainder.slice(slashIdx + 1),
      };
    } catch {
      return null;
    }
  }

  if (value.startsWith('support-tickets/')) {
    return {
      bucket: SUPPORT_TICKETS_BUCKET,
      objectPath: value,
    };
  }

  // Fallback for raw paths stored in the bucket
  return {
    bucket: SUPPORT_TICKETS_BUCKET,
    objectPath: value,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
    }

    // If it's already an external HTTP(S) URL and NOT a Supabase storage URL, redirect directly
    if (/^https?:\/\//i.test(path) && !path.includes('/storage/v1/object/')) {
      return NextResponse.redirect(path, 307);
    }

    const storageRef = parseStorageRef(path);
    if (!storageRef) {
      return NextResponse.json({ error: 'Invalid storage path' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin.storage
      .from(storageRef.bucket)
      .createSignedUrl(storageRef.objectPath, SIGNED_URL_TTL_SECONDS);

    if (error || !data?.signedUrl) {
      console.error('Failed to generate signed screenshot URL:', error);
      return NextResponse.json({ error: error?.message || 'Attachment not found' }, { status: 404 });
    }

    if (searchParams.get('json') === 'true') {
      return NextResponse.json({ url: data.signedUrl });
    }

    const response = NextResponse.redirect(data.signedUrl, 307);
    response.headers.set('Cache-Control', 'private, max-age=300');
    return response;
  } catch (err: any) {
    console.error('Error generating screenshot URL:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
