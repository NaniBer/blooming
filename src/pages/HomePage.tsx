import { useState, useEffect } from "react";
import ThemeSwitcher from "../components/ThemeSwitcher";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

type Page = "home" | "log" | "history" | "scheduler";

interface HomePageProps {
  user: any;
  onNavigate: (page: Page, editMode?: boolean) => void;
}

interface WorkoutDay {
  day: string;
  exercises: string[];
  completed: boolean;
}

interface WeeklyPlan {
  daysPerWeek: number;
  workouts: WorkoutDay[];
  startOfWeek: string;
  id: string;
}

export default function HomePage({ user, onNavigate }: HomePageProps) {
  const { user: authUser } = useAuth();
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!authUser) return;

      try {
        setLoading(true);

        // Fetch workout count
        const { count } = await supabase
          .from('workouts')
          .select('*', { count: 'exact', head: false })
          .eq('user_id', authUser.id);

        setWorkoutCount(count || 0);

        // Fetch latest weekly plan
        const { data: plans } = await supabase
          .from('ai_plans')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (plans && plans.length > 0) {
          const plan = plans[0];
          const workouts = JSON.parse(plan.exercises);

          const days = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          const today = days[new Date().getDay()];
          const workout = workouts.find((w: WorkoutDay) => w.day === today);
          setTodayWorkout(workout || null);
          setWeeklyPlan({ ...plan, workouts });
        } else {
          setWeeklyPlan(null);
          setTodayWorkout(null);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authUser]);

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
      <div className="text-center pt-20 pb-4">
        <div className="text-5xl mb-2">🌸</div>
        <h1 className="text-3xl font-bold text-primary">Blooming</h1>
        {user && <p className="text-text-secondary">Hi, {user.first_name}!</p>}
      </div>

      {/* Theme Switcher Button */}
      <button
        onClick={() => setShowThemeSwitcher(true)}
        className="fixed top-20 right-4 bg-surface border-2 border-border rounded-xl p-3 shadow-md hover:border-primary transition-all z-40"
      >
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>

      {/* Theme Switcher Modal */}
      {showThemeSwitcher && (
        <ThemeSwitcher onClose={() => setShowThemeSwitcher(false)} />
      )}

      {/* Quick Stats */}
      <div className="bg-surface rounded-2xl shadow-sm p-4">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Quick Stats
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-primary">
              {workoutCount}
            </div>
            <div className="text-xs text-text-secondary">Workouts</div>
          </div>
          <div className="bg-accent/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-accent">
              {weeklyPlan ? weeklyPlan.daysPerWeek : "—"}
            </div>
            <div className="text-xs text-text-secondary">Days/Week</div>
          </div>
        </div>
      </div>

      {/* Today's Plan */}
      <div className="bg-surface rounded-2xl shadow-sm p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
            Today's Plan
          </h2>
          <button
            onClick={() => onNavigate("scheduler", !!weeklyPlan)}
            className="text-primary text-xs font-medium hover:text-secondary transition-colors"
          >
            {weeklyPlan ? "Edit Plan" : "Create Plan"}
          </button>
        </div>

        {todayWorkout ? (
          <div className="bg-primary/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">💪</span>
              <div>
                <p className="text-xs text-text-secondary">
                  {todayWorkout.day}
                </p>
                <p className="font-semibold text-primary">
                  {todayWorkout.exercises.length} exercise
                  {todayWorkout.exercises.length !== 1 ? "s" : ""} planned
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
            <button
              onClick={() => onNavigate("log")}
              className="mt-3 w-full bg-primary hover:bg-secondary text-white font-medium py-2 px-4 rounded-lg text-sm transition-all"
            >
              Start Workout
            </button>
          </div>
        ) : (
          <div className="bg-secondary/20 rounded-xl p-4 text-center">
            <p className="text-text-secondary text-sm">
              {weeklyPlan
                ? "No workout scheduled for today"
                : "Create a weekly plan"}
            </p>
            <button
              onClick={() => onNavigate("log")}
              className="mt-3 bg-primary hover:bg-secondary text-white font-medium py-2 px-4 rounded-lg text-sm transition-all"
            >
              Log a Workout
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <button
          onClick={() => onNavigate("log")}
          className="w-full bg-primary hover:bg-secondary text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-xl">💪</span>
          <span>Log Workout</span>
        </button>

        <button
          onClick={() => onNavigate("history")}
          className="w-full bg-surface hover:bg-surface/80 text-text-primary font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm border border-border active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-xl">📊</span>
          <span>View History</span>
        </button>

        <button
          onClick={() => onNavigate("scheduler")}
          className="w-full bg-surface hover:bg-surface/80 text-text-primary font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-sm border border-border active:scale-95 flex items-center justify-center gap-2"
        >
          <span className="text-xl">📅</span>
          <span>Weekly Plan</span>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-text-secondary opacity-60">
          Powered by Telegram WebApp
        </p>
      </div>
    </div>
  );
}
