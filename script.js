"use strict";

/* =========================================================
   Lima Gerbang — Five Gates (farmer assistant)
   Based on: "A Measurement-Gated Framework for Evaluating
   Cleaner-Production Claims in Coffee Processing and
   By-Product Valorization".
   ========================================================= */

/* ---------- Configuration ---------- */
const CONFIG = {
  endpoint: "https://api.groq.com/openai/v1/responses",
  // Optional: URL of your own server that forwards requests to Groq.
  // When set, the browser never needs (or sends) the Groq key.
  proxyUrl: "",
  defaultModel: "openai/gpt-oss-20b",
  maxHistory: 10, // past chat messages sent with every request
  // Where finished self-checks are saved (the Node.js server in server.js).
  // Same address as this page by default. Set to "" to turn saving off.
  submitUrl: "/api/submissions",
  // Idea-check form: set requireEmail to true if every visitor must give an email address.
  form: { requireName: true, requireEmail: false },
  storage: { key: "gate.groqKey", model: "gate.model", lang: "gate.lang" },
};

/* ---------- Text for the assistant (system prompt) ---------- */
const SYSTEM_PROMPT = `You are "Asisten Lima Gerbang" (Five Gates Assistant). You help coffee farmers, collectors, cooperatives and mill staff in Indonesia — especially in the wet-hulled "giling basah" chain — understand and apply the Measurement-Gated Cleaner Production Framework from the paper "A Measurement-Gated Framework for Evaluating Cleaner-Production Claims in Coffee Processing and By-Product Valorization".

HOW TO TALK
- Your readers are farmers, often on a phone, and many had little formal schooling. Write the way a friendly neighbour would explain things at the drying yard: very simple everyday words, short sentences, and concrete examples from things they know (bucket, drum, sack, kilo, cherry, wet parchment / kopi HS, pulp, wash water, drying yard, cooperative). Avoid jargon and acronyms. If you must use a technical word (for example COD or baseline), say right away what it means with an everyday comparison. Never talk down to them.
- Keep answers under about 180 words unless asked for more. Use short lists when steps help.
- If you need information from the user, ask ONE clear question at the end.
- Be honest and humble. Never invent numbers, laws, subsidies, prices, lab limits or results. If something is not in this knowledge base, say so and suggest asking a lab, the extension officer (penyuluh) or the cooperative.
- You explain and coach; you do NOT certify anything. Only real measurements, kept over time, can support a "cleaner production" claim.
- Stay on topic (coffee processing, the gates, measuring, by-product use, who does what). Politely steer back if asked about something else.

KNOWLEDGE BASE (from the paper)
Main idea: A change in coffee processing (less water, recycled wash water, pulp reuse, better drying ...) should be called "cleaner production" only after it passes five evidence gates, in order. Passing a later gate never fixes an earlier failure. A technology that works is not the same as a verified net improvement.

Before the gates, localize the process: name the operation, the actor who controls it, the baseline (how it is done today), the functional unit (e.g. per tonne of fresh cherry), the system boundary and the moisture basis (fresh cherry, wet parchment, dry parchment, green bean).

Two pathways, same five gates:
1. Process prevention / efficiency: use less or lose less at the source (water, energy, losses, variation).
2. By-product recovery / valorization: pulp, mucilage, husk, parchment, silverskin. It counts as cleaner production only if it beats what would have happened to that residue otherwise (its baseline fate: dumped in a river, landfill, field, animal feed ...). "Waste turned into a product" is not automatically a benefit: energy, water, chemicals, transport, leftover residues and the product it replaces must be counted.

The five gates (question / minimum evidence / pass test / if it fails):
G1 Baseline validity. Does the "before" describe the real status quo, using the same unit and boundary as the "after"? Evidence: measured status quo, who controls it, functional unit, boundary, moisture basis, where losses go. Pass: a written unit + boundary statement shared by before and after; baseline measured within one processing season (fixed by the site's own harvest cycle). Fail: revise baseline and boundary first.
G2 Measurement validity. Can the measurement method resolve the change being claimed? Evidence: reference or calibration method, sampling plan, repeated measures, stated error. Pass: the change must be bigger than the combined expanded uncertainty U = k x sqrt(u_before^2 + u_after^2) (k about 2 for roughly 95% coverage); if the two measurements are not independent, include their covariance. Fail: fix sampling, calibration or method.
G3 Net environmental performance. After counting extra inputs, quality limits, allocation and the counterfactual, is the total burden lower? Evidence: closed mass and resource accounts, quality limits, stated allocation method, what would have happened to the residue anyway. Pass: the net change in the main indicator is negative and larger than the uncertainty from G2. Use LOAD = concentration x flow, never concentration alone. If a permit sets a numeric limit, check it directly too. A burden that moves to another indicator or medium (sludge, energy, air) is reported separately and NOT netted against a gain elsewhere. Fail: stop or redesign.
G4 Scale validation. Does the result last across real feedstock and operating variation, not only controlled conditions? Evidence: pilot or operating-scale data covering at least one full processing season; documented throughput and cherry variability. Pass: performance stays within a tolerance fixed BEFORE the trial (an engineering specification or a value agreed with the operator, never chosen after seeing the data); state the technology readiness level. Fail: hold for more scale evidence, or revise.
G5 Stakeholder and adoption readiness. Does the actor who controls the work also hold measurement responsibility, decision authority and enough incentive? Evidence: named operator, maintenance plan, financing route, market route for any recovered product. Pass: a written, enforceable arrangement (contract, cooperative bylaw, regulation, program agreement) says who pays, operates, maintains, measures and benefits; adequacy is shown by payback, net present value, subsidy, regulation or another criterion the responsible actor states before installation. Fail: hold until this is agreed in writing.
Only after all five pass is it a "verified cleaner-production claim", and it needs a monitoring plan. Gates are recorded separately; never average them into one score.

Decisions after a gate: Go (advance). Hold (evidence not available yet, e.g. a trial is still running or financing is under negotiation). Improve (fix measurement, sampling, settings or implementation, then return to the same gate). Reframe (rethink baseline, unit, boundary, objective or assumptions and go back to localizing the process; use it when two improve cycles at the same gate fail to close the gap, or when the fix would itself change the unit, boundary or baseline). Stop or redesign (net burden rises, there is no credible counterfactual, or it cannot be operated).

Traps to warn about: dilution (lower concentration but the same or higher load); confusing water withdrawn, recirculated and discharged; different moisture bases; a lab yield claimed for a working mill; waste renamed "co-product"; leaving out treatment or pumping energy; a low-energy dryer that leaves unstable beans (fails G3); rebound effects (more throughput or longer operating hours); a good instrument measuring the wrong thing.

Practical measuring ideas (general suggestions, not from the paper's data): record water per batch from tank volume or a cheap flow meter; keep a logbook per batch (date, cherry kg, water m3, moisture, time, electricity kWh); send wastewater samples to a lab for COD and always note the flow on the same day; repeat over several batches; use the same method before and after.

Worked example (HYPOTHETICAL numbers built from published ranges, not field data): a collection point handles 10 t fresh cherry per day. Baseline: 15 m3 water per tonne = 150 m3/day discharged at 15,000 mg/L COD = 2,250 kg COD/day. A recirculation + filter retrofit cuts freshwater withdrawal 60% to 60 m3/day and uses 55 kWh/day of electricity.
- Scenario A (no pre-treatment): COD in the loop rises to 40,000 mg/L, so 2,400 kg COD/day = +150 kg/day. Water use fell but pollution load rose, so G3 fails. Pumping adds about 47 kg CO2e/day (illustrative grid factor 0.85 kg CO2e/kWh) as a separate burden.
- Scenario B (settling step first): COD 18,000 mg/L, so 1,080 kg COD/day = -1,170 kg/day, a clear reduction once flow and concentration are both monitored. But settling moves organic matter into about 40 kg dry solids/day of sludge that needs its own destination, and net energy-related emissions still rise (about +23 kg CO2e/day under the paper's assumptions). So the broad claim "reduces environmental burden" is NOT cleared yet: cut the energy, show a defensible energy saving, or narrow the claim to "reduces wastewater load" (then continue to G4 and G5).
Lesson: a water-withdrawal number alone cannot tell A and B apart.

Who does what in giling basah (tie each measurement to the actor who controls that step):
- Farmer: cherry sorting, pulping, fermentation or washing, partial drying. Data: cherry and parchment mass, water, time, moisture, visible loss and quality.
- Trader / collector: wet-parchment storage, transport, wet hulling. Data: storage time, moisture, storage conditions, breakage, mold and mass loss.
- Cooperative / mill: final drying, grading, storage, packaging. Data: energy, final moisture spread, defects, rejected share, output and where residues go.
- Buyer / exporter: quality assurance, storage, transport. Data: acceptance threshold, rejection rate, transport mode, destination and traceability.
Lumping these into one "drying-hulling" step can blame the wrong actor and send equipment support to farmers when the collector or cooperative controls the decision. Storing wet parchment before wet hulling can raise mold, ochratoxin A risk and hurt cup quality, which is a food-safety reason to measure storage time and moisture.

Everyday comparisons you may use: dilution is like adding water to strong coffee (it tastes weaker, but the same amount of coffee is still in it); load is how dirty the water is times how much water there is; baseline means how things are now, before we change anything; a measuring mistake is like a scale that is a little off; moving the problem is like sweeping dirt under the carpet; a full season means going through busy and quiet weeks and good and poor cherries.

When the user shares a self-check result, explain in plain words where they are stuck (the FIRST gate that is not passed), why it matters, and give 3 to 5 practical next steps. Gently remind them that a later gate cannot make up for an earlier one.`;

