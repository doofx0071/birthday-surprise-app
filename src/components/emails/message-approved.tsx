// Message Approved Email Template - Based on Lee Munroe's responsive template
// Sent when admin approves a pending message (celebratory thank you content)
import React from 'react'
import {
  Html,
  Head,
  Body,
  Text,
  Preview,
  Img,
} from '@react-email/components'
import { EMAIL_LOGO_URL, emailLogoStyles } from '@/lib/email-logo'

interface MessageApprovedProps {
  contributorName: string
  contributorEmail: string
  messagePreview: string
  girlfriendName: string
  websiteUrl: string
  approvedAt?: string
}

export function MessageApproved({
  contributorName = 'Friend',
  messagePreview = 'Thank you for your heartfelt birthday message!',
  girlfriendName = 'Gracela Elmera C. Betarmos',
  websiteUrl = 'https://birthday-surprise-app.vercel.app',
}: MessageApprovedProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Thank You - Message Approved</title>
      </Head>
      <Preview>Thank you! Your birthday message has been approved and will be part of something magical ✨</Preview>
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
                      <h1 style={headingStyle}>Thank You! 💕</h1>

                      <Text style={greetingStyle}>Hi {contributorName},</Text>

                      <Text style={paragraphStyle}>
                        Your heartfelt birthday message for <strong>{girlfriendName}</strong> has been approved!
                        Thank you for being part of this special surprise celebration.
                      </Text>

                      {/* Message Preview */}
                      <div style={messagePreviewStyle}>
                        <Text style={previewLabelStyle}>Your Message:</Text>
                        <Text style={previewTextStyle}>"{messagePreview}"</Text>
                      </div>



                      {/* What Happens Next */}
                      <Text style={sectionHeadingStyle}>What happens next?</Text>

                      <Text style={paragraphStyle}>
                        🎂 Your message will be beautifully displayed on the birthday
                      </Text>

                      <Text style={paragraphStyle}>
                        📧 You'll receive updates about the surprise celebration
                      </Text>

                      <Text style={paragraphStyle}>
                        💝 Your contribution will be preserved in the memory gallery
                      </Text>

                      <Text style={paragraphStyle}>
                        Thank you for making this birthday extra special with your love and kindness!
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

const messagePreviewStyle = {
  backgroundColor: '#fdf2f8',
  border: '1px solid #fce7f3',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const previewLabelStyle = {
  fontFamily: 'Helvetica, sans-serif',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
  color: '#ec4899',
}

const previewTextStyle = {
  fontFamily: 'Helvetica, sans-serif',
  fontSize: '16px',
  fontWeight: 'normal',
  margin: 0,
  color: '#374151',
  fontStyle: 'italic',
  lineHeight: '1.5',
}





const sectionHeadingStyle = {
  fontFamily: 'Helvetica, sans-serif',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '24px 0 16px 0',
  color: '#ec4899',
}




