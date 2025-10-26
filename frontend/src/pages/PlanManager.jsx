import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Toast from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import { IoCalendarOutline } from "react-icons/io5";

const PlanManager = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

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

      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        My Workout Plans
      </h1>

      <button
        onClick={() => navigate("/plan-builder")}
        className="btn-primary w-full py-4 text-lg mb-6 flex items-center justify-center gap-2">
        <MdAdd className="text-2xl" />
        <span>Create New Plan</span>
      </button>

      <div className="space-y-4">
        {plans.length === 0 ? (
          <div className="card p-8 text-center">
            <IoCalendarOutline className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No Plans Yet
            </h3>
            <p className="text-gray-500">
              Create your first workout plan to get started!
            </p>
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className={`card p-4 border-2 transition-all ${
                plan.isActive
                  ? "border-blue-500 shadow-lg"
                  : "border-transparent"
              }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-xl text-gray-800">
                      {plan.name}
                    </h3>
                    {plan.isActive && (
                      <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-sm">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {plan.daysPerWeek} days per week
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all"
                    title="Edit Plan">
                    <MdEdit className="text-xl" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all"
                    title="Delete Plan">
                    <MdDelete className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Schedule Preview */}
              <div className="mt-4 space-y-2 bg-gray-50 rounded-lg p-3">
                {plan.schedule.map((day) => (
                  <div
                    key={day._id}
                    className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">
                      {day.dayName}
                      {day.weekDay && (
                        <span className="text-gray-500 ml-2">
                          ({day.weekDay})
                        </span>
                      )}
                    </span>
                    <span className="text-gray-600">
                      {day.exercises.length} exercises
                    </span>
                  </div>
                ))}
              </div>

              {/* Activate Button */}
              {!plan.isActive && (
                <button
                  onClick={() => activatePlan(plan._id)}
                  className="mt-4 w-full btn-secondary py-2.5 text-sm font-semibold">
                  Set as Active Plan
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
