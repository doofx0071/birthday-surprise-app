// Professional Birthday Notification Email Template - Based on Lee Munroe's responsive template
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
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>{`Happy Birthday ${girlfriendName}!`}</title>
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
                      <h1 style={headingStyle}>Happy Birthday! 🎂</h1>

                      <Text style={greetingStyle}>Dear {girlfriendName},</Text>

                      <Text style={paragraphStyle}>
                        Your special day has finally arrived! Your family and friends have been secretly
                        preparing something very special for you.
                      </Text>

                      <Text style={paragraphStyle}>
                        We've collected heartfelt messages, beautiful memories, and love from around the world,
                        all waiting to make your birthday absolutely magical.
                      </Text>

                      {/* Statistics Preview */}
                      <div style={statsPreviewStyle}>
                        <Text style={statsLabelStyle}>What's waiting for you:</Text>
                        <Text style={statsTextStyle}>
                          🎂 <strong>{messageCount}</strong> birthday messages from people who love you
                        </Text>
                        <Text style={statsTextStyle}>
                          💕 <strong>{contributorCount}</strong> friends and family members participated
                        </Text>
                        <Text style={statsTextStyle}>
                          🌍 <strong>{locationCount}</strong> countries represented in your celebration
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
                                        🎉 See Your Birthday Surprise 🎉
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
                        This is your moment to shine! Click the button above to see all the love,
                        memories, and birthday wishes that have been collected just for you.
                      </Text>

                      <Text style={paragraphStyle}>
                        Happy Birthday, {girlfriendName}! May your day be filled with joy, laughter,
                        and all the love you deserve. 🎂💕
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




