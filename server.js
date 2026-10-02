"use strict";

/*
  Lima Gerbang — server
  - Melayani halaman web dari folder public/
  - Menerima hasil "Cek ide Anda" lewat POST /api/submissions
  - Menyimpannya di database SQLite (file data/gate.sqlite)
*/

require("dotenv").config({ quiet: true });

const fs = require("node:fs");
const path = require("node:path");
const express = require("express");
const rateLimit = require("express-rate-limit");
const Database = require("better-sqlite3");
const gates = require("./gates");

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "data"));
const TRUST_PROXY = Number(process.env.TRUST_PROXY) || 0;
const CORS_ORIGIN = (process.env.CORS_ORIGIN || "").trim();

/* ---------- Database ---------- */
fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new Database(path.join(DATA_DIR, "gate.sqlite"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    name         TEXT NOT NULL,
    email        TEXT,
    lang         TEXT NOT NULL,
    role         TEXT NOT NULL,
    path         TEXT NOT NULL,
    idea         TEXT NOT NULL,
    outcome      TEXT NOT NULL,   -- all_pass | fail | unsure
    stopped_gate TEXT,            -- G1..G5, NULL jika semua gerbang lolos
    g1_status    TEXT NOT NULL,   -- pass | fail | unsure | locked
    g2_status    TEXT NOT NULL,
    g3_status    TEXT NOT NULL,
    g4_status    TEXT NOT NULL,
    g5_status    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS answers (
    submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
    gate          TEXT NOT NULL,  -- G1..G5
    question      TEXT NOT NULL,  -- a, b, c, d
    value         TEXT NOT NULL CHECK (value IN ('yes', 'no', 'unsure')),
    PRIMARY KEY (submission_id, gate, question)
  );

  CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions (created_at);
`);

const insertSubmission = db.prepare(`
  INSERT INTO submissions
    (name, email, lang, role, path, idea, outcome, stopped_gate,
     g1_status, g2_status, g3_status, g4_status, g5_status)
  VALUES
    (@name, @email, @lang, @role, @path, @idea, @outcome, @stopped_gate,
     @g1, @g2, @g3, @g4, @g5)
`);
const insertAnswer = db.prepare(
  "INSERT INTO answers (submission_id, gate, question, value) VALUES (?, ?, ?, ?)"
);

const saveSubmission = db.transaction((data, result) => {
  const info = insertSubmission.run({
    name: data.name,
    email: data.email,
    lang: data.lang,
    role: data.role,
    path: data.path,
    idea: data.idea,
    outcome: result.outcome,
    stopped_gate: result.stoppedGate,
    g1: result.statuses[0],
    g2: result.statuses[1],
    g3: result.statuses[2],
    g4: result.statuses[3],
    g5: result.statuses[4],
  });
  const id = Number(info.lastInsertRowid);
  for (const gate of gates.GATE_IDS) {
    for (const q of gates.questionsFor(gate, data.path)) {
      insertAnswer.run(id, gate, q.id, data.answers[`${gate}_${q.id}`]);
    }
  }
  return id;
});

/* ---------- Validation (the server never trusts the browser) ---------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

function cleanText(value, { min, max }) {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length < min || text.length > max || CONTROL_CHARS.test(text)) return null;
  return text;
}

function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "body must be a JSON object" };
  }

  const name = cleanText(body.name, { min: 2, max: 80 });
  if (!name) return { error: "name: 2-80 characters is required" };

  let email = null;
  if (body.email !== undefined && body.email !== null && String(body.email).trim() !== "") {
    email = cleanText(body.email, { min: 5, max: 120 });
    if (!email || !EMAIL_RE.test(email)) return { error: "email: not a valid address" };
    email = email.toLowerCase();
  }

  const idea = cleanText(body.idea, { min: 3, max: 400 });
  if (!idea) return { error: "idea: 3-400 characters is required" };

  if (!gates.LANGS.includes(body.lang)) return { error: "lang: must be id or en" };
  if (!gates.ROLES.includes(body.role)) return { error: "role: unknown value" };
  if (!gates.PATHS.includes(body.path)) return { error: "path: unknown value" };

  const given = body.answers;
  if (!given || typeof given !== "object" || Array.isArray(given)) {
    return { error: "answers: must be an object" };
  }

  // Keep only the questions that apply to this path; every one of them must be answered.
  const answers = {};
  for (const gate of gates.GATE_IDS) {
    for (const q of gates.questionsFor(gate, body.path)) {
      const key = `${gate}_${q.id}`;
      if (!gates.VALUES.includes(given[key])) {
        return { error: `answers.${key}: must be yes, no or unsure` };
      }
      answers[key] = given[key];
    }
  }

  return { value: { name, email, idea, lang: body.lang, role: body.role, path: body.path, answers } };
}

/* ---------- App ---------- */
const app = express();
app.disable("x-powered-by");
app.set("trust proxy", TRUST_PROXY);

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  next();
});

// Optional CORS, only needed when the web page is served from a different address
if (CORS_ORIGIN) {
  app.use("/api", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
}

app.use(express.json({ limit: "20kb" }));

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30, // per visitor address per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "rate_limited", message: "Too many submissions, try again later." },
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.post("/api/submissions", submitLimiter, (req, res) => {
  const checked = validate(req.body);
  if (checked.error) {
    return res.status(400).json({ error: "validation", message: checked.error });
  }

  try {
    const result = gates.evaluate(checked.value.path, checked.value.answers);
    const id = saveSubmission(checked.value, result);
    console.log(`[${new Date().toISOString()}] submission #${id} saved (${result.outcome})`);
    res.status(201).json({ ok: true, id, outcome: result.outcome, stoppedGate: result.stoppedGate });
  } catch (err) {
    console.error("Could not save submission:", err);
    res.status(500).json({ error: "server", message: "Could not save the submission." });
  }
});

app.use("/api", (req, res) => res.status(404).json({ error: "not_found" }));

app.use(express.static(path.join(__dirname, "public")));

// JSON errors (bad JSON, body too large, ...)
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "validation", message: "Invalid JSON." });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "too_large", message: "Request is too large." });
  }
  console.error(err);
  res.status(500).json({ error: "server", message: "Unexpected error." });
});

const server = app.listen(PORT, () => {
  console.log(`Lima Gerbang berjalan di http://localhost:${PORT}`);
  console.log(`Database: ${path.join(DATA_DIR, "gate.sqlite")}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
