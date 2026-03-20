import { useState, useEffect } from "react";
import { Workout } from "../types";

interface HistoryPageProps {
  onBack: () => void;
  onWorkoutDeleted: () => void;
}

export default function HistoryPage({
  onBack,
  onWorkoutDeleted,
}: HistoryPageProps) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = () => {
    const stored = localStorage.getItem("workouts");
    if (stored) {
      const parsed = JSON.parse(stored);
      setWorkouts(
        parsed.sort(
          (a: Workout, b: Workout) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      );
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this workout?")) {
      const updated = workouts.filter((w) => w.id !== id);
      setWorkouts(updated);
      localStorage.setItem("workouts", JSON.stringify(updated));
      onWorkoutDeleted();
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
        <h1 className="text-xl font-bold text-text-primary">Workout History</h1>
      </div>

      {/* Workout List */}
      {workouts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-text-secondary">No workouts logged yet</p>
          <p className="text-text-secondary text-sm">
            Start logging to see your history here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-text-primary">
                    {workout.name}
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {formatDate(workout.date)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(workout.id)}
                  className="text-red-400 hover:text-red-500 transition-colors p-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              {"sets" in workout && (
                <div className="bg-primary/10 rounded-lg p-2 text-sm">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <span className="block text-xs text-text-secondary">
                        Sets
                      </span>
                      <span className="font-semibold text-primary">
                        {workout.sets.join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-text-secondary">
                        Reps
                      </span>
                      <span className="font-semibold text-primary">
                        {workout.reps.join(", ")}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-text-secondary">
                        Weight
                      </span>
                      <span className="font-semibold text-primary">
                        {workout.weightKg.join(", ")} kg
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {"durationSeconds" in workout && (
                <div className="bg-secondary/20 rounded-lg p-2 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <span className="block text-xs text-text-secondary">
                        Duration
                      </span>
                      <span className="font-semibold text-secondary">
                        {Math.round(workout.durationSeconds / 60)} min
                      </span>
                    </div>
                    {workout.distanceMeters && (
                      <div>
                        <span className="block text-xs text-text-secondary">
                          Distance
                        </span>
                        <span className="font-semibold text-secondary">
                          {workout.distanceMeters} m
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {workout.rpe && (
                <p className="text-xs text-text-secondary mt-2">
                  RPE: {workout.rpe}/10
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Clear All */}
      {workouts.length > 0 && (
        <button
          onClick={() => {
            if (confirm("Delete all workouts? This cannot be undone.")) {
              localStorage.removeItem("workouts");
              setWorkouts([]);
              onWorkoutDeleted();
            }
          }}
          className="w-full text-red-400 hover:text-red-500 text-sm py-2 transition-colors"
        >
          Clear All History
        </button>
      )}
    </div>
  );
}
