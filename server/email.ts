import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

const BRAND_COLORS = {
  pink: '#FF2EC3',
  purple: '#A64BFF',
  gold: '#F6C844',
  dark: '#0D0D0D',
  darkCard: '#1A1A1A',
  gray: '#374151'
};

function getEmailHeader(): string {
  return `
    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.dark} 0%, ${BRAND_COLORS.darkCard} 100%); padding: 40px 20px; text-align: center; border-bottom: 3px solid ${BRAND_COLORS.pink};">
      <h1 style="margin: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 36px; font-weight: 900; letter-spacing: 2px;">
        <span style="color: ${BRAND_COLORS.pink};">SONG</span><span style="color: white;">VERSUS</span>
      </h1>
      <p style="color: ${BRAND_COLORS.gray}; margin: 10px 0 0 0; font-size: 14px; letter-spacing: 1px;">WHERE MUSIC BATTLES</p>
    </div>
  `;
}

function getEmailFooter(): string {
  return `
    <div style="background: ${BRAND_COLORS.dark}; padding: 30px 20px; text-align: center; border-top: 1px solid ${BRAND_COLORS.gray};">
      <p style="color: ${BRAND_COLORS.gray}; margin: 0 0 10px 0; font-size: 12px;">
        This email was sent from SongVersus. If you didn't request this, you can safely ignore it.
      </p>
      <p style="color: ${BRAND_COLORS.gray}; margin: 0; font-size: 12px;">
        &copy; ${new Date().getFullYear()} SongVersus. All rights reserved.
      </p>
    </div>
  `;
}

function getButton(text: string, url: string, color: string = BRAND_COLORS.pink): string {
  return `
    <a href="${url}" style="display: inline-block; background: ${color}; color: ${color === BRAND_COLORS.gold ? BRAND_COLORS.dark : 'white'}; text-decoration: none; padding: 16px 40px; font-size: 16px; font-weight: bold; border-radius: 8px; letter-spacing: 1px; text-transform: uppercase; box-shadow: 0 4px 15px ${color}40;">
      ${text}
    </a>
  `;
}

function wrapEmail(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background: #000000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: ${BRAND_COLORS.darkCard}; border-radius: 12px; overflow: hidden; box-shadow: 0 0 40px ${BRAND_COLORS.purple}20;">
        ${getEmailHeader()}
        <div style="padding: 40px 30px; background: ${BRAND_COLORS.darkCard};">
          ${content}
        </div>
        ${getEmailFooter()}
      </div>
    </body>
    </html>
  `;
}

export function getVerificationEmailTemplate(verificationUrl: string, userName: string): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
      Welcome to the Arena, <span style="color: ${BRAND_COLORS.gold};">${userName || 'Artist'}</span>!
    </h2>
    
    <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
      You're one step away from joining the ultimate music battle platform. 
      Verify your email to start competing, voting, and rising through the ranks!
    </p>

    <div style="text-align: center; margin: 35px 0;">
      ${getButton('Verify My Email', verificationUrl, BRAND_COLORS.pink)}
    </div>

    <div style="background: ${BRAND_COLORS.dark}; border-radius: 8px; padding: 20px; margin-top: 30px; border-left: 4px solid ${BRAND_COLORS.purple};">
      <p style="color: ${BRAND_COLORS.gray}; font-size: 14px; margin: 0;">
        <strong style="color: ${BRAND_COLORS.purple};">Tip:</strong> This link expires in 24 hours. If you didn't create an account on SongVersus, you can ignore this email.
      </p>
    </div>

    <p style="color: ${BRAND_COLORS.gray}; font-size: 12px; text-align: center; margin-top: 30px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <span style="color: ${BRAND_COLORS.pink}; word-break: break-all;">${verificationUrl}</span>
    </p>
  `;

  return {
    subject: 'Verify Your SongVersus Account',
    html: wrapEmail(content)
  };
}

