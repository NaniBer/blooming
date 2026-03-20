import { useState, useEffect } from "react";
import ThemeSwitcher from "../components/ThemeSwitcher";

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
}

export default function HomePage({ user, onNavigate }: HomePageProps) {
  const [showThemeSwitcher, setShowThemeSwitcher] = useState(false);
  const [workoutCount] = useState(() => {
    const workouts = localStorage.getItem("workouts");
    return workouts ? JSON.parse(workouts).length : 0;
  });

  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [todayWorkout, setTodayWorkout] = useState<WorkoutDay | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("weeklyPlan");
    if (saved) {
      const plan = JSON.parse(saved);
      setWeeklyPlan(plan);

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
      const workout = plan.workouts.find((w: WorkoutDay) => w.day === today);
      setTodayWorkout(workout || null);
    }
  }, []);

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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
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
