import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Admin client with service role key for storage operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

/**
 * POST /api/admin/setup/upload-logo - Upload logo to frontend storage bucket
 * This is a one-time setup operation to upload the logo from public assets to Supabase storage
 */
export async function POST() {
  try {
    console.log('🎨 Starting logo upload to frontend bucket...')

    // Read the logo file from public assets
    const logoPath = join(process.cwd(), 'public', 'assets', 'images', 'logo.png')
    
    let logoBuffer: Buffer
    try {
      logoBuffer = readFileSync(logoPath)
      console.log(`📁 Logo file read successfully: ${logoBuffer.length} bytes`)
    } catch (readError) {
      console.error('❌ Failed to read logo file:', readError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to read logo file from public assets',
          error: String(readError)
        },
        { status: 500 }
      )
    }

    // Upload logo to frontend bucket
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('frontend')
      .upload('logo.png', logoBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000', // 1 year cache
        upsert: true // Allow overwriting existing logo
      })

    if (uploadError) {
      console.error('❌ Failed to upload logo:', uploadError)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to upload logo to storage',
          error: uploadError.message
        },
        { status: 500 }
      )
    }

    // Get the public URL for verification
    const { data: urlData } = supabaseAdmin.storage
      .from('frontend')
      .getPublicUrl('logo.png')

    console.log('✅ Logo uploaded successfully!')
    console.log(`🔗 Public URL: ${urlData.publicUrl}`)

    return NextResponse.json({
      success: true,
      message: 'Logo uploaded successfully to frontend bucket',
      data: {
        path: uploadData.path,
        publicUrl: urlData.publicUrl,
        size: logoBuffer.length
      }
    })

  } catch (error) {
    console.error('❌ Logo upload failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Logo upload operation failed',
        error: String(error)
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/setup/upload-logo - Check if logo exists in frontend bucket
 */
export async function GET() {
  try {
    // Check if logo exists in frontend bucket
    const { data, error } = await supabaseAdmin.storage
      .from('frontend')
      .list('', { limit: 100 })

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to check frontend bucket',
          error: error.message
        },
        { status: 500 }
      )
    }

    const logoExists = data?.some(file => file.name === 'logo.png')
    
    if (logoExists) {
      const { data: urlData } = supabaseAdmin.storage
        .from('frontend')
        .getPublicUrl('logo.png')

      return NextResponse.json({
        success: true,
        logoExists: true,
        publicUrl: urlData.publicUrl,
        message: 'Logo already exists in frontend bucket'
      })
    } else {
      return NextResponse.json({
        success: true,
        logoExists: false,
        message: 'Logo not found in frontend bucket'
      })
    }

  } catch (error) {
    console.error('❌ Logo check failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Logo check operation failed',
        error: String(error)
      },
      { status: 500 }
    )
  }
}
