--
-- PostgreSQL database dump
--

-- Dumped from database version 11.1
-- Dumped by pg_dump version 11.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner:
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner:
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: chart_type; Type: TYPE; Schema: public; Owner: developer
--

CREATE TYPE public.chart_type AS ENUM (
    'CHORD',
    'PROGRESSION'
);


ALTER TYPE public.chart_type OWNER TO developer;

--
-- Name: reaction_type; Type: TYPE; Schema: public; Owner: developer
--

CREATE TYPE public.reaction_type AS ENUM (
    'STAR',
    'FLAG'
);


ALTER TYPE public.reaction_type OWNER TO developer;

--
-- Name: chart_policies_for_uid(text); Type: FUNCTION; Schema: public; Owner: developer
--

CREATE FUNCTION public.chart_policies_for_uid(uid text) RETURNS TABLE(chart_id integer, policy_action smallint)
    LANGUAGE sql
    AS $_$

  SELECT c.id AS chart_id, p.action AS policy_action
    FROM chart c
      INNER JOIN chart_tag ct ON ct.chart_id = c.id
      INNER JOIN policy p ON p.resource_id = ct.tag_id
  WHERE p.uid = $1 AND
    p.resource_type = 'TAG' AND
    (p.expires_at IS NULL OR p.expires_at >= NOW())

$_$;


ALTER FUNCTION public.chart_policies_for_uid(uid text) OWNER TO developer;

--
-- Name: tag_policies_for_uid(text); Type: FUNCTION; Schema: public; Owner: developer
--

CREATE FUNCTION public.tag_policies_for_uid(uid text) RETURNS TABLE(tag_id integer, policy_action smallint)
    LANGUAGE sql
    AS $_$

  SELECT p.resource_id AS tag_id, p.action AS policy_action
    FROM policy p
    WHERE p.uid = $1 AND
      p.resource_type = 'TAG' AND
      (p.expires_at IS NULL OR p.expires_at >= NOW())

$_$;


ALTER FUNCTION public.tag_policies_for_uid(uid text) OWNER TO developer;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: __migrations__; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.__migrations__ (
    id bigint NOT NULL
);


ALTER TABLE public.__migrations__ OWNER TO developer;

--
-- Name: chart; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.chart (
    id integer NOT NULL,
    audio_url text NOT NULL,
    image_url text,
    audio_length integer NOT NULL,
    name character varying(180),
    hint text,
    description text,
    abc text,
    chart_type public.chart_type NOT NULL,
    bass_note character varying(180),
    root character varying(180),
    quality character varying(180),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    created_by character varying(180) NOT NULL,
    _scope character varying(180)
);


ALTER TABLE public.chart OWNER TO developer;

--
-- Name: chart_extension; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.chart_extension (
    id integer NOT NULL,
    chart_id integer NOT NULL,
    extension_id integer NOT NULL
);


ALTER TABLE public.chart_extension OWNER TO developer;

--
-- Name: chart_extension_id_seq; Type: SEQUENCE; Schema: public; Owner: developer
--

CREATE SEQUENCE public.chart_extension_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chart_extension_id_seq OWNER TO developer;

--
-- Name: chart_extension_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: developer
--

ALTER SEQUENCE public.chart_extension_id_seq OWNED BY public.chart_extension.id;


--
-- Name: chart_id_seq; Type: SEQUENCE; Schema: public; Owner: developer
--

CREATE SEQUENCE public.chart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chart_id_seq OWNER TO developer;

--
-- Name: chart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: developer
--

ALTER SEQUENCE public.chart_id_seq OWNED BY public.chart.id;


--
-- Name: chart_tag; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.chart_tag (
    id integer NOT NULL,
    chart_id integer NOT NULL,
    tag_id integer NOT NULL,
    tag_position integer NOT NULL
);


ALTER TABLE public.chart_tag OWNER TO developer;

--
-- Name: chart_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: developer
--

CREATE SEQUENCE public.chart_tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.chart_tag_id_seq OWNER TO developer;

--
-- Name: chart_tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: developer
--

ALTER SEQUENCE public.chart_tag_id_seq OWNED BY public.chart_tag.id;


--
-- Name: extension; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.extension (
    id integer NOT NULL,
    extension_type character varying(10),
    degree smallint NOT NULL
);


ALTER TABLE public.extension OWNER TO developer;

--
-- Name: extension_id_seq; Type: SEQUENCE; Schema: public; Owner: developer
--