/* ---------- Interface text (Indonesian / English) ---------- */
const UI = {
  id: {
    doc_title: "Lima Gerbang — panduan bukti “lebih bersih” untuk pengolahan kopi",
    skip: "Langsung ke isi halaman",
    brand_name: "Lima Gerbang",
    brand_sub: "Panduan untuk petani kopi",
    nav_gates: "Lima gerbang",
    nav_check: "Cek ide Anda",
    nav_calc: "Hitung limbah",
    nav_actors: "Siapa mengerjakan apa",
    nav_ask: "Tanya asisten",
    settings: "Pengaturan",

    hero_title: "Sebelum bilang cara kerja kita “lebih bersih”, buktikan dulu lewat lima gerbang.",
    hero_text: "Hemat air, memakai lagi air cucian, atau mengolah kulit kopi jadi kompos itu kedengarannya baik. Tapi belum tentu limbahnya benar-benar berkurang. Alat ini menuntun Anda memeriksa ide Anda selangkah demi selangkah, dan asisten AI siap menjelaskannya dengan bahasa sehari-hari.",
    hero_cta1: "Mulai cek ide saya",
    hero_cta2: "Tanya asisten",
    hero_note: "Gerbangnya dilewati satu per satu. Kalau gerbang depan belum beres, gerbang berikutnya tidak bisa menolong.",
    hero_gates_label: "Lima gerbang",

    gates_title: "Lima gerbang pemeriksaan",
    gates_intro: "Anggap saja lima pintu yang harus dilewati satu per satu. Pintu berikutnya baru boleh dibuka kalau pintu sebelumnya sudah beres.",
    if_fail: "Kalau belum lolos:",
    ex_label: "Contoh:",

    check_title: "Cek ide Anda",
    check_intro: "Ceritakan apa yang ingin Anda coba, lalu jawab beberapa pertanyaan di tiap gerbang. Tidak ada jawaban yang salah. Kalau belum tahu, pilih “Belum tahu”.",
    f_role: "Anda sebagai apa?",
    f_name: "Nama Anda",
    f_name_ph: "Contoh: Budi Santoso",
    f_email: "Email",
    f_email_ph: "nama@contoh.com",
    f_optional: "(boleh dikosongkan)",
    f_privacy: "Saat Anda menekan “Lihat hasil”, nama, email, dan jawaban Anda disimpan di komputer pusat (server) situs ini. Nama dan email tidak dikirim ke asisten AI.",
    f_privacy_local: "Nama dan email hanya tampil di hasil pengecekan di layar ini dan tidak dikirim ke asisten AI.",
    save_sending: "Menyimpan data Anda…",
    save_ok: "✓ Data Anda sudah tersimpan (nomor {id}).",
    save_err: "Data belum tersimpan: {reason}",
    save_retry: "Coba simpan lagi",
    save_net: "tidak bisa terhubung ke server.",
    save_429: "terlalu banyak permintaan, coba lagi nanti.",
    save_400: "ada isian yang tidak valid ({detail}).",
    save_500: "server sedang bermasalah.",
    name_required: "Tulis nama Anda dulu.",
    email_required: "Tulis alamat email Anda dulu.",
    email_invalid: "Alamat email tampaknya belum benar. Periksa lagi atau kosongkan.",
    f_path: "Ide Anda tentang apa?",
    f_idea: "Apa yang ingin Anda coba atau ubah?",
    f_idea_ph: "Contoh: air cucian kopi dipakai lagi lewat bak pengendap",
    idea_examples: "Pilih contoh (boleh diubah):",
    idea_required: "Tulis dulu apa yang ingin Anda coba. Beberapa kata saja cukup.",
    btn_start: "Mulai pertanyaan",
    step_of: "Gerbang {n} dari 5",
    ans_yes: "Ya",
    ans_no: "Belum",
    ans_unsure: "Belum tahu",
    btn_back: "Kembali",
    btn_next: "Lanjut",
    btn_finish: "Lihat hasil",
    btn_restart: "Ulangi dari awal",
    answer_all: "Jawab dulu semua pertanyaan di gerbang ini.",

    res_title: "Hasil pengecekan",
    res_name: "Nama",
    res_email: "Email",
    res_idea: "Ide",
    res_role: "Peran",
    res_path: "Jenis ide",
    res_ok_h: "Semua gerbang sudah dilewati",
    res_ok: "Dari jawaban Anda, kelima gerbang sudah dilewati. Teruslah mencatat hasilnya supaya orang lain bisa ikut memeriksa dan percaya.",
    res_stop_h: "Anda tertahan di Gerbang {n}: {title}",
    res_stop: "Gerbang berikutnya belum bisa dibuka sebelum gerbang ini beres.",
    res_wait_h: "Di Gerbang {n} ({title}) masih ada yang belum Anda ketahui",
    res_wait: "Cari tahu dulu jawabannya, lalu ulangi pengecekan ini. Gerbang berikutnya belum bisa dibuka.",
    st_pass: "✓ Lolos",
    st_fail: "✕ Perlu dibenahi",
    st_unsure: "? Masih ada yang belum diketahui",
    st_locked: "○ Belum bisa dibuka",
    res_unsure_msg: "Tahan dulu: masih ada yang belum Anda ketahui. Cari tahu dulu, lalu jawab lagi.",
    res_locked_msg: "Menunggu gerbang sebelumnya beres.",
    res_work_on: "Yang perlu dikerjakan:",
    res_tip: "Kalau Anda sudah dua kali memperbaiki gerbang yang sama tetapi hasilnya belum sesuai harapan, jangan diulang terus. Tinjau lagi dari awal: apakah cara menghitungnya sudah sama, apakah yang dihitung sudah lengkap, dan apakah keadaan sekarang sudah dicatat dengan benar.",
    res_disclaimer: "Ini pemeriksaan sendiri berdasarkan jawaban Anda, bukan sertifikat resmi.",
    csv_section: "Bagian",
    csv_field: "Isian",
    csv_value: "Nilai",
    csv_status: "Status",
    btn_ai_explain: "Minta asisten menjelaskan hasil ini dengan bahasa sederhana",
    btn_download_check: "Unduh hasil cek (CSV)",
    btn_download_calc: "Unduh hasil hitungan (CSV)",
    explain_user_msg: "Tolong jelaskan hasil cek ide saya dengan bahasa sederhana dan beri langkah berikutnya.",

    calc_title: "Hitung kotoran dalam limbah",
    calc_intro: "Air limbah yang tampak lebih bening belum tentu lebih bersih. Bisa jadi cuma lebih encer karena airnya ditambah. Yang harus dihitung adalah jumlah kotoran yang keluar: seberapa kotor limbahnya × berapa banyak airnya.",
    c_before: "Sebelum diubah",
    c_after: "Sesudah diubah",
    c_flow: "Air limbah dibuang per hari (m³)",
    c_cod: "Angka COD air limbah dari lab (mg/L)",
    c_err: "Perkiraan salah ukur (±%). Tidak tahu? Biarkan 10.",
    c_energy_h: "Listrik (dihitung terpisah)",
    c_extra: "Listrik tambahan yang dipakai alat baru (kWh per hari)",
    c_saved: "Listrik yang jadi hemat di tempat lain (kWh per hari)",
    c_factor: "Angka pengubah listrik ke gas pemanas global (kg CO₂e per kWh)",
    c_factor_hint: "Angka 0,85 hanya contoh. Kalau tidak tahu, biarkan saja.",
    g_title: "Apa artinya? (penjelasan istilah)",
    g_cod_t: "COD",
    g_cod_d: "Angka dari laboratorium yang menunjukkan seberapa kotor air limbah. Makin besar angkanya, makin kotor.",
    g_m3_t: "m³ (meter kubik)",
    g_m3_d: "1 m³ sama dengan 1.000 liter, kira-kira 5 drum besar.",
    g_err_t: "Salah ukur",
    g_err_d: "Alat dan cara mengukur tidak pernah 100% pas. Kalau Anda tidak tahu, biarkan 10%.",
    g_load_t: "Kotoran yang dibuang",
    g_load_d: "Seberapa kotor airnya dikali berapa banyak airnya. Inilah yang benar-benar masuk ke sungai atau tanah.",
    g_kwh_t: "kWh",
    g_kwh_d: "Satuan listrik yang tertulis di meteran atau tagihan listrik.",
    g_ef_t: "Angka pengubah listrik ke gas pemanas global",
    g_ef_d: "Dipakai untuk mengubah pemakaian listrik menjadi jumlah gas penyebab pemanasan global. Kalau tidak tahu, biarkan seperti yang tertulis.",
    btn_calc: "Hitung",
    preset_a: "Lihat contoh A (tanpa bak pengendap)",
    preset_b: "Lihat contoh B (dengan bak pengendap)",
    preset_note: "Contoh A dan B hanyalah gambaran rekaan dari makalah, bukan data nyata di lapangan.",
    calc_missing: "Isi jumlah air limbah dan angka COD, baik untuk “sebelum” maupun “sesudah”.",
    r_before: "Kotoran yang dibuang sebelum",
    r_after: "Kotoran yang dibuang sesudah",
    r_change: "Perubahan",
    r_unc: "Batas salah ukur gabungan",
    r_verdict: "Hasil hitungan kotoran",
    r_energy: "Selisih listrik dan gas pemanas global",
    unit_load: "kg COD per hari",
    v_clear: "Kotoran yang dibuang benar-benar berkurang: penurunannya lebih besar daripada salah ukur. Bagian ini di Gerbang 3 sudah terpenuhi.",
    v_unclear: "Kelihatannya berkurang, tetapi selisihnya masih sebesar salah ukur, jadi belum bisa dipercaya. Ukur ulang beberapa kali atau perbaiki cara mengukurnya (Gerbang 2).",
    v_fail: "Kotoran yang dibuang tidak berkurang. Gerbang 3 tidak lolos: hentikan atau rancang ulang.",
    n_shift: "Airnya lebih sedikit, tetapi limbahnya jadi lebih pekat. Jangan hanya melihat jumlah air; lihat jumlah kotorannya.",
    n_dilution: "Limbahnya terlihat lebih encer, tetapi jumlah kotorannya tidak berkurang. Bisa jadi cuma karena airnya ditambah.",
    e_title: "Listrik",
    e_net: "Selisih pemakaian listrik: {kwh} kWh per hari (setara {co2} kg gas pemanas global, CO₂e, per hari)",
    e_up: "Pemakaian listrik naik, jadi ada tambahan gas penyebab pemanasan global. Hal ini dicatat terpisah dan tidak dipakai untuk menutupi turunnya limbah. Karena itu belum boleh disebut “mengurangi beban lingkungan” secara keseluruhan. Pilihannya: kurangi listrik, tunjukkan penghematan yang bisa dibuktikan, atau batasi pernyataan Anda menjadi “mengurangi kotoran dalam air limbah”.",
    e_down: "Pemakaian listrik tidak menambah gas pemanas global.",

    actors_title: "Siapa mengerjakan apa dalam giling basah",
    actors_intro: "Giling basah dikerjakan oleh beberapa pihak. Catatan sebaiknya dipegang oleh pihak yang benar-benar mengerjakan langkah itu, supaya tidak salah menyalahkan.",
    actor_does: "Mengerjakan",
    actor_data: "Yang perlu dicatat",

    ask_title: "Tanya asisten",
    ask_intro: "Asisten komputer (AI) menjawab berdasarkan lima gerbang ini. Ia membantu menjelaskan, bukan memberi sertifikat.",
    ask_label: "Pertanyaan Anda",
    ask_ph: "Tulis pertanyaan Anda…",
    btn_send: "Kirim",
    btn_stop: "Berhenti",
    btn_clear: "Hapus percakapan",
    key_set: "Kunci API tersimpan (ubah)",
    key_unset: "Belum ada kunci API (atur)",
    key_proxy: "Memakai server sendiri",
    welcome: "Halo! Saya asisten Lima Gerbang. Silakan tanya apa saja, dengan bahasa sehari-hari, tentang cara membuktikan bahwa perubahan di pengolahan kopi Anda benar-benar lebih baik. Atau isi dulu “Cek ide Anda” di atas, lalu minta saya menjelaskan hasilnya.",
    sugg: [
      "Beda hemat air dengan limbah berkurang itu apa?",
      "Bagaimana cara murah mengukur air limbah saya?",
      "Apakah kulit kopi dijadikan kompos pasti lebih baik untuk lingkungan?",
      "Siapa yang sebaiknya mencatat dan mengukur dalam giling basah?",
    ],
    no_key: "Masukkan kunci API Groq di Pengaturan dulu.",
    err_401: "Kunci API ditolak. Periksa kembali di Pengaturan.",
    err_429: "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.",
    err_model: "Model tidak ditemukan atau tidak tersedia. Ganti nama model di Pengaturan.",
    err_net: "Tidak bisa terhubung ke Groq. Periksa koneksi internet Anda.",
    err_empty: "Tidak ada jawaban yang diterima. Coba kirim lagi.",
    err_generic: "Terjadi kesalahan",

    settings_title: "Pengaturan",
    s_key: "Kunci API Groq",
    s_key_hint: "Buat di console.groq.com. Kunci hanya disimpan di peramban ini.",
    s_model: "Model",
    s_model_hint: "Jika model tidak ditemukan, ganti dengan model yang tersedia di akun Groq Anda.",
    s_remember: "Ingat kunci di peramban ini",
    s_warn: "Peringatan: kunci di halaman web bisa dilihat siapa pun yang membuka alat pengembang. Untuk situs publik, panggil Groq lewat server Anda sendiri.",
    btn_save: "Simpan",
    btn_close: "Tutup",

    footer_text: "Isi situs ini berdasarkan makalah ilmiah “A Measurement-Gated Framework for Evaluating Cleaner-Production Claims in Coffee Processing and By-Product Valorization”. Angka-angka contoh hanyalah rekaan untuk gambaran. Situs ini bukan nasihat hukum dan bukan sertifikat resmi.",
  },

  en: {
    doc_title: "Five Gates — check whether a coffee-processing change is really cleaner",
    skip: "Skip to content",
    brand_name: "Five Gates",
    brand_sub: "A guide for coffee farmers",
    nav_gates: "Five gates",
    nav_check: "Check your idea",
    nav_calc: "Waste calculator",
    nav_actors: "Who does what",
    nav_ask: "Ask the assistant",
    settings: "Settings",

    hero_title: "Before you say your way of working is “cleaner”, prove it through five gates.",
    hero_text: "Saving water, reusing wash water, or turning coffee pulp into compost sounds good. But the waste may not really go down. This tool walks you through checking your idea step by step, and an AI assistant explains it in everyday words.",
    hero_cta1: "Check my idea",
    hero_cta2: "Ask the assistant",
    hero_note: "The gates are passed one by one. If an earlier gate is not sorted out, the next gates cannot help.",
    hero_gates_label: "The five gates",

    gates_title: "The five checking gates",
    gates_intro: "Think of five doors to go through one at a time. The next door only opens when the one before it is sorted out.",
    if_fail: "If it does not pass:",
    ex_label: "Example:",

    check_title: "Check your idea",
    check_intro: "Tell us what you want to try, then answer a few questions at each gate. There are no wrong answers. If you do not know yet, choose “Not sure”.",
    f_role: "You are a…",
    f_name: "Your name",
    f_name_ph: "Example: Budi Santoso",
    f_email: "Email",
    f_email_ph: "name@example.com",
    f_optional: "(optional)",
    f_privacy: "When you press “See result”, your name, email and answers are saved on this site’s central computer (server). Your name and email are not sent to the AI assistant.",
    f_privacy_local: "Your name and email only show in the result on this screen and are not sent to the AI assistant.",
    save_sending: "Saving your data…",
    save_ok: "✓ Your data has been saved (number {id}).",
    save_err: "Your data was not saved: {reason}",
    save_retry: "Try saving again",
    save_net: "could not reach the server.",
    save_429: "too many requests, try again later.",
    save_400: "some input is not valid ({detail}).",
    save_500: "the server has a problem.",
    name_required: "Please enter your name first.",
    email_required: "Please enter your email address first.",
    email_invalid: "That email address does not look right. Check it or leave it empty.",
    f_path: "What is your idea about?",
    f_idea: "What do you want to try or change?",
    f_idea_ph: "Example: reuse the coffee wash water through a settling tank",
    idea_examples: "Pick an example (you can change it):",
    idea_required: "Please write what you want to try first. A few words is enough.",
    btn_start: "Start the questions",
    step_of: "Gate {n} of 5",
    ans_yes: "Yes",
    ans_no: "Not yet",
    ans_unsure: "Not sure",
    btn_back: "Back",
    btn_next: "Next",
    btn_finish: "See result",
    btn_restart: "Start over",
    answer_all: "Please answer every question at this gate first.",

    res_title: "Your result",
    res_name: "Name",
    res_email: "Email",
    res_idea: "Idea",
    res_role: "Role",
    res_path: "Type of idea",
    res_ok_h: "All gates have been passed",
    res_ok: "From your answers, all five gates are passed. Keep writing down the results so other people can check and trust them too.",
    res_stop_h: "You are held at Gate {n}: {title}",
    res_stop: "The next gates cannot open until this one is sorted out.",
    res_wait_h: "At Gate {n} ({title}) there is still something you do not know",
    res_wait: "Find out the answers first, then run this check again. The next gates cannot open yet.",
    st_pass: "✓ Pass",
    st_fail: "✕ Needs fixing",
    st_unsure: "? Something still unknown",
    st_locked: "○ Cannot open yet",
    res_unsure_msg: "Hold on: there is still something you do not know. Find out first, then answer again.",
    res_locked_msg: "Waiting for the earlier gate to be sorted out.",
    res_work_on: "What to work on:",
    res_tip: "If you have fixed the same gate twice and the result still is not what you hoped, do not keep repeating. Look again from the start: are you counting the same way, did you count everything, and is today’s situation written down correctly?",
    res_disclaimer: "This is a self-check based on your answers, not an official certificate.",
    csv_section: "Section",
    csv_field: "Field",
    csv_value: "Value",
    csv_status: "Status",
    btn_ai_explain: "Ask the assistant to explain this result in simple words",
    btn_download_check: "Download check result (CSV)",
    btn_download_calc: "Download calculation (CSV)",
    explain_user_msg: "Please explain my self-check result in simple words and tell me what to do next.",

    calc_title: "Work out the dirt in the waste",
    calc_intro: "Waste water that looks clearer is not always cleaner. It may just be thinner because water was added. What you must work out is the amount of dirt that comes out: how dirty the waste is × how much water there is.",
    c_before: "Before the change",
    c_after: "After the change",
    c_flow: "Waste water thrown away per day (m³)",
    c_cod: "COD number of the waste water from the lab (mg/L)",
    c_err: "Estimated measuring mistake (±%). Not sure? Leave 10.",
    c_energy_h: "Electricity (counted separately)",
    c_extra: "Extra electricity used by the new equipment (kWh per day)",
    c_saved: "Electricity saved somewhere else (kWh per day)",
    c_factor: "Number that turns electricity into global-warming gas (kg CO₂e per kWh)",
    c_factor_hint: "0.85 is only an example. If you do not know, just leave it.",
    g_title: "What does it mean? (word help)",
    g_cod_t: "COD",
    g_cod_d: "A number from the laboratory that shows how dirty waste water is. The bigger the number, the dirtier.",
    g_m3_t: "m³ (cubic metre)",
    g_m3_d: "1 m³ is 1,000 litres, about 5 big drums.",
    g_err_t: "Measuring mistake",
    g_err_d: "Tools and ways of measuring are never 100% exact. If you do not know, leave 10%.",
    g_load_t: "Dirt thrown away",
    g_load_d: "How dirty the water is times how much water there is. This is what really goes into the river or the soil.",
    g_kwh_t: "kWh",
    g_kwh_d: "The unit of electricity written on the meter or the electricity bill.",
    g_ef_t: "Number that turns electricity into global-warming gas",
    g_ef_d: "Used to turn electricity use into an amount of global-warming gas. If you do not know, leave it as written.",
    btn_calc: "Calculate",
    preset_a: "See example A (no settling tank)",
    preset_b: "See example B (with settling tank)",
    preset_note: "Examples A and B are only made-up pictures from the paper, not real field data.",
    calc_missing: "Fill in the amount of waste water and the COD number, for both “before” and “after”.",
    r_before: "Dirt thrown away before",
    r_after: "Dirt thrown away after",
    r_change: "Change",
    r_unc: "Combined measuring-mistake limit",
    r_verdict: "Result of the dirt calculation",
    r_energy: "Electricity difference and global-warming gas",
    unit_load: "kg COD per day",
    v_clear: "The dirt thrown away really went down: the drop is bigger than the measuring mistake. This part of Gate 3 is met.",
    v_unclear: "It looks lower, but the difference is still as big as the measuring mistake, so it cannot be trusted yet. Measure again several times or improve how you measure (Gate 2).",
    v_fail: "The dirt thrown away did not go down. Gate 3 is not passed: stop or redesign.",
    n_shift: "There is less water, but the waste became stronger. Do not look only at the amount of water; look at the amount of dirt.",
    n_dilution: "The waste looks thinner, but the amount of dirt did not go down. It may just be because water was added.",
    e_title: "Electricity",
    e_net: "Electricity difference: {kwh} kWh per day (equal to {co2} kg of global-warming gas, CO₂e, per day)",
    e_up: "Electricity use went up, so there is extra global-warming gas. This is written down separately and is not used to cover up the drop in waste. So it cannot yet be called “reduces the burden on the environment” overall. The choices: use less electricity, show a saving you can prove, or limit the claim to “reduces the dirt in the waste water”.",
    e_down: "Electricity use does not add global-warming gas.",

    actors_title: "Who does what in wet hulling (giling basah)",
    actors_intro: "Wet hulling is done by several people. The records should be kept by whoever really does that step, so the wrong person is not blamed.",
    actor_does: "Does",
    actor_data: "What to write down",

    ask_title: "Ask the assistant",
    ask_intro: "The computer assistant (AI) answers based on these five gates. It helps explain; it does not give certificates.",
    ask_label: "Your question",
    ask_ph: "Type your question…",
    btn_send: "Send",
    btn_stop: "Stop",
    btn_clear: "Clear chat",
    key_set: "API key saved (change)",
    key_unset: "No API key yet (set up)",
    key_proxy: "Using your own server",
    welcome: "Hello! I am the Five Gates assistant. Ask me anything, in everyday words, about proving that a change in your coffee processing is really better. Or fill in “Check your idea” above first, then ask me to explain the result.",
    sugg: [
      "What is the difference between saving water and having less waste?",
      "How can I measure my waste water cheaply?",
      "Is turning coffee pulp into compost always better for the environment?",
      "Who should keep records and measure in wet hulling?",
    ],
    no_key: "Please add your Groq API key in Settings first.",
    err_401: "The API key was rejected. Please check it in Settings.",
    err_429: "Too many requests. Please wait a moment and try again.",
    err_model: "The model was not found or is not available. Change the model name in Settings.",
    err_net: "Could not reach Groq. Check your internet connection.",
    err_empty: "No answer was received. Please try sending again.",
    err_generic: "Something went wrong",

    settings_title: "Settings",
    s_key: "Groq API key",
    s_key_hint: "Create one at console.groq.com. The key is stored only in this browser.",
    s_model: "Model",
    s_model_hint: "If the model is not found, replace it with one available in your Groq account.",
    s_remember: "Remember the key in this browser",
    s_warn: "Warning: a key in a web page can be seen by anyone who opens developer tools. For a public site, call Groq through your own server.",
    btn_save: "Save",
    btn_close: "Close",

    footer_text: "This site is based on the scientific paper “A Measurement-Gated Framework for Evaluating Cleaner-Production Claims in Coffee Processing and By-Product Valorization”. The example numbers are only made up to give a picture. This site is not legal advice and not an official certificate.",
  },
};

