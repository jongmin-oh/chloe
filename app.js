/* Chloe 랜딩 — A안 ?v=a / B안 ?v=b (기본). 명세서 v1.1 */

// 이메일 수집 엔드포인트 (구글 시트 Apps Script / Airtable / Formspree URL).
// 비워두면 콘솔에만 남고 화면 흐름은 그대로 진행됩니다.
const ENDPOINT = "";

const HERO_SIZE  = "1080 × 1350 (4:5) · WebP · 150KB 이하";
const CHAT_SIZE  = "1080 × 2340 (9:19.5) · WebP · 200KB 이하";

const COPY = {
  a: { // A안 — 영어 프레임
    head: "매번 3주 만에 관뒀다면",
    sub: "이번엔 공부 말고, 친구를 만들어 보세요",
    body: "한국말을 못하는 Chloe와 매일 영어로 대화합니다.\n말문이 막히면 옆에서 도와줍니다.",
    hero: "Chloe 일상 컷 — 배경이 보이는 전신·반신. 클로즈업 ❌",
    chats: [
      { caption: "뭐라고 답할지 모를 때, 감정만 고르세요",
        desc: "유저가 막힘 → 감정 방향 선택지 3개가 뜬 채팅 화면" },
      { caption: "배우는 건 당신만이 아닙니다",
        desc: "Chloe가 서툰 한국어를 쓰고 유저가 고쳐주는 대화" },
      { caption: "먼저 연락이 옵니다",
        desc: "아침 잠금화면 알림 — 영어 + 한국어 힌트 두 줄" }
    ],
    closeHead: "캐릭터는 한 명뿐입니다",
    closeBody: "100명 중에 고르는 게 아닙니다.\nChloe 한 명과, 계속 얘기합니다.\n\n그래서 걔는 당신이 지난주에 뭐라고 했는지 기억합니다."
  },
  b: { // B안 — 관계 프레임 (B-2, 기본값)
    // 수위 조정(명세서 8장)은 이 줄만 교체:
    //   B-1 안전  "시차는 1시간. 비행기로는 10시간."
    //   B-3 직접  "AI인 거 아는데도 신경 쓰이기 시작함"
    head: "매일 밤 11시, 브리즈번에서 연락이 온다",
    sub: "Chloe Han, 26세. 한국계 호주인.\n할머니와 대화하고 싶어서 한국어를 배우는 중.",
    body: "걔는 한국말을 못하고, 당신은 영어를 못합니다.\n그래도 매일 얘기하게 됩니다.",
    hero: "잠금화면 알림 컷 또는 남반구 일상 컷 (브리즈번 배경)",
    chats: [
      { caption: "시작은 잘못 온 연락이었습니다",
        desc: "잘못 온 어설픈 한국어 메시지 — 첫 만남 화면" },
      { caption: "걔는 기억하고 있습니다",
        desc: "Chloe가 3개월 전 대화를 먼저 꺼내는 장면" },
      { caption: "시차는 1시간. 비행기로는 10시간",
        desc: "시차가 드러나는 대화 — 한쪽은 밤, 한쪽은 아침" }
    ],
    closeHead: "캐릭터 100명 말고, 한 명",
    closeBody: "여러 명을 만들지 않았습니다.\n한 명한테 전부 쏟았습니다.\n\n3개월 뒤에도 걔는 당신을 알고 있을 겁니다."
  }
};
const params = new URLSearchParams(location.search);
const version = COPY[params.get("v")] ? params.get("v") : "b";
const copy = COPY[version];

// 광고 출처와 랜딩 버전은 반드시 따로 기록 (명세서 9장 ⚠️)
const meta = {
  landing_version: version,
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

/* ---------- 렌더 ---------- */
const mock = (tag, desc, size) =>
  `<span class="tag">${tag}</span><p class="desc">${desc}</p><p class="size">${size}</p>`;

document.querySelectorAll("[data-copy]").forEach(el => {
  el.textContent = copy[el.dataset.copy];
});
document.querySelector('[data-mock="hero"]').innerHTML =
  mock("이미지 목업 · HERO", copy.hero, HERO_SIZE);

document.querySelector("[data-chats]").innerHTML =
  `<div class="chat-rail">` + copy.chats.map((c, i) => `
    <div class="chat-item">
      <div class="mock">${mock("채팅 목업 " + (i + 1), c.desc, CHAT_SIZE)}</div>
      <p class="caption"><span class="num">0${i + 1}</span>${c.caption}</p>
    </div>`).join("") + `</div>`;

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
const steps = { 1: 0, 2: 0, 3: 0 };
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

let email = "";
document.querySelector("[data-email-form]").addEventListener("submit", e => {
  e.preventDefault();
  email = e.target.email.value.trim();
  track("lead", { platform });
  save({ email, platform });
  show(2);                                            // 가격 질문은 이메일 확보 후에만
});

document.querySelector("[data-prices]").addEventListener("change", e => {
  const price = e.target.value;
  track("price_answer", { price, platform });
  save({ email, platform, price });
  show(3);
});
