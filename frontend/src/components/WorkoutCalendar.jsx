import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCalendarOutline,
} from "react-icons/io5";

const WorkoutCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutData, setWorkoutData] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch active plan to know the schedule
      const planRes = await api.get("/plans/active");
      const plan = planRes.data;
      console.log("Active Plan:", plan);
      console.log("Plan Schedule:", plan?.schedule);
      setActivePlan(plan);

      // Fetch workout history for the current month
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );

      const workoutsRes = await api.get(
        `/workouts/history?startDate=${startOfMonth.toISOString()}&endDate=${endOfMonth.toISOString()}`
      );
      setWorkoutData(workoutsRes.data);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getDayStatus = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    // Check if there's a workout on this day with improved date matching
    const workout = workoutData.find((w) => {
      const workoutDate = new Date(w.date);
      // Compare by date components to avoid timezone issues
      return (
        workoutDate.getFullYear() === date.getFullYear() &&
        workoutDate.getMonth() === date.getMonth() &&
        workoutDate.getDate() === date.getDate()
      );
    });

    // Debug log for specific date
    if (day === 31 && currentDate.getMonth() === 9) {
      // October 31
      console.log("Oct 31 - Checking workout:", {
        workout: workout,
        status: workout?.status,
        date: date,
        workoutDate: workout?.date,
      });
    }

    // Check if this day is a planned workout day according to plan schedule
    const isWorkoutDay = activePlan && isPlannedWorkoutDay(date);

    // Today or Future dates
    if (date >= today) {
      // Check for workout in progress today
      if (date.getTime() === today.getTime() && workout) {
        if (workout.status === "completed") {
          return {
            status: "completed",
            color: "bg-green-100 text-green-700 border-green-300",
            label: "Completed Today",
            workout,
          };
        } else if (workout.status === "in-progress") {
          return {
            status: "in-progress",
            color: "bg-yellow-100 text-yellow-700 border-yellow-300",
            label: "In Progress",
            workout,
          };
        }
      }

      if (isWorkoutDay) {
        return {
          status: "upcoming",
          color: "bg-blue-100 text-blue-600 border-blue-300",
          label:
            date.getTime() === today.getTime()
              ? "Today's Workout"
              : "Planned Workout",
        };
      }
      // If there's an active plan but this isn't a workout day, it's a rest day
      if (activePlan) {
        return {
          status: "rest",
          color: "bg-purple-100 text-purple-600 border-purple-300",
          label: "Rest Day",
        };
      }
      // No active plan
      return {
        status: "future",
        color: "bg-gray-50 text-gray-400",
        label: "No Plan",
      };
    }

    // Past dates
    if (workout) {
      if (workout.status === "completed") {
        return {
          status: "completed",
          color: "bg-green-100 text-green-700 border-green-300",
          label: "Completed",
          workout,
        };
      } else if (workout.status === "skipped") {
        return {
          status: "skipped",
          color: "bg-red-100 text-red-700 border-red-300",
          label: "Skipped",
          workout,
        };
      }
    }

    // Check if it was supposed to be a workout day but was missed
    if (isWorkoutDay) {
      return {
        status: "missed",
        color: "bg-orange-100 text-orange-700 border-orange-300",
        label: "Missed",
      };
    }

    // Rest day (past date, no workout, not a planned workout day)
    if (activePlan) {
      return {
        status: "rest",
        color: "bg-purple-100 text-purple-600 border-purple-300",
        label: "Rest Day",
      };
    }

    // No plan at all
    return {
      status: "rest",
      color: "bg-gray-50 text-gray-400",
      label: "No Plan",
    };
  };

  const isPlannedWorkoutDay = (date) => {
    if (!activePlan || !activePlan.schedule || activePlan.schedule.length === 0)
      return false;

    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[dayOfWeek];

    // Log schedule details (only once)
    if (date.getDate() === 1) {
      console.log("Schedule array:", activePlan.schedule);
      console.log(
        "Schedule weekDays:",
        activePlan.schedule.map((d) => d.weekDay)
      );
    }

    // Check if this day is in the plan's schedule using weekDay field
    const isPlanned = activePlan.schedule.some(
      (day) =>
        day.weekDay && day.weekDay.toLowerCase() === dayName.toLowerCase()
    );

    return isPlanned;
  };

  const changeMonth = (direction) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-gray-800 text-xl flex items-center gap-2">
            <IoCalendarOutline className="text-blue-600" />
            Workout Calendar
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {activePlan ? `Following: ${activePlan.name}` : "No active plan"}
          </p>
        </div>
        <button
          onClick={goToToday}
          className="btn-secondary text-sm px-3 py-1.5">
          Today
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <IoChevronBackOutline className="text-xl text-gray-600" />
        </button>
        <h4 className="text-lg font-bold text-gray-800">
          {monthName} {year}
        </h4>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <IoChevronForwardOutline className="text-xl text-gray-600" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {[...Array(startingDayOfWeek)].map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}

        {/* Days of the month */}
        {[...Array(daysInMonth)].map((_, index) => {
          const day = index + 1;
          const dayStatus = getDayStatus(day);
          const isToday =
            day === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={day}
              className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center transition-all hover:scale-105 cursor-pointer relative ${
                dayStatus.color
              } ${isToday ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
              title={dayStatus.label}>
              <span className="font-bold text-sm">{day}</span>
              {dayStatus.workout && (
                <div className="absolute bottom-1 flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-current"></div>
                </div>
              )}
              {dayStatus.status === "upcoming" && (
                <div className="absolute top-1 right-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-600 mb-3">LEGEND</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
            <span className="text-gray-600">Skipped</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-100 border-2 border-orange-300"></div>
            <span className="text-gray-600">Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-100 border-2 border-purple-300"></div>
            <span className="text-gray-600">Rest Day</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
            <span className="text-gray-600">Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;
