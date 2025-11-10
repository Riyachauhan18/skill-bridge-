import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-xl w-full p-8 text-center">
        <h1 className="text-5xl font-extrabold text-blue-700">SkillBridge</h1>
        <p className="mt-4 text-gray-600">Student Data & Internship Management System</p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/login?role=student"
            className="px-6 py-3 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            Student Login
          </Link>
          <Link
            to="/login?role=admin"
            className="px-6 py-3 rounded-md border border-blue-600 text-blue-600 font-medium hover:bg-blue-50"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
