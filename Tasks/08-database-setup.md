# Task 08: Supabase Database Setup

## 📋 Task Information
- **ID**: 08
- **Title**: Supabase Database Setup
- **Priority**: High
- **Status**: pending
- **Dependencies**: [06]
- **Estimated Time**: 8 hours

## 📝 Description
Set up Supabase database with proper schema, tables, relationships, and security policies for storing birthday messages, user information, and media files with real-time capabilities.

## 🔍 Details

### Database Schema Design
1. **Messages Table**
   ```sql
   CREATE TABLE messages (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(255) NOT NULL,
     message TEXT NOT NULL CHECK (length(message) >= 10 AND length(message) <= 500),
     location_city VARCHAR(100),
     location_country VARCHAR(100),
     latitude DECIMAL(10, 8),
     longitude DECIMAL(11, 8),
     wants_reminders BOOLEAN DEFAULT false,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     is_approved BOOLEAN DEFAULT true,
     is_visible BOOLEAN DEFAULT true
   );
   ```

2. **Media Files Table**
   ```sql
   CREATE TABLE media_files (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
     file_name VARCHAR(255) NOT NULL,
     file_type VARCHAR(50) NOT NULL,
     file_size INTEGER NOT NULL,
     storage_path VARCHAR(500) NOT NULL,
     thumbnail_path VARCHAR(500),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

3. **Email Notifications Table**
   ```sql
   CREATE TABLE email_notifications (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     email VARCHAR(255) NOT NULL,
     notification_type VARCHAR(50) NOT NULL,
     scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
     sent_at TIMESTAMP WITH TIME ZONE,
     status VARCHAR(20) DEFAULT 'pending',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### Row Level Security (RLS)
1. **Messages Table Policies**
   ```sql
   -- Enable RLS
   ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
   
   -- Allow public to insert messages
   CREATE POLICY "Allow public message insertion" ON messages
     FOR INSERT TO anon WITH CHECK (true);
   
   -- Allow public to read approved and visible messages
   CREATE POLICY "Allow public to read approved messages" ON messages
     FOR SELECT TO anon USING (is_approved = true AND is_visible = true);
   
   -- Allow authenticated users to manage all messages
   CREATE POLICY "Allow authenticated users full access" ON messages
     FOR ALL TO authenticated USING (true);
   ```

2. **Media Files Policies**
   ```sql
   ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Allow public media insertion" ON media_files
     FOR INSERT TO anon WITH CHECK (true);
   
   CREATE POLICY "Allow public media reading" ON media_files
     FOR SELECT TO anon USING (
       EXISTS (
         SELECT 1 FROM messages 
         WHERE messages.id = media_files.message_id 
         AND messages.is_approved = true 
         AND messages.is_visible = true
       )
     );
   ```

### Storage Configuration
1. **Bucket Setup**
   ```sql
   -- Create storage bucket for media files
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('birthday-media', 'birthday-media', true);
   ```

2. **Storage Policies**
   ```sql
   -- Allow public uploads
   CREATE POLICY "Allow public uploads" ON storage.objects
     FOR INSERT TO anon WITH CHECK (bucket_id = 'birthday-media');
   
   -- Allow public downloads
   CREATE POLICY "Allow public downloads" ON storage.objects
     FOR SELECT TO anon USING (bucket_id = 'birthday-media');
   ```

### Database Functions
1. **Update Timestamp Function**
   ```sql
   CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
     NEW.updated_at = NOW();
     RETURN NEW;
   END;
   $$ language 'plpgsql';
   
   CREATE TRIGGER update_messages_updated_at 
     BEFORE UPDATE ON messages 
     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
   ```

2. **Message Statistics Function**
   ```sql
   CREATE OR REPLACE FUNCTION get_message_stats()
   RETURNS JSON AS $$
   BEGIN
     RETURN json_build_object(
       'total_messages', (SELECT COUNT(*) FROM messages WHERE is_approved = true),
       'total_countries', (SELECT COUNT(DISTINCT location_country) FROM messages WHERE location_country IS NOT NULL),
       'total_media', (SELECT COUNT(*) FROM media_files),
       'latest_message', (SELECT created_at FROM messages WHERE is_approved = true ORDER BY created_at DESC LIMIT 1)
     );
   END;
   $$ LANGUAGE plpgsql;
   ```

### Real-time Subscriptions
1. **Enable Real-time**
   ```sql
   -- Enable real-time for messages table
   ALTER PUBLICATION supabase_realtime ADD TABLE messages;
   ALTER PUBLICATION supabase_realtime ADD TABLE media_files;
   ```

2. **Real-time Policies**
   ```sql
   -- Allow real-time subscriptions for approved messages
   CREATE POLICY "Allow real-time for approved messages" ON messages
     FOR SELECT TO anon USING (is_approved = true AND is_visible = true);
   ```

### Environment Configuration
1. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_BIRTHDAY_DATE=2024-12-25T00:00:00Z
   NEXT_PUBLIC_GIRLFRIEND_NAME=YourGirlfriendName
   ```

2. **Supabase Client Setup**
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   
   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

## 🧪 Test Strategy

### Database Schema Testing
- [ ] All tables created correctly
- [ ] Relationships working properly
- [ ] Constraints enforced
- [ ] Indexes optimized

### Security Testing
- [ ] RLS policies working
- [ ] Unauthorized access blocked
- [ ] Data privacy maintained
- [ ] Storage security verified

### Performance Testing
- [ ] Query performance optimized
- [ ] Real-time subscriptions working
- [ ] Storage upload/download fast
- [ ] Database functions efficient

### Integration Testing
- [ ] Next.js client connection
- [ ] CRUD operations working
- [ ] File upload integration
- [ ] Real-time updates functional

## 🔧 MCP Tools Required

### Context7
- Supabase database design patterns
- PostgreSQL best practices
- Row Level Security implementation
- Real-time subscriptions setup
- Storage bucket configuration

### Supabase MCP
- Database schema creation
- Table operations
- Policy management
- Storage configuration
- Function deployment

### Sequential Thinking
- Database architecture decisions
- Security policy design
- Performance optimization strategies

## ✅ Acceptance Criteria

### Database Schema
- [ ] All tables created with proper structure
- [ ] Relationships and constraints working
- [ ] Indexes created for performance
- [ ] Data types optimized

### Security Implementation
- [ ] RLS enabled on all tables
- [ ] Proper access policies configured
- [ ] Storage security implemented
- [ ] Data privacy ensured

### Functionality
- [ ] CRUD operations working
- [ ] Real-time subscriptions active
- [ ] File storage functional
- [ ] Database functions operational

### Integration
- [ ] Next.js client connected
- [ ] Environment variables configured
- [ ] TypeScript types generated
- [ ] Error handling implemented

### Performance
- [ ] Query performance optimized
- [ ] Real-time updates smooth
- [ ] Storage operations fast
- [ ] Database monitoring setup

## 🔗 GitHub Integration
- **Issue**: Create issue for database setup
- **Branch**: `feature/task-08-database-setup`
- **PR**: Create PR with database configuration

## 📁 Files to Create/Modify
- `supabase/migrations/001_initial_schema.sql`
- `supabase/migrations/002_rls_policies.sql`
- `supabase/migrations/003_storage_setup.sql`
- `src/lib/supabase.ts`
- `src/lib/database.ts`
- `src/types/database.ts`
- `.env.local.example` (update)

## 🎯 Success Metrics
- Database operations complete in < 100ms
- 100% data security compliance
- Real-time updates working smoothly
- Zero data loss or corruption
- Scalable for 1000+ messages

---

**Next Task**: 09-memory-map.md  
**Previous Task**: 07-file-upload.md  
**Estimated Total Time**: 8 hours  
**Complexity**: High
