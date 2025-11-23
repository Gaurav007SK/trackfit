import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { GiWeightLiftingUp, GiMuscleUp, GiTrophy } from "react-icons/gi";
import {
  IoBarChartOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoTrendingUp,
  IoBarbell,
  IoStatsChart,
  IoSearchOutline,
} from "react-icons/io5";
import WorkoutCalendar from "../components/WorkoutCalendar";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Progress = () => {
  const { user } = useAuth();
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, history, records, charts

  // Charts state
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [progressData, setProgressData] = useState([]);
  const [chartType, setChartType] = useState("weight"); // weight, volume, reps
  const [viewType, setViewType] = useState("line"); // line or bar

  useEffect(() => {
    fetchWorkoutHistory();
    fetchExerciseList();
  }, []);

  useEffect(() => {
    if (selectedExercise) {
      fetchProgressData(selectedExercise);
    }
  }, [selectedExercise]);

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

  const fetchExerciseList = async () => {
    try {
      const { data } = await api.get("/workouts/progress/exercises/list");
      setExercises(data.exercises);
      if (data.exercises.length > 0) {
        setSelectedExercise(data.exercises[0]);
      }
    } catch (error) {
      console.error("Error fetching exercise list:", error);
    }
  };

  const fetchProgressData = async (exerciseName) => {
    try {
      const { data } = await api.get(
        `/workouts/progress/${encodeURIComponent(exerciseName)}`
      );

      // Format data for charts
      const formattedData = data.data.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        fullDate: new Date(item.date),
        maxWeight: item.maxWeight,
        totalVolume: item.totalVolume,
        totalReps: item.totalReps,
        avgWeight: item.avgWeight,
        setCount: item.setCount,
      }));

      setProgressData(formattedData);
    } catch (error) {
      console.error("Error fetching progress data:", error);
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
            onClick={() => setActiveTab("charts")}
            className={`flex-1 py-4 font-semibold transition-all ${
              activeTab === "charts"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            Charts
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
        {activeTab === "charts" && (
          <ChartsTab
            exercises={exercises}
            selectedExercise={selectedExercise}
            setSelectedExercise={setSelectedExercise}
            progressData={progressData}
            chartType={chartType}
            setChartType={setChartType}
            viewType={viewType}
            setViewType={setViewType}
          />
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

// Charts Tab Component
const ChartsTab = ({
  exercises,
  selectedExercise,
  setSelectedExercise,
  progressData,
  chartType,
  setChartType,
  viewType,
  setViewType,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const getChartData = () => {
    switch (chartType) {
      case "weight":
        return {
          dataKey: "maxWeight",
          name: "Max Weight (kg)",
          color: "#3b82f6",
          gradient: "from-blue-500 to-blue-600",
        };
      case "volume":
        return {
          dataKey: "totalVolume",
          name: "Total Volume (kg)",
          color: "#8b5cf6",
          gradient: "from-purple-500 to-purple-600",
        };
      case "reps":
        return {
          dataKey: "totalReps",
          name: "Total Reps",
          color: "#10b981",
          gradient: "from-green-500 to-green-600",
        };
      default:
        return {
          dataKey: "maxWeight",
          name: "Max Weight (kg)",
          color: "#3b82f6",
          gradient: "from-blue-500 to-blue-600",
        };
    }
  };

  const calculateStats = () => {
    if (progressData.length === 0) return null;

    const { dataKey } = getChartData();
    const values = progressData.map((d) => d[dataKey]);
    const current = values[values.length - 1];
    const previous = values[0];
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const improvement =
      previous > 0 ? ((current - previous) / previous) * 100 : 0;

    return { current, max, avg: Math.round(avg * 10) / 10, improvement };
  };

  // Filter exercises based on search term
  const filteredExercises = exercises.filter((exercise) =>
    exercise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update selected exercise if current one is filtered out
  useEffect(() => {
    if (
      filteredExercises.length > 0 &&
      !filteredExercises.includes(selectedExercise)
    ) {
      setSelectedExercise(filteredExercises[0]);
    }
  }, [searchTerm, filteredExercises, selectedExercise, setSelectedExercise]);

  if (exercises.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl mb-6 animate-float">
            <IoStatsChart className="text-7xl text-gradient bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            No Progress Data Yet
          </h2>
          <p className="text-gray-500 text-lg">
            Complete some workouts to start tracking your progress!
          </p>
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const chartConfig = getChartData();

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Exercise Selector - Modern Design */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-visible">
        <div className={`bg-gradient-to-r ${chartConfig.gradient} p-5`}>
          <label className="flex items-center gap-2 text-white font-bold text-xl">
            <IoBarbell className="text-3xl" />
            <span>Select Exercise</span>
          </label>
        </div>
        <div className="p-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <IoSearchOutline className="text-2xl text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-14 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white text-lg font-medium text-gray-800 placeholder-gray-400 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setShowSuggestions(false);
                }}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-gray-600">
                <span className="text-2xl font-bold">×</span>
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && searchTerm && filteredExercises.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 max-h-80 overflow-y-auto">
                {filteredExercises.slice(0, 10).map((exercise, idx) => {
                  const searchIndex = exercise
                    .toLowerCase()
                    .indexOf(searchTerm.toLowerCase());
                  const beforeMatch = exercise.slice(0, searchIndex);
                  const match = exercise.slice(
                    searchIndex,
                    searchIndex + searchTerm.length
                  );
                  const afterMatch = exercise.slice(
                    searchIndex + searchTerm.length
                  );

                  return (
                    <button
                      key={exercise}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedExercise(exercise);
                        setSearchTerm("");
                        setShowSuggestions(false);
                      }}
                      className={`w-full text-left px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 flex items-center justify-between group ${
                        idx === 0 ? "rounded-t-xl" : ""
                      } ${
                        idx === Math.min(filteredExercises.length, 10) - 1
                          ? "rounded-b-xl"
                          : ""
                      } border-b border-gray-100 last:border-b-0 ${
                        exercise === selectedExercise
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                      }`}>
                      <span
                        className={`font-semibold text-base ${
                          exercise === selectedExercise
                            ? "text-blue-700"
                            : "text-gray-700"
                        } group-hover:text-blue-600`}>
                        {beforeMatch}
                        <span className="bg-yellow-200 text-gray-900 font-bold px-1 rounded">
                          {match}
                        </span>
                        {afterMatch}
                      </span>
                      {exercise === selectedExercise ? (
                        <span className="text-blue-500 font-bold text-sm">
                          Selected
                        </span>
                      ) : (
                        <IoTrendingUp className="text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity text-lg" />
                      )}
                    </button>
                  );
                })}
                {filteredExercises.length > 10 && (
                  <div className="px-5 py-3 text-xs text-gray-500 text-center bg-gray-50 rounded-b-xl font-medium">
                    +{filteredExercises.length - 10} more exercises
                  </div>
                )}
              </div>
            )}

            {/* No results message */}
            {showSuggestions &&
              searchTerm &&
              filteredExercises.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-6 text-center">
                  <IoSearchOutline className="text-4xl text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">
                    No exercises found matching "{searchTerm}"
                  </p>
                </div>
              )}
          </div>

          {/* Exercise Dropdown - Hidden when searching */}
          {!searchTerm && (
            <select
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold text-gray-800 cursor-pointer hover:border-blue-300 transition-all shadow-sm">
              {exercises.map((exercise) => (
                <option key={exercise} value={exercise}>
                  {exercise}
                </option>
              ))}
            </select>
          )}

          {filteredExercises.length > 0 && searchTerm && (
            <p className="text-sm text-gray-500 pl-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
              Found {filteredExercises.length} matching exercise
              {filteredExercises.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards - Enhanced Modern Design */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-blue-100 uppercase tracking-wider">
                  Current
                </div>
                <IoTrendingUp className="text-2xl text-white/80" />
              </div>
              <div className="text-3xl font-black text-white">
                {stats.current}
                <span className="text-lg ml-1 font-medium">
                  {chartType === "reps" ? "" : "kg"}
                </span>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-purple-100 uppercase tracking-wider">
                  Personal Best
                </div>
                <GiTrophy className="text-2xl text-yellow-300" />
              </div>
              <div className="text-3xl font-black text-white">
                {stats.max}
                <span className="text-lg ml-1 font-medium">
                  {chartType === "reps" ? "" : "kg"}
                </span>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-green-100 uppercase tracking-wider">
                  Average
                </div>
                <IoBarChartOutline className="text-2xl text-white/80" />
              </div>
              <div className="text-3xl font-black text-white">
                {stats.avg}
                <span className="text-lg ml-1 font-medium">
                  {chartType === "reps" ? "" : "kg"}
                </span>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
            <div className="relative p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-orange-100 uppercase tracking-wider">
                  Growth
                </div>
                <IoTrendingUp className="text-2xl text-white/80" />
              </div>
              <div
                className={`text-3xl font-black ${
                  stats.improvement >= 0 ? "text-white" : "text-red-100"
                }`}>
                {stats.improvement >= 0 ? "+" : ""}
                {stats.improvement.toFixed(1)}
                <span className="text-lg ml-1 font-medium">%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Type & View Selector - Sleek Design */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Metric Buttons */}
          <div className="flex-1 flex gap-2">
            <button
              onClick={() => setChartType("weight")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                chartType === "weight"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-102"
              }`}>
              <IoBarbell className="inline mr-1.5 text-base" />
              Weight
            </button>
            <button
              onClick={() => setChartType("volume")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                chartType === "volume"
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-102"
              }`}>
              <IoStatsChart className="inline mr-1.5 text-base" />
              Volume
            </button>
            <button
              onClick={() => setChartType("reps")}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 ${
                chartType === "reps"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 scale-105"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-102"
              }`}>
              <IoTrendingUp className="inline mr-1.5 text-base" />
              Reps
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewType("line")}
              className={`flex-1 sm:w-28 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                viewType === "line"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}>
              Line
            </button>
            <button
              onClick={() => setViewType("bar")}
              className={`flex-1 sm:w-28 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                viewType === "bar"
                  ? "bg-white text-gray-900 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}>
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* Chart - Modern Container */}
      {progressData.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className={`bg-gradient-to-r ${chartConfig.gradient} px-6 py-4`}>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <IoStatsChart className="text-2xl" />
              {selectedExercise}
            </h2>
            <p className="text-white/80 text-sm mt-1">{chartConfig.name}</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={380}>
              {viewType === "line" ? (
                <LineChart data={progressData}>
                  <defs>
                    <linearGradient
                      id="colorGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop
                        offset="5%"
                        stopColor={chartConfig.color}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartConfig.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px", fontWeight: "500" }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: "12px", fontWeight: "500" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      padding: "12px",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#1f2937" }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                  />
                  <Line
                    type="monotone"
                    dataKey={chartConfig.dataKey}
                    name={chartConfig.name}
                    stroke={chartConfig.color}
                    strokeWidth={4}
                    dot={{
                      fill: chartConfig.color,
                      r: 5,
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 7, strokeWidth: 3 }}
                    fill="url(#colorGradient)"
                  />
                </LineChart>
              ) : (
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px", fontWeight: "500" }}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: "12px", fontWeight: "500" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      padding: "12px",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#1f2937" }}
                    cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: "20px" }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey={chartConfig.dataKey}
                    name={chartConfig.name}
                    fill={chartConfig.color}
                    radius={[12, 12, 0, 0]}
                    maxBarSize={60}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
          <IoStatsChart className="text-7xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            No data available for {selectedExercise}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Complete more workouts to see your progress chart
          </p>
        </div>
      )}
    </div>
  );
};

export default Progress;
