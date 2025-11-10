import { useState } from "react";
import { X } from "lucide-react";

export default function Skills() {
  const [input, setInput] = useState("");
  const demoSkills = ["JavaScript", "React", "SQL", "Python"];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a skill (UI only)"
          className="flex-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        <button className="px-4 py-2 rounded-md bg-blue-600 text-white">Add</button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {demoSkills.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-200">
            {s}
            <X className="h-4 w-4 cursor-pointer" />
          </span>
        ))}
      </div>
    </div>
  );
}
