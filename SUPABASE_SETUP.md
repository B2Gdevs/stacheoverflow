# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for your StachO beats platform.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization and enter project details:
   - **Name**: `stacheoverflow` (or your preferred name)
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be ready (usually 2-3 minutes)

## 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (starts with `eyJ`)

## 3. Update Environment Variables

Update your `.env.local` file with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 4. Set Up Storage Buckets

Run the setup script to create the required storage buckets:

```bash
node scripts/setup-supabase-storage.js
```

This will create two buckets:
- `audio-files`: For MP3, WAV, and stems files (50MB limit)
- `cover-images`: For cover images (10MB limit)

## 5. Configure Storage Policies (Optional)

For additional security, you can set up Row Level Security (RLS) policies in Supabase:

1. Go to **Storage** → **Policies** in your Supabase dashboard
2. Create policies to control access to your buckets

Example policy for `audio-files` bucket:
```sql
-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated users to read audio files" ON storage.objects
FOR SELECT USING (auth.role() = 'authenticated' AND bucket_id = 'audio-files');

-- Allow admin users to upload files
CREATE POLICY "Allow admin users to upload audio files" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' 
  AND bucket_id = 'audio-files'
  AND (auth.jwt() ->> 'user_metadata' ->> 'role') = 'admin'
);
```

## 6. Test the Setup

1. Start your development server: `pnpm dev`
2. Log in as an admin user
3. Go to `/admin/upload`
4. Upload a beat with an MP3 file
5. Check the dashboard to see if the audio player works

## 7. Production Considerations

- **CDN**: Supabase Storage automatically provides CDN for faster file delivery
- **Backup**: Consider setting up automated backups for your storage buckets
- **Monitoring**: Monitor storage usage and costs in your Supabase dashboard
- **Security**: Review and update storage policies as needed

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure your `.env.local` file has all required Supabase variables
   - Restart your development server after updating environment variables

2. **"Failed to upload file to storage"**
   - Check if the storage buckets exist in your Supabase dashboard
   - Verify your service role key has the correct permissions

3. **"File not found" errors**
   - Ensure the file path format is correct (`bucket/filename`)
   - Check if the file exists in your Supabase Storage dashboard

4. **Audio player not working**
   - Verify the MP3 file was uploaded successfully
   - Check browser console for any CORS or authentication errors
   - Ensure the file path in the database matches the Supabase storage path

### Getting Help:

- Check the [Supabase Storage documentation](https://supabase.com/docs/guides/storage)
- Review the [Supabase JavaScript client docs](https://supabase.com/docs/reference/javascript)
- Join the [Supabase Discord community](https://discord.supabase.com/)