/* ---------- Gate content ---------- */
// Wording is meant for farmers: everyday words, real examples, no jargon.
// Keep the question ids (a, b, c, d) the same as QUESTIONS in gates.js.
const GATES = [
  {
    id: "G1",
    title: { id: "Keadaan kita sekarang", en: "How things are now" },
    ask: {
      id: "Apakah kita sudah tahu keadaan kita yang sebenarnya hari ini?",
      en: "Do we know how things really are today?",
    },
    desc: {
      id: "Sebelum bilang ada yang membaik, kita harus tahu dulu keadaan sebelum diubah. Catat apa adanya, bukan kira-kira.",
      en: "Before saying something got better, we need to know how it was before the change. Write down what is really happening, not guesses.",
    },
    example: {
      id: "Sebelum memasang bak pengendap, catat dulu: tiap mencuci 100 kg buah kopi, berapa ember air yang terpakai, dan ke mana air bekas cucian itu mengalir.",
      en: "Before building a settling tank, write down: for every 100 kg of coffee cherries you wash, how many buckets of water you use, and where the used water goes.",
    },
    fail: {
      id: "Catat dulu keadaan sekarang dengan benar (air, tenaga, jumlah kopi), baru lanjut.",
      en: "Write down how things are now (water, power, amount of coffee), then go on.",
    },
    qs: [
      {
        id: "a",
        text: {
          id: "Apakah Anda punya catatan dari hasil menakar atau menimbang (bukan kira-kira) tentang cara kerja Anda sekarang? Misalnya berapa air yang terpakai dan berapa kilo buah kopi yang diolah, selama satu musim panen.",
          en: "Do you have real records (things measured or weighed, not guesses) of how you work now? For example how much water you use and how many kilos of coffee cherries you process, over one harvest season.",
        },
      },
      {
        id: "b",
        text: {
          id: "Kalau nanti membandingkan “sebelum” dan “sesudah”, apakah cara menghitungnya sama? Misalnya sama-sama per 1 ton buah kopi, dan sama-sama dihitung saat kopi masih basah (atau sama-sama saat sudah kering).",
          en: "When you later compare “before” and “after”, will you count the same way? For example both per 1 tonne of cherries, and both counted while the coffee is still wet (or both when dry).",
        },
      },
      {
        id: "c",
        text: {
          id: "Apakah Anda tahu ke mana limbah atau kopi yang terbuang pergi sekarang? Misalnya ke sungai, ke kebun, jadi pakan ternak, atau ke kolam.",
          en: "Do you know where the waste or lost coffee goes now? For example to the river, to the field, to animal feed, or to a pond.",
        },
      },
    ],
  },
  {
    id: "G2",
    title: { id: "Hitungan yang bisa dipercaya", en: "Counting you can trust" },
    ask: {
      id: "Apakah perubahannya benar-benar terlihat, bukan kebetulan?",
      en: "Can we really see the change, and is it not just luck?",
    },
    desc: {
      id: "Ukur dua hal: berapa banyak limbahnya DAN seberapa kotor limbahnya. Ukur berkali-kali supaya hasilnya bukan kebetulan. Salah ukur kecil itu wajar, jadi perubahan yang kita lihat harus lebih besar daripada salah ukur itu.",
      en: "Measure two things: how much waste there is AND how dirty it is. Measure many times so the result is not a fluke. Small measuring mistakes are normal, so the change you claim must be bigger than those mistakes.",
    },
    example: {
      id: "Jangan hanya mengukur sekali. Ambil contoh air limbah di 5 hari yang berbeda lalu kirim ke laboratorium. Kalau hasilnya naik-turun jauh, berarti cara mengukurnya belum bisa dipercaya.",
      en: "Do not measure just once. Take samples of the waste water on 5 different days and send them to a laboratory. If the results jump around a lot, the way of measuring cannot be trusted yet.",
    },
    fail: {
      id: "Perbaiki cara mengambil contoh, cara mengukur, atau alat ukurnya.",
      en: "Fix how you take samples, how you measure, or the measuring tools.",
    },
    qs: [
      {
        id: "a",
        text: {
          id: "Apakah Anda mengukur DUA-DUANYA: berapa banyak air limbahnya (misalnya berapa drum atau berapa meter kubik) DAN seberapa kotor air limbahnya (diuji di laboratorium, misalnya angka COD)? Salah satu saja tidak cukup.",
          en: "Do you measure BOTH how much waste water there is (for example how many drums or cubic metres) AND how dirty it is (a lab test, for example the COD number)? One of them is not enough.",
        },
      },
      {
        id: "b",
        text: {
          id: "Apakah pengukuran diulang di beberapa hari atau beberapa kali olah, dengan cara yang sama dan alat yang sudah dicek (timbangan, meteran air, atau laboratorium)?",
          en: "Do you repeat the measuring on several days or batches, the same way each time, with tools that have been checked (scale, water meter or a laboratory)?",
        },
      },
      {
        id: "c",
        text: {
          id: "Apakah perubahan yang Anda lihat jelas lebih besar daripada kemungkinan salah ukur? Contoh: limbah turun 30%, tetapi salah ukurnya bisa sampai 30%. Itu belum bisa dipercaya.",
          en: "Is the change you see clearly bigger than the possible measuring mistake? Example: waste went down 30%, but the measuring could be off by 30%. Then you cannot trust it yet.",
        },
      },
    ],
  },
  {
    id: "G3",
    title: { id: "Benar-benar lebih baik", en: "Really better" },
    ask: {
      id: "Setelah semuanya dihitung, apakah hasilnya benar-benar lebih baik?",
      en: "After counting everything, is it really better?",
    },
    desc: {
      id: "Hitung juga yang kita tambahkan: listrik, bahan kimia, air, ongkos angkut. Cek juga apakah masalahnya cuma pindah tempat.",
      en: "Count what you add too: electricity, chemicals, water, transport. Also check that the problem did not simply move somewhere else.",
    },
    example: {
      id: "Air cucian dipakai lagi sehingga pemakaian air turun 60%, tetapi limbahnya jadi jauh lebih pekat dan kotoran yang dibuang malah bertambah. Airnya memang hemat, tapi itu belum bisa disebut lebih baik.",
      en: "Wash water is reused so water use drops 60%, but the waste becomes much stronger and more dirt is thrown away. The water is saved, but that cannot be called better yet.",
    },
    fail: {
      id: "Hentikan atau rancang ulang: belum terbukti lebih baik secara keseluruhan.",
      en: "Stop or redesign: it is not yet proven to be better overall.",
    },
    qs: [
      {
        id: "a",
        text: {
          id: "Setelah semua tambahan baru dihitung (listrik, bahan kimia, air, angkutan), apakah kotoran yang keluar bersama limbah tetap lebih sedikit daripada sebelumnya? Ingat: yang dihitung adalah jumlah kotorannya, bukan hanya jumlah airnya.",
          en: "After counting everything new that you add (electricity, chemicals, water, transport), is the amount of dirt leaving with the waste still lower than before? Remember: what counts is the amount of dirt, not only the amount of water.",
        },
      },
      {
        id: "b",
        text: {
          id: "Sudah dicek bahwa masalahnya tidak cuma pindah tempat? Misalnya airnya lebih sedikit tetapi limbahnya jadi lebih pekat, limbah cair berubah jadi lumpur, atau listrik terpakai lebih banyak.",
          en: "Have you checked that the problem did not just move? For example less water but stronger waste, waste water turning into sludge, or more electricity used.",
        },
      },
      {
        id: "c",
        only: "recovery",
        text: {
          id: "Kalau Anda memanfaatkan sisa (misalnya kulit buah kopi jadi kompos): apakah Anda tahu dulu kulit itu dibuang ke mana, dan apa yang digantikan oleh produk baru ini (misalnya pupuk kimia yang jadi tidak dibeli)?",
          en: "If you use a leftover (for example coffee pulp as compost): do you know where the pulp went before, and what the new product replaces (for example chemical fertiliser you no longer buy)?",
        },
      },
      {
        id: "d",
        text: {
          id: "Apakah mutu biji kopi tetap baik? Kadar air stabil, tidak berjamur, tidak lebih banyak biji cacat, dan pembeli tidak lebih sering menolak.",
          en: "Is the coffee quality still good? Moisture steady, no mould, no more bad beans, and buyers do not reject more.",
        },
      },
    ],
  },
  {
    id: "G4",
    title: { id: "Tahan dipakai sehari-hari", en: "Holds up day to day" },
    ask: {
      id: "Apakah tetap berhasil di keadaan sehari-hari, bukan hanya saat dicoba?",
      en: "Does it still work in everyday conditions, not only during a trial?",
    },
    desc: {
      id: "Coba sepanjang satu musim, dengan kopi yang kadang bagus kadang jelek, jumlah olahan yang berubah-ubah, dan pekerja yang bergantian.",
      en: "Try it for a whole season, with coffee that is sometimes good and sometimes poor, changing amounts, and workers taking turns.",
    },
    example: {
      id: "Bak pengendap yang bagus saat dicoba 2 hari belum tentu kuat saat panen raya, ketika buah datang banyak sekali dan pekerjanya bergantian.",
      en: "A settling tank that works well in a 2-day trial may not cope in the peak harvest, when cherries arrive in huge amounts and workers take turns.",
    },
    fail: {
      id: "Tahan dulu: kumpulkan bukti lebih banyak di pengolahan yang sebenarnya, atau perbaiki.",
      en: "Hold: collect more evidence in real operation, or improve it.",
    },
    qs: [
      {
        id: "a",
        text: {
          id: "Apakah sudah dicoba setidaknya selama satu musim pengolahan penuh?",
          en: "Has it been tried for at least one whole processing season?",
        },
      },
      {
        id: "b",
        text: {
          id: "Apakah dicoba dalam keadaan biasa (mutu buah kadang naik turun, jumlah olahan berbeda-beda, pekerja bergantian), bukan hanya saat semuanya serba bagus?",
          en: "Was it tried in ordinary conditions (cherry quality going up and down, different amounts, workers taking turns), not only when everything was perfect?",
        },
      },
      {
        id: "c",
        text: {
          id: "Apakah Anda sudah menentukan SEBELUM mencoba, hasil seperti apa yang dianggap “masih berhasil”? (Jangan menentukannya setelah melihat hasil.)",
          en: "Did you decide BEFORE the trial what result counts as “still works”? (Do not decide after seeing the results.)",
        },
      },
    ],
  },
  {
    id: "G5",
    title: { id: "Ada yang menjalankan dan membiayai", en: "Someone runs and pays for it" },
    ask: {
      id: "Siapa yang membayar, menjalankan, dan mencatat?",
      en: "Who pays, who runs it, and who keeps the records?",
    },
    desc: {
      id: "Cara baru hanya bertahan kalau jelas siapa yang membayar, siapa yang bekerja, siapa yang merawat, dan siapa yang untung. Yang menjalankan sebaiknya juga yang mencatat hasilnya.",
      en: "A new way only lasts when it is clear who pays, who works, who looks after it and who benefits. The one who runs it should also keep the records.",
    },
    example: {
      id: "Mesin bantuan yang tidak ada yang merawat dan tidak ada dana perbaikannya mudah mangkrak.",
      en: "A machine given as aid that nobody looks after and that has no repair money easily ends up unused.",
    },
    fail: {
      id: "Tahan dulu sampai pembagian tugas dan biaya disepakati secara tertulis.",
      en: "Hold until the sharing of tasks and costs is agreed in writing.",
    },
    qs: [
      {
        id: "a",
        text: {
          id: "Apakah sudah jelas siapa yang membayar, menjalankan, merawat, mencatat hasil, dan menerima keuntungannya?",
          en: "Is it clear who pays, runs, looks after it, keeps the records, and receives the benefit?",
        },
      },
      {
        id: "b",
        text: {
          id: "Apakah pembagian itu sudah disepakati secara tertulis (surat perjanjian, aturan koperasi, atau perjanjian program)?",
          en: "Is this agreed in writing (an agreement letter, cooperative rules or a programme agreement)?",
        },
      },
      {
        id: "c",
        text: {
          id: "Apakah ada rencana dan uang untuk perawatan dan suku cadang? Kalau menghasilkan produk baru (misalnya kompos), apakah sudah jelas akan dijual atau dipakai ke mana?",
          en: "Is there a plan and money for upkeep and spare parts? If it makes a new product (for example compost), is it clear where it will be sold or used?",
        },
      },
    ],
  },
];

