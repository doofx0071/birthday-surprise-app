// Thank you email template for message contributors
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Button,
  Hr,
  Link,
} from '@react-email/components'
import type { ThankYouEmailProps } from '@/types/email'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app'

export function ThankYouEmail({
  contributorName = 'Friend',
  contributorEmail,
  girlfriendName = 'Gracela Elmera C. Betarmos',
  messagePreview = '',
  websiteUrl = baseUrl,
}: ThankYouEmailProps) {
  const previewText = `Thank you for contributing to ${girlfriendName}'s birthday surprise!`

  return (
    <Html>
      <Head>
        <title>Thank You for Your Birthday Message!</title>
        <meta name="description" content={previewText} />
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Row>
              <Column align="center">
                <Heading style={mainHeadingStyle}>
                  Thank You!
                </Heading>
                <Text style={subHeadingStyle}>
                  Your message has been received
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Elegant divider */}
          <Section style={dividerSectionStyle}>
            <Row>
              <Column align="center">
                <div style={elegantDividerStyle}></div>
              </Column>
            </Row>
          </Section>

          {/* Personal greeting */}
          <Section style={greetingStyle}>
            <Row>
              <Column>
                <Text style={greetingTextStyle}>
                  Hi {contributorName}! 👋
                </Text>
                <Text style={messageStyle}>
                  Thank you so much for contributing to {girlfriendName}'s birthday surprise! 
                  Your heartfelt message has been received and will be part of something 
                  truly magical on her special day.
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Message preview */}
          {messagePreview && (
            <Section style={previewStyle}>
              <Row>
                <Column>
                  <Heading style={previewHeadingStyle}>
                    📝 Your Message Preview
                  </Heading>
                  <Text style={previewTextStyle}>
                    "{messagePreview.length > 150 ? messagePreview.substring(0, 150) + '...' : messagePreview}"
                  </Text>
                </Column>
              </Row>
            </Section>
          )}

          {/* What happens next */}
          <Section style={nextStepsStyle}>
            <Row>
              <Column>
                <Heading style={sectionHeadingStyle}>
                  🎁 What Happens Next?
                </Heading>
                <Text style={messageStyle}>
                  Your message will be carefully reviewed and then added to the birthday 
                  surprise collection. On {girlfriendName}'s birthday, all messages will 
                  be revealed in a beautiful, interactive celebration!
                </Text>
                <Text style={messageStyle}>
                  You'll receive a notification email when the birthday surprise goes live, 
                  so you can see the amazing collection of love and memories from everyone.
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Features highlight */}
          <Section style={featuresStyle}>
            <Row>
              <Column>
                <Heading style={sectionHeadingStyle}>
                  🌟 Birthday Surprise Features
                </Heading>
                <Text style={featureItemStyle}>
                  🗺️ <strong>Memory Map:</strong> See messages from around the world
                </Text>
                <Text style={featureItemStyle}>
                  📸 <strong>Photo Gallery:</strong> Beautiful collection of memories
                </Text>
                <Text style={featureItemStyle}>
                  ⏰ <strong>Countdown Timer:</strong> Building excitement for the big day
                </Text>
                <Text style={featureItemStyle}>
                  💌 <strong>Message Collection:</strong> Heartfelt wishes from loved ones
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Call to action */}
          <Section style={ctaStyle}>
            <Row>
              <Column align="center">
                <Text style={ctaTextStyle}>
                  Want to see the birthday surprise in progress?
                </Text>
                <Button style={buttonStyle} href={websiteUrl}>
                  🎂 Visit Birthday Surprise 🎂
                </Button>
              </Column>
            </Row>
          </Section>

          {/* Reminder about notifications */}
          <Section style={reminderStyle}>
            <Row>
              <Column>
                <Text style={reminderTextStyle}>
                  📧 <strong>Email Notifications:</strong> If you opted in for birthday reminders, 
                  you'll receive notifications about upcoming birthdays and when this surprise goes live!
                </Text>
              </Column>
            </Row>
          </Section>

          <Hr style={dividerStyle} />

          {/* Footer */}
          <Section style={footerStyle}>
            <Row>
              <Column align="center">
                <Text style={footerTextStyle}>
                  Thank you for making this birthday extra special! 💕
                </Text>
                <Text style={footerSubTextStyle}>
                  Your kindness and thoughtfulness mean the world
                </Text>
                <Link href={websiteUrl} style={linkStyle}>
                  Birthday Surprise Team
                </Link>
              </Column>
            </Row>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const bodyStyle = {
  backgroundColor: '#fdf2f8',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: '20px',
  lineHeight: '1.6',
  WebkitTextSizeAdjust: '100%',
  msTextSizeAdjust: '100%',
}

