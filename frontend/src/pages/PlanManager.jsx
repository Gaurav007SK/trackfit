import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  MdEdit,
  MdDelete,
  MdAdd,
  MdFitnessCenter,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import { IoCalendarOutline, IoCheckmarkCircle } from "react-icons/io5";
import { GiWeightLiftingUp } from "react-icons/gi";

const PlanManager = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [expandedPlan, setExpandedPlan] = useState(null);

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
      setToast({
        message: "Plan activated successfully!",
        type: "success",
      });
      fetchPlans();
    } catch (error) {
      console.error("Error activating plan:", error);
      setToast({
        message: error.response?.data?.message || "Failed to activate plan",
        type: "error",
      });
    }
  };

  const handleEditPlan = (plan) => {
    // Navigate to plan builder with plan data for editing
    navigate("/plan-builder", { state: { editPlan: plan } });
  };

  const handleDeletePlan = (plan) => {
    setConfirmDialog({
      title: "Delete Plan?",
      message: `Are you sure you want to delete "${plan.name}"? This action cannot be undone.`,
      onConfirm: () => deletePlan(plan._id),
      onCancel: () => setConfirmDialog(null),
    });
  };

  const deletePlan = async (id) => {
    try {
      await api.delete(`/plans/${id}`);
      setToast({
        message: "Plan deleted successfully!",
        type: "success",
      });
      fetchPlans();
      setConfirmDialog(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
      setToast({
        message: error.response?.data?.message || "Failed to delete plan",
        type: "error",
      });
      setConfirmDialog(null);
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
    <div className="p-4 pb-20">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Workout Plans
        </h1>
        <p className="text-gray-500 text-sm">
          Create and manage your personalized workout plans
        </p>
      </div>

      <button
        onClick={() => navigate("/plan-builder")}
        className="btn-primary w-full py-4 text-lg mb-6 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
        <MdAdd className="text-2xl" />
        <span>Create New Plan</span>
      </button>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="card p-12 text-center animate-fadeIn">
            <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-6 animate-float">
              <GiWeightLiftingUp className="text-7xl text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              No Plans Yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Create your first workout plan to start tracking your fitness
              journey!
            </p>
            <button
              onClick={() => navigate("/plan-builder")}
              className="btn-primary px-6 py-3 inline-flex items-center gap-2">
              <MdAdd className="text-xl" />
              Get Started
            </button>
          </div>
        ) : (
          plans.map((plan) => {
            const isExpanded = expandedPlan === plan._id;

            return (
              <div
                key={plan._id}
                className={`card overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.isActive
                    ? "border-2 border-blue-500 shadow-lg ring-2 ring-blue-100"
                    : "border border-gray-200 hover:border-blue-300"
                }`}>
                {/* Header Section - Always Visible */}
                <div
                  className={`p-5 cursor-pointer ${
                    plan.isActive
                      ? "bg-gradient-to-r from-blue-50 to-purple-50"
                      : "bg-white"
                  }`}
                  onClick={() => setExpandedPlan(isExpanded ? null : plan._id)}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-2xl text-gray-800">
                          {plan.name}
                        </h3>
                        {plan.isActive && (
                          <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-md flex items-center gap-1">
                            <IoCheckmarkCircle className="text-sm" />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <IoCalendarOutline className="text-blue-600" />
                          <span className="font-medium">
                            {plan.daysPerWeek}
                          </span>{" "}
                          days/week
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MdFitnessCenter className="text-purple-600" />
                          <span className="font-medium">
                            {plan.schedule.reduce(
                              (sum, day) => sum + day.exercises.length,
                              0
                            )}
                          </span>{" "}
                          total exercises
                        </span>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors ml-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedPlan(isExpanded ? null : plan._id);
                      }}>
                      {isExpanded ? (
                        <MdExpandLess className="text-2xl text-gray-600" />
                      ) : (
                        <MdExpandMore className="text-2xl text-gray-600" />
                      )}
                    </button>
                  </div>

                  {/* Quick Action Buttons - Always Visible */}
                  <div
                    className="flex gap-2"
                    onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all text-sm font-medium flex items-center justify-center gap-1">
                      <MdEdit className="text-lg" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeletePlan(plan)}
                      className="flex-1 p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all text-sm font-medium flex items-center justify-center gap-1">
                      <MdDelete className="text-lg" />
                      Delete
                    </button>
                    {!plan.isActive && (
                      <button
                        onClick={() => activatePlan(plan._id)}
                        className="flex-1 p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 active:scale-95 transition-all text-sm font-medium flex items-center justify-center gap-1">
                        <IoCheckmarkCircle className="text-lg" />
                        Activate
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Schedule Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 animate-fadeIn">
                    <div className="border-t border-gray-200 pt-4 mb-4"></div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <IoCalendarOutline className="text-blue-600" />
                      Workout Schedule
                    </h4>
                    <div className="space-y-2">
                      {plan.schedule.map((day, index) => (
                        <div
                          key={day._id}
                          className="card-interactive p-4 bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold shadow-md">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">
                                  {day.dayName}
                                </h4>
                                {day.weekDay && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <IoCalendarOutline className="text-xs" />
                                    {day.weekDay}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-blue-600">
                                {day.exercises.length} exercises
                              </div>
                              <div className="text-xs text-gray-500">
                                {day.exercises.reduce(
                                  (sum, ex) =>
                                    sum + (ex.sets || ex.targetSets || 3),
                                  0
                                )}{" "}
                                total sets
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PlanManager;
