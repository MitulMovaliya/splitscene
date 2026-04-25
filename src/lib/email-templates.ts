type OtpEmailType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | string;

type BuildOtpEmailTemplateInput = {
  otp: string;
  type: OtpEmailType;
  appName?: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"'\/]/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      case "/":
        return "&#47;";
      default:
        return character;
    }
  });
}

function getOtpTitle(type: OtpEmailType) {
  if (type === "sign-in") {
    return "Your sign-in code";
  }

  if (type === "email-verification") {
    return "Verify your email";
  }

  if (type === "forget-password") {
    return "Reset your password";
  }

  return "Your verification code";
}

export function buildOtpEmailTemplate({
  otp,
  type,
  appName = "SplitScene",
}: BuildOtpEmailTemplateInput) {
  const title = getOtpTitle(type);
  const safeAppName = escapeHtml(appName);
  const subject = `${appName}: ${title}`;
  const text = `${title}\n\nYour one-time code is: ${otp}\n\nThis code will expire soon.`;

  const html = `
    <div style="background:#f7fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">
        <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#0e7490;font-weight:700;">${safeAppName}</p>
        <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;">${title}</h1>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">Use this one-time password to continue:</p>
        <div style="margin:0 0 16px 0;padding:14px 16px;border-radius:12px;background:#ecfeff;border:1px solid #a5f3fc;font-size:28px;font-weight:700;letter-spacing:.2em;text-align:center;color:#155e75;">${otp}</div>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">This code will expire soon. If you did not request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}

type BuildResetPasswordEmailTemplateInput = {
  resetUrl: string;
  name?: string | null;
  appName?: string;
};

export function buildResetPasswordEmailTemplate({
  resetUrl,
  name,
  appName = "SplitScene",
}: BuildResetPasswordEmailTemplateInput) {
  const greetingText = name?.trim() ? `Hi ${name.trim()},` : "Hi,";
  const greetingHtml = name?.trim() ? `Hi ${escapeHtml(name.trim())},` : "Hi,";
  const title = "Reset your password";
  const subject = `${appName}: ${title}`;
  const safeAppName = escapeHtml(appName);
  const safeResetUrl = escapeHtml(resetUrl);

  const text = `${greetingText}\n\nWe received a request to reset your password. Use this link to continue:\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`;

  const html = `
    <div style="background:#f7fafc;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">
        <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#0e7490;font-weight:700;">${safeAppName}</p>
        <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;">${title}</h1>
        <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#334155;">${greetingHtml}</p>
        <p style="margin:0 0 16px 0;font-size:14px;line-height:1.6;color:#334155;">We received a request to reset your password. Click below to continue.</p>
        <p style="margin:0 0 16px 0;">
          <a href="${safeResetUrl}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#0e7490;color:#ffffff;text-decoration:none;font-weight:700;">Reset password</a>
        </p>
        <p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:#64748b;word-break:break-word;">If the button does not work, copy and paste this URL into your browser:</p>
        <p style="margin:0 0 12px 0;font-size:13px;line-height:1.6;color:#155e75;word-break:break-word;">${safeResetUrl}</p>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#64748b;">If you did not request this, you can safely ignore this email.</p>
      </div>
    </div>
  `;

  return {
    subject,
    text,
    html,
  };
}
