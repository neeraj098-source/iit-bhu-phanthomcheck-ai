CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  total_scans INT DEFAULT 0,
  scams_blocked INT DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_device_id TEXT REFERENCES users(device_id) ON DELETE SET NULL,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('fakepay','voicescam','linkguard')),
  input_filename TEXT,
  input_url TEXT,
  input_size_bytes INT,
  verdict TEXT NOT NULL CHECK (verdict IN ('FAKE','SAFE','SUSPICIOUS','ERROR')),
  fraud_score NUMERIC(5,2),
  confidence_level TEXT CHECK (confidence_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  evidence JSONB DEFAULT '[]',
  ai_explanation TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processing_time_ms INT
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scan_id UUID REFERENCES scans(id),
  user_device_id TEXT,
  report_type TEXT,
  description TEXT,
  status TEXT DEFAULT 'submitted',
  reference_number TEXT UNIQUE DEFAULT 'PC-' || TO_CHAR(NOW(),'YYYY-MM-DD') || '-' || FLOOR(RANDOM()*9000+1000)::TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE link_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url_hash TEXT UNIQUE NOT NULL,
  url TEXT NOT NULL,
  verdict TEXT NOT NULL,
  fraud_score NUMERIC(5,2),
  evidence JSONB DEFAULT '[]',
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stat_date DATE UNIQUE DEFAULT CURRENT_DATE,
  total_scans INT DEFAULT 0,
  fake_detected INT DEFAULT 0,
  safe_verified INT DEFAULT 0,
  money_protected NUMERIC(14,2) DEFAULT 0.00,
  fakepay_scans INT DEFAULT 0,
  voicescam_scans INT DEFAULT 0,
  linkguard_scans INT DEFAULT 0
);

CREATE INDEX idx_scans_device ON scans(user_device_id);
CREATE INDEX idx_scans_type ON scans(scan_type);
CREATE INDEX idx_scans_created ON scans(created_at DESC);
CREATE INDEX idx_link_cache_hash ON link_cache(url_hash);

-- ENABLE RLS on all tables.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "allow all" FOR ALL ON all tables USING (true).
CREATE POLICY "allow all" ON users FOR ALL USING (true);
CREATE POLICY "allow all" ON scans FOR ALL USING (true);
CREATE POLICY "allow all" ON reports FOR ALL USING (true);
CREATE POLICY "allow all" ON link_cache FOR ALL USING (true);
CREATE POLICY "allow all" ON daily_stats FOR ALL USING (true);

-- CREATE TRIGGER after insert on scans
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_stats (stat_date, total_scans, fake_detected, safe_verified, money_protected, fakepay_scans, voicescam_scans, linkguard_scans)
  VALUES (
    CURRENT_DATE,
    1,
    CASE WHEN NEW.verdict = 'FAKE' THEN 1 ELSE 0 END,
    CASE WHEN NEW.verdict = 'SAFE' THEN 1 ELSE 0 END,
    CASE WHEN NEW.verdict = 'FAKE' THEN 2500.00 ELSE 0.00 END,
    CASE WHEN NEW.scan_type = 'fakepay' THEN 1 ELSE 0 END,
    CASE WHEN NEW.scan_type = 'voicescam' THEN 1 ELSE 0 END,
    CASE WHEN NEW.scan_type = 'linkguard' THEN 1 ELSE 0 END
  )
  ON CONFLICT (stat_date) DO UPDATE SET
    total_scans = daily_stats.total_scans + 1,
    fake_detected = daily_stats.fake_detected + CASE WHEN NEW.verdict = 'FAKE' THEN 1 ELSE 0 END,
    safe_verified = daily_stats.safe_verified + CASE WHEN NEW.verdict = 'SAFE' THEN 1 ELSE 0 END,
    money_protected = daily_stats.money_protected + CASE WHEN NEW.verdict = 'FAKE' THEN 2500.00 ELSE 0.00 END,
    fakepay_scans = daily_stats.fakepay_scans + CASE WHEN NEW.scan_type = 'fakepay' THEN 1 ELSE 0 END,
    voicescam_scans = daily_stats.voicescam_scans + CASE WHEN NEW.scan_type = 'voicescam' THEN 1 ELSE 0 END,
    linkguard_scans = daily_stats.linkguard_scans + CASE WHEN NEW.scan_type = 'linkguard' THEN 1 ELSE 0 END;
    
  UPDATE users SET 
    total_scans = total_scans + 1,
    scams_blocked = scams_blocked + CASE WHEN NEW.verdict = 'FAKE' THEN 1 ELSE 0 END,
    last_active = NOW()
  WHERE device_id = NEW.user_device_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_scan_insert
AFTER INSERT ON scans
FOR EACH ROW
EXECUTE FUNCTION update_daily_stats();

-- SEED daily_stats:
INSERT INTO daily_stats (stat_date, total_scans, fake_detected, safe_verified, money_protected, fakepay_scans, voicescam_scans, linkguard_scans)
VALUES (CURRENT_DATE, 2347, 891, 1456, 8432000.00, 1500, 347, 500)
ON CONFLICT DO NOTHING;
