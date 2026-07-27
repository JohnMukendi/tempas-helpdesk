import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { TempasEmail } from '@/emails/TempasTemplate';
import { createClient } from '@supabase/supabase-js';

// Supabase Service Role client to bypass RLS and fetch auth users
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { subject, headline, htmlBody, ctaText, ctaLink, recipients, isRawHtml, rawHtmlBody } = await req.json();

    const zeptoKey = process.env.ZEPTOMAIL_API_KEY;
    const senderEmail = process.env.ZEPTOMAIL_SENDER_EMAIL;

    if (!zeptoKey || !senderEmail) {
      return NextResponse.json(
        { error: 'ZeptoMail credentials missing in environment variables.' },
        { status: 500 }
      );
    }

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided.' }, { status: 400 });
    }

    // Filter out invalid ones, but keep as objects
    const userList = recipients.filter((u) => u && u.email);

    // 2. Render HTML string
    let emailHtml = '';
    if (isRawHtml && rawHtmlBody) {
      emailHtml = rawHtmlBody;
    } else {
      emailHtml = await render(
        TempasEmail({
          headline,
          htmlBody,
          ctaText,
          ctaLink,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://tempas.com',
        })
      );
    }

    // 3. Send via ZeptoMail API in batches of 40
    // ZeptoMail limit is 50 per API call for the `to` field
    const BATCH_SIZE = 40;
    for (let i = 0; i < userList.length; i += BATCH_SIZE) {
      const batch = userList.slice(i, i + BATCH_SIZE);
      
      const payload = {
        from: { address: senderEmail, name: "Tempas" },
        to: batch.map((user) => ({
          email_address: { 
            address: user.email, 
            name: user.name || "Tempas User" 
          },
          merge_info: {
            name: user.name || "there"
          }
        })),
        subject: subject,
        htmlbody: emailHtml,
      };

      const zeptoRes = await fetch('https://api.zeptomail.com/v1.1/email/batch', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': zeptoKey.startsWith('Zoho-enczapikey') ? zeptoKey : `Zoho-enczapikey ${zeptoKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!zeptoRes.ok) {
        const errData = await zeptoRes.text();
        console.error("ZeptoMail error response:", errData);
        // We log it but continue processing other batches if there are any
      }
    }

    return NextResponse.json({ success: true, count: userList.length });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
