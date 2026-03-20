import { useState } from "react";
import { Workout } from "../types";

interface LogWorkoutPageProps {
  onBack: () => void;
  onWorkoutSaved: () => void;
}

interface StrengthExerciseTemplate {
  name: string;
  sets: number[];
  reps: number[];
  weightKg: number[];
}

interface CardioExerciseTemplate {
  name: string;
  durationSeconds: number;
  distanceMeters?: number;
}

const STRENGTH_EXERCISES: StrengthExerciseTemplate[] = [
  { name: "Bench Press", sets: [3], reps: [10], weightKg: [60] },
  { name: "Squat", sets: [3], reps: [10], weightKg: [0] },
  { name: "Deadlift", sets: [3], reps: [5], weightKg: [100] },
  { name: "Overhead Press", sets: [3], reps: [8], weightKg: [70] },
  { name: "Pull Up", sets: [3], reps: [8], weightKg: [80] },
  { name: "Cable Fly", sets: [3], reps: [10], weightKg: [6] },
  { name: "Leg Press", sets: [3], reps: [8], weightKg: [90] },
];

const CARDIO_EXERCISES: CardioExerciseTemplate[] = [
  { name: "Treadmill", durationSeconds: 1800, distanceMeters: 3000 },
  { name: "Cycling", durationSeconds: 2400, distanceMeters: 12000 },
  { name: "Elliptical", durationSeconds: 1500 },
  { name: "Rowing", durationSeconds: 1200, distanceMeters: 2000 },
  { name: "Stair Climber", durationSeconds: 1200 },
  { name: "Swimming", durationSeconds: 900, distanceMeters: 500 },
];

type WorkoutType = "strength" | "cardio";

export default function LogWorkoutPage({
  onBack,
  onWorkoutSaved,
}: LogWorkoutPageProps) {
  const [workoutType, setWorkoutType] = useState<WorkoutType>("strength");
  const [selectedStrengthExercise, setSelectedStrengthExercise] =
    useState<StrengthExerciseTemplate>(STRENGTH_EXERCISES[0]!);
  const [selectedCardioExercise, setSelectedCardioExercise] =
    useState<CardioExerciseTemplate>(CARDIO_EXERCISES[0]!);
  const [customMode, setCustomMode] = useState(false);
  const [customWeight, setCustomWeight] = useState(60);
  const [customDuration, setCustomDuration] = useState(30);
  const [customDistance, setCustomDistance] = useState(0);
  const [rpe, setRpe] = useState(5);

  const handleSubmit = () => {
    let workout: Workout;

    if (workoutType === "strength") {
      workout = {
        id: Date.now().toString(),
        name: selectedStrengthExercise.name,
        sets: selectedStrengthExercise.sets,
        reps: selectedStrengthExercise.reps,
        weightKg: customMode
          ? [customWeight]
          : selectedStrengthExercise.weightKg,
        rpe,
        date: new Date(),
      };
    } else {
      workout = {
        id: Date.now().toString(),
        name: selectedCardioExercise.name,
        durationSeconds: customMode
          ? customDuration * 60
          : selectedCardioExercise.durationSeconds,
        distanceMeters:
          customMode && customDistance > 0
            ? customDistance * 1000
            : selectedCardioExercise.distanceMeters,
        rpe,
        date: new Date(),
      };
    }

    const existing = localStorage.getItem("workouts");
    const workouts = existing ? JSON.parse(existing) : [];
    workouts.push(workout);
    localStorage.setItem("workouts", JSON.stringify(workouts));

    onWorkoutSaved();
    onBack();
  };

  const exercises =
    workoutType === "strength" ? STRENGTH_EXERCISES : CARDIO_EXERCISES;
  const selectedExercise =
    workoutType === "strength"
      ? selectedStrengthExercise
      : selectedCardioExercise;

  return (
    <div className="min-h-screen px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pt-20 pb-4">
        <button
          onClick={onBack}
          className="text-primary hover:text-secondary transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-text-primary">Log Workout</h1>
      </div>

      {/* Workout Type Toggle */}
      <div className="flex bg-surface/50 rounded-xl p-1">
        <button
          onClick={() => {
            setWorkoutType("strength");
            setCustomMode(false);
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            workoutType === "strength"
              ? "bg-surface text-primary shadow-sm"
              : "text-text-secondary"
          }`}
        >
          💪 Strength
        </button>
        <button
          onClick={() => {
            setWorkoutType("cardio");
            setCustomMode(false);
          }}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            workoutType === "cardio"
              ? "bg-surface text-primary shadow-sm"
              : "text-text-secondary"
          }`}
        >
          🏃 Cardio
        </button>
      </div>

      {/* Quick Add */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Quick Add
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {exercises.map((exercise, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (workoutType === "strength") {
                  setSelectedStrengthExercise(
                    exercise as StrengthExerciseTemplate,
                  );
                } else {
                  setSelectedCardioExercise(exercise as CardioExerciseTemplate);
                }
              }}
              className={`p-4 rounded-xl border-2 transition-all active:scale-95 hover:scale-100 ${
                selectedExercise === exercise
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary"
              }`}
            >
              <div className="text-sm font-semibold">{exercise.name}</div>
              {workoutType === "strength" && "sets" in exercise && (
                <div className="text-xs text-text-secondary opacity-70">
                  {exercise.sets.join("x")} × {exercise.reps.join("x")}
                </div>
              )}
              {workoutType === "cardio" && "durationSeconds" in exercise && (
                <div className="text-xs text-text-secondary opacity-70">
                  {Math.round(exercise.durationSeconds / 60)} min
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Customize */}
      <div className="mb-4">
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={customMode}
            onChange={(e) => setCustomMode(e.target.checked)}
            className="w-4 h-4 cursor-pointer"
          />
          <span className="text-sm text-text-secondary">
            {workoutType === "strength"
              ? "Custom weight"
              : "Custom duration/distance"}
          </span>
        </label>

        {customMode && (
          <div className="space-y-2">
            {workoutType === "strength" ? (
              <input
                type="number"
                value={customWeight}
                onChange={(e) => setCustomWeight(parseFloat(e.target.value))}
                placeholder="Weight (kg)"
                step="0.5"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
              />
            ) : (
              <>
                <input
                  type="number"
                  value={customDuration}
                  onChange={(e) =>
                    setCustomDuration(parseFloat(e.target.value))
                  }
                  placeholder="Duration (minutes)"
                  step="1"
                  min="1"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
                />
                <input
                  type="number"
                  value={customDistance}
                  onChange={(e) =>
                    setCustomDistance(parseFloat(e.target.value))
                  }
                  placeholder="Distance (km) - optional"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
                />
              </>
            )}
          </div>
        )}

        {/* RPE Slider */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex-1">
            <label className="text-xs text-text-secondary">RPE</label>
            <input
              type="range"
              min="1"
              max="10"
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value))}
              className="w-full h-2 bg-surface/50 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
          <div className="text-xs text-text-secondary flex items-center gap-1">
            <span>Easy</span>
            <span>Hard</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-primary hover:bg-secondary text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2"
      >
        <span className="text-xl">✓</span>
        <span>Save Workout</span>
      </button>
    </div>
  );
}