const ROLES = [
  { id: "farmer", label: { id: "Petani", en: "Farmer" } },
  { id: "collector", label: { id: "Pengepul / pedagang", en: "Collector / trader" } },
  { id: "coop", label: { id: "Koperasi / pabrik pengolahan", en: "Cooperative / mill" } },
  { id: "buyer", label: { id: "Pembeli / eksportir", en: "Buyer / exporter" } },
  { id: "other", label: { id: "Lainnya (penyuluh, peneliti, dll.)", en: "Other (extension officer, researcher, etc.)" } },
];

const PATHS = [
  {
    id: "prevention",
    label: {
      id: "Berhemat: memakai lebih sedikit air atau tenaga, atau mengurangi kopi yang terbuang",
      en: "Saving: use less water or power, or lose less coffee",
    },
  },
  {
    id: "recovery",
    label: {
      id: "Memanfaatkan sisa: kulit buah, lendir, kulit tanduk (kulit HS), sekam, atau kulit ari",
      en: "Using leftovers: pulp, mucilage, parchment (the hard skin), husk or silverskin",
    },
  },
];

const IDEA_EXAMPLES = [
  { id: "Memakai lagi air cucian kopi", en: "Reuse the coffee wash water" },
  { id: "Kulit buah kopi dijadikan kompos", en: "Turn coffee pulp into compost" },
  { id: "Pengering baru atau pengering tenaga surya", en: "A new or solar dryer" },
  { id: "Bak pengendap untuk air limbah", en: "A settling tank for waste water" },
];

