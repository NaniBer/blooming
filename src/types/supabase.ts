// Supabase database types

export interface Profile {
  id: string
  telegram_id: string
  username: string | null
  first_name: string | null
  last_name: string | null
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  user_id: string
  type: 'strength' | 'cardio'
  date: string
  duration_minutes: number | null
  distance_meters: number | null
  notes: string | null
  created_at: string
}

export interface StrengthExercise {
  id: string
  workout_id: string
  exercise_name: string
  sets: number[]
  reps: number[]
  weight_kg: number[]
  rpe: number | null
  created_at: string
}

export interface CardioExercise {
  id: string
  workout_id: string
  exercise_name: string
  distance_meters: number | null
  duration_seconds: number | null
  avg_heart_rate: number | null
  rpe: number | null
  created_at: string
}

export interface AIPlan {
  id: string
  user_id: string
  plan_date: string
  workout_type: string
  exercises: any
  notes: string | null
  is_completed: boolean
  created_at: string
}

export interface Tables {
  profiles: Profile
  workouts: Workout
  strength_exercises: StrengthExercise
  cardio_exercises: CardioExercise
  ai_plans: AIPlan
}
