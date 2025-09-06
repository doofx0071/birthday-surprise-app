/**
 * Email Logo Configuration
 * Provides logo URLs and utilities for email templates
 */

// Supabase storage URL for the email logo (stored in dedicated frontend bucket)
export const EMAIL_LOGO_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/frontend/logo.png`;

// Fallback logo as a simple SVG data URI (small and email-friendly)
export const FALLBACK_LOGO_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
  <rect width="120" height="40" fill="#ec4899" rx="8"/>
  <text x="60" y="25" font-family="Arial, sans-serif" font-size="14" font-weight="bold"
        text-anchor="middle" fill="white">🎂 Birthday</text>
</svg>
`).toString('base64')}`;

// Logo component for email templates with fallback
export const getEmailLogoProps = () => ({
  src: EMAIL_LOGO_URL,
  alt: "Birthday Surprise Logo",
  width: 80,
  height: 80,
  style: {
    display: 'block',
    margin: '0 auto',
    maxWidth: '80px',
    height: 'auto',
    border: 'none',
  }
});

// Email logo component with fallback text
export const EmailLogo = () => `
  <img src="${EMAIL_LOGO_URL}"
       alt="Birthday Surprise Logo"
       width="120"
       height="40"
       style="display: block; margin: 0 auto; max-width: 120px; height: auto; border: none;"
       onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
  <div style="display: none; font-size: 18px; font-weight: bold; color: #ec4899; text-align: center; padding: 10px; background-color: #fce7f3; border-radius: 8px; border: 2px solid #ec4899; font-family: Arial, sans-serif;">
    🎂 Birthday Surprise
  </div>
`;

// Inline CSS for email logo (for better compatibility)
export const emailLogoStyles = {
  container: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #fce7f3',
  },
  image: {
    display: 'block',
    margin: '0 auto',
    maxWidth: '80px',
    height: 'auto',
    border: 'none',
  },
  fallback: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ec4899',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    textAlign: 'center' as const,
    padding: '10px',
    backgroundColor: '#fce7f3',
    borderRadius: '8px',
    border: '2px solid #ec4899',
  }
};