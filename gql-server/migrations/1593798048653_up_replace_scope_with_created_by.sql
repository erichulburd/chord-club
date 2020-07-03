-- replace tag indices with created_by
CREATE INDEX tag_created_by_idx ON tag(created_by);
CREATE UNIQUE INDEX tag_created_by_munge_idx ON tag(created_by, munge);
CREATE UNIQUE INDEX tag_created_by_display_name_idx ON tag(created_by, display_name);

-- replace chart indices with created_by
CREATE INDEX chart_created_by_idx ON chart(created_by);
CREATE INDEX chart_created_by_created_at_idx ON chart(created_by, created_at);
