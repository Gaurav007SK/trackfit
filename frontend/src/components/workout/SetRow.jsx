import { useState } from "react";

const SetRow = ({ set, onUpdate, onDelete }) => {
  const [weight, setWeight] = useState(set.weight);
  const [reps, setReps] = useState(set.reps);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate(weight, reps);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-blue-600">Set {set.setNumber}</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-600 block mb-1">
              Weight (kg)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              step="0.5"
              min="0"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-600 block mb-1">Reps</label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              min="0"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-medium">
            Save
          </button>
          <button
            onClick={() => {
              setWeight(set.weight);
              setReps(set.reps);
              setIsEditing(false);
            }}
            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
          {set.setNumber}
        </div>
        <div>
          <div className="font-bold text-lg">
            {set.weight} kg × {set.reps} reps
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setIsEditing(true)}
          className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200">
          Edit
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200">
          ✕
        </button>
      </div>
    </div>
  );
};

export default SetRow;
