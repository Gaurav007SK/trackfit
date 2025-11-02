import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  IoTimeOutline,
  IoAddCircleOutline,
  IoClose,
  IoSearchOutline,
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
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [availableExercises, setAvailableExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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
      setSearchQuery("");
      setActiveExerciseIndex(data.exercises.length - 1); // Switch to the new exercise
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
            navigate("/", { replace: true });
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

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-slideUp">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MdFitnessCenter className="text-blue-600" />
                Add Extra Exercise
              </h3>
              <button
                onClick={() => {
                  setShowAddExerciseModal(false);
                  setSearchQuery("");
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition">
                <IoClose className="text-2xl text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Exercise List */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {availableExercises
                  .filter((ex) =>
                    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((exercise) => (
                    <button
                      key={exercise._id}
                      onClick={() => addExtraExercise(exercise)}
                      className="w-full card-interactive p-4 bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-purple-50 text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {exercise.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {exercise.category}
                          </p>
                        </div>
                        <IoAddCircleOutline className="text-2xl text-blue-600" />
                      </div>
                    </button>
                  ))}
                {availableExercises.filter((ex) =>
                  ex.name.toLowerCase().includes(searchQuery.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MdFitnessCenter className="text-5xl mx-auto mb-2 text-gray-300" />
                    <p>No exercises found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">{workout.dayName}</h1>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <IoTimeOutline />
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
          {/* Add Exercise Button */}
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
        {/* Exercise Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                {currentExercise.exerciseName}
              </h2>
              <div className="flex items-center gap-3 text-sm text-blue-100">
                <span>
                  Target: {currentExercise.targetSets || 3} sets ×{" "}
                  {currentExercise.targetReps || 10} reps
                </span>
                {!currentExercise.wasPlanned && (
                  <span className="bg-purple-500/50 px-2 py-0.5 rounded-full text-xs">
                    Extra
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-200">Progress</div>
              <div className="text-2xl font-bold">
                {currentExercise.sets.length}/{currentExercise.targetSets || 3}
              </div>
            </div>
          </div>
        </div>

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
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg active:scale-95 transform transition flex items-center justify-center gap-2">
            <IoAddCircleOutline className="text-xl" />
            Add Set
          </button>
        </div>

        {/* PR and Last Workout Stats - Below Add Set */}
        {(currentExercise.pr || currentExercise.lastWorkout) && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
              Performance History
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Personal Record */}
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

              {/* Last Workout */}
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
          {/* Exercise Navigation */}
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

            {/* Exercise Counter */}
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

          {/* Complete Workout Button */}
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
