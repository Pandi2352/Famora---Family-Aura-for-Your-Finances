export const inviteTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background:#f8fafc; font-family:'Inter',Arial,sans-serif;">
  <div style="max-width:480px; margin:40px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#4f46e5,#6366f1); padding:32px 24px; text-align:center;">
      <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:700;">Famora</h1>
      <p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:13px;">Family Aura for Your Finances</p>
    </div>

    <!-- Body -->
    <div style="padding:32px 24px;">
      <h2 style="margin:0 0 8px; color:#0f172a; font-size:18px;">You're invited to join a family!</h2>
      <p style="margin:0 0 24px; color:#64748b; font-size:14px; line-height:1.6;">
        <strong style="color:#0f172a;">{{inviter_name}}</strong> has invited you to join
        <strong style="color:#4f46e5;">{{family_name}}</strong> on Famora as their <strong>{{relationship}}</strong>.
      </p>

      <!-- Credentials box -->
      <div style="background:#f1f5f9; border-radius:12px; padding:20px; margin-bottom:24px;">
        <p style="margin:0 0 12px; color:#64748b; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">Your login credentials</p>
        <div style="margin-bottom:8px;">
          <span style="color:#64748b; font-size:13px;">Email:</span>
          <span style="color:#0f172a; font-size:14px; font-weight:600; margin-left:8px;">{{email}}</span>
        </div>
        <div>
          <span style="color:#64748b; font-size:13px;">Password:</span>
          <span style="color:#4f46e5; font-size:14px; font-weight:600; margin-left:8px; letter-spacing:1px;">{{temp_password}}</span>
        </div>
      </div>

      <p style="margin:0 0 24px; color:#64748b; font-size:13px; line-height:1.6;">
        Please login and change your password immediately for security.
      </p>

      <!-- CTA -->
      <a href="{{login_url}}" style="display:block; text-align:center; background:#4f46e5; color:#ffffff; padding:14px 24px; border-radius:10px; text-decoration:none; font-size:14px; font-weight:600;">
        Login to Famora
      </a>
    </div>

    <!-- Footer -->
    <div style="padding:16px 24px; border-top:1px solid #e2e8f0; text-align:center;">
      <p style="margin:0; color:#94a3b8; font-size:11px;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>

  </div>
</body>
</html>
`;
