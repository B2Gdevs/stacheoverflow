import { db } from './drizzle';
import { tags, beatTags, beats } from './schema';
import { eq, ilike, desc, sql, and } from 'drizzle-orm';

/**
 * Get all tags from the tags table
 */
export async function getAllTags(): Promise<string[]> {
  try {
    console.log('🔍 getAllTags - Starting query');
    
    const result = await db
      .select({ name: tags.name })
      .from(tags)
      .orderBy(desc(tags.usageCount), tags.name);
    
    console.log('🔍 getAllTags result:', result);
    console.log('🔍 getAllTags result type:', typeof result);
    console.log('🔍 getAllTags result isArray:', Array.isArray(result));
    
    const tagNames = result.map(row => row.name).filter(Boolean);
    console.log('🔍 getAllTags tagNames:', tagNames);
    
    return tagNames;
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

/**
 * Search for tags that match a query
 */
export async function searchTags(query: string): Promise<string[]> {
  if (!query.trim()) return getAllTags();
  
  try {
    console.log('🔍 searchTags - Starting query with:', query);
    
    const result = await db
      .select({ name: tags.name })
      .from(tags)
      .where(ilike(tags.name, `%${query}%`))
      .orderBy(desc(tags.usageCount), tags.name);
    
    console.log('🔍 searchTags result:', result);
    console.log('🔍 searchTags query:', query);
    console.log('🔍 searchTags rows:', result);
    
    const tagNames = result.map(row => row.name).filter(Boolean);
    console.log('🔍 searchTags tagNames:', tagNames);
    
    return tagNames;
  } catch (error) {
    console.error('Error searching tags:', error);
    return [];
  }
}

/**
 * Create a new tag in the database
 */
export async function createTag(tagName: string): Promise<{ id: number; name: string }> {
  try {
    console.log('🔍 createTag - Creating tag:', tagName);
    
    const result = await db
      .insert(tags)
      .values({
        name: tagName,
        usageCount: 0,
      })
      .returning({ id: tags.id, name: tags.name });
    
    console.log('🔍 createTag result:', result);
    
    return result[0];
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
}

/**
 * Increment the usage count for a tag
 */
export async function incrementTagUsage(tagName: string): Promise<void> {
  try {
    console.log('🔍 incrementTagUsage - Incrementing usage for:', tagName);
    
    await db
      .update(tags)
      .set({ 
        usageCount: sql`${tags.usageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(tags.name, tagName));
    
    console.log('🔍 incrementTagUsage - Success');
  } catch (error) {
    console.error('Error incrementing tag usage:', error);
    throw error;
  }
}

/**
 * Get or create a tag (returns existing tag if found, creates new one if not)
 */
export async function getOrCreateTag(tagName: string): Promise<{ id: number; name: string }> {
  try {
    // Try to find existing tag
    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.name, tagName))
      .limit(1);
    
    if (existing.length > 0) {
      return { id: existing[0].id, name: existing[0].name };
    }
    
    // Create new tag if not found
    return await createTag(tagName);
  } catch (error) {
    console.error('Error getting or creating tag:', error);
    throw error;
  }
}

/**
 * Sync tags from beats array to tags table and junction table
 */
export async function syncTagsForBeat(beatId: number, tagNames: string[]): Promise<void> {
  try {
    console.log('🔍 syncTagsForBeat - Syncing tags for beat:', beatId, 'tags:', tagNames);
    
    // First, remove all existing tags for this beat from junction table
    await db
      .delete(beatTags)
      .where(eq(beatTags.beatId, beatId));
    
    // Then, get or create each tag and link it to the beat
    for (const tagName of tagNames) {
      if (!tagName || !tagName.trim()) continue;
      
      const tag = await getOrCreateTag(tagName.trim());
      
      // Link tag to beat in junction table (check if it exists first to avoid duplicate key error)
      const existingLink = await db
        .select()
        .from(beatTags)
        .where(
          and(
            eq(beatTags.beatId, beatId),
            eq(beatTags.tagId, tag.id)
          )
        )
        .limit(1);
      
      if (existingLink.length === 0) {
        await db
          .insert(beatTags)
          .values({
            beatId: beatId,
            tagId: tag.id,
          });
      }
      
      // Increment usage count
      await incrementTagUsage(tagName.trim());
    }
    
    console.log('🔍 syncTagsForBeat - Success');
  } catch (error) {
    console.error('Error syncing tags for beat:', error);
    throw error;
  }
}

