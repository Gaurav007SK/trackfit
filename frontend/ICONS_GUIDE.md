# Icons Guide - React Icons

## Installation

```bash
npm install react-icons
```

## How to Use Icons

### 1. Import the icons you want to use

React Icons provides access to multiple icon libraries:

```jsx
// Material Design Icons
import { MdFitnessCenter, MdDelete, MdEdit } from "react-icons/md";

// Font Awesome Icons
import { FaDumbbell, FaRunning, FaUser } from "react-icons/fa";

// Ionicons (Modern, Clean)
import { IoLogOutOutline, IoChevronDown, IoHome } from "react-icons/io5";

// Heroicons (Tailwind's Icons)
import { HiOutlineUser, HiOutlineCog } from "react-icons/hi";

// Game Icons (Fitness specific!)
import { GiWeightLiftingUp, GiMuscleUp, GiStrongMan } from "react-icons/gi";

// Bootstrap Icons
import { BsFillPersonFill, BsCalendar } from "react-icons/bs";
```

### 2. Use them like regular React components

```jsx
<GiWeightLiftingUp className="text-2xl text-white" />
<IoLogOutOutline className="text-lg text-red-600" />
<MdFitnessCenter size={24} color="#3B82F6" />
```

## Icon Properties

```jsx
// Using className (Tailwind CSS)
<FaDumbbell className="text-blue-500 text-xl" />

// Using size and color props
<FaDumbbell size={20} color="#3B82F6" />

// With hover effects
<MdDelete className="text-red-500 hover:text-red-700 cursor-pointer transition-colors" />

// In buttons
<button className="flex items-center gap-2">
  <FaRunning />
  <span>Start Workout</span>
</button>
```

## Popular Icon Libraries in React Icons

### 1. **Ionicons (io5)** - Modern & Clean

```jsx
import {
  IoHome,
  IoSettings,
  IoLogOutOutline,
  IoChevronDown,
  IoAddCircle,
  IoTrash,
} from "react-icons/io5";
```

### 2. **Material Design (md)** - Google's Design

```jsx
import {
  MdFitnessCenter,
  MdDashboard,
  MdEdit,
  MdDelete,
  MdCheck,
} from "react-icons/md";
```

### 3. **Font Awesome (fa)** - Most Popular

```jsx
import {
  FaDumbbell,
  FaRunning,
  FaUser,
  FaChartLine,
  FaClock,
} from "react-icons/fa";
```

### 4. **Game Icons (gi)** - Perfect for Fitness!

```jsx
import {
  GiWeightLiftingUp,
  GiMuscleUp,
  GiStrongMan,
  GiBiceps,
  GiHealthNormal,
} from "react-icons/gi";
```

### 5. **Heroicons (hi)** - Tailwind CSS Icons

```jsx
import {
  HiOutlineUser,
  HiOutlineCog,
  HiOutlineHome,
  HiOutlineChartBar,
} from "react-icons/hi";
```

## Example: Updated Bottom Navigation with Icons

```jsx
import {
  IoHome,
  IoCalendarOutline,
  IoBarChartOutline,
  IoPersonOutline,
} from "react-icons/io5";
import { GiWeightLiftingUp } from "react-icons/gi";

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center py-2">
        <button className="flex flex-col items-center gap-1">
          <IoHome className="text-2xl text-blue-600" />
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <IoCalendarOutline className="text-2xl" />
          <span className="text-xs">Plans</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <GiWeightLiftingUp className="text-2xl" />
          <span className="text-xs">Exercises</span>
        </button>
        <button className="flex flex-col items-center gap-1">
          <IoBarChartOutline className="text-2xl" />
          <span className="text-xs">Progress</span>
        </button>
      </div>
    </nav>
  );
};
```

## Fitness-Specific Icon Recommendations

### Workout Related

- `GiWeightLiftingUp` - Weightlifting
- `GiMuscleUp` - Muscle building
- `FaDumbbell` - Gym/Fitness
- `FaRunning` - Cardio
- `MdFitnessCenter` - Gym

### Navigation

- `IoHome` - Home
- `IoCalendarOutline` - Calendar/Plans
- `IoBarChartOutline` - Progress/Stats
- `IoPersonOutline` - Profile

### Actions

- `IoAddCircle` - Add new
- `MdEdit` - Edit
- `IoTrash` - Delete
- `MdCheck` - Complete
- `IoPlayCircle` - Start

### UI Elements

- `IoChevronDown` - Dropdown
- `IoChevronBack` - Back button
- `IoClose` - Close
- `IoMenu` - Menu
- `IoSearch` - Search

## Browse All Icons

Visit: https://react-icons.github.io/react-icons/

Search for any icon and copy the import statement!

## Example: Button with Icon

```jsx
// Primary Action Button
<button className="btn-primary flex items-center gap-2">
  <IoAddCircle className="text-xl" />
  <span>Add Exercise</span>
</button>

// Danger Button
<button className="btn-danger flex items-center gap-2">
  <IoTrash className="text-lg" />
  <span>Delete</span>
</button>

// Icon Only Button
<button className="p-2 rounded-lg hover:bg-gray-100">
  <MdEdit className="text-xl text-blue-600" />
</button>
```

## Tips

1. **Consistency**: Pick one icon library (like Ionicons) and stick with it for a consistent look
2. **Size**: Use Tailwind classes like `text-xl`, `text-2xl` or size prop for icons
3. **Color**: Match your app's color scheme using Tailwind colors
4. **Accessibility**: Add `aria-label` for icon-only buttons
5. **Performance**: Only import the icons you use (tree-shaking works automatically)

## Current Implementation

I've updated the Navbar with:

- `GiWeightLiftingUp` for the logo (instead of 🏋️ emoji)
- `IoChevronDown` for the dropdown arrow
- `IoLogOutOutline` for the logout button (instead of 🚪 emoji)

You can now replace emojis throughout your app with these professional icons!
