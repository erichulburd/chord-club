CREATE TABLE invitation_data (
  id SERIAL,
  resource_type VARCHAR(180) NOT NULL,
  resource_id INTEGER NOT NULL,
  action SMALLINT NOT NULL DEFAULT 1,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(180) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,

  PRIMARY KEY (id, deleted)
) PARTITION BY LIST(deleted);
CREATE TABLE invitation PARTITION OF invitation_data FOR VALUES IN (FALSE);
CREATE TABLE invitation_deleted PARTITION OF invitation_data FOR VALUES IN (TRUE);

CREATE TABLE policy_data (
  id SERIAL,
  resource_type VARCHAR(180) NOT NULL,
  resource_id INTEGER NOT NULL,
  uid VARCHAR(180) NOT NULL,
  invitation_id INTEGER,
  action SMALLINT NOT NULL DEFAULT 1,
  invite_id INTEGER,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(180) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted BOOLEAN NOT NULL DEFAULT FALSE,

  PRIMARY KEY (id, deleted)
) PARTITION BY LIST(deleted);
CREATE TABLE policy PARTITION OF policy_data FOR VALUES IN (FALSE);
CREATE TABLE policy_deleted PARTITION OF policy_data FOR VALUES IN (TRUE);