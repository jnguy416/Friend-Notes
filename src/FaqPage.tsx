import { useState } from "react";
import "./FaqPage.css";

const FAQS = [
  {
    question: "What is friend.notes?",
    answer:
      "friend.notes is note-taking web-app to store notes about your friends. Then, these notes are used to create AI-powered personalized gifts for your friends."
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your data is only accessible to you. We use Supabase with row-level security, which means your friends and notes are tied to your account and no one else can see them — not even us.",
  },
  {
    question: "How does the AI gift idea feature work?",
    answer:
      "Select a friend from the Gift Ideas page and click Generate. The AI reads through your notes about that friend and suggests several personalized gift ideas based on their interests, hobbies, and anything else you've written down.",
  },
  {
    question: "How do birthday reminders work?",
    answer:
      "Once you add your friend, we will send you an email reminder exactly one week before their birthday so you have time to plan.",
  },
  {
    question: "Is friend.notes free?",
    answer:
      "Yes, completely free to use.",
  },
  {
    question: "How do I add a friend?",
    answer:
      "On the Friends page, click the 'Add a friend' card at the end of the grid. Fill in their name, handle, location, birthday, and pick an avatar colour.",
  },
  {
    question: "What are note categories?",
    answer:
      "When adding a note you can assign it a category — General, Interests + Hobbies, Hangouts, or Gift Ideas. You can then filter notes by category on a friend's profile page.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-question" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <svg
          className="faq-chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="faq-answer">{answer}</div>}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="faq-root">
      <div className="faq-header">
        <h1 className="faq-title">Frequently asked questions</h1>
        <p className="faq-subtitle">Everything you need to know about friend.notes.</p>
      </div>

      <div className="faq-list">
        {FAQS.map((faq) => (
          <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  );
}
