/* Chloe 랜딩 — A안 ?v=a / B안 ?v=b (기본). 명세서 v1.1 */

// 이메일 수집 엔드포인트 (구글 시트 Apps Script / Airtable / Formspree URL).
// 비워두면 콘솔에만 남고 화면 흐름은 그대로 진행됩니다.
const ENDPOINT = "";

const HERO_SIZE  = "1080 × 1350 (4:5) · WebP · 150KB 이하";
const CHAT_SIZE  = "1080 × 2340 (9:19.5) · WebP · 200KB 이하";

const COPY = {
  a: { // A안 — 영어 프레임
    head: "영어 공부, 매번 한 달을 못 넘겼다면",
    sub: "이번엔 공부 말고, 진짜 대화할 친구를 만들어보세요",
    body: "한국말이 서툰 Chloe와 매일 영어로 이야기해요.\n말문이 막혀도 괜찮아요. Chloe가 곁에서 도와줄게요.",
    hero: "Chloe 일상 컷 — 배경이 보이는 전신·반신. 클로즈업 ❌",
    chats: [
      { caption: "뭐라고 답할지 모를 때, 감정만 톡 골라보세요",
        desc: "유저가 막힘 → 감정 방향 선택지 3개가 뜬 채팅 화면" },
      { caption: "나만 배우는 게 아니에요, Chloe도 한국어를 배워요",
        desc: "Chloe가 서툰 한국어를 쓰고 유저가 고쳐주는 대화" },
      { caption: "기다리지 않아도, 먼저 안부를 물어와요",
        desc: "아침 잠금화면 알림 — 영어 + 한국어 힌트 두 줄" }
    ],
    closeHead: "캐릭터 100명 대신, 단 한 사람",
    closeBody: "수많은 캐릭터 중에서 고르는 게 아니에요.\nChloe 한 명과 매일 대화를 쌓아갑니다.\n\n지난주에 내가 무심코 했던 말까지, Chloe는 전부 기억하고 있거든요."
  },
  b: { // B안 — 관계 프레임 (B-2, 기본값)
    // 수위 조정(명세서 8장)은 이 줄만 교체:
    //   B-1 안전  "시차는 1시간. 비행기로는 10시간."
    //   B-3 직접  "AI인 거 아는데도, 자꾸 신경 쓰이기 시작해요"
    head: "매일 밤 11시, 브리즈번에서 연락이 와요",
    sub: "Chloe Han, 26세. 한국계 호주인.\n할머니와 이야기하고 싶어서 한국어를 배우기 시작했대요.",
    body: "Chloe는 한국말이 서툴고, 우리는 영어가 낯설지만\n이상하게 매일 밤 대화가 끊이지 않아요.",
    hero: "잠금화면 알림 컷 또는 남반구 일상 컷 (브리즈번 배경)",
    chats: [
      { caption: "시작은 잘못 보낸 어설픈 한국어 메시지였어요",
        desc: "잘못 온 어설픈 한국어 메시지 — 첫 만남 화면" },
      { caption: "Chloe는 우리가 나눈 사소한 일상도 다 기억해요",
        desc: "Chloe가 3개월 전 대화를 먼저 꺼내는 장면" },
      { caption: "시차는 1시간. 비행기로는 10시간",
        desc: "시차가 드러나는 대화 — 한쪽은 밤, 한쪽은 아침" }
    ],
    closeHead: "캐릭터 100명 말고, 오직 한 사람",
    closeBody: "수많은 캐릭터를 늘리지 않았어요.\n오직 한 사람과의 관계에 온전히 집중했습니다.\n\n3개월이 지나도, Chloe는 나를 가장 잘 아는 친구로 남아있을 거예요."
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

let email = "";
document.querySelector("[data-email-form]").addEventListener("submit", e => {
  e.preventDefault();
  email = e.target.email.value.trim();
  track("lead", { platform });
  save({ email, platform });
  show(2);
});
