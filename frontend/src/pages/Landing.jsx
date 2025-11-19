import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen relative bg-black overflow-hidden">
      {/* backdrop image */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/university%20logo.webp')] bg-cover bg-center opacity-40" />
      {/* decorative accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(#fff 1px, transparent 1px)', backgroundSize:'22px 22px'}} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-16">
        <div className="mx-auto max-w-5xl w-full">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-10 md:p-14 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                <span className="text-white">Skill</span>
                <span className="text-amber-400">Bridge</span>
              </h1>
              <p className="mt-4 text-lg md:text-xl text-slate-200">Student Data & Internship Management System</p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link to="/login" className="px-6 py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 transition border border-amber-300">Login</Link>
                <Link to="/signup" className="px-6 py-3 rounded-lg border border-white/60 text-white hover:bg-white/10 transition">Sign up</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
