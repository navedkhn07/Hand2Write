-- Run these in Supabase SQL editor

create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_type text not null,
  name text,
  age int,
  gender text,
  mobile text,
  email text,
  district text,
  state text,
  pincode text,
  verified boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table exam_info (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now(),
  user_id uuid references profiles(id),
  date date,
  name text,
  qualification text,
  center text,
  pincode text,
  status text,
  updated_at timestamp default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now(),
  student_id uuid references profiles(id),
  writer_id uuid references profiles(id),
  exam_id uuid references exam_info(id),
  status text default 'pending',
  updated_at timestamp default now()
);

-- ===== COMPREHENSIVE LOGGING TABLES =====

-- User Activity Log - Tracks all user interactions
create table user_activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  activity_type text not null, -- 'login', 'logout', 'register', 'profile_update', 'page_visit', 'exam_create', 'exam_update', 'notification_send', 'notification_read', 'admin_action', 'error'
  activity_details jsonb, -- Detailed information about the activity
  ip_address inet,
  user_agent text,
  session_id text,
  page_url text,
  created_at timestamp default now(),
  metadata jsonb -- Additional context like browser info, device info, etc.
);

-- Authentication Events Log
create table auth_events_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  event_type text not null, -- 'signup', 'signin', 'signout', 'password_reset', 'email_verification', 'profile_update'
  event_details jsonb,
  ip_address inet,
  user_agent text,
  success boolean default true,
  error_message text,
  created_at timestamp default now()
);

-- Page Navigation Log - Tracks user page visits
create table page_navigation_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  page_path text not null,
  page_title text,
  referrer text,
  time_spent_seconds int,
  session_id text,
  ip_address inet,
  user_agent text,
  created_at timestamp default now(),
  left_at timestamp
);

-- Form Submission Log - Tracks all form submissions
create table form_submission_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  form_name text not null, -- 'registration', 'profile_update', 'exam_form', 'contact_form'
  form_data jsonb, -- The actual form data submitted
  submission_success boolean default true,
  validation_errors jsonb,
  processing_time_ms int,
  ip_address inet,
  user_agent text,
  created_at timestamp default now()
);

-- Error Log - Tracks all errors and issues
create table error_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  error_type text not null, -- 'validation_error', 'database_error', 'auth_error', 'api_error', 'system_error'
  error_message text not null,
  error_stack text,
  error_context jsonb, -- Additional context about where the error occurred
  page_url text,
  user_agent text,
  ip_address inet,
  severity text default 'medium', -- 'low', 'medium', 'high', 'critical'
  resolved boolean default false,
  created_at timestamp default now()
);

-- System Actions Log - Tracks admin and system-level actions
create table system_actions_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id), -- The user performing the action
  action_type text not null, -- 'admin_action', 'system_action', 'bulk_update', 'data_export', 'user_management'
  action_details jsonb,
  affected_records jsonb, -- Records that were affected by this action
  ip_address inet,
  user_agent text,
  created_at timestamp default now()
);

-- Data Change Log - Tracks all data modifications
create table data_change_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id), -- Who made the change
  table_name text not null, -- Which table was modified
  record_id uuid, -- ID of the modified record
  change_type text not null, -- 'insert', 'update', 'delete'
  old_values jsonb, -- Previous values (for updates/deletes)
  new_values jsonb, -- New values (for inserts/updates)
  change_reason text, -- Why the change was made
  ip_address inet,
  user_agent text,
  created_at timestamp default now()
);

-- Session Tracking Log
create table session_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  session_id text not null,
  ip_address inet,
  user_agent text,
  login_time timestamp default now(),
  logout_time timestamp,
  last_activity timestamp default now(),
  session_duration_seconds int,
  is_active boolean default true
);

-- ===== INDEXES FOR PERFORMANCE =====

-- Indexes for user_activity_log
create index idx_user_activity_log_user_id on user_activity_log(user_id);
create index idx_user_activity_log_activity_type on user_activity_log(activity_type);
create index idx_user_activity_log_created_at on user_activity_log(created_at);

-- Indexes for auth_events_log
create index idx_auth_events_log_user_id on auth_events_log(user_id);
create index idx_auth_events_log_event_type on auth_events_log(event_type);
create index idx_auth_events_log_created_at on auth_events_log(created_at);

-- Indexes for page_navigation_log
create index idx_page_navigation_log_user_id on page_navigation_log(user_id);
create index idx_page_navigation_log_page_path on page_navigation_log(page_path);
create index idx_page_navigation_log_session_id on page_navigation_log(session_id);

-- Indexes for form_submission_log
create index idx_form_submission_log_user_id on form_submission_log(user_id);
create index idx_form_submission_log_form_name on form_submission_log(form_name);

-- Indexes for error_log
create index idx_error_log_user_id on error_log(user_id);
create index idx_error_log_error_type on error_log(error_type);
create index idx_error_log_severity on error_log(severity);

-- Indexes for system_actions_log
create index idx_system_actions_log_user_id on system_actions_log(user_id);
create index idx_system_actions_log_action_type on system_actions_log(action_type);

-- Indexes for data_change_log
create index idx_data_change_log_user_id on data_change_log(user_id);
create index idx_data_change_log_table_name on data_change_log(table_name);
create index idx_data_change_log_change_type on data_change_log(change_type);

