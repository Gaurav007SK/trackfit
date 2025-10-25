import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";

const PlanBuilder = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [planData, setPlanData] = useState({
    name: "",
    daysPerWeek: 3,
    schedule: [],
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const { data } = await api.get("/exercises");
      setExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDaysChange = (days) => {
    const numDays = parseInt(days);
    setPlanData((prev) => {
      const newSchedule = [];
      for (let i = 0; i < numDays; i++) {
        newSchedule.push({
          dayName: prev.schedule[i]?.dayName || `Day ${i + 1}`,
          dayNumber: i + 1,
          weekDay: prev.schedule[i]?.weekDay || "",
          exercises: prev.schedule[i]?.exercises || [],
        });
      }
      return {
        ...prev,
        daysPerWeek: numDays,
        schedule: newSchedule,
      };
    });
  };

  const updateDayName = (dayIndex, name) => {
    setPlanData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((day, idx) =>
        idx === dayIndex ? { ...day, dayName: name } : day
      ),
    }));
  };

  const updateWeekDay = (dayIndex, weekDay) => {
    setPlanData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((day, idx) =>
        idx === dayIndex ? { ...day, weekDay } : day
      ),
    }));
  };

  const addExerciseToDay = (dayIndex, exercise) => {
    setPlanData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((day, idx) => {
        if (idx === dayIndex) {
          return {
            ...day,
            exercises: [
              ...day.exercises,
              {
                exerciseId: exercise._id,
                exerciseName: exercise.name,
                targetSets: 3,
                targetReps: 10,
                order: day.exercises.length + 1,
              },
            ],
          };
        }
        return day;
      }),
    }));
  };

  const removeExerciseFromDay = (dayIndex, exerciseIndex) => {
    setPlanData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((day, idx) => {
        if (idx === dayIndex) {
          return {
            ...day,
            exercises: day.exercises.filter(
              (_, eIdx) => eIdx !== exerciseIndex
            ),
          };
        }
        return day;
      }),
    }));
  };

  const updateExerciseTarget = (dayIndex, exerciseIndex, field, value) => {
    setPlanData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((day, idx) => {
        if (idx === dayIndex) {
          return {
            ...day,
            exercises: day.exercises.map((ex, eIdx) =>
              eIdx === exerciseIndex ? { ...ex, [field]: parseInt(value) } : ex
            ),
          };
        }
        return day;
      }),
    }));
  };

  const handleSubmit = async () => {
    if (!planData.name.trim()) {
      setToast({ message: "Please enter a plan name", type: "warning" });
      return;
    }

    if (planData.schedule.some((day) => day.exercises.length === 0)) {
      setToast({
        message: "Some days have no exercises. Add exercises to continue.",
        type: "warning",
      });
      return;
    }

    try {
      await api.post("/plans", {
        ...planData,
        isActive: true, // Make this the active plan
      });
      setToast({ message: "Plan created successfully!", type: "success" });
      setTimeout(() => navigate("/plans"), 1000);
    } catch (error) {
      console.error("Error creating plan:", error);
      setToast({
        message: error.response?.data?.message || "Failed to create plan",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading exercises...</div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Create Workout Plan</h1>
        <button
          onClick={() => navigate("/plans")}
          className="text-gray-600 hover:text-gray-800">
          ✕
        </button>
      </div>

      {/* Plan Name */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Plan Name
        </label>
        <input
          type="text"
          value={planData.name}
          onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
          placeholder="e.g., Push Pull Legs"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Days Per Week */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Days Per Week
        </label>
        <div className="grid grid-cols-5 gap-2">
          {[3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              onClick={() => handleDaysChange(num)}
              className={`py-3 rounded-lg font-bold transition ${
                planData.daysPerWeek === num
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 active:bg-gray-200"
              }`}>
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Days Schedule */}
      {planData.schedule.map((day, dayIndex) => (
        <DayEditor
          key={dayIndex}
          day={day}
          dayIndex={dayIndex}
          exercises={exercises}
          allScheduledDays={planData.schedule}
          onUpdateDayName={(name) => updateDayName(dayIndex, name)}
          onUpdateWeekDay={(weekDay) => updateWeekDay(dayIndex, weekDay)}
          onAddExercise={(exercise) => addExerciseToDay(dayIndex, exercise)}
          onRemoveExercise={(exerciseIndex) =>
            removeExerciseFromDay(dayIndex, exerciseIndex)
          }
          onUpdateTarget={(exerciseIndex, field, value) =>
            updateExerciseTarget(dayIndex, exerciseIndex, field, value)
          }
        />
      ))}

      {/* Save Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            className="w-full bg-green-500 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-600 active:scale-95 transform transition shadow-lg">
            Create Plan ✓
          </button>
        </div>
      </div>
    </div>
  );
};

const DayEditor = ({
  day,
  dayIndex,
  exercises,
  allScheduledDays,
  onUpdateDayName,
  onUpdateWeekDay,
  onAddExercise,
  onRemoveExercise,
  onUpdateTarget,
}) => {
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Get already selected days (excluding current day)
  const selectedDays = allScheduledDays
    .map((d, idx) => (idx !== dayIndex ? d.weekDay : null))
    .filter((d) => d && d !== "");

  // Filter out already selected days
  const availableDays = weekDays.filter((d) => !selectedDays.includes(d));

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Day {dayIndex + 1} Name
        </label>
        <input
          type="text"
          value={day.dayName}
          onChange={(e) => onUpdateDayName(e.target.value)}
          placeholder="e.g., Push Day"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Scheduled Week Day (Optional)
        </label>
        <select
          value={day.weekDay}
          onChange={(e) => onUpdateWeekDay(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 bg-white">
          <option value="">No specific day</option>
          {/* Show current selection even if already used */}
          {day.weekDay && !availableDays.includes(day.weekDay) && (
            <option key={day.weekDay} value={day.weekDay}>
              {day.weekDay}
            </option>
          )}
          {/* Show available days */}
          {availableDays.map((weekDay) => (
            <option key={weekDay} value={weekDay}>
              {weekDay}
            </option>
          ))}
        </select>
        {availableDays.length === 0 && !day.weekDay && (
          <p className="text-xs text-amber-600 mt-1">
            All days are already assigned to other workouts
          </p>
        )}
        {day.weekDay && (
          <p className="text-xs text-gray-500 mt-1">
            App will suggest this workout on {day.weekDay}
          </p>
        )}
        {!day.weekDay && availableDays.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            App will suggest this workout in sequential order
          </p>
        )}
      </div>

      {/* Exercise List */}
      <div className="space-y-2 mb-3">
        {day.exercises.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">
            No exercises added yet
          </p>
        ) : (
          day.exercises.map((exercise, exerciseIndex) => (
            <div key={exerciseIndex} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm">{exercise.exerciseName}</h4>
                <button
                  onClick={() => onRemoveExercise(exerciseIndex)}
                  className="text-red-500 text-sm">
                  ✕
                </button>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Sets</label>
                  <input
                    type="number"
                    value={exercise.targetSets}
                    onChange={(e) =>
                      onUpdateTarget(
                        exerciseIndex,
                        "targetSets",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-1 text-sm rounded border border-gray-300"
                    min="1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Reps</label>
                  <input
                    type="number"
                    value={exercise.targetReps}
                    onChange={(e) =>
                      onUpdateTarget(
                        exerciseIndex,
                        "targetReps",
                        e.target.value
                      )
                    }
                    className="w-full px-2 py-1 text-sm rounded border border-gray-300"
                    min="1"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Exercise Button */}
      {!showExercisePicker ? (
        <button
          onClick={() => setShowExercisePicker(true)}
          className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-medium active:bg-blue-100 transition">
          + Add Exercise
        </button>
      ) : (
        <div className="border border-blue-500 rounded-lg p-3">
          <input
            type="text"
            placeholder="🔍 Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 mb-2 focus:outline-none focus:border-blue-500"
          />
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise._id}
                onClick={() => {
                  onAddExercise(exercise);
                  setShowExercisePicker(false);
                  setSearchQuery("");
                }}
                className="w-full text-left px-3 py-2 rounded hover:bg-blue-50 transition text-sm">
                <div className="font-medium">{exercise.name}</div>
                <div className="text-xs text-gray-500">{exercise.category}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setShowExercisePicker(false);
              setSearchQuery("");
            }}
            className="w-full mt-2 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanBuilder;
