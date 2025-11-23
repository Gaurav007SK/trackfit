import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { GiMuscleUp } from "react-icons/gi";
import OverviewTab from "../components/progress/OverviewTab";
import HistoryTab from "../components/progress/HistoryTab";
import RecordsTab from "../components/progress/RecordsTab";
import ChartsTab from "../components/progress/ChartsTab";

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

export default Progress;
