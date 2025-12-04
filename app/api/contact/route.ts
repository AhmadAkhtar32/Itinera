import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
    try {
        const { name, email, message } = await req.json();

        // Validate input
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Send the email
        const data = await resend.emails.send({
            from: 'Itinera Contact Form <onboarding@resend.dev>', // Use this default until you verify your own domain
            to: [
                process.env.ADMIN_EMAIL_1 as string,
                process.env.ADMIN_EMAIL_2 as string
            ],
            subject: `New Contact Message from ${name}`,
            replyTo: email, // <--- CRITICAL: This makes "Reply" go to the user
            text: `
        Name: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
            // You can also use React Email here for beautiful HTML templates if you want
            html: `
        <h1>New Message from Itinera Website</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <hr />
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
        });

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}