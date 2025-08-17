// Contributor notification email template
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
import type { ContributorNotificationProps } from '@/types/email'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app'

export function ContributorNotificationEmail({
  recipientName = 'Friend',
  contributorName = 'Friend',
  girlfriendName = 'Gracela Elmera C. Betarmos',
  messageCount = 0,
  contributorCount = 0,
  locationCount = 0,
  websiteUrl = baseUrl,
  previewText = `Today is ${girlfriendName}'s birthday! See all the love you helped create...`,
}: ContributorNotificationProps) {
  return (
    <Html>
      <Head>
        <title>🎂 {girlfriendName}'s Birthday is Today!</title>
        <meta name="description" content={previewText} />
      </Head>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Row>
              <Column align="center">
                <Heading style={mainHeadingStyle}>
                  Today is the Big Day!
                </Heading>
                <Heading style={nameHeadingStyle}>
                  {girlfriendName}'s Birthday
                </Heading>
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
                  The moment we've all been waiting for has finally arrived! 
                  {girlfriendName}'s birthday surprise is now live, and your beautiful 
                  message is part of something truly magical.
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Impact section */}
          <Section style={impactStyle}>
            <Row>
              <Column>
                <Heading style={sectionHeadingStyle}>
                  🌟 Look What We Created Together! 🌟
                </Heading>
                <Text style={messageStyle}>
                  Thanks to amazing people like you, we've created an incredible 
                  birthday celebration that spans the globe:
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Statistics */}
          <Section style={statsStyle}>
            <Row>
              <Column style={statColumnStyle} align="center">
                <Text style={statNumberStyle}>{messageCount}</Text>
                <Text style={statLabelStyle}>Heartfelt Messages</Text>
              </Column>
              <Column style={statColumnStyle} align="center">
                <Text style={statNumberStyle}>{contributorCount}</Text>
                <Text style={statLabelStyle}>Amazing Contributors</Text>
              </Column>
              <Column style={statColumnStyle} align="center">
                <Text style={statNumberStyle}>{locationCount}</Text>
                <Text style={statLabelStyle}>Countries Worldwide</Text>
              </Column>
            </Row>
          </Section>

          {/* Thank you message */}
          <Section style={thankYouStyle}>
            <Row>
              <Column>
                <Text style={thankYouTextStyle}>
                  Your contribution helped make this birthday absolutely unforgettable! 
                  Every message, every memory, and every moment of love you shared 
                  is now part of a beautiful celebration that {girlfriendName} will 
                  treasure forever.
                </Text>
              </Column>
            </Row>
          </Section>

          {/* Call to action */}
          <Section style={ctaStyle}>
            <Row>
              <Column align="center">
                <Text style={ctaTextStyle}>
                  Want to see the amazing surprise you helped create?
                </Text>
                <Button style={buttonStyle} href={websiteUrl}>
                  🎁 View the Birthday Surprise 🎁
                </Button>
              </Column>
            </Row>
          </Section>

          {/* Memory map callout */}
          <Section style={featureStyle}>
            <Row>
              <Column>
                <Heading style={featureHeadingStyle}>
                  🗺️ Explore the Memory Map
                </Heading>
                <Text style={messageStyle}>
                  Check out the interactive memory map to see messages from around 
                  the world, including yours! It's incredible to see how love travels 
                  across continents to celebrate someone special.
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
                  Thank you for being part of this special celebration! ❤️
                </Text>
                <Text style={footerSubTextStyle}>
                  Your kindness and love made this birthday surprise possible
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
  backgroundColor: '#f0f9ff',
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
  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
  padding: '40px 20px',
  textAlign: 'center' as const,
}

const mainHeadingStyle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
}

const nameHeadingStyle = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
}

const bannerStyle = {
  backgroundColor: '#dbeafe',
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

const impactStyle = {
  padding: '20px',
}

const sectionHeadingStyle = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
  textAlign: 'center' as const,
}

const statsStyle = {
  backgroundColor: '#f8fafc',
  padding: '30px 20px',
  borderRadius: '8px',
  margin: '0 20px',
}

const statColumnStyle = {
  padding: '0 10px',
}

const statNumberStyle = {
  color: '#3b82f6',
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

const thankYouStyle = {
  backgroundColor: '#fef7ff',
  padding: '30px 20px',
  margin: '20px',
  borderRadius: '8px',
  borderLeft: '4px solid #8b5cf6',
}

const thankYouTextStyle = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
  fontStyle: 'italic',
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
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: 'bold',
  padding: '16px 32px',
  textDecoration: 'none',
  display: 'inline-block',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
}

const featureStyle = {
  backgroundColor: '#f0fdf4',
  padding: '30px 20px',
  margin: '0 20px',
  borderRadius: '8px',
  borderLeft: '4px solid #10b981',
}

const featureHeadingStyle = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 15px 0',
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
  color: '#3b82f6',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const footerSubTextStyle = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0 0 15px 0',
}

const linkStyle = {
  color: '#3b82f6',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
}

export default ContributorNotificationEmail