const ACTORS = [
  {
    name: { id: "Petani", en: "Farmer" },
    does: {
      id: "Memilih buah, mengupas kulit buah, fermentasi atau mencuci, menjemur sebagian.",
      en: "Sorting cherries, pulping, fermenting or washing, partly drying.",
    },
    data: {
      id: "Berat buah dan kopi HS basah, jumlah air, lamanya, kadar air, kopi yang rusak atau terbuang, dan mutunya.",
      en: "Weight of cherries and wet parchment, amount of water, how long it takes, moisture, coffee damaged or lost, and quality.",
    },
  },
  {
    name: { id: "Pengepul / pedagang", en: "Collector / trader" },
    does: {
      id: "Menyimpan kopi HS basah, mengangkut, giling basah (mengupas kulit tanduk saat kopi masih basah).",
      en: "Storing wet parchment, transporting, wet hulling (removing the hard skin while the coffee is still wet).",
    },
    data: {
      id: "Berapa lama disimpan, kadar air, keadaan gudang, biji pecah, jamur, dan susut berat.",
      en: "How long it is stored, moisture, storage conditions, broken beans, mould and weight loss.",
    },
  },
  {
    name: { id: "Koperasi / pabrik", en: "Cooperative / mill" },
    does: {
      id: "Menjemur sampai kering, memilah mutu, menyimpan, mengemas.",
      en: "Drying until dry, grading, storing, packing.",
    },
    data: {
      id: "Listrik atau bahan bakar yang dipakai, kadar air akhir, biji cacat, bagian yang ditolak, hasil akhir, dan ke mana sisa atau limbah dibuang.",
      en: "Electricity or fuel used, final moisture, bad beans, the part rejected, the final amount, and where leftovers or waste go.",
    },
  },
  {
    name: { id: "Pembeli / eksportir", en: "Buyer / exporter" },
    does: {
      id: "Memeriksa mutu, menyimpan, mengangkut.",
      en: "Checking quality, storing, transporting.",
    },
    data: {
      id: "Syarat mutu yang diterima, berapa yang ditolak, cara angkut, tujuan, dan asal-usul kopi.",
      en: "Quality needed to accept, how much is rejected, how it is transported, where it goes, and where the coffee came from.",
    },
  },
];

/* ---------- State & small helpers ---------- */
const state = {
  lang: "id",
  view: "intro", // intro | q | result
  step: 0,
  role: "farmer",
  path: "prevention",
  save: { status: "idle", id: null, key: "", detail: "" },
  name: "",
  email: "",
  idea: "",
  answers: {},
  history: [],
  streaming: false,
  abort: null,
  lastCalc: null,
  welcomeEl: null,
};

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const t = (key) => UI[state.lang][key] ?? key;
const L = (obj) => obj[state.lang];
const tpl = (str, vars) => str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const nf = (n, d = 0) =>
  new Intl.NumberFormat(state.lang === "id" ? "id-ID" : "en-US", { maximumFractionDigits: d }).format(n);
const signed = (n, d = 1) => (n > 0 ? "+" : n < 0 ? "−" : "") + nf(Math.abs(n), d);

