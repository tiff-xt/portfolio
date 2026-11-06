-- Knowledge base, rate limiting and privacy-first usage metrics.
create extension if not exists vector;

create table if not exists kb_chunks (
  id           text primary key,
  position     integer not null,
  section      text not null,
  heading      text not null,
  content      text not null,
  guidance     boolean not null default false,
  content_hash text not null,
  embedding    vector(768),
  updated_at   timestamptz not null default now()
);

-- Exact search is fine for a corpus this size; HNSW keeps it fast if it grows.
create index if not exists kb_chunks_embedding_idx
  on kb_chunks using hnsw (embedding vector_cosine_ops);

create table if not exists rate_limits (
  key          text not null,
  window_start timestamptz not null,
  count        integer not null default 0,
  primary key (key, window_start)
);

create table if not exists chat_events (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),
  mode           text not null,
  retrieval      text not null,
  sources        text[] not null default '{}',
  question_chars integer not null,
  latency_ms     integer not null,
  outcome        text not null
);

create index if not exists chat_events_created_idx on chat_events (created_at desc);

create table if not exists schema_migrations (
  name       text primary key,
  applied_at timestamptz not null default now()
);
