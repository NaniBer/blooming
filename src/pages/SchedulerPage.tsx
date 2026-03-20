import { useState, useEffect } from "react";

interface SchedulerPageProps {
  onBack: () => void;
  editMode?: boolean;
}

interface WorkoutDay {
  day: string;
  type: "upper" | "lower" | "fullBody" | "cardio";
  exercises: string[];
  completed: boolean;
}

interface WeeklyPlan {
  daysPerWeek: number;
  workouts: WorkoutDay[];
  startOfWeek: string;
  weekNumber: number;
}

const EXERCISES = {
  upper: ["Bench Press", "Overhead Press", "Pull Up"],
  lower: ["Squat", "Leg Press", "Deadlift"],
  fullBody: ["Squat", "Bench Press", "Row"],
  cardio: ["Treadmill", "Cycling", "Rowing"],
};

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function SchedulerPage({ onBack, editMode = false }: SchedulerPageProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [hasPlan, setHasPlan] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<WeeklyPlan | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<
    Record<string, "upper" | "lower" | "fullBody" | "cardio">
  >({});
  const [isEditing, setIsEditing] = useState(editMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isLocalEdit, setIsLocalEdit] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("weeklyPlan");
    if (saved) {
      const plan = JSON.parse(saved);
      setHasPlan(true);
      setCurrentPlan(plan);
      const types: Record<string, "upper" | "lower" | "fullBody" | "cardio"> =
        {};
      plan.workouts.forEach((w: any) => {
        types[w.day] = w.type === "mix" ? "fullBody" : w.type;
      });
      setSelectedTypes(types);

      // If edit mode is enabled, pre-fill the form
      if (editMode) {
        const days = plan.workouts.map((w: any) => w.day);
        setSelectedDays(days);
        setIsEditing(true);
      }
    }
  }, [editMode]);

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(day)) {
        const newTypes = { ...selectedTypes };
        delete newTypes[day];
        setSelectedTypes(newTypes);
        return prev.filter((d) => d !== day);
      } else {
        if (prev.length >= 7) return prev;
        setSelectedTypes((prev) => ({ ...prev, [day]: "upper" }));
        return [...prev, day];
      }
    });
  };

  const handleTypeChange = (
    day: string,
    type: "upper" | "lower" | "fullBody" | "cardio",
  ) => {
    setSelectedTypes((prev) => ({ ...prev, [day]: type }));
  };

  const handleCreatePlan = () => {
    if (selectedDays.length === 0) {
      alert("Please select at least one workout day");
      return;
    }

    setIsSaving(true);

    const workouts: WorkoutDay[] = selectedDays.map((day) => {
      const type = selectedTypes[day] || "upper";
      return {
        day,
        type,
        exercises: EXERCISES[type],
        completed: false,
      };
    });

    const today = new Date();
    const startOfWeek = getStartOfWeek(today);

    const plan: WeeklyPlan = {
      daysPerWeek: selectedDays.length,
      workouts,
      startOfWeek: startOfWeek.toISOString(),
      weekNumber: Math.floor(
        (today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) /
          (7 * 24 * 60 * 60 * 1000),
      ),
    };

    localStorage.setItem("weeklyPlan", JSON.stringify(plan));
    setCurrentPlan(plan);
    setHasPlan(true);
    setIsSaving(false);

    const message = isEditing ? "✅ Plan edited successfully!" : "✅ Plan created successfully!";
    alert(message);

    setTimeout(() => {
      setIsEditing(false);
      if (isLocalEdit) {
        setIsLocalEdit(false);
      } else {
        onBack();
      }
    }, 50);
  };

  const handleResetPlan = () => {
    if (confirm("Delete current plan and create a new one?")) {
      localStorage.removeItem("weeklyPlan");
      setHasPlan(false);
      setCurrentPlan(null);
      setSelectedDays([]);
      setSelectedTypes({});
      setIsEditing(false);
    }
  };

  const handleStartEdit = () => {
    if (currentPlan) {
      const days = currentPlan.workouts.map(w => w.day);
      const types: Record<string, "upper" | "lower" | "fullBody" | "cardio"> = {};
      currentPlan.workouts.forEach(w => {
        types[w.day] = w.type;
      });
      setSelectedDays(days);
      setSelectedTypes(types);
      setIsEditing(true);
      setIsLocalEdit(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedDays([]);
    setIsLocalEdit(false);
  };

  const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getDayOfWeek = (): string => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[new Date().getDay()];
  };

  const todayWorkout = currentPlan?.workouts.find(
    (w) => w.day === getDayOfWeek(),
  );

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
        <h1 className="text-xl font-bold text-text-primary">
          {isEditing ? "Edit Plan" : hasPlan ? "Weekly Plan" : "Create Plan"}
        </h1>
      </div>

      {hasPlan && currentPlan && !isEditing ? (
        <>
          {/* Current Plan */}
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary">
                {currentPlan.daysPerWeek} Days / Week
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleStartEdit}
                  className="text-primary text-sm hover:text-secondary"
                >
                  Edit
                </button>
                <button
                  onClick={handleResetPlan}
                  className="text-red-400 hover:text-red-500 text-sm"
                >
                  New
                </button>
              </div>
            </div>

            {/* Today's Workout */}
            {todayWorkout && (
              <div className="bg-primary/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💪</span>
                  <div>
                    <p className="text-xs text-text-secondary">Today</p>
                    <p className="font-semibold text-primary">
                      {todayWorkout.day}
                    </p>
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
                const workout = currentPlan.workouts.find((w) => w.day === day);
                const isToday = day === getDayOfWeek();

                if (!workout) {
                  return (
                    <div
                      key={day}
                      className={`p-3 rounded-lg border-2 ${
                        isToday
                          ? "border-gray-200 bg-gray-50"
                          : "border-transparent"
                      }`}
                    >
                      <p className="text-sm text-text-secondary opacity-60">
                        {day} - Rest Day
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={day}
                    className={`p-3 rounded-lg border-2 ${
                      isToday
                        ? "border-primary bg-primary/5"
                        : workout.completed
                          ? "border-green-400 bg-green-50"
                          : "border-border"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{day}</p>
                        <p className="text-xs text-text-secondary">
                          {workout.type.charAt(0).toUpperCase() +
                            workout.type.slice(1)}
                          : {workout.exercises.join(", ")}
                        </p>
                      </div>
                      {isToday ? (
                        <span className="text-xs text-primary font-medium">
                          Today
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            const updated = { ...currentPlan };
                            const idx = updated.workouts.findIndex(
                              (w) => w.day === day,
                            );
                            if (idx !== -1) {
                              updated.workouts[idx].completed =
                                !workout.completed;
                              setCurrentPlan(updated);
                              localStorage.setItem(
                                "weeklyPlan",
                                JSON.stringify(updated),
                              );
                            }
                          }}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            workout.completed
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {workout.completed && <span>✓</span>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Log */}
          {todayWorkout && (
            <button className="w-full bg-primary hover:bg-secondary text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2">
              <span className="text-xl">🏋️</span>
              <span>Log Today's Workout</span>
            </button>
          )}
        </>
      ) : (
        <>
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
                const isSelected = selectedDays.includes(day);
                const selectedType = selectedTypes[day];

                return (
                  <div key={day}>
                    <button
                      onClick={() => handleDayToggle(day)}
                      className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-semibold">{day}</div>
                        {isSelected && <span className="text-xs">✓</span>}
                      </div>
                    </button>

                    {isSelected && (
                      <div className="mt-2 ml-4 flex flex-wrap gap-2">
                        {(
                          ["upper", "lower", "fullBody", "cardio"] as const
                        ).map((type) => (
                          <button
                            key={type}
                            onClick={() => handleTypeChange(day, type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              selectedType === type
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                            }`}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 mt-6">
              {isEditing && (
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-text-primary font-semibold py-4 px-6 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleCreatePlan}
                disabled={selectedDays.length === 0 || isSaving}
                className={`flex-1 font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                  selectedDays.length === 0 || isSaving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-primary hover:bg-secondary text-white"
                }`}
              >
                {isSaving ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEditing ? "Save Changes" : "Create My Plan"}</span>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
