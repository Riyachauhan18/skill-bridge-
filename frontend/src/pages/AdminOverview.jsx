import { Link, useSearchParams } from "react-router-dom";

export default function AdminOverview() {
  const [params] = useSearchParams();
  const role = params.get("role") || "admin";

  const cards = [];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-900 to-indigo-700 text-white">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Admin Dashboard</h2>
          <p className="opacity-90 mt-1 text-sm">Overview, analytics, and quick actions</p>
        </div>
      </div>

      <section className="sb-card sb-card-pad">
        <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
        <div className="mt-4 grid grid-cols-1 gap-2">
          <Link to={`/dashboard/ps2?role=${role}`} className="sb-btn">Post Internship</Link>
          <Link to={`/dashboard/research?role=${role}`} className="sb-btn-ghost">Add Research Highlight</Link>
          <Link to={`/dashboard/edit-info?role=${role}`} className="sb-btn-ghost">Manage Admin Profile</Link>
        </div>
      </section>

      {/* Internship Verification */}
      <section className="sb-card sb-card-pad">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Internship Verification</h3>
          <div className="flex items-center gap-2 text-sm">
            <button className="sb-btn-ghost">Refresh</button>
            <Link to={`/dashboard/ps1?role=${role}`} className="sb-btn-ghost">Open in PS</Link>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="sb-table">
            <thead>
              <tr>
                <th className="sb-th">Student</th>
                <th className="sb-th">Company</th>
                <th className="sb-th">Type</th>
                <th className="sb-th">Duration</th>
                <th className="sb-th">Status</th>
                <th className="sb-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { s: 'Aditi Sharma', c: 'TechCorp', t: 'PS1', d: '8 w', st: 'Pending' },
                { s: 'Rohan Verma', c: 'DataWorks', t: 'PS2', d: '6 w', st: 'Pending' },
                { s: 'Meera Jain', c: 'Cloudify', t: 'PS1', d: '8 w', st: 'Pending' },
              ].map((r) => (
                <tr key={r.s} className="sb-tr">
                  <td className="sb-td">{r.s}</td>
                  <td className="sb-td">{r.c}</td>
                  <td className="sb-td">{r.t}</td>
                  <td className="sb-td">{r.d}</td>
                  <td className="sb-td">{r.st}</td>
                  <td className="sb-td">
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 rounded-md bg-emerald-600 text-white text-xs hover:bg-emerald-700">Approve</button>
                      <button className="px-2 py-1 rounded-md bg-rose-600 text-white text-xs hover:bg-rose-700">Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      

      {/* Skills & Achievements Analytics */}
      <section className="sb-card sb-card-pad">
        <h3 className="text-lg font-semibold text-slate-900">Skills & Achievements Analytics</h3>
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-slate-800">Top Skills</div>
            <div className="mt-3 space-y-2">
              {[['React',80],['Python',65],['SQL',50],['DSA',45]].map(([label,val])=> (
                <div key={label}>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{label}</span><span>{val}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-md overflow-hidden">
                    <div className="h-full bg-indigo-600" style={{ width: `${val}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-800">Achievements by Type</div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              {[
                { k:'Hackathons', v:48 },
                { k:'Publications', v:22 },
                { k:'Competitions', v:35 },
              ].map(x => (
                <div key={x.k} className="rounded-lg border p-3">
                  <div className="text-2xl font-semibold text-slate-900">{x.v}</div>
                  <div className="text-xs text-slate-600">{x.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reports & Export */}
      <section className="sb-card sb-card-pad">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Reports & Export</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="sb-btn">Export Student Performance (CSV)</button>
          <button className="sb-btn-ghost">Export Skills Summary (CSV)</button>
          <button className="sb-btn-ghost">Export Internship Status (CSV)</button>
        </div>
        <p className="text-xs text-slate-500 mt-2">UI-only actions; integrate with backend later to generate files.</p>
      </section>
    </div>
  );
}
