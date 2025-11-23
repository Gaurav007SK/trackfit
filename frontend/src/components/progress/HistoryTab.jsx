import { useState } from "react";
import { GiMuscleUp } from "react-icons/gi";
import { IoCalendarOutline, IoTimeOutline } from "react-icons/io5";

const HistoryTab = ({ workouts }) => {
  const [expandedWorkout, setExpandedWorkout] = useState(null);

  if (workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-bold mb-2">No History</h3>
        <p className="text-gray-600">
          Your completed workouts will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <div key={workout._id} className="bg-white rounded-lg shadow">
          <button
            onClick={() =>
              setExpandedWorkout(
                expandedWorkout === workout._id ? null : workout._id
              )
            }
            className="w-full p-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{workout.dayName}</h3>
              <span className="text-2xl">
                {expandedWorkout === workout._id ? "−" : "+"}
              </span>
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <IoCalendarOutline />{" "}
                {new Date(workout.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <IoTimeOutline /> {Math.round(workout.duration / 60)} min
              </span>
              <span className="flex items-center gap-1">
                <GiMuscleUp />{" "}
                {workout.exercises.reduce((s, ex) => s + ex.sets.length, 0)}{" "}
                sets
              </span>
            </div>
          </button>

          {expandedWorkout === workout._id && (
            <div className="border-t p-4 space-y-3">
              {workout.exercises.map((exercise, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium mb-2">{exercise.exerciseName}</h4>
                  <div className="space-y-1">
                    {exercise.sets.map((set, setIdx) => (
                      <div
                        key={setIdx}
                        className="text-sm text-gray-600 flex justify-between">
                        <span>Set {set.setNumber}</span>
                        <span className="font-medium">
                          {set.weight} kg × {set.reps} reps
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default HistoryTab;
