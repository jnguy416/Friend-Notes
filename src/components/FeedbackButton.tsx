import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import './FeedbackButton.css';


const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

export default function FeedbackButton() {
  const [open, setOpen]     = useState(false);
  const [text, setText]     = useState("");
  const [saving, setSaving] = useState(false);
  const [sent, setSent]     = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSaving(true);
    await supabase.from("feedback").insert({ message: text.trim() });
    setSaving(false);
    setSent(true);
    setText("");
    setTimeout(() => { setSent(false); setOpen(false); }, 2000);
  }

  return (
    <>
      <button className="feedback-trigger" onClick={() => setOpen(true)}>
        Feedback
      </button>

      {open && (
        <div className="feedback-overlay" onClick={() => setOpen(false)}>
          <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
            <div className="feedback-title">Share feedback</div>
            <p className="feedback-sub">What's working? What could be better?</p>

            {sent ? (
              <div className="feedback-success">Thank for the feedback!</div>
            ) : (
              <>
                <textarea
                  className="feedback-textarea"
                  placeholder="Type your feedback here…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  autoFocus
                />
                <div className="feedback-footer">
                  <button className="btn-cancel" onClick={() => setOpen(false)}>Cancel</button>
                  <button className="btn-save" onClick={handleSubmit} disabled={!text.trim() || saving}>
                    {saving ? "Sending…" : "Send"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}