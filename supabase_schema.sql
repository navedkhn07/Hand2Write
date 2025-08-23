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
  verified boolean default false
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
  status text
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp default now(),
  student_id uuid references profiles(id),
  writer_id uuid references profiles(id),
  exam_id uuid references exam_info(id),
  status text default 'pending'
);

-- Sample seed (replace ids with real auth user ids after signup)
-- insert into profiles (id, user_type, name, age, gender, mobile, email, district, state, pincode, verified) values
-- ('00000000-0000-0000-0000-000000000001','writer','roy',23,'male','1234567890','roy123@gmail.com','Bhopal','Madhya Pradesh','462001', true);
-- ('00000000-0000-0000-0000-000000000002','disabled','vikas',23,'male','09575067421','vikas123@gmail.com','Bhopal','Madhya Pradesh','462001', false);
