import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show navbar on auth screens or when not logged in
  if (
    !user ||
    location.pathname === "/auth" ||
    location.pathname === "/workout"
  ) {
    return null;
  }

  // Get page title based on route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Today";
      case "/plans":
        return "Plans";
      case "/plan-builder":
        return "Plan Builder";
      case "/exercises":
        return "Exercise Library";
      case "/progress":
        return "Progress";
      case "/social":
        return "Social";
      default:
        if (location.pathname.startsWith("/profile/")) {
          return "Profile";
        }
        return "TrackFit";
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🏋️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TrackFit
              </h1>
              <p className="text-xs text-gray-500">{getPageTitle()}</p>
            </div>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-2 rounded-full border border-blue-200">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden sm:inline">
              {user?.username}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
