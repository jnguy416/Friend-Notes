import "./Sidebar.css";

// ── Types ──────────────────────────────────────────────────────────────────
interface Friend {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  location: string;
  birthday: string | null;
  notes: { id: string; text: string; createdAt: string; category: string }[];
}

// ── Helpers ────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

// get five upcoming birthdays
function getUpcomingBirthdays(friends: Friend[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return friends
    .filter((f) => f.birthday)
    .map((f) => {
      const bday = new Date(f.birthday! + "T00:00:00");
      const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { friend: f, daysUntil, next };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 5);
}

// ── Sidebar ────────────────────────────────────────────────────────────────
interface SidebarProps {
  friends: Friend[];
}

export default function Sidebar({ friends }: SidebarProps) {
  const upcoming = getUpcomingBirthdays(friends);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        Upcoming birthdays
      </div>

      {upcoming.length === 0 ? (
        <p className="sidebar-empty">
          Add a friend to see upcoming birthdays!
        </p>
      ) : (
        <div className="sidebar-list">
          {upcoming.map(({ friend, daysUntil, next }) => (
            <div
              key={friend.id}
              className="sidebar-item"
              style={{ "--accent": friend.avatarColor } as React.CSSProperties}
            >
              <div className="sidebar-avatar">{initials(friend.name)}</div>

              <div className="sidebar-info">
                <div className="sidebar-name">{friend.name}</div>
                <div className="sidebar-date">
                  {next.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>

              <div className={`sidebar-days${daysUntil === 0 ? " today" : daysUntil <= 7 ? " soon" : ""}`}>
                {daysUntil === 0 ? "🎂" : `${daysUntil}d`}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
