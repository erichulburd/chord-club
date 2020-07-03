-- drop created_by indices on tag
DROP INDEX tag_created_by_idx;
DROP INDEX tag_created_by_display_name_idx;
DROP INDEX tag_created_by_munge_idx;

-- drop created_by indices on chart
DROP INDEX IF EXISTS chart_created_by_idx;
DROP INDEX IF EXISTS chart_created_by_created_at_idx;