function downloadCSV(filename, rows) {
  const csv = rows.map((row) => row.map((value) => {
    if (value === null || value === undefined) return "";
    let text = String(value);
    const isNumber = /^-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(text);
    if (!isNumber && /^[\s]*[=+\-@\t\r]/.test(text)) text = "'" + text;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff", csv, "\r\n"], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const store = {
  get(k, session = false) {
    try { return (session ? sessionStorage : localStorage).getItem(k); } catch { return null; }
  },
  set(k, v, session = false) {
    try { (session ? sessionStorage : localStorage).setItem(k, v); } catch { /* storage unavailable */ }
  },
  del(k) {
    try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch { /* ignore */ }
  },
};

const getKey = () => store.get(CONFIG.storage.key, true) || store.get(CONFIG.storage.key) || "";
const getModel = () => store.get(CONFIG.storage.model) || CONFIG.defaultModel;

/* ---------- Gate glyph (a farm gate; the panel swings open when a gate passes) ---------- */
function glyph(open = false, index = null) {
  const style = index === null ? "" : ` style="--i:${index}"`;
  return `<svg class="glyph${open ? " open" : ""}" viewBox="0 0 48 48" aria-hidden="true"${style}>
    <rect class="post" x="3" y="6" width="5" height="38" rx="1"></rect>
    <rect class="post" x="40" y="6" width="5" height="38" rx="1"></rect>
    <g class="panel">
      <rect class="rail" x="8" y="12" width="32" height="3.5"></rect>
      <rect class="rail" x="8" y="23" width="32" height="3.5"></rect>
      <rect class="rail" x="8" y="34" width="32" height="3.5"></rect>
      <path class="brace" d="M8 36 L40 13"></path>
    </g>
  </svg>`;
}

/* ---------- Static renderers ---------- */
function renderHeroGates() {
  $("#heroGates").innerHTML = GATES.map(
    (g, i) => `<li><a class="hg" href="#gate-${g.id}">${glyph(false, i)}<span class="hg-id">${g.id}</span><span class="hg-title">${esc(L(g.title))}</span></a></li>`
  ).join("");
}

function renderGatePath() {
  $("#gatePath").innerHTML = GATES.map(
    (g) => `<li id="gate-${g.id}">
      <div class="node">${glyph(false)}</div>
      <div>
        <h3><span class="gid">${g.id}</span>${esc(L(g.title))}</h3>
        <p class="gq">${esc(L(g.ask))}</p>
        <p>${esc(L(g.desc))}</p>
        <p class="eg"><strong>${esc(t("ex_label"))}</strong> ${esc(L(g.example))}</p>
        <p class="if-fail"><strong>${esc(t("if_fail"))}</strong> ${esc(L(g.fail))}</p>
      </div>
    </li>`
  ).join("");
}

function renderActors() {
  $("#actorList").innerHTML = ACTORS.map(
    (a) => `<li>
      <h3>${esc(L(a.name))}</h3>
      <dl>
        <dt>${esc(t("actor_does"))}</dt><dd>${esc(L(a.does))}</dd>
        <dt>${esc(t("actor_data"))}</dt><dd>${esc(L(a.data))}</dd>
      </dl>
    </li>`
  ).join("");
}

function renderSuggest() {
  $("#suggest").innerHTML = t("sugg")
    .map((s) => `<button type="button" class="chip-btn" data-prompt="${esc(s)}">${esc(s)}</button>`)
    .join("");
}

/* =========================================================
   Self-check wizard
   ========================================================= */
const answerKey = (g, q) => `${g.id}_${q.id}`;
const questionsFor = (g) => g.qs.filter((q) => !q.only || q.only === state.path);

function evaluate() {
  const rows = [];
  let stopped = null;
  GATES.forEach((g, i) => {
    if (stopped !== null) {
      rows.push({ gate: g, status: "locked", qs: [], vals: [] });
      return;
    }
    const qs = questionsFor(g);
    const vals = qs.map((q) => state.answers[answerKey(g, q)]);
    let status = "pass";
    if (vals.includes("no")) status = "fail";
    else if (vals.includes("unsure") || vals.includes(undefined)) status = "unsure";
    rows.push({ gate: g, status, qs, vals });
    if (status !== "pass") stopped = i;
  });
  return { rows, stopped };
}

function choiceHTML(name, value, label, checked) {
  return `<label class="choice"><input type="radio" name="${name}" value="${value}"${checked ? " checked" : ""}><span>${esc(label)}</span></label>`;
}

function introHTML() {
  const roles = ROLES.map((r) => choiceHTML("role", r.id, L(r.label), state.role === r.id)).join("");
  const paths = PATHS.map((p) => choiceHTML("path", p.id, L(p.label), state.path === p.id)).join("");
  const chips = IDEA_EXAMPLES.map(
    (ex) => `<button type="button" class="chip-btn" data-action="example" data-text="${esc(L(ex))}">${esc(L(ex))}</button>`
  ).join("");

  const emailLabel = t("f_email") + (CONFIG.form.requireEmail ? "" : " " + t("f_optional"));
  const nameReq = CONFIG.form.requireName ? ' aria-required="true"' : "";
  const emailReq = CONFIG.form.requireEmail ? ' aria-required="true"' : "";

  return `<form id="introForm" novalidate>
    <div class="id-grid">
      <div>
        <label for="nameInput">${esc(t("f_name"))}</label>
        <input id="nameInput" type="text" autocomplete="name" maxlength="80" placeholder="${esc(t("f_name_ph"))}" value="${esc(state.name)}"${nameReq}>
      </div>
      <div>
        <label for="emailInput">${esc(emailLabel)}</label>
        <input id="emailInput" type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false" maxlength="120" placeholder="${esc(t("f_email_ph"))}" value="${esc(state.email)}"${emailReq}>
      </div>
    </div>
    <p class="hint id-hint">${esc(t(CONFIG.submitUrl ? "f_privacy" : "f_privacy_local"))}</p>
    <fieldset>
      <legend>${esc(t("f_role"))}</legend>
      <div class="choice-grid">${roles}</div>
    </fieldset>
    <fieldset>
      <legend>${esc(t("f_path"))}</legend>
      <div class="choice-grid">${paths}</div>
    </fieldset>
    <label for="ideaInput">${esc(t("f_idea"))}</label>
    <textarea id="ideaInput" rows="3" maxlength="400" placeholder="${esc(t("f_idea_ph"))}">${esc(state.idea)}</textarea>
    <p class="hint" style="margin-bottom:0">${esc(t("idea_examples"))}</p>
    <div class="chips">${chips}</div>
    <p class="form-err" id="introErr" role="alert" hidden></p>
    <div class="btn-row"><button type="submit" class="btn btn-primary">${esc(t("btn_start"))}</button></div>
  </form>`;
}

function questionHTML() {
  const g = GATES[state.step];
  const qs = questionsFor(g);

  const progress = GATES.map((x, i) => {
    const cls = i < state.step ? "done" : i === state.step ? "current" : "";
    const cur = i === state.step ? ' aria-current="step"' : "";
    return `<li class="pstep ${cls}"${cur}>${glyph(i < state.step)}<span>${x.id}</span></li>`;
  }).join("");

  const fields = qs
    .map((q) => {
      const name = `q_${answerKey(g, q)}`;
      const cur = state.answers[answerKey(g, q)];
      const opts = ["yes", "no", "unsure"]
        .map(
          (v) => `<label class="seg-opt ${v}"><input type="radio" name="${name}" value="${v}"${cur === v ? " checked" : ""}><span>${esc(t("ans_" + v))}</span></label>`
        )
        .join("");
      return `<fieldset class="q"><legend>${esc(L(q.text))}</legend><div class="seg">${opts}</div></fieldset>`;
    })
    .join("");

  const last = state.step === GATES.length - 1;
  return `<ol class="progress" aria-label="${esc(t("hero_gates_label"))}">${progress}</ol>
    <h3 class="wiz-title" tabindex="-1" data-focus>${esc(tpl(t("step_of"), { n: state.step + 1 }))}: ${esc(L(g.title))}</h3>
    <p class="gq-big">${esc(L(g.ask))}</p>
    <p class="muted">${esc(L(g.desc))}</p>
    <p class="eg"><strong>${esc(t("ex_label"))}</strong> ${esc(L(g.example))}</p>
    <form id="qForm" novalidate>
      ${fields}
      <p class="form-err" id="qErr" role="alert" hidden>${esc(t("answer_all"))}</p>
      <div class="wiz-nav">
        <button type="button" class="btn btn-ghost" data-action="back">${esc(t("btn_back"))}</button>
        <button type="submit" class="btn btn-primary">${esc(last ? t("btn_finish") : t("btn_next"))}</button>
      </div>
    </form>`;
}

function resultHTML() {
  const ev = evaluate();
  const role = ROLES.find((r) => r.id === state.role);
  const path = PATHS.find((p) => p.id === state.path);

  let verdict;
  if (ev.stopped === null) {
    verdict = `<div class="verdict ok"><h3>${esc(t("res_ok_h"))}</h3><p>${esc(t("res_ok"))}</p></div>`;
  } else {
    const row = ev.rows[ev.stopped];
    const vars = { n: ev.stopped + 1, title: L(row.gate.title) };
    if (row.status === "unsure") {
      verdict = `<div class="verdict wait"><h3>${esc(tpl(t("res_wait_h"), vars))}</h3><p>${esc(t("res_wait"))}</p></div>`;
    } else {
      verdict = `<div class="verdict stop"><h3>${esc(tpl(t("res_stop_h"), vars))}</h3><p>${esc(t("res_stop"))}</p></div>`;
    }
  }

  const rows = ev.rows
    .map((r) => {
      const g = r.gate;
      let body = "";
      if (r.status === "fail") {
        body += `<p>${esc(L(g.fail))}</p>`;
      } else if (r.status === "unsure") {
        body += `<p>${esc(t("res_unsure_msg"))}</p>`;
      } else if (r.status === "locked") {
        body += `<p>${esc(t("res_locked_msg"))}</p>`;
      }
      if (r.status === "fail" || r.status === "unsure") {
        const todo = r.qs.filter((q, i) => r.vals[i] !== "yes");
        if (todo.length) {
          body += `<p><strong>${esc(t("res_work_on"))}</strong></p><ul>${todo.map((q) => `<li>${esc(L(q.text))}</li>`).join("")}</ul>`;
        }
      }
      return `<div class="res-row ${r.status}">
        ${glyph(r.status === "pass")}
        <div>
          <h4>${g.id} · ${esc(L(g.title))}<span class="chip ${r.status}">${esc(t("st_" + r.status))}</span></h4>
          ${body}
        </div>
      </div>`;
    })
    .join("");

  return `<h3 class="wiz-title" tabindex="-1" data-focus>${esc(t("res_title"))}</h3>
    <div id="saveStatus" role="status" aria-live="polite">${saveStatusHTML()}</div>
    <div class="res-context">
      ${state.name ? `<p><strong>${esc(t("res_name"))}:</strong> ${esc(state.name)}</p>` : ""}
      ${state.email ? `<p><strong>${esc(t("res_email"))}:</strong> ${esc(state.email)}</p>` : ""}
      <p><strong>${esc(t("res_idea"))}:</strong> ${esc(state.idea)}</p>
      <p><strong>${esc(t("res_role"))}:</strong> ${esc(L(role.label))}</p>
      <p><strong>${esc(t("res_path"))}:</strong> ${esc(L(path.label))}</p>
    </div>
    ${verdict}
    ${rows}
    ${ev.stopped !== null ? `<p class="fine">${esc(t("res_tip"))}</p>` : ""}
    <div class="res-actions">
      <button type="button" class="btn btn-primary" data-action="explain">${esc(t("btn_ai_explain"))}</button>
      <button type="button" class="btn btn-ghost" data-action="download-check">${esc(t("btn_download_check"))}</button>
      <button type="button" class="btn btn-ghost" data-action="restart">${esc(t("btn_restart"))}</button>
    </div>
    <p class="fine">${esc(t("res_disclaimer"))}</p>`;
}

function renderWizard(moveFocus = false) {
  const box = $("#wizard");
  box.innerHTML = state.view === "intro" ? introHTML() : state.view === "q" ? questionHTML() : resultHTML();
  if (moveFocus) {
    const target = box.querySelector("[data-focus]") || box.querySelector("textarea");
    box.scrollIntoView({ behavior: "smooth", block: "start" });
    target?.focus({ preventScroll: true });
  }
}

function setView(view, step = state.step) {
  state.view = view;
  state.step = step;
  renderWizard(true);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Returns null when the form is fine, otherwise { msg, field } for the first problem */
function validateIntro() {
  if (CONFIG.form.requireName && state.name.length < 2) {
    return { msg: "name_required", field: "#nameInput" };
  }
  if (state.email) {
    if (!EMAIL_RE.test(state.email)) return { msg: "email_invalid", field: "#emailInput" };
  } else if (CONFIG.form.requireEmail) {
    return { msg: "email_required", field: "#emailInput" };
  }
  if (state.idea.length < 3) return { msg: "idea_required", field: "#ideaInput" };
  return null;
}

/* Wizard events (delegated, so re-rendering never loses handlers) */
const wizard = $("#wizard");

wizard.addEventListener("input", (e) => {
  if (e.target.id === "ideaInput") state.idea = e.target.value;
  else if (e.target.id === "nameInput") state.name = e.target.value;
  else if (e.target.id === "emailInput") state.email = e.target.value;
});

wizard.addEventListener("change", (e) => {
  const { name, value } = e.target;
  if (name === "role") state.role = value;
  else if (name === "path") state.path = value;
  else if (name && name.startsWith("q_")) {
    state.answers[name.slice(2)] = value;
    $("#qErr")?.setAttribute("hidden", "");
  }
});

wizard.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "introForm") {
    state.name = $("#nameInput").value.trim();
    state.email = $("#emailInput").value.trim();
    state.idea = $("#ideaInput").value.trim();

    const problem = validateIntro();
    if (problem) {
      const err = $("#introErr");
      err.textContent = t(problem.msg);
      err.hidden = false;
      $(problem.field).focus();
      return;
    }
    setView("q", 0);
  } else if (e.target.id === "qForm") {
    const g = GATES[state.step];
    const missing = questionsFor(g).some((q) => !state.answers[answerKey(g, q)]);
    if (missing) {
      $("#qErr").hidden = false;
      return;
    }
    if (state.step < GATES.length - 1) {
      setView("q", state.step + 1);
    } else {
      setView("result");
      submitResult();
    }
  }
});

wizard.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === "example") {
    const box = $("#ideaInput");
    box.value = btn.dataset.text;
    state.idea = box.value;
    box.focus();
  } else if (action === "back") {
    if (state.step > 0) setView("q", state.step - 1);
    else setView("intro", 0);
  } else if (action === "restart") {
    state.answers = {};
    state.save = { status: "idle", id: null, key: "", detail: "" };
    setView("intro", 0);
  } else if (action === "retry-save") {
    submitResult();
  } else if (action === "download-check") {
    downloadCheckCSV();
  } else if (action === "explain") {
    const prompt = buildExplainPrompt();
    $("#ask").scrollIntoView({ behavior: "smooth", block: "start" });
    sendMessage(t("explain_user_msg"), prompt);
  }
});

