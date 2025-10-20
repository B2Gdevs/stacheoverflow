-- Add event IDs for better tracing
ALTER TABLE api_logs ADD COLUMN event_id varchar(36);
ALTER TABLE stripe_logs ADD COLUMN event_id varchar(36);

-- Create indexes for better performance
CREATE INDEX idx_api_logs_event_id ON api_logs(event_id);
CREATE INDEX idx_stripe_logs_event_id ON stripe_logs(event_id);
CREATE INDEX idx_api_logs_timestamp ON api_logs(timestamp DESC);
CREATE INDEX idx_stripe_logs_timestamp ON stripe_logs(timestamp DESC);
