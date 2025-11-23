import { GiTrophy } from "react-icons/gi";

const RecordsTab = ({ prs }) => {
  if (prs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <GiTrophy className="text-6xl text-yellow-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">No Records Yet</h3>
        <p className="text-gray-600">
          Complete workouts to track your personal records
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-white rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-3">
          <GiTrophy className="text-4xl" />
          <div>
            <h3 className="text-xl font-bold">Personal Records</h3>
            <p className="text-amber-100 text-sm">Your best lifts</p>
          </div>
        </div>
      </div>

      {prs.map(([exerciseName, record], index) => (
        <div key={exerciseName} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                index === 0
                  ? "bg-yellow-500"
                  : index === 1
                  ? "bg-gray-400"
                  : index === 2
                  ? "bg-amber-600"
                  : "bg-blue-500"
              }`}>
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-bold">{exerciseName}</h4>
              <p className="text-sm text-gray-500">
                {new Date(record.date).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {record.weight} kg
              </div>
              <div className="text-sm text-gray-500">{record.reps} reps</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecordsTab;
