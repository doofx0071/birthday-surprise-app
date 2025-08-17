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
  fontSize: '32px',
  fontWeight: '700',
  margin: '0 0 16px 0',
  letterSpacing: '-0.5px',
  lineHeight: '1.2',
}

const nameHeadingStyle = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '600',
  margin: '0',
  letterSpacing: '-0.3px',
  lineHeight: '1.3',
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
  color: '#ec4899',
  fontSize: '42px',
  fontWeight: '700',
  margin: '0 0 8px 0',
  lineHeight: '1',
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

export default ContributorNotificationEmail
