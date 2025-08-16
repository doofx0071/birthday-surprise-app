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
        <title>🎂 Happy Birthday {girlfriendName}!</title>
        <meta name="description" content={previewText} />
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header with birthday celebration */}
          <Section style={headerStyle}>
            <Row>
              <Column align="center">
                <Heading style={mainHeadingStyle}>
                  🎉 HAPPY BIRTHDAY 🎉
                </Heading>
                <Heading style={nameHeadingStyle}>
                  {girlfriendName}!
                </Heading>
                <Text style={subHeadingStyle}>
                  The day has finally arrived!
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Celebration banner */}
          <Section style={bannerStyle}>
            <Row>
              <Column align="center">
                <Text style={bannerTextStyle}>
                  🎂 ✨ 🎈 💖 🎁 ✨ 🎂
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Main message */}
          <Section style={contentStyle}>
            <Row>
              <Column>
                <Text style={messageStyle}>
                  Your family and friends have been secretly preparing something very special for you...
                </Text>
                
                <Text style={messageStyle}>
                  We've collected heartfelt messages, beautiful memories, and love from around the world, 
                  all waiting to make your birthday absolutely magical! ✨
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
                <Button style={buttonStyle} href={websiteUrl}>
                  🎁 View Your Birthday Surprise 🎁
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
                  ❤️ From everyone who loves you ❤️
                </Text>
                <Text style={footerSubTextStyle}>
                  Made with endless love and care for the most amazing person
                </Text>
                <Link href={websiteUrl} style={linkStyle}>
                  Visit Birthday Surprise
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
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  margin: 0,
  padding: 0,
}

const containerStyle = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
}

const headerStyle = {
  background: 'linear-gradient(135deg, #ec4899 0%, #f97316 50%, #eab308 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
}

const mainHeadingStyle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
}

const nameHeadingStyle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
}

const subHeadingStyle = {
  color: '#ffffff',
  fontSize: '18px',
  margin: '0',
  fontWeight: '500',
}

const bannerStyle = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  textAlign: 'center' as const,
}

const bannerTextStyle = {
  fontSize: '24px',
  margin: '0',
  letterSpacing: '2px',
}

const contentStyle = {
  padding: '30px 20px',
}

const messageStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 20px 0',
}

const statsStyle = {
  backgroundColor: '#f9fafb',
  padding: '30px 20px',
  borderRadius: '8px',
  margin: '0 20px',
}

const statColumnStyle = {
  padding: '0 10px',
}

const statNumberStyle = {
  color: '#ec4899',
  fontSize: '36px',
  fontWeight: 'bold',
  margin: '0 0 5px 0',
}

const statLabelStyle = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  fontWeight: '500',
}

const ctaStyle = {
  padding: '40px 20px',
  textAlign: 'center' as const,
}

const buttonStyle = {
  backgroundColor: '#ec4899',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
}

const personalStyle = {
  backgroundColor: '#fef7ff',
  padding: '30px 20px',
  margin: '0 20px',
  borderRadius: '8px',
  borderLeft: '4px solid #ec4899',
}

const personalTextStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 15px 0',
  fontStyle: 'italic',
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
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const footerSubTextStyle = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 15px 0',
}

const linkStyle = {
  color: '#ec4899',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
}

export default BirthdayNotificationEmail
