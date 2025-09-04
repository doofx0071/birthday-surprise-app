import React from 'react'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Button,
  Hr,
} from '@react-email/components'

interface PasswordResetEmailProps {
  adminName?: string
  resetLink: string
  expirationTime?: string
}

export default function PasswordResetEmail({
  adminName = 'Admin',
  resetLink,
  expirationTime = '1 hour'
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Img
                  src="https://doofio.site/assets/logos/logo.png"
                  width="60"
                  height="60"
                  alt="Birthday Surprise Logo"
                  style={logo}
                />
              </Column>
              <Column style={headerText}>
                <Text style={heading}>Password Reset Request</Text>
                <Text style={subheading}>Birthday Surprise Admin</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hello {adminName},</Text>

            <Text style={paragraph}>
              We received a request to reset your password for your <strong>Birthday Surprise Admin</strong> account.
              If you made this request, click the button below to reset your password and regain access to the admin panel.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={resetLink}>
                Reset Password
              </Button>
            </Section>

            <Text style={paragraph}>
              This password reset link will expire in <strong>{expirationTime}</strong>.
              If you don't reset your password within this time, you'll need to request a new reset link from the admin login page.
            </Text>

            <Text style={paragraph}>
              If you didn't request a password reset, you can safely ignore this email.
              Your password will remain unchanged and your account remains secure.
            </Text>

            <Hr style={divider} />

            <Text style={securityNote}>
              <strong>🔒 Security Note:</strong> For your security, this link can only be used once and will expire in {expirationTime}.
              If you need to reset your password again, please request a new reset link from the admin login page.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent from the <strong>Birthday Surprise Admin System</strong>.
            </Text>
            <Text style={footerText}>
              If you have any questions or didn't request this reset, please contact the system administrator.
            </Text>
            <Text style={footerLink}>
              <Link href="https://doofio.site" style={link}>
                🎂 Visit Birthday Surprise
              </Link>
            </Text>
            <Text style={footerText}>
              <em>Making birthdays special, one surprise at a time! 💕</em>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#fdf2f8',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
}

const header = {
  backgroundColor: '#ffffff',
  borderRadius: '12px 12px 0 0',
  padding: '32px 40px',
  borderBottom: '1px solid #fce7f3',
}

const logo = {
  borderRadius: '8px',
}

const headerText = {
  paddingLeft: '20px',
  verticalAlign: 'top',
}

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#1f2937',
  margin: '0 0 4px 0',
}

const subheading = {
  fontSize: '16px',
  color: '#6b7280',
  margin: '0',
}

const content = {
  backgroundColor: '#ffffff',
  padding: '40px',
  borderRadius: '0 0 12px 12px',
}

const greeting = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1f2937',
  margin: '0 0 24px 0',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#374151',
  margin: '0 0 20px 0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#ec4899',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  border: 'none',
  cursor: 'pointer',
}

const divider = {
  borderColor: '#fce7f3',
  margin: '32px 0',
}

const securityNote = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  backgroundColor: '#fef7ff',
  padding: '16px',
  borderRadius: '8px',
  border: '1px solid #fce7f3',
  margin: '20px 0 0 0',
}

const footer = {
  backgroundColor: '#fdf2f8',
  padding: '32px 40px',
  borderRadius: '12px',
  marginTop: '20px',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px 0',
}

const footerLink = {
  margin: '16px 0 0 0',
}

const link = {
  color: '#ec4899',
  textDecoration: 'none',
  fontWeight: '500',
}
