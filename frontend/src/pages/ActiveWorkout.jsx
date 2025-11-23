import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import SetRow from "../components/workout/SetRow";
import WorkoutTimer from "../components/workout/WorkoutTimer";
import AddExerciseModal from "../components/workout/AddExerciseModal";
import ExerciseCard from "../components/workout/ExerciseCard";
import {
  IoTimeOutline,
  IoAddCircleOutline,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { MdFitnessCenter } from "react-icons/md";

const ActiveWorkout = () => {
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);

  const fetchWorkout = async () => {
    try {
      const workoutId = new URLSearchParams(window.location.search).get("id");
      if (!workoutId) {
        navigate("/");
        return;
      }
      const { data } = await api.get(`/workouts/${workoutId}`);
      setWorkout(data);
    } catch (error) {
      console.error("Error fetching workout:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const { data } = await api.get("/exercises");
      setAvailableExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setToast({ message: "Failed to load exercises", type: "error" });
    }
  };

  const addExtraExercise = async (exercise) => {
    try {
      const { data } = await api.post(`/workouts/${workout._id}/exercise`, {
        exerciseId: exercise._id,
        exerciseName: exercise.name,
        targetSets: 3,
        targetReps: 10,
        wasPlanned: false,
      });
      setWorkout(data);
      setShowAddExerciseModal(false);
      setActiveExerciseIndex(data.exercises.length - 1);
      setToast({
        message: `${exercise.name} added to workout!`,
        type: "success",
      });
    } catch (error) {
      console.error("Error adding exercise:", error);
      setToast({
        message: error.response?.data?.message || "Failed to add exercise",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer effect
  useEffect(() => {
    if (!workout?.startTime) return;

    const startTime = new Date(workout.startTime).getTime();
    const updateElapsedTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    };

    updateElapsedTime();
    const timer = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(timer);
  }, [workout?.startTime]);

  const addSet = async (exerciseIndex) => {
    try {
      const exercise = workout.exercises[exerciseIndex];
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const setNumber = exercise.sets.length + 1;

      const { data } = await api.post(`/workouts/${workout._id}/set`, {
        exerciseIndex,
        setNumber,
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || exercise.targetReps || 10,
      });
      setWorkout(data);
    } catch (error) {
      console.error("Error adding set:", error);
      setToast({ message: "Failed to add set", type: "error" });
    }
  };

  const updateSet = async (exerciseIndex, setIndex, weight, reps) => {
    try {
      const { data } = await api.put(`/workouts/${workout._id}/set`, {
        exerciseIndex,
        setIndex,
        weight: parseFloat(weight) || 0,
        reps: parseInt(reps) || 0,
      });
      setWorkout(data);
    } catch (error) {
      console.error("Error updating set:", error);
    }
  };

  const deleteSet = async (exerciseIndex, setIndex) => {
    setConfirmDialog({
      message: "Are you sure you want to delete this set?",
      onConfirm: async () => {
        try {
          const { data } = await api.delete(`/workouts/${workout._id}/set`, {
            data: { exerciseIndex, setIndex },
          });
          setWorkout(data);
          setToast({ message: "Set deleted", type: "success" });
        } catch (error) {
          console.error("Error deleting set:", error);
          setToast({ message: "Failed to delete set", type: "error" });
        }
        setConfirmDialog(null);
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const completeWorkout = async () => {
    setConfirmDialog({
      message:
        "Complete this workout? You can't make changes after completion.",
      onConfirm: async () => {
        setConfirmDialog(null);
        setCompleting(true);

        try {
          await api.put(`/workouts/${workout._id}/complete`);
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 100);
        } catch (error) {
          console.error("Error completing workout:", error);
          setToast({
            message:
              error.response?.data?.message || "Failed to complete workout",
            type: "error",
          });
          setCompleting(false);
        }
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading workout...</div>
      </div>
    );
  }

  if (!workout) return null;

  const currentExercise = workout.exercises[activeExerciseIndex];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}

      {showAddExerciseModal && (
        <AddExerciseModal
          availableExercises={availableExercises}
          onAdd={addExtraExercise}
          onClose={() => setShowAddExerciseModal(false)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">{workout.dayName}</h1>
            <WorkoutTimer elapsedTime={elapsedTime} />
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {workout.exercises.map((ex, idx) => (
            <button
              key={idx}
              onClick={() => setActiveExerciseIndex(idx)}
              className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition ${
                idx === activeExerciseIndex
                  ? "bg-white text-blue-600 font-bold"
                  : "bg-blue-400/30 text-white"
              }`}>
              {ex.exerciseName}
              {ex.sets.length > 0 && (
                <span className="ml-1">({ex.sets.length})</span>
              )}
            </button>
          ))}
          <button
            onClick={() => {
              setShowAddExerciseModal(true);
              fetchExercises();
            }}
            className="px-3 py-1 rounded-full text-sm whitespace-nowrap bg-white/20 text-white border border-white/40 hover:bg-white/30 transition flex items-center gap-1">
            <IoAddCircleOutline className="text-lg" />
            Add Exercise
          </button>
        </div>
      </div>

      {/* Exercise Details */}
      <div className="p-4 space-y-4 pb-44">
        <ExerciseCard
          exercise={currentExercise}
          setCount={currentExercise.sets.length}
        />

        {/* Current Sets Card */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
            Your Sets Today
          </h3>

          <div className="space-y-2 mb-4">
            {currentExercise.sets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MdFitnessCenter className="text-5xl mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  No sets logged yet. Add your first set!
                </p>
              </div>
            ) : (
              currentExercise.sets.map((set, setIdx) => (
                <SetRow
                  key={setIdx}
                  set={set}
                  onUpdate={(weight, reps) =>
                    updateSet(activeExerciseIndex, setIdx, weight, reps)
                  }
                  onDelete={() => deleteSet(activeExerciseIndex, setIdx)}
                />
              ))
            )}
          </div>

          <button
            onClick={() => addSet(activeExerciseIndex)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg active:scale-95 transform transition flex items-center justify-center gap-2">
            <IoAddCircleOutline className="text-xl" />
            Add Set
          </button>
        </div>

        {/* PR and Last Workout Stats */}
        {(currentExercise.pr || currentExercise.lastWorkout) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Performance History
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentExercise.pr && (
                <div className="card p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm">PR</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 font-semibold uppercase">
                        Personal Record
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(currentExercise.pr.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-800">
                      {currentExercise.pr.weight}
                    </span>
                    <span className="text-sm text-gray-600">kg</span>
                    <span className="text-gray-400">×</span>
                    <span className="text-3xl font-bold text-gray-800">
                      {currentExercise.pr.reps}
                    </span>
                    <span className="text-sm text-gray-600">reps</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-yellow-200">
                    <div className="text-xs text-gray-600">
                      Volume:{" "}
                      <span className="font-bold text-gray-800">
                        {Math.round(
                          currentExercise.pr.weight * currentExercise.pr.reps
                        )}{" "}
                        kg
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentExercise.lastWorkout && (
                <div className="card p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                      <IoTimeOutline className="text-white text-lg" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-600 font-semibold uppercase">
                        Last Workout
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(
                          currentExercise.lastWorkout.date
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {currentExercise.lastWorkout.sets
                      .slice(0, 3)
                      .map((set, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm bg-white/50 rounded-lg px-3 py-1.5">
                          <span className="text-gray-600 font-medium">
                            Set {idx + 1}
                          </span>
                          <span className="font-bold text-gray-800">
                            {set.weight} kg × {set.reps}
                          </span>
                        </div>
                      ))}
                    {currentExercise.lastWorkout.sets.length > 3 && (
                      <div className="text-xs text-center text-gray-500 pt-1">
                        +{currentExercise.lastWorkout.sets.length - 3} more sets
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() =>
                setActiveExerciseIndex(Math.max(0, activeExerciseIndex - 1))
              }
              disabled={activeExerciseIndex === 0}
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 active:scale-95 transform transition flex items-center justify-center gap-2 shadow-md">
              <span className="text-lg">←</span>
              <span className="hidden sm:inline">Previous</span>
            </button>

            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-center min-w-[100px] shadow-lg">
              <div className="text-xs opacity-90">Exercise</div>
              <div className="text-lg">
                {activeExerciseIndex + 1} / {workout.exercises.length}
              </div>
            </div>

            <button
              onClick={() =>
                setActiveExerciseIndex(
                  Math.min(
                    workout.exercises.length - 1,
                    activeExerciseIndex + 1
                  )
                )
              }
              disabled={activeExerciseIndex === workout.exercises.length - 1}
              className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:from-gray-200 hover:to-gray-300 active:scale-95 transform transition flex items-center justify-center gap-2 shadow-md">
              <span className="hidden sm:inline">Next</span>
              <span className="text-lg">→</span>
            </button>
          </div>

          <button
            onClick={completeWorkout}
            disabled={completing}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl active:scale-98 transform transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <IoCheckmarkCircle className="text-2xl" />
            {completing ? "Completing..." : "Finish Workout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActiveWorkout;
