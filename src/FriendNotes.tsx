import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import SummaryView from "./SummaryView";
import './App.css';
import Sidebar from "./Sidebar";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);


// ── Types ──────────────────────────────────────────────────────────────────
interface Note {
  id: string;
  text: string;
  createdAt: string;
  category: string;
}

interface Friend {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  location: string;
  notes: Note[];
  birthday: string | null;
}

type Page = "friends" | "detail" | "summary"; 

// ── DB row shapes ──────────────────────────────────────────────────────────
interface DbNote { 
  id: string; 
  text: string; 
  created_at: string; 
  category: string; 

}
interface DbFriend { 
  id: string; 
  name: string; 
  handle: string; 
  avatar_color: string; 
  location: string; 
  notes: DbNote[]; 
  birthday: string | null;
}

function dbToFriend(row: DbFriend): Friend {
  return {
    id:          row.id,
    name:        row.name,
    handle:      row.handle,
    avatarColor: row.avatar_color,
    location:    row.location,
    birthday:    row.birthday ?? null,
    notes:       (row.notes ?? []).map((n) => ({
      id:        n.id,
      text:      n.text,
      createdAt: n.created_at.slice(0, 10),
      category:  n.category ?? "General",
    })),
  };
}


// ── Helpers ────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const AVATAR_COLORS = [
  "#e94560", "#fd9644", "#f7b731", "#45aaf2",
  "#26de81", "#4ecdc4", "#a55eea",
];