const containerStyle = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  width: '100%',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(236, 72, 153, 0.1)',
  border: '1px solid #fce7f3',
}

const headerStyle = {
  background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
  padding: '60px 40px',
  textAlign: 'center' as const,
}

const dividerSectionStyle = {
  padding: '0 40px',
}

const elegantDividerStyle = {
  height: '2px',
  background: 'linear-gradient(90deg, transparent 0%, #ec4899 50%, transparent 100%)',
  border: 'none',
  margin: '0',
}

const mainHeadingStyle = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: '700',
  margin: '0 0 16px 0',
  letterSpacing: '-0.5px',
  lineHeight: '1.2',
}

const subHeadingStyle = {
  color: '#fce7f3',
  fontSize: '18px',
  margin: '0',
  fontWeight: '400',
  opacity: '0.95',
}

const bannerStyle = {
  backgroundColor: '#ecfdf5',
  padding: '20px',
  textAlign: 'center' as const,
}

const bannerTextStyle = {
  fontSize: '24px',
  margin: '0',
  letterSpacing: '2px',
}

const greetingStyle = {
  padding: '30px 20px 20px 20px',
}

const greetingTextStyle = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
}

const messageStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
}

const previewStyle = {
  backgroundColor: '#f9fafb',
  padding: '25px 20px',
  margin: '0 20px',
  borderRadius: '8px',
  borderLeft: '4px solid #10b981',
}

const previewHeadingStyle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
}

const previewTextStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
  fontStyle: 'italic',
  backgroundColor: '#ffffff',
  padding: '15px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
}

const nextStepsStyle = {
  padding: '30px 20px',
}

const sectionHeadingStyle = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
}

const featuresStyle = {
  backgroundColor: '#f0fdf4',
  padding: '30px 20px',
  margin: '0 20px',
  borderRadius: '8px',
}

const featureItemStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 12px 0',
}

const ctaStyle = {
  padding: '40px 20px',
  textAlign: 'center' as const,
}

const ctaTextStyle = {
  color: '#374151',
  fontSize: '16px',
  margin: '0 0 20px 0',
}

const buttonStyle = {
  backgroundColor: '#ec4899',
  borderRadius: '12px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  padding: '18px 36px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 8px 20px rgba(236, 72, 153, 0.3)',
  border: 'none',
  transition: 'all 0.3s ease',
}

const reminderStyle = {
  backgroundColor: '#fffbeb',
  padding: '20px',
  margin: '0 20px',
  borderRadius: '8px',
  borderLeft: '4px solid #f59e0b',
}

const reminderTextStyle = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
}

const dividerStyle = {
  borderColor: '#e5e7eb',
  margin: '30px 0',
}

const footerStyle = {
  padding: '30px 20px',
  textAlign: 'center' as const,
}

const footerTextStyle = {
  color: '#ec4899',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px 0',
}

const footerSubTextStyle = {
  color: '#6b7280',
  fontSize: '15px',
  margin: '0 0 20px 0',
  lineHeight: '1.5',
}

const linkStyle = {
  color: '#ec4899',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
}

export default ThankYouEmail
