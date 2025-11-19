import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Trophy, Briefcase, Sparkles } from "lucide-react";

export default function Overview() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const role = params.get("role") || "student";
  const isStudent = role === "student";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ counts: {}, skills: { technical: [], soft: [] }, achievements: [], internships: [], user: {}, profile: {} });
  const [displayCounts, setDisplayCounts] = useState({ achievements: 0, internships: 0, skills: 0 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/dashboard/overview');
        if (!mounted) return;
        setData(res.data || {});
      } catch (e) {
        // ignore; cards will show blanks
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const counts = data.counts || {};
  const achievements = data.achievements || [];
  const internships = data.internships || [];
  const research = data.research || [];
  const skills = data.skills || { technical: [], soft: [] };
  const fullName = data.user?.full_name || '';
  const firstName = fullName ? fullName.split(' ')[0] : '';

  useEffect(() => {
    if (loading) return;
    const target = {
      achievements: counts.achievements ?? 0,
      internships: counts.internships ?? 0,
      skills: (counts.technicalSkills ?? 0) + (counts.softSkills ?? 0),
    };
    const duration = 500;
    const frameDuration = 16;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const interval = setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      setDisplayCounts({
        achievements: Math.round(target.achievements * progress),
        internships: Math.round(target.internships * progress),
        skills: Math.round(target.skills * progress),
      });
      if (progress === 1) clearInterval(interval);
    }, frameDuration);

    return () => clearInterval(interval);
  }, [loading, counts.achievements, counts.internships, counts.technicalSkills, counts.softSkills]);

  return (
    <div className="bg-[#F5F7FA] text-slate-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Hero banner */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-sky-50 shadow-sm">
          <div className="px-6 py-5 md:px-8 md:py-6 flex items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="text-xs md:text-sm font-medium uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>{isStudent ? "Student Dashboard" : "Admin view"}</span>
              </div>
              <h1 className="text-[28px] md:text-[32px] lg:text-[36px] font-extrabold tracking-tight text-slate-900">
                {firstName ? `Welcome back, ${firstName}` : "Your Dashboard Overview"}
              </h1>
              <p className="text-sm md:text-base text-slate-600 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span role="img" aria-label="trophy">🏆</span>
                  <span>Track achievements</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="inline-flex items-center gap-1">
                  <span role="img" aria-label="briefcase">💼</span>
                  <span>Monitor internships</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="inline-flex items-center gap-1">
                  <span role="img" aria-label="sparkles">✨</span>
                  <span>Grow your skills</span>
                </span>
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const searchString = params.toString();
                    navigate(`/dashboard/edit-info${searchString ? `?${searchString}` : ""}`);
                  }}
                  className="inline-flex items-center gap-2 rounded-full bg-[#3366FF] hover:bg-[#2850CC] text-white text-sm font-semibold px-4 py-2 shadow-sm hover:shadow-md transition-all"
                >
                  <span>Update Profile</span>
                </button>
                <span className="text-xs text-slate-500">Keep your profile up to date for better mentor and internship matches.</span>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center relative">
              <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.12)] border border-slate-200 flex items-center justify-center overflow-hidden">
                <img
                  src="/JK_Lakshmipat_University_Logo.jpg"
                  alt="JKLU"
                  className="h-16 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 md:p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Achievements</div>
                <div className="text-[11px] text-slate-400">Total recorded</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shadow-xs">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <div className="mt-1 text-[32px] md:text-[40px] font-extrabold text-slate-900 leading-none">
              {loading ? "—" : displayCounts.achievements}
            </div>
          </div>

          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 md:p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Internships</div>
                <div className="text-[11px] text-slate-400">Total recorded</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shadow-xs">
                <Briefcase className="h-5 w-5 text-[#3366FF]" />
              </div>
            </div>
            <div className="mt-1 text-[32px] md:text-[40px] font-extrabold text-slate-900 leading-none">
              {loading ? "—" : displayCounts.internships}
            </div>
          </div>

          <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-4 md:p-5 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Skills</div>
                <div className="text-[11px] text-slate-400">Total recorded</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center shadow-xs">
                <Sparkles className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="mt-1 text-[32px] md:text-[40px] font-extrabold text-slate-900 leading-none">
              {loading ? "—" : displayCounts.skills}
            </div>
          </div>
        </section>

        {/* Main content grid */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Left column: Research + Achievements */}
          <div className="space-y-4">
            <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 md:p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg" role="img" aria-label="lab">🧪</span>
                  <h3 className="text-[18px] md:text-[20px] font-semibold text-slate-900">Recent Research</h3>
                </div>
                <button className="text-xs font-medium text-[#3366FF] hover:text-[#2850CC]">View All</button>
              </div>
              <ul className="mt-1 space-y-2">
                {research.length === 0 && (
                  <li className="flex flex-col items-center justify-center text-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-slate-500 text-sm">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-1">
                      <span role="img" aria-label="empty">📄</span>
                    </div>
                    <div>No research highlights yet.</div>
                    <div className="text-xs text-slate-400">Add your papers, projects or publications to showcase your work.</div>
                  </li>
                )}
                {research.map((r) => (
                  <li key={r.highlight_id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between bg-white/80">
                    <div>
                      <div className="font-medium text-slate-900 text-[15px]">{r.title}</div>
                      <div className="text-xs text-slate-500">{r.date ? new Date(r.date).toLocaleDateString() : ''}</div>
                    </div>
                    {r.published_link && (
                      <a className="text-xs font-medium text-[#3366FF] hover:text-[#2850CC]" href={r.published_link} target="_blank" rel="noreferrer">Open</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 md:p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg" role="img" aria-label="trophy">🏆</span>
                  <h3 className="text-[18px] md:text-[20px] font-semibold text-slate-900">Recent Achievements</h3>
                </div>
                <button className="text-xs font-medium text-[#3366FF] hover:text-[#2850CC]">View All</button>
              </div>
              <ul className="mt-1 space-y-2">
                {achievements.length === 0 && (
                  <li className="flex flex-col items-center justify-center text-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-slate-500 text-sm">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-1">
                      <span role="img" aria-label="medal">🎖️</span>
                    </div>
                    <div>No achievements added yet.</div>
                    <div className="text-xs text-slate-400">Add your awards, competitions or certifications to stand out.</div>
                  </li>
                )}
                {achievements.map((a) => (
                  <li key={a.achievement_id} className="p-3 rounded-xl border border-slate-200 bg-white/80">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900 text-[15px]">{a.title}</div>
                        <div className="text-xs text-slate-500">{a.type} {a.date ? `• ${new Date(a.date).toLocaleDateString()}` : ''}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column: Internships + Skills */}
          <div className="space-y-4">
            <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 md:p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg" role="img" aria-label="briefcase">💼</span>
                  <h3 className="text-[18px] md:text-[20px] font-semibold text-slate-900">Internships</h3>
                </div>
                <button className="text-xs font-medium text-[#3366FF] hover:text-[#2850CC]">View All</button>
              </div>
              <ul className="mt-1 space-y-2">
                {internships.length === 0 && (
                  <li className="flex flex-col items-center justify-center text-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-6 text-slate-500 text-sm">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm mb-1">
                      <span role="img" aria-label="empty">🧭</span>
                    </div>
                    <div>No internships added yet.</div>
                    <div className="text-xs text-slate-400">Add internships to keep track of your experience and progress.</div>
                  </li>
                )}
                {internships.map((it) => (
                  <li key={it.internship_id} className="p-3 rounded-xl border border-slate-200 bg-white/80">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-slate-900">
                        {it.company_name} <span className="text-xs text-slate-600">({it.internship_type})</span>
                      </div>
                      <div className="text-xs text-slate-600">{it.status}</div>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">{[it.role, it.domain, it.duration].filter(Boolean).join(' • ')}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{[it.start_date && new Date(it.start_date).toLocaleDateString(), it.end_date && new Date(it.end_date).toLocaleDateString()].filter(Boolean).join(' → ')}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5 md:p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg" role="img" aria-label="graduation">🎓</span>
                  <h3 className="text-[18px] md:text-[20px] font-semibold text-slate-900">Skills</h3>
                </div>
                <button className="text-xs font-medium text-[#3366FF] hover:text-[#2850CC]">+ Add Skill</button>
              </div>

              <div className="mt-1 space-y-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Technical</div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
                    {skills.technical.map((s) => (
                      <span
                        key={`t-${s}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 shadow-xs"
                      >
                        {s}
                      </span>
                    ))}
                    {skills.technical.length === 0 && (
                      <span className="text-xs text-slate-400">No technical skills yet</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Soft</div>
                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto pr-1">
                    {skills.soft.map((s) => (
                      <span
                        key={`s-${s}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-50 text-slate-900 text-xs font-medium border border-slate-200 shadow-xs"
                      >
                        {s}
                      </span>
                    ))}
                    {skills.soft.length === 0 && (
                      <span className="text-xs text-slate-400">No soft skills yet</span>
                    )}
                  </div>
                </div>
                {skills.technical.length + skills.soft.length === 0 && (
                  <div className="text-xs text-slate-400">Start by adding a few key skills you want to highlight.</div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
