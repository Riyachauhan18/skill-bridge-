import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Briefcase, FlaskConical, UserCog, MessageCircle, CheckCircle2, XCircle, Sparkles, ShieldCheck } from "lucide-react";
import api from "../lib/api";

export default function AdminOverview() {
  const [params, setParams] = useSearchParams();
  const role = params.get("role") || "admin";
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState(params.get('status') ?? "Pending");
  const [type, setType] = useState(params.get('type') ?? "");
  const [batch, setBatch] = useState(params.get('batch') ?? "");
  const [inbox, setInbox] = useState([]);
  const [selectedRoll, setSelectedRoll] = useState("");
  const [thread, setThread] = useState([]);
  const [msg, setMsg] = useState("");
  const [loadingThread, setLoadingThread] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkNote, setBulkNote] = useState("");
  const [actionNote, setActionNote] = useState("");
  const [analytics, setAnalytics] = useState({ topSkills: [], achievementsByType: [] });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  const statusSummary = useMemo(() => {
    const result = { Approved: 0, Pending: 0, Rejected: 0 };
    for (const r of rows) {
      const key = (r.status || "Pending");
      if (key === "Approved") result.Approved += 1;
      else if (key === "Rejected") result.Rejected += 1;
      else result.Pending += 1;
    }
    return result;
  }, [rows]);

  const load = async () => {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (type) q.set("type", type);
    if (batch) q.set("batch", batch);
    const res = await api.get(`/api/admin/internships?${q.toString()}`);
    setRows(res.data || []);
  };

  // Persist filters in URL
  useEffect(() => {
    const q = new URLSearchParams(params);
    if (status) q.set('status', status); else q.delete('status');
    if (type) q.set('type', type); else q.delete('type');
    if (batch) q.set('batch', batch); else q.delete('batch');
    setParams(q, { replace: true });
    load().catch(()=>{});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, type, batch]);

  // Load inbox on mount and poll
  useEffect(() => {
    let mounted = true;
    const fetchInbox = async () => {
      try {
        const res = await api.get('/api/messages/inbox');
        if (!mounted) return;
        setInbox(res.data || []);
      } catch {}
    };
    fetchInbox();
    const t = setInterval(fetchInbox, 15000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  // Load thread when selected
  useEffect(() => {
    if (!selectedRoll) { setThread([]); return; }
    let mounted = true;
    (async () => {
      setLoadingThread(true);
      try {
        const res = await api.get(`/api/messages/with/${selectedRoll}`);
        if (!mounted) return;
        setThread(res.data || []);
      } catch {}
      finally { if (mounted) setLoadingThread(false); }
    })();
    const t = setInterval(async ()=>{
      try {
        const res = await api.get(`/api/messages/with/${selectedRoll}`);
        setThread(res.data || []);
      } catch {}
    }, 12000);
    return () => { mounted = false; clearInterval(t); };
  }, [selectedRoll]);

  const conversations = useMemo(() => {
    // Group inbox by from_roll and compute unread counts
    const map = new Map();
    for (const m of inbox) {
      const key = m.from_roll;
      if (!map.has(key)) map.set(key, { items: [], unread: 0 });
      const bucket = map.get(key);
      bucket.items.push(m);
      if (!m.read_at) bucket.unread += 1;
    }
    return Array.from(map.entries())
      .map(([roll, { items, unread }]) => ({ roll, latest: items[0], unread }))
      .sort((a,b)=> new Date(b.latest.created_at) - new Date(a.latest.created_at));
  }, [inbox]);

  // Mark messages as read when thread is viewed/updated
  useEffect(() => {
    if (!selectedRoll || !thread.length) return;
    const myRoll = localStorage.getItem('rollno');
    const toMark = thread.filter(m => m.to_roll === myRoll && !m.read_at).map(m => m.id);
    if (toMark.length === 0) return;
    (async () => {
      try {
        await Promise.all(toMark.map(id => api.put(`/api/messages/${id}/read`)));
        // Refresh inbox to update unread counts
        const res = await api.get('/api/messages/inbox');
        setInbox(res.data || []);
      } catch {}
    })();
  }, [selectedRoll, thread]);

  // Load admin analytics for skills & achievements
  useEffect(() => {
    let mounted = true;
    (async () => {
      setAnalyticsLoading(true);
      setAnalyticsError("");
      try {
        const res = await api.get('/api/admin/analytics/skills-achievements');
        if (!mounted) return;
        setAnalytics(res.data || { topSkills: [], achievementsByType: [] });
      } catch {
        if (!mounted) return;
        setAnalyticsError("Failed to load skills & achievements analytics.");
      } finally {
        if (mounted) setAnalyticsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      {/* Compact gradient header */}
      <div className="rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-slate-50 text-slate-900 shadow-sm border border-slate-200">
        <div className="px-5 py-4 md:px-7 md:py-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-slate-900">Admin Dashboard</h2>
            <p className="text-xs md:text-sm text-slate-600">Overview, approvals, and communications at a glance.</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-800 shadow-xs">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span className="uppercase tracking-wide">Role: Admin</span>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-800 shadow-xs hover:bg-white transition"
            >
              <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
                AD
              </div>
              <span>Admin</span>
              <span className="text-slate-400 text-xs">▾</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
        <h3 className="text-[18px] md:text-[20px] font-semibold text-[#111827] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Link
            to={`/dashboard/admin?role=${role}`}
            className="group flex flex-col gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shadow-xs">
                <MessageCircle className="h-5 w-5 text-slate-700" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111827]">Admin Dashboard</div>
              <p className="mt-1 text-xs text-slate-500">Return to the main admin overview.</p>
            </div>
          </Link>

          <Link
            to={`/dashboard/ps2?role=${role}`}
            className="group flex flex-col gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shadow-xs">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111827]">Post Internship</div>
              <p className="mt-1 text-xs text-slate-500">Create and publish new PS1/PS2 opportunities.</p>
            </div>
          </Link>

          <Link
            to={`/dashboard/research?role=${role}`}
            className="group flex flex-col gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center shadow-xs">
                <FlaskConical className="h-5 w-5 text-indigo-600" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111827]">Add Research Highlight</div>
              <p className="mt-1 text-xs text-slate-500">Showcase new papers, projects, and achievements.</p>
            </div>
          </Link>

          <Link
            to={`/dashboard/mentor-finder?role=${role}`}
            className="group flex flex-col gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all hover:border-blue-500"
          >
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shadow-xs">
                <Sparkles className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#111827]">Mentor Finder</div>
              <p className="mt-1 text-xs text-slate-500">Match juniors with the right seniors for guidance.</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Internship Verification */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <h3 className="text-[18px] md:text-[20px] font-semibold text-[#111827]">Internship Verification</h3>
          <div className="flex items-center gap-2 text-xs md:text-[13px] flex-wrap">
            <Link to={`/dashboard/ps1?role=${role}`} className="sb-btn-ghost-light">Open in PS</Link>
            <button className="sb-btn-ghost-light" onClick={()=>load()}>Refresh</button>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs md:text-[13px] bg-slate-50/80 border border-slate-200 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Status</span>
            <select className="sb-input-light w-32 h-8 text-xs" value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Type</span>
            <div className="inline-flex rounded-full border border-slate-200 bg-white overflow-hidden">
              {[
                { label: 'All', value: '' },
                { label: 'PS1', value: 'PS1' },
                { label: 'PS2', value: 'PS2' },
              ].map(t => (
                <button
                  key={t.value || 'all'}
                  type="button"
                  onClick={()=>setType(t.value)}
                  className={`px-3 py-1.5 text-xs md:text-[13px] font-medium transition ${type===t.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-medium">Batch</span>
            <input className="sb-input-light w-28 h-8 text-xs" placeholder="e.g., 2026" value={batch} onChange={(e)=>setBatch(e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex items-center gap-2">
            <input type="checkbox" className="sb-checkbox" checked={selectedIds.length === rows.length && rows.length>0} onChange={(e)=>{
              if (e.target.checked) setSelectedIds(rows.map(r=>r.internship_id)); else setSelectedIds([]);
            }} />
            <span className="text-sm text-slate-600">Select All</span>
          </div>
          <input className="sb-input-light flex-1" placeholder="Note for bulk action (optional)" value={bulkNote} onChange={(e)=>setBulkNote(e.target.value)} />
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-emerald-600 text-white text-sm hover:bg-emerald-700 hover:shadow-md transition disabled:opacity-50" disabled={!selectedIds.length} onClick={async ()=>{
              try { await api.post('/api/admin/internships/bulk', { ids: selectedIds, action: 'approve', note: bulkNote }); setSelectedIds([]); setBulkNote(''); await load(); } catch { alert('Bulk approve failed'); }
            }}>
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve Selected</span>
            </button>
            <button className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-rose-600 text-white text-sm hover:bg-rose-700 hover:shadow-md transition disabled:opacity-50" disabled={!selectedIds.length} onClick={async ()=>{
              try { await api.post('/api/admin/internships/bulk', { ids: selectedIds, action: 'reject', note: bulkNote }); setSelectedIds([]); setBulkNote(''); await load(); } catch { alert('Bulk reject failed'); }
            }}>
              <XCircle className="h-4 w-4" />
              <span>Reject Selected</span>
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="sb-table">
            <thead>
              <tr>
                <th className="sb-th w-10"><input type="checkbox" className="sb-checkbox" checked={selectedIds.length === rows.length && rows.length>0} onChange={(e)=>{
                  if (e.target.checked) setSelectedIds(rows.map(r=>r.internship_id)); else setSelectedIds([]);
                }} /></th>
                <th className="sb-th">Company</th>
                <th className="sb-th">Type</th>
                <th className="sb-th">Duration</th>
                <th className="sb-th">Dates</th>
                <th className="sb-th">Status</th>
                <th className="sb-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.internship_id} className="sb-tr odd:bg-slate-50/60 even:bg-white hover:bg-slate-100/80">
                  <td className="sb-td"><input type="checkbox" className="sb-checkbox" checked={selectedIds.includes(r.internship_id)} onChange={(e)=>{
                    setSelectedIds(prev => e.target.checked ? Array.from(new Set([...prev, r.internship_id])) : prev.filter(x=>x!==r.internship_id));
                  }} /></td>
                  <td className="sb-td">{r.company_name}</td>
                  <td className="sb-td">{r.internship_type}</td>
                  <td className="sb-td">{r.duration || '-'}</td>
                  <td className="sb-td">{[r.start_date && new Date(r.start_date).toLocaleDateString(), r.end_date && new Date(r.end_date).toLocaleDateString()].filter(Boolean).join(' → ')}</td>
                  <td className="sb-td">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        r.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : r.status === 'Rejected'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {r.status || 'Pending'}
                    </span>
                  </td>
                  <td className="sb-td">
                    <div className="flex items-center justify-end gap-2">
                      <input className="sb-input w-40 text-xs" placeholder="Note (optional)" value={actionNote} onChange={(e)=>setActionNote(e.target.value)} />
                      <button
                        onClick={async ()=>{ try { await api.post(`/api/admin/internships/${r.internship_id}/approve`, { note: actionNote }); setActionNote(''); await load(); } catch { alert('Approve failed'); } }}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 hover:shadow-sm transition"
                        title="Approve"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async ()=>{ try { await api.post(`/api/admin/internships/${r.internship_id}/reject`, { note: actionNote }); setActionNote(''); await load(); } catch { alert('Reject failed'); } }}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 hover:shadow-sm transition"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      

      {/* Skills & Achievements Analytics */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-5">
        <h3 className="text-[18px] md:text-[20px] font-semibold text-[#111827]">Skills & Achievements Analytics</h3>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-emerald-700 uppercase tracking-wide">Approved</span>
            <span className="text-xl font-semibold text-emerald-900">{statusSummary.Approved}</span>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50/70 px-3 py-2.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-amber-700 uppercase tracking-wide">Pending</span>
            <span className="text-xl font-semibold text-amber-900">{statusSummary.Pending}</span>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50/70 px-3 py-2.5 flex flex-col gap-1">
            <span className="text-[11px] font-medium text-rose-700 uppercase tracking-wide">Rejected</span>
            <span className="text-xl font-semibold text-rose-900">{statusSummary.Rejected}</span>
          </div>
        </div>
        {analyticsError && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {analyticsError}
          </div>
        )}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-medium text-slate-800">Top Skills</div>
            {analyticsLoading ? (
              <div className="mt-3 text-xs text-slate-500">Loading skills...</div>
            ) : !analytics.topSkills?.length ? (
              <div className="mt-3 text-xs text-slate-500">No skill data available yet.</div>
            ) : (
              <div className="mt-3 space-y-2">
                {analytics.topSkills.map((item) => {
                  const label = item.name;
                  const count = item.count || 0;
                  const max = Math.max(...analytics.topSkills.map(s => s.count || 0), 1);
                  const pct = Math.round((count / max) * 100);
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{label}</span>
                        <span>{count} students</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-800">Achievements by Type</div>
            {analyticsLoading ? (
              <div className="mt-3 text-xs text-slate-500">Loading achievements...</div>
            ) : !analytics.achievementsByType?.length ? (
              <div className="mt-3 text-xs text-slate-500">No achievements data available yet.</div>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                {analytics.achievementsByType.slice(0, 3).map(x => (
                  <div key={x.type} className="rounded-xl border border-[#E5EAF0] bg-white p-3 shadow-sm hover:shadow-md transition">
                    <div className="text-2xl font-semibold text-slate-900">{x.count}</div>
                    <div className="text-xs text-slate-600">{x.type}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Reports & Export */}
      <section className="bg-white rounded-2xl border border-[#E5EAF0] shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] md:text-[20px] font-semibold text-[#111827]">Reports & Export</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <button className="sb-btn" onClick={async ()=>{ await downloadCsv('/api/admin/exports/students.csv', 'students.csv'); }}>Export Students (CSV)</button>
          <button className="sb-btn-ghost-light" onClick={async ()=>{ await downloadCsv('/api/admin/exports/skills.csv', 'skills.csv'); }}>Export Skills (CSV)</button>
          <button className="sb-btn-ghost-light" onClick={async ()=>{ await downloadCsv('/api/admin/exports/internships.csv', 'internships.csv'); }}>Export Internships (CSV)</button>
        </div>
      </section>
    </div>
  );
}

async function downloadCsv(path, filename) {
  try {
    const res = await api.get(path, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (e) {
    alert('Export failed');
  }
}
