import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronRight, ExternalLink, Github, Linkedin } from "lucide-react";

const sampleData = [
  {
    batch: 2024,
    seniors: [
      {
        name: "Aarav Mehta",
        degree: "B.E. CSE",
        cgpa: 8.7,
        skills: ["React", "Node", "SQL"],
        linkedin: "https://linkedin.com/in/aarav",
        github: "https://github.com/aarav",
        achievements: [
          { title: "SIH Finalist", date: "2024-03-10" },
          { title: "GDSC Lead", date: "2023-09-01" },
        ],
        internships: [
          { company: "TechCorp", domain: "Web", type: "Paid" },
          { company: "CloudNine", domain: "Cloud", type: "Unpaid" },
        ],
      },
      {
        name: "Ishita Rao",
        degree: "B.E. IT",
        cgpa: 8.9,
        skills: ["Python", "Data Science", "Pandas"],
        linkedin: "https://linkedin.com/in/ishita",
        github: "https://github.com/ishita",
        achievements: [{ title: "Paper Published", date: "2024-06-15" }],
        internships: [{ company: "DataWorks", domain: "Data", type: "Paid" }],
      },
    ],
  },
  {
    batch: 2023,
    seniors: [
      {
        name: "Rohan Gupta",
        degree: "B.E. CSE",
        cgpa: 8.2,
        skills: ["Java", "Spring", "SQL"],
        linkedin: "https://linkedin.com/in/rohan",
        github: "https://github.com/rohan",
        achievements: [{ title: "Hackathon Winner", date: "2023-02-20" }],
        internships: [{ company: "FinServe", domain: "Backend", type: "Paid" }],
      },
    ],
  },
];

export default function Seniors() {
  const [params] = useSearchParams();
  const role = params.get("role") || "student";
  const isStudent = role === "student";

  // Filters UI state (UI only, no actual filtering for Phase 1)
  const [search, setSearch] = useState("");
  const [batch, setBatch] = useState("");
  const [degree, setDegree] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [details, setDetails] = useState(null);
  const [openBatches, setOpenBatches] = useState(() => new Set(sampleData.map((b) => b.batch)));

  const allSkills = useMemo(
    () => ["React", "Node", "SQL", "Python", "Data Science", "Pandas", "Java", "Spring"],
    []
  );
  const allBatches = useMemo(() => sampleData.map((b) => b.batch), []);
  const allDegrees = useMemo(() => ["B.E. CSE", "B.E. IT", "B.Tech CSE"], []);

  const toggleSkill = (s) => {
    setSelectedSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };
  const clearFilters = () => {
    setSearch("");
    setBatch("");
    setDegree("");
    setSelectedSkills([]);
  };
  const toggleBatch = (b) => {
    setOpenBatches((prev) => {
      const n = new Set(prev);
      if (n.has(b)) n.delete(b);
      else n.add(b);
      return n;
    });
  };

  // Simple UI-only filtered view
  const filtered = sampleData
    .filter((g) => (batch ? String(g.batch) === String(batch) : true))
    .map((g) => ({
      ...g,
      seniors: g.seniors.filter((s) => {
        const nameOk = s.name.toLowerCase().includes(search.toLowerCase());
        const degreeOk = degree ? s.degree === degree : true;
        const skillsOk = selectedSkills.length
          ? selectedSkills.every((sk) => s.skills.includes(sk))
          : true;
        return nameOk && degreeOk && skillsOk;
      }),
    }));

  return (
    <div className="space-y-6">
      <div className="sb-card sb-card-pad">
        <div className="flex items-start md:items-end flex-col md:flex-row md:justify-between gap-4">
          <div>
            <h2 className="sb-title">Seniors</h2>
            <p className="sb-subtle">Browse seniors batch-wise and discover mentors for guidance</p>
          </div>
          <div className={`hidden sm:inline-block rounded-full px-3 py-1 text-xs font-medium ${
            isStudent ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
          }`}>{isStudent ? "Student (read-only)" : "Admin"}</div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Search by name</label>
            <input className="mt-2 sb-input" placeholder="e.g., Aarav" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Batch / Passout_Year</label>
            <select className="mt-2 sb-input" value={batch} onChange={(e) => setBatch(e.target.value)}>
              <option value="">All</option>
              {allBatches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Degree</label>
            <select className="mt-2 sb-input" value={degree} onChange={(e) => setDegree(e.target.value)}>
              <option value="">All</option>
              {allDegrees.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Skills</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {allSkills.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSkill(s)}
                  className={`sb-chip ${selectedSkills.includes(s) ? 'sb-chip-primary' : 'border-slate-200 text-slate-600'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button type="button" onClick={clearFilters} className="sb-btn-ghost">Clear filters</button>
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {filtered.map((group) => (
          <div key={group.batch} className="sb-card">
            <div className="sb-card-pad flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => toggleBatch(group.batch)} className="rounded-md border px-2 py-1 text-slate-700 hover:bg-slate-50">
                  {openBatches.has(group.batch) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <h3 className="text-lg font-semibold text-slate-900">Batch {group.batch}</h3>
                <span className="text-xs text-slate-500">{group.seniors.length} results</span>
              </div>
            </div>

            {openBatches.has(group.batch) && (
              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {group.seniors.map((s, idx) => (
                  <div key={idx} className="rounded-xl border p-4 shadow-sm bg-white flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-slate-900 font-semibold">{s.name}</div>
                        <div className="text-sm text-slate-600">{s.degree} • CGPA {s.cgpa}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={s.linkedin} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">
                          <Linkedin className="h-4 w-4" />
                        </a>
                        <a href={s.github} target="_blank" className="text-slate-700 hover:underline flex items-center gap-1">
                          <Github className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {s.skills.map((sk) => (
                        <span key={sk} className="sb-chip sb-chip-primary">{sk}</span>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <button type="button" className="sb-btn" onClick={() => setDetails(s)}>
                        View Details
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetails(null)}>
          <div className="w-full max-w-2xl sb-card sb-card-pad" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">{details.name}</h3>
                <p className="sb-subtle">{details.degree} • CGPA {details.cgpa}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={details.linkedin} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1"><Linkedin className="h-4 w-4" /></a>
                <a href={details.github} target="_blank" className="text-slate-700 hover:underline flex items-center gap-1"><Github className="h-4 w-4" /></a>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-semibold text-slate-900">Skills</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {details.skills.map((sk) => (
                    <span key={sk} className="sb-chip sb-chip-primary">{sk}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Contact</div>
                <div className="mt-2 text-slate-600 text-sm">Reach out via LinkedIn or GitHub (UI only)</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-slate-900">Achievements</div>
                <ul className="mt-2 list-disc list-inside text-slate-700 text-sm">
                  {details.achievements.map((a, i) => (
                    <li key={i}>{a.title} — {a.date}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Internships</div>
                <ul className="mt-2 list-disc list-inside text-slate-700 text-sm">
                  {details.internships.map((it, i) => (
                    <li key={i}>{it.company} — {it.domain} ({it.type})</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="sb-btn-ghost" onClick={() => setDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
