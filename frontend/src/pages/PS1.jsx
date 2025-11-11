import { useSearchParams } from "react-router-dom";

export default function PS1() {
  const [params] = useSearchParams();
  const role = params.get("role") || "student";
  return (
    <div className="space-y-4">
      <div className="sb-card sb-card-pad">
        <h2 className="text-xl font-semibold text-slate-900">Internship - PS1</h2>
        <p className="text-slate-600 mt-2">UI-only placeholder for PS1 details, listings, and resources.</p>
        <p className="text-xs text-slate-500 mt-2">Role: {role}</p>
      </div>
    </div>
  );
}
