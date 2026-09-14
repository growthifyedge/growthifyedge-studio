// Supabase Edge Function: notify-inquiry
//
// Invoked only by the database trigger in phase4-inquiry-email-notifications.sql.
// It deliberately does not write to the inquiries table: the database record is
// committed before this asynchronous notification is requested.

const RECIPIENT = 'growthifyedge@gmail.com';

type InquiryRecord = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  type: string;
  project_name?: string | null;
  message: string;
  created_at: string;
};

const text = (value: unknown): string => typeof value === 'string' ? value.trim() : '';

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[character] ?? character));
}

function field(label: string, value: string): string {
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value || 'Not provided')}</p>`;
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const hookSecret = Deno.env.get('INQUIRY_NOTIFICATION_HOOK_SECRET');
  if (!hookSecret || request.headers.get('x-inquiry-hook-secret') !== hookSecret) {
    console.error('notify-inquiry rejected an unauthenticated request');
    return new Response('Unauthorized', { status: 401 });
  }

  let record: InquiryRecord;
  try {
    const payload = await request.json() as { record?: InquiryRecord };
    record = payload.record as InquiryRecord;
  } catch {
    console.error('notify-inquiry received invalid JSON');
    return new Response('Invalid payload', { status: 400 });
  }

  const name = text(record?.name);
  const email = text(record?.email);
  const inquiryId = text(record?.id);
  const projectType = text(record?.type);
  const message = text(record?.message);
  if (!name || !email || !inquiryId || !projectType || !message) {
    console.error('notify-inquiry received an incomplete inquiry record', { inquiryId });
    return new Response('Invalid inquiry record', { status: 400 });
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM_EMAIL');
  if (!resendApiKey || !from) {
    console.error('notify-inquiry is missing RESEND_API_KEY or RESEND_FROM_EMAIL', { inquiryId });
    return new Response('Notification service is not configured', { status: 503 });
  }

  const submittedAt = new Date(text(record.created_at));
  const submittedAtText = Number.isNaN(submittedAt.valueOf())
    ? text(record.created_at)
    : submittedAt.toUTCString();
  const company = text(record.company);
  const phone = text(record.phone);
  const projectName = text(record.project_name);
  const subject = `New GrowthifyEdge Inquiry — ${name} — ${projectType}`;
  const plainText = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || 'Not provided'}`,
    `Company: ${company || 'Not provided'}`,
    `Project Type: ${projectType}`,
    `Project Name: ${projectName || 'Not provided'}`,
    `Message:\n${message}`,
    `Submission date/time: ${submittedAtText}`,
    `Inquiry ID: ${inquiryId}`
  ].join('\n\n');

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [RECIPIENT],
        reply_to: email,
        subject,
        text: plainText,
        html: [
          '<h2>New GrowthifyEdge Inquiry</h2>',
          field('Name', name), field('Email', email), field('Phone', phone),
          field('Company', company), field('Project Type', projectType),
          field('Project Name', projectName), field('Message', message),
          field('Submission date/time', submittedAtText), field('Inquiry ID', inquiryId)
        ].join('')
      })
    });

    if (!response.ok) {
      console.error('Resend rejected inquiry notification', {
        inquiryId,
        status: response.status,
        response: await response.text()
      });
      return new Response('Email delivery failed', { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Failed to send inquiry notification', { inquiryId, error });
    return new Response('Email delivery failed', { status: 502 });
  }
});
