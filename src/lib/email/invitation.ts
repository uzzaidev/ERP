/**
 * Email service for sending invitation emails
 * Uses Resend API for sending emails
 */

interface InvitationEmailData {
  to: string;
  tenantName: string;
  roleName: string;
  invitedBy: string;
  invitationLink: string;
}

/**
 * Sends an invitation email to the user
 * 
 * To use this function in production:
 * 1. Install Resend: npm install resend
 * 2. Add RESEND_API_KEY to your environment variables
 * 3. Verify your domain in Resend dashboard
 * 4. Update the 'from' email address below
 */
export async function sendInvitationEmail(data: InvitationEmailData): Promise<void> {
  const { to, tenantName, roleName, invitedBy, invitationLink } = data;

  // Check if Resend is configured
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn('⚠️  RESEND_API_KEY not configured. Email not sent.');
    console.log('Invitation details:', {
      to,
      tenantName,
      roleName,
      invitedBy,
      invitationLink
    });
    return;
  }

  try {
    // Dynamic import to avoid errors if resend is not installed
    let Resend;
    try {
      const resendModule = await import('resend');
      Resend = resendModule.Resend;
    } catch {
      console.warn('⚠️  Resend package not installed. To enable email sending, run: pnpm install resend');
      console.log('Invitation details:', {
        to,
        tenantName,
        roleName,
        invitedBy,
        invitationLink
      });
      return;
    }
    const resend = new Resend(resendApiKey);

    const { data: emailData, error } = await resend.emails.send({
      from: 'ERP System <noreply@yourcompany.com>', // Update this with your verified domain
      to: [to],
      subject: `Você foi convidado para se juntar à ${tenantName}`,
      html: getInvitationEmailTemplate(data),
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      throw new Error('Failed to send invitation email');
    }

    console.log('Invitation email sent successfully:', emailData);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    // Don't throw error to prevent blocking the invitation creation
    // Just log it for monitoring
  }
}

/**
 * HTML template for invitation email
 */
function getInvitationEmailTemplate(data: InvitationEmailData): string {
  const { tenantName, roleName, invitedBy, invitationLink } = data;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Convite para ${tenantName}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">Você foi convidado!</h1>
  </div>
  
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Olá!
    </p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      <strong>${invitedBy}</strong> convidou você para se juntar à equipe da <strong>${tenantName}</strong> no nosso sistema ERP.
    </p>
    
    <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 10px 0;">
        <strong>Empresa:</strong> ${tenantName}
      </p>
      <p style="margin: 10px 0;">
        <strong>Função:</strong> ${roleName}
      </p>
      <p style="margin: 10px 0;">
        <strong>Convidado por:</strong> ${invitedBy}
      </p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Para aceitar o convite e criar sua conta, clique no botão abaixo:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${invitationLink}" 
         style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 15px 30px; 
                text-decoration: none; 
                border-radius: 5px; 
                display: inline-block;
                font-weight: bold;
                font-size: 16px;">
        Aceitar Convite
      </a>
    </div>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px;">
      Ou copie e cole o link abaixo no seu navegador:
    </p>
    <p style="font-size: 12px; color: #666; word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 5px;">
      ${invitationLink}
    </p>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
      <strong>Nota:</strong> Este convite expira em 7 dias. Se você não solicitou este convite, pode ignorar este email.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} ERP System. Todos os direitos reservados.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Alternative: Console log email for development
 * Useful when email service is not configured
 */
export function logInvitationEmail(data: InvitationEmailData): void {
  console.log('\n📧 ===== INVITATION EMAIL =====');
  console.log(`To: ${data.to}`);
  console.log(`Tenant: ${data.tenantName}`);
  console.log(`Role: ${data.roleName}`);
  console.log(`Invited by: ${data.invitedBy}`);
  console.log(`Link: ${data.invitationLink}`);
  console.log('================================\n');
}
