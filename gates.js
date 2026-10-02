"use strict";

/*
  Aturan lima gerbang yang dipakai server untuk memeriksa dan menilai kiriman.
  Daftar pertanyaan harus SAMA dengan GATES di public/script.js
  (hanya id pertanyaan yang dipakai di sini, bukan teksnya).
*/

const GATE_IDS = ["G1", "G2", "G3", "G4", "G5"];

// "only" = pertanyaan hanya ditanyakan untuk jenis ide tertentu
const QUESTIONS = {
  G1: [{ id: "a" }, { id: "b" }, { id: "c" }],
  G2: [{ id: "a" }, { id: "b" }, { id: "c" }],
  G3: [{ id: "a" }, { id: "b" }, { id: "c", only: "recovery" }, { id: "d" }],
  G4: [{ id: "a" }, { id: "b" }, { id: "c" }],
  G5: [{ id: "a" }, { id: "b" }, { id: "c" }],
};

const ROLES = ["farmer", "collector", "coop", "buyer", "other"];
const PATHS = ["prevention", "recovery"];
const LANGS = ["id", "en"];
const VALUES = ["yes", "no", "unsure"];

// Semua kunci jawaban yang mungkin, misalnya "G1_a" ... "G5_c" (dipakai sebagai kolom CSV)
const ALL_ANSWER_KEYS = GATE_IDS.flatMap((g) => QUESTIONS[g].map((q) => `${g}_${q.id}`));

const questionsFor = (gate, path) => QUESTIONS[gate].filter((q) => !q.only || q.only === path);

/*
  Menilai jawaban dengan aturan yang sama seperti di halaman web:
  gerbang berjalan berurutan; gerbang pertama yang tidak lolos menghentikan sisanya.
  status: pass | fail | unsure | locked
*/
function evaluate(path, answers) {
  const statuses = [];
  let stoppedAt = null;

  GATE_IDS.forEach((gate, i) => {
    if (stoppedAt !== null) {
      statuses.push("locked");
      return;
    }
    const vals = questionsFor(gate, path).map((q) => answers[`${gate}_${q.id}`]);
    let status = "pass";
    if (vals.includes("no")) status = "fail";
    else if (vals.includes("unsure") || vals.includes(undefined)) status = "unsure";
    statuses.push(status);
    if (status !== "pass") stoppedAt = i;
  });

  return {
    statuses,
    stoppedGate: stoppedAt === null ? null : GATE_IDS[stoppedAt],
    outcome: stoppedAt === null ? "all_pass" : statuses[stoppedAt],
  };
}

module.exports = { GATE_IDS, QUESTIONS, ROLES, PATHS, LANGS, VALUES, ALL_ANSWER_KEYS, questionsFor, evaluate };
