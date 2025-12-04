import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend1 = new Resend(process.env.RESEND_KEY_1);
const resend2 = new Resend(process.env.RESEND_KEY_2);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const emailContent = {
            from: 'Itinera Contact <onboarding@resend.dev>',
            subject: subject || `New Contact Message from ${name}`,
            replyTo: email,
            html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Message from Itinera</h2>
          <p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
          <hr />
          <p>${message}</p>
        </div>
      `
        };

        // Send in parallel
        const [response1, response2] = await Promise.all([
            resend1.emails.send({
                ...emailContent,
                to: [process.env.ADMIN_EMAIL_1 as string],
            }),
            resend2.emails.send({
                ...emailContent,
                to: [process.env.ADMIN_EMAIL_2 as string],
            })
        ]);

        // CRITICAL: Check if Resend returned an error
        if (response1.error) {
            console.error("Error sending to Admin 1:", response1.error);
            return NextResponse.json({ error: `Admin 1 Failed: ${response1.error.message}` }, { status: 500 });
        }
        if (response2.error) {
            console.error("Error sending to Admin 2:", response2.error);
            return NextResponse.json({ error: `Admin 2 Failed: ${response2.error.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}