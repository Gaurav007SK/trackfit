import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Don't show bottom nav on auth screen, plan builder, active workout, or profile pages
  if (
    !user ||
    location.pathname === "/auth" ||
    location.pathname === "/plan-builder" ||
    location.pathname === "/workout" ||
    location.pathname.startsWith("/profile/")
  ) {
    return null;
  }

  const navItems = [
    { path: "/", icon: "🏠", label: "Today" },
    { path: "/plans", icon: "📅", label: "Plans" },
    { path: "/exercises", icon: "📚", label: "Library" },
    { path: "/progress", icon: "📊", label: "Progress" },
    { path: "/social", icon: "👥", label: "Social" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 shadow-2xl z-50">
      <div className="max-w-md mx-auto flex justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center py-3 transition-all duration-200 ${
                isActive
                  ? "text-blue-600 scale-110"
                  : "text-gray-400 hover:text-gray-600 active:text-blue-500"
              }`}>
              <div
                className={`relative ${isActive ? "animate-bounce-slow" : ""}`}>
                <span className="text-2xl mb-1">{item.icon}</span>
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full shadow-glow"></div>
                )}
              </div>
              <span
                className={`text-xs font-semibold ${
                  isActive ? "font-bold" : "font-medium"
                }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
