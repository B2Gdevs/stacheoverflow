#!/usr/bin/env node

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔍 Testing Supabase file upload...\n');

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

try {
  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Create a test file
  const testContent = 'This is a test audio file content';
  const testBuffer = Buffer.from(testContent);
  const fileName = `test_${Date.now()}.mp3`;

  console.log(`📤 Uploading test file: ${fileName}`);

  const { data, error } = await supabase.storage
    .from('audio-files')
    .upload(fileName, testBuffer, {
      contentType: 'audio/mpeg',
      upsert: false
    });

  if (error) {
    console.log('❌ Upload failed:', error);
  } else {
    console.log('✅ Upload successful!');
    console.log('File path:', data.path);
    
    // Test download
    console.log('📥 Testing download...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('audio-files')
      .download(fileName);

    if (downloadError) {
      console.log('❌ Download failed:', downloadError);
    } else {
      console.log('✅ Download successful!');
      console.log('File size:', downloadData.size, 'bytes');
      
      // Clean up test file
      console.log('🧹 Cleaning up test file...');
      const { error: deleteError } = await supabase.storage
        .from('audio-files')
        .remove([fileName]);
      
      if (deleteError) {
        console.log('⚠️ Cleanup failed:', deleteError);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }
  }

} catch (error) {
  console.log('❌ Error:', error.message);
}
