import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";
import { GiWeightLiftingUp, GiMuscleUp } from "react-icons/gi";
import {
  IoCheckmarkCircle,
  IoFlameSharp,
  IoListOutline,
  IoTimeOutline,
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
  }, []);

  const fetchTodaysWorkout = async () => {
    try {
      const { data } = await api.get("/workouts/today");
      console.log("Today's workout data:", data);

      if (data.suggested) {
        // Suggested workout from plan
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
  };

  const startWorkout = async () => {
    try {
      const { data } = await api.post("/workouts/start", {
        planId: todayData.plan._id,
        plannedDayId: todayData.day._id,
        dayName: todayData.day.dayName,
        exercises: todayData.day.exercises,
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

        {/* Exercises Summary */}
        <div className="card mb-6">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <GiMuscleUp className="text-xl text-blue-600" />
              <span>Exercises Completed</span>
            </h3>
          </div>
          {completedWorkout.exercises.map((exercise, index) => (
            <div
              key={index}
              className="p-4 border-b last:border-b-0 border-gray-50">
              <h4 className="font-semibold text-gray-800 mb-3">
                {exercise.exerciseName}
              </h4>
              <div className="space-y-2">
                {exercise.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className="bg-gray-50 rounded-lg px-3 py-2 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Set {set.setNumber}
                    </span>
                    <span className="font-bold text-blue-600">
                      {set.weight} kg × {set.reps} reps
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

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

  if (todayData && todayData.day) {
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
