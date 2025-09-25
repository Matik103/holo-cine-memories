import { supabase } from '@/integrations/supabase/client';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  type: 'signup' | 'password_reset';
  userData?: {
    full_name?: string;
  };
}

class EmailService {
  private async sendEmail(emailData: EmailData) {
    try {
      console.log('Sending email via custom service:', emailData.to);
      
      const { data, error } = await supabase.functions.invoke('send-auth-emails', {
        body: {
          user: {
            email: emailData.to,
            user_metadata: emailData.userData || {}
          },
          email_data: {
            token: 'custom-token', // We'll handle this differently
            token_hash: 'custom-hash',
            redirect_to: `${window.location.origin}/auth`,
            email_action_type: emailData.type,
            site_url: window.location.origin
          }
        }
      });

      if (error) {
        console.error('Email service error:', error);
        throw error;
      }

      console.log('Email sent successfully:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  async sendSignupConfirmation(email: string, userData?: { full_name?: string }) {
    const confirmationUrl = `${window.location.origin}/auth?type=signup&email=${encodeURIComponent(email)}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Welcome to CineMind - Confirm Your Email',
      html: this.getSignupTemplate(userData?.full_name || 'there', confirmationUrl),
      type: 'signup',
      userData
    });
  }

  async sendPasswordReset(email: string, userData?: { full_name?: string }) {
    const resetUrl = `${window.location.origin}/auth?type=recovery&email=${encodeURIComponent(email)}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Reset Your CineMind Password',
      html: this.getPasswordResetTemplate(userData?.full_name || 'there', resetUrl),
      type: 'password_reset',
      userData
    });
  }

  private getSignupTemplate(displayName: string, confirmationUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">CineMind</h1>
          <p style="color: #6b7280; margin: 5px 0;">Your AI Movie Memory Companion</p>
        </div>
        
        <h2 style="color: #1f2937;">Welcome ${displayName}!</h2>
        
        <p style="color: #374151; line-height: 1.6;">
          Thanks for joining CineMind! We're excited to help you remember every movie with the power of AI.
        </p>
        
        <p style="color: #374151; line-height: 1.6;">
          To get started, please confirm your email address by clicking the button below:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationUrl}" 
             style="background: linear-gradient(135deg, #7c3aed, #a855f7); 
                    color: white; 
                    padding: 14px 28px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    display: inline-block;">
            Confirm Your Email
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${confirmationUrl}" style="color: #7c3aed; word-break: break-all;">${confirmationUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          This email was sent by CineMind. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `;
  }

  private getPasswordResetTemplate(displayName: string, resetUrl: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7c3aed; margin: 0;">CineMind</h1>
          <p style="color: #6b7280; margin: 5px 0;">Your AI Movie Memory Companion</p>
        </div>
        
        <h2 style="color: #1f2937;">Reset Your Password</h2>
        
        <p style="color: #374151; line-height: 1.6;">
          Hi ${displayName},
        </p>
        
        <p style="color: #374151; line-height: 1.6;">
          We received a request to reset your password. Click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: linear-gradient(135deg, #7c3aed, #a855f7); 
                    color: white; 
                    padding: 14px 28px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    font-weight: bold;
                    display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser:
          <br>
          <a href="${resetUrl}" style="color: #7c3aed; word-break: break-all;">${resetUrl}</a>
        </p>
        
        <p style="color: #ef4444; font-size: 14px; line-height: 1.6;">
          If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          This email was sent by CineMind. This link will expire in 24 hours for security reasons.
        </p>
      </div>
    `;
  }
}

export const emailService = new EmailService();