export function getPasswordResetEmailTemplate(resetUrl: string, userName: string): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
      Reset Your Password
    </h2>
    
    <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
      Hey <span style="color: ${BRAND_COLORS.gold};">${userName || 'there'}</span>! 
      We received a request to reset your password. Click the button below to create a new one.
    </p>

    <div style="text-align: center; margin: 35px 0;">
      ${getButton('Reset Password', resetUrl, BRAND_COLORS.purple)}
    </div>

    <div style="background: ${BRAND_COLORS.dark}; border-radius: 8px; padding: 20px; margin-top: 30px; border-left: 4px solid ${BRAND_COLORS.gold};">
      <p style="color: ${BRAND_COLORS.gray}; font-size: 14px; margin: 0;">
        <strong style="color: ${BRAND_COLORS.gold};">Security Notice:</strong> This link expires in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
      </p>
    </div>

    <p style="color: ${BRAND_COLORS.gray}; font-size: 12px; text-align: center; margin-top: 30px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <span style="color: ${BRAND_COLORS.purple}; word-break: break-all;">${resetUrl}</span>
    </p>
  `;

  return {
    subject: 'Reset Your SongVersus Password',
    html: wrapEmail(content)
  };
}

export function getWelcomeEmailTemplate(userName: string): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
      Welcome to <span style="color: ${BRAND_COLORS.pink};">SongVersus</span>!
    </h2>
    
    <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
      Congratulations, <span style="color: ${BRAND_COLORS.gold};">${userName || 'Artist'}</span>! 
      Your email is verified and you're officially part of the arena.
    </p>

    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.dark} 0%, ${BRAND_COLORS.purple}20 100%); border-radius: 12px; padding: 25px; margin: 25px 0; border: 1px solid ${BRAND_COLORS.purple}40;">
      <h3 style="color: ${BRAND_COLORS.purple}; margin: 0 0 15px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Here's What You Can Do:</h3>
      <ul style="color: #9CA3AF; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
        <li><span style="color: ${BRAND_COLORS.pink};">Battle</span> against other producers and artists</li>
        <li><span style="color: ${BRAND_COLORS.purple};">Vote</span> on battles and earn XP</li>
        <li><span style="color: ${BRAND_COLORS.gold};">Rise</span> through the leaderboard ranks</li>
        <li><span style="color: ${BRAND_COLORS.pink};">Customize</span> your profile with unique items</li>
      </ul>
    </div>

    <p style="color: #9CA3AF; font-size: 14px; text-align: center; margin-top: 25px;">
      Ready to make your mark? Start your first battle now!
    </p>
  `;

  return {
    subject: 'Welcome to SongVersus - Let the Battles Begin!',
    html: wrapEmail(content)
  };
}

export function getBattleInviteEmailTemplate(inviterName: string, battleTitle: string, battleUrl: string): { subject: string; html: string } {
  const content = `
    <h2 style="color: white; margin: 0 0 20px 0; font-size: 24px; text-align: center;">
      You've Been Challenged!
    </h2>
    
    <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
      <span style="color: ${BRAND_COLORS.gold};">${inviterName}</span> has challenged you to a battle on SongVersus!
    </p>

    <div style="background: linear-gradient(135deg, ${BRAND_COLORS.dark} 0%, ${BRAND_COLORS.pink}20 100%); border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; border: 1px solid ${BRAND_COLORS.pink}40;">
      <p style="color: ${BRAND_COLORS.gray}; margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Battle</p>
      <h3 style="color: ${BRAND_COLORS.pink}; margin: 0; font-size: 20px;">${battleTitle}</h3>
    </div>

    <div style="text-align: center; margin: 35px 0;">
      ${getButton('Accept Challenge', battleUrl, BRAND_COLORS.gold)}
    </div>

    <p style="color: ${BRAND_COLORS.gray}; font-size: 14px; text-align: center; margin-top: 25px;">
      Show them what you've got. The arena awaits!
    </p>
  `;

  return {
    subject: `${inviterName} Challenged You on SongVersus!`,
    html: wrapEmail(content)
  };
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    // Use Resend's test domain if no verified domain is configured
    const senderEmail = fromEmail && !fromEmail.includes('gmail.com') && !fromEmail.includes('yahoo.com') 
      ? fromEmail 
      : 'SongVersus <onboarding@resend.dev>';
    
    const { data, error } = await client.emails.send({
      from: senderEmail,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('[email] Failed to send email:', error);
      return { success: false, error: error.message };
    }

    console.log('[email] Email sent successfully:', data?.id);
    return { success: true };
  } catch (error: any) {
    console.error('[email] Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendVerificationEmail(to: string, verificationUrl: string, userName: string): Promise<{ success: boolean; error?: string }> {
  const { subject, html } = getVerificationEmailTemplate(verificationUrl, userName);
  return sendEmail(to, subject, html);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string, userName: string): Promise<{ success: boolean; error?: string }> {
  const { subject, html } = getPasswordResetEmailTemplate(resetUrl, userName);
  return sendEmail(to, subject, html);
}

export async function sendWelcomeEmail(to: string, userName: string): Promise<{ success: boolean; error?: string }> {
  const { subject, html } = getWelcomeEmailTemplate(userName);
  return sendEmail(to, subject, html);
}

export async function sendBattleInviteEmail(to: string, inviterName: string, battleTitle: string, battleUrl: string): Promise<{ success: boolean; error?: string }> {
  const { subject, html } = getBattleInviteEmailTemplate(inviterName, battleTitle, battleUrl);
  return sendEmail(to, subject, html);
}
