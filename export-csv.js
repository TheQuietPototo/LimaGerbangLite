"use strict";

/*
  Mengekspor semua kiriman dari database ke file CSV (bisa dibuka di Excel / Google Sheets).

    npm run export                 -> data/submissions.csv
    node export-csv.js hasil.csv   -> hasil.csv
*/

require("dotenv").config({ quiet: true });

const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");
const { ALL_ANSWER_KEYS } = require("./gates");

const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, "data"));
const dbFile = path.join(DATA_DIR, "gate.sqlite");

if (!fs.existsSync(dbFile)) {
  console.error(`Database belum ada di ${dbFile}. Jalankan server dan kirim satu hasil dulu.`);
  process.exit(1);
}

const db = new Database(dbFile);
const submissions = db.prepare("SELECT * FROM submissions ORDER BY id").all();
const answerRows = db.prepare("SELECT submission_id, gate, question, value FROM answers").all();

const answersById = new Map();
for (const row of answerRows) {
  if (!answersById.has(row.submission_id)) answersById.set(row.submission_id, {});
  answersById.get(row.submission_id)[`${row.gate}_${row.question}`] = row.value;
}

const COLUMNS = [
  "id", "created_at", "name", "email", "lang", "role", "path", "idea",
  "outcome", "stopped_gate",
  "g1_status", "g2_status", "g3_status", "g4_status", "g5_status",
  ...ALL_ANSWER_KEYS,
];

// Sel yang diawali = + - @ bisa dijalankan sebagai rumus di Excel, jadi diberi tanda petik di depan.
function cell(value) {
  if (value === null || value === undefined) return "";
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const lines = [COLUMNS.join(",")];
for (const sub of submissions) {
  const answers = answersById.get(sub.id) || {};
  lines.push(COLUMNS.map((col) => cell(col in sub ? sub[col] : answers[col])).join(","));
}

const out = path.resolve(process.argv[2] || path.join(DATA_DIR, "submissions.csv"));
// BOM di awal supaya Excel membaca huruf UTF-8 dengan benar
fs.writeFileSync(out, "\ufeff" + lines.join("\r\n") + "\r\n", "utf8");
console.log(`${submissions.length} kiriman ditulis ke ${out}`);
db.close();