// ── Auth View ──────────────────────────────────────────────────────────────
function AuthView() {

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  return (
    <>
      {/* <StyleTag /> */}
      <div className="auth-root">
        <div className="auth-card">
          <div className="auth-logo">friend<span>.</span>notes</div>
          <div className="auth-tagline">Remember what matters about the people you care about.</div>

          <button className="auth-google" onClick={handleGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </>
  );
}

// Friend Card
function FriendCard({ friend, onClick }: { friend: Friend; onClick: () => void }) {
  const count = friend.notes.length;
  return (
    <div
      className="friend-card fade-up"
      style={{ "--accent": friend.avatarColor } as React.CSSProperties}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      aria-label={`View ${friend.name}'s profile`}
    >
      <div className="avatar">{initials(friend.name)}</div>
      <div className="friend-name">{friend.name}</div>
      <div className="friend-handle">{friend.handle}</div>
      <div className="friend-location">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        {friend.location}
      </div>
      <div className={`note-chip${count === 0 ? " empty" : ""}`}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        {count === 0 ? "No notes yet" : `${count} note${count !== 1 ? "s" : ""}`}
      </div>
    </div>
  );
}

// Note Item
function NoteItem({ note, onDelete }: { note: Note; onDelete: () => void }) {
  return (
    <div className="note-item fade-up">
      <div className="note-category">{note.category}</div>
      <p className="note-text">{note.text}</p>
      <div className="note-footer">
        <span className="note-date">{formatDate(note.createdAt)}</span>
        <button className="btn-delete" onClick={onDelete} aria-label="Delete note">Delete</button>
      </div>
    </div>
  );
}

// detail view when you click onto a friend from the main page
// features to add and remove notes
const CATEGORIES = [
  "General",
  "Interests + Hobbies",
  "Hangouts",
  "Gift Ideas",
];

function DetailView({ friend, onAddNote, onDeleteNote }: {
  friend: Friend;
  onAddNote: (friendId: string, text: string, category: string) => Promise<void>;
  onDeleteNote: (friendId: string, noteId: string) => Promise<void>;
}) {
  const [draft, setDraft]   = useState("");
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState("General");
  const [filter, setFilter] = useState("All");

  const filteredNotes = filter === "All"
  ? friend.notes
  : friend.notes.filter((n) => n.category === filter);

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    setSaving(true);
    await onAddNote(friend.id, trimmed, category);
    setDraft("");
    setCategory("General");
    setSaving(false);
  }

  return (
    <div className="detail" style={{ "--accent": friend.avatarColor } as React.CSSProperties}>
      <aside className="detail-sidebar">
        <div className="detail-avatar">{initials(friend.name)}</div>
        <div className="detail-name">{friend.name}</div>
        <div className="detail-handle">{friend.handle}</div>
        <div className="detail-location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: "middle", marginRight: 4 }}>
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
          </svg>
          {friend.location}
        </div>
        {friend.birthday && (
          <div className="detail-birthday">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {new Date(friend.birthday + "T00:00:00").toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric"
            })}
          </div>
        )}
        <div className="detail-stat">
          <strong>{friend.notes.length}</strong>
          {friend.notes.length === 1 ? "note saved" : "notes saved"}
        </div>
      </aside>

      <main>


        <div className="notes-header">
          <h2 className="notes-title">Notes about {friend.name.split(" ")[0]}</h2>
          <select
            className="category-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["All", ...CATEGORIES].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>


        <div className="note-add">
          <textarea
            className="note-textarea"
            placeholder={`What do you want to remember about ${friend.name.split(" ")[0]}? Their interests, preferences, things to ask next time…`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave(); }}
            rows={3}
          />
          <div className="note-add-footer">
            <select
              className="category-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button className="btn-save" onClick={handleSave} disabled={!draft.trim() || saving}>
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        </div>

        {friend.notes.length === 0 ? (
          <div className="empty-notes">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4a4a60" strokeWidth="1.5">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p>No notes yet — add one above.</p>
          </div>
        ) : (
          <div className="notes-list">
            {[...filteredNotes].reverse().map((note) => (
              <NoteItem key={note.id} note={note} onDelete={() => onDeleteNote(friend.id, note.id)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Add Friend Card ────────────────────────────────────────────────────────
function AddFriendCard({ onAdd }: { onAdd: (f: Omit<Friend, "id" | "notes">) => Promise<void> }) {
  const [open, setOpen]         = useState(false);
  const [name, setName]         = useState("");
  const [handle, setHandle]     = useState("");
  const [location, setLocation] = useState("");
  const [color, setColor]       = useState(AVATAR_COLORS[0]);
  const [birthday, setBirthday] = useState("");
  const [saving, setSaving]     = useState(false);

  function reset() { 
    setName(""); 
    setHandle(""); 
    setLocation(""); 
    setColor(AVATAR_COLORS[0]); 
    setBirthday("");
    setOpen(false); 
  }

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    await onAdd({
      name: trimmed,
      handle: handle.trim() || `@${trimmed.split(" ")[0].toLowerCase()}`,
      avatarColor: color,
      location: location.trim() || "—",
      birthday: birthday ?? null,
    });
    reset();
    setSaving(false);
  }

  if (!open) {
    return (
      <button className="add-friend-toggle fade-up" onClick={() => setOpen(true)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        Add a friend
      </button>
    );
  }

  return (
    <div className="add-friend-form fade-up">
      <div className="add-friend-title">New friend</div>
      <div className="add-friend-fields">
        <input className="add-friend-input" placeholder="Full name *" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <input className="add-friend-input" placeholder="Handle (e.g. @alex)" value={handle} onChange={(e) => setHandle(e.target.value)} />
        <input className="add-friend-input" placeholder="Location (e.g. London, UK)" value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
        <input className="add-friend-input" type="date" placeholder="Birthday" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
      </div>
      <div className="color-picker-label">Avatar colour</div>
      <div className="color-swatches" style={{ marginBottom: 20 }}>
        {AVATAR_COLORS.map((c) => (
          <button key={c} className={`color-swatch${color === c ? " selected" : ""}`} style={{ "--swatch-color": c } as React.CSSProperties} onClick={() => setColor(c)} aria-label={`Pick color ${c}`} />
        ))}
      </div>
      <div className="add-friend-footer">
        <button className="btn-cancel" onClick={reset}>Cancel</button>
        <button className="btn-save" onClick={handleAdd} disabled={!name.trim() || saving}>
          {saving ? "Adding…" : "Add friend"}
        </button>
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]               = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [friends, setFriends]         = useState<Friend[]>([]);
  const [page, setPage]               = useState<Page>("friends");
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);

  const activeFriend = friends.find((f) => f.id === activeFriendId) ?? null;

  // ── Auth listener ──────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (!session) setFriends([]);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load friends when user signs in ───────────────────────────────────
  useEffect(() => {
    if (!user) {
      return;
    }
  
    let cancelled = false;
  
    supabase
      .from("friends")
      .select("*, notes(*)")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (!cancelled) {
          setFriends((data as DbFriend[] ?? []).map(dbToFriend));
        }
      });
  
    return () => { cancelled = true; };
  }, [user]);

  // ── Navigation ─────────────────────────────────────────────────────────
  function goToFriend(id: string) { setActiveFriendId(id); setPage("detail"); }
  function goToFriends()          { setActiveFriendId(null); setPage("friends"); }
  function goToSummary()          { setActiveFriendId(null); setPage("summary"); }

  // ── Mutations ──────────────────────────────────────────────────────────
  async function addFriend(draft: Omit<Friend, "id" | "notes">) {
    if (!user) return;
    const { data } = await supabase
      .from("friends")
      .insert({ user_id: user.id, name: draft.name, handle: draft.handle, avatar_color: draft.avatarColor, location: draft.location, birthday : draft.birthday ?? null, })
      .select("*, notes(*)")
      .single();
    if (data) setFriends((prev) => [...prev, dbToFriend(data as DbFriend)]);
  }

  async function addNote(friendId: string, text: string, category: string) {
    if (!user) return;
    const { data } = await supabase
      .from("notes")
      .insert({ friend_id: friendId, user_id: user.id, text, category})
      .select()
      .single();
    if (data) {
      const note: Note = { 
        id: data.id, 
        text: data.text, 
        createdAt: data.created_at.slice(0, 10),
        category: data.category,
      };
      setFriends((prev) => prev.map((f) => f.id === friendId ? { ...f, notes: [...f.notes, note] } : f));
    }
  }

  async function deleteNote(friendId: string, noteId: string) {
    await supabase.from("notes").delete().eq("id", noteId);
    setFriends((prev) => prev.map((f) => f.id === friendId ? { ...f, notes: f.notes.filter((n) => n.id !== noteId) } : f));
  }

  async function signOut() { await supabase.auth.signOut(); setPage("friends"); }

  // ── Render ─────────────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#4a4a60", fontFamily: "Inter, sans-serif" }}>Loading…</div>
  );

  if (!user) return <AuthView />;

  return (
    <>
      {/* <StyleTag /> */}
      <div className="app">
        <nav className="nav">
          <span className="nav-logo">friend<span>.</span>notes</span>
          {page === "detail" && activeFriend && (
            <button className="nav-back" onClick={goToFriends}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              All friends
            </button>
          )}
          <button className="nav-tab" onClick={goToFriends}>
            Friends
          </button>
          <button className="nav-tab" onClick={goToSummary}>
            Digest
          </button>
          <div className="nav-right">
            <span className="nav-email">{user.user_metadata.full_name}</span>
            <button className="nav-signout" onClick={signOut}>Sign out</button>
          </div>
        </nav>
        
      <div className={page !== "detail" ? "app-layout" : ""}>
        <div className="app-main">
            {page === "detail" && activeFriend ? (
              <DetailView friend={activeFriend} onAddNote={addNote} onDeleteNote={deleteNote} />
            ) : page === "summary" ? (
              <SummaryView friends={friends} />
            ) : (
              <>
                <div className="grid-header">
                  <h1 className="grid-title">Your friends</h1>
                  <span className="grid-count">{friends.length} people</span>
                </div>
                <div className="grid">
                  {friends.map((f) => (
                    <FriendCard key={f.id} friend={f} onClick={() => goToFriend(f.id)} />
                  ))}
                  <AddFriendCard onAdd={addFriend} />
                </div>
              </>
            )}
          </div>
          {page !== "detail" && <Sidebar friends={friends} />}
        </div>

      </div>
    </>
  );
}
