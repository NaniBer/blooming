# Blooming Fitness App - Testing Guide

## Automated Tests

Run the automated test suite:

```bash
# Run all tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Manual Testing Checklist

Use this checklist to verify all features work correctly before deploying to production.

### 1. Home Page
- [ ] App loads successfully
- [ ] All navigation buttons work (Home, Log, History, Scheduler)
- [ ] App bio displays correctly
- [ ] Theme switching works (if enabled)

### 2. Workout Logging - Strength
- [ ] Can navigate to Log Workout page
- [ ] Workout type selector works (Strength vs Cardio)
- [ ] Exercise list displays correctly
- [ ] Can select an exercise
- [ ] Workout preview shows correct exercise details
- [ ] Edit mode toggles correctly
- [ ] Can edit sets, reps, and weight
- [ ] Edit values persist after clicking "Done"
- [ ] Custom settings are saved to localStorage
- [ ] Custom settings load when switching exercises
- [ ] Can save workout
- [ ] Saved workout appears in history
- [ ] Back button returns to home

### 3. Workout Logging - Cardio
- [ ] Can switch to Cardio workout type
- [ ] Cardio exercise list displays correctly
- [ ] Can select treadmill exercise
- [ ] Workout preview shows duration and distance
- [ ] Edit mode works for cardio
- [ ] Can edit duration and distance
- [ ] Treadmill shows inclination and pace fields
- [ ] Can edit inclination and pace
- [ ] Cardio custom settings persist
- [ ] Can save cardio workout
- [ ] Cardio workout appears in history

### 4. History Page & Dashboard
- [ ] Can navigate to History page
- [ ] Dashboard loads with workouts
- [ ] Quick stats display correctly:
  - [ ] Total workouts count
  - [ ] Current streak (fire icon)
  - [ ] Cardio time this week
  - [ ] Weekly workout count
- [ ] Weekly activity chart displays
- [ ] Activity chart shows correct bars (strength = blue, cardio = orange)
- [ ] Current day is highlighted
- [ ] Most trained exercise shows
- [ ] Workout list displays all workouts
- [ ] Strength workouts show sets, reps, weight
- [ ] Cardio workouts show duration, distance
- [ ] Can delete individual workout
- [ ] Can clear all history
- [ ] Delete confirmation works

### 5. Data Persistence
- [ ] Custom exercise settings persist after page refresh
- [ ] Custom cardio settings persist after page refresh
- [ ] Workout history persists after page refresh
- [ ] Settings transfer between exercises correctly

### 6. Edge Cases
- [ ] App handles empty workout history gracefully
- [ ] App handles no custom settings gracefully
- [ ] Workout preview updates when switching exercises
- [ ] Dashboard handles single workout
- [ ] Dashboard handles zero workouts (new user)

### 7. UI/UX
- [ ] All buttons have proper hover states
- [ ] All inputs accept valid values
- [ ] Error messages display when appropriate
- [ ] Loading states show during operations
- [ ] Mobile responsive layout works
- [ ] Colors contrast properly
- [ ] Text is readable

### 8. Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Safari
- [ ] Works in Firefox
- [ ] Works in mobile browsers (iOS Safari, Chrome Mobile)

## Test Data Examples

Use these sample workouts for testing:

### Strength Workouts
1. **Bench Press**: 3 sets × 10 reps × 60kg
2. **Squat**: 3 sets × 8 reps × 80kg
3. **Deadlift**: 3 sets × 5 reps × 100kg
4. **Overhead Press**: 3 sets × 8 reps × 70kg
5. **Pull Up**: 3 sets × 8 reps × 80kg

### Cardio Workouts
1. **Treadmill**: 30 min × 5km, Inclination: 2%, Pace: 6 min/km
2. **Cycling**: 40 min × 12km
3. **Rowing**: 20 min × 2km

## Pre-Deployment Checklist

Before pushing to production:

- [ ] All automated tests pass
- [ ] All manual tests pass
- [ ] No console errors
- [ ] Build completes successfully
- [ ] Production build works correctly
- [ ] localStorage is properly cleaned up
- [ ] No hardcoded test data
- [ ] Environment variables are properly configured
- [ ] Supabase connection works (if using)
- [ ] Fallback to localStorage works (without auth)

## Known Limitations

- Strength workouts don't track duration
- No workout templates
- No progress graphs (only dashboard stats)
- No personal records tracking (beyond most trained)
- No export/import functionality

## Bug Report Template

If you find a bug, document:

1. **Description**: What happened?
2. **Steps to Reproduce**: What did you do?
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What actually happened?
5. **Browser**: Which browser?
6. **Device**: Desktop or mobile?
7. **Screenshot**: If applicable
