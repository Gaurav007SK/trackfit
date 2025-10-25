import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const Login = ({ onSwitchToRegister, onForgotPassword }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.username, formData.password);

    if (!result.success) {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center gradient-primary p-4 overflow-hidden">
      <div className="card p-8 w-full max-w-md animate-fadeIn overflow-y-auto max-h-[95vh]">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-4 animate-float">
            <h1 className="text-5xl">🏋️</h1>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TrackFit
          </h2>
          <p className="text-gray-500 mt-2">Welcome back! Login to continue</p>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-xl mb-6 animate-scale-in">
            <p className="font-medium">⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              USERNAME
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="input-modern"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">
              PASSWORD
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-modern"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button
            onClick={onForgotPassword}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline transition-colors">
            🔑 Forgot Password?
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">New here?</span>
            </div>
          </div>

          <button onClick={onSwitchToRegister} className="btn-secondary w-full">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
