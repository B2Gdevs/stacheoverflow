-- Migration: Add multiple audio file columns to beats table
-- Created: 2024-01-20

-- Add new audio file columns
ALTER TABLE "beats" ADD COLUMN "audio_file_mp3" text;
ALTER TABLE "beats" ADD COLUMN "audio_file_wav" text;
ALTER TABLE "beats" ADD COLUMN "audio_file_stems" text;

-- Drop the old audio_file column
ALTER TABLE "beats" DROP COLUMN "audio_file";
