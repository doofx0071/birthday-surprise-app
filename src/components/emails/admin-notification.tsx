// Professional Admin Notification Email Template - Based on Lee Munroe's responsive template
// Adapted for birthday surprise admin notifications with pink/white theme
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

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://birthday-surprise-app.vercel.app'

interface AdminNotificationProps {
  senderName: string
  senderEmail: string
  messagePreview: string
  submissionTime: string
  adminDashboardUrl?: string
  girlfriendName?: string
  previewText?: string
}

export function AdminNotificationEmail({
  senderName,
  senderEmail,
  messagePreview,
  submissionTime,
  adminDashboardUrl = `${baseUrl}/admin/messages`,
  girlfriendName = 'Gracela Elmera C. Betarmos',
  previewText = `New birthday message from ${senderName}`,
}: AdminNotificationProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>New Birthday Message Submitted</title>
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
                      <h1 style={headingStyle}>📬 New Message Submitted</h1>

                      <Text style={greetingStyle}>Hi Admin! 👋</Text>

                      <Text style={paragraphStyle}>
                        A new birthday message has been submitted for <strong>{girlfriendName}</strong>{' '}
                        and is waiting for your review.
                      </Text>

                      {/* Message Details Card */}
                      <div style={messageCardStyle}>
                        <h3 style={cardHeaderStyle}>Message Details</h3>
                        
                        <div style={detailRowStyle}>
                          <strong style={labelStyle}>From:</strong>
                          <span style={valueStyle}>{senderName}</span>
                        </div>
                        
                        <div style={detailRowStyle}>
                          <strong style={labelStyle}>Email:</strong>
                          <span style={valueStyle}>{senderEmail}</span>
                        </div>
                        
                        <div style={detailRowStyle}>
                          <strong style={labelStyle}>Submitted:</strong>
                          <span style={valueStyle}>{submissionTime}</span>
                        </div>
                        
                        <div style={messagePreviewStyle}>
                          <strong style={labelStyle}>Message Preview:</strong>
                          <div style={previewContentStyle}>
                            "{messagePreview}..."
                          </div>
                        </div>
                      </div>

                      {/* Call to Action */}
                      <div style={ctaContainerStyle}>
                        <Button
                          href={adminDashboardUrl}
                          style={buttonStyle}
                        >
                          Review Message
                        </Button>
                      </div>

                      <Text style={paragraphStyle}>
                        Click the button above to review and approve/reject this message in the admin dashboard.
                      </Text>

                      {/* Footer */}
                      <Text style={footerStyle}>
                        This is an automated notification from the Birthday Surprise system.
                        <br />
                        Please review new messages promptly to ensure they appear in time for the celebration.
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

// Styles based on Lee Munroe's responsive email template
const bodyStyle = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  WebkitFontSmoothing: 'antialiased',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0',
  padding: '0',
  msTextSizeAdjust: '100%',
  WebkitTextSizeAdjust: '100%',
}

const tableResetStyle = {
  borderCollapse: 'separate' as const,
  msoTableLspace: '0pt',
  msoTableRspace: '0pt',
  width: '100%',
}

const containerStyle = {
  display: 'block',
  margin: '0 auto !important',
  maxWidth: '580px',
  padding: '10px',
  width: '580px',
}

const contentStyle = {
  boxSizing: 'border-box' as const,
  display: 'block',
  margin: '0 auto',
  maxWidth: '580px',
  padding: '10px',
}

const mainStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '3px',
  width: '100%',
}

const wrapperStyle = {
  boxSizing: 'border-box' as const,
  padding: '20px',
}



const headingStyle = {
  color: '#333333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '24px',
  fontWeight: '400',
  lineHeight: '1.4',
  margin: '0',
  marginBottom: '30px',
  textAlign: 'center' as const,
}

const greetingStyle = {
  color: '#333333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0',
  marginBottom: '15px',
}

const paragraphStyle = {
  color: '#333333',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '16px',
  fontWeight: '400',
  lineHeight: '1.4',
  margin: '0',
  marginBottom: '15px',
}

const messageCardStyle = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
}

const cardHeaderStyle = {
  color: '#ec4899',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.4',
  margin: '0',
  marginBottom: '15px',
}

const detailRowStyle = {
  marginBottom: '10px',
  display: 'flex',
  alignItems: 'flex-start',
}

const labelStyle = {
  color: '#666666',
  fontSize: '14px',
  fontWeight: '600',
  minWidth: '80px',
  marginRight: '10px',
}

const valueStyle = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: '400',
}

const messagePreviewStyle = {
  marginTop: '15px',
  paddingTop: '15px',
  borderTop: '1px solid #e9ecef',
}

const previewContentStyle = {
  backgroundColor: '#ffffff',
  border: '1px solid #e9ecef',
  borderRadius: '4px',
  padding: '12px',
  marginTop: '8px',
  fontStyle: 'italic',
  color: '#555555',
  fontSize: '14px',
  lineHeight: '1.5',
}

const ctaContainerStyle = {
  textAlign: 'center' as const,
  margin: '30px 0',
}

const buttonStyle = {
  backgroundColor: '#ec4899',
  borderRadius: '4px',
  color: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  lineHeight: '1.4',
  margin: '0',
  textDecoration: 'none',
  textTransform: 'capitalize' as const,
  padding: '12px 24px',
  display: 'inline-block',
  border: 'none',
}

const footerStyle = {
  color: '#999999',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  fontSize: '12px',
  fontWeight: '400',
  lineHeight: '1.4',
  margin: '0',
  marginTop: '30px',
  textAlign: 'center' as const,
}

export default AdminNotificationEmail
