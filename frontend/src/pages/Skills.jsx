import { useState } from "react";
import { X } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function Skills() {
  const [input, setInput] = useState("");
  const [params] = useSearchParams();
  const role = params.get("role") || "student";
  const isStudent = role === "student";
  const demoSkills = ["JavaScript", "React", "SQL", "Python"];

  return (
    <div className="sb-card sb-card-pad">
      <div className="flex items-center justify-between">
        <h2 className="sb-title">Skills</h2>
        <div className={`hidden sm:inline-block rounded-full px-3 py-1 text-xs font-medium ${isStudent ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'}`}>
          {isStudent ? 'Student (read-only)' : 'Admin'}
        </div>
      </div>

      {!isStudent && (
        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a skill (UI only)"
            className="sb-input"
          />
          <button className="sb-btn">Add</button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {demoSkills.map((s) => (
          <span key={s} className="sb-chip sb-chip-primary">
            {s}
            {!isStudent && <X className="h-4 w-4 cursor-pointer" />}
          </span>
        ))}
      </div>
    </div>
  );
}
