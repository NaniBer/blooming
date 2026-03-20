-- Supabase Database Schema for Blooming
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  telegram_id VARCHAR UNIQUE NOT NULL,
  username VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN ('strength', 'cardio')),
  date DATE NOT NULL,
  duration_minutes INTEGER,
  distance_meters INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS on workouts
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workouts"
  ON workouts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workouts"
  ON workouts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts"
  ON workouts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts"
  ON workouts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Strength exercises table
CREATE TABLE IF NOT EXISTS strength_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name VARCHAR NOT NULL,
  sets INTEGER[],
  reps INTEGER[],
  weight_kg REAL[],
  rpe INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS on strength_exercises
ALTER TABLE strength_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strength exercises"
  ON strength_exercises
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workouts
    WHERE workouts.id = strength_exercises.workout_id
    AND workouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own strength exercises"
  ON strength_exercises
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workouts
    WHERE workouts.id = strength_exercises.workout_id
    AND workouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own strength exercises"
  ON strength_exercises
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workouts
    WHERE workouts.id = strength_exercises.workout_id
    AND workouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own strength exercises"
  ON strength_exercises
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workouts
    WHERE workouts.id = strength_exercises.workout_id
    AND workouts.user_id = auth.uid()
  ));

-- Cardio exercises table
CREATE TABLE IF NOT EXISTS cardio_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_name VARCHAR NOT NULL,
  distance_meters INTEGER,
  duration_seconds INTEGER,
  avg_heart_rate INTEGER,
  rpe INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS on cardio_exercises
ALTER TABLE cardio_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cardio exercises"
  ON cardio_exercises
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM workouts
    WHERE workouts.id = cardio_exercises.workout_id
    AND workouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own cardio exercises"
  ON cardio_exercises
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM workouts
    WHERE workouts.id = cardio_exercises.workout_id
    AND workouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own cardio exercises"
  ON cardio_exercises
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM workouts
    WHERE workouts.id = cardio_exercises.workout_id
    AND workouts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own cardio exercises"
  ON cardio_exercises
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM workouts
    WHERE workouts.id = cardio_exercises.workout_id
    AND workouts.user_id = auth.uid()
  ));

-- AI Plans table
CREATE TABLE IF NOT EXISTS ai_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  workout_type VARCHAR NOT NULL,
  exercises JSONB NOT NULL,
  notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS on ai_plans
ALTER TABLE ai_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans"
  ON ai_plans
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON ai_plans
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON ai_plans
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON ai_plans
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_date ON workouts(date);
CREATE INDEX IF NOT EXISTS idx_strength_exercises_workout_id ON strength_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_cardio_exercises_workout_id ON cardio_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_ai_plans_user_id ON ai_plans(user_id, plan_date);
