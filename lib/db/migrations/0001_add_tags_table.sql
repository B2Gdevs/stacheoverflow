-- Create tags table for metadata
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_category ON tags(category);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS beat_tags (
  beat_id INTEGER REFERENCES beats(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (beat_id, tag_id)
);

-- Create indexes for junction table
CREATE INDEX IF NOT EXISTS idx_beat_tags_beat_id ON beat_tags(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_tags_tag_id ON beat_tags(tag_id);

