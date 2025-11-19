import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [showForgot, setShowForgot] = useState(false);
  const [fpStep, setFpStep] = useState('request'); // 'request' | 'reset'
  const [identifier, setIdentifier] = useState('');
  const [fpCode, setFpCode] = useState('');
  const [newPw, setNewPw] = useState('');

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <header className="flex items-center justify-center py-6">
          <Link to="/" className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">SkillBridge</Link>
        </header>

        <main className="py-6">
          <div className="mx-auto max-w-xl">
            <div className="sb-card sb-card-pad bg-white text-black border-4 border-amber-500 rounded-2xl">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-black">Welcome Back!</h2>
                <p className="mt-1 text-sm text-black">Log in to continue.</p>
              </div>

              <form
                className="mt-6 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const email = form.elements.namedItem('email')?.value || '';
                  const password = form.elements.namedItem('password')?.value || '';
                  try {
                    const res = await api.post('/auth/login', { identifier: email, password });
                    const { token, user } = res.data || {};
                    if (token) localStorage.setItem('token', token);
                    if (user?.roll_number) localStorage.setItem('rollno', user.roll_number);
                    let role = user?.role || 'student';
                    if (!user?.role) {
                      const roll = user?.roll_number || localStorage.getItem('rollno') || '';
                      const m = roll.match(/^(\d{4})/i);
                      if (m) {
                        const year = parseInt(m[1], 10);
                        const currentYear = new Date().getFullYear();
                        role = year >= currentYear ? 'student' : 'admin';
                      }
                    }
                    if (role === 'admin') navigate(`/dashboard/admin?role=${role}`);
                    else navigate(`/dashboard?role=${role}`);
                  } catch (err) {
                    alert('Login failed');
                  }
                }}
              >
                <div>
                  <label className="sb-label text-black">Email or Roll Number</label>
                  <input
                    name="email"
                    className="sb-input-light mt-2 w-full text-xl py-5 h-14 placeholder-slate-800"
                    placeholder="you@jklu.edu.in or 2024btech053"
                  />
                </div>
                <div>
                  <label className="sb-label text-black">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="sb-input-light mt-2 w-full text-xl py-5 h-14 placeholder-slate-800"
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" className="w-full sb-btn text-black">Sign in</button>
                <button type="button" className="sb-btn-ghost-light w-full text-black" onClick={() => { setShowForgot(v => !v); }}>Forgot password?</button>
              </form>

              {showForgot && (
                <div className="mt-6 border-t pt-6 space-y-3">
                  {fpStep === 'request' && (
                    <div className="space-y-3">
                      <div className="text-sm text-black">Reset your password</div>
                      <input
                        className="sb-input-light w-full text-xl py-5 h-14 placeholder-slate-800"
                        placeholder="Email or Roll Number"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                      />
                      <button className="sb-btn w-full" onClick={async () => {
                        if (!identifier) { alert('Enter your email or roll number'); return; }
                        try {
                          const res = await api.post('/auth/forgot', { identifier });
                          alert(`Reset code: ${res.data?.code || 'sent to email (dev)'}`);
                          setFpStep('reset');
                        } catch { alert('Failed to request reset'); }
                      }}>Send code</button>
                    </div>
                  )}

                  {fpStep === 'reset' && (
                    <div className="space-y-3">
                      <div className="text-sm text-black">Enter the code and new password</div>
                      <input
                        className="sb-input-light w-full text-xl py-5 h-14 placeholder-slate-800"
                        placeholder="Code"
                        value={fpCode}
                        onChange={(e) => setFpCode(e.target.value)}
                      />
                      <input
                        type="password"
                        className="sb-input-light w-full text-xl py-5 h-14 placeholder-slate-800"
                        placeholder="New Password"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                      />
                      <button className="sb-btn w-full" onClick={async () => {
                        if (!identifier || !fpCode || !newPw) { alert('Fill all fields'); return; }
                        try {
                          await api.post('/auth/reset', { identifier, code: fpCode, new_password: newPw });
                          alert('Password reset. Please sign in.');
                          setShowForgot(false); setFpStep('request'); setIdentifier(''); setFpCode(''); setNewPw('');
                        } catch { alert('Failed to reset'); }
                      }}>Reset password</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="py-8">
          <div className="text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} SkillBridge. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
