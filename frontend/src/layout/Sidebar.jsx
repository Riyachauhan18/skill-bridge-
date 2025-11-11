import { NavLink, useLocation } from "react-router-dom";
import { User2, BadgeCheck, Trophy, Briefcase, Users } from "lucide-react";

const navItemClasses = ({ isActive }) =>
  `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
    isActive
      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
  }`;

export default function Sidebar() {
  const location = useLocation();
  const search = location.search || "";
  return (
    <aside className="w-64 border-r bg-white h-full p-4 space-y-4">
      <div className="px-2">
        <div className="text-xl font-bold text-slate-900">SkillBridge</div>
        <p className="text-xs text-slate-500">Student Dashboard</p>
      </div>
      <nav className="space-y-1">
        <NavLink to={`overview${search}`} className={navItemClasses}>
          <User2 className="h-5 w-5 transition-colors" />
          <span className="transition-colors">Overview</span>
        </NavLink>
        <NavLink to={`profile${search}`} className={navItemClasses}>
          <User2 className="h-5 w-5 transition-colors" />
          <span className="transition-colors">Profile</span>
        </NavLink>
        <NavLink to={`seniors${search}`} className={navItemClasses}>
          <Users className="h-5 w-5 transition-colors" />
          <span className="transition-colors">Guidance Hub</span>
        </NavLink>
      </nav>
    </aside>
  );
}
