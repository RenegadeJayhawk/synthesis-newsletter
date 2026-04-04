-- Create agent_runs table to track AI agent execution history
CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('cron', 'manual')),
  input JSONB,
  output JSONB,
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE SET NULL,
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Authenticated users can read agent_runs" 
  ON agent_runs FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert agent_runs" 
  ON agent_runs FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update agent_runs" 
  ON agent_runs FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Also allow service role to bypass RLS for API routes
-- (Service role automatically bypasses RLS, no policy needed)

-- Create index for common queries
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_agent_runs_created_at ON agent_runs(created_at DESC);
CREATE INDEX idx_agent_runs_newsletter_id ON agent_runs(newsletter_id);
