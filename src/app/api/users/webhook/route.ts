import { db } from '@/db'
import { usersTable } from '@/db/schema'
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { eq } from 'drizzle-orm'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

    // Do something with payload
    // For this guide, log payload to console
    const { id } = evt.data
    const eventType = evt.type
    // console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    // console.log('Webhook payload:', evt.data)

    if (eventType === "user.created") {
      const { data } = evt;

      const primaryEmail = data.email_addresses.find(
        (email: any) => email.id === data.primary_email_address_id
      )?.email_address || data.email_addresses[0]?.email_address;

      await db.insert(usersTable).values({
        clerkId: data.id,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username || 'User',
        email: primaryEmail,
        imageUrl: data.image_url,
      })
    }

    if (eventType === "user.deleted") {
      const { data } = evt;

      if (!data.id) return new Response("Missing user id", { status: 400 });
      await db.delete(usersTable).where(eq(usersTable.clerkId, data.id));
    }

    if (eventType === "user.updated") {
      const { data } = evt;

      await db.update(usersTable).set({
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
        imageUrl: data.image_url,
      })
        .where(eq(usersTable.clerkId, data.id))
    }



    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}