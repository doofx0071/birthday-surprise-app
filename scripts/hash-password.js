const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

async function hashPassword() {
  const currentPassword = 'CMDPremiums000_!'
  const saltRounds = 12
  
  try {
    const hashedPassword = await bcrypt.hash(currentPassword, saltRounds)
    console.log('Current password:', currentPassword)
    console.log('Hashed password:', hashedPassword)
    
    // Read .env.local file
    const envPath = path.join(process.cwd(), '.env.local')
    let envContent = fs.readFileSync(envPath, 'utf-8')
    
    // Replace the password line
    envContent = envContent.replace(
      /ADMIN_PASSWORD=.*/,
      `ADMIN_PASSWORD=${hashedPassword}`
    )
    
    // Write back to file
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Password hashed and updated in .env.local')
    
  } catch (error) {
    console.error('Error hashing password:', error)
  }
}

hashPassword()
