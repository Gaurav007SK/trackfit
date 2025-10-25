import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const PlanManager = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get("/plans");
      setPlans(data);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const activatePlan = async (id) => {
    try {
      await api.put(`/plans/${id}/activate`);
      fetchPlans();
    } catch (error) {
      console.error("Error activating plan:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Workout Plans</h1>

      <button
        onClick={() => navigate("/plan-builder")}
        className="w-full bg-blue-500 text-white py-4 rounded-lg font-bold text-lg mb-4 active:scale-95 transform transition shadow-lg hover:bg-blue-600">
        + Create New Plan
      </button>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No plans yet. Create your first workout plan!
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className={`bg-white rounded-lg shadow p-4 border-2 ${
                plan.isActive ? "border-blue-500" : "border-transparent"
              }`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <p className="text-sm text-gray-500">
                    {plan.daysPerWeek} days per week
                  </p>
                </div>
                {plan.isActive && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1">
                {plan.schedule.map((day) => (
                  <div key={day._id} className="text-sm text-gray-600">
                    <span className="font-medium">{day.dayName}:</span>{" "}
                    {day.exercises.length} exercises
                  </div>
                ))}
              </div>

              {!plan.isActive && (
                <button
                  onClick={() => activatePlan(plan._id)}
                  className="mt-3 w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium active:bg-gray-200">
                  Activate Plan
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlanManager;
