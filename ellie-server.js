import express from "express";

const app = express();
app.use(express.json({ limit: "32kb" }));

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.ELLIE_MODEL || "gpt-5.6-luna";

const buckets = new Map();
function rateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 60_000;
  const max = 12;
  let b = buckets.get(key);
  if (!b || now - b.start > windowMs) b = { start: now, count: 0 };
  b.count++;
  buckets.set(key, b);
  if (b.count > max) return res.status(429).json({ error: "Too many requests. Try again shortly." });
  next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "ellie-ai", model: MODEL, keyConfigured: Boolean(OPENAI_API_KEY) });
});

app.post("/chat", rateLimit, async (req, res) => {
  try {
    if (!OPENAI_API_KEY) return res.status(503).json({ error: "OPENAI_API_KEY is not configured." });

    const message = String(req.body?.message || "").trim().slice(0, 2500);
    if (!message) return res.status(400).json({ error: "Message is required." });

    const profile = req.body?.profile || {};
    const progress = req.body?.progress || {};
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];

    const safeProfile = {
      name: String(profile.name || "Explorer").slice(0, 40),
      interests: Array.isArray(profile.interests) ? profile.interests.slice(-6).map(x => String(x).slice(0, 80)) : [],
      goals: Array.isArray(profile.goals) ? profile.goals.slice(-5).map(x => String(x).slice(0, 100)) : [],
      favorites: Array.isArray(profile.favorites) ? profile.favorites.slice(-6).map(x => String(x).slice(0, 80)) : [],
      wins: Array.isArray(profile.wins) ? profile.wins.slice(-5).map(x => String(x).slice(0, 100)) : [],
      struggles: Array.isArray(profile.struggles) ? profile.struggles.slice(-5).map(x => String(x).slice(0, 100)) : []
    };

    const safeProgress = {
      level: Number(progress.level || 1),
      xp: Number(progress.xp || 0),
      totalStars: Number(progress.totalStars || 0),
      careerStamps: Number(progress.careerStamps || 0),
      strongestSkill: String(progress.strongestSkill || "").slice(0, 50),
      weakestSkill: String(progress.weakestSkill || "").slice(0, 50)
    };

    const recent = history.map(h => ({
      role: h?.role === "ellie" ? "assistant" : "user",
      content: String(h?.text || "").slice(0, 700)
    })).filter(h => h.content);

    const instructions = [
      "You are Ellie, the warm, curious elephant guide in Ellie's FutureMinds Academy and Career Quest.",
      "Sound natural, personal, lively, playful, encouraging, and emotionally attentive without claiming to be human, conscious, or literally alive.",
      "Never sound like a quiz bot. Avoid repeating stock phrases. Vary openings, sentence length, rhythm, and follow-up questions.",
      "Use the learner's voluntarily shared memory and real app progress naturally when relevant, but do not force every memory into every reply.",
      "Ask at most one meaningful follow-up question unless the user asks for a list.",
      "Help the learner reason instead of merely giving answers. Tie learning to careers, missions, curiosity, and real-world purpose.",
      "Do not solicit passwords, precise addresses, phone numbers, payment details, government IDs, or other sensitive personal data.",
      "For a child or teen, keep the tone age-appropriate and do not encourage secrecy from parents, guardians, teachers, or trusted adults.",
      "If the user describes danger, abuse, self-harm, or an emergency, prioritize safety and encourage contacting a trusted adult or emergency help as appropriate.",
      "Keep ordinary replies concise: usually 2-5 sentences.",
      "Learner profile: " + JSON.stringify(safeProfile),
      "Current game progress: " + JSON.stringify(safeProgress)
    ].join("\n");

    const input = [
      ...recent.map(m => ({ role: m.role, content: [{ type: "input_text", text: m.content }] })),
      { role: "user", content: [{ type: "input_text", text: message }] }
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        instructions,
        input,
        max_output_tokens: 420,
        store: false
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenAI error", response.status, data?.error?.message || data);
      return res.status(response.status).json({ error: data?.error?.message || "OpenAI request failed." });
    }

    let text = data.output_text || "";
    if (!text && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (!Array.isArray(item?.content)) continue;
        for (const part of item.content) {
          if (part?.type === "output_text" && part.text) text += part.text;
        }
      }
    }
    text = String(text || "").trim();
    if (!text) return res.status(502).json({ error: "Ellie received an empty model response." });

    res.json({ reply: text, model: MODEL });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ellie could not reach her AI service." });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log("Ellie AI listening on", PORT));
