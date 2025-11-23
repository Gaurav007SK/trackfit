import { IoTimeOutline } from "react-icons/io5";

const WorkoutTimer = ({ elapsedTime }) => {
  // Format elapsed time as HH:MM:SS or MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm text-blue-100">
      <IoTimeOutline />
      <span className="font-mono font-semibold">{formatTime(elapsedTime)}</span>
    </div>
  );
};

export default WorkoutTimer;
