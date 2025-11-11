import { useSearchParams } from "react-router-dom";

export default function Overview() {
  const [params] = useSearchParams();
  const role = params.get("role") || "student";
  const isStudent = role === "student";

  // Demo data (UI only)
  const achievements = [
    { title: "Hackathon Winner", type: "Competition", date: "2024-08-15" },
    { title: "Paper Published", type: "Publication", date: "2025-01-20" },
  ];
  const skills = ["JavaScript", "React", "SQL", "Python"];
  const internships = [
    { company: "TechCorp", type: "Paid", domain: "Web Dev", duration: "8 weeks", start: "2025-05-01", end: "2025-06-30" },
    { company: "DataWorks", type: "Unpaid", domain: "Data Science", duration: "6 weeks", start: "2025-07-01", end: "2025-08-15" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 text-white">
        <div className="p-6 md:p-8 flex items-center justify-between gap-6">
          <div>
            <div className="text-sm/6 opacity-90">Welcome back</div>
            <h2 className="text-2xl md:text-3xl font-semibold">Your Dashboard Overview</h2>
            <p className="opacity-90 text-white/90 mt-1 text-sm">
              Quick glance at your achievements, skills and internships
            </p>
          </div>
          <img src="/JK_Lakshmipat_University_Logo.jpg" alt="JKLU" className="hidden md:block h-12 w-auto rounded bg-white/10 p-2 backdrop-blur" />
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements */}
        <section className="sb-card sb-card-pad lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Achievements</h3>
            <span className="text-xs text-slate-500">{achievements.length} items</span>
          </div>
          <div className="mt-4 divide-y">
            {achievements.map((a, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">{a.title}</div>
                  <div className="text-xs text-slate-500">{a.type}</div>
                </div>
                <div className="text-xs text-slate-500">{a.date}</div>
              </div>
            ))}
          </div>
          {!isStudent && (
            <div className="mt-4 flex justify-end">
              <button className="sb-btn">Add Achievement</button>
            </div>
          )}
        </section>

        {/* Skills */}
        <section className="sb-card sb-card-pad lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Skills</h3>
            <span className="text-xs text-slate-500">{skills.length} skills</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="sb-chip sb-chip-primary">{s}</span>
            ))}
          </div>
          {!isStudent && (
            <div className="mt-4 flex gap-2">
              <input className="sb-input" placeholder="Add a skill (UI only)" />
              <button className="sb-btn">Add</button>
            </div>
          )}
        </section>

        {/* Internships */}
        <section className="sb-card sb-card-pad lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Internships</h3>
            <span className="text-xs text-slate-500">{internships.length} records</span>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="sb-table">
              <thead>
                <tr>
                  <th className="sb-th">Company</th>
                  <th className="sb-th">Type</th>
                  <th className="sb-th">Domain</th>
                </tr>
              </thead>
              <tbody>
                {internships.map((i, idx) => (
                  <tr key={idx} className="sb-tr">
                    <td className="sb-td">{i.company}</td>
                    <td className="sb-td">{i.type}</td>
                    <td className="sb-td">{i.domain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isStudent && (
            <div className="mt-4 flex justify-end">
              <button className="sb-btn">Add Internship</button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
