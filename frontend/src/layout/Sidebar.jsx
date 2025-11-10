import { NavLink } from "react-router-dom";
import { User2, BadgeCheck, Trophy, Briefcase } from "lucide-react";

const navItemClasses = ({ isActive }) =>
  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
  }`;

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-white h-full p-4">
      <div className="text-2xl font-bold mb-6 text-blue-700">SkillBridge</div>
      <nav className="space-y-2">
        <NavLink to="profile" className={navItemClasses}>
          <User2 className="h-5 w-5" />
          <span>Profile</span>
        </NavLink>
        <NavLink to="skills" className={navItemClasses}>
          <BadgeCheck className="h-5 w-5" />
          <span>Skills</span>
        </NavLink>
        <NavLink to="achievements" className={navItemClasses}>
          <Trophy className="h-5 w-5" />
          <span>Achievements</span>
        </NavLink>
        <NavLink to="internships" className={navItemClasses}>
          <Briefcase className="h-5 w-5" />
          <span>Internships</span>
        </NavLink>
      </nav>
    </aside>
  );
}
