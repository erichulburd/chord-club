CREATE INDEX policy_uid_resource_type_expires_at_idx ON policy(uid, resource_type, expires_at);

CREATE OR REPLACE FUNCTION chart_policies_for_uid(uid TEXT)
  RETURNS TABLE (chart_id INTEGER, policy_action SMALLINT) AS
$func$

  SELECT c.id AS chart_id, p.action AS policy_action
    FROM chart c
      INNER JOIN chart_tag ct ON ct.chart_id = c.id
      INNER JOIN policy p ON p.resource_id = ct.tag_id
  WHERE p.uid = $1 AND
    p.resource_type = 'TAG' AND
    (p.expires_at IS NULL OR p.expires_at >= NOW())

$func$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION tag_policies_for_uid(uid TEXT)
  RETURNS TABLE (tag_id INTEGER, policy_action SMALLINT) AS
$func$

  SELECT p.resource_id AS tag_id, p.action AS policy_action
    FROM policy p
    WHERE p.uid = $1 AND
      p.resource_type = 'TAG' AND
      (p.expires_at IS NULL OR p.expires_at >= NOW())

$func$ LANGUAGE sql;

