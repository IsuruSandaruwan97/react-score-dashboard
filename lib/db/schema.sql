-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('main', 'normal')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive')),
  require_password_change BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Judges table
CREATE TABLE IF NOT EXISTS judges (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialty VARCHAR(255),
  avatar VARCHAR(500),
  bio TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criteria table
CREATE TABLE IF NOT EXISTS criteria (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_points INTEGER NOT NULL,
  display_order INTEGER NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  ign VARCHAR(255) NOT NULL,
  discord_username VARCHAR(255),
  team VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scores table
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  player_id VARCHAR(50) NOT NULL,
  judge_id VARCHAR(50) NOT NULL,
  criterion_id VARCHAR(50) NOT NULL,
  round VARCHAR(50) NOT NULL,
  points INTEGER NOT NULL,
  entered_by VARCHAR(50) NOT NULL,
  entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (player_id) REFERENCES players(id),
  FOREIGN KEY (judge_id) REFERENCES judges(id),
  FOREIGN KEY (criterion_id) REFERENCES criteria(id),
  FOREIGN KEY (entered_by) REFERENCES admins(id),
  UNIQUE(player_id, judge_id, criterion_id, round)
);

-- Settings table (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Competition info table
CREATE TABLE IF NOT EXISTS competition_info (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  max_players INTEGER,
  status VARCHAR(50),
  theme VARCHAR(255),
  prize_pool VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rounds table
CREATE TABLE IF NOT EXISTS rounds (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(255),
  time_limit VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scores_player ON scores(player_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge ON scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_scores_round ON scores(round);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(status);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);


INSERT INTO competition_info (
  id,
  name,
  description,
  start_date,
  end_date,
  max_players,
  status,
  theme,
  prize_pool
) VALUES (
  1,
  'CWR Minecraft Building Competition 2025',
  'Epic building competition featuring 300+ talented builders',
  '2025-01-15',
  '2025-01-30',
  312,
  'ongoing',
  'Medieval Fantasy',
  '$5,000'
);

INSERT INTO admins (
  id,
  name,
  username,
  password,
  email,
  role,
  status,
  require_password_change,
  last_login,
  created_at
) VALUES (
  'admin-1',
  'John Smith',
  'mainuser',
  '$2a$10$8KqGXJ5eZxZYvYZ8KqGXJeZxZYvYZ8KqGXJeZxZYvYZ8KqGXJeZxZ',
  'john@cwresports.lk',
  'main',
  'active',
  FALSE,
  '2025-01-15 10:30:00',
  '2025-01-01 00:00:00'
);

INSERT INTO criteria (
  id,
  name,
  description,
  max_points,
  display_order,
  active
) VALUES
(
  'crit-1',
  'Creativity',
  'Originality and innovative design elements',
  20,
  1,
  TRUE
),
(
  'crit-2',
  'Theme',
  'Adherence to the competition theme',
  20,
  2,
  TRUE
),
(
  'crit-3',
  'Technical',
  'Building complexity and technical skill',
  20,
  3,
  TRUE
),
(
  'crit-4',
  'Detail',
  'Attention to detail and finishing touches',
  20,
  4,
  TRUE
),
(
  'crit-5',
  'Overall',
  'Overall impression and impact',
  20,
  5,
  TRUE
);

INSERT INTO settings (key, value)
VALUES
('resultsPublished', 'false'),
('finalsEnabled', 'false'),
('currentRound', 'qualification'),
('qualificationLocked', 'false'),
('santaSleigh', '{
  "enabled": true,
  "imageUrl": "/santa-sleigh.svg",
  "width": 150,
  "height": 100,
  "minDelay": 10000,
  "maxDelay": 30000,
  "animationDuration": 12000
}'),
('rounds', '[
  {
    "id": "qualification",
    "name": "Qualification Round",
    "status": "in-progress",
    "startDate": "2025-01-10T00:00:00Z",
    "endDate": "2025-01-20T23:59:59Z"
  },
  {
    "id": "finals",
    "name": "Finals Round",
    "status": "upcoming",
    "startDate": "2025-01-25T00:00:00Z",
    "endDate": "2025-01-30T23:59:59Z"
  }
]')
ON CONFLICT (key)
DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = CURRENT_TIMESTAMP;