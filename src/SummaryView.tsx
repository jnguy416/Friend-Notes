import { useState, useEffect } from "react";
import { GoogleGenAI } from "@google/genai";
import "./SummaryView.css";

// ── Types ──────────────────────────────────────────────────────────────────
interface Note {
  id: string;
  text: string;
  createdAt: string;
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

interface FriendSummary {
  friendId: string;
  summary: string;
  highlights: string[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

function calcAge(birthday: string): number {
  const today = new Date();
  const bday  = new Date(birthday + "T00:00:00");
  let age = today.getFullYear() - bday.getFullYear();
  const monthDiff = today.getMonth() - bday.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bday.getDate())) {
    age--;
  }
  return age;
}


const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

async function fetchSummaryForFriend(friend: Friend): Promise<FriendSummary> {
  if (friend.notes.length === 0) {
    return { friendId: friend.id, summary: "No notes recorded yet.", highlights: [] };
  }

  const notesBlock = friend.notes
    .map((n) => `- [${n.createdAt}] ${n.text}`)
    .join("\n");

  const prompt = `You are a thoughtful personal assistant helping someone pick gift ideas for their friend.

  Here are notes about ${friend.name}, who lives in ${friend.location}${friend.birthday ? ` and is ${calcAge(friend.birthday)} years old` : ""}:

  ${notesBlock}

  Based on these notes, suggest gift ideas for this person.

  Respond ONLY with a valid JSON object in this exact shape:
  {
    "summary": "A warm 1-2 sentence summary of what this person is into.",
    "highlights": ["A specific gift idea", "Another specific gift idea", "A third gift idea", "A fourth gift idea"]
  }

  Keep gift ideas specific. Include specific brands.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const text = response.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      friendId: friend.id,
      summary: typeof parsed.summary === "string" ? parsed.summary : "Could not parse summary.",
      highlights: Array.isArray(parsed.highlights)
        ? parsed.highlights.filter((h: unknown) => typeof h === "string")
        : [],
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Gemini error:", err);
    return {
      friendId: friend.id,
      summary: msg.includes("429") ? "Rate limit exceeded. Try again later." : "Could not generate summary.",
      highlights: [],
    };
  }
}

// ── Skeleton Card ──────────────────────────────────────────────────────────
function SummaryCardSkeleton({ friend }: { friend: Friend }) {
  return (
    <div
      className="summary-card summary-card-skeleton"
      style={{ "--accent": friend.avatarColor } as React.CSSProperties}
    >
      <div className="summary-card-header">
        <div className="summary-avatar">{initials(friend.name)}</div>
        <div>
          <div className="summary-card-name">{friend.name}</div>
          <div className="summary-card-handle">{friend.handle}</div>
        </div>
      </div>
      <div className="skeleton-line" style={{ width: "90%" }} />
      <div className="skeleton-line" style={{ width: "75%" }} />
      <div className="skeleton-line" style={{ width: "82%" }} />
      <div className="skeleton-line" style={{ width: "55%", marginTop: 16 }} />
      <div className="skeleton-line" style={{ width: "68%" }} />
    </div>
  );
}

// ── Summary Card ───────────────────────────────────────────────────────────
function SummaryCard({ friend, data }: { friend: Friend; data: FriendSummary | null }) {
  if (!data) return <SummaryCardSkeleton friend={friend} />;

  return (
    <div
      className="summary-card fade-up"
      style={{ "--accent": friend.avatarColor } as React.CSSProperties}
    >
      <div className="summary-card-header">
        <div className="summary-avatar">{initials(friend.name)}</div>
        <div>
          <div className="summary-card-name">{friend.name}</div>
          <div className="summary-card-handle">{friend.handle} · {friend.location}</div>
        </div>
      </div>

      <p className="summary-text">{data.summary}</p>

      {data.highlights.length > 0 && (
        <div className="summary-highlights">
          {data.highlights.map((h, i) => (
            <div key={i} className="summary-highlight">
              <div className="highlight-dot" />
              <span>{h}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Summary View ───────────────────────────────────────────────────────────
interface SummaryViewProps {
  friends: Friend[];
}

export default function SummaryView({ friends }: SummaryViewProps) {
  const [summaries, setSummaries] = useState<Record<string, FriendSummary>>(() => {
    const saved = localStorage.getItem("gift-summaries");
    return saved ? JSON.parse(saved) : {};
  });
  const [loading, setLoading]   = useState(false);
  const [generated, setGenerated] = useState(() => {
    return localStorage.getItem("gift-generated") === "true";
  });
  const [selected, setSelected] = useState<string>(() => {
    return localStorage.getItem("gift-selected") ?? "";
  });

  useEffect(() => {
    localStorage.setItem("gift-summaries", JSON.stringify(summaries));
  }, [summaries]);
  
  useEffect(() => {
    localStorage.setItem("gift-generated", String(generated));
  }, [generated]);
  
  useEffect(() => {
    localStorage.setItem("gift-selected", selected);
  }, [selected]);


  const friendsWithNotes = friends.filter((f) => f.notes.length > 0);
  async function handleGenerate() {
    const friend = friendsWithNotes.find((f) => f.id === selected);
    if (!friend) return;
  
    setLoading(true);
    setGenerated(true);
  
    const result = await fetchSummaryForFriend(friend);
    setSummaries((prev) => ({ ...prev, [result.friendId]: result }));  // ← merge
  
    setLoading(false);
  }


  return (
    <div className="summary-root">
      {/* Header */}
      <div className="summary-header">
        <div>
          <h1 className="summary-title">Gift ideas</h1>
          <p className="summary-subtitle">
            Select a friend from the drowndown list and have AI suggest gift ideas based on your notes.
          </p>
        </div>
        <button
          className="btn-generate"
          onClick={handleGenerate}
          disabled={loading || !selected}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          {loading ? "Generating…" : "Generate gift ideas"}
        </button>
      </div>

      {/* Friend selector */}
      {friendsWithNotes.length === 0 ? (
        <div className="summary-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4a4a60" strokeWidth="1.5">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <p>Add some notes to your friends first, then come back here.</p>
        </div>
      ) : (
        <>
          <div className="friend-selector">
            <select
              className="category-select"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="" disabled>Select a friend…</option>
              {friendsWithNotes.map((friend) => (
                <option key={friend.id} value={friend.id}>
                  {friend.name}
                </option>
              ))}
            </select>
          </div>

          {/* Results */}
          {generated && (() => {
            const friend = friendsWithNotes.find((f) => f.id === selected);
            if (!friend) return null;
            return (
              <>
                <div className="ai-badge">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                  AI-generated · based on your notes
                </div>
                <div className="summary-grid">
                  <SummaryCard friend={friend} data={summaries[friend.id] ?? null} />
                </div>
              </>
            );
          })()}
        </>
      )}
    </div>
  );
}
