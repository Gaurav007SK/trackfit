import { useState, useEffect } from "react";
import api from "../utils/api";
import { IoMdSearch } from "react-icons/io";

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = ["All", "Push", "Pull", "Legs", "Core"];

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [selectedCategory, searchQuery, exercises]);

  const fetchExercises = async () => {
    try {
      const { data } = await api.get("/exercises");
      setExercises(data);
      setFilteredExercises(data);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (selectedCategory !== "All") {
      filtered = filtered.filter((ex) => ex.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
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
      <h1 className="text-2xl font-bold mb-4">Exercise Library</h1>

      {/* Search */}
      <div className="relative mb-4">
        <IoMdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition ${
              selectedCategory === category
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 active:bg-gray-200"
            }`}>
            {category}
          </button>
        ))}
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        {filteredExercises.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            {exercises.length === 0 ? (
              <div>
                <p className="mb-4">
                  No exercises found. Seed the database first!
                </p>
                <button
                  onClick={async () => {
                    try {
                      await api.post("/exercises/seed");
                      fetchExercises();
                    } catch (error) {
                      console.error("Error seeding:", error);
                    }
                  }}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium">
                  Seed Exercises
                </button>
              </div>
            ) : (
              "No exercises match your search"
            )}
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <div
              key={exercise._id}
              className="bg-white rounded-lg shadow p-4 active:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold">{exercise.name}</h3>
                  <p className="text-sm text-gray-500">
                    {exercise.muscleGroups.join(", ")}
                  </p>
                </div>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {exercise.equipment}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExerciseLibrary;