CREATE SEQUENCE public.extension_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.extension_id_seq OWNER TO developer;

--
-- Name: extension_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: developer
--

ALTER SEQUENCE public.extension_id_seq OWNED BY public.extension.id;


--
-- Name: invitation_data; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.invitation_data (
    id integer NOT NULL,
    resource_type character varying(180) NOT NULL,
    resource_id integer NOT NULL,
    action smallint DEFAULT 1 NOT NULL,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by character varying(180) NOT NULL,
    deleted_at timestamp with time zone,
    deleted boolean DEFAULT false NOT NULL
)
PARTITION BY LIST (deleted);


ALTER TABLE public.invitation_data OWNER TO developer;

--
-- Name: invitation; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.invitation PARTITION OF public.invitation_data
FOR VALUES IN (false);


ALTER TABLE public.invitation OWNER TO developer;

--
-- Name: invitation_data_id_seq; Type: SEQUENCE; Schema: public; Owner: developer
--

CREATE SEQUENCE public.invitation_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.invitation_data_id_seq OWNER TO developer;

--
-- Name: invitation_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: developer
--

ALTER SEQUENCE public.invitation_data_id_seq OWNED BY public.invitation_data.id;


--
-- Name: invitation_deleted; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.invitation_deleted PARTITION OF public.invitation_data
FOR VALUES IN (true);


ALTER TABLE public.invitation_deleted OWNER TO developer;

--
-- Name: policy_data; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.policy_data (
    id integer NOT NULL,
    resource_type character varying(180) NOT NULL,
    resource_id integer NOT NULL,
    uid character varying(180) NOT NULL,
    invitation_id integer,
    action smallint DEFAULT 1 NOT NULL,
    invite_id integer,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by character varying(180) NOT NULL,
    deleted_at timestamp with time zone,
    deleted boolean DEFAULT false NOT NULL
)
PARTITION BY LIST (deleted);


ALTER TABLE public.policy_data OWNER TO developer;

--
-- Name: policy; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.policy PARTITION OF public.policy_data
FOR VALUES IN (false);


ALTER TABLE public.policy OWNER TO developer;

--
-- Name: policy_data_id_seq; Type: SEQUENCE; Schema: public; Owner: developer
--

CREATE SEQUENCE public.policy_data_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.policy_data_id_seq OWNER TO developer;

--
-- Name: policy_data_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: developer
--

ALTER SEQUENCE public.policy_data_id_seq OWNED BY public.policy_data.id;


--
-- Name: policy_deleted; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.policy_deleted PARTITION OF public.policy_data
FOR VALUES IN (true);


ALTER TABLE public.policy_deleted OWNER TO developer;

--
-- Name: reaction; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.reaction (
    id integer NOT NULL,
    chart_id integer NOT NULL,
    reaction_type public.reaction_type NOT NULL,
    created_by character varying(180) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.reaction OWNER TO developer;

--
-- Name: reaction_id_seq; Type: SEQUENCE; Schema: public; Owner: developer
--

CREATE SEQUENCE public.reaction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reaction_id_seq OWNER TO developer;

--
-- Name: reaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: developer
--

ALTER SEQUENCE public.reaction_id_seq OWNED BY public.reaction.id;


--
-- Name: tag; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.tag (
    id integer NOT NULL,
    munge character varying(180) NOT NULL,
    display_name public.citext NOT NULL,
    tag_type character varying(180) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    created_by character varying(180) NOT NULL,
    _scope character varying(180),
    password character varying(180)
);


ALTER TABLE public.tag OWNER TO developer;

--
-- Name: tag_id_seq; Type: SEQUENCE; Schema: public; Owner: developer
--

CREATE SEQUENCE public.tag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tag_id_seq OWNER TO developer;

--
-- Name: tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: developer
--

ALTER SEQUENCE public.tag_id_seq OWNED BY public.tag.id;

--
-- Name: userr; Type: TABLE; Schema: public; Owner: developer
--

CREATE TABLE public.userr (
    uid character varying(180) NOT NULL,
    username public.citext NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.userr OWNER TO developer;

--
-- Name: chart id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart ALTER COLUMN id SET DEFAULT nextval('public.chart_id_seq'::regclass);


--
-- Name: chart_extension id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart_extension ALTER COLUMN id SET DEFAULT nextval('public.chart_extension_id_seq'::regclass);


--
-- Name: chart_tag id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart_tag ALTER COLUMN id SET DEFAULT nextval('public.chart_tag_id_seq'::regclass);


--
-- Name: extension id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.extension ALTER COLUMN id SET DEFAULT nextval('public.extension_id_seq'::regclass);


--
-- Name: invitation id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation ALTER COLUMN id SET DEFAULT nextval('public.invitation_data_id_seq'::regclass);


--
-- Name: invitation action; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation ALTER COLUMN action SET DEFAULT 1;


--
-- Name: invitation created_at; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation ALTER COLUMN created_at SET DEFAULT now();


--
-- Name: invitation deleted; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation ALTER COLUMN deleted SET DEFAULT false;


--
-- Name: invitation_data id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation_data ALTER COLUMN id SET DEFAULT nextval('public.invitation_data_id_seq'::regclass);


--
-- Name: invitation_deleted id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation_deleted ALTER COLUMN id SET DEFAULT nextval('public.invitation_data_id_seq'::regclass);


--
-- Name: invitation_deleted action; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation_deleted ALTER COLUMN action SET DEFAULT 1;


--
-- Name: invitation_deleted created_at; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation_deleted ALTER COLUMN created_at SET DEFAULT now();


--
-- Name: invitation_deleted deleted; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation_deleted ALTER COLUMN deleted SET DEFAULT false;


--
-- Name: policy id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy ALTER COLUMN id SET DEFAULT nextval('public.policy_data_id_seq'::regclass);


--
-- Name: policy action; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy ALTER COLUMN action SET DEFAULT 1;


--
-- Name: policy created_at; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy ALTER COLUMN created_at SET DEFAULT now();


--
-- Name: policy deleted; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy ALTER COLUMN deleted SET DEFAULT false;


--
-- Name: policy_data id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy_data ALTER COLUMN id SET DEFAULT nextval('public.policy_data_id_seq'::regclass);


--
-- Name: policy_deleted id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy_deleted ALTER COLUMN id SET DEFAULT nextval('public.policy_data_id_seq'::regclass);


--
-- Name: policy_deleted action; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy_deleted ALTER COLUMN action SET DEFAULT 1;


--
-- Name: policy_deleted created_at; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy_deleted ALTER COLUMN created_at SET DEFAULT now();


--
-- Name: policy_deleted deleted; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy_deleted ALTER COLUMN deleted SET DEFAULT false;


--
-- Name: reaction id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.reaction ALTER COLUMN id SET DEFAULT nextval('public.reaction_id_seq'::regclass);


--
-- Name: tag id; Type: DEFAULT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.tag ALTER COLUMN id SET DEFAULT nextval('public.tag_id_seq'::regclass);


--
-- Name: chart_extension chart_extension_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart_extension
    ADD CONSTRAINT chart_extension_pkey PRIMARY KEY (id);


--
-- Name: chart_extension chart_extension_unique; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart_extension
    ADD CONSTRAINT chart_extension_unique UNIQUE (chart_id, extension_id);


--
-- Name: chart chart_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart
    ADD CONSTRAINT chart_pkey PRIMARY KEY (id);


--
-- Name: chart_tag chart_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart_tag
    ADD CONSTRAINT chart_tag_pkey PRIMARY KEY (id);


--
-- Name: chart_tag chart_tag_unique; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart_tag
    ADD CONSTRAINT chart_tag_unique UNIQUE (chart_id, tag_id);


--
-- Name: extension extension_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.extension
    ADD CONSTRAINT extension_pkey PRIMARY KEY (id);


--
-- Name: extension extension_type_degree_unique; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.extension
    ADD CONSTRAINT extension_type_degree_unique UNIQUE (extension_type, degree);


--
-- Name: invitation_data invitation_data_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation_data
    ADD CONSTRAINT invitation_data_pkey PRIMARY KEY (id, deleted);


--
-- Name: invitation_deleted invitation_deleted_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation_deleted
    ADD CONSTRAINT invitation_deleted_pkey PRIMARY KEY (id, deleted);


--
-- Name: invitation invitation_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.invitation
    ADD CONSTRAINT invitation_pkey PRIMARY KEY (id, deleted);


--
-- Name: policy_data policy_data_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy_data
    ADD CONSTRAINT policy_data_pkey PRIMARY KEY (id, deleted);


--
-- Name: policy_deleted policy_deleted_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy_deleted
    ADD CONSTRAINT policy_deleted_pkey PRIMARY KEY (id, deleted);


--
-- Name: policy policy_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.policy
    ADD CONSTRAINT policy_pkey PRIMARY KEY (id, deleted);


--
-- Name: reaction reaction_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_pkey PRIMARY KEY (id);


--
-- Name: reaction reaction_unique; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_unique UNIQUE (created_by, chart_id);


--
-- Name: tag tag_pkey; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.tag
    ADD CONSTRAINT tag_pkey PRIMARY KEY (id);


--
-- Name: userr userr_unique; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.userr
    ADD CONSTRAINT userr_unique PRIMARY KEY (uid);


--
-- Name: userr userr_username_unique; Type: CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.userr
    ADD CONSTRAINT userr_username_unique UNIQUE (username);


--
-- Name: chart_created_by_created_at_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE INDEX chart_created_by_created_at_idx ON public.chart USING btree (created_by, created_at);


--
-- Name: chart_created_by_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE INDEX chart_created_by_idx ON public.chart USING btree (created_by);


--
-- Name: chart_extension_chart_id_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE INDEX chart_extension_chart_id_idx ON public.chart_extension USING btree (chart_id);


--
-- Name: chart_tag_chart_id_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE INDEX chart_tag_chart_id_idx ON public.chart_tag USING btree (chart_id);


--
-- Name: chart_tag_tag_id_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE INDEX chart_tag_tag_id_idx ON public.chart_tag USING btree (tag_id);


--
-- Name: policy_uid_resource_type_expires_at_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE INDEX policy_uid_resource_type_expires_at_idx ON public.policy USING btree (uid, resource_type, expires_at);


--
-- Name: reaction_chart_id_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE INDEX reaction_chart_id_idx ON public.reaction USING btree (chart_id);


--
-- Name: reaction_chart_id_reaction_type_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE INDEX reaction_chart_id_reaction_type_idx ON public.reaction USING btree (chart_id, reaction_type);


--
-- Name: tag_created_by_display_name_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE UNIQUE INDEX tag_created_by_display_name_idx ON public.tag USING btree (created_by, display_name);


--
-- Name: tag_created_by_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE INDEX tag_created_by_idx ON public.tag USING btree (created_by);


--
-- Name: tag_created_by_munge_idx; Type: INDEX; Schema: public; Owner: developer
--

CREATE UNIQUE INDEX tag_created_by_munge_idx ON public.tag USING btree (created_by, munge);


--
-- Name: invitation_deleted_pkey; Type: INDEX ATTACH; Schema: public; Owner:
--

ALTER INDEX public.invitation_data_pkey ATTACH PARTITION public.invitation_deleted_pkey;


--
-- Name: invitation_pkey; Type: INDEX ATTACH; Schema: public; Owner:
--

ALTER INDEX public.invitation_data_pkey ATTACH PARTITION public.invitation_pkey;


--
-- Name: policy_deleted_pkey; Type: INDEX ATTACH; Schema: public; Owner:
--

ALTER INDEX public.policy_data_pkey ATTACH PARTITION public.policy_deleted_pkey;


--
-- Name: policy_pkey; Type: INDEX ATTACH; Schema: public; Owner:
--

ALTER INDEX public.policy_data_pkey ATTACH PARTITION public.policy_pkey;


--
-- Name: chart_extension chart_extension_chart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart_extension
    ADD CONSTRAINT chart_extension_chart_id_fkey FOREIGN KEY (chart_id) REFERENCES public.chart(id) ON DELETE CASCADE;


--
-- Name: chart_extension chart_extension_extension_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart_extension
    ADD CONSTRAINT chart_extension_extension_id_fkey FOREIGN KEY (extension_id) REFERENCES public.extension(id) ON DELETE CASCADE;


--
-- Name: chart_tag chart_tag_chart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart_tag
    ADD CONSTRAINT chart_tag_chart_id_fkey FOREIGN KEY (chart_id) REFERENCES public.chart(id) ON DELETE CASCADE;


--
-- Name: chart_tag chart_tag_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.chart_tag
    ADD CONSTRAINT chart_tag_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tag(id) ON DELETE CASCADE;


--
-- Name: reaction reaction_chart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_chart_id_fkey FOREIGN KEY (chart_id) REFERENCES public.chart(id) ON DELETE CASCADE;


--
-- Name: reaction reaction_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: developer
--

ALTER TABLE ONLY public.reaction
    ADD CONSTRAINT reaction_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.userr(uid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

