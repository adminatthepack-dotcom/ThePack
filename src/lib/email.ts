import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? "K9 Platform <notifications@example.com>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

function jobUrl(jobId: string) {
  return `${SITE_URL}/marketplace/${jobId}`;
}
function messageUrl(senderId: string) {
  return `${SITE_URL}/messages/${senderId}`;
}

// Only send if there's a real API key configured.
function isConfigured() {
  return !!process.env.RESEND_API_KEY;
}

export async function sendMessageNotification({
  to,
  senderName,
  preview,
  senderId,
}: {
  to: string;
  senderName: string;
  preview: string;
  senderId: string;
}) {
  if (!isConfigured()) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New message from ${senderName}`,
    html: buildHtml(
      `New message from ${senderName}`,
      `<p>${escHtml(preview)}</p>`,
      "View message",
      messageUrl(senderId)
    ),
  });
}

export async function sendBidReceivedNotification({
  to,
  bidderName,
  jobTitle,
  jobId,
  amount,
  messagePreview,
}: {
  to: string;
  bidderName: string;
  jobTitle: string;
  jobId: string;
  amount: string | null;
  messagePreview: string;
}) {
  if (!isConfigured()) return;
  const amountLine = amount
    ? `<p><strong>Proposed amount:</strong> ${escHtml(amount)}</p>`
    : "";
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New bid on "${jobTitle}"`,
    html: buildHtml(
      `New bid on "${escHtml(jobTitle)}"`,
      `<p>${escHtml(bidderName)} placed a bid on your job.</p>
       ${amountLine}
       <p>${escHtml(messagePreview)}</p>`,
      "View bid",
      jobUrl(jobId)
    ),
  });
}

export async function sendBidAcceptedNotification({
  to,
  jobTitle,
  jobId,
}: {
  to: string;
  jobTitle: string;
  jobId: string;
}) {
  if (!isConfigured()) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your bid was accepted — "${jobTitle}"`,
    html: buildHtml(
      "Your bid was accepted!",
      `<p>The job <strong>${escHtml(jobTitle)}</strong> has been awarded to you. Coordinate next steps with the poster.</p>`,
      "View job",
      jobUrl(jobId)
    ),
  });
}

export async function sendJobMatchNotification({
  to,
  jobTitle,
  jobId,
  descriptionPreview,
}: {
  to: string;
  jobTitle: string;
  jobId: string;
  descriptionPreview: string;
}) {
  if (!isConfigured()) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `New job matching your specializations: "${jobTitle}"`,
    html: buildHtml(
      "A new job matches your profile",
      `<p><strong>${escHtml(jobTitle)}</strong></p>
       <p>${escHtml(descriptionPreview)}</p>`,
      "View job",
      jobUrl(jobId)
    ),
  });
}

// Minimal but clean email template.
function buildHtml(
  heading: string,
  bodyHtml: string,
  ctaLabel: string,
  ctaUrl: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:100%">
        <tr><td style="background:#2d2d2d;padding:16px 24px">
          <span style="color:#f5f0e8;font-size:16px;font-weight:600">K9 Platform</span>
        </td></tr>
        <tr><td style="padding:24px">
          <h2 style="margin:0 0 16px;font-size:20px;color:#1a1a1a">${heading}</h2>
          <div style="font-size:14px;color:#444;line-height:1.6">${bodyHtml}</div>
          <div style="margin-top:24px">
            <a href="${ctaUrl}" style="display:inline-block;background:#2d2d2d;color:#fff;text-decoration:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500">${ctaLabel}</a>
          </div>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e5e5e5">
          <p style="margin:0;font-size:12px;color:#888">
            You received this because you have notifications enabled.
            <a href="${SITE_URL}/profile/edit" style="color:#888">Manage preferences</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendNewApplicationNotification({
  applicantName,
  applicantEmail,
  role,
  profileId,
}: {
  applicantName: string;
  applicantEmail: string;
  role: string;
  profileId: string;
}) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!isConfigured() || !adminEmail) return;
  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `New ${role} application — ${applicantName}`,
    html: buildHtml(
      `New ${role} application`,
      `<p><strong>${escHtml(applicantName)}</strong> (<a href="mailto:${escHtml(applicantEmail)}">${escHtml(applicantEmail)}</a>) has submitted an application as a <strong>${escHtml(role)}</strong>.</p>`,
      'Review application',
      `${SITE_URL}/admin/applications/${profileId}`
    ),
  });
}

export async function sendApprovalEmail({
  to,
  name,
  role,
}: {
  to: string;
  name: string;
  role: string;
}) {
  if (!isConfigured()) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your application has been approved — Welcome to The Pack!',
    html: buildHtml(
      'Welcome to The Pack!',
      `<p>Hi ${escHtml(name)},</p>
       <p>Your application as a <strong>${escHtml(role)}</strong> has been approved. You can now log in and complete your profile.</p>`,
      'Go to your profile',
      `${SITE_URL}/profile`
    ),
  });
}

export async function sendRejectionEmail({
  to,
  name,
  adminNotes,
}: {
  to: string;
  name: string;
  adminNotes: string;
}) {
  if (!isConfigured()) return;
  const notesHtml = adminNotes
    ? `<p><strong>Reason:</strong> ${escHtml(adminNotes)}</p>`
    : '';
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your application to The Pack',
    html: buildHtml(
      'Application update',
      `<p>Hi ${escHtml(name)},</p>
       <p>Unfortunately your application was not approved at this time.</p>
       ${notesHtml}
       <p>You may reapply at any time or contact us if you have questions.</p>`,
      'Reapply',
      `${SITE_URL}/apply`
    ),
  });
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
