const ExerciseCard = ({ exercise, setCount }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-1">{exercise.exerciseName}</h2>
          <div className="flex items-center gap-3 text-sm text-blue-100">
            <span>
              Target: {exercise.targetSets || 3} sets ×{" "}
              {exercise.targetReps || 10} reps
            </span>
            {!exercise.wasPlanned && (
              <span className="bg-purple-500/50 px-2 py-0.5 rounded-full text-xs">
                Extra
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-blue-200">Progress</div>
          <div className="text-2xl font-bold">
            {setCount}/{exercise.targetSets || 3}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseCard;
