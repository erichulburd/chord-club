-- re-add scope to tag
UPDATE tag SET _scope=created_by WHERE _scope IS NULL;
ALTER TABLE tag RENAME COLUMN _scope to scope;
ALTER TABLE tag ALTER scope SET NOT NULL;

ALTER TABLE tag ADD CONSTRAINT tag_display_name_unique UNIQUE(display_name, scope);
CREATE INDEX tag_scope_idx ON tag(scope);

-- re-add scope to chart
UPDATE chart SET _scope=created_by WHERE _scope IS NULL;
ALTER TABLE chart RENAME COLUMN _scope to scope;
ALTER TABLE chart ALTER scope SET NOT NULL;

UPDATE chart SET scope=created_by;
CREATE INDEX chart_scope_idx ON chart(scope);
CREATE INDEX chart_scope_created_at_idx ON chart(scope, created_at);
