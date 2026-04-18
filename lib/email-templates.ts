const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "https://apporganizacao.vercel.app";

function layout(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#F8FAFB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFB;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<!-- Logo -->
<tr><td style="padding:32px 40px 24px;border-bottom:1px solid #E5E7EB;">
  <span style="font-size:24px;font-weight:700;color:#1B6545;letter-spacing:-0.5px;">Shiftsly</span>
</td></tr>
<!-- Content -->
<tr><td style="padding:32px 40px;">
${content}
</td></tr>
<!-- Footer -->
<tr><td style="padding:24px 40px;border-top:1px solid #E5E7EB;">
  <p style="margin:0;font-size:12px;color:#6B7280;line-height:1.5;">
    Shiftsly — The scheduling tool for cleaning managers.<br>
    <a href="${baseUrl}" style="color:#6B7280;">apporganizacao.vercel.app</a>
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background-color:#1B6545;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${text}</a>`;
}

export function welcomeEmailTemplate(name: string | null): string {
  const displayName = name || "there";
  return layout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">Welcome to Shiftsly! 🎉</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Hi ${displayName},
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Your account is ready. Here's how to get started:
    </p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr><td style="padding:8px 0;font-size:15px;color:#374151;">
        <strong style="color:#1B6545;">1.</strong> Add your cleaners
      </td></tr>
      <tr><td style="padding:8px 0;font-size:15px;color:#374151;">
        <strong style="color:#1B6545;">2.</strong> Set up your weekly template
      </td></tr>
      <tr><td style="padding:8px 0;font-size:15px;color:#374151;">
        <strong style="color:#1B6545;">3.</strong> Generate your first week
      </td></tr>
    </table>
    <p style="margin:0 0 28px;">
      ${ctaButton("Go to dashboard →", `${baseUrl}/dashboard`)}
    </p>
    <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.5;">
      You have <strong>14 days</strong> to try everything for free. No credit card needed.
    </p>
  `);
}

export function trialEndingTemplate(name: string | null, plan: string): string {
  const displayName = name || "there";
  return layout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">Your trial ends in 3 days</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Hi ${displayName},
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Your free trial of <strong>Shiftsly ${plan}</strong> ends in 3 days.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      To keep using all features, no action is needed — your card will be charged automatically.
      If you want to change or cancel your plan, visit your billing settings.
    </p>
    <p style="margin:0 0 28px;">
      ${ctaButton("Manage subscription →", `${baseUrl}/settings/billing`)}
    </p>
    <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.5;">
      Questions? Just reply to this email.
    </p>
  `);
}

export function paymentFailedTemplate(name: string | null): string {
  const displayName = name || "there";
  return layout(`
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111827;">⚠️ Payment failed</h1>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      Hi ${displayName},
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
      We couldn't process your payment for Shiftsly. Please update your payment method to avoid losing access to your account features.
    </p>
    <p style="margin:0 0 28px;">
      ${ctaButton("Update payment →", `${baseUrl}/settings/billing`)}
    </p>
    <p style="margin:0;font-size:14px;color:#6B7280;line-height:1.5;">
      If this was a mistake, the payment will be retried automatically in a few days.
    </p>
  `);
}
