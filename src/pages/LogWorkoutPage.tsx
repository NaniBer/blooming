import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

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
  { name: "Row", sets: [3], reps: [10], weightKg: [50] },
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
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSubmit = async () => {
    setIsSaving(true);

    try {
      if (!user) {
        console.warn("User not authenticated, using localStorage fallback");

        let workout: any;

        if (workoutType === "strength") {
          workout = {
            id: Date.now().toString(),
            name: selectedStrengthExercise.name,
            sets: customMode ? [customWeight, customWeight, customWeight] : selectedStrengthExercise.sets,
            reps: customMode ? [10, 10, 10] : selectedStrengthExercise.reps,
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
        return;
      }

      let workoutData: any;

      if (workoutType === "strength") {
        workoutData = {
          user_id: user.id,
          type: "strength",
          date: new Date().toISOString().split("T")[0],
          duration_minutes: null,
          distance_meters: null,
          notes: null,
        };
      } else {
        workoutData = {
          user_id: user.id,
          type: "cardio",
          date: new Date().toISOString().split("T")[0],
          duration_minutes: customMode ? customDuration : Math.round(selectedCardioExercise.durationSeconds / 60),
          distance_meters: customMode && customDistance > 0 ? customDistance * 1000 : selectedCardioExercise.distanceMeters || null,
          notes: null,
        };
      }

      const { data: workout, error: workoutError } = await supabase
        .from("workouts")
        .insert(workoutData)
        .select()
        .single();

      if (workoutError) throw workoutError;

      if (workoutType === "strength") {
        const { error: exercisesError } = await supabase
          .from("strength_exercises")
          .insert({
            workout_id: workout.id,
            exercise_name: selectedStrengthExercise.name,
            sets: customMode ? [customWeight, customWeight, customWeight] : selectedStrengthExercise.sets,
            reps: customMode ? [10, 10, 10] : selectedStrengthExercise.reps,
            weight_kg: customMode ? [customWeight, customWeight, customWeight] : selectedStrengthExercise.weightKg,
            rpe: rpe,
          });

        if (exercisesError) throw exercisesError;
      } else {
        const { error: exercisesError } = await supabase
          .from("cardio_exercises")
          .insert({
            workout_id: workout.id,
            exercise_name: selectedCardioExercise.name,
            distance_meters: customMode && customDistance > 0 ? customDistance * 1000 : selectedCardioExercise.distanceMeters || null,
            duration_seconds: customMode ? customDuration * 60 : selectedCardioExercise.durationSeconds,
            avg_heart_rate: null,
            rpe: rpe,
          });

        if (exercisesError) throw exercisesError;
      }

      onWorkoutSaved();
      onBack();
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const exercises =
    workoutType === "strength" ? STRENGTH_EXERCISES : CARDIO_EXERCISES;
  const selectedExercise =
    workoutType === "strength"
      ? selectedStrengthExercise
      : selectedCardioExercise;

  return (
    <div className="min-h-screen px-4 py-6 space-y-6">
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

      <div className="bg-surface rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Workout Preview
        </h2>
        <div className="space-y-4">
          {workoutType === "strength" ? (
            <>
              <div className="bg-primary/10 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">💪</div>
                  <h3 className="text-xl font-bold text-primary">
                    {selectedStrengthExercise.name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Sets</p>
                  <p className="text-3xl font-bold text-primary">
                    {customMode ? 3 : selectedStrengthExercise.sets.length}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Reps</p>
                  <p className="text-3xl font-bold text-primary">
                    {customMode ? 10 : selectedStrengthExercise.reps[0]}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Weight</p>
                  <p className="text-3xl font-bold text-primary">
                    {customMode ? customWeight : selectedStrengthExercise.weightKg[0]}
                    <span className="text-lg text-text-secondary"> kg</span>
                  </p>
                </div>
              </div>

              <div className="bg-accent/20 rounded-lg p-3 mt-3">
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div>
                    <span className="text-text-secondary">Total Sets:</span>
                    <span className="font-semibold ml-1">
                      {customMode ? 3 : selectedStrengthExercise.sets.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Total Reps:</span>
                    <span className="font-semibold ml-1">
                      {customMode ? 30 : selectedStrengthExercise.sets.reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">RPE:</span>
                    <span className="font-semibold ml-1">
                      {rpe}/10
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-primary/10 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-3xl mb-2">🏃</div>
                  <h3 className="text-xl font-bold text-primary">
                    {selectedCardioExercise.name}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xs text-text-secondary mb-1">Duration</p>
                  <p className="text-3xl font-bold text-primary">
                    {customMode ? customDuration : Math.round(selectedCardioExercise.durationSeconds / 60)}
                    <span className="text-lg text-text-secondary"> min</span>
                  </p>
                </div>
                {selectedCardioExercise.distanceMeters && (
                  <div className="text-center">
                    <p className="text-xs text-text-secondary mb-1">Distance</p>
                    <p className="text-3xl font-bold text-primary">
                      {customMode && customDistance > 0 ? customDistance : selectedCardioExercise.distanceMeters / 1000}
                      <span className="text-lg text-text-secondary"> km</span>
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-accent/20 rounded-lg p-3 mt-3">
                <div className="grid grid-cols-2 gap-2 text-center text-sm">
                  <div>
                    <span className="text-text-secondary">RPE:</span>
                    <span className="font-semibold ml-1">
                      {rpe}/10
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary">Pace:</span>
                    <span className="font-semibold ml-1">
                      {customMode && selectedCardioExercise.distanceMeters && customDistance > 0
                        ? (customDistance * 1000 / (customDuration * 60)).toFixed(1)
                        : selectedCardioExercise.distanceMeters
                          ? (selectedCardioExercise.distanceMeters / selectedCardioExercise.durationSeconds * 60).toFixed(1)
                          : "-"}
                    </span>
                    <span className="text-text-secondary"> m/min</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSaving}
        className="w-full bg-primary hover:bg-secondary text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span className="text-xl">✓</span>
            <span>Save Workout</span>
          </>
        )}
      </button>
    </div>
  );
}
