export default function Internships() {
  const demo = [
    { company: "TechCorp", type: "Paid", domain: "Web Dev", mentor: "Alice", duration: "8 weeks", start: "2025-05-01", end: "2025-06-30" },
    { company: "DataWorks", type: "Unpaid", domain: "Data Science", mentor: "Bob", duration: "6 weeks", start: "2025-07-01", end: "2025-08-15" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800">Internships</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-3 py-2 font-medium">Company_Name</th>
                <th className="text-left px-3 py-2 font-medium">Type</th>
                <th className="text-left px-3 py-2 font-medium">Domain</th>
                <th className="text-left px-3 py-2 font-medium">Mentor_Name</th>
                <th className="text-left px-3 py-2 font-medium">Duration</th>
                <th className="text-left px-3 py-2 font-medium">Start_Date</th>
                <th className="text-left px-3 py-2 font-medium">End_Date</th>
              </tr>
            </thead>
            <tbody>
              {demo.map((i, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-3 py-2">{i.company}</td>
                  <td className="px-3 py-2">{i.type}</td>
                  <td className="px-3 py-2">{i.domain}</td>
                  <td className="px-3 py-2">{i.mentor}</td>
                  <td className="px-3 py-2">{i.duration}</td>
                  <td className="px-3 py-2">{i.start}</td>
                  <td className="px-3 py-2">{i.end}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800">Add Internship</h3>
        <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e)=> e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Company_Name</label>
            <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Company Pvt Ltd" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500">
              <option>Paid</option>
              <option>Unpaid</option>
              <option>On-Campus</option>
              <option>Off-Campus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Domain</label>
            <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="AI / Web / Mobile / Data" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mentor_Name</label>
            <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="Mentor Name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration</label>
            <input className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" placeholder="e.g., 8 weeks" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start_Date</label>
            <input type="date" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End_Date</label>
            <input type="date" className="mt-1 w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <button type="reset" className="px-4 py-2 rounded-md border text-gray-700">Reset</button>
            <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white">Add (UI only)</button>
          </div>
        </form>
      </div>
    </div>
  );
}
