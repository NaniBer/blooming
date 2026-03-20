import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface HistoryPageProps {
  onBack: () => void;
  onWorkoutDeleted: () => void;
}

export default function HistoryPage({
  onBack,
  onWorkoutDeleted,
}: HistoryPageProps) {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkouts() {
      // Fallback to localStorage if user not authenticated
      if (!user) {
        console.warn('User not authenticated, using localStorage fallback');

        const stored = localStorage.getItem("workouts");
        if (stored) {
          const parsed = JSON.parse(stored);
          setWorkouts(
            parsed.sort(
              (a: any, b: any) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
            ),
          );
        }
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch workouts with their exercises
        const { data: workouts, error } = await supabase
          .from('workouts')
          .select(`
            *,
            strength_exercises!inner (
              exercise_name,
              sets,
              reps,
              weight_kg,
              rpe
            ),
            cardio_exercises!inner (
              exercise_name,
              distance_meters,
              duration_seconds,
              rpe
            )
          `)
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        // Transform data to match expected format
        const transformed = workouts?.map(w => {
          let base = {
            id: w.id,
            date: w.date,
          };

          if (w.type === 'strength') {
            const strengthEx = w.strength_exercises?.[0] || {};
            return {
              ...base,
              name: strengthEx.exercise_name || 'Strength',
              sets: strengthEx.sets || [],
              reps: strengthEx.reps || [],
              weightKg: strengthEx.weight_kg || [],
              rpe: strengthEx.rpe,
            };
          } else {
            const cardioEx = w.cardio_exercises?.[0] || {};
            return {
              ...base,
              name: cardioEx.exercise_name || 'Cardio',
              durationSeconds: cardioEx.duration_seconds || 0,
              distanceMeters: cardioEx.distance_meters,
              rpe: cardioEx.rpe,
            };
          }
        }) || [];

        setWorkouts(transformed);
      } catch (error) {
        console.error('Error loading workouts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadWorkouts();
  }, [user]);

  const handleDelete = async (workoutId: string) => {
    if (confirm("Delete this workout?")) {
      try {
        // Try to delete from Supabase if user is authenticated
        if (user) {
          const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('id', workoutId);

          if (error) throw error;
        }

        // Always delete from localStorage
        const updated = workouts.filter(w => w.id !== workoutId);
        setWorkouts(updated);
        localStorage.setItem("workouts", JSON.stringify(updated));
        onWorkoutDeleted();
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Failed to delete workout. Please try again.');
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm("Delete all workouts? This cannot be undone.")) {
      try {
        // Try to delete from Supabase if user is authenticated
        if (user) {
          const { error } = await supabase
            .from('workouts')
            .delete()
            .eq('user_id', user.id);

          if (error) throw error;
        }

        // Always clear from localStorage
        setWorkouts([]);
        localStorage.removeItem("workouts");
        onWorkoutDeleted();
      } catch (error) {
        console.error('Error clearing workouts:', error);
        alert('Failed to clear workouts. Please try again.');
      }
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

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin text-4xl">⏳</div>
        </div>
      </div>
    );
  }

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
        <div className="bg-surface rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-text-secondary">No workouts logged yet</p>
          <p className="text-text-secondary text-sm">
            Start logging to see your history here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-surface rounded-xl shadow-sm p-4">
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
          onClick={handleClearAll}
          className="w-full text-red-400 hover:text-red-500 text-sm py-2 transition-colors"
        >
          Clear All History
        </button>
      )}
    </div>
  );
}
