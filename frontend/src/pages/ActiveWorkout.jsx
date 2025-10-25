import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";

const ActiveWorkout = () => {
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds

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

  useEffect(() => {
    fetchWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Timer effect - updates every second
  useEffect(() => {
    if (!workout?.startTime) return;

    // Calculate initial elapsed time
    const startTime = new Date(workout.startTime).getTime();
    const updateElapsedTime = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    };

    // Update immediately
    updateElapsedTime();

    // Update every second
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
        console.log("User confirmed, starting completion...");
        setCompleting(true);

        try {
          console.log(
            "Making API request to:",
            `/workouts/${workout._id}/complete`
          );
          const response = await api.put(`/workouts/${workout._id}/complete`);
          console.log("Workout completed successfully:", response.data);
          console.log("Workout status:", response.data.status);

          // Small delay to ensure state is updated, then redirect
          setTimeout(() => {
            console.log("Redirecting to home...");
            window.location.replace("/");
          }, 100);
        } catch (error) {
          console.error("Error completing workout:", error);
          console.error("Error response:", error.response);
          console.error("Error details:", error.response?.data);
          setToast({
            message:
              error.response?.data?.message || "Failed to complete workout",
            type: "error",
          });
          setCompleting(false);
        }
      },
      onCancel: () => {
        console.log("User cancelled");
        setConfirmDialog(null);
      },
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

  // Format elapsed time as HH:MM:SS or MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">{workout.dayName}</h1>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <span>⏱️</span>
              <span className="font-mono font-semibold">
                {formatTime(elapsedTime)}
              </span>
            </div>
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
        </div>
      </div>

      {/* Exercise Details */}
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <h2 className="text-2xl font-bold mb-1">
            {currentExercise.exerciseName}
          </h2>
          <p className="text-gray-500 text-sm mb-3">
            Target: {currentExercise.targetSets || 3} sets ×{" "}
            {currentExercise.targetReps || 10} reps
          </p>

          {/* Sets List */}
          <div className="space-y-2 mb-4">
            {currentExercise.sets.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No sets logged yet
              </p>
            ) : (
              currentExercise.sets.map((set, setIdx) => (
                <SetRow
                  key={setIdx}
                  set={set}
                  setIndex={setIdx}
                  onUpdate={(weight, reps) =>
                    updateSet(activeExerciseIndex, setIdx, weight, reps)
                  }
                  onDelete={() => deleteSet(activeExerciseIndex, setIdx)}
                />
              ))
            )}
          </div>

          {/* Add Set Button */}
          <button
            onClick={() => addSet(activeExerciseIndex)}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-600 active:scale-95 transform transition">
            + Add Set
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() =>
              setActiveExerciseIndex(Math.max(0, activeExerciseIndex - 1))
            }
            disabled={activeExerciseIndex === 0}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 active:scale-95 transform transition">
            ← Previous
          </button>
          <button
            onClick={() =>
              setActiveExerciseIndex(
                Math.min(workout.exercises.length - 1, activeExerciseIndex + 1)
              )
            }
            disabled={activeExerciseIndex === workout.exercises.length - 1}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 active:scale-95 transform transition">
            Next →
          </button>
        </div>

        {/* Finish Workout */}
        <button
          onClick={completeWorkout}
          disabled={completing}
          className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 active:scale-95 transform transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
          {completing ? "Completing..." : "✓ Complete Workout"}
        </button>
      </div>
    </div>
  );
};

const SetRow = ({ set, onUpdate, onDelete }) => {
  const [weight, setWeight] = useState(set.weight);
  const [reps, setReps] = useState(set.reps);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate(weight, reps);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-600">Set {set.setNumber}</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-600 block mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              step="0.5"
              min="0"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-600 block mb-1">Reps</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              min="0"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium">
            Save
          </button>
          <button
            onClick={() => {
              setWeight(set.weight);
              setReps(set.reps);
              setIsEditing(false);
            }}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
          {set.setNumber}
        </div>
        <div>
          <div className="font-bold text-lg">
            {set.weight} kg × {set.reps} reps
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200">
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200">
          ✕
        </button>
      </div>
    </div>
  );
};

export default ActiveWorkout;