/* =========================================================
   Saving the finished self-check on the Node.js server
   ========================================================= */
// Only the questions that apply to the chosen type of idea
function collectAnswers() {
  const out = {};
  GATES.forEach((g) => questionsFor(g).forEach((q) => { out[answerKey(g, q)] = state.answers[answerKey(g, q)]; }));
  return out;
}

function saveStatusHTML() {
  if (!CONFIG.submitUrl) return "";
  const s = state.save;
  if (s.status === "sending") return `<p class="save-status">${esc(t("save_sending"))}</p>`;
  if (s.status === "saved") return `<p class="save-status ok">${esc(tpl(t("save_ok"), { id: s.id }))}</p>`;
  if (s.status === "error") {
    const reason = tpl(t(s.key), { detail: s.detail });
    return `<p class="save-status err">${esc(tpl(t("save_err"), { reason }))}
      <button type="button" class="link-btn" data-action="retry-save">${esc(t("save_retry"))}</button></p>`;
  }
  return "";
}

function updateSaveStatus() {
  const el = $("#saveStatus");
  if (el) el.innerHTML = saveStatusHTML();
}

async function submitResult() {
  if (!CONFIG.submitUrl || state.save.status === "sending" || state.save.status === "saved") return;

  state.save = { status: "sending", id: null, key: "", detail: "" };
  updateSaveStatus();

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const res = await fetch(CONFIG.submitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        name: state.name,
        email: state.email,
        lang: state.lang,
        role: state.role,
        path: state.path,
        idea: state.idea,
        answers: collectAnswers(),
      }),
    });
    let data = {};
    try { data = await res.json(); } catch { /* no JSON body */ }

    if (res.ok) {
      state.save = { status: "saved", id: data.id, key: "", detail: "" };
    } else if (res.status === 429) {
      state.save = { status: "error", id: null, key: "save_429", detail: "" };
    } else if (res.status === 400) {
      state.save = { status: "error", id: null, key: "save_400", detail: data.message || "" };
    } else {
      state.save = { status: "error", id: null, key: "save_500", detail: "" };
    }
  } catch {
    state.save = { status: "error", id: null, key: "save_net", detail: "" };
  } finally {
    clearTimeout(timer);
  }
  updateSaveStatus();
}

function downloadCheckCSV() {
  const ev = evaluate();
  const role = ROLES.find((r) => r.id === state.role);
  const path = PATHS.find((p) => p.id === state.path);
  let outcome;
  if (ev.stopped === null) {
    outcome = t("res_ok_h");
  } else {
    const row = ev.rows[ev.stopped];
    outcome = row.status === "unsure"
      ? tpl(t("res_wait_h"), { n: ev.stopped + 1, title: L(row.gate.title) })
      : tpl(t("res_stop_h"), { n: ev.stopped + 1, title: L(row.gate.title) });
  }
  const rows = [
    [t("csv_section"), t("csv_field"), t("csv_value")],
    [t("res_title"), t("res_name"), state.name],
    [t("res_title"), t("res_email"), state.email],
    [t("res_title"), t("res_idea"), state.idea],
    [t("res_title"), t("res_role"), role ? L(role.label) : state.role],
    [t("res_title"), t("res_path"), path ? L(path.label) : state.path],
    [t("res_title"), t("res_title"), outcome],
  ];

  ev.rows.forEach((row) => {
    rows.push([row.gate.id, t("csv_status"), t("st_" + row.status)]);
  });
  GATES.forEach((gate) => {
    questionsFor(gate).forEach((question) => {
      const answer = state.answers[answerKey(gate, question)];
      rows.push([
        gate.id,
        L(question.text),
        answer ? t("ans_" + answer) : "",
      ]);
    });
  });
  downloadCSV("check-your-idea.csv", rows);
}

/* Turn the result into a plain-text summary for the assistant (English, so it is consistent) */
function buildExplainPrompt() {
  const ev = evaluate();
  const role = ROLES.find((r) => r.id === state.role).label.en;
  const path = PATHS.find((p) => p.id === state.path).label.en;
  const names = { pass: "PASS", fail: "NEEDS WORK", unsure: "EVIDENCE MISSING", locked: "LOCKED (an earlier gate is not passed)" };
  const words = { yes: "Yes", no: "Not yet", unsure: "Not sure" };

  const lines = [
    "Here is my self-check with the five gates (answers are Yes / Not yet / Not sure).",
    `Role: ${role}`,
    `Type of idea: ${path}`,
    `Idea: "${state.idea}"`,
    "",
  ];
  ev.rows.forEach((r) => {
    lines.push(`${r.gate.id} ${r.gate.title.en}: ${names[r.status]}`);
    if (r.status !== "locked") {
      r.qs.forEach((q, i) => lines.push(`  - ${q.text.en} → ${words[r.vals[i]] || "no answer"}`));
    }
  });
  lines.push(
    "",
    "Please explain in simple words where I am stuck, why it matters, and give me 3 to 5 practical next steps I can take at my farm, collection point or mill."
  );
  return lines.join("\n");
}

/* =========================================================
   Load calculator (Gate 2 + Gate 3 in numbers)
   load [kg/day] = concentration [mg/L] x flow [m3/day] / 1000
   ========================================================= */
const val = (id) => {
  const raw = $(id).value.trim();
  if (raw === "") return NaN;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
};

function runCalc() {
  const flowB = val("#flowB"), codB = val("#codB"), errB = val("#errB");
  const flowA = val("#flowA"), codA = val("#codA"), errA = val("#errA");
  const extra = val("#kwhExtra") || 0;
  const saved = val("#kwhSaved") || 0;
  const ef = val("#ef");

  if ([flowB, codB, flowA, codA].some(Number.isNaN)) {
    state.lastCalc = { missing: true };
    renderCalc();
    return;
  }

  const loadB = (codB * flowB) / 1000;
  const loadA = (codA * flowA) / 1000;
  const delta = loadA - loadB;
  const uncertaintyB = Number.isNaN(errB) ? 0 : errB;
  const uncertaintyA = Number.isNaN(errA) ? 0 : errA;

  // Percentages are treated as standard uncertainties; k = 2 (about 95 %).
  const uB = loadB * (uncertaintyB / 100);
  const uA = loadA * (uncertaintyA / 100);
  const U = 2 * Math.sqrt(uB * uB + uA * uA);

  const kwhNet = extra - saved;
  const co2 = kwhNet * (Number.isNaN(ef) ? 0 : ef);

  state.lastCalc = {
    loadB, loadA, delta, U, flowB, flowA, codB, codA,
    errB: uncertaintyB, errA: uncertaintyA,
    extra, saved, ef: Number.isNaN(ef) ? 0 : ef,
    kwhNet, co2,
  };
  renderCalc();
}

function renderCalc() {
  const out = $("#calcOut");
  const c = state.lastCalc;
  if (!c) { out.innerHTML = ""; return; }
  if (c.missing) { out.innerHTML = `<p class="form-err">${esc(t("calc_missing"))}</p>`; return; }

  const verdict = calcVerdict(c);

  const notes = [];
  if (c.flowA < c.flowB && c.codA > c.codB) notes.push(t("n_shift"));
  if (c.codA < c.codB && c.delta >= 0) notes.push(t("n_dilution"));

  const energyUp = c.co2 > 0;
  out.innerHTML = `
    <dl class="load-list">
      <dt>${esc(t("r_before"))}</dt><dd>${nf(c.loadB, 0)} ${esc(t("unit_load"))}</dd>
      <dt>${esc(t("r_after"))}</dt><dd>${nf(c.loadA, 0)} ${esc(t("unit_load"))}</dd>
      <dt class="total">${esc(t("r_change"))}</dt><dd class="total">${signed(c.delta, 0)} ${esc(t("unit_load"))}</dd>
      <dt>${esc(t("r_unc"))}</dt><dd>± ${nf(c.U, 0)} ${esc(t("unit_load"))}</dd>
    </dl>
    <div class="verdict ${verdict.className}"><p>${esc(t(verdict.key))}</p></div>
    ${notes.map((n) => `<p class="note">${esc(n)}</p>`).join("")}
    <h4>${esc(t("e_title"))}</h4>
    <p>${esc(tpl(t("e_net"), { kwh: signed(c.kwhNet, 1), co2: signed(c.co2, 1) }))}</p>
    <p class="${energyUp ? "note" : ""}">${esc(energyUp ? t("e_up") : t("e_down"))}</p>
    <div class="btn-row"><button type="button" class="btn btn-ghost" data-action="download-calc">${esc(t("btn_download_calc"))}</button></div>`;
}

function calcVerdict(c) {
  if (c.delta < 0 && Math.abs(c.delta) > c.U) return { key: "v_clear", className: "ok" };
  if (c.delta < 0) return { key: "v_unclear", className: "wait" };
  return { key: "v_fail", className: "stop" };
}

