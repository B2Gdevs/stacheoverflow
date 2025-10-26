'use server';

import { z } from 'zod';
import { eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { users, beats, type NewBeat } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { validatedActionWithUser } from '@/lib/auth/middleware';
import { ActivityType } from '@/lib/db/schema';

// Schema for promoting/demoting users
const updateUserRoleSchema = z.object({
  userId: z.number(),
  role: z.enum(['admin', 'member'])
});

export const updateUserRole = validatedActionWithUser(
  updateUserRoleSchema,
  async (data, _, currentUser) => {
    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      return { error: 'Unauthorized. Admin access required.' };
    }

    const { userId, role } = data;

    // Don't allow demoting the last admin
    if (role === 'member') {
      const adminCount = await db
        .select()
        .from(users)
        .where(eq(users.role, 'admin'));
      
      if (adminCount.length <= 1) {
        return { error: 'Cannot demote the last admin user.' };
      }
    }

    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId));

    return { 
      success: `User role updated to ${role} successfully.`,
      activityType: role === 'admin' ? ActivityType.PROMOTE_USER : ActivityType.DEMOTE_USER
    };
  }
);

// Schema for uploading beats
const uploadBeatSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  artist: z.string().min(1, 'Artist is required').max(255),
  genre: z.string().min(1, 'Genre is required').max(50),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.string().optional(),
  bpm: z.number().optional(),
  key: z.string().optional(),
  description: z.string().optional(),
  audioFile: z.string().optional(),
  imageFile: z.string().optional()
});

export const uploadBeat = validatedActionWithUser(
  uploadBeatSchema,
  async (data, _, currentUser) => {
    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      return { error: 'Unauthorized. Admin access required.' };
    }

    const newBeat: NewBeat = {
      ...data,
      price: data.price * 100, // Convert to cents
      uploadedBy: currentUser.id,
      isActive: 1
    };

    const [createdBeat] = await db
      .insert(beats)
      .values(newBeat)
      .returning();

    return { 
      success: 'Beat uploaded successfully.',
      beatId: createdBeat.id,
      activityType: ActivityType.UPLOAD_BEAT
    };
  }
);

// Schema for updating beats
const updateBeatSchema = z.object({
  beatId: z.number(),
  title: z.string().min(1, 'Title is required').max(255).optional(),
  artist: z.string().min(1, 'Artist is required').max(255).optional(),
  genre: z.string().min(1, 'Genre is required').max(50).optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  duration: z.string().optional(),
  bpm: z.number().optional(),
  key: z.string().optional(),
  description: z.string().optional(),
  isActive: z.number().optional()
});

export const updateBeat = validatedActionWithUser(
  updateBeatSchema,
  async (data, _, currentUser) => {
    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      return { error: 'Unauthorized. Admin access required.' };
    }

    const { beatId, ...updateData } = data;

    // Convert price to cents if provided
    if (updateData.price !== undefined) {
      updateData.price = updateData.price * 100;
    }

    await db
      .update(beats)
      .set(updateData)
      .where(eq(beats.id, beatId));

    return { 
      success: 'Beat updated successfully.',
      activityType: ActivityType.UPDATE_BEAT
    };
  }
);

// Schema for deleting beats
const deleteBeatSchema = z.object({
  beatId: z.number()
});

export const deleteBeat = validatedActionWithUser(
  deleteBeatSchema,
  async (data, _, currentUser) => {
    // Check if current user is admin
    if (currentUser.role !== 'admin') {
      return { error: 'Unauthorized. Admin access required.' };
    }

    const { beatId } = data;

    await db
      .delete(beats)
      .where(eq(beats.id, beatId));

    return { 
      success: 'Beat deleted successfully.',
      activityType: ActivityType.DELETE_BEAT
    };
  }
);

// Get all users (admin only)
export async function getAllUsers() {
  const currentUser = await getUser();
  
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Unauthorized. Admin access required.' };
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    })
    .from(users)
    .where(isNull(users.deletedAt));

  return { users: allUsers };
}

// Get all beats (admin only)
export async function getAllBeats() {
  const currentUser = await getUser();
  
  if (!currentUser || currentUser.role !== 'admin') {
    return { error: 'Unauthorized. Admin access required.' };
  }

  const allBeats = await db
    .select()
    .from(beats);

  return { beats: allBeats };
}
