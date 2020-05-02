CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE userr (
  uid VARCHAR(180) NOT NULL PRIMARY KEY,
  username citext NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT userr_unique UNIQUE(uid),
  CONSTRAINT userr_username_unique UNIQUE(username)
);

CREATE TABLE tag (
  id SERIAL PRIMARY KEY,
  munge VARCHAR(180) NOT NULL,
  display_name citext NOT NULL,
  tag_type VARCHAR(180) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(180) NOT NULL,
  scope VARCHAR(180) NOT NULL,
  password VARCHAR(180),

  CONSTRAINT tag_munge_unique UNIQUE(munge, scope),
  CONSTRAINT tag_display_name_unique UNIQUE(display_name, scope)
);

CREATE TABLE extension (
  id SERIAL PRIMARY KEY,
  extension_type VARCHAR(10),
  degree SMALLINT NOT NULL,

  CONSTRAINT extension_type_degree_unique UNIQUE(extension_type, degree)
);

CREATE TYPE chart_type AS ENUM ('CHORD', 'PROGRESSION');

CREATE TABLE chart (
  id SERIAL PRIMARY KEY,
  audio_url TEXT NOT NULL,
  image_url TEXT,
  audio_length INTEGER NOT NULL,
  name VARCHAR(180),
  hint TEXT,
  description TEXT,
  abc TEXT,
  chart_type chart_type NOT NULL,
  bass_note VARCHAR(180),
  root VARCHAR(180),
  quality VARCHAR(180),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by VARCHAR(180) NOT NULL,
  scope VARCHAR(180) NOT NULL
);

CREATE TABLE chart_tag (
  id SERIAL PRIMARY KEY,
  chart_id INTEGER NOT NULL REFERENCES chart(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tag(id) ON DELETE CASCADE,

  CONSTRAINT chart_tag_unique UNIQUE(chart_id, tag_id)
);

CREATE TABLE chart_extension (
  id SERIAL PRIMARY KEY,
  chart_id INTEGER NOT NULL REFERENCES chart(id) ON DELETE CASCADE,
  extension_id INTEGER NOT NULL REFERENCES extension(id) ON DELETE CASCADE,

  CONSTRAINT chart_extension_unique UNIQUE(chart_id, extension_id)
);

CREATE TYPE reaction_type AS ENUM ('STAR', 'FLAG');

CREATE TABLE reaction (
  id SERIAL PRIMARY KEY,
  chart_id INTEGER REFERENCES chart(id) ON DELETE CASCADE NOT NULL,
  reaction_type reaction_type NOT NULL,
  created_by VARCHAR(180) REFERENCES userr(uid) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT reaction_unique UNIQUE(created_by, chart_id)
);
