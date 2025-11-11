import { useSearchParams } from "react-router-dom";

export default function Internships() {
  const [params] = useSearchParams();
  const role = params.get("role") || "student";
  const isStudent = role === "student";

  const demo = [
    { company: "TechCorp", type: "Paid", domain: "Web Dev", mentor: "Alice", duration: "8 weeks", start: "2025-05-01", end: "2025-06-30" },
    { company: "DataWorks", type: "Unpaid", domain: "Data Science", mentor: "Bob", duration: "6 weeks", start: "2025-07-01", end: "2025-08-15" },
  ];

  return (
    <div className="space-y-6">
      <div className="sb-card sb-card-pad">
        <div className="flex items-center justify-between">
          <h2 className="sb-title">Internships</h2>
          <div className={`hidden sm:inline-block rounded-full px-3 py-1 text-xs font-medium ${isStudent ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'}`}>
            {isStudent ? 'Student (read-only)' : 'Admin'}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="sb-table">
            <thead>
              <tr>
                <th className="sb-th">Company_Name</th>
                <th className="sb-th">Type</th>
                <th className="sb-th">Domain</th>
                <th className="sb-th">Mentor_Name</th>
                <th className="sb-th">Duration</th>
                <th className="sb-th">Start_Date</th>
                <th className="sb-th">End_Date</th>
              </tr>
            </thead>
            <tbody>
              {demo.map((i, idx) => (
                <tr key={idx} className="sb-tr">
                  <td className="sb-td">{i.company}</td>
                  <td className="sb-td">{i.type}</td>
                  <td className="sb-td">{i.domain}</td>
                  <td className="sb-td">{i.mentor}</td>
                  <td className="sb-td">{i.duration}</td>
                  <td className="sb-td">{i.start}</td>
                  <td className="sb-td">{i.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isStudent && (
        <div className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-800">Add Internship</h3>
          <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e)=> e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-slate-700">Company_Name</label>
              <input className="mt-2 sb-input" placeholder="Company Pvt Ltd" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Type</label>
              <select className="mt-2 sb-input">
                <option>Paid</option>
                <option>Unpaid</option>
                <option>On-Campus</option>
                <option>Off-Campus</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Domain</label>
              <input className="mt-2 sb-input" placeholder="AI / Web / Mobile / Data" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Mentor_Name</label>
              <input className="mt-2 sb-input" placeholder="Mentor Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Duration</label>
              <input className="mt-2 sb-input" placeholder="e.g., 8 weeks" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Start_Date</label>
              <input type="date" className="mt-2 sb-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">End_Date</label>
              <input type="date" className="mt-2 sb-input" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button type="reset" className="sb-btn-ghost">Reset</button>
              <button type="submit" className="sb-btn">Add (UI only)</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
