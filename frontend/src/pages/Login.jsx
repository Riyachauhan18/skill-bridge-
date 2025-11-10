import { useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [params] = useSearchParams();
  const role = useMemo(() => params.get("role") || "student", [params]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center">{role === 'admin' ? 'Admin' : 'Student'} Login</h2>
        <p className="mt-1 text-center text-sm text-gray-500">Sign in with your email and password</p>

        <form className="mt-6 space-y-4" onSubmit={(e)=>{e.preventDefault(); navigate('/dashboard');}}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="••••••••" />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700">Login</button>
        </form>

        <div className="mt-4 text-xs text-center text-gray-500">
          <Link to="/" className="hover:underline">Back to landing</Link>
        </div>
      </div>
    </div>
  );
}
