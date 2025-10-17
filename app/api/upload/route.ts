import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { uploadFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const user = await getUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${safeFileName}`;
    
    // Upload file (Supabase or local fallback)
    const result = await uploadFile(buffer, fileName, file.type);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to upload file' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      fileName: result.fileName,
      originalName: file.name,
      publicUrl: result.publicUrl
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
