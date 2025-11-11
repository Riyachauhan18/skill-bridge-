import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-indigo-300 via-purple-300 to-blue-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.25),transparent_60%)]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <Link to="/" className="text-xl font-bold text-slate-900">SkillBridge</Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-4">
          <div className="mx-auto max-w-7xl flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-slate-900">Create your account</h2>
                  <p className="mt-1 text-sm text-slate-500">Sign up to get started.</p>
                </div>

                <form
                  className="mt-6 space-y-4"
                  onSubmit={(e)=>{
                    e.preventDefault();
                    const form = e.currentTarget;
                    const name = form.elements.namedItem('fullName')?.value || '';
                    const email = form.elements.namedItem('email')?.value || '';
                    const rollno = form.elements.namedItem('rollno')?.value || '';
                    try {
                      localStorage.setItem('fullName', name);
                      localStorage.setItem('email', email);
                      localStorage.setItem('rollno', rollno);
                    } catch {}
                    navigate('/login');
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input name="fullName" className="mt-2 sb-input" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Email Address</label>
                    <input name="email" type="email" className="mt-2 sb-input" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Roll Number</label>
                    <input name="rollno" className="mt-2 sb-input" placeholder="e.g., 2024btech053" />
                    <p className="mt-1 text-xs text-slate-500">Format example: 2024btech053</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <input type="password" className="mt-2 sb-input" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                    <input type="password" className="mt-2 sb-input" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">SIGN UP</button>
                </form>

                <div className="mt-4 text-sm text-center text-slate-600">
                  Already have an account? <Link to="/login" className="text-indigo-700 hover:underline">Log in</Link>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="px-6 py-8">
          <div className="mx-auto max-w-7xl text-center text-sm text-slate-600">
            © {new Date().getFullYear()} SkillBridge. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
