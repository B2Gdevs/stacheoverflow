-- Create social_connections table for OAuth providers (Spotify, Google, etc.)
CREATE TABLE IF NOT EXISTS social_connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  platform_user_id VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scope TEXT,
  profile_data TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(platform);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform_user_id ON social_connections(platform_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_social_connections_user_platform ON social_connections(user_id, platform);

