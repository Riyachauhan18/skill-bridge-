export default function Profile() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
      <form className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Roll_No</label>
          <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="21CS001" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="you@example.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input type="tel" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="9876543210" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Male/Female/Other" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">DOB</label>
          <input type="date" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Degree</label>
          <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="B.E. CSE" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Admission_Year</label>
          <input type="number" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="2022" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Passout_Year</label>
          <input type="number" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="2026" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">CGPA</label>
          <input type="number" step="0.01" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="8.5" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea rows={3} className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Street, City, State" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Interests</label>
          <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="AI, Web Dev" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">LinkedIn_URL</label>
          <input type="url" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="https://linkedin.com/in/..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Github_URL</label>
          <input type="url" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="https://github.com/username" />
        </div>

        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
          <button type="button" className="px-4 py-2 rounded-md border text-gray-700">Reset</button>
          <button type="button" className="px-4 py-2 rounded-md bg-blue-600 text-white">Save (disabled)</button>
        </div>
      </form>
    </div>
  );
}
