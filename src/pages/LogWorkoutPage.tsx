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
  inclination?: number;
  pace?: number;
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
  { name: "Treadmill", durationSeconds: 1800, distanceMeters: 3000, inclination: 0, pace: 6 },
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
  const [editMode, setEditMode] = useState(false);
  const [cardioEditMode, setCardioEditMode] = useState(false);
  const [customExerciseSettings, setCustomExerciseSettings] = useState<Record<string, { sets: number; reps: number; weight: number }>>(() => {
    const saved = localStorage.getItem("customExerciseSettings");
    return saved ? JSON.parse(saved) : {};
  });
  const [customCardioSettings, setCustomCardioSettings] = useState<Record<string, { duration: number; distance: number; inclination?: number; pace?: number }>>(() => {
    const saved = localStorage.getItem("customCardioSettings");
    return saved ? JSON.parse(saved) : {};
  });

  const initialSettings = customExerciseSettings[STRENGTH_EXERCISES[0]!.name] || {
    sets: STRENGTH_EXERCISES[0]!.sets.length,
    reps: STRENGTH_EXERCISES[0]!.reps[0],
    weight: STRENGTH_EXERCISES[0]!.weightKg[0],
  };

  const [editingSets, setEditingSets] = useState(initialSettings.sets);
  const [editingReps, setEditingReps] = useState(initialSettings.reps);
  const [editingWeight, setEditingWeight] = useState(initialSettings.weight);

  const customSettings = customExerciseSettings[selectedStrengthExercise.name];
  const hasCustomSettings = customSettings !== undefined;

  const initialCardioSettings = customCardioSettings[CARDIO_EXERCISES[0]!.name] || {
    duration: CARDIO_EXERCISES[0]!.durationSeconds / 60,
    distance: CARDIO_EXERCISES[0]!.distanceMeters ? CARDIO_EXERCISES[0]!.distanceMeters / 1000 : 0,
    inclination: CARDIO_EXERCISES[0]!.inclination,
    pace: CARDIO_EXERCISES[0]!.pace,
  };

  const [editingDuration, setEditingDuration] = useState(initialCardioSettings.duration);
  const [editingDistance, setEditingDistance] = useState(initialCardioSettings.distance);
  const [editingInclination, setEditingInclination] = useState(initialCardioSettings.inclination ?? 0);
  const [editingPace, setEditingPace] = useState(initialCardioSettings.pace ?? 0);

  const cardioCustomSettings = customCardioSettings[selectedCardioExercise.name];
  const hasCardioCustomSettings = cardioCustomSettings !== undefined;

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
            sets: customMode ? Array(editingSets).fill(editingSets) : selectedStrengthExercise.sets,
            reps: customMode ? Array(editingSets).fill(editingReps) : selectedStrengthExercise.reps,
            weightKg: customMode ? Array(editingSets).fill(editingWeight) : selectedStrengthExercise.weightKg,
            date: new Date(),
          };
        } else {
          workout = {
            id: Date.now().toString(),
            name: selectedCardioExercise.name,
            durationSeconds: customMode
              ? editingDuration * 60
              : selectedCardioExercise.durationSeconds,
            distanceMeters:
              customMode && editingDistance > 0
                ? editingDistance * 1000
                : selectedCardioExercise.distanceMeters,
            inclination: selectedCardioExercise.name === "Treadmill" 
              ? (customMode || hasCardioCustomSettings ? editingInclination : selectedCardioExercise.inclination)
              : undefined,
            pace: selectedCardioExercise.name === "Treadmill"
              ? (customMode || hasCardioCustomSettings ? editingPace : selectedCardioExercise.pace)
              : undefined,
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
          duration_minutes: customMode
            ? editingDuration
            : Math.round(selectedCardioExercise.durationSeconds / 60),
          distance_meters:
            customMode && editingDistance > 0
              ? editingDistance * 1000
              : selectedCardioExercise.distanceMeters || null,
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
            sets: customMode
              ? Array(editingSets).fill(editingSets)
              : selectedStrengthExercise.sets,
            reps: customMode ? Array(editingSets).fill(editingReps) : selectedStrengthExercise.reps,
            weight_kg: customMode
              ? Array(editingSets).fill(editingWeight)
              : selectedStrengthExercise.weightKg,
          });

        if (exercisesError) throw exercisesError;
      } else {
        const { error: exercisesError } = await supabase
          .from("cardio_exercises")
          .insert({
            workout_id: workout.id,
            exercise_name: selectedCardioExercise.name,
            distance_meters:
              customMode && editingDistance > 0
                ? editingDistance * 1000
                : selectedCardioExercise.distanceMeters || null,
            duration_seconds: customMode
              ? editingDuration * 60
              : selectedCardioExercise.durationSeconds,
            avg_heart_rate: null,
            inclination: selectedCardioExercise.name === "Treadmill"
              ? (customMode || hasCardioCustomSettings ? editingInclination : selectedCardioExercise.inclination) || null
              : null,
            pace: selectedCardioExercise.name === "Treadmill"
              ? (customMode || hasCardioCustomSettings ? editingPace : selectedCardioExercise.pace) || null
              : null,
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
            setEditMode(false);
            setCardioEditMode(false);
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
            setEditMode(false);
            setCardioEditMode(false);
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
                setEditMode(false);
                setCardioEditMode(false);
                if (workoutType === "strength") {
                  const strengthEx = exercise as StrengthExerciseTemplate;
                  setSelectedStrengthExercise(strengthEx);
                  const customSettings = customExerciseSettings[strengthEx.name];
                  setEditingSets(customSettings?.sets ?? strengthEx.sets.length);
                  setEditingReps(customSettings?.reps ?? strengthEx.reps[0]);
                  setEditingWeight(customSettings?.weight ?? strengthEx.weightKg[0]);
                } else {
                  const cardioEx = exercise as CardioExerciseTemplate;
                  setSelectedCardioExercise(cardioEx);
                  const customSettings = customCardioSettings[cardioEx.name];
                  setEditingDuration(customSettings?.duration ?? cardioEx.durationSeconds / 60);
                  setEditingDistance(customSettings?.distance ?? (cardioEx.distanceMeters ? cardioEx.distanceMeters / 1000 : 0));
                  setEditingInclination(customSettings?.inclination ?? cardioEx.inclination ?? 0);
                  setEditingPace(customSettings?.pace ?? cardioEx.pace ?? 0);
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

      </div>

      <div className="bg-surface rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-text-primary mb-4">
          Workout Preview
        </h2>
        <div className="space-y-4">
          {workoutType === "strength" ? (
            <>
              <div className="text-center mb-3">
                <h3 className="text-xl font-bold text-primary">
                  {selectedStrengthExercise.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {editMode ? (
                  <>
                    <div className="bg-primary/20 rounded-xl p-4">
                      <div className="text-xs text-text-secondary uppercase tracking-wide mb-2">
                        Sets
                      </div>
                      <input
                        type="number"
                        value={editingSets}
                        onChange={(e) => setEditingSets(parseInt(e.target.value))}
                        className="w-full text-2xl font-bold text-primary bg-transparent text-center focus:outline-none"
                        min="1"
                      />
                    </div>
                    <div className="bg-accent/30 rounded-xl p-4">
                      <div className="text-xs text-text-secondary uppercase tracking-wide mb-2">
                        Reps
                      </div>
                      <input
                        type="number"
                        value={editingReps}
                        onChange={(e) => setEditingReps(parseInt(e.target.value))}
                        className="w-full text-2xl font-bold text-accent bg-transparent text-center focus:outline-none"
                        min="1"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-primary/10 rounded-xl p-4 text-center">
                      <div className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                        Sets
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {customMode || hasCustomSettings ? editingSets : selectedStrengthExercise.sets.length}
                      </div>
                    </div>
                    <div className="bg-accent/20 rounded-xl p-4 text-center">
                      <div className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                        Reps
                      </div>
                      <div className="text-2xl font-bold text-accent">
                        {customMode || hasCustomSettings ? editingReps : selectedStrengthExercise.reps[0]}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-3">
                {editMode ? (
                  <div className="bg-surface/70 rounded-lg p-3">
                    <div className="text-xs text-text-secondary mb-2">Weight</div>
                    <input
                      type="number"
                      value={editingWeight}
                      onChange={(e) => setEditingWeight(parseFloat(e.target.value))}
                      className="w-full font-semibold text-text-primary bg-transparent text-center focus:outline-none"
                      step="0.5"
                    />
                  </div>
                ) : (
                  <div className="bg-surface/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-text-secondary">Weight</div>
                    <div className="font-semibold text-text-primary">
                      {customMode || hasCustomSettings
                        ? editingWeight
                        : selectedStrengthExercise.weightKg[0]}
                      kg
                    </div>
                  </div>
                )}
                <div className="bg-surface/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-text-secondary">Total Reps</div>
                  <div className="font-semibold text-text-primary">
                    {customMode || hasCustomSettings
                      ? editingSets * editingReps
                      : selectedStrengthExercise.reps.reduce(
                          (a, b) => a + b,
                          0,
                        )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (editMode) {
                    setCustomMode(true);
                    setCustomWeight(editingWeight);
                    const newSettings = {
                      ...customExerciseSettings,
                      [selectedStrengthExercise.name]: {
                        sets: editingSets,
                        reps: editingReps,
                        weight: editingWeight,
                      },
                    };
                    setCustomExerciseSettings(newSettings);
                    localStorage.setItem("customExerciseSettings", JSON.stringify(newSettings));
                  }
                  setEditMode(!editMode);
                }}
                className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border-2 ${
                  editMode
                    ? "bg-primary text-white border-primary"
                    : "bg-surface/50 text-text-primary border-border hover:border-primary"
                }`}
              >
                {editMode ? "✓ Done" : "✏️ Edit"}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-3">
                <h3 className="text-xl font-bold text-primary">
                  {selectedCardioExercise.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {cardioEditMode ? (
                  <div className="bg-primary/20 rounded-xl p-4">
                    <div className="text-xs text-text-secondary uppercase tracking-wide mb-2">
                      Duration
                    </div>
                    <input
                      type="number"
                      value={editingDuration}
                      onChange={(e) => setEditingDuration(parseFloat(e.target.value))}
                      className="w-full text-2xl font-bold text-primary bg-transparent text-center focus:outline-none"
                      min="1"
                    />
                  </div>
                ) : (
                  <div className="bg-primary/10 rounded-xl p-4 text-center">
                    <div className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                      Duration
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {customMode || hasCardioCustomSettings
                        ? editingDuration
                        : Math.round(selectedCardioExercise.durationSeconds / 60)}
                      min
                    </div>
                  </div>
                )}
                {selectedCardioExercise.distanceMeters && (
                  cardioEditMode ? (
                    <div className="bg-accent/30 rounded-xl p-4">
                      <div className="text-xs text-text-secondary uppercase tracking-wide mb-2">
                        Distance
                      </div>
                      <input
                        type="number"
                        value={editingDistance}
                        onChange={(e) => setEditingDistance(parseFloat(e.target.value))}
                        className="w-full text-2xl font-bold text-accent bg-transparent text-center focus:outline-none"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  ) : (
                    <div className="bg-accent/20 rounded-xl p-4 text-center">
                      <div className="text-xs text-text-secondary uppercase tracking-wide mb-1">
                        Distance
                      </div>
                      <div className="text-2xl font-bold text-accent">
                        {customMode || hasCardioCustomSettings
                          ? editingDistance
                          : selectedCardioExercise.distanceMeters / 1000}
                        km
                      </div>
                    </div>
                  )
                )}
              </div>

              {selectedCardioExercise.name === "Treadmill" && (
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {cardioEditMode ? (
                    <div className="bg-surface/70 rounded-lg p-3">
                      <div className="text-xs text-text-secondary mb-2">Inclination</div>
                      <input
                        type="number"
                        value={editingInclination}
                        onChange={(e) => setEditingInclination(parseFloat(e.target.value))}
                        className="w-full font-semibold text-text-primary bg-transparent text-center focus:outline-none"
                        min="0"
                        max="15"
                        step="0.5"
                      />
                    </div>
                  ) : (
                    <div className="bg-surface/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-text-secondary">Inclination</div>
                      <div className="font-semibold text-text-primary">
                        {customMode || hasCardioCustomSettings
                          ? editingInclination
                          : selectedCardioExercise.inclination ?? 0}
                        <span className="text-text-secondary text-xs"> %</span>
                      </div>
                    </div>
                  )}
                  {cardioEditMode ? (
                    <div className="bg-surface/70 rounded-lg p-3">
                      <div className="text-xs text-text-secondary mb-2">Target Pace</div>
                      <input
                        type="number"
                        value={editingPace}
                        onChange={(e) => setEditingPace(parseFloat(e.target.value))}
                        className="w-full font-semibold text-text-primary bg-transparent text-center focus:outline-none"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  ) : (
                    <div className="bg-surface/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-text-secondary">Target Pace</div>
                      <div className="font-semibold text-text-primary">
                        {customMode || hasCardioCustomSettings
                          ? editingPace
                          : selectedCardioExercise.pace ?? 0}
                        <span className="text-text-secondary text-xs"> min/km</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-surface/50 rounded-lg p-3 text-center">
                <div className="text-xs text-text-secondary">Pace</div>
                <div className="font-semibold text-text-primary">
                  {(customMode || hasCardioCustomSettings) &&
                  selectedCardioExercise.distanceMeters &&
                  editingDistance > 0
                    ? (
                        (editingDistance * 1000) /
                        (editingDuration * 60)
                      ).toFixed(1)
                    : selectedCardioExercise.distanceMeters
                      ? (
                          (selectedCardioExercise.distanceMeters /
                            selectedCardioExercise.durationSeconds) *
                          60
                        ).toFixed(1)
                      : "-"}
                  <span className="text-text-secondary text-xs"> m/min</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (cardioEditMode) {
                    setCustomMode(true);
                    setCustomDuration(editingDuration);
                    setCustomDistance(editingDistance);
                    const newSettings = {
                      ...customCardioSettings,
                      [selectedCardioExercise.name]: {
                        duration: editingDuration,
                        distance: editingDistance,
                        inclination: selectedCardioExercise.name === "Treadmill" ? editingInclination : undefined,
                        pace: selectedCardioExercise.name === "Treadmill" ? editingPace : undefined,
                      },
                    };
                    setCustomCardioSettings(newSettings);
                    localStorage.setItem("customCardioSettings", JSON.stringify(newSettings));
                  }
                  setCardioEditMode(!cardioEditMode);
                }}
                className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border-2 ${
                  cardioEditMode
                    ? "bg-primary text-white border-primary"
                    : "bg-surface/50 text-text-primary border-border hover:border-primary"
                }`}
              >
                {cardioEditMode ? "✓ Done" : "✏️ Edit"}
              </button>
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
