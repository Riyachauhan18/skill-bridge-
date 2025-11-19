import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";

export default function EditInformation() {
  const [params] = useSearchParams();
  const role = params.get("role") || "student";
  const isAdmin = role === "admin";
  const formRef = useRef(null);
  const [technical, setTechnical] = useState([]);
  const [soft, setSoft] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [internships, setInternships] = useState([]);
  const [addAch, setAddAch] = useState({ title: '', type: '', date: '' });
  const [addInt, setAddInt] = useState({ company_name: '', internship_type: 'PS1', role: '', domain: '', duration: '', start_date: '', end_date: '' });
  const [research, setResearch] = useState([]);
  const [addRes, setAddRes] = useState({ title: '', date: '', published_link: '', description: '' });
  const [interests, setInterests] = useState([]);

  // Pre-fill form on load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/me');
        if (!mounted) return;
        const me = res.data || {};
        const p = me.profile || {};
        const f = formRef.current;
        if (!f) return;
        const set = (name, val) => {
          const el = f.querySelector(`[name="${name}"]`);
          if (!el || val === undefined || val === null) return;
          if (el.type === 'date') {
            try { el.value = new Date(val).toISOString().slice(0,10); } catch { el.value = ''; }
          } else {
            el.value = String(val);
          }
        };
        set('rollno', me.roll_number);
        set('full_name', me.full_name);
        set('bio', p.bio);
        set('gender', p.gender);
        set('dob', p.dob);
        set('degree', p.degree);
        set('department', p.department);
        set('batch_year', p.batch_year);
        set('cgpa', p.cgpa);
        set('linkedin_url', p.linkedin_url);
        set('github_url', p.github_url);
        set('portfolio_url', p.portfolio_url);
        set('phone', p.phone);
        set('passout_year', p.passout_year);
        set('email', me.email);
      } catch {}
    })();
    return () => { mounted = false };
  }, []);

  // Load research
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/research');
        if (!mounted) return;
        setResearch(res.data || []);
      } catch {}
    })();
    return () => { mounted = false };
  }, []);

  // Load interests
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

  // Load achievements + internships
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [a, i] = await Promise.all([
          api.get('/api/achievements'),
          api.get('/api/internships'),
        ]);
        if (!mounted) return;
        setAchievements(a.data || []);
        setInternships(i.data || []);
      } catch {}
    })();
    return () => { mounted = false };
  }, []);

  // Load skills
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/skills');
        if (!mounted) return;
        setTechnical(res.data?.technical || []);
        setSoft(res.data?.soft || []);
      } catch {}
    })();
    return () => { mounted = false };
  }, []);

  const addSkill = async (type, name) => {
    if (!name) return;
    try {
      await api.post('/api/skills', { type, name });
      if (type === 'technical') setTechnical((s) => Array.from(new Set([...s, name])));
      else setSoft((s) => Array.from(new Set([...s, name])));
    } catch {
      alert('Failed to add skill');
    }
  };

  const removeSkill = async (type, name) => {
    try {
      await api.delete('/api/skills', { data: { type, name } });
      if (type === 'technical') setTechnical((s) => s.filter((x) => x !== name));
      else setSoft((s) => s.filter((x) => x !== name));
    } catch {
      alert('Failed to remove skill');
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-5xl mx-auto px-4 md:px-0 space-y-8">
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 text-slate-900 shadow-sm">
          <div className="px-6 py-6 md:px-8 md:py-8">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              <span className="text-slate-900">Edit</span>{" "}
              <span className="text-amber-600">Information</span>
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-700">
              Update your personal details, academics, achievements and preferences in one clean dashboard.
            </p>
          </div>
        </div>

        <form
          ref={formRef}
          className="space-y-8"
          onSubmit={async (e)=>{
        e.preventDefault();
        const form = e.currentTarget;
        const payload = {};
        const getV = (name) => form.querySelector(`[name="${name}"]`)?.value?.trim();
        const setIf = (k, v) => { if (v !== undefined && v !== "" && v !== null) payload[k] = v; };

        setIf('full_name', getV('full_name'));
        setIf('dob', getV('dob'));
        setIf('gender', getV('gender'));
        setIf('bio', getV('bio'));
        setIf('degree', getV('degree'));
        setIf('department', getV('department'));
        const by = getV('batch_year'); if (by) payload.batch_year = Number(by);
        const cg = getV('cgpa'); if (cg) payload.cgpa = Number(cg);
        setIf('linkedin_url', getV('linkedin_url'));
        setIf('github_url', getV('github_url'));
        setIf('portfolio_url', getV('portfolio_url'));
        const py = getV('passout_year'); if (py) payload.passout_year = Number(py);
        setIf('phone', getV('phone'));

        try {
          const rollno = localStorage.getItem('rollno');
          if (!rollno) throw new Error('No roll number in session');
          await api.put(`/api/profiles/${rollno}` , payload);
          alert('Profile updated');
        } catch (err) {
          alert('Failed to update profile');
        }
      }}
        >
          {/* Personal Details */}
          <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 mt-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
            <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Personal Details</h3>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="sb-label">Full Name</label>
                <input
                  name="full_name"
                  className="sb-input h-11 rounded-xl border border-[#E5EAF0] bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="sb-label">Date of Birth</label>
                <input
                  name="dob"
                  type="date"
                  className="sb-input h-11 rounded-xl border border-[#E5EAF0] bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition"
                />
              </div>
              <div>
                <label className="sb-label">Gender</label>
                <select
                  name="gender"
                  className="sb-input h-11 rounded-xl border border-[#E5EAF0] bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition"
                >
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              {/* Reserve right column for future field to keep grid balanced */}
              <div className="hidden md:block" />
              <div className="md:col-span-2">
                <label className="sb-label">About / Bio</label>
                <textarea
                  name="bio"
                  className="sb-input min-h-[140px] rounded-xl border border-[#E5EAF0] bg-white px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 focus:shadow-sm transition"
                  placeholder="Write a short summary about yourself, your goals, and what you're looking for."
                />
              </div>
            </div>
          </section>

          {/* Achievements */}
          <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
            <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Achievements</h3>
            <div className="mt-4 space-y-3">
              {achievements.map((a) => (
                <div
                  key={a.achievement_id}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 md:p-3.5 bg-white border border-[#E5EAF0] rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                >
                  <div>
                    <div className="font-medium text-slate-900 text-sm md:text-[15px]">{a.title}</div>
                    <div className="text-[11px] text-slate-600">
                      {a.type} {a.date ? `• ${new Date(a.date).toLocaleDateString()}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="sb-btn-ghost text-xs rounded-full px-3 py-1 hover:bg-red-50 hover:text-red-600 transition"
                    onClick={async ()=>{
                      try {
                        await api.delete(`/api/achievements/${a.achievement_id}`);
                        setAchievements((s)=> s.filter(x=>x.achievement_id!==a.achievement_id));
                      } catch { alert('Failed to delete'); }
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    className="sb-input h-11 rounded-xl border border-[#E5EAF0] bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition"
                    placeholder="Title"
                    value={addAch.title}
                    onChange={(e)=>setAddAch(v=>({...v,title:e.target.value}))}
                  />
                  <input
                    className="sb-input h-11 rounded-xl border border-[#E5EAF0] bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition"
                    placeholder="Type (e.g., Hackathon)"
                    value={addAch.type}
                    onChange={(e)=>setAddAch(v=>({...v,type:e.target.value}))}
                  />
                  <input
                    type="date"
                    className="sb-input h-11 rounded-xl border border-[#E5EAF0] bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition"
                    value={addAch.date}
                    onChange={(e)=>setAddAch(v=>({...v,date:e.target.value}))}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="sb-btn rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-[1px] transition"
                    onClick={async ()=>{
                      if (!addAch.title || !addAch.type) return alert('Title and Type required');
                      try {
                        const res = await api.post('/api/achievements', addAch);
                        setAchievements((s)=> [res.data, ...s]);
                        setAddAch({ title: '', type: '', date: '' });
                      } catch { alert('Failed to add achievement'); }
                    }}
                  >
                    Add Achievement
                  </button>
                </div>
              </div>
            </div>
          </section>

        {/* Research Highlights */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
          <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Research Highlights</h3>
          <div className="mt-4 space-y-3">
            {research.map((r) => (
              <div key={r.highlight_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-slate-900">{r.title}</div>
                  <div className="text-xs text-slate-600">{r.date ? new Date(r.date).toLocaleDateString() : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  {r.published_link && (
                    <a href={r.published_link} target="_blank" rel="noreferrer" className="sb-btn-ghost text-xs">Open</a>
                  )}
                  <button type="button" className="sb-btn-ghost" onClick={async ()=>{
                    try { await api.delete(`/api/research/${r.highlight_id}`); setResearch((s)=> s.filter(x=>x.highlight_id!==r.highlight_id)); } catch { alert('Failed to delete'); }
                  }}>Delete</button>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <input className="sb-input" placeholder="Title" value={addRes.title} onChange={(e)=>setAddRes(v=>({...v,title:e.target.value}))} />
              <input type="date" className="sb-input" value={addRes.date} onChange={(e)=>setAddRes(v=>({...v,date:e.target.value}))} />
              <input className="sb-input" placeholder="Published Link (optional)" value={addRes.published_link} onChange={(e)=>setAddRes(v=>({...v,published_link:e.target.value}))} />
              <input className="sb-input" placeholder="Description (optional)" value={addRes.description} onChange={(e)=>setAddRes(v=>({...v,description:e.target.value}))} />
              <button type="button" className="sb-btn" onClick={async ()=>{
                if (!addRes.title) return alert('Title required');
                try {
                  const payload = { ...addRes };
                  if (!payload.published_link) delete payload.published_link;
                  if (!payload.description) delete payload.description;
                  if (!payload.date) delete payload.date;
                  const res = await api.post('/api/research', payload);
                  setResearch((s)=> [res.data, ...s]);
                  setAddRes({ title: '', date: '', published_link: '', description: '' });
                } catch { alert('Failed to add research'); }
              }}>Add</button>
            </div>
          </div>
        </section>

        {/* Internships */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
          <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Internships</h3>
          <div className="mt-4 space-y-3">
            {internships.map((it) => (
              <div key={it.internship_id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-slate-900">{it.company_name} <span className="text-xs text-slate-600">({it.internship_type})</span></div>
                  <div className="text-xs">Status: <span className="font-medium">{it.status}</span></div>
                </div>
                <div className="text-xs text-slate-600">{[it.role, it.domain, it.duration].filter(Boolean).join(' • ')}</div>
                <div className="text-xs text-slate-600">{[it.start_date && new Date(it.start_date).toLocaleDateString(), it.end_date && new Date(it.end_date).toLocaleDateString()].filter(Boolean).join(' → ')}</div>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="sb-btn-ghost" onClick={async ()=>{
                    try { await api.delete(`/api/internships/${it.internship_id}`); setInternships(s=> s.filter(x=>x.internship_id!==it.internship_id)); } catch { alert('Failed to delete'); }
                  }}>Delete</button>
                </div>
              </div>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              <input className="sb-input" placeholder="Company" value={addInt.company_name} onChange={(e)=>setAddInt(v=>({...v,company_name:e.target.value}))} />
              <select className="sb-input" value={addInt.internship_type} onChange={(e)=>setAddInt(v=>({...v,internship_type:e.target.value}))}>
                <option value="PS1">PS1</option>
                <option value="PS2">PS2</option>
              </select>
              <input className="sb-input" placeholder="Role" value={addInt.role} onChange={(e)=>setAddInt(v=>({...v,role:e.target.value}))} />
              <input className="sb-input" placeholder="Domain" value={addInt.domain} onChange={(e)=>setAddInt(v=>({...v,domain:e.target.value}))} />
              <input className="sb-input" placeholder="Duration" value={addInt.duration} onChange={(e)=>setAddInt(v=>({...v,duration:e.target.value}))} />
              <div className="grid grid-cols-2 gap-2 md:col-span-2">
                <input type="date" className="sb-input" value={addInt.start_date} onChange={(e)=>setAddInt(v=>({...v,start_date:e.target.value}))} />
                <input type="date" className="sb-input" value={addInt.end_date} onChange={(e)=>setAddInt(v=>({...v,end_date:e.target.value}))} />
              </div>
              <button type="button" className="sb-btn md:col-span-1" onClick={async ()=>{
                if (!addInt.company_name) return alert('Company required');
                try {
                  const res = await api.post('/api/internships', addInt);
                  setInternships(s=> [res.data, ...s]);
                  setAddInt({ company_name: '', internship_type: 'PS1', role: '', domain: '', duration: '', start_date: '', end_date: '' });
                } catch { alert('Failed to add internship'); }
              }}>Add</button>
            </div>
          </div>
        </section>

        {/* Academic Information */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
          <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Academic Information</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="sb-label">Roll Number</label>
              <input name="rollno" className="sb-input bg-slate-50" placeholder="Read-only" readOnly defaultValue={typeof window!=="undefined"?localStorage.getItem('rollno')||'':''} />
            </div>
            <div>
              <label className="sb-label">Degree / Program</label>
              <input name="degree" className="sb-input" placeholder="e.g., B.Tech" />
            </div>
            <div>
              <label className="sb-label">Department / Major</label>
              <input name="department" className="sb-input" placeholder="e.g., CSE" />
            </div>
            <div>
              <label className="sb-label">Batch / Passout Year</label>
              <input name="batch_year" className="sb-input" placeholder="e.g., 2026" />
            </div>
            <div>
              <label className="sb-label">Current CGPA</label>
              <input name="cgpa" className="sb-input" placeholder="e.g., 8.5" />
            </div>
          </div>
        </section>

        {/* Contact & Links */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
          <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Contact & Links</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="sb-label">Email (primary)</label>
              <input name="email" className="sb-input" placeholder="you@example.com" />
            </div>
            <div>
              <label className="sb-label">Alternate Email</label>
              <input name="alt_email" className="sb-input" placeholder="alternate@example.com" />
            </div>
            <div>
              <label className="sb-label">Phone</label>
              <input name="phone" className="sb-input" placeholder="+91-XXXXXXXXXX" />
            </div>
            <div>
              <label className="sb-label">LinkedIn URL</label>
              <input name="linkedin_url" className="sb-input" placeholder="https://linkedin.com/in/username" />
            </div>
            <div>
              <label className="sb-label">GitHub URL</label>
              <input name="github_url" className="sb-input" placeholder="https://github.com/username" />
            </div>
            <div>
              <label className="sb-label">Portfolio / Website</label>
              <input name="portfolio_url" className="sb-input" placeholder="https://yourdomain.com" />
            </div>
          </div>
        </section>

        {/* Skills & Interests */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
          <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Skills & Interests</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="sb-label">Technical Skills</label>
              <div className="flex flex-wrap gap-2 items-center">
                {technical.map((t) => (
                  <button type="button" key={t} onClick={() => removeSkill('technical', t)} className="sb-chip sb-chip-primary">
                    {t} ×
                  </button>
                ))}
                <input name="tech_input" className="sb-input w-full md:w-auto" placeholder="Add a technical skill" />
                <button type="button" className="sb-btn" onClick={() => {
                  const el = formRef.current?.querySelector('[name=tech_input]');
                  const v = el?.value?.trim();
                  if (v) { addSkill('technical', v); if (el) el.value = ''; }
                }}>Add</button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="sb-label">Soft Skills</label>
              <div className="flex flex-wrap gap-2 items-center">
                {soft.map((t) => (
                  <button type="button" key={t} onClick={() => removeSkill('soft', t)} className="sb-chip">
                    {t} ×
                  </button>
                ))}
                <input name="soft_input" className="sb-input w-full md:w-auto" placeholder="Add a soft skill" />
                <button type="button" className="sb-btn" onClick={() => {
                  const el = formRef.current?.querySelector('[name=soft_input]');
                  const v = el?.value?.trim();
                  if (v) { addSkill('soft', v); if (el) el.value = ''; }
                }}>Add</button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="sb-label">Interests / Domains</label>
              <div className="flex flex-wrap gap-2 items-center">
                {interests.map((n) => (
                  <button type="button" key={n} onClick={async ()=>{
                    try { await api.delete('/api/interests', { data: { name: n } }); setInterests((s)=> s.filter(x=>x!==n)); } catch { alert('Failed to remove'); }
                  }} className="sb-chip">{n} ×</button>
                ))}
                <input name="interest_input" className="sb-input w-full md:w-auto" placeholder="Add an interest" />
                <button type="button" className="sb-btn" onClick={async ()=>{
                  const el = formRef.current?.querySelector('[name=interest_input]');
                  const v = el?.value?.trim();
                  if (!v) return;
                  try { await api.post('/api/interests', { name: v }); setInterests((s)=> Array.from(new Set([...(s||[]), v]))); if (el) el.value = ''; } catch { alert('Failed to add'); }
                }}>Add</button>
              </div>
            </div>
          </div>
        </section>

        

        {/* Preferences */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
          <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Preferences</h3>
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
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
          <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Security</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="sb-label">Current Password</label>
              <input name="current_password" type="password" className="sb-input" placeholder="••••••••" />
            </div>
            <div>
              <label className="sb-label">New Password</label>
              <input name="new_password" type="password" className="sb-input" placeholder="••••••••" />
            </div>
            <div>
              <label className="sb-label">Confirm Password</label>
              <input name="confirm_password" type="password" className="sb-input" placeholder="••••••••" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" className="sb-btn" onClick={async ()=>{
              const f = formRef.current;
              const cur = f?.querySelector('[name=current_password]')?.value || '';
              const nw = f?.querySelector('[name=new_password]')?.value || '';
              const cf = f?.querySelector('[name=confirm_password]')?.value || '';
              if (!cur || !nw) { alert('Enter current and new password'); return; }
              if (nw !== cf) { alert('New and confirm password do not match'); return; }
              try {
                await api.post('/auth/change-password', { current_password: cur, new_password: nw });
                alert('Password updated');
                if (f) { ['current_password','new_password','confirm_password'].forEach(n=>{ const el=f.querySelector(`[name=${n}]`); if(el) el.value=''; }); }
              } catch (e) {
                alert('Failed to change password');
              }
            }}>Update Password</button>
          </div>
        </section>

        {/* Documents */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
          <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Documents</h3>
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
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
          <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Notifications</h3>
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
        <section className="bg-white rounded-2xl shadow-sm border border-[#E5EAF0] p-7 md:p-8 transition-transform transition-shadow duration-150 hover:shadow-md hover:scale-[1.01]">
          <h3 className="text-[20px] font-semibold text-[#F4B000] tracking-[0.3px] mb-4">Accessibility</h3>
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
    </div>
  );
}