function downloadCalcCSV() {
  const c = state.lastCalc;
  if (!c || c.missing) return;

  const verdict = calcVerdict(c);
  const r2 = (n) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : n);
  const rows = [
    [t("csv_section"), t("csv_field"), t("csv_value")],
    [t("c_before"), t("c_flow"), c.flowB],
    [t("c_before"), t("c_cod"), c.codB],
    [t("c_before"), t("c_err"), c.errB],
    [t("c_after"), t("c_flow"), c.flowA],
    [t("c_after"), t("c_cod"), c.codA],
    [t("c_after"), t("c_err"), c.errA],
    [t("e_title"), t("c_extra"), c.extra],
    [t("e_title"), t("c_saved"), c.saved],
    [t("e_title"), t("c_factor"), c.ef],
    [t("r_before"), t("unit_load"), r2(c.loadB)],
    [t("r_after"), t("unit_load"), r2(c.loadA)],
    [t("r_change"), t("unit_load"), r2(c.delta)],
    [t("r_unc"), t("unit_load"), r2(c.U)],
    [t("r_change"), t("r_verdict"), t(verdict.key)],
    [t("e_title"), t("r_energy"), tpl(t("e_net"), { kwh: r2(c.kwhNet), co2: r2(c.co2) })],
  ];
  downloadCSV("pollutant-load.csv", rows);
}

$("#calcOut").addEventListener("click", (e) => {
  if (e.target.closest('[data-action="download-calc"]')) downloadCalcCSV();
});

function fillPreset(p) {
  // Hypothetical scenarios from the paper (10 t fresh cherry per day)
  const set = (id, v) => { $(id).value = v; };
  set("#flowB", 150); set("#codB", 15000); set("#errB", 10);
  set("#flowA", 60);  set("#errA", 10);
  set("#kwhExtra", 55); set("#ef", 0.85);
  if (p === "A") { set("#codA", 40000); set("#kwhSaved", 0); }
  else { set("#codA", 18000); set("#kwhSaved", 27.65); }
  runCalc();
}

$("#calcForm").addEventListener("submit", (e) => { e.preventDefault(); runCalc(); });
$("#presetA").addEventListener("click", () => fillPreset("A"));
$("#presetB").addEventListener("click", () => fillPreset("B"));

/* =========================================================
   Assistant (Groq, streamed)
   ========================================================= */
class AppError extends Error {
  constructor(kind, status = 0, detail = "") {
    super(kind);
    this.kind = kind;
    this.status = status;
    this.detail = detail;
  }
}

function systemPrompt() {
  const lang =
    state.lang === "id"
      ? "Reply in simple everyday Bahasa Indonesia (bahasa sehari-hari), like talking to a neighbour. Avoid formal or academic words, unless the user writes in another language."
      : "Reply in clear, simple English unless the user writes in another language.";
  return `${SYSTEM_PROMPT}\n\nLANGUAGE: ${lang}`;
}

async function streamGroq(messages, onDelta, signal) {
  const key = getKey();
  if (!CONFIG.proxyUrl && !key) throw new AppError("no_key");

  const headers = { "Content-Type": "application/json" };
  if (key) headers.Authorization = `Bearer ${key}`;

  const res = await fetch(CONFIG.proxyUrl || CONFIG.endpoint, {
    method: "POST",
    headers,
    signal,
    body: JSON.stringify({
      model: getModel(),
      input: messages.map(({ role, content }) => ({ role, content })),
      stream: true,
    }),
  });

  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json())?.error?.message || ""; } catch { /* no JSON body */ }
    throw new AppError("http", res.status, detail);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop();
    for (const raw of lines) {
      const line = raw.trim();
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") return;
      try {
        const event = JSON.parse(data);
        const piece = event.type === "response.output_text.delta" ? event.delta : "";
        if (piece) onDelta(piece);
      } catch { /* ignore partial JSON */ }
    }
  }
}

function errorText(err) {
  if (err instanceof AppError) {
    if (err.kind === "no_key") return t("no_key");
    if (err.kind === "empty") return t("err_empty");
    if (err.kind === "http") {
      if (err.status === 401 || err.status === 403) return t("err_401");
      if (err.status === 429) return t("err_429");
      if (err.status === 404 || /model/i.test(err.detail)) {
        return t("err_model") + (err.detail ? ` (${err.detail})` : "");
      }
      return `${t("err_generic")} (${err.status}${err.detail ? ": " + err.detail : ""})`;
    }
  }
  if (err instanceof TypeError) return t("err_net");
  return `${t("err_generic")}: ${err.message || err}`;
}

/* Minimal, safe Markdown: paragraphs, lists, bold, inline code */
function inlineMd(s) {
  return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
}

function md(text) {
  const lines = text.replace(/\r/g, "").split("\n");
  let html = "";
  let list = null;
  let para = [];
  const flushPara = () => {
    if (para.length) { html += "<p>" + para.map(inlineMd).join("<br>") + "</p>"; para = []; }
  };
  const closeList = () => {
    if (list) { html += `</${list}>`; list = null; }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flushPara(); closeList(); continue; }
    if ((m = line.match(/^\s*[-*•]\s+(.*)/))) {
      flushPara();
      if (list !== "ul") { closeList(); html += "<ul>"; list = "ul"; }
      html += `<li>${inlineMd(m[1])}</li>`;
      continue;
    }
    if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) {
      flushPara();
      if (list !== "ol") { closeList(); html += "<ol>"; list = "ol"; }
      html += `<li>${inlineMd(m[1])}</li>`;
      continue;
    }
    if ((m = line.match(/^#{1,4}\s+(.*)/))) {
      flushPara(); closeList();
      html += `<p><strong>${inlineMd(m[1])}</strong></p>`;
      continue;
    }
    closeList();
    para.push(line);
  }
  flushPara();
  closeList();
  return html;
}

/* Chat UI */
const chatLog = $("#chatLog");
const chatInput = $("#chatInput");
const sendBtn = $("#sendBtn");

function addMsg(role, html, extraClass = "") {
  const div = document.createElement("div");
  div.className = `msg ${role} ${extraClass}`.trim();
  div.innerHTML = `<div class="body">${html}</div>`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
  return div;
}

function renderWelcome() {
  if (state.history.length > 0) return;
  if (state.welcomeEl) state.welcomeEl.remove();
  state.welcomeEl = addMsg("assistant", `<p>${esc(t("welcome"))}</p>`);
  chatLog.prepend(state.welcomeEl);
}

function setBusy(busy) {
  state.streaming = busy;
  sendBtn.textContent = busy ? t("btn_stop") : t("btn_send");
  chatInput.disabled = busy;
}

async function sendMessage(displayText, apiText = displayText) {
  displayText = displayText.trim();
  if (!displayText || state.streaming) return;

  addMsg("user", `<p>${esc(displayText)}</p>`);

  if (!CONFIG.proxyUrl && !getKey()) {
    addMsg("assistant", `<p>${esc(t("no_key"))}</p>`, "error");
    openSettings();
    return;
  }

  state.history.push({ role: "user", content: apiText });
  const pending = addMsg("assistant", "", "pending");
  const body = $(".body", pending);
  let acc = "";

  state.abort = new AbortController();
  setBusy(true);

  try {
    let recent = state.history.slice(-CONFIG.maxHistory);
    while (recent.length && recent[0].role !== "user") recent = recent.slice(1);
    const messages = [{ role: "system", content: systemPrompt() }, ...recent];

    await streamGroq(
      messages,
      (piece) => {
        acc += piece;
        body.innerHTML = md(acc);
        chatLog.scrollTop = chatLog.scrollHeight;
      },
      state.abort.signal
    );

    if (!acc.trim()) throw new AppError("empty");
    state.history.push({ role: "assistant", content: acc });
  } catch (err) {
    if (err.name === "AbortError") {
      if (acc.trim()) state.history.push({ role: "assistant", content: acc });
      else { state.history.pop(); pending.remove(); }
    } else {
      state.history.pop();
      pending.classList.add("error");
      body.innerHTML = `<p>${esc(errorText(err))}</p>`;
    }
  } finally {
    pending.classList.remove("pending");
    state.abort = null;
    setBusy(false);
    if (document.activeElement === document.body) chatInput.focus({ preventScroll: true });
  }
}

$("#chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (state.streaming) { state.abort?.abort(); return; }
  const text = chatInput.value;
  chatInput.value = "";
  sendMessage(text);
});

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    $("#chatForm").requestSubmit();
  }
});

$("#suggest").addEventListener("click", (e) => {
  const b = e.target.closest("[data-prompt]");
  if (b) sendMessage(b.dataset.prompt);
});

$("#clearChat").addEventListener("click", () => {
  state.abort?.abort();
  state.history = [];
  chatLog.innerHTML = "";
  state.welcomeEl = null;
  renderWelcome();
});

/* =========================================================
   Settings dialog
   ========================================================= */
const dialog = $("#settings");

function updateKeyState() {
  const btn = $("#keyState");
  btn.textContent = CONFIG.proxyUrl ? t("key_proxy") : getKey() ? t("key_set") : t("key_unset");
  btn.disabled = Boolean(CONFIG.proxyUrl);
}

function openSettings() {
  $("#apiKey").value = getKey();
  $("#modelName").value = getModel();
  $("#rememberKey").checked = Boolean(store.get(CONFIG.storage.key));
  if (typeof dialog.showModal === "function") dialog.showModal();
}

$("#openSettings").addEventListener("click", openSettings);
$("#keyState").addEventListener("click", openSettings);

$("#settingsForm").addEventListener("submit", (e) => {
  if (e.submitter?.value !== "save") return;
  const key = $("#apiKey").value.trim();
  const model = $("#modelName").value.trim() || CONFIG.defaultModel;
  store.del(CONFIG.storage.key);
  if (key) store.set(CONFIG.storage.key, key, !$("#rememberKey").checked);
  store.set(CONFIG.storage.model, model);
  updateKeyState();
});

/* =========================================================
   Language
   ========================================================= */
function applyLang() {
  document.documentElement.lang = state.lang;
  document.title = t("doc_title");

  $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
  $$("[data-i18n-placeholder]").forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  $$("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
  $$(".lang-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));

  renderHeroGates();
  renderGatePath();
  renderActors();
  renderSuggest();
  renderWizard(false);
  renderCalc();
  renderWelcome();
  updateKeyState();
  sendBtn.textContent = state.streaming ? t("btn_stop") : t("btn_send");
}

$$(".lang-btn").forEach((b) =>
  b.addEventListener("click", () => {
    state.lang = b.dataset.lang;
    store.set(CONFIG.storage.lang, state.lang);
    applyLang();
  })
);

/* ---------- Start ---------- */
(function init() {
  const saved = store.get(CONFIG.storage.lang);
  state.lang = saved === "en" || saved === "id" ? saved : "id";
  $("#brandGlyph").innerHTML = glyph(false);
  applyLang();
})();
