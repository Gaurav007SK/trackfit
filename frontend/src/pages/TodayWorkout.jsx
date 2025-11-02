import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";
import { GiWeightLiftingUp, GiMuscleUp } from "react-icons/gi";
import {
  IoCheckmarkCircle,
  IoFlameSharp,
  IoListOutline,
  IoTimeOutline,
  IoCloseCircle,
} from "react-icons/io5";
import { MdCelebration } from "react-icons/md";

const TodayWorkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [todayData, setTodayData] = useState(null);
  const [workout, setWorkout] = useState(null);
  const [completedWorkout, setCompletedWorkout] = useState(null);
  const [toast, setToast] = useState(null);

  // Get current day name
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = daysOfWeek[new Date().getDay()];
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    fetchTodaysWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTodaysWorkout = useCallback(async () => {
    try {
      const { data } = await api.get("/workouts/today");
      console.log("Today's workout data:", data);

      if (data.suggested) {
        // Suggested workout from plan (today has a planned workout)
        setTodayData(data);
        setWorkout(null);
        setCompletedWorkout(null);
      } else if (data.suggested === false && data.plan) {
        // Explicit rest day: active plan exists but nothing scheduled today
        // Keep the plan info so UI can show Rest Day with plan context
        setTodayData(data);
        setWorkout(null);
        setCompletedWorkout(null);
      } else if (data.message || data.workout === null) {
        // No active plan and no workout
        setTodayData(null);
        setWorkout(null);
        setCompletedWorkout(null);
      } else if (data._id && data.status === "in-progress") {
        // There's an active in-progress workout - redirect to it
        console.log("Found in-progress workout, redirecting to:", data._id);
        navigate(`/workout?id=${data._id}`);
      } else if (data._id && data.status === "completed") {
        // Today's workout is completed!
        console.log("Today's workout already completed");
        setCompletedWorkout(data);
        setTodayData(null);
        setWorkout(null);
      } else {
        // Invalid state
        console.log("Workout not in-progress, showing suggested workout");
        setTodayData(null);
        setWorkout(null);
        setCompletedWorkout(null);
      }
    } catch (error) {
      console.error("Error fetching workout:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const startWorkout = async () => {
    // default start uses today's suggested day from API
    return startWorkoutWithDay();
  };

  // startWorkoutWithDay accepts an optional plannedDay object (from plan.schedule)
  const startWorkoutWithDay = async (plannedDay) => {
    try {
      const day = plannedDay || todayData?.day;
      if (!day) {
        setToast({ message: "No workout day selected", type: "error" });
        return;
      }

      const { data } = await api.post("/workouts/start", {
        planId: todayData.plan._id,
        plannedDayId: day._id,
        dayName: day.dayName,
        exercises: day.exercises,
      });
      // Navigate to active workout page
      navigate(`/workout?id=${data._id}`);
    } catch (error) {
      console.error("Error starting workout:", error);
      setToast({
        message: error.response?.data?.message || "Failed to start workout",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <GiWeightLiftingUp className="animate-bounce-slow text-6xl mb-4 mx-auto text-blue-600" />
          <div className="text-gray-500 font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  // Show completed workout
  if (completedWorkout) {
    const totalSets = completedWorkout.exercises.reduce(
      (sum, ex) => sum + ex.sets.length,
      0
    );
    const totalVolume = completedWorkout.exercises.reduce(
      (sum, ex) =>
        sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0),
      0
    );
    const durationMinutes = Math.floor(completedWorkout.duration / 60);

    // Separate completed and skipped exercises
    const completedExercises = completedWorkout.exercises.filter(
      (ex) => ex.sets && ex.sets.length > 0
    );
    const skippedExercises = completedWorkout.exercises.filter(
      (ex) => !ex.sets || ex.sets.length === 0
    );

    return (
      <div className="p-4 animate-fadeIn">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Today's Workout
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {currentDay}, {currentDate}
          </p>
        </div>

        {/* Completion Card */}
        <div className="card p-0 mb-6 overflow-hidden animate-scale-in">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

            {/* Success Icon */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute w-20 h-20 bg-white/20 rounded-full animate-ping"></div>
              <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <IoCheckmarkCircle className="text-5xl text-green-500" />
              </div>
            </div>

            {/* Text */}
            <h2 className="text-3xl font-bold mb-2">Workout Complete!</h2>
            <p className="text-green-50 text-lg font-medium">
              {completedWorkout.dayName}
            </p>

            {/* Completion Stats */}
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <div className="bg-white/20 px-3 py-1.5 rounded-full">
                <span className="font-bold">{completedExercises.length}</span>{" "}
                completed
              </div>
              {skippedExercises.length > 0 && (
                <div className="bg-white/20 px-3 py-1.5 rounded-full">
                  <span className="font-bold">{skippedExercises.length}</span>{" "}
                  skipped
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-0 border-t border-gray-100">
            <div className="p-6 text-center border-r border-gray-100">
              <IoTimeOutline className="text-3xl text-blue-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-800">
                {durationMinutes}
              </div>
              <div className="text-sm text-gray-500 mt-1">Minutes</div>
            </div>
            <div className="p-6 text-center border-r border-gray-100">
              <GiMuscleUp className="text-3xl text-purple-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-800">
                {totalSets}
              </div>
              <div className="text-sm text-gray-500 mt-1">Sets</div>
            </div>
            <div className="p-6 text-center">
              <GiWeightLiftingUp className="text-3xl text-orange-600 mx-auto mb-2" />
              <div className="text-3xl font-bold text-gray-800">
                {Math.round(totalVolume)}
              </div>
              <div className="text-sm text-gray-500 mt-1">kg Volume</div>
            </div>
          </div>
        </div>

        {/* Completed Exercises */}
        {completedExercises.length > 0 && (
          <div className="card mb-6">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <IoCheckmarkCircle className="text-xl text-green-600" />
                <span>Completed Exercises</span>
                <span className="ml-auto bg-green-600 text-white text-xs px-2.5 py-1 rounded-full">
                  {completedExercises.length}
                </span>
              </h3>
            </div>
            {completedExercises.map((exercise, index) => (
              <div
                key={index}
                className="p-4 border-b last:border-b-0 border-gray-50 bg-gradient-to-r from-white to-green-50/30">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    {exercise.exerciseName}
                  </h4>
                  {!exercise.wasPlanned && (
                    <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                      Extra
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {exercise.sets.map((set, setIdx) => (
                    <div
                      key={setIdx}
                      className="bg-gray-50 rounded-lg px-3 py-2 flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Set {set.setNumber}
                      </span>
                      <span className="font-bold text-green-600">
                        {set.weight} kg × {set.reps} reps
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Skipped Exercises */}
        {skippedExercises.length > 0 && (
          <div className="card mb-6">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-orange-50">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <IoCloseCircle className="text-xl text-red-600" />
                <span>Skipped Exercises</span>
                <span className="ml-auto bg-red-600 text-white text-xs px-2.5 py-1 rounded-full">
                  {skippedExercises.length}
                </span>
              </h3>
            </div>
            {skippedExercises.map((exercise, index) => (
              <div
                key={index}
                className="p-4 border-b last:border-b-0 border-gray-50 bg-gradient-to-r from-white to-red-50/20">
                <div className="flex items-center gap-3 opacity-60">
                  <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    ✕
                  </span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700 line-through">
                      {exercise.exerciseName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Planned: {exercise.targetSets} sets ×{" "}
                      {exercise.targetReps} reps
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rest Message */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 text-center">
          <MdCelebration className="text-4xl text-blue-600 mx-auto mb-3" />
          <p className="text-blue-800 font-semibold text-lg">
            Great job today!
          </p>
          <p className="text-blue-600 text-sm mt-2">
            Come back tomorrow for your next workout
          </p>
        </div>
      </div>
    );
  }

  if (!todayData && !workout && !completedWorkout) {
    return (
      <div className="p-4 animate-fadeIn">
        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Today's Workout
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {currentDay}, {currentDate}
          </p>
        </div>
        <div className="card p-8 text-center">
          <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-6 animate-float">
            <GiMuscleUp className="text-7xl text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            No Active Plan
          </h2>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Create your first workout plan and start your fitness journey!
          </p>
          <button
            onClick={() => navigate("/plans")}
            className="btn-primary inline-flex items-center gap-2">
            <span>Create a Plan</span>
            <span>→</span>
          </button>
        </div>
      </div>
    );
  }
  // If we have todayData but suggested === false, it's an explicit rest day
  if (todayData && todayData.suggested === false) {
    // compute next scheduled day from plan schedule
    const getNextScheduled = (schedule, fromDate = new Date()) => {
      if (!schedule || schedule.length === 0) return null;

      // Map weekday names to numbers
      const dayIndex = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const todayIdx = fromDate.getDay();
      let best = null;
      let minDays = 8;

      for (const s of schedule) {
        const idx = dayIndex[s.weekDay];
        if (idx === undefined) continue;
        let delta = (idx - todayIdx + 7) % 7;
        if (delta === 0) delta = 7; // next occurrence (tomorrow or next week)
        if (delta < minDays) {
          minDays = delta;
          const nextDate = new Date(fromDate);
          nextDate.setDate(fromDate.getDate() + delta);
          nextDate.setHours(0, 0, 0, 0);
          best = { scheduleItem: s, nextDate, daysUntil: delta };
        }
      }

      return best;
    };

    const next = getNextScheduled(todayData.plan?.schedule || [], new Date());

    return (
      <div className="p-4 animate-fadeIn">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Today's Workout
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {currentDay}, {currentDate}
          </p>
        </div>

        {/* Rest Day Card */}
        <div className="card p-0 mb-6 overflow-hidden animate-scale-in">
          {/* Header Section with Gradient */}
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-8 text-white text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

            {/* Icon */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute w-24 h-24 bg-white/20 rounded-full animate-ping"></div>
              <div className="relative w-24 h-24 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl border-4 border-white/40">
                <GiMuscleUp className="text-6xl text-white" />
              </div>
            </div>

            {/* Text */}
            <h2 className="text-3xl font-bold mb-2">Rest Day</h2>
            <p className="text-purple-100 text-base max-w-md mx-auto">
              Recovery is just as important as training. Your muscles grow
              during rest.
            </p>
          </div>

          {/* Content Section */}
          <div className="p-6">
            {/* Plan Info */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <IoListOutline className="text-xl text-white" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    Active Plan
                  </div>
                  <div className="font-bold text-gray-800">
                    {todayData.plan?.name || "Your Plan"}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Workout Section */}
            {next ? (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <IoTimeOutline className="text-lg text-blue-600" />
                  Next Scheduled Session
                </h3>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        {next.scheduleItem.dayName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {next.scheduleItem.weekDay}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Date</div>
                      <div className="text-sm font-semibold text-gray-800">
                        {next.nextDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                    <IoFlameSharp />
                    In {next.daysUntil} day{next.daysUntil > 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6 text-center py-4">
                <div className="text-sm text-gray-500">
                  No upcoming sessions scheduled
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/plans")}
                className="flex-1 btn-ghost flex items-center justify-center gap-2">
                <IoListOutline className="text-lg" />
                <span>View Plan</span>
              </button>
              {next && (
                <button
                  onClick={() => startWorkoutWithDay(next.scheduleItem)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl active:scale-95 transform transition-all flex items-center justify-center gap-2">
                  <IoFlameSharp className="text-xl" />
                  <span>Start Next Workout</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rest Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card p-4 bg-gradient-to-br from-blue-50 to-white">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mb-3">
              <GiMuscleUp className="text-xl text-white" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Stay Active</h4>
            <p className="text-sm text-gray-600">
              Light stretching or a walk can help recovery.
            </p>
          </div>

          <div className="card p-4 bg-gradient-to-br from-purple-50 to-white">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mb-3">
              <IoTimeOutline className="text-xl text-white" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Get Sleep</h4>
            <p className="text-sm text-gray-600">
              Quality sleep is essential for muscle recovery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (todayData && todayData.suggested && todayData.day) {
    const isScheduledToday = todayData.day.weekDay === currentDay;

    return (
      <div className="p-4 animate-fadeIn">
        {/* Header with date */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Today's Workout
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {currentDay}, {currentDate}
          </p>
        </div>

        <div className="gradient-primary rounded-2xl shadow-soft p-6 text-white mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold">{todayData.day.dayName}</h2>
            {isScheduledToday && (
              <span className="glass-dark text-white text-xs px-3 py-1.5 rounded-full font-medium">
                ✓ Scheduled Today
              </span>
            )}
          </div>
          {todayData.day.weekDay && !isScheduledToday && (
            <p className="text-blue-100 text-sm mb-2 bg-white/10 rounded-lg px-3 py-2 inline-block">
              Usually scheduled for {todayData.day.weekDay}
            </p>
          )}
          <p className="text-blue-100 mb-6 text-lg">
            {todayData.day.exercises?.length || 0} exercises planned
          </p>
          <button
            onClick={startWorkout}
            className="w-full bg-white text-blue-600 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transform transition-all flex items-center justify-center gap-2">
            <span>Start Workout</span>
            <IoFlameSharp className="text-2xl text-orange-500" />
          </button>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <IoListOutline className="text-xl text-blue-600" />
              <span>Planned Exercises</span>
            </h3>
          </div>
          {todayData.day.exercises?.map((exercise, index) => (
            <div
              key={index}
              className="p-4 border-b last:border-b-0 border-gray-50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {exercise.exerciseName}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {exercise.targetSets} sets × {exercise.targetReps} reps
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // This shouldn't normally be reached as we redirect to /workout
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
};

export default TodayWorkout;
