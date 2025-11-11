import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen relative bg-[url('/university%20logo.webp')] bg-cover bg-center">
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/60 to-white/50" />
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="sb-container">
          <div className="mx-auto max-w-2xl text-center rounded-xl border border-white/60 bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/50 shadow-sm p-8 md:p-10">
            <h1 className="text-5xl font-extrabold text-blue-700">SkillBridge</h1>
            <p className="mt-4 text-slate-700">Student Data & Internship Management System</p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link to="/login" className="sb-btn">Login</Link>
              <Link to="/signup" className="sb-btn-ghost border-blue-200 text-blue-700">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
