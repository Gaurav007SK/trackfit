import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { GiWeightLiftingUp, GiMuscleUp, GiTrophy } from "react-icons/gi";
import {
  IoBarChartOutline,
  IoTimeOutline,
  IoCalendarOutline,
} from "react-icons/io5";

const Progress = () => {
  const { user } = useAuth();
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, history, records

  useEffect(() => {
    fetchWorkoutHistory();
  }, []);

  const fetchWorkoutHistory = async () => {
    try {
      const { data } = await api.get("/workouts/history?limit=50");
      setWorkoutHistory(data);
    } catch (error) {
      console.error("Error fetching workout history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const calculateStats = () => {
    if (workoutHistory.length === 0) {
      return {
        totalWorkouts: 0,
        totalSets: 0,
        totalVolume: 0,
        avgDuration: 0,
        thisWeekWorkouts: 0,
        thisMonthWorkouts: 0,
      };
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalSets = workoutHistory.reduce(
      (sum, w) => sum + w.exercises.reduce((s, ex) => s + ex.sets.length, 0),
      0
    );

    const totalVolume = workoutHistory.reduce(
      (sum, w) =>
        sum +
        w.exercises.reduce(
          (s, ex) =>
            s + ex.sets.reduce((v, set) => v + set.weight * set.reps, 0),
          0
        ),
      0
    );

    const totalDuration = workoutHistory.reduce(
      (sum, w) => sum + w.duration,
      0
    );
    const avgDuration = totalDuration / workoutHistory.length;

    const thisWeekWorkouts = workoutHistory.filter(
      (w) => new Date(w.date) >= weekAgo
    ).length;

    const thisMonthWorkouts = workoutHistory.filter(
      (w) => new Date(w.date) >= monthAgo
    ).length;

    return {
      totalWorkouts: workoutHistory.length,
      totalSets,
      totalVolume: Math.round(totalVolume),
      avgDuration: Math.round(avgDuration / 60),
      thisWeekWorkouts,
      thisMonthWorkouts,
    };
  };

  // Calculate personal records (highest weight per exercise)
  const calculatePRs = () => {
    const prs = {};

    workoutHistory.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (!prs[exercise.exerciseName]) {
            prs[exercise.exerciseName] = {
              weight: set.weight,
              reps: set.reps,
              date: workout.date,
            };
          } else if (set.weight > prs[exercise.exerciseName].weight) {
            prs[exercise.exerciseName] = {
              weight: set.weight,
              reps: set.reps,
              date: workout.date,
            };
          }
        });
      });
    });

    return Object.entries(prs)
      .sort((a, b) => b[1].weight - a[1].weight)
      .slice(0, 10);
  };

  const stats = calculateStats();
  const prs = calculatePRs();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* User Profile Header */}
      <div className="gradient-purple text-white p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 glass-dark rounded-2xl flex items-center justify-center shadow-lg">
            <GiMuscleUp className="text-4xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{user?.username}</h2>
            <p className="text-purple-100 text-sm mt-1">
              Member since {new Date(user?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="glass-dark rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.totalWorkouts}</div>
            <div className="text-xs text-purple-100 mt-1">Workouts</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.thisWeekWorkouts}</div>
            <div className="text-xs text-purple-100 mt-1">This Week</div>
          </div>
          <div className="glass-dark rounded-xl p-4 text-center">
            <div className="text-3xl font-bold">{stats.thisMonthWorkouts}</div>
            <div className="text-xs text-purple-100 mt-1">This Month</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="flex">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-4 font-semibold transition-all ${
              activeTab === "overview"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Overview
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-4 font-semibold transition-all ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            History
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`flex-1 py-4 font-semibold transition-all ${
              activeTab === "records"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Records
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "overview" && (
          <OverviewTab stats={stats} workoutHistory={workoutHistory} />
        )}
        {activeTab === "history" && <HistoryTab workouts={workoutHistory} />}
        {activeTab === "records" && <RecordsTab prs={prs} />}
      </div>
    </div>
  );
};

// Overview Tab Component
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

// History Tab Component
const HistoryTab = ({ workouts }) => {
  const [expandedWorkout, setExpandedWorkout] = useState(null);

  if (workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="text-6xl mb-4">�</div>
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

// Records Tab Component
const RecordsTab = ({ prs }) => {
  if (prs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <GiTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Records Yet</h3>
        <p className="text-gray-600">
          Complete workouts to track your personal records
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-3">
          <GiTrophy className="text-4xl" />
          <div>
            <h3 className="text-xl font-bold">Personal Records</h3>
            <p className="text-amber-100 text-sm">Your best lifts</p>
          </div>
        </div>
      </div>

      {prs.map(([exerciseName, record], index) => (
        <div key={exerciseName} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                index === 0
                  ? "bg-yellow-500"
                  : index === 1
                  ? "bg-gray-400"
                  : index === 2
                  ? "bg-amber-600"
                  : "bg-blue-500"
              }`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-bold">{exerciseName}</h4>
              <p className="text-sm text-gray-500">
                {new Date(record.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {record.weight} kg
              </div>
              <div className="text-sm text-gray-500">{record.reps} reps</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Progress;
