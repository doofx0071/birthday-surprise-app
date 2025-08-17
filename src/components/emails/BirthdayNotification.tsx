// Birthday notification email template for the girlfriend
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
  Img,
  Hr,
  Link,
} from '@react-email/components'
import type { BirthdayNotificationProps } from '@/types/email'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app'

export function BirthdayNotificationEmail({
  recipientName = 'Gracela Elmera C. Betarmos',
  girlfriendName = 'Gracela Elmera C. Betarmos',
  messageCount = 0,
  contributorCount = 0,
  locationCount = 0,
  websiteUrl = baseUrl,
  previewText = 'Your special day has arrived! See all the love waiting for you...',
}: BirthdayNotificationProps) {
  return (
    <Html>
      <Head>
        <title>Happy Birthday {girlfriendName}!</title>
        <meta name="description" content={previewText} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header with birthday celebration */}
          <Section style={headerStyle}>
            <Row>
              <Column align="center">
                <Heading style={mainHeadingStyle}>
                  Happy Birthday
                </Heading>
                <Heading style={nameHeadingStyle}>
                  {girlfriendName}
                </Heading>
                <Text style={subHeadingStyle}>
                  Your special day has finally arrived
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

          {/* Main message */}
          <Section style={contentStyle}>
            <Row>
              <Column>
                <Text style={messageStyle}>
                  Your family and friends have been secretly preparing something very special for you.
                </Text>

                <Text style={messageStyle}>
                  We've collected heartfelt messages, beautiful memories, and love from around the world,
                  all waiting to make your birthday absolutely magical.
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Statistics */}
          <Section style={statsStyle}>
            <Row>
              <Column style={statColumnStyle} align="center">
                <Text style={statNumberStyle}>{messageCount}</Text>
                <Text style={statLabelStyle}>Birthday Messages</Text>
              </Column>
              <Column style={statColumnStyle} align="center">
                <Text style={statNumberStyle}>{contributorCount}</Text>
                <Text style={statLabelStyle}>People Who Love You</Text>
              </Column>
              <Column style={statColumnStyle} align="center">
                <Text style={statNumberStyle}>{locationCount}</Text>
                <Text style={statLabelStyle}>Countries Represented</Text>
              </Column>
            </Row>
          </Section>

          {/* Call to action */}
          <Section style={ctaStyle}>
            <Row>
              <Column align="center">
                <Text style={ctaTextStyle}>
                  Ready to see your surprise?
                </Text>
                <Button style={buttonStyle} href={websiteUrl}>
                  View Your Birthday Surprise
                </Button>
              </Column>
            </Row>
          </Section>

          {/* Personal message */}
          <Section style={personalStyle}>
            <Row>
              <Column>
                <Text style={personalTextStyle}>
                  This surprise has been months in the making, filled with love, laughter, 
                  and memories from everyone who cares about you. Each message is a testament 
                  to the incredible person you are and the joy you bring to our lives.
                </Text>
                
                <Text style={personalTextStyle}>
                  Happy Birthday, beautiful! May this day be as wonderful as you are! 💕
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
                  With love from everyone who cares about you
                </Text>
                <Text style={footerSubTextStyle}>
                  Made with endless love and care for the most amazing person
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

const mainHeadingStyle = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: '700',
  margin: '0 0 16px 0',
  letterSpacing: '-0.5px',
  lineHeight: '1.2',
}

const nameHeadingStyle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '600',
  margin: '0 0 20px 0',
  letterSpacing: '-0.3px',
  lineHeight: '1.3',
}

const subHeadingStyle = {
  color: '#fce7f3',
  fontSize: '18px',
  margin: '0',
  fontWeight: '400',
  opacity: '0.95',
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

const contentStyle = {
  padding: '40px 40px 20px 40px',
}

const messageStyle = {
  color: '#374151',
  fontSize: '18px',
  lineHeight: '1.7',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
}

const statsStyle = {
  backgroundColor: '#fdf2f8',
  padding: '40px 30px',
  borderRadius: '16px',
  margin: '20px 40px',
  border: '1px solid #fce7f3',
}

const statColumnStyle = {
  padding: '0 15px',
  textAlign: 'center' as const,
}

const statNumberStyle = {
  color: '#ec4899',
  fontSize: '42px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  lineHeight: '1',
}

const statLabelStyle = {
  color: '#6b7280',
  fontSize: '15px',
  margin: '0',
  fontWeight: '500',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
}

const ctaStyle = {
  padding: '50px 40px',
  textAlign: 'center' as const,
}

const ctaTextStyle = {
  color: '#6b7280',
  fontSize: '18px',
  margin: '0 0 24px 0',
  fontWeight: '500',
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

const personalStyle = {
  backgroundColor: '#fef7ff',
  padding: '40px 30px',
  margin: '20px 40px',
  borderRadius: '16px',
  borderLeft: '4px solid #ec4899',
}

const personalTextStyle = {
  color: '#374151',
  fontSize: '17px',
  lineHeight: '1.7',
  margin: '0 0 20px 0',
  fontStyle: 'italic',
  textAlign: 'center' as const,
}

const dividerStyle = {
  borderColor: '#fce7f3',
  margin: '40px 0',
  borderWidth: '1px',
}

const footerStyle = {
  padding: '40px 40px 50px 40px',
  textAlign: 'center' as const,
  backgroundColor: '#fdf2f8',
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

export default BirthdayNotificationEmail
