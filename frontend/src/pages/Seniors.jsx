import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, ExternalLink, Github, Linkedin, MessageCircle } from "lucide-react";
import api from "../lib/api";

// Backend-driven seniors list (flat array)
// Each item: { roll_number, name, degree, department, batch, cgpa, linkedin, github, skills[], achievements[], internships[] }

export default function Seniors() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const role = params.get("role") || "student";
  const isStudent = role === "student";

  // Filters UI state (wired to backend)
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("");
  const [degree, setDegree] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [details, setDetails] = useState(null);
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("relevance");
  const [skillsDropdownOpen, setSkillsDropdownOpen] = useState(false);
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const pollRef = useRef(null);
  const filterRef = useRef(null);

  // Fetch seniors whenever filters change
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/guidance/seniors', {
          params: {
            search: search || undefined,
            batch: batch || undefined,
            degree: degree || undefined,
            skills: selectedSkills.length ? selectedSkills.join(',') : undefined,
          },
        });
        if (!mounted) return;
        const list = res.data || [];
        setSeniors(list);
      } catch {}
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false };
  }, [search, batch, degree, selectedSkills]);

  // Clear any polling when modal closes (kept only for future extension)
  useEffect(() => {
    if (!details && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [details]);

  const allSkills = useMemo(() => {
    const set = new Set();
    for (const s of seniors) (s.skills || []).forEach(sk => set.add(sk));
    return Array.from(set).sort();
  }, [seniors]);
  const allBatches = useMemo(() => {
    return Array.from(new Set(seniors.map(s => s.batch).filter(Boolean))).sort((a,b)=>b-a);
  }, [seniors]);

  const allDegrees = useMemo(() => {
    return Array.from(new Set(seniors.map(s => s.degree).filter(Boolean))).sort();
  }, [seniors]);

  const toggleSkill = (s) => {
    setSelectedSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };
  const clearFilters = () => {
    setSearch("");
    setBatch("");
    setDegree("");
    setSelectedSkills([]);
    setSortBy("relevance");
  };

  const sortedSeniors = useMemo(() => {
    const list = [...seniors];
    switch (sortBy) {
      case "cgpa_desc":
        return list.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));
      case "most_skilled":
        return list.sort((a, b) => (b.skills?.length || 0) - (a.skills?.length || 0));
      case "batch_new_old":
        return list.sort((a, b) => (b.batch || 0) - (a.batch || 0));
      case "recently_active":
        return list; // Placeholder until backend provides last_active
      case "relevance":
      default:
        return list;
    }
  }, [seniors, sortBy]);

  useEffect(() => {
    const handleScroll = () => {
      if (!filterRef.current) return;
      const rect = filterRef.current.getBoundingClientRect();
      setIsFilterSticky(rect.top <= 16);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-transparent text-slate-900 p-4 md:p-6 space-y-6 -mx-4 md:mx-0 rounded-none">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-50 via-white to-slate-50 border border-amber-100 px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Seniors</h2>
          <p className="mt-2 text-sm md:text-base text-slate-600 max-w-2xl">Discover seniors and mentors batch-wise, filter by skills and degree, and connect with the right people for guidance.</p>
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold border shadow-sm ${
            isStudent
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-indigo-50 text-indigo-700 border-indigo-100"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>{isStudent ? "Student view" : "Admin view"}</span>
        </div>
      </div>

      {/* Sticky filter + sort bar */}
      <div className="sticky top-16 z-20" ref={filterRef}>
        <div
          className={`transition-all ${
            isFilterSticky ? "shadow-md bg-white/95 backdrop-blur border border-slate-200 rounded-2xl" : ""
          }`}
        >
          <div className="p-4 md:p-5">
            {/* Filters card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 md:p-6 max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-800">Search by name</label>
                  <input
                    className="mt-2 sb-input-light w-full text-black"
                    placeholder="e.g., Aarav"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-800">Batch / Passout Year</label>
                  <select
                    className="mt-2 sb-input-light w-full text-black"
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
                  <label className="block text-sm font-medium text-slate-800">Degree</label>
                  <select
                    className="mt-2 sb-input-light w-full text-black"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  >
                    <option value="">All</option>
                    {allDegrees.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-slate-800">Skills</label>
                  <div className="mt-2 relative">
                    <button
                      type="button"
                      onClick={() => setSkillsDropdownOpen((o) => !o)}
                      className="w-full sb-input-light flex items-center justify-between text-left text-black"
                    >
                      <div className="flex flex-wrap gap-1.5 max-h-10 overflow-hidden">
                        {selectedSkills.length === 0 && (
                          <span className="text-xs text-slate-400">Select one or more skills</span>
                        )}
                        {selectedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs border border-amber-200"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-500 ml-2 shrink-0" />
                    </button>
                    {skillsDropdownOpen && (
                      <div className="absolute z-30 mt-2 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg p-3">
                        <div className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pick skills</div>
                        <div className="flex flex-wrap gap-1.5">
                          {allSkills.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => toggleSkill(s)}
                              className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium transition ${
                                selectedSkills.includes(s)
                                  ? "bg-amber-50 border-amber-300 text-amber-800"
                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Active filter summary */}
              <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <span>Search: {search}</span>
                      <span className="text-slate-500 text-xs">×</span>
                    </button>
                  )}
                  {batch && (
                    <button
                      type="button"
                      onClick={() => setBatch("")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <span>Batch: {batch}</span>
                      <span className="text-slate-500 text-xs">×</span>
                    </button>
                  )}
                  {degree && (
                    <button
                      type="button"
                      onClick={() => setDegree("")}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <span>Degree: {degree}</span>
                      <span className="text-slate-500 text-xs">×</span>
                    </button>
                  )}
                  {selectedSkills.map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => toggleSkill(sk)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      <span>{sk}</span>
                      <span className="text-amber-500 text-xs">×</span>
                    </button>
                  ))}

                  {!search && !batch && !degree && selectedSkills.length === 0 && (
                    <span className="text-xs text-slate-400">No active filters</span>
                  )}
                </div>
                <div className="flex items-center gap-2 justify-between md:justify-end w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Sort by</span>
                    <select
                      className="sb-input-light text-xs md:text-sm text-black py-1 px-2"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="cgpa_desc">CGPA High → Low</option>
                      <option value="most_skilled">Most Skilled</option>
                      <option value="batch_new_old">Batch (Newest → Oldest)</option>
                      <option value="recently_active">Recently Active</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="sb-btn-ghost-light text-xs md:text-sm"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">Loading seniors…</div>
        ) : sortedSeniors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-8 flex flex-col items-center justify-center text-center gap-3 shadow-sm">
            <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center mb-1">
              <Users className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">No seniors match your filters</h3>
            <p className="text-sm text-slate-600 max-w-md">
              Try adjusting the filters, removing some skills, or broadening the batch and degree to discover more potential mentors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {sortedSeniors.map((s, idx) => {
              const skillsToShow = (s.skills || []).slice(0, 3);
              const remainingSkills = (s.skills || []).length - skillsToShow.length;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-transform flex flex-col gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-sm">
                      {s.name?.[0] || "S"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-base md:text-lg font-semibold text-slate-900">{s.name}</h3>
                          <p className="text-xs md:text-sm text-slate-600">
                            {s.degree}
                            {s.batch && <span className="ml-1">• Batch {s.batch}</span>}
                            {s.cgpa !== undefined && s.cgpa !== null && (
                              <>
                                <span className="mx-1">•</span>
                                <span>CGPA {s.cgpa}</span>
                              </>
                            )}
                          </p>
                          {s.department && (
                            <p className="text-xs text-slate-500 mt-0.5">{s.department}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {s.linkedin && (
                            <a
                              href={s.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-700 flex items-center justify-center h-8 w-8 rounded-full bg-blue-50"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                          {s.github && (
                            <a
                              href={s.github}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-700 hover:text-slate-900 flex items-center justify-center h-8 w-8 rounded-full bg-slate-100"
                            >
                              <Github className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {skillsToShow.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200"
                      >
                        {sk}
                      </span>
                    ))}
                    {remainingSkills > 0 && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">
                        +{remainingSkills} more
                      </span>
                    )}
                    {skillsToShow.length === 0 && (
                      <span className="text-xs text-slate-400">No skills listed</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1 gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center text-xs md:text-sm font-medium text-slate-700 hover:text-slate-900"
                      onClick={() => setDetails(s)}
                    >
                      <span>View profile</span>
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!s?.roll_number) return;
                        const roll = s.roll_number;
                        const state = { name: s.name, degree: s.degree };
                        navigate(`/dashboard/messages/${encodeURIComponent(roll)}`, { state });
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs md:text-sm font-medium px-3 py-1.5 shadow-sm"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {details && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setDetails(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200 p-6 md:p-8 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floating close button */}
            <button
              type="button"
              onClick={() => setDetails(null)}
              className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
            >
              ×
            </button>

            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-lg">
                  {details.name?.[0] || 'S'}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{details.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{details.degree} • CGPA {details.cgpa ?? 'N/A'}</p>
                  {details.department && (
                    <p className="text-xs text-slate-500">{details.department}</p>
                  )}
                  <div className="mt-3 h-px w-16 bg-amber-300 rounded-full" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* LinkedIn action */}
                <button
                  type="button"
                  onClick={() => {
                    if (!details.linkedin) return;
                    window.open(details.linkedin, "_blank", "noopener,noreferrer");
                  }}
                  disabled={!details.linkedin}
                  className="h-9 w-9 rounded-full bg-[#F5F5F7] flex items-center justify-center text-slate-900 hover:bg-slate-200 hover:shadow-sm transition disabled:opacity-40 disabled:cursor-default"
                >
                  <Linkedin className="h-4 w-4" />
                </button>

                {/* GitHub action */}
                <button
                  type="button"
                  onClick={() => {
                    if (!details.github) return;
                    window.open(details.github, "_blank", "noopener,noreferrer");
                  }}
                  disabled={!details.github}
                  className="h-9 w-9 rounded-full bg-[#F5F5F7] flex items-center justify-center text-slate-900 hover:bg-slate-200 hover:shadow-sm transition disabled:opacity-40 disabled:cursor-default"
                >
                  <Github className="h-4 w-4" />
                </button>

                {/* Message action: go to dedicated Messages page */}
                <button
                  type="button"
                  onClick={() => {
                    if (!details?.roll_number) return;
                    const roll = details.roll_number;
                    const state = { name: details.name, degree: details.degree };
                    setDetails(null);
                    navigate(`/dashboard/messages/${encodeURIComponent(roll)}`, { state });
                  }}
                  className="h-9 w-9 rounded-full bg-[#F5F5F7] flex items-center justify-center text-slate-900 hover:bg-slate-200 hover:shadow-sm transition"
                >
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Skills</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(details.skills || []).map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#FCE9C4] text-amber-800 text-xs font-medium border border-amber-200 hover:shadow-sm transition"
                    >
                      {sk}
                    </span>
                  ))}
                  {(!details.skills || details.skills.length === 0) && (
                    <span className="text-xs text-slate-500">No skills listed</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Contact</span>
                </div>
                <div className="mt-1 text-slate-700 text-sm">Reach out via LinkedIn or GitHub for guidance and mentorship.</div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Achievements</span>
                </div>
                <ul className="mt-1 list-disc list-inside text-slate-700 text-sm space-y-1">
                  {(details.achievements || []).map((a, i) => (
                    <li key={i}>{a.title} {a.date ? `— ${new Date(a.date).toLocaleDateString()}` : ''}</li>
                  ))}
                  {(!details.achievements || details.achievements.length === 0) && (
                    <li className="text-xs text-slate-500 list-none">No achievements added yet</li>
                  )}
                </ul>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span>Internships</span>
                </div>
                <ul className="mt-1 list-disc list-inside text-slate-700 text-sm space-y-1">
                  {(details.internships || []).map((it, i) => (
                    <li key={i}>{it.company} — {it.domain} ({it.type})</li>
                  ))}
                  {(!details.internships || details.internships.length === 0) && (
                    <li className="text-xs text-slate-500 list-none">No internships added yet</li>
                  )}
                </ul>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
