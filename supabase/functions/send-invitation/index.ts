// =============================================
// SUPABASE EDGE FUNCTION: send-invitation
//
// Deploy this to Supabase Edge Functions:
//   supabase functions deploy send-invitation
//
// This function sends the invitation email
// when a team member is invited.
//
// It uses Resend (https://resend.com) for email.
// Set RESEND_API_KEY in Supabase secrets:
//   supabase secrets set RESEND_API_KEY=your_key
// =============================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, token, projectId, inviterId } = await req.json()

    // Create admin client to fetch project info
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get project and inviter info
    const [{ data: project }, { data: inviter }] = await Promise.all([
      supabase.from('projects').select('name').eq('id', projectId).single(),
      supabase.from('profiles').select('full_name, email').eq('id', inviterId).single(),
    ])

    const inviteLink = `${Deno.env.get('SITE_URL') || 'http://localhost:5173'}/invite/${token}`

    // Send email via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    if (!RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set. Email not sent. Invite link:', inviteLink)
      return new Response(JSON.stringify({ success: true, link: inviteLink }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FLUXY <noreply@yourdomain.com>', // Update with your domain
        to: email,
        subject: `You're invited to join ${project?.name || 'a project'} on FLUXY`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background: #09090b; color: #f4f4f5; margin: 0; padding: 20px; }
              .container { max-width: 480px; margin: 0 auto; background: #18181b; border-radius: 16px; padding: 32px; border: 1px solid rgba(255,255,255,0.1); }
              .logo { font-size: 20px; font-weight: 800; color: #f4f4f5; letter-spacing: -0.5px; margin-bottom: 24px; }
              .logo span { color: #8b5cf6; }
              h1 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
              p { color: #a1a1aa; line-height: 1.6; margin-bottom: 16px; }
              .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; margin: 8px 0 16px; }
              .link { color: #7c3aed; font-size: 12px; word-break: break-all; }
              .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #52525b; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">FLU<span>XY</span></div>
              <h1>You're invited! 🎉</h1>
              <p>
                <strong style="color: #f4f4f5;">${inviter?.full_name || 'Someone'}</strong>
                has invited you to join
                <strong style="color: #f4f4f5;">${project?.name || 'a project'}</strong>
                on FLUXY.
              </p>
              <p>Click the button below to accept your invitation and join the team:</p>
              <a href="${inviteLink}" class="btn">Accept Invitation →</a>
              <p>Or copy this link:</p>
              <p class="link">${inviteLink}</p>
              <p style="font-size: 13px;">This invitation expires in 7 days.</p>
              <div class="footer">
                <p>If you didn't expect this invitation, you can safely ignore this email.</p>
                <p>© 2024 FLUXY — Your work, organized.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const error = await emailResponse.text()
      console.error('Resend error:', error)
      // Still return success - the invitation record was created
      return new Response(JSON.stringify({ success: true, emailError: error, link: inviteLink }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ success: true, link: inviteLink }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
