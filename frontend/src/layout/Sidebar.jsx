import { NavLink, useLocation } from "react-router-dom";
import { User2, BadgeCheck, Trophy, Briefcase, Users } from "lucide-react";

const navItemClasses = ({ isActive }) =>
  `group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
    isActive
      ? "bg-amber-50 text-amber-800 shadow-sm"
      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
  }`;

export default function Sidebar() {
  const location = useLocation();
  const search = location.search || "";
  return (
    <aside className="w-64 h-full p-4 space-y-6 bg-gradient-to-b from-white to-slate-50 border-r border-slate-200 shadow-sm">
      <div className="px-2 space-y-1">
        <div className="text-xl font-bold text-slate-900">SkillBridge</div>
        <p className="text-xs text-slate-700">Student Dashboard</p>
      </div>
      <nav className="space-y-1.5">
        <NavLink to={`overview${search}`} className={navItemClasses}>
          <User2 className="h-5 w-5 md:h-6 md:w-6 transition-colors" />
          <span className="transition-colors">Overview</span>
        </NavLink>
        <NavLink to={`profile${search}`} className={navItemClasses}>
          <User2 className="h-5 w-5 md:h-6 md:w-6 transition-colors" />
          <span className="transition-colors">Profile</span>
        </NavLink>
        <NavLink to={`seniors${search}`} className={navItemClasses}>
          <Users className="h-5 w-5 md:h-6 md:w-6 transition-colors" />
          <span className="transition-colors">Guidance Hub</span>
        </NavLink>
        <NavLink to={`messages${search}`} className={navItemClasses}>
          <Users className="h-5 w-5 md:h-6 md:w-6 transition-colors" />
          <span className="transition-colors">Messages</span>
        </NavLink>
      </nav>
    </aside>
  );
}
