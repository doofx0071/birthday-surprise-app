// Professional Contributor Notification Email Template - Based on Lee Munroe's responsive template
// Adapted for birthday surprise with pink/white theme
import React from 'react'
import {
  Html,
  Head,
  Body,
  Text,
  Button,
  Preview,
  Img,
} from '@react-email/components'
import { EMAIL_LOGO_URL, emailLogoStyles } from '@/lib/email-logo'
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
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>{`🎂 ${girlfriendName}'s Birthday is Today!`}</title>
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={bodyStyle}>
        <table role="presentation" border={0} cellPadding={0} cellSpacing={0} style={tableResetStyle}>
          <tr>
            <td>&nbsp;</td>
            <td style={containerStyle}>
              <div style={contentStyle}>

                {/* START MAIN CONTENT */}
                <table role="presentation" border={0} cellPadding={0} cellSpacing={0} style={mainStyle}>
                  <tr>
                    <td style={wrapperStyle}>

                      {/* Logo Section */}
                      <div style={emailLogoStyles.container}>
                        <Img
                          src={EMAIL_LOGO_URL}
                          alt="Birthday Surprise Logo"
                          width={80}
                          height={80}
                          style={emailLogoStyles.image}
                        />
                      </div>

                      {/* Header */}
                      <h1 style={headingStyle}>🎉 Today is the Big Day! 🎉</h1>

                      <Text style={greetingStyle}>Hi {contributorName}! 👋</Text>

                      <Text style={paragraphStyle}>
                        The moment we've all been waiting for has finally arrived!
                        <strong>{girlfriendName}'s birthday surprise is now live</strong>, and your beautiful
                        message is part of something truly magical.
                      </Text>

                      <Text style={paragraphStyle}>
                        Thanks to amazing people like you, we've created an incredible
                        birthday celebration that spans the globe. Your contribution has helped
                        make this day extra special for her!
                      </Text>

                      {/* Impact Statistics */}
                      <div style={statsPreviewStyle}>
                        <Text style={statsLabelStyle}>🌟 Look What We Created Together! 🌟</Text>
                        <Text style={statsTextStyle}>
                          🎂 <strong>{messageCount}</strong> heartfelt birthday messages collected
                        </Text>
                        <Text style={statsTextStyle}>
                          🌍 <strong>{locationCount}</strong> countries represented in this celebration
                        </Text>
                      </div>

                      {/* Call to Action Button */}
                      <table role="presentation" border={0} cellPadding={0} cellSpacing={0} style={buttonTableStyle}>
                        <tbody>
                          <tr>
                            <td align="center">
                              <table role="presentation" border={0} cellPadding={0} cellSpacing={0}>
                                <tbody>
                                  <tr>
                                    <td>
                                      <Button href={websiteUrl} style={buttonStyle}>
                                        🎂 See the Birthday Surprise Live! 🎂
                                      </Button>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <Text style={paragraphStyle}>
                        Your message is now part of {girlfriendName}'s special day! Click the button above
                        to see the complete birthday surprise and witness the joy you helped create.
                      </Text>

                      <Text style={paragraphStyle}>
                        Thank you for being such an important part of this celebration.
                        Your thoughtfulness and love have made this birthday truly unforgettable! 💕
                      </Text>

                    </td>
                  </tr>
                </table>
                {/* END MAIN CONTENT */}

              </div>
            </td>
            <td>&nbsp;</td>
          </tr>
        </table>
      </Body>
    </Html>
  )
}

// Professional email styles based on Lee Munroe template with pink/white theme
const bodyStyle = {
  fontFamily: 'Helvetica, sans-serif',
  WebkitFontSmoothing: 'antialiased',
  fontSize: '16px',
  lineHeight: '1.3',
  msTextSizeAdjust: '100%',
  WebkitTextSizeAdjust: '100%',
  backgroundColor: '#fdf2f8',
  margin: 0,
  padding: 0,
}

const tableResetStyle = {
  borderCollapse: 'separate' as const,
  msoTableLspace: '0pt',
  msoTableRspace: '0pt',
  width: '100%',
}

const containerStyle = {
  margin: '0 auto !important',
  maxWidth: '600px',
  padding: 0,
  paddingTop: '24px',
  width: '600px',
}

const contentStyle = {
  boxSizing: 'border-box' as const,
  display: 'block',
  margin: '0 auto',
  maxWidth: '600px',
  padding: 0,
}

const mainStyle = {
  background: '#ffffff',
  border: '1px solid #fce7f3',
  borderRadius: '16px',
  width: '100%',
}

const wrapperStyle = {
  boxSizing: 'border-box' as const,
  padding: '32px',
}

const headingStyle = {
  fontFamily: 'Helvetica, sans-serif',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
  color: '#ec4899',
  textAlign: 'center' as const,
}

const greetingStyle = {
  fontFamily: 'Helvetica, sans-serif',
  fontSize: '16px',
  fontWeight: 'normal',
  margin: '0 0 16px 0',
  color: '#374151',
}

const paragraphStyle = {
  fontFamily: 'Helvetica, sans-serif',
  fontSize: '16px',
  fontWeight: 'normal',
  margin: '0 0 16px 0',
  color: '#374151',
  lineHeight: '1.5',
}

const statsPreviewStyle = {
  backgroundColor: '#fdf2f8',
  border: '1px solid #fce7f3',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const statsLabelStyle = {
  fontFamily: 'Helvetica, sans-serif',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 12px 0',
  color: '#ec4899',
}

const statsTextStyle = {
  fontFamily: 'Helvetica, sans-serif',
  fontSize: '16px',
  fontWeight: 'normal',
  margin: '0 0 8px 0',
  color: '#374151',
  lineHeight: '1.5',
}

const buttonTableStyle = {
  boxSizing: 'border-box' as const,
  minWidth: '100% !important',
  width: '100%',
  marginBottom: '16px',
}

const buttonStyle = {
  backgroundColor: '#ec4899',
  border: 'solid 2px #ec4899',
  borderRadius: '8px',
  boxSizing: 'border-box' as const,
  color: '#ffffff',
  cursor: 'pointer',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: 0,
  padding: '16px 32px',
  textDecoration: 'none',
  textTransform: 'capitalize' as const,
}

