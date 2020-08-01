-- Soft drop scope on tag
ALTER TABLE tag DROP CONSTRAINT IF EXISTS tag_munge_unique;
ALTER TABLE tag DROP CONSTRAINT IF EXISTS tag_display_name_unique;

DROP INDEX IF EXISTS tag_scope_idx;
DROP INDEX IF EXISTS tag_scope_display_name_idx;

ALTER TABLE tag RENAME COLUMN scope TO _scope;
ALTER TABLE tag ALTER _scope DROP NOT NULL;

-- Soft drop scope on chart
DROP INDEX IF EXISTS chart_scope_idx;
DROP INDEX IF EXISTS chart_scope_created_at_idx;

ALTER TABLE chart RENAME COLUMN scope TO _scope;
ALTER TABLE chart ALTER _scope DROP NOT NULL;
