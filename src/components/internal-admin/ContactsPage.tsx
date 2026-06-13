import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/lib/adminApi";
import { ArrowLeft, Mail, Moon, RefreshCw, Search, Sun, Send, X } from "lucide-react";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'responded';
  admin_response?: string;
  admin_responded_at?: string;
  created_at: string;
};

function timeAgo(d: string): string {
  const mins = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const ContactsPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "new" | "responded">("all");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [response, setResponse] = useState("");
  const [responding, setResponding] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("admin_theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("admin_theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchMessages = () => {
    setLoading(true);
    adminApi.getContactMessages({ limit: 100 })
      .then(d => setMessages(d.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const filtered = messages.filter(m => {
    const q = search.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRespond = async () => {
    if (!selected || !response.trim()) return;
    setResponding(true);
    try {
      await adminApi.respondToContact(selected.id, response.trim());
      setMessages(prev => prev.map(m =>
        m.id === selected.id
          ? { ...m, status: 'responded', admin_response: response.trim(), admin_responded_at: new Date().toISOString() }
          : m
      ));
      setSelected(prev => prev ? { ...prev, status: 'responded', admin_response: response.trim() } : null);
      setResponse("");
    } catch {
      alert("Failed to send response");
    } finally {
      setResponding(false);
    }
  };

  const newCount = messages.filter(m => m.status === 'new').length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      <div className="max-w-[1800px] mx-auto p-4 md:p-8 space-y-8">

        {/* TOPBAR */}
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-zinc-50/80 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Contact Messages</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                View and respond to customer contact form submissions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search name, email, subject..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-[260px] md:w-[320px] h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="h-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
              >
                <option value="all">All Messages</option>
                <option value="new">New Only</option>
                <option value="responded">Responded</option>
              </select>
              <button onClick={fetchMessages} disabled={loading}
                className="h-11 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button onClick={() => setDarkMode(!darkMode)}
                className="h-11 w-11 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center justify-center">
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button onClick={() => navigate("/internal-admin")}
                className="h-11 px-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2 text-sm font-semibold">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* KPI STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {[
            { label: "Total", value: messages.length },
            { label: "New", value: newCount },
            { label: "Responded", value: messages.filter(m => m.status === 'responded').length },
          ].map((card, i) => (
            <div key={i} className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
              <h2 className="mt-3 text-4xl font-black tracking-tight">{card.value}</h2>
            </div>
          ))}
        </div>

        {/* MAIN — two column on large screens */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* MESSAGE LIST */}
          <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-2xl font-black">All Messages</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{filtered.length}</span> of {messages.length} messages
              </p>
            </div>
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[700px] overflow-y-auto">
              {filtered.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => { setSelected(msg); setResponse(""); }}
                  className={`p-5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all ${selected?.id === msg.id ? 'bg-zinc-50 dark:bg-zinc-900/60 border-l-4 border-l-black dark:border-l-white' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-sm truncate">{msg.name}</p>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          msg.status === 'responded'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                        }`}>
                          {msg.status}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{msg.email}</p>
                      <p className="text-sm font-medium mt-1 truncate">{msg.subject}</p>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{msg.message}</p>
                    </div>
                    <p className="text-xs text-zinc-400 shrink-0">{timeAgo(msg.created_at)}</p>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && !loading && (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
                    <Mail className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-2xl font-black">No messages found</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 mt-2">Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </section>

          {/* MESSAGE DETAIL + RESPOND */}
          <section className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            {!selected ? (
              <div className="h-full flex flex-col items-center justify-center py-32 text-center px-6">
                <div className="h-20 w-20 rounded-3xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-6">
                  <Mail className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-2xl font-black">Select a message</h3>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">Click any message on the left to view and respond.</p>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                {/* Detail header */}
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-black">{selected.name}</h2>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        selected.status === 'responded'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {selected.status}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">{selected.email}{selected.phone ? ` • ${selected.phone}` : ''}</p>
                    <p className="text-xs text-zinc-400 mt-1">{formatDateTime(selected.created_at)}</p>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="h-9 w-9 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                  {/* Subject + Message */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Subject</p>
                    <p className="font-semibold">{selected.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Message</p>
                    <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.message}
                    </div>
                  </div>

                  {/* Previous response if any */}
                  {selected.admin_response && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-green-500 mb-2">Your Previous Response</p>
                      <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                        {selected.admin_response}
                      </div>
                      {selected.admin_responded_at && (
                        <p className="text-xs text-zinc-400 mt-1">{formatDateTime(selected.admin_responded_at)}</p>
                      )}
                    </div>
                  )}

                  {/* Response box */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                      {selected.status === 'responded' ? 'Send Another Response' : 'Your Response'}
                    </p>
                    <textarea
                      value={response}
                      onChange={e => setResponse(e.target.value)}
                      rows={5}
                      placeholder="Type your response here..."
                      className="w-full rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 p-4 text-sm outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none transition-all"
                    />
                    <button
                      onClick={handleRespond}
                      disabled={responding || !response.trim()}
                      className="mt-3 h-11 px-6 rounded-2xl bg-black dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-40"
                    >
                      <Send className="w-4 h-4" />
                      {responding ? 'Sending...' : 'Send Response'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;