-- Indexes for session_log
create index idx_session_log_user_id on session_log(user_id);
create index idx_session_log_session_id on session_log(session_id);

-- ===== TRIGGERS FOR AUTOMATIC LOGGING =====

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to profiles table
create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

-- Apply updated_at trigger to exam_info table
create trigger update_exam_info_updated_at before update on exam_info
  for each row execute function update_updated_at_column();

-- Apply updated_at trigger to notifications table
create trigger update_notifications_updated_at before update on notifications
  for each row execute function update_updated_at_column();

-- ===== FUNCTIONS FOR LOGGING =====

-- Function to log user activity
create or replace function log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_activity_details jsonb default null,
  p_ip_address inet default null,
  p_user_agent text default null,
  p_session_id text default null,
  p_page_url text default null,
  p_metadata jsonb default null
)
returns void as $$
begin
  insert into user_activity_log (
    user_id, activity_type, activity_details, ip_address, 
    user_agent, session_id, page_url, metadata
  ) values (
    p_user_id, p_activity_type, p_activity_details, p_ip_address,
    p_user_agent, p_session_id, p_page_url, p_metadata
  );
end;
$$ language plpgsql;

-- Function to log authentication events
create or replace function log_auth_event(
  p_user_id uuid,
  p_event_type text,
  p_event_details jsonb default null,
  p_ip_address inet default null,
  p_user_agent text default null,
  p_success boolean default true,
  p_error_message text default null
)
returns void as $$
begin
  insert into auth_events_log (
    user_id, event_type, event_details, ip_address, 
    user_agent, success, error_message
  ) values (
    p_user_id, p_event_type, p_event_details, p_ip_address,
    p_user_agent, p_success, p_error_message
  );
end;
$$ language plpgsql;

-- Function to log page navigation
create or replace function log_page_navigation(
  p_user_id uuid,
  p_page_path text,
  p_page_title text default null,
  p_referrer text default null,
  p_session_id text default null,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns void as $$
begin
  insert into page_navigation_log (
    user_id, page_path, page_title, referrer, session_id, ip_address, user_agent
  ) values (
    p_user_id, p_page_path, p_page_title, p_referrer, p_session_id, p_ip_address, p_user_agent
  );
end;
$$ language plpgsql;

-- Function to log form submissions
create or replace function log_form_submission(
  p_user_id uuid,
  p_form_name text,
  p_form_data jsonb,
  p_submission_success boolean default true,
  p_validation_errors jsonb default null,
  p_processing_time_ms int default null,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns void as $$
begin
  insert into form_submission_log (
    user_id, form_name, form_data, submission_success, 
    validation_errors, processing_time_ms, ip_address, user_agent
  ) values (
    p_user_id, p_form_name, p_form_data, p_submission_success,
    p_validation_errors, p_processing_time_ms, p_ip_address, p_user_agent
  );
end;
$$ language plpgsql;

-- Function to log errors
create or replace function log_error(
  p_user_id uuid,
  p_error_type text,
  p_error_message text,
  p_error_stack text default null,
  p_error_context jsonb default null,
  p_page_url text default null,
  p_user_agent text default null,
  p_ip_address inet default null,
  p_severity text default 'medium'
)
returns void as $$
begin
  insert into error_log (
    user_id, error_type, error_message, error_stack, error_context,
    page_url, user_agent, ip_address, severity
  ) values (
    p_user_id, p_error_type, p_error_message, p_error_stack, p_error_context,
    p_page_url, p_user_agent, p_ip_address, p_severity
  );
end;
$$ language plpgsql;

-- Function to log data changes
create or replace function log_data_change(
  p_user_id uuid,
  p_table_name text,
  p_record_id uuid,
  p_change_type text,
  p_old_values jsonb default null,
  p_new_values jsonb default null,
  p_change_reason text default null,
  p_ip_address inet default null,
  p_user_agent text default null
)
returns void as $$
begin
  insert into data_change_log (
    user_id, table_name, record_id, change_type, old_values,
    new_values, change_reason, ip_address, user_agent
  ) values (
    p_user_id, p_table_name, p_record_id, p_change_type, p_old_values,
    p_new_values, p_change_reason, p_ip_address, p_user_agent
  );
end;
$$ language plpgsql;

-- ===== ROW LEVEL SECURITY (RLS) POLICIES =====

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table exam_info enable row level security;
alter table notifications enable row level security;
alter table user_activity_log enable row level security;
alter table auth_events_log enable row level security;
alter table page_navigation_log enable row level security;
alter table form_submission_log enable row level security;
alter table error_log enable row level security;
alter table system_actions_log enable row level security;
alter table data_change_log enable row level security;
alter table session_log enable row level security;

-- Sample seed (replace ids with real auth user ids after signup)
-- insert into profiles (id, user_type, name, age, gender, mobile, email, district, state, pincode, verified) values
-- ('00000000-0000-0000-0000-000000000001','writer','roy',23,'male','1234567890','roy123@gmail.com','Bhopal','Madhya Pradesh','462001', true);
-- ('00000000-0000-0000-0000-000000000002','disabled','vikas',23,'male','09575067421','vikas123@gmail.com','Bhopal','Madhya Pradesh','462001', false);
