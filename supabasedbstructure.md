### database structure

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

<!-- Users -->

CREATE TABLE public.Users (
created_at timestamp with time zone NOT NULL DEFAULT now(),
name character varying,
email character varying UNIQUE,
picture character varying,
credits bigint DEFAULT '10'::bigint,
clerk_user_id character varying NOT NULL UNIQUE,
id uuid NOT NULL DEFAULT gen_random_uuid(),
firstname text,
lastname text,
CONSTRAINT Users_pkey PRIMARY KEY (clerk_user_id)
);

<!-- call_logs -->

CREATE TABLE public.call_logs (
id uuid NOT NULL DEFAULT gen_random_uuid(),
call_id uuid,
status text,
start_time timestamp with time zone,
end_time timestamp with time zone,
duration integer,
log_data jsonb,
transcript jsonb,
created_at timestamp with time zone DEFAULT now(),
CONSTRAINT call_logs_pkey PRIMARY KEY (id)
);

<!-- candidate_job_matches -->

CREATE TABLE public.candidate_job_matches (
id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
userEmail character varying,
resume_id bigint,
jd_id bigint,
confidence_score numeric,
skills_score numeric,
experience_score numeric,
semantic_score numeric,
matched_skills jsonb,
missing_skills jsonb,
CONSTRAINT candidate_job_matches_pkey PRIMARY KEY (id),
CONSTRAINT matches_resume_fkey FOREIGN KEY (resume_id) REFERENCES public.resumes(id),
CONSTRAINT matches_jd_fkey FOREIGN KEY (jd_id) REFERENCES public.job_descriptions(id),
CONSTRAINT matches_useremail_fkey FOREIGN KEY (userEmail) REFERENCES public.Users(email)
);

<!-- interview-feedback -->

CREATE TABLE public.interview-feedback (
id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
userName text,
userEmail character varying,
interview_Id text,
feedback json,
recommendation boolean,
transcript json,
call_id uuid,
CONSTRAINT interview-feedback_pkey PRIMARY KEY (id),
CONSTRAINT interview-feedback_interview_Id_fkey FOREIGN KEY (interview_Id) REFERENCES public.interviews(interviewId),
CONSTRAINT interview-feedback_userEmail_fkey FOREIGN KEY (userEmail) REFERENCES public.Users(email)
);

<!-- interview_invites -->

CREATE TABLE public.interview_invites (
id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
interview_id text,
candidate_email text NOT NULL,
candidate_name text,
status text DEFAULT 'pending'::text,
invited_at timestamp with time zone DEFAULT now(),
CONSTRAINT interview_invites_pkey PRIMARY KEY (id),
CONSTRAINT interview_invites_interview_id_fkey FOREIGN KEY (interview_id) REFERENCES public.interviews(interviewId)
);

<!-- interviews -->

CREATE TABLE public.interviews (
id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
jobPosition text,
jobDescription text,
duration text,
questionList json,
userEmail text,
interviewId text UNIQUE,
type text,
companyDetails text,
companySummary text,
companyName text,
CONSTRAINT interviews_pkey PRIMARY KEY (id)
);

<!-- job_descriptions -->

CREATE TABLE public.job_descriptions (
id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
userEmail character varying,
role_title text,
file_url text,
raw_text text,
parsed_data jsonb,
embedding USER-DEFINED,
interview_id text,
CONSTRAINT job_descriptions_pkey PRIMARY KEY (id),
CONSTRAINT job_descriptions_useremail_fkey FOREIGN KEY (userEmail) REFERENCES public.Users(email),
CONSTRAINT job_descriptions_interview_id_fkey FOREIGN KEY (interview_id) REFERENCES public.interviews(interviewId)
);

<!-- resumes -->

CREATE TABLE public.resumes (
id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
created_at timestamp with time zone NOT NULL DEFAULT now(),
userEmail character varying,
candidate_name text,
candidate_email text,
file_url text,
parsed_data jsonb,
embedding USER-DEFINED,
CONSTRAINT resumes_pkey PRIMARY KEY (id),
CONSTRAINT resumes_useremail_fkey FOREIGN KEY (userEmail) REFERENCES public.Users(email)
);
