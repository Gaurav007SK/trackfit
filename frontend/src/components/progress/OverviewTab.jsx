import { GiWeightLiftingUp } from "react-icons/gi";
import { IoBarChartOutline, IoTimeOutline } from "react-icons/io5";
import WorkoutCalendar from "../WorkoutCalendar";

const OverviewTab = ({ stats, workoutHistory }) => {
  if (workoutHistory.length === 0) {
    return (
      <div className="card p-8 text-center animate-fadeIn">
        <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-6 animate-float">
          <GiWeightLiftingUp className="text-7xl text-blue-600" />
        </div>
        <h3 className="text-2xl font-bold mb-3">No Workouts Yet</h3>
        <p className="text-gray-600">
          Start your first workout to see your progress!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Workout Calendar */}
      <WorkoutCalendar />

      {/* Stats Cards */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <IoBarChartOutline className="text-xl text-blue-600" />
          <span>Overall Stats</span>
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalSets}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Sets</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="text-3xl font-bold text-green-600">
              {stats.totalVolume.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 mt-1">kg Lifted</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="text-3xl font-bold text-purple-600">
              {stats.avgDuration}
            </div>
            <div className="text-sm text-gray-600 mt-1">Avg Minutes</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="text-3xl font-bold text-amber-600">
              {workoutHistory.length > 0
                ? Math.round((stats.thisWeekWorkouts / 7) * 10) / 10
                : 0}
            </div>
            <div className="text-sm text-gray-600 mt-1">Workouts/Day</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <IoTimeOutline className="text-xl text-blue-600" />
          <span>Recent Activity</span>
        </h3>
        <div className="space-y-3">
          {workoutHistory.slice(0, 5).map((workout, index) => (
            <div
              key={workout._id}
              className="card-interactive p-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      {workout.dayName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(workout.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-blue-600">
                    {workout.exercises.reduce((s, ex) => s + ex.sets.length, 0)}{" "}
                    sets
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(workout.duration / 60)} min
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
