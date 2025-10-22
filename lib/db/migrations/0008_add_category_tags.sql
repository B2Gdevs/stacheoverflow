-- Add category and tags to beats table
ALTER TABLE beats ADD COLUMN category varchar(50) NOT NULL DEFAULT 'artist';
ALTER TABLE beats ADD COLUMN tags text[]; -- Array of tag strings

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_beats_category ON beats(category);

-- Create index for tag searching (PostgreSQL array operations)
CREATE INDEX IF NOT EXISTS idx_beats_tags ON beats USING GIN(tags);
