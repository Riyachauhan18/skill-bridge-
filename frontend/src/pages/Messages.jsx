import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Circle, MoreVertical, Search, Send, Smile } from "lucide-react";
import api from "../lib/api";

export default function Messages() {
  const { roll } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const meta = location.state || {};

  const [thread, setThread] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [inbox, setInbox] = useState([]);
  const [loadingInbox, setLoadingInbox] = useState(true);

  const messagesEndRef = useRef(null);

  const [myRoll] = useState(() => {
    try {
      return localStorage.getItem("rollno") || "";
    } catch {
      return "";
    }
  });

  const displayName = meta.name || roll || "Conversation";

  // Load thread and poll using existing roll-based API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!roll) return;
      try {
        const res = await api.get(`/api/messages/with/${encodeURIComponent(roll)}`);
        if (!mounted) return;
        setThread(res.data || []);
      } catch {
        // ignore for now; could surface error UI if needed
      }
    };

    if (roll) {
      load();
      const t = setInterval(load, 12000);
      return () => {
        mounted = false;
        clearInterval(t);
      };
    }
  }, [roll]);

  // Load inbox for current user and poll to build conversation list
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get("/api/messages/inbox");
        if (!mounted) return;
        setInbox(res.data || []);
        setLoadingInbox(false);
      } catch {
        if (!mounted) return;
        setLoadingInbox(false);
      }
    };
    load();
    const t = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  // Derive conversations from inbox by grouping messages by "other" roll
  const conversations = (() => {
    if (!myRoll) return [];
    const map = new Map();
    for (const m of inbox) {
      const other = m.from_roll === myRoll ? m.to_roll : m.from_roll;
      if (!other) continue;
      const existing = map.get(other);
      if (!existing || new Date(m.created_at) > new Date(existing.created_at)) {
        map.set(other, m);
      }
    }
    return Array.from(map.entries())
      .map(([other, m]) => ({
        id: other,
        name: other,
        lastMessage: m.body,
        time: m.created_at && new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        created_at: m.created_at,
        unreadCount: m.unread_count || 0,
      }))
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  })();

  // Auto-scroll to bottom whenever thread changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [thread]);

  const send = async () => {
    if (!newMsg.trim() || !roll) return;
    const body = newMsg.trim();

    // Optimistic append
    const optimistic = {
      id: `temp-${Date.now()}`,
      body,
      created_at: new Date().toISOString(),
      from_roll: "me", // anything different from roll means outgoing bubble
    };
    setThread((prev) => [...prev, optimistic]);
    setNewMsg("");

    setSending(true);
    try {
      await api.post("/api/messages", {
        to_roll: roll,
        body,
        context: "messages-page",
      });
      // Re-sync from server so timestamps / ordering are correct
      const res = await api.get(`/api/messages/with/${encodeURIComponent(roll)}`);
      setThread(res.data || []);
    } catch (e) {
      // On error, we could rollback or show toast; for now just log
      console.error("Failed to send message", e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sending && newMsg.trim()) {
        send();
      }
    }
  };

  return (
    <div className="w-full h-[calc(100vh-88px)] flex overflow-hidden bg-[#EEF2F7]">
      {/* Left sidebar: conversations list */}
      <aside className="hidden md:flex md:w-[32%] lg:w-[30%] flex-col border-r border-slate-200 bg-[#FAFAFA]">
        <div className="px-4 py-3 border-b border-slate-200 bg-white">
          <h2 className="text-sm font-semibold text-slate-900">Messages</h2>
          <p className="mt-1 text-xs text-slate-500">Your recent conversations</p>
        </div>

        {/* Search bar */}
        <div className="px-3 py-2 border-b border-slate-100">
          <div className="flex items-center gap-2 rounded-full bg-[#F5F7FB] px-3 py-1.5 border border-slate-100">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations"
              className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="h-full flex items-center justify-center px-4 text-xs text-slate-500 text-center">
              No conversations yet.
            </div>
          ) : (
            <ul className="py-2">
              {conversations
                .filter((c) =>
                  search.trim()
                    ? c.name.toLowerCase().includes(search.toLowerCase()) ||
                      c.id.toLowerCase().includes(search.toLowerCase())
                    : true
                )
                .map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/messages/${encodeURIComponent(c.id)}`, { state: { name: c.name } })}
                      className={`w-full px-3 py-2.5 flex items-center gap-3 text-left text-xs transition-colors hover:bg-[#F5F7FE] cursor-pointer ${
                        c.id === roll ? "bg-[#F5F7FE]" : ""
                      }`}
                    >
                      <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-[11px] font-semibold text-amber-700">
                        {c.name?.[0] || "S"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-[11px] font-semibold text-slate-900">
                            {c.name}
                          </span>
                          {c.time && (
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{c.time}</span>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-500 truncate">
                            {c.lastMessage}
                          </span>
                          {c.unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center min-w-[16px] h-4 rounded-full bg-emerald-500 text-[9px] font-semibold text-white px-1">
                              {c.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Right side: chat window */}
      <section className="flex-1 flex flex-col">
        {/* Sticky header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#E5EAF0] bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {/* Mobile back */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="mr-1 flex md:hidden h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-semibold">
              {displayName?.[0] || "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900">{displayName}</span>
                {roll && <Circle className="h-2 w-2 text-emerald-500" />}
              </div>
              <div className="text-[11px] text-slate-500">
                {roll ? `Online • @${roll}` : "No user selected"}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </header>

        {/* Messages area */}
        <div
          className="flex-1 px-4 py-4 overflow-y-auto bg-[radial-gradient(circle_at_top,_#ffffff,_#e5ebf5)]"
        >
          {(!thread || thread.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-xs text-slate-500 text-center gap-3">
              <div className="h-14 w-14 rounded-full bg-white/80 border border-slate-200 flex items-center justify-center shadow-sm">
                <Smile className="h-6 w-6 text-slate-400" />
              </div>
              <div className="text-sm font-semibold text-slate-700">Select a conversation to start chatting</div>
              <div className="text-[11px] text-slate-500 max-w-xs">
                Your messages will appear here. Choose someone from the left panel or start a new conversation.
              </div>
            </div>
          )}

          <div className="space-y-2">
            {thread.map((m) => {
              const isIncoming = m.from_roll === roll; // from_roll == other person's roll
              return (
                <div
                  key={m.id}
                  className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[60%] px-3.5 py-2.5 text-[13px] leading-snug rounded-2xl shadow-sm ${
                      isIncoming
                        ? "bg-white border border-[#E5EAF0] rounded-2xl rounded-bl-md"
                        : "bg-[#DCF8C6] text-slate-900 rounded-2xl rounded-br-md"
                    }`}
                  >
                    <div>{m.body}</div>
                    <div
                      className={`mt-1 text-[10px] ${
                        isIncoming ? "text-slate-400" : "text-black/70"
                      }`}
                    >
                      {m.created_at
                        ? new Date(m.created_at).toLocaleTimeString()
                        : ""}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat input section */}
        <div className="border-t border-[#E5EAF0] bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-full bg-[#F7F8FC] border border-slate-200 px-3 py-2.5 shadow-sm">
              <button
                type="button"
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500"
              >
                <Smile className="h-4 w-4" />
              </button>
              <input
                type="text"
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
                placeholder="Type a message..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                onClick={send}
                disabled={sending || !newMsg.trim()}
                className="h-9 w-9 rounded-full bg-[#00A884] flex items-center justify-center text-white shadow-sm hover:bg-[#029270] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
