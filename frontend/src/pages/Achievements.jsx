import { useState } from "react";
import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function Achievements() {
  const [open, setOpen] = useState(false);
  const [params] = useSearchParams();
  const role = params.get("role") || "student";
  const isStudent = role === "student";

  const demo = [
    { title: "Hackathon Winner", type: "Competition", date: "2024-08-15" },
    { title: "Paper Published", type: "Publication", date: "2025-01-20" },
  ];

  return (
    <div className="sb-card sb-card-pad">
      <div className="flex items-center justify-between">
        <h2 className="sb-title">Achievements</h2>
        {!isStudent && (
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 sb-btn">
            <Plus className="h-4 w-4" /> Add Achievement
          </button>
        )}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="sb-table">
          <thead>
            <tr>
              <th className="sb-th">Title</th>
              <th className="sb-th">Type</th>
              <th className="sb-th">Date</th>
            </tr>
          </thead>
          <tbody>
            {demo.map((a, i) => (
              <tr key={i} className="sb-tr">
                <td className="sb-td">{a.title}</td>
                <td className="sb-td">{a.type}</td>
                <td className="sb-td">{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isStudent && open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg sb-card sb-card-pad">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Achievement</h3>
              <button className="text-gray-500" onClick={() => setOpen(false)}>✕</button>
            </div>

            <form className="mt-4 grid grid-cols-1 gap-4" onSubmit={(e)=>{e.preventDefault(); setOpen(false);}}>
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input className="mt-2 sb-input" placeholder="e.g., Smart India Hackathon Winner" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Type</label>
                <input className="mt-2 sb-input" placeholder="Competition / Certification / Publication" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Date</label>
                <input type="date" className="mt-2 sb-input" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="sb-btn-ghost">Cancel</button>
                <button type="submit" className="sb-btn">Add (UI only)</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
