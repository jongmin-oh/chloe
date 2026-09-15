/* Chloe 랜딩 — 공통 스크립트. 카피는 a.html / b.html 안에 직접 들어 있습니다. */

// 이메일 수집 엔드포인트 (구글 시트 Apps Script / Airtable / Formspree URL).
// 비워두면 콘솔에만 남고 화면 흐름은 그대로 진행됩니다.
const ENDPOINT = "https://script.google.com/macros/s/AKfycbzH-GXYe8W4wyGLdxa8gQJW9WcO1nsaa60BnkDK5mWKIt8xcWGSulmtljB2uIdnfq2T/exec";

const params = new URLSearchParams(location.search);

// 광고 출처와 랜딩 버전은 반드시 따로 기록 (명세서 9장 ⚠️)
const meta = {
  landing_version: document.body.dataset.version,     // a.html → "a", b.html → "b"
  ad_source: params.get("src") || params.get("utm_content") || params.get("utm_campaign") || "",
  utm_source: params.get("utm_source") || ""
};

function track(event, data = {}) {
  const payload = { ...meta, ...data };
  if (window.fbq) fbq("trackCustom", event, payload);
  if (window.gtag) gtag("event", event, payload);
  (window.dataLayer = window.dataLayer || []).push({ event, ...payload });
  console.log("[track]", event, payload);
}

/* ---------- 이벤트 ---------- */
track("page_view");

const fired = new Set();
addEventListener("scroll", () => {
  const max = document.body.scrollHeight - innerHeight;
  const pct = max > 0 ? scrollY / max : 1;
  for (const [name, at] of [["scroll_50", .5], ["scroll_100", .95]]) {
    if (pct >= at && !fired.has(name)) { fired.add(name); track(name); }
  }
}, { passive: true });

/* ---------- 모달 ---------- */
const overlay = document.querySelector("[data-overlay]");
const steps = { 1: 0, 2: 0 };
for (const n in steps) steps[n] = document.querySelector(`[data-step="${n}"]`);
let platform = "";

function show(n) {
  for (const k in steps) steps[k].hidden = k !== String(n);
}
function openModal() {
  show(1);
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  steps[1].querySelector("input").focus({ preventScroll: true });
}
function closeModal() {
  overlay.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-download]").forEach(btn => {
  btn.addEventListener("click", () => {
    platform = btn.dataset.download;                 // ios | android
    track("download_click", { platform });
    openModal();
  });
});

document.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", closeModal));
overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
addEventListener("keydown", e => { if (e.key === "Escape" && !overlay.hidden) closeModal(); });

// 저장은 실패해도 화면 흐름을 막지 않음 (리드는 이미 잡힌 것으로 간주)
function save(data) {
  if (!ENDPOINT) return console.log("[save]", data);
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // preflight 회피
    body: JSON.stringify({ ...meta, ...data, ts: new Date().toISOString() })
  }).catch(err => console.warn("[save failed]", err));
}

document.querySelector("[data-email-form]").addEventListener("submit", e => {
  e.preventDefault();
  track("lead", { platform });
  save({ email: e.target.email.value.trim(), platform });
  show(2);
});

/* ---------- FAQ ---------- */
// 어떤 질문이 실제로 궁금한지가 카피 개선의 재료가 됩니다.
document.querySelectorAll(".faq details").forEach(d => {
  d.addEventListener("toggle", () => {
    if (d.open) track("faq_open", { question: d.querySelector("summary").textContent.trim() });
  });
});
