import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface PasswordResetEmailProps {
  supabase_url: string
  email_action_type: string
  redirect_to: string
  token_hash: string
  token: string
  user_email: string
}

export const PasswordResetEmail = ({
  token,
  supabase_url,
  email_action_type,
  redirect_to,
  token_hash,
  user_email,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your CineMind password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>🔐 Reset Your Password</Heading>
        </Section>
        
        <Section style={content}>
          <Text style={text}>
            Hi there! We received a request to reset the password for your CineMind account.
          </Text>
          
          <Text style={text}>
            Click the button below to create a new password:
          </Text>
          
          <Section style={buttonContainer}>
            <Link
              href={`${supabase_url}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`}
              style={button}
            >
              Reset Password
            </Link>
          </Section>
          
          <Text style={text}>
            Or copy and paste this reset code if the button doesn't work:
          </Text>
          <Section style={codeContainer}>
            <Text style={code}>{token}</Text>
          </Section>
          
          <Text style={warningText}>
            ⚠️ This link will expire in 1 hour for security reasons.
          </Text>
          
          <Text style={text}>
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </Text>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            For security reasons, we recommend using a strong, unique password for your CineMind account.
          </Text>
          <Text style={footerText}>
            Need help? Contact us at{' '}
            <Link href="mailto:support@cinemind.tech" style={link}>
              support@cinemind.tech
            </Link>
          </Text>
          <Text style={footerBrand}>
            CineMind - Your AI Movie Companion
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default PasswordResetEmail

const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  textAlign: 'center' as const,
}

const content = {
  backgroundColor: '#111111',
  border: '1px solid #1f1f1f',
  borderRadius: '12px',
  padding: '32px',
  margin: '0 16px',
}

const text = {
  color: '#e5e5e5',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
}

const warningText = {
  color: '#f59e0b',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '24px 0',
  padding: '16px',
  backgroundColor: '#1f1611',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#8b5cf6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
}

const codeContainer = {
  backgroundColor: '#1f1f1f',
  border: '1px solid #333333',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
  textAlign: 'center' as const,
}

const code = {
  color: '#8b5cf6',
  fontSize: '18px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  letterSpacing: '2px',
  margin: '0',
}

const footer = {
  margin: '32px 16px 0',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#888888',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
}

const footerBrand = {
  color: '#8b5cf6',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '16px 0 0',
}

const link = {
  color: '#8b5cf6',
  textDecoration: 'underline',
}