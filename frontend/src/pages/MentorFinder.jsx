import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, MessageCircle, User2, Sparkles } from "lucide-react";
import api from "../lib/api";

export default function MentorFinder() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFilter, setLoadingFilter] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const [domain, setDomain] = useState("");
  const [batch, setBatch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");

  const seniorRoll = useMemo(() => localStorage.getItem("rollno") || "", []);

  useEffect(() => {
    if (!seniorRoll) {
      setError("Missing senior roll number in local storage.");
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/mentor-matches/${encodeURIComponent(seniorRoll)}`);
        setMatches(res.data || []);
      } catch (e) {
        setError("Failed to load mentor matches.");
      } finally {
        setLoading(false);
      }
    })();
  }, [seniorRoll]);

  const allDomains = useMemo(() => {
    const set = new Set();
    matches.forEach(m => (m.domains || []).forEach(d => d && set.add(d)));
    return Array.from(set).sort();
  }, [matches]);

  const allBatches = useMemo(() => {
    return Array.from(new Set(matches.map(m => m.batch).filter(Boolean))).sort((a, b) => b - a);
  }, [matches]);

  const allSkills = useMemo(() => {
    const set = new Set();
    matches.forEach(m => (m.skills || []).forEach(s => s && set.add(s)));
    return Array.from(set).sort();
  }, [matches]);

  const allInterests = useMemo(() => {
    const set = new Set();
    matches.forEach(m => (m.interests || []).forEach(i => i && set.add(i)));
    return Array.from(set).sort();
  }, [matches]);

  const applyFilters = async () => {
    if (!seniorRoll) return;
    setLoadingFilter(true);
    setError("");
    try {
      const payload = {
        seniorRoll,
        domain: domain || undefined,
        batch: batch || undefined,
        skills: skillFilter ? [skillFilter] : [],
        interests: interestFilter ? [interestFilter] : [],
      };
      const res = await api.post("/api/mentor-match/filter", payload);
      setMatches(res.data || []);
    } catch (e) {
      setError("Failed to apply filters.");
    } finally {
      setLoadingFilter(false);
    }
  };

  const clearFilters = async () => {
    setDomain("");
    setBatch("");
    setSkillFilter("");
    setInterestFilter("");
    if (!seniorRoll) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/mentor-matches/${encodeURIComponent(seniorRoll)}`);
      setMatches(res.data || []);
    } catch (e) {
      setError("Failed to reload matches.");
    } finally {
      setLoading(false);
    }
  };

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const openProfile = async (roll) => {
    setProfileLoading(true);
    setProfileData(null);
    try {
      const res = await api.get(`/api/mentor-match/details/${encodeURIComponent(roll)}`);
      setProfileData(res.data || null);
      setSelected(roll);
    } catch (e) {
      setError("Failed to load profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const visibleMatches = matches;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 text-white shadow-md">
        <div className="px-6 py-5 md:px-8 md:py-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Mentor Finder
            </h2>
            <p className="mt-1 text-sm md:text-[15px] text-white/90">
              Match juniors with you based on skills, interests, domains, and achievements.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end text-xs text-white/80">
            <span className="uppercase tracking-wide font-semibold">Senior</span>
            <span className="mt-0.5 text-white">{seniorRoll || "Unknown"}</span>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-[18px] md:text-[20px] font-semibold text-[#111827] flex items-center gap-2">
            <Filter className="h-4 w-4 text-indigo-600" />
            Filters
          </h3>
          <div className="flex items-center gap-2 text-xs md:text-sm flex-wrap">
            <button
              type="button"
              className="sb-btn-ghost-light"
              onClick={clearFilters}
              disabled={loading || loadingFilter}
            >
              Clear
            </button>
            <button
              type="button"
              className="sb-btn"
              onClick={applyFilters}
              disabled={loading || loadingFilter}
            >
              {loadingFilter ? "Applying..." : "Apply"}
            </button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">Domain</label>
            <select
              className="mt-2 sb-input-light w-full"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              <option value="">All</option>
              {allDomains.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Batch (juniors)</label>
            <select
              className="mt-2 sb-input-light w-full"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            >
              <option value="">All</option>
              {allBatches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Skill</label>
            <select
              className="mt-2 sb-input-light w-full"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
            >
              <option value="">All</option>
              {allSkills.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">Interest</label>
            <select
              className="mt-2 sb-input-light w-full"
              value={interestFilter}
              onChange={(e) => setInterestFilter(e.target.value)}
            >
              <option value="">All</option>
              {allInterests.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[18px] md:text-[20px] font-semibold text-[#111827] flex items-center gap-2">
            <User2 className="h-4 w-4 text-indigo-600" />
            Matched Juniors
          </h3>
          {loading && (
            <span className="text-xs text-slate-500">Loading matches...</span>
          )}
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        )}

        {!loading && visibleMatches.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No juniors matched yet. Try adjusting filters or encourage juniors to update their profiles.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {visibleMatches.map((m) => (
            <div
              key={m.roll_number}
              className="rounded-xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:scale-[1.01] transition-transform flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{m.name || m.roll_number}</div>
                  <div className="text-xs text-slate-500">{m.roll_number}</div>
                  {m.degree && (
                    <div className="mt-1 text-xs text-slate-500">{m.degree} • {m.department}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                    Match {m.matchScore ?? 0}%
                  </span>
                  {m.batch && (
                    <span className="text-[11px] text-slate-500">Batch {m.batch}</span>
                  )}
                </div>
              </div>

              {m.skills && m.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {m.skills.slice(0, 6).map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200"
                    >
                      {sk}
                    </span>
                  ))}
                  {m.skills.length > 6 && (
                    <span className="text-[11px] text-slate-500">+{m.skills.length - 6} more</span>
                  )}
                </div>
              )}

              {m.interests && m.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {m.interests.slice(0, 4).map((it) => (
                    <span
                      key={it}
                      className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 text-[11px] font-medium border border-slate-200"
                    >
                      {it}
                    </span>
                  ))}
                  {m.interests.length > 4 && (
                    <span className="text-[11px] text-slate-500">+{m.interests.length - 4} more</span>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 mt-1">
                <button
                  type="button"
                  className="sb-btn-ghost-light text-xs"
                  onClick={() => openProfile(m.roll_number)}
                >
                  View Profile
                </button>
                <button
                  type="button"
                  className="sb-btn text-xs inline-flex items-center gap-1"
                  onClick={() => {
                    const state = { name: m.name, degree: m.degree };
                    navigate(`/dashboard/messages/${encodeURIComponent(m.roll_number)}`, { state });
                  }}
                >
                  <span>Start Mentorship Chat</span>
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => { setSelected(null); setProfileData(null); }}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200 p-6 md:p-8 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => { setSelected(null); setProfileData(null); }}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              ×
            </button>

            {profileLoading && (
              <div className="text-sm text-slate-500">Loading profile...</div>
            )}

            {!profileLoading && profileData && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-lg">
                      {profileData.user?.full_name?.[0] || "J"}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{profileData.user?.full_name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{profileData.user?.roll_number}</p>
                      {profileData.profile?.degree && (
                        <p className="text-xs text-slate-500">{profileData.profile.degree} • {profileData.profile.department}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Technical Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {profileData.skills?.technical?.length
                        ? profileData.skills.technical.map((sk) => (
                            <span
                              key={sk}
                              className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-medium border border-amber-200"
                            >
                              {sk}
                            </span>
                          ))
                        : <span className="text-xs text-slate-500">No technical skills listed</span>}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Interests</div>
                    <div className="flex flex-wrap gap-1.5">
                      {profileData.interests?.length
                        ? profileData.interests.map((it) => (
                            <span
                              key={it}
                              className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-50 text-slate-700 text-[11px] font-medium border border-slate-200"
                            >
                              {it}
                            </span>
                          ))
                        : <span className="text-xs text-slate-500">No interests listed</span>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Achievements</div>
                    <ul className="text-sm text-slate-700 space-y-1 max-h-40 overflow-y-auto pr-1">
                      {profileData.achievements?.length
                        ? profileData.achievements.map((a) => (
                            <li key={a.achievement_id}>{a.title}</li>
                          ))
                        : <li className="text-xs text-slate-500">No achievements added yet</li>}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Internships</div>
                    <ul className="text-sm text-slate-700 space-y-1 max-h-40 overflow-y-auto pr-1">
                      {profileData.internships?.length
                        ? profileData.internships.map((it) => (
                            <li key={it.internship_id}>{it.company_name} — {it.domain} ({it.internship_type})</li>
                          ))
                        : <li className="text-xs text-slate-500">No internships added yet</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
