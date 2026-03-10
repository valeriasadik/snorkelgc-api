-- SnorkelGC D1 Schema

CREATE TABLE IF NOT EXISTS spots (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  rating REAL NOT NULL,
  reviews INTEGER NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  badge TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  entry_point TEXT NOT NULL,
  best_time TEXT NOT NULL,
  exposed_to INTEGER,  -- grados de la dirección de viento adversa
  marine_life_description TEXT
);

CREATE TABLE IF NOT EXISTS species (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  scientific_name TEXT NOT NULL,
  common_name TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'uncommon', 'rare'))
);

CREATE TABLE IF NOT EXISTS facilities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  spot_id TEXT NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  available INTEGER NOT NULL DEFAULT 1  -- 0 o 1 (D1 no tiene BOOLEAN nativo)
);

CREATE INDEX IF NOT EXISTS idx_species_spot ON species(spot_id);
CREATE INDEX IF NOT EXISTS idx_facilities_spot ON facilities(spot_id);
