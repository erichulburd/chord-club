DROP INDEX IF EXISTS tag_scope_idx;
DROP INDEX IF EXISTS tag_scope_display_name_idx;

DROP INDEX IF EXISTS chart_scope_idx;
DROP INDEX IF EXISTS chart_scope_created_at_idx;

DROP INDEX IF EXISTS chart_tag_chart_id_idx;
DROP INDEX IF EXISTS chart_tag_tag_id_idx;

DROP INDEX IF EXISTS chart_extension_chart_id_idx;

DROP INDEX IF EXISTS reaction_chart_id_idx;
DROP INDEX IF EXISTS reaction_chart_id_reaction_type_idx;
