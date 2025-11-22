import { NextRequest, NextResponse } from 'next/server';
import { getAllTags, searchTags, createTag } from '@/lib/db/tag-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    let tags: string[];
    
    if (query) {
      tags = await searchTags(query);
    } else {
      tags = await getAllTags();
    }
    
    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { tag } = await request.json();
    
    if (!tag || typeof tag !== 'string') {
      return NextResponse.json(
        { error: 'Tag is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Validate tag name
    if (tag.length > 50) {
      return NextResponse.json(
        { error: 'Tag name must be 50 characters or less' },
        { status: 400 }
      );
    }
    
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(tag)) {
      return NextResponse.json(
        { error: 'Tag name can only contain letters, numbers, spaces, hyphens, and underscores' },
        { status: 400 }
      );
    }
    
    // Create the tag in the database
    const newTag = await createTag(tag);
    
    console.log('✅ Tag created successfully:', newTag);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tag created successfully',
      tag: newTag.name,
      id: newTag.id
    });
  } catch (error: any) {
    console.error('Error creating tag:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Tag already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
}
