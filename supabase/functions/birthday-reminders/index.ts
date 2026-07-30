import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const RESEND_KEY = Deno.env.get("RESEND_API_KEY")!;

Deno.serve(async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(today);
  target.setDate(today.getDate() + 7);

  const targetMonth = target.getMonth() + 1;
  const targetDay   = target.getDate();

  const { data: friends, error } = await supabase
    .from("friends")
    .select("name, birthday, user_id");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const upcoming = (friends ?? []).filter((f) => {
    if (!f.birthday) return false;
    const [_, month, day] = f.birthday.split("-").map(Number);
    return month === targetMonth && day === targetDay;
  });

  let sent = 0;

  for (const f of upcoming) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", f.user_id)
      .single();

    const email = profile?.email;
    if (!email) continue;

    const birthdayFormatted = new Date(f.birthday + "T00:00:00")
      .toLocaleDateString("en-US", { month: "long", day: "numeric" });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: "friend.notes <onboarding@resend.dev>",
        to: email,
        subject: `🎂 ${f.name}'s birthday is in one week`,
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #1a1a2e; color: #f5f5f0; border-radius: 16px;">
            <div style="font-size: 28px; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.5px;">
              friend<span style="color: #e94560;">.</span>notes
            </div>

            <div style="height: 1px; background: #0f3460; margin: 24px 0;"></div>

            <div style="font-size: 32px; margin-bottom: 16px;">🎂</div>

            <h1 style="font-size: 22px; font-weight: 700; margin-bottom: 12px; color: #f5f5f0;">
              ${f.name}'s birthday is coming up
            </h1>

            <p style="font-size: 16px; color: #a0a0b0; line-height: 1.6; margin-bottom: 24px;">
              Just a heads up — <strong style="color: #f5f5f0;">${f.name}</strong>'s birthday is on 
              <strong style="color: #f5f5f0;">${birthdayFormatted}</strong>, one week from today.
              Now's a great time to think about a gift or plan something special.
            </p>

            <a href="https://friend-notes.vercel.app/" 
               style="display: inline-block; background: #e94560; color: #fff; text-decoration: none; border-radius: 10px; padding: 12px 24px; font-weight: 600; font-size: 15px;">
              View gift ideas →
            </a>

            <div style="height: 1px; background: #0f3460; margin: 32px 0;"></div>

            <p style="font-size: 12px; color: #4a4a60;">
              You're receiving this because you added ${f.name} to friend.notes.
            </p>
          </div>
        `,
      }),
    });

    if (res.ok) sent++;
  }

  return new Response(JSON.stringify({ sent, upcoming: upcoming.length }), {
    headers: { "Content-Type": "application/json" },
  });
});