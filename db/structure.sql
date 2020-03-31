SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: accounting_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounting_periods (
    id integer NOT NULL,
    user_id integer NOT NULL,
    contract_id integer,
    starts_at timestamp without time zone,
    ends_at timestamp without time zone,
    counted_duration integer DEFAULT 0 NOT NULL,
    closed boolean DEFAULT false NOT NULL,
    note text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    full_time boolean DEFAULT false NOT NULL,
    duration integer NOT NULL,
    "position" integer NOT NULL,
    protected boolean DEFAULT false NOT NULL
);


--
-- Name: accounting_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accounting_periods_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accounting_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.accounting_periods_id_seq OWNED BY public.accounting_periods.id;


--
-- Name: accounting_periods_recounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.accounting_periods_recounts (
    id integer NOT NULL,
    user_id integer,
    counting boolean,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: accounting_periods_recounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.accounting_periods_recounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: accounting_periods_recounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.accounting_periods_recounts_id_seq OWNED BY public.accounting_periods_recounts.id;


--
-- Name: ar_internal_metadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ar_internal_metadata (
    key character varying NOT NULL,
    value character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: birthday_email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.birthday_email_templates (
    id bigint NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    name character varying NOT NULL,
    title character varying NOT NULL,
    last_used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    bottom text DEFAULT ''::text NOT NULL,
    header text DEFAULT ''::text NOT NULL
);


--
-- Name: birthday_email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.birthday_email_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: birthday_email_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.birthday_email_templates_id_seq OWNED BY public.birthday_email_templates.id;


--
-- Name: external_auths; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.external_auths (
    id bigint NOT NULL,
    project_id bigint,
    data jsonb NOT NULL,
    provider character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    user_id bigint
);


--
-- Name: external_auths_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.external_auths_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: external_auths_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.external_auths_id_seq OWNED BY public.external_auths.id;


--
-- Name: project_report_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_report_roles (
    id bigint NOT NULL,
    project_report_id bigint NOT NULL,
    user_id bigint NOT NULL,
    role character varying DEFAULT 'developer'::character varying NOT NULL,
    hourly_wage numeric(8,2) DEFAULT 0.0 NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    description character varying
);


--
-- Name: project_report_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_report_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_report_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_report_roles_id_seq OWNED BY public.project_report_roles.id;


--
-- Name: project_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_reports (
    id bigint NOT NULL,
    project_id bigint NOT NULL,
    initial_body jsonb DEFAULT '{}'::jsonb NOT NULL,
    last_body jsonb DEFAULT '{}'::jsonb NOT NULL,
    state character varying DEFAULT 'editing'::character varying NOT NULL,
    duration_sum integer NOT NULL,
    cost numeric(12,2) DEFAULT 0.0 NOT NULL,
    starts_at timestamp without time zone NOT NULL,
    ends_at timestamp without time zone NOT NULL,
    currency character varying DEFAULT ''::character varying NOT NULL,
    name character varying DEFAULT ''::character varying NOT NULL,
    file_path character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: project_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_reports_id_seq OWNED BY public.project_reports.id;


--
-- Name: project_resource_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_resource_assignments (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    project_resource_id bigint NOT NULL,
    project_id bigint NOT NULL,
    vacation_id bigint,
    starts_at timestamp without time zone NOT NULL,
    ends_at timestamp without time zone NOT NULL,
    title character varying,
    color character varying,
    resource_rid character varying NOT NULL,
    type integer DEFAULT 1 NOT NULL,
    resizable boolean DEFAULT true,
    movable boolean DEFAULT true,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: project_resource_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_resource_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_resource_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_resource_assignments_id_seq OWNED BY public.project_resource_assignments.id;


--
-- Name: project_resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.project_resources (
    id bigint NOT NULL,
    user_id bigint,
    project_resource_id integer,
    rid character varying NOT NULL,
    name character varying NOT NULL,
    group_only boolean DEFAULT false NOT NULL,
    parent_rid character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: project_resources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.project_resources_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: project_resources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.project_resources_id_seq OWNED BY public.project_resources.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    internal boolean DEFAULT false NOT NULL,
    color character varying DEFAULT '000000'::character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    work_times_allows_task boolean DEFAULT false NOT NULL,
    leader_id bigint,
    autofill boolean DEFAULT false NOT NULL,
    lunch boolean DEFAULT false NOT NULL,
    count_duration boolean DEFAULT true NOT NULL,
    external_integration_enabled boolean DEFAULT false NOT NULL
);


--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying DEFAULT ''::character varying NOT NULL,
    encrypted_password character varying DEFAULT ''::character varying NOT NULL,
    reset_password_token character varying,
    reset_password_sent_at timestamp without time zone,
    remember_created_at timestamp without time zone,
    sign_in_count integer DEFAULT 0 NOT NULL,
    current_sign_in_at timestamp without time zone,
    last_sign_in_at timestamp without time zone,
    current_sign_in_ip inet,
    last_sign_in_ip inet,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    admin boolean DEFAULT false NOT NULL,
    first_name character varying NOT NULL,
    last_name character varying NOT NULL,
    phone character varying,
    contract_name character varying,
    active boolean DEFAULT true NOT NULL,
    manager boolean DEFAULT false NOT NULL,
    lang character varying DEFAULT 'pl'::character varying NOT NULL,
    staff_manager boolean DEFAULT false NOT NULL,
    birthdate date
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vacation_interactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacation_interactions (
    id bigint NOT NULL,
    vacation_id bigint NOT NULL,
    user_id bigint NOT NULL,
    action character varying NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: vacation_interactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vacation_interactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vacation_interactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vacation_interactions_id_seq OWNED BY public.vacation_interactions.id;


--
-- Name: vacation_periods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacation_periods (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    starts_at date NOT NULL,
    ends_at date NOT NULL,
    vacation_days integer NOT NULL,
    note text DEFAULT ''::text,
    closed boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


--
-- Name: vacation_periods_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vacation_periods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vacation_periods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vacation_periods_id_seq OWNED BY public.vacation_periods.id;


--
-- Name: vacations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacations (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    vacation_type character varying NOT NULL,
    description character varying,
    status character varying DEFAULT 'unconfirmed'::character varying NOT NULL,
    vacation_sub_type character varying,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    self_declined boolean DEFAULT false NOT NULL,
    business_days_count integer NOT NULL
);


--
-- Name: vacations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vacations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vacations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vacations_id_seq OWNED BY public.vacations.id;


--
-- Name: versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.versions (
    id integer NOT NULL,
    item_type character varying NOT NULL,
    item_id integer NOT NULL,
    event character varying NOT NULL,
    whodunnit character varying,
    object text,
    created_at timestamp without time zone,
    object_changes text
);


--
-- Name: versions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.versions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: versions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.versions_id_seq OWNED BY public.versions.id;


--
-- Name: work_times; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_times (
    id integer NOT NULL,
    user_id integer NOT NULL,
    project_id integer NOT NULL,
    starts_at timestamp without time zone NOT NULL,
    ends_at timestamp without time zone NOT NULL,
    duration integer DEFAULT 0 NOT NULL,
    body text,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    contract_name character varying,
    active boolean DEFAULT true NOT NULL,
    creator_id integer NOT NULL,
    updated_by_admin boolean DEFAULT false NOT NULL,
    task character varying,
    integration_payload jsonb,
    tag character varying DEFAULT 'dev'::character varying NOT NULL,
    vacation_id integer
);


--
-- Name: work_times_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.work_times_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: work_times_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.work_times_id_seq OWNED BY public.work_times.id;


--
-- Name: accounting_periods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounting_periods ALTER COLUMN id SET DEFAULT nextval('public.accounting_periods_id_seq'::regclass);


--
-- Name: accounting_periods_recounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounting_periods_recounts ALTER COLUMN id SET DEFAULT nextval('public.accounting_periods_recounts_id_seq'::regclass);


--
-- Name: birthday_email_templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.birthday_email_templates ALTER COLUMN id SET DEFAULT nextval('public.birthday_email_templates_id_seq'::regclass);


--
-- Name: external_auths id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_auths ALTER COLUMN id SET DEFAULT nextval('public.external_auths_id_seq'::regclass);


--
-- Name: project_report_roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_report_roles ALTER COLUMN id SET DEFAULT nextval('public.project_report_roles_id_seq'::regclass);


--
-- Name: project_reports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_reports ALTER COLUMN id SET DEFAULT nextval('public.project_reports_id_seq'::regclass);


--
-- Name: project_resource_assignments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resource_assignments ALTER COLUMN id SET DEFAULT nextval('public.project_resource_assignments_id_seq'::regclass);


--
-- Name: project_resources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resources ALTER COLUMN id SET DEFAULT nextval('public.project_resources_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vacation_interactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_interactions ALTER COLUMN id SET DEFAULT nextval('public.vacation_interactions_id_seq'::regclass);


--
-- Name: vacation_periods id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_periods ALTER COLUMN id SET DEFAULT nextval('public.vacation_periods_id_seq'::regclass);


--
-- Name: vacations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacations ALTER COLUMN id SET DEFAULT nextval('public.vacations_id_seq'::regclass);


--
-- Name: versions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.versions ALTER COLUMN id SET DEFAULT nextval('public.versions_id_seq'::regclass);


--
-- Name: work_times id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_times ALTER COLUMN id SET DEFAULT nextval('public.work_times_id_seq'::regclass);


--
-- Name: accounting_periods accounting_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounting_periods
    ADD CONSTRAINT accounting_periods_pkey PRIMARY KEY (id);


--
-- Name: accounting_periods_recounts accounting_periods_recounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounting_periods_recounts
    ADD CONSTRAINT accounting_periods_recounts_pkey PRIMARY KEY (id);


--
-- Name: ar_internal_metadata ar_internal_metadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ar_internal_metadata
    ADD CONSTRAINT ar_internal_metadata_pkey PRIMARY KEY (key);


--
-- Name: birthday_email_templates birthday_email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.birthday_email_templates
    ADD CONSTRAINT birthday_email_templates_pkey PRIMARY KEY (id);


--
-- Name: external_auths external_auths_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_auths
    ADD CONSTRAINT external_auths_pkey PRIMARY KEY (id);


--
-- Name: project_report_roles project_report_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_report_roles
    ADD CONSTRAINT project_report_roles_pkey PRIMARY KEY (id);


--
-- Name: project_reports project_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_reports
    ADD CONSTRAINT project_reports_pkey PRIMARY KEY (id);


--
-- Name: project_resource_assignments project_resource_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resource_assignments
    ADD CONSTRAINT project_resource_assignments_pkey PRIMARY KEY (id);


--
-- Name: project_resources project_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resources
    ADD CONSTRAINT project_resources_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vacation_interactions vacation_interactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_interactions
    ADD CONSTRAINT vacation_interactions_pkey PRIMARY KEY (id);


--
-- Name: vacation_periods vacation_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_periods
    ADD CONSTRAINT vacation_periods_pkey PRIMARY KEY (id);


--
-- Name: vacations vacations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacations
    ADD CONSTRAINT vacations_pkey PRIMARY KEY (id);


--
-- Name: versions versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.versions
    ADD CONSTRAINT versions_pkey PRIMARY KEY (id);


--
-- Name: work_times work_times_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_times
    ADD CONSTRAINT work_times_pkey PRIMARY KEY (id);


--
-- Name: index_accounting_periods_on_user_id_and_position; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_accounting_periods_on_user_id_and_position ON public.accounting_periods USING btree (user_id, "position");


--
-- Name: index_accounting_periods_recounts_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_accounting_periods_recounts_on_user_id ON public.accounting_periods_recounts USING btree (user_id);


--
-- Name: index_external_auths_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_external_auths_on_project_id ON public.external_auths USING btree (project_id);


--
-- Name: index_external_auths_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_external_auths_on_user_id ON public.external_auths USING btree (user_id);


--
-- Name: index_project_report_roles_on_project_report_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_report_roles_on_project_report_id ON public.project_report_roles USING btree (project_report_id);


--
-- Name: index_project_report_roles_on_project_report_id_and_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_project_report_roles_on_project_report_id_and_user_id ON public.project_report_roles USING btree (project_report_id, user_id);


--
-- Name: index_project_report_roles_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_report_roles_on_user_id ON public.project_report_roles USING btree (user_id);


--
-- Name: index_project_reports_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_reports_on_project_id ON public.project_reports USING btree (project_id);


--
-- Name: index_project_resource_assignments_on_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_resource_assignments_on_project_id ON public.project_resource_assignments USING btree (project_id);


--
-- Name: index_project_resource_assignments_on_project_resource_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_resource_assignments_on_project_resource_id ON public.project_resource_assignments USING btree (project_resource_id);


--
-- Name: index_project_resource_assignments_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_resource_assignments_on_user_id ON public.project_resource_assignments USING btree (user_id);


--
-- Name: index_project_resource_assignments_on_vacation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_resource_assignments_on_vacation_id ON public.project_resource_assignments USING btree (vacation_id);


--
-- Name: index_project_resources_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_project_resources_on_user_id ON public.project_resources USING btree (user_id);


--
-- Name: index_projects_on_leader_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_projects_on_leader_id ON public.projects USING btree (leader_id);


--
-- Name: index_projects_on_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_projects_on_name ON public.projects USING btree (name);


--
-- Name: index_users_on_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_email ON public.users USING btree (email);


--
-- Name: index_users_on_reset_password_token; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX index_users_on_reset_password_token ON public.users USING btree (reset_password_token);


--
-- Name: index_vacation_interactions_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vacation_interactions_on_user_id ON public.vacation_interactions USING btree (user_id);


--
-- Name: index_vacation_interactions_on_vacation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vacation_interactions_on_vacation_id ON public.vacation_interactions USING btree (vacation_id);


--
-- Name: index_vacation_periods_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vacation_periods_on_user_id ON public.vacation_periods USING btree (user_id);


--
-- Name: index_vacations_on_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_vacations_on_user_id ON public.vacations USING btree (user_id);


--
-- Name: index_versions_on_item_type_and_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX index_versions_on_item_type_and_item_id ON public.versions USING btree (item_type, item_id);


--
-- Name: accounting_periods accounting_periods_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounting_periods
    ADD CONSTRAINT accounting_periods_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: project_resource_assignments fk_rails_0434b48643; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resource_assignments
    ADD CONSTRAINT fk_rails_0434b48643 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: project_resource_assignments fk_rails_092ec4fd52; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resource_assignments
    ADD CONSTRAINT fk_rails_092ec4fd52 FOREIGN KEY (vacation_id) REFERENCES public.vacations(id);


--
-- Name: project_report_roles fk_rails_09358a1ea2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_report_roles
    ADD CONSTRAINT fk_rails_09358a1ea2 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: project_resource_assignments fk_rails_0cb5590091; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resource_assignments
    ADD CONSTRAINT fk_rails_0cb5590091 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: vacations fk_rails_10fe255323; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacations
    ADD CONSTRAINT fk_rails_10fe255323 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: project_reports fk_rails_204d3a9e68; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_reports
    ADD CONSTRAINT fk_rails_204d3a9e68 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: project_resources fk_rails_250ed64e61; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resources
    ADD CONSTRAINT fk_rails_250ed64e61 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: vacation_interactions fk_rails_2e1ef1d607; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_interactions
    ADD CONSTRAINT fk_rails_2e1ef1d607 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: project_resource_assignments fk_rails_463d2b3c46; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_resource_assignments
    ADD CONSTRAINT fk_rails_463d2b3c46 FOREIGN KEY (project_resource_id) REFERENCES public.project_resources(id);


--
-- Name: vacation_interactions fk_rails_5a5e988dab; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_interactions
    ADD CONSTRAINT fk_rails_5a5e988dab FOREIGN KEY (vacation_id) REFERENCES public.vacations(id);


--
-- Name: accounting_periods_recounts fk_rails_7437edbf23; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.accounting_periods_recounts
    ADD CONSTRAINT fk_rails_7437edbf23 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: project_report_roles fk_rails_8956ca8233; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.project_report_roles
    ADD CONSTRAINT fk_rails_8956ca8233 FOREIGN KEY (project_report_id) REFERENCES public.project_reports(id);


--
-- Name: external_auths fk_rails_91cae223a5; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_auths
    ADD CONSTRAINT fk_rails_91cae223a5 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: vacation_periods fk_rails_a485c91fed; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacation_periods
    ADD CONSTRAINT fk_rails_a485c91fed FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: projects fk_rails_aec0422031; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_rails_aec0422031 FOREIGN KEY (leader_id) REFERENCES public.users(id);


--
-- Name: external_auths fk_rails_fe63a8f959; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.external_auths
    ADD CONSTRAINT fk_rails_fe63a8f959 FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: work_times work_times_creator_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_times
    ADD CONSTRAINT work_times_creator_id_fk FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: work_times work_times_project_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_times
    ADD CONSTRAINT work_times_project_id_fk FOREIGN KEY (project_id) REFERENCES public.projects(id);


--
-- Name: work_times work_times_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_times
    ADD CONSTRAINT work_times_user_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: work_times work_times_vacation_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_times
    ADD CONSTRAINT work_times_vacation_id_fk FOREIGN KEY (vacation_id) REFERENCES public.vacations(id);


--
-- PostgreSQL database dump complete
--

SET search_path TO "$user", public;

INSERT INTO "schema_migrations" (version) VALUES
('20180927095305'),
('20181122094509'),
('20181204084117'),
('20190211110225'),
('20190213100847'),
('20190417091913'),
('20190417104906'),
('20190425095633'),
('20190517093812'),
('20190619102345'),
('20190918121135'),
('20190918164812'),
('20190924104142'),
('20191009095137'),
('20191010094744'),
('20191105152540'),
('20191113102357'),
('20191213093524'),
('20191213142323'),
('20200115144158'),
('20200225115359'),
('20200225144719'),
('20200228142843'),
('20200303103236'),
('20200316100733'),
('20200320112300');


