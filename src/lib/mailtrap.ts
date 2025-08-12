import nodemailer from 'nodemailer'
import type { EmailTemplateData } from '@/types'

// Mailtrap SMTP configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST || 'live.smtp.mailtrap.io',
    port: parseInt(process.env.MAILTRAP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAILTRAP_USERNAME,
      pass: process.env.MAILTRAP_PASSWORD,
    },
  })
}

// Email templates
const createBirthdayReminderTemplate = (data: EmailTemplateData) => {
  return {
    subject: `🎂 ${data.girlfriendName}'s Birthday is Coming Soon!`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Birthday Reminder</title>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              line-height: 1.6; 
              color: #2d2d2d; 
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background: linear-gradient(135deg, #ffffff 0%, #ffb6c1 100%);
            }
            .header { 
              text-align: center; 
              padding: 40px 20px; 
              background: white;
              border-radius: 20px;
              margin-bottom: 30px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            .title { 
              font-size: 32px; 
              font-weight: bold; 
              color: #2d2d2d; 
              margin: 0;
              font-family: 'Playfair Display', serif;
            }
            .emoji { 
              font-size: 48px; 
              margin: 20px 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border-radius: 15px; 
              margin-bottom: 20px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #ffb6c1, #e8b4b8); 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 25px; 
              font-weight: bold;
              margin: 20px 0;
              box-shadow: 0 5px 15px rgba(255, 182, 193, 0.4);
            }
            .stats { 
              background: #f8f9fa; 
              padding: 20px; 
              border-radius: 10px; 
              margin: 20px 0;
              text-align: center;
            }
            .footer { 
              text-align: center; 
              color: #666; 
              font-size: 14px; 
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">🎂</div>
              <h1 class="title">Birthday Surprise</h1>
              <p>Something magical is happening...</p>
            </div>
            
            <div class="content">
              <h2>Hi ${data.recipientName}! 👋</h2>
              <p><strong>${data.girlfriendName}'s birthday</strong> is coming up soon, and we're creating something special!</p>
              
              <div class="stats">
                <p><strong>${data.messageCount}</strong> heartfelt messages collected</p>
                <p><strong>${data.contributorCount}</strong> friends and family participating</p>
              </div>
              
              <p>Join us in making this birthday unforgettable by adding your own message, photos, or memories.</p>
              
              <div style="text-align: center;">
                <a href="${data.websiteUrl}" class="button">
                  Add Your Birthday Message ✨
                </a>
              </div>
              
              <p>Every message makes this surprise more special. Thank you for being part of this celebration! 💕</p>
            </div>
            
            <div class="footer">
              <p>This is an automated birthday reminder.</p>
              <p><a href="${data.unsubscribeUrl}" style="color: #666;">Unsubscribe</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      🎂 ${data.girlfriendName}'s Birthday is Coming Soon!
      
      Hi ${data.recipientName}!
      
      ${data.girlfriendName}'s birthday is coming up soon, and we're creating something special!
      
      So far we have:
      - ${data.messageCount} heartfelt messages collected
      - ${data.contributorCount} friends and family participating
      
      Join us in making this birthday unforgettable by adding your own message, photos, or memories.
      
      Visit: ${data.websiteUrl}
      
      Every message makes this surprise more special. Thank you for being part of this celebration!
      
      ---
      This is an automated birthday reminder.
      Unsubscribe: ${data.unsubscribeUrl}
    `
  }
}

const createThankYouTemplate = (data: EmailTemplateData) => {
  return {
    subject: `Thank you for making ${data.girlfriendName}'s birthday special! 💕`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Thank You</title>
          <style>
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              line-height: 1.6; 
              color: #2d2d2d; 
              background-color: #ffffff;
              margin: 0;
              padding: 0;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background: linear-gradient(135deg, #ffffff 0%, #ffb6c1 100%);
            }
            .header { 
              text-align: center; 
              padding: 40px 20px; 
              background: white;
              border-radius: 20px;
              margin-bottom: 30px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            }
            .content { 
              background: white; 
              padding: 30px; 
              border-radius: 15px; 
              box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            }
            .emoji { font-size: 48px; margin: 20px 0; }
            .title { 
              font-size: 32px; 
              font-weight: bold; 
              color: #2d2d2d; 
              margin: 0;
              font-family: 'Playfair Display', serif;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="emoji">💕</div>
              <h1 class="title">Thank You!</h1>
            </div>
            
            <div class="content">
              <h2>Dear ${data.recipientName},</h2>
              <p>Thank you so much for contributing to ${data.girlfriendName}'s birthday surprise!</p>
              <p>Your message has been added to the collection, and it will help make this birthday truly unforgettable.</p>
              <p>The surprise will be revealed on the special day. Thank you for being part of this magical moment! ✨</p>
              <p>With love and gratitude,<br>The Birthday Surprise Team</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Thank You!
      
      Dear ${data.recipientName},
      
      Thank you so much for contributing to ${data.girlfriendName}'s birthday surprise!
      
      Your message has been added to the collection, and it will help make this birthday truly unforgettable.
      
      The surprise will be revealed on the special day. Thank you for being part of this magical moment!
      
      With love and gratitude,
      The Birthday Surprise Team
    `
  }
}

// Main email sending functions
export const sendBirthdayReminder = async (
  to: string,
  templateData: EmailTemplateData
) => {
  const transporter = createTransporter()
  const template = createBirthdayReminderTemplate(templateData)
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
    
    console.log('Birthday reminder sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send birthday reminder:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export const sendThankYouEmail = async (
  to: string,
  templateData: EmailTemplateData
) => {
  const transporter = createTransporter()
  const template = createThankYouTemplate(templateData)
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
    
    console.log('Thank you email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Failed to send thank you email:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Test email connection
export const testMailtrapConnection = async () => {
  const transporter = createTransporter()
  
  try {
    await transporter.verify()
    console.log('Mailtrap connection successful')
    return { success: true }
  } catch (error) {
    console.error('Mailtrap connection failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
