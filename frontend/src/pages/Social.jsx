import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";

const Social = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const { data } = await api.get(
        `/social/search?q=${encodeURIComponent(query)}`
      );
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
      setToast({
        message: error.response?.data?.message || "Failed to search users",
        type: "error",
      });
    } finally {
      setSearching(false);
    }
  };

  const viewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="pb-20">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Find Friends</h1>
        <p className="text-blue-100 text-sm">
          Search for users and check out their progress
        </p>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search by username..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="px-4">
        {searchQuery.length < 2 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">Search for Users</h3>
            <p className="text-gray-600">
              Type at least 2 characters to find other gym members
            </p>
          </div>
        ) : searchResults.length === 0 && !searching ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">No Users Found</h3>
            <p className="text-gray-600">No users match "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {searchResults.map((user) => (
              <button
                key={user._id}
                onClick={() => viewProfile(user._id)}
                className="w-full bg-white rounded-lg shadow p-4 flex items-center justify-between hover:bg-gray-50 active:scale-98 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">{user.username}</h3>
                    <p className="text-sm text-gray-500">
                      Member since{" "}
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="text-blue-500">→</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Popular Section (Coming Soon) */}
      {searchQuery.length === 0 && (
        <div className="p-4 mt-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 text-center border-2 border-purple-200">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="font-bold text-purple-900 mb-2">Coming Soon!</h3>
            <p className="text-sm text-purple-700">
              • Leaderboards
              <br />
              • Follow friends
              <br />
              • Activity feed
              <br />• Workout challenges
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Social;
