import {
  Html,
  Head,
  Font,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components'

interface TestEmailProps {
  recipientName?: string
  recipientEmail?: string
  senderName?: string
  senderEmail?: string
  replyToEmail?: string
  testTimestamp?: string
  websiteUrl?: string
}

export const TestEmail = ({
  recipientName = 'Test User',
  recipientEmail = 'test@example.com',
  senderName = "Cela's Birthday",
  senderEmail = 'birthday@example.com',
  replyToEmail = 'noreply@example.com',
  testTimestamp = new Date().toISOString(),
  websiteUrl = 'https://doofio.site',
}: TestEmailProps) => {
  const previewText = `Test email from ${senderName} - Email configuration test`

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Row>
              <Column>
                <Text style={headerTitle}>🧪 Email Configuration Test</Text>
                <Text style={headerSubtitle}>{senderName}</Text>
              </Column>
            </Row>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={greeting}>Hello {recipientName}!</Text>
            
            <Text style={paragraph}>
              This is a test email to verify that your email configuration is working correctly. 
              If you're receiving this email, it means your email settings have been configured successfully! 🎉
            </Text>

            {/* Configuration Details */}
            <Section style={configSection}>
              <Text style={configTitle}>📧 Email Configuration Details</Text>
              
              <Row style={configRow}>
                <Column style={configLabel}>
                  <Text style={configLabelText}>Sender Name:</Text>
                </Column>
                <Column style={configValue}>
                  <Text style={configValueText}>{senderName}</Text>
                </Column>
              </Row>
              
              <Row style={configRow}>
                <Column style={configLabel}>
                  <Text style={configLabelText}>Sender Email:</Text>
                </Column>
                <Column style={configValue}>
                  <Text style={configValueText}>{senderEmail}</Text>
                </Column>
              </Row>
              
              <Row style={configRow}>
                <Column style={configLabel}>
                  <Text style={configLabelText}>Reply-To Email:</Text>
                </Column>
                <Column style={configValue}>
                  <Text style={configValueText}>{replyToEmail}</Text>
                </Column>
              </Row>
              
              <Row style={configRow}>
                <Column style={configLabel}>
                  <Text style={configLabelText}>Test Recipient:</Text>
                </Column>
                <Column style={configValue}>
                  <Text style={configValueText}>{recipientEmail}</Text>
                </Column>
              </Row>
              
              <Row style={configRow}>
                <Column style={configLabel}>
                  <Text style={configLabelText}>Test Time:</Text>
                </Column>
                <Column style={configValue}>
                  <Text style={configValueText}>
                    {new Date(testTimestamp).toLocaleString('en-US', {
                      timeZone: 'Asia/Manila',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZoneName: 'short'
                    })}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Text style={paragraph}>
              ✅ <strong>Email delivery is working!</strong><br/>
              ✅ <strong>SMTP configuration is correct!</strong><br/>
              ✅ <strong>Email templates are rendering properly!</strong>
            </Text>

            <Text style={paragraph}>
              You can now confidently use this email configuration for sending birthday notifications, 
              contributor thank you emails, and other important messages.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Link href={`${websiteUrl}/admin/emails`} style={button}>
                Back to Email Settings
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={websiteUrl} style={footerLink}>
                🎂 {senderName}
              </Link>
            </Text>
            <Text style={footerText}>
              Making birthdays special, one surprise at a time! 💕
            </Text>
            <Text style={footerSubtext}>
              This is a test email sent from your Birthday Surprise application.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#fef7f7',
  fontFamily: 'Inter, Arial, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
  maxWidth: '100%',
}

const header = {
  backgroundColor: '#ffffff',
  borderRadius: '12px 12px 0 0',
  padding: '32px 32px 24px',
  textAlign: 'center' as const,
  borderBottom: '3px solid #f8d7da',
}

const headerTitle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#2d3748',
  margin: '0 0 8px 0',
  lineHeight: '1.2',
}

const headerSubtitle = {
  fontSize: '18px',
  fontWeight: '500',
  color: '#e91e63',
  margin: '0',
  lineHeight: '1.4',
}

const content = {
  backgroundColor: '#ffffff',
  padding: '32px',
  borderRadius: '0 0 12px 12px',
}

const greeting = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#2d3748',
  margin: '0 0 24px 0',
  lineHeight: '1.4',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#4a5568',
  margin: '0 0 20px 0',
}

const configSection = {
  backgroundColor: '#f7fafc',
  border: '2px solid #e2e8f0',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const configTitle = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#2d3748',
  margin: '0 0 16px 0',
}

const configRow = {
  marginBottom: '8px',
}

const configLabel = {
  width: '140px',
  verticalAlign: 'top',
}

const configLabelText = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#718096',
  margin: '0',
}

const configValue = {
  verticalAlign: 'top',
}

const configValueText = {
  fontSize: '14px',
  fontWeight: '400',
  color: '#2d3748',
  margin: '0',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#e91e63',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 28px',
  lineHeight: '1.4',
}

const hr = {
  borderColor: '#e2e8f0',
  margin: '32px 0',
}

const footer = {
  textAlign: 'center' as const,
  padding: '0 32px',
}

const footerText = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#e91e63',
  margin: '0 0 8px 0',
  lineHeight: '1.4',
}

const footerLink = {
  color: '#e91e63',
  textDecoration: 'none',
}

const footerSubtext = {
  fontSize: '14px',
  color: '#718096',
  margin: '0',
  lineHeight: '1.4',
}

export default TestEmail
