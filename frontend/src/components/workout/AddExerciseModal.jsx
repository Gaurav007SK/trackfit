import { useState } from "react";
import { IoSearchOutline, IoClose, IoAddCircleOutline } from "react-icons/io5";
import { MdFitnessCenter } from "react-icons/md";

const AddExerciseModal = ({ availableExercises, onAdd, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = availableExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MdFitnessCenter className="text-blue-600" />
            Add Extra Exercise
          </h3>
          <button
            onClick={() => {
              setSearchQuery("");
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition">
            <IoClose className="text-2xl text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {filteredExercises.map((exercise) => (
              <button
                key={exercise._id}
                onClick={() => onAdd(exercise)}
                className="w-full card-interactive p-4 bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-purple-50 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {exercise.name}
                    </h4>
                    <p className="text-sm text-gray-500">{exercise.category}</p>
                  </div>
                  <IoAddCircleOutline className="text-2xl text-blue-600" />
                </div>
              </button>
            ))}
            {filteredExercises.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <MdFitnessCenter className="text-5xl mx-auto mb-2 text-gray-300" />
                <p>No exercises found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExerciseModal;
