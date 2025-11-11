import { useSearchParams } from "react-router-dom";

export default function Profile() {
  const [params] = useSearchParams();
  const role = params.get("role") || "student";
  const isStudent = role === "student";

  return (
    <div className="mx-auto max-w-7xl">
      <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Profile</h2>
            <p className="text-sm text-slate-500">{isStudent ? 'Viewing your profile' : 'Update student information'}</p>
          </div>
          <div className={`hidden sm:inline-block rounded-full px-3 py-1 text-xs font-medium ${isStudent ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'}`}>
            {isStudent ? 'Student' : 'Admin'}
          </div>
        </div>
        <hr className="mt-4" />

        {isStudent ? (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Name</div>
              <div className="text-slate-900 font-medium">John Doe</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Roll_No</div>
              <div className="text-slate-900 font-medium">21CS001</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Email</div>
              <div className="text-slate-900">you@example.com</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Phone</div>
              <div className="text-slate-900">9876543210</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Gender</div>
              <div className="text-slate-900">Male</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">DOB</div>
              <div className="text-slate-900">2004-05-20</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Degree</div>
              <div className="text-slate-900">B.E. CSE</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Admission_Year</div>
              <div className="text-slate-900">2022</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Passout_Year</div>
              <div className="text-slate-900">2026</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">CGPA</div>
              <div className="text-slate-900">8.5</div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Address</div>
              <div className="text-slate-900">221B Baker Street, London</div>
            </div>

            <div className="md:col-span-2 space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Interests</div>
              <div className="text-slate-900">AI, Web Development</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">LinkedIn_URL</div>
              <div className="text-blue-700">https://linkedin.com/in/example</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wide text-slate-500">Github_URL</div>
              <div className="text-blue-700">https://github.com/username</div>
            </div>
          </div>
        ) : (
          <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input className="mt-2 sb-input" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Roll_No</label>
              <input className="mt-2 sb-input" placeholder="21CS001" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input type="email" className="mt-2 sb-input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input type="tel" className="mt-2 sb-input" placeholder="9876543210" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Gender</label>
              <input className="mt-2 sb-input" placeholder="Male/Female/Other" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">DOB</label>
              <input type="date" className="mt-2 sb-input" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Degree</label>
              <input className="mt-2 sb-input" placeholder="B.E. CSE" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Admission_Year</label>
              <input type="number" className="mt-2 sb-input" placeholder="2022" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Passout_Year</label>
              <input type="number" className="mt-2 sb-input" placeholder="2026" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">CGPA</label>
              <input type="number" step="0.01" className="mt-2 sb-input" placeholder="8.5" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Address</label>
              <textarea rows={3} className="mt-2 sb-input" placeholder="Street, City, State" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Interests</label>
              <input className="mt-2 sb-input" placeholder="AI, Web Dev" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">LinkedIn_URL</label>
              <input type="url" className="mt-2 sb-input" placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Github_URL</label>
              <input type="url" className="mt-2 sb-input" placeholder="https://github.com/username" />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" className="sb-btn-ghost">Reset</button>
              <button type="button" className="sb-btn">Save (disabled)</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
