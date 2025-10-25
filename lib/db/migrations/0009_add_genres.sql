-- Create genres table
CREATE TABLE IF NOT EXISTS genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default genres
INSERT INTO genres (name, description) VALUES 
  ('Hip Hop', 'Hip hop and rap beats'),
  ('Trap', 'Trap music and modern hip hop'),
  ('R&B', 'Rhythm and blues'),
  ('Pop', 'Pop music'),
  ('Electronic', 'Electronic and EDM'),
  ('Rock', 'Rock music'),
  ('Jazz', 'Jazz and fusion'),
  ('Classical', 'Classical music'),
  ('Ambient', 'Ambient and atmospheric'),
  ('Folk', 'Folk and acoustic')
ON CONFLICT (name) DO NOTHING;

-- Add genre_id foreign key to beats table
ALTER TABLE beats ADD COLUMN genre_id INTEGER REFERENCES genres(id);

-- Update existing beats to use the first genre (Hip Hop) as default
UPDATE beats SET genre_id = 1 WHERE genre_id IS NULL;

-- Make genre_id NOT NULL after setting defaults
ALTER TABLE beats ALTER COLUMN genre_id SET NOT NULL;

-- Add genre_id to beat_packs table
ALTER TABLE beat_packs ADD COLUMN genre_id INTEGER REFERENCES genres(id);

-- Update existing beat packs to use the first genre (Hip Hop) as default
UPDATE beat_packs SET genre_id = 1 WHERE genre_id IS NULL;

-- Make genre_id NOT NULL for beat_packs
ALTER TABLE beat_packs ALTER COLUMN genre_id SET NOT NULL;
