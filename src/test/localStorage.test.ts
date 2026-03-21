import { describe, it, expect, beforeEach } from 'vitest'
import { clearLocalStorage } from './utils'

describe('LocalStorage Persistence', () => {
  beforeEach(() => {
    clearLocalStorage()
  })

  it('saves and retrieves custom exercise settings', () => {
    const settings = {
      'Bench Press': { sets: 4, reps: 8, weight: 65 },
      'Squat': { sets: 5, reps: 5, weight: 100 },
    }

    localStorage.setItem('customExerciseSettings', JSON.stringify(settings))

    const retrieved = JSON.parse(localStorage.getItem('customExerciseSettings') || '{}')

    expect(retrieved).toEqual(settings)
  })

  it('saves and retrieves cardio settings', () => {
    const settings = {
      'Treadmill': { duration: 30, distance: 5, inclination: 2, pace: 6 },
    }

    localStorage.setItem('customCardioSettings', JSON.stringify(settings))

    const retrieved = JSON.parse(localStorage.getItem('customCardioSettings') || '{}')

    expect(retrieved).toEqual(settings)
  })

  it('saves workout data', () => {
    const workout = {
      id: '123',
      name: 'Bench Press',
      sets: [3],
      reps: [10],
      weightKg: [60],
      date: new Date().toISOString(),
    }

    localStorage.setItem('workouts', JSON.stringify([workout]))

    const retrieved = JSON.parse(localStorage.getItem('workouts') || '[]')

    expect(retrieved).toHaveLength(1)
    expect(retrieved[0].name).toBe('Bench Press')
  })

  it('persists data across localStorage updates', () => {
    const settings = { 'Bench Press': { sets: 3, reps: 10, weight: 60 } }
    localStorage.setItem('customExerciseSettings', JSON.stringify(settings))

    const updatedSettings = { 'Bench Press': { sets: 4, reps: 8, weight: 65 } }
    localStorage.setItem('customExerciseSettings', JSON.stringify(updatedSettings))

    const retrieved = JSON.parse(localStorage.getItem('customExerciseSettings') || '{}')

    expect(retrieved['Bench Press'].sets).toBe(4)
    expect(retrieved['Bench Press'].reps).toBe(8)
  })
})
