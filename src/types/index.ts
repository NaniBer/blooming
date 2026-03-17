export interface StrengthExercise {
  id: string
  name: string
  sets: number[]
  reps: number[]
  weightKg: number[]
  rpe?: number
  date: Date
}

export interface CardioExercise {
  id: string
  name: string
  durationSeconds: number
  distanceMeters?: number
  avgHeartRate?: number
  rpe?: number
  date: Date
}

export type Workout = StrengthExercise | CardioExercise

export type WorkoutType = 'strength' | 'cardio'

export interface WorkoutSummary {
  id: string
  type: WorkoutType
  date: Date
  exerciseName: string
  details: string
}
