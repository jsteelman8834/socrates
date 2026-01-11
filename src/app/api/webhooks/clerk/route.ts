import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createAdminSupabaseClient } from '@/lib/db/supabase';

export async function POST(request: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  try {
    switch (evt.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);

        // Create user in Supabase
        const { data: user, error } = await supabase
          .from('users')
          .insert({
            clerk_id: id,
            email: primaryEmail?.email_address || '',
            display_name: [first_name, last_name].filter(Boolean).join(' ') || 'Student',
            avatar_url: image_url,
            role: 'student', // Default role
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating user:', error);
          throw error;
        }

        // Create student profile
        await supabase.from('student_profiles').insert({
          user_id: user.id,
          grade_level: 5,
          knowledge_rating: 1000,
          wisdom_rating: 1000,
          total_xp: 0,
          level: 1,
        });

        break;
      }

      case 'user.updated': {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const primaryEmail = email_addresses.find((e) => e.id === evt.data.primary_email_address_id);

        await supabase
          .from('users')
          .update({
            email: primaryEmail?.email_address || '',
            display_name: [first_name, last_name].filter(Boolean).join(' ') || 'Student',
            avatar_url: image_url,
          })
          .eq('clerk_id', id);

        break;
      }

      case 'user.deleted': {
        const { id } = evt.data;

        // Get user ID
        const { data: user } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_id', id)
          .single();

        if (user) {
          // Delete student profile first (due to foreign key)
          await supabase
            .from('student_profiles')
            .delete()
            .eq('user_id', user.id);

          // Delete user
          await supabase.from('users').delete().eq('id', user.id);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${evt.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
