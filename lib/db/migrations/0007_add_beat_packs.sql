-- Create beat_packs table first
CREATE TABLE beat_packs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  genre VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  image_file TEXT,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  is_active INTEGER NOT NULL DEFAULT 1,
  published INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add beat pack support to beats table
ALTER TABLE beats ADD COLUMN is_pack integer NOT NULL DEFAULT 0;
ALTER TABLE beats ADD COLUMN pack_id integer REFERENCES beat_packs(id);

-- Add indexes for performance
CREATE INDEX idx_beats_pack_id ON beats(pack_id);
CREATE INDEX idx_beats_is_pack ON beats(is_pack);
CREATE INDEX idx_beat_packs_published ON beat_packs(published);
CREATE INDEX idx_beat_packs_uploaded_by ON beat_packs(uploaded_by);
