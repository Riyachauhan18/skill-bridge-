import { useSearchParams } from "react-router-dom";

export default function EditInformation() {
  const [params] = useSearchParams();
  const role = params.get("role") || "student";
  const isAdmin = role === "admin";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold">Edit Information</h2>
          <p className="opacity-90 mt-1 text-sm">Update your profile, preferences, and account settings</p>
        </div>
      </div>

      <form className="space-y-6">
        {/* Personal Details */}
        <section className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-900">Personal Details</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="sb-label">Full Name</label>
              <input className="sb-input" placeholder="Your full name" />
            </div>
            <div>
              <label className="sb-label">Date of Birth</label>
              <input type="date" className="sb-input" />
            </div>
            <div>
              <label className="sb-label">Gender</label>
              <select className="sb-input">
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
                <option>Prefer not to say</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="sb-label">About / Bio</label>
              <textarea className="sb-input min-h-[96px]" placeholder="Short summary about you" />
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-900">Academic Information</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="sb-label">Roll Number</label>
              <input className="sb-input bg-slate-50" placeholder="Read-only" readOnly />
            </div>
            <div>
              <label className="sb-label">Degree / Program</label>
              <input className="sb-input" placeholder="e.g., B.Tech" />
            </div>
            <div>
              <label className="sb-label">Department / Major</label>
              <input className="sb-input" placeholder="e.g., CSE" />
            </div>
            <div>
              <label className="sb-label">Batch / Passout Year</label>
              <input className="sb-input" placeholder="e.g., 2026" />
            </div>
            <div>
              <label className="sb-label">Current CGPA</label>
              <input className="sb-input" placeholder="e.g., 8.5" />
            </div>
          </div>
        </section>

        {/* Contact & Links */}
        <section className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-900">Contact & Links</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="sb-label">Email (primary)</label>
              <input className="sb-input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="sb-label">Alternate Email</label>
              <input className="sb-input" placeholder="alternate@example.com" />
            </div>
            <div>
              <label className="sb-label">Phone</label>
              <input className="sb-input" placeholder="+91-XXXXXXXXXX" />
            </div>
            <div>
              <label className="sb-label">LinkedIn URL</label>
              <input className="sb-input" placeholder="https://linkedin.com/in/username" />
            </div>
            <div>
              <label className="sb-label">GitHub URL</label>
              <input className="sb-input" placeholder="https://github.com/username" />
            </div>
            <div>
              <label className="sb-label">Portfolio / Website</label>
              <input className="sb-input" placeholder="https://yourdomain.com" />
            </div>
          </div>
        </section>

        {/* Skills & Interests */}
        <section className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-900">Skills & Interests</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="sb-label">Technical Skills</label>
              <div className="flex flex-wrap gap-2">
                <span className="sb-chip sb-chip-primary">React</span>
                <span className="sb-chip sb-chip-primary">Node.js</span>
                <span className="sb-chip sb-chip-primary">SQL</span>
                <input className="sb-input w-full md:w-auto" placeholder="Add a skill (UI only)" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="sb-label">Soft Skills</label>
              <div className="flex flex-wrap gap-2">
                <span className="sb-chip">Communication</span>
                <span className="sb-chip">Teamwork</span>
                <input className="sb-input w-full md:w-auto" placeholder="Add a soft skill" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="sb-label">Interests / Domains</label>
              <div className="flex flex-wrap gap-2">
                <span className="sb-chip">AI</span>
                <span className="sb-chip">Web</span>
                <span className="sb-chip">Research</span>
                <input className="sb-input w-full md:w-auto" placeholder="Add an interest" />
              </div>
            </div>
          </div>
        </section>

        {/* Projects & Experience */}
        <section className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-900">Projects & Experience</h3>
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="sb-label">Project Title</label>
                <input className="sb-input" placeholder="e.g., Smart Attendance" />
              </div>
              <div className="md:col-span-2">
                <label className="sb-label">Brief</label>
                <input className="sb-input" placeholder="One-line description" />
              </div>
            </div>
            <div>
              <label className="sb-label">Links</label>
              <input className="sb-input" placeholder="GitHub / Live link" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="sb-label">Internship Company</label>
                <input className="sb-input" placeholder="Company Name" disabled={!isAdmin} />
              </div>
              <div>
                <label className="sb-label">Role</label>
                <input className="sb-input" placeholder="e.g., SDE Intern" disabled={!isAdmin} />
              </div>
              <div>
                <label className="sb-label">Duration</label>
                <input className="sb-input" placeholder="e.g., 8 weeks" disabled={!isAdmin} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="sb-label">Achievement Title</label>
                <input className="sb-input" placeholder="e.g., Hackathon Winner" />
              </div>
              <div>
                <label className="sb-label">Type</label>
                <input className="sb-input" placeholder="Competition / Publication" />
              </div>
              <div>
                <label className="sb-label">Date</label>
                <input type="date" className="sb-input" />
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-900">Preferences</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="sb-label">Visibility</label>
              <select className="sb-input">
                <option>Public</option>
                <option>University-only</option>
                <option>Private</option>
              </select>
            </div>
            <div>
              <label className="sb-label">Contact Preference</label>
              <select className="sb-input">
                <option>Email</option>
                <option>Phone</option>
                <option>LinkedIn</option>
              </select>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-900">Security</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="sb-label">Current Password</label>
              <input type="password" className="sb-input" placeholder="••••••••" />
            </div>
            <div>
              <label className="sb-label">New Password</label>
              <input type="password" className="sb-input" placeholder="••••••••" />
            </div>
            <div>
              <label className="sb-label">Confirm Password</label>
              <input type="password" className="sb-input" placeholder="••••••••" />
            </div>
          </div>
        </section>

        {/* Documents */}
        <section className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-900">Documents</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="sb-label">Resume (PDF)</label>
              <input type="file" accept="application/pdf" className="sb-input" />
              <p className="text-xs text-slate-500 mt-1">Versioning UI only (no upload)</p>
            </div>
            <div>
              <label className="sb-label">Certification</label>
              <input className="sb-input" placeholder="Name, Issuer, Link/File" />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="accent-blue-600" />
              <span>Internships</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="accent-blue-600" />
              <span>Hackathons</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" className="accent-blue-600" />
              <span>Research Calls</span>
            </label>
            <div>
              <label className="sb-label">Digest</label>
              <select className="sb-input">
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>
        </section>

        {/* Accessibility */}
        <section className="sb-card sb-card-pad">
          <h3 className="text-lg font-semibold text-slate-900">Accessibility</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="sb-label">Theme</label>
              <select className="sb-input">
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
            <div>
              <label className="sb-label">Font Size</label>
              <select className="sb-input">
                <option>Default</option>
                <option>Large</option>
              </select>
            </div>
            <label className="inline-flex items-center gap-2 mt-2">
              <input type="checkbox" className="accent-blue-600" />
              <span>Reduced motion</span>
            </label>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" className="sb-btn-ghost">Cancel</button>
          <button type="submit" className="sb-btn">Save Changes</button>
        </div>
      </form>
    </div>
  );
}
