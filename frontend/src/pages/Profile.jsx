import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { User2, Mail, Phone, GraduationCap, CalendarDays, Code2, Sparkles } from "lucide-react";
import api from "../lib/api";

export default function Profile() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const role = params.get("role") || "student";
  const isStudent = role === "student";
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/dashboard/overview');
        if (!mounted) return;
        setData(res.data || {});
      } catch {}
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false };
  }, []);

  const user = data.user || {};
  const profile = data.profile || {};
  const skills = data.skills || { technical: [], soft: [] };
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/interests');
        if (!mounted) return;
        setInterests(res.data || []);
      } catch {}
    })();
    return () => { mounted = false };
  }, []);

  return (
    <div className="bg-[#F5F7FA] text-slate-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile header banner */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-[#fdfdfd] via-white to-[#f7f9fc] shadow-sm px-5 py-4 md:px-7 md:py-5 flex items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-semibold text-lg">
              {(user.full_name || user.roll_number || 'S')[0]}
            </div>
            <div className="space-y-1">
              <h1 className="text-[22px] md:text-[24px] font-semibold text-slate-900">{user.full_name || 'Student Profile'}</h1>
              <div className="text-sm text-slate-600 flex flex-wrap gap-2">
                {profile.degree && <span>{profile.degree}</span>}
                {profile.department && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span>{profile.department}</span>
                  </>
                )}
                {profile.batch_year && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span>Batch {profile.batch_year}</span>
                  </>
                )}
              </div>
              <div className="text-xs text-slate-500">{isStudent ? 'This is how your profile appears in SkillBridge.' : 'Viewing student profile information.'}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border shadow-sm ${
                isStudent
                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{isStudent ? 'Student' : 'Admin'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                const searchString = params.toString();
                navigate(`/dashboard/edit-info${searchString ? `?${searchString}` : ''}`);
              }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs md:text-sm font-medium px-4 py-2 shadow-sm hover:shadow-md transition-all"
            >
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Two-column section grid */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <User2 className="h-5 w-5 text-slate-600" />
                  <h2 className="text-[18px] md:text-[20px] font-semibold text-slate-900">Personal Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <span>Name</span>
                    </div>
                    <div className="text-sm md:text-base font-semibold text-slate-900">{user.full_name || 'Not added yet'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <span>Gender</span>
                    </div>
                    <div className="text-sm md:text-base font-medium text-slate-900">{profile.gender || 'Not added yet'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                      <span>Date of Birth</span>
                    </div>
                    <div className="text-sm md:text-base font-medium text-slate-900">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'Not added yet'}</div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <span>Bio</span>
                    </div>
                    <div className="text-sm md:text-base font-medium text-slate-900">
                      {profile.bio || 'Not added yet'}
                    </div>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <span>Interests</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(interests || []).length === 0 && (
                        <span className="text-xs md:text-sm text-slate-500">No interests added</span>
                      )}
                      {(interests || []).map((n) => (
                        <span
                          key={n}
                          className="inline-flex items-center px-3 py-1.5 rounded-full bg-slate-50 text-slate-800 text-xs font-medium border border-slate-200"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="h-5 w-5 text-slate-600" />
                  <h2 className="text-[18px] md:text-[20px] font-semibold text-slate-900">Academic Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">Roll Number</div>
                    <div className="text-sm md:text-base font-semibold text-slate-900">{user.roll_number || 'Not added yet'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">Degree</div>
                    <div className="text-sm md:text-base font-medium text-slate-900">{profile.degree || 'Not added yet'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">Department</div>
                    <div className="text-sm md:text-base font-medium text-slate-900">{profile.department || 'Not added yet'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">Batch Year</div>
                    <div className="text-sm md:text-base font-medium text-slate-900">{profile.batch_year || 'Not added yet'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">CGPA</div>
                    <div className="text-sm md:text-base font-medium text-slate-900">{profile.cgpa ?? 'Not added yet'}</div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-5 w-5 text-slate-600" />
                  <h2 className="text-[18px] md:text-[20px] font-semibold text-slate-900">Contact Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      <span>Email</span>
                    </div>
                    <div className="text-sm md:text-base font-medium text-slate-900 break-all">{user.email || 'Not added yet'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <span>Phone</span>
                    </div>
                    <div className="text-sm md:text-base font-medium text-slate-900">{profile.phone || 'Not added yet'}</div>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <Code2 className="h-5 w-5 text-slate-600" />
                  <h2 className="text-[18px] md:text-[20px] font-semibold text-slate-900">Links</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">LinkedIn</div>
                    <div className="text-sm md:text-base font-medium text-slate-900 break-all">
                      <a className="sb-link" href={profile.linkedin_url || '#'} target="_blank" rel="noreferrer">
                        {profile.linkedin_url || 'Not added yet'}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">GitHub</div>
                    <div className="text-sm md:text-base font-medium text-slate-900 break-all">
                      <a className="sb-link" href={profile.github_url || '#'} target="_blank" rel="noreferrer">
                        {profile.github_url || 'Not added yet'}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500">Portfolio</div>
                    <div className="text-sm md:text-base font-medium text-slate-900 break-all">
                      <a className="sb-link" href={profile.portfolio_url || '#'} target="_blank" rel="noreferrer">
                        {profile.portfolio_url || 'Not added yet'}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Skills cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-2">
                  <Code2 className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">Technical Skills</h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(skills.technical || []).length === 0 && (
                    <span className="text-xs md:text-sm text-slate-500">No technical skills</span>
                  )}
                  {(skills.technical || []).map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-xs md:text-sm font-medium border border-amber-200"
                    >
                      {s.skill_name || s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h3 className="text-sm md:text-base font-semibold text-slate-900">Soft Skills</h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(skills.soft || []).length === 0 && (
                    <span className="text-xs md:text-sm text-slate-500">No soft skills</span>
                  )}
                  {(skills.soft || []).map((s, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-full bg-white text-slate-800 text-xs md:text-sm font-medium border border-slate-200"
                    >
                      {s.skill_name || s}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
