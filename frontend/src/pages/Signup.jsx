import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="flex items-center justify-center py-6">
          <Link to="/" className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">SkillBridge</Link>
        </header>

        <main className="py-6">
          <div className="mx-auto max-w-lg">
            <div className="sb-card sb-card-pad text-black bg-white border-4 border-amber-500 rounded-3xl shadow-xl">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-black">Create your account</h1>
                <p className="mt-2 text-sm text-black">Sign up to get started.</p>
              </div>

              <form
                className="mt-8 space-y-5"
                onSubmit={async (e)=>{
                    e.preventDefault();
                    const form = e.currentTarget;
                    const full_name = form.elements.namedItem('fullName')?.value || '';
                    const emailRaw = form.elements.namedItem('email')?.value || '';
                    const email = emailRaw.includes('@') ? emailRaw : `${emailRaw}@jklu.edu.in`;
                    const rollno = form.elements.namedItem('rollno')?.value || '';
                    const pw = form.elements.namedItem('password')?.value || '';
                    const confirm = form.elements.namedItem('confirm')?.value || '';
                    if (!pw || pw !== confirm) { alert('Passwords do not match'); return; }
                    try {
                      const res = await api.post('/auth/signup', { full_name, email, rollno, password: pw });
                      const { token, user } = res.data || {};
                      if (token) localStorage.setItem('token', token);
                      if (user?.roll_number) localStorage.setItem('rollno', user.roll_number);
                      let role = user?.role || 'student';
                      if (!user?.role && user?.roll_number) {
                        const m = user.roll_number.match(/^(\d{4})/);
                        if (m) {
                          const year = parseInt(m[1], 10);
                          const currentYear = new Date().getFullYear();
                          role = year >= currentYear ? 'student' : 'admin';
                        }
                      }
                      if (role === 'admin') navigate(`/dashboard/admin?role=${role}`);
                      else navigate(`/dashboard?role=${role}`);
                    } catch (err) {
                      alert('Signup failed. Ensure JKLU email and valid roll number format (e.g., 2024btech053).');
                    }
                  }}
              >
                <div>
                  <label className="sb-label font-medium text-black">Full Name</label>
                  <input
                    name="fullName"
                    className="sb-input mt-2 w-full text-lg py-4 h-14 rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-slate-800"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="sb-label font-medium text-black">JKLU Email</label>
                  <input
                    name="email"
                    type="email"
                    className="sb-input mt-2 w-full text-lg py-4 h-14 rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-slate-800"
                    placeholder="you@jklu.edu.in"
                  />
                  <p className="mt-2 text-xs text-black">Only @jklu.edu.in emails are allowed</p>
                </div>
                <div>
                  <label className="sb-label font-medium text-black">Roll Number</label>
                  <input
                    name="rollno"
                    className="sb-input mt-2 w-full text-lg py-4 h-14 rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-slate-800"
                    placeholder="e.g., 2024btech053"
                  />
                  <p className="mt-2 text-xs text-black">Format example: 2024btech053</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="sb-label font-medium text-black">Password</label>
                    <input
                      name="password"
                      type="password"
                      className="sb-input mt-2 w-full text-lg py-4 h-14 rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-slate-800"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="sb-label font-medium text-black">Confirm Password</label>
                    <input
                      name="confirm"
                      type="password"
                      className="sb-input mt-2 w-full text-lg py-4 h-14 rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-slate-800"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full sb-btn h-12 text-base font-semibold text-black hover:brightness-110 transition"
                >
                  Sign up
                </button>
              </form>

              <div className="mt-6 text-sm text-center text-black">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-black underline-offset-2 hover:underline"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-8">
          <div className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} SkillBridge. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
