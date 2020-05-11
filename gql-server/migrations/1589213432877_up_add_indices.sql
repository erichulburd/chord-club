CREATE INDEX tag_scope_idx ON tag(scope);
CREATE INDEX tag_scope_display_name_idx ON tag(scope, display_name);

CREATE INDEX chart_scope_idx ON chart(scope);
CREATE INDEX chart_scope_created_at_idx ON chart(scope, created_at);

CREATE INDEX chart_tag_chart_id_idx ON chart_tag(chart_id);
CREATE INDEX chart_tag_tag_id_idx ON chart_tag(tag_id);

CREATE INDEX chart_extension_chart_id_idx ON chart_extension(chart_id);

CREATE INDEX reaction_chart_id_idx ON reaction(chart_id);
CREATE INDEX reaction_chart_id_reaction_type_idx ON reaction(chart_id, reaction_type);
