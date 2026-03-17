import { useState, useEffect } from 'react'

interface SchedulerPageProps {
  onBack: () => void
}

interface WorkoutDay {
  day: string
  type: 'upper' | 'lower' | 'mix' | 'cardio'
  exercises: string[]
  completed: boolean
}

interface WeeklyPlan {
  daysPerWeek: number
  workouts: WorkoutDay[]
  startOfWeek: string
  weekNumber: number
  activeSet: 'setA' | 'setB' | 'setC'
}

const EXERCISE_SETS = {
  setA: {
    upper: ['Bench Press', 'Overhead Press', 'Pull Up'],
    lower: ['Squat', 'Leg Press', 'Deadlift'],
    mix: ['Bench Press', 'Cable Fly', 'Treadmill'],
    cardio: ['Treadmill', 'Cycling', 'Rowing'],
  },
  setB: {
    upper: ['Incline Bench', 'Lateral Raise', 'Lat Pulldown'],
    lower: ['Lunges', 'Leg Extension', 'Romanian Deadlift'],
    mix: ['Incline Bench', 'Tricep Dips', 'Cycling'],
    cardio: ['Elliptical', 'Swimming', 'Stair Climber'],
  },
  setC: {
    upper: ['Dumbbell Press', 'Face Pulls', 'Rows'],
    lower: ['Goblet Squat', 'Calf Raises', 'Hip Thrust'],
    mix: ['Dumbbell Press', 'Bicep Curls', 'Elliptical'],
    cardio: ['Jump Rope', 'Boxing', 'HIIT'],
  },
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function SchedulerPage({ onBack }: SchedulerPageProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [hasPlan, setHasPlan] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null)
  const [activeSet, setActiveSet] = useState<'setA' | 'setB' | 'setC'>('setA')
  const [selectedTypes, setSelectedTypes] = useState<Record<string, 'upper' | 'lower' | 'mix' | 'cardio'>>({})
  const [defaultType, setDefaultType] = useState<'upper' | 'lower' | 'mix' | 'cardio'>('upper')

  useEffect(() => {
    const saved = localStorage.getItem('weeklyPlan')
    if (saved) {
      const plan = JSON.parse(saved)
      setHasPlan(true)
      setCurrentPlan(plan)
      setActiveSet(plan.activeSet)
      const types: Record<string, 'upper' | 'lower' | 'mix' | 'cardio'> = {}
      plan.workouts.forEach((w: WorkoutDay) => {
        types[w.day] = w.type
      })
      setSelectedTypes(types)
    }
  }, [])

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        const newTypes = { ...selectedTypes }
        delete newTypes[day]
        setSelectedTypes(newTypes)
        return prev.filter(d => d !== day)
      } else {
        if (prev.length >= 7) return prev
        setSelectedTypes(prev => ({ ...prev, [day]: defaultType }))
        return [...prev, day]
      }
    })
  }

  const handleTypeChange = (day: string, type: 'upper' | 'lower' | 'mix' | 'cardio') => {
    setSelectedTypes(prev => ({ ...prev, [day]: type }))
  }

  const handleCreatePlan = () => {
    if (selectedDays.length === 0) {
      alert('Please select at least one workout day')
      return
    }

    const exerciseSet = EXERCISE_SETS[activeSet]
    const workouts: WorkoutDay[] = selectedDays.map(day => {
      const type = selectedTypes[day] || defaultType
      return {
        day,
        type,
        exercises: exerciseSet[type],
        completed: false,
      }
    })

    const today = new Date()
    const startOfWeek = getStartOfWeek(today)

    const plan: WeeklyPlan = {
      daysPerWeek: selectedDays.length,
      workouts,
      startOfWeek: startOfWeek.toISOString(),
      weekNumber: Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)),
      activeSet,
    }

    localStorage.setItem('weeklyPlan', JSON.stringify(plan))
    setCurrentPlan(plan)
    setHasPlan(true)
  }

  const handleRotate = () => {
    if (!currentPlan) return

    const sets = ['setA', 'setB', 'setC'] as const
    const currentIdx = sets.indexOf(currentPlan.activeSet)
    const nextIdx = (currentIdx + 1) % 3
    const nextSet = sets[nextIdx]

    const newExerciseSet = EXERCISE_SETS[nextSet]
    const updated = { ...currentPlan, activeSet: nextSet, weekNumber: currentPlan.weekNumber + 1 }
    updated.workouts = updated.workouts.map(workout => ({
      ...workout,
      exercises: newExerciseSet[workout.type],
    }))

    setActiveSet(nextSet)
    setCurrentPlan(updated)
    localStorage.setItem('weeklyPlan', JSON.stringify(updated))
  }

  const handleResetPlan = () => {
    if (confirm('Delete current plan and create a new one?')) {
      localStorage.removeItem('weeklyPlan')
      setHasPlan(false)
      setCurrentPlan(null)
      setSelectedDays([])
      setSelectedTypes({})
    }
  }

  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(d.setDate(diff))
  }

  const getDayOfWeek = (): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[new Date().getDay()]
  }

  const todayWorkout = currentPlan?.workouts.find(w => w.day === getDayOfWeek())

  const getSetName = (set: 'setA' | 'setB' | 'setC'): string => {
    switch (set) {
      case 'setA': return 'Set A'
      case 'setB': return 'Set B'
      case 'setC': return 'Set C'
    }
  }

  return (
    <div className="min-h-screen px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 py-2">
        <button
          onClick={onBack}
          className="text-primary hover:text-secondary transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-text-primary">
          {hasPlan ? 'Weekly Plan' : 'Create Plan'}
        </h1>
      </div>

      {hasPlan && currentPlan ? (
        <>
          {/* Current Plan */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-primary">
                  {currentPlan.daysPerWeek} Days / Week
                </h2>
                <p className="text-sm text-text-secondary">
                  Exercise Set: {getSetName(currentPlan.activeSet)}
                </p>
              </div>
              <button
                onClick={handleResetPlan}
                className="text-red-400 hover:text-red-500 text-sm"
              >
                New Plan
              </button>
            </div>

            {/* Today's Workout */}
            {todayWorkout && (
              <div className="bg-primary/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💪</span>
                  <div>
                    <p className="text-xs text-text-secondary">Today</p>
                    <p className="font-semibold text-primary">{todayWorkout.day}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {todayWorkout.exercises.map((ex, idx) => (
                    <div key={idx} className="text-sm text-text-primary">
                      • {ex}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Schedule */}
            <div className="space-y-2">
              {DAYS_OF_WEEK.map((day) => {
                const workout = currentPlan.workouts.find(w => w.day === day)
                const isToday = day === getDayOfWeek()

                if (!workout) {
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-lg border-2 ${
                        isToday ? 'border-gray-200 bg-gray-50' : 'border-transparent'
                      }`}
                    >
                      <p className="text-sm text-text-secondary opacity-60">{day} - Rest Day</p>
                    </div>
                  )
                }

                return (
                  <div
                    key={day}
                    className={`p-3 rounded-lg border-2 ${
                      isToday
                        ? 'border-primary bg-primary/5'
                        : workout.completed
                        ? 'border-green-400 bg-green-50'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{day}</p>
                        <p className="text-xs text-text-secondary">
                          {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}: {workout.exercises.join(', ')}
                        </p>
                      </div>
                      {isToday ? (
                        <span className="text-xs text-primary font-medium">Today</span>
                      ) : (
                        <button
                          onClick={() => {
                            const updated = { ...currentPlan }
                            const idx = updated.workouts.findIndex(w => w.day === day)
                            if (idx !== -1) {
                              updated.workouts[idx].completed = !workout.completed
                              setCurrentPlan(updated)
                              localStorage.setItem('weeklyPlan', JSON.stringify(updated))
                            }
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            workout.completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300'
                          }`}
                        >
                          {workout.completed && <span>✓</span>}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Rotate Button */}
            <button
              onClick={handleRotate}
              className="w-full mt-4 bg-accent hover:bg-accent/80 text-text-primary font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="text-xl">🔄</span>
              <span>Rotate Exercises</span>
            </button>
          </div>

          {/* Quick Log */}
          {todayWorkout && (
            <button
              className="w-full bg-primary hover:bg-secondary text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="text-xl">🏋️</span>
              <span>Log Today's Workout</span>
            </button>
          )}
        </>
      ) : (
        <>
          {/* Exercise Set Selection */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              Exercise Set
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(EXERCISE_SETS) as Array<keyof typeof EXERCISE_SETS>).map((set) => (
                <button
                  key={set}
                  onClick={() => setActiveSet(set)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    activeSet === set
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary'
                  }`}
                >
                  <div className="text-sm font-semibold">{getSetName(set)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Day Selection */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-text-primary mb-2">
              Pick Your Workout Days
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Select the days you plan to workout
            </p>

            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day)
                const selectedType = selectedTypes[day]

                return (
                  <div key={day}>
                    <button
                      onClick={() => handleDayToggle(day)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-semibold">{day}</div>
                        {isSelected && <span className="text-xs">✓</span>}
                      </div>
                    </button>

                    {isSelected && (
                      <div className="mt-2 ml-4 space-x-2">
                        {(['upper', 'lower', 'mix'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => handleTypeChange(day, type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              selectedType === type
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleCreatePlan}
              disabled={selectedDays.length === 0}
              className={`w-full mt-6 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md active:scale-95 ${
                selectedDays.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary hover:bg-secondary text-white'
              }`}
            >
              Create My Plan
            </button>
          </div>
        </>
      )}
    </div>
  )
}
