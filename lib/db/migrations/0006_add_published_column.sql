-- Add published column to beats table
ALTER TABLE beats ADD COLUMN published integer NOT NULL DEFAULT 0;

-- Create index for better performance when filtering published beats
CREATE INDEX IF NOT EXISTS idx_beats_published ON beats(published);

-- Update existing beats to be published by default (optional - you can remove this if you want existing beats to be drafts)
-- UPDATE beats SET published = 1 WHERE published = 0;
