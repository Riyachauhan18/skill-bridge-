import { useState } from "react";
import { Plus } from "lucide-react";

export default function Achievements() {
  const [open, setOpen] = useState(false);

  const demo = [
    { title: "Hackathon Winner", type: "Competition", date: "2024-08-15" },
    { title: "Paper Published", type: "Publication", date: "2025-01-20" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Achievements</h2>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white">
          <Plus className="h-4 w-4" /> Add Achievement
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600">
              <th className="text-left px-3 py-2 font-medium">Title</th>
              <th className="text-left px-3 py-2 font-medium">Type</th>
              <th className="text-left px-3 py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {demo.map((a, i) => (
              <tr key={i} className="border-t">
                <td className="px-3 py-2">{a.title}</td>
                <td className="px-3 py-2">{a.type}</td>
                <td className="px-3 py-2">{a.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Achievement</h3>
              <button className="text-gray-500" onClick={() => setOpen(false)}>✕</button>
            </div>

            <form className="mt-4 grid grid-cols-1 gap-4" onSubmit={(e)=>{e.preventDefault(); setOpen(false);}}>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="e.g., Smart India Hackathon Winner" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Competition / Certification / Publication" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input type="date" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white">Add (UI only)</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
