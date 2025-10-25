import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { GiWeightLiftingUp, GiMuscleUp, GiTrophy } from "react-icons/gi";
import { IoClose, IoCalendarOutline, IoTimeOutline } from "react-icons/io5";
import { MdNoteAlt } from "react-icons/md";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stats"); // stats, records, recent

  useEffect(() => {
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get(`/social/profile/${userId}`);
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <IoClose className="text-6xl text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">User Not Found</h3>
          <button
            onClick={() => navigate("/social")}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg">
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
        <button
          onClick={() => navigate("/social")}
          className="mb-4 text-white/80 hover:text-white flex items-center gap-2">
          ← Back
        </button>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <GiMuscleUp className="text-4xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{profile.user.username}</h2>
            <p className="text-blue-100 text-sm">
              Member since{" "}
              {new Date(profile.user.memberSince).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {profile.stats.totalWorkouts}
            </div>
            <div className="text-xs text-blue-100">Workouts</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {profile.stats.thisWeekWorkouts}
            </div>
            <div className="text-xs text-blue-100">This Week</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">
              {profile.stats.thisMonthWorkouts}
            </div>
            <div className="text-xs text-blue-100">This Month</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab("stats")}
            className={`flex-1 py-3 font-medium transition ${
              activeTab === "stats"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}>
            Stats
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`flex-1 py-3 font-medium transition ${
              activeTab === "records"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}>
            Records
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 py-3 font-medium transition ${
              activeTab === "recent"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}>
            Recent
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "stats" && <StatsTab stats={profile.stats} />}
        {activeTab === "records" && <RecordsTab prs={profile.topPRs} />}
        {activeTab === "recent" && (
          <RecentTab workouts={profile.recentWorkouts} />
        )}
      </div>
    </div>
  );
};

// Stats Tab
const StatsTab = ({ stats }) => {
  return (
    <div className="space-y-4">
      {stats.totalWorkouts === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <GiWeightLiftingUp className="text-6xl text-blue-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Workouts Yet</h3>
          <p className="text-gray-600">
            This user hasn't completed any workouts
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-700 mb-3">Overall Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.totalSets}
                </div>
                <div className="text-sm text-gray-600">Total Sets</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalVolume.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">kg Lifted</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.avgDuration}
                </div>
                <div className="text-sm text-gray-600">Avg Minutes</div>
              </div>
              <div className="bg-amber-50 rounded-lg p-3">
                <div className="text-2xl font-bold text-amber-600">
                  {stats.totalWorkouts > 0
                    ? Math.round((stats.thisWeekWorkouts / 7) * 10) / 10
                    : 0}
                </div>
                <div className="text-sm text-gray-600">Workouts/Day</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Records Tab
const RecordsTab = ({ prs }) => {
  if (prs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <GiTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Records Yet</h3>
        <p className="text-gray-600">No personal records to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-3">
          <GiTrophy className="text-4xl" />
          <div>
            <h3 className="text-xl font-bold">Top Personal Records</h3>
            <p className="text-amber-100 text-sm">Best lifts</p>
          </div>
        </div>
      </div>

      {prs.map((pr, index) => (
        <div key={pr.exerciseName} className="bg-white rounded-lg shadow p-4">
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
              <h4 className="font-bold">{pr.exerciseName}</h4>
              <p className="text-sm text-gray-500">
                {new Date(pr.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {pr.weight} kg
              </div>
              <div className="text-sm text-gray-500">{pr.reps} reps</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Recent Tab
const RecentTab = ({ workouts }) => {
  if (workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <MdNoteAlt className="text-6xl text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Recent Workouts</h3>
        <p className="text-gray-600">No recent activity to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {workouts.map((workout) => (
        <div key={workout._id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">{workout.dayName}</h3>
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
              <GiMuscleUp /> {workout.totalSets} sets
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserProfile;
