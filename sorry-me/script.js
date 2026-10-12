// ==========================================================
//  НАСТРОЙКИ — меняй тексты здесь, остальное трогать не нужно
// ==========================================================
const CONFIG = {
  herName: "Солнце",          // как к ней обращаться на первом экране
  catchGoal: 10,              // сколько сердечек поймать на 1 уровне

  // correct: номер правильного ответа (с 0), или -1 = все ответы верные
  quiz: [
    {
      q: "Кто самая красивая девушка на свете?",
      a: ["Ты", "Ты 😍", "Конечно же ты", "Без вариантов — ты"],
      correct: -1,
      yes: "Все ответы верные, потому что это правда 💖",
    },
    {
      q: "Что мне нравится больше: кино или ты?",
      a: ["Кино 🎬", "Ты, конечно 😏"],
      correct: 1,
      yes: "Конечно ты. Никакое кино не сравнится",
      no: "Ошибка! Даже близко нет 😤",
    },
    {
      q: "Кто сегодня выбирает, во что мы играем?",
      a: ["Я", "Ты 👑"],
      correct: 1,
      yes: "Именно! Сегодня командуешь ты",
      no: "Неправильно, сегодня твоя очередь 😌",
    },
    {
      q: "Сколько я тебя люблю?",
      a: ["Немножко", "Сильно", "Очень сильно", "Бесконечно ♾️"],
      correct: 3,
      yes: "Вот теперь правильно 💞",
      no: "Маловато! Бери больше 😄",
    },
  ],

  letter:
    "Прости, что предложил кино, когда ты хотела поиграть. Я заметил, что ты расстроилась.\n" +
    "Поэтому вот — целая игра, сделанная специально для тебя.\n" +
    "Ты самая лучшая 💖",

  coupon: "Вечер игр: играем во что ты захочешь и сколько захочешь. Без кино 🎮",
};
// ==========================================================

const $ = (s) => document.querySelector(s);

/* ---------- переходы между экранами ---------- */
function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $("#" + id).classList.add("active");
  if (id === "s-quiz") startQuiz();
  if (id === "s-final") startFinal();
}
document.querySelectorAll("[data-next]").forEach((b) => (b.onclick = () => show(b.dataset.next)));
$("#startTitle").textContent = `Привет, ${CONFIG.herName}!`;

/* ---------- сердечки на фоне ---------- */
const bg = $("#bgHearts");
setInterval(() => {
  const h = document.createElement("span");
  h.textContent = ["💖", "💕", "💗", "✨", "🎀"][(Math.random() * 5) | 0];
  h.style.left = Math.random() * 100 + "vw";
  h.style.fontSize = 14 + Math.random() * 20 + "px";
  h.style.animationDuration = 6 + Math.random() * 6 + "s";
  bg.appendChild(h);
  setTimeout(() => h.remove(), 12500);
}, 700);

/* ---------- Уровень 1: поймай сердечки ---------- */
const field = $("#field"), basket = $("#basket"), overlay = $("#overlay");
$("#goal").textContent = CONFIG.catchGoal;
let game = { running: false, drops: [] };
let overlayAction = startCatch;
$("#playBtn").onclick = () => overlayAction();

function moveBasket(clientX) {
  const r = field.getBoundingClientRect();
  const x = Math.max(26, Math.min(r.width - 26, clientX - r.left));
  basket.style.left = x + "px";
}
field.addEventListener("pointermove", (e) => moveBasket(e.clientX));
field.addEventListener("pointerdown", (e) => moveBasket(e.clientX));

function showOverlay(msg, btn, action) {
  $("#overlayMsg").textContent = msg;
  $("#playBtn").textContent = btn;
  overlayAction = action;
  overlay.classList.remove("hidden");
}

function updHud() {
  $("#score").textContent = `${game.score} / ${CONFIG.catchGoal}`;
  $("#lives").textContent = "❤️".repeat(game.lives) + "🤍".repeat(3 - game.lives);
}

function startCatch() {
  overlay.classList.add("hidden");
  field.querySelectorAll(".drop").forEach((d) => d.remove());
  game = { score: 0, lives: 3, drops: [], last: performance.now(), spawn: 0.3, running: true };
  updHud();
  requestAnimationFrame(tick);
}

function spawnDrop() {
  const bad = Math.random() < 0.25;
  const el = document.createElement("div");
  el.className = "drop";
  el.textContent = bad ? "💔" : ["💖", "💗", "💕", "💝"][(Math.random() * 4) | 0];
  field.appendChild(el);
  const w = field.clientWidth;
  game.drops.push({ el, bad, x: Math.random() * (w - 34), y: -34, v: 120 + Math.random() * 80 + game.score * 6 });
}

function removeDrop(d) {
  d.el.remove();
  game.drops = game.drops.filter((x) => x !== d);
}

function tick(now) {
  if (!game.running) return;
  const dt = Math.min(50, now - game.last) / 1000;
  game.last = now;

  game.spawn -= dt;
  if (game.spawn <= 0) { spawnDrop(); game.spawn = 0.55 + Math.random() * 0.4; }

  const fr = field.getBoundingClientRect();
  const br = basket.getBoundingClientRect();
  for (const d of [...game.drops]) {
    d.y += d.v * dt;
    d.el.style.transform = `translate(${d.x}px, ${d.y}px)`;
    const cx = fr.left + d.x + 16, cy = fr.top + d.y + 16;
    if (cy > br.top && cy < br.bottom && cx > br.left - 6 && cx < br.right + 6) {
      removeDrop(d);
      if (d.bad) {
        game.lives--;
        field.classList.remove("hit"); void field.offsetWidth; field.classList.add("hit");
      } else {
        game.score++;
      }
      updHud();
      if (game.score >= CONFIG.catchGoal) {
        game.running = false;
        showOverlay("Ура! Все сердечки твои 💖", "Дальше ▶", () => show("s-quiz"));
        return;
      }
      if (game.lives <= 0) {
        game.running = false;
        showOverlay("Упс, сердечко разбилось 💔 Но я не сдаюсь!", "Ещё разок", startCatch);
        return;
      }
    } else if (d.y > fr.height) {
      removeDrop(d);
    }
  }
  requestAnimationFrame(tick);
}

/* ---------- Уровень 2: викторина ---------- */
let qi = 0, locked = false;
function startQuiz() { qi = 0; renderQ(); }

function renderQ() {
  const q = CONFIG.quiz[qi];
  locked = false;
  $("#qTitle").textContent = q.q;
  $("#feedback").textContent = "";
  const box = $("#answers");
  box.innerHTML = "";
  q.a.forEach((t, i) => {
    const b = document.createElement("button");
    b.className = "btn answer";
    b.textContent = t;
    b.onclick = () => pick(i, b);
    box.appendChild(b);
  });
  $("#dots").innerHTML = CONFIG.quiz.map((_, i) => `<i class="${i <= qi ? "on" : ""}"></i>`).join("");
}

function pick(i, b) {
  if (locked) return;
  const q = CONFIG.quiz[qi];
  if (q.correct === -1 || q.correct === i) {
    locked = true;
    b.classList.add("right");
    $("#feedback").textContent = q.yes || "Правильно! 💖";
    setTimeout(() => (++qi < CONFIG.quiz.length ? renderQ() : show("s-forgive")), 1300);
  } else {
    b.classList.remove("wrong"); void b.offsetWidth; b.classList.add("wrong");
    $("#feedback").textContent = q.no || "Неа 😜 Попробуй ещё";
  }
}

/* ---------- Уровень 3: убегающая кнопка «Нет» ---------- */
const zone = $("#zone"), noBtn = $("#noBtn"), yesBtn = $("#yesBtn");
const noPhrases = [
  "Точно нет? 🥺",
  "Ну пожааалуйста",
  "Я принесу вкусняшки 🍫",
  "Кнопка «Нет» не работает 🙈",
  "Сопротивление бесполезно 😌",
  "Последний шанс сказать «Да» 💕",
];
let noCount = 0;

function runAway(e) {
  e.preventDefault();
  noCount++;
  if (noCount > noPhrases.length) {
    noBtn.style.display = "none";
    $("#noText").textContent = "Кнопка «Нет» сбежала насовсем 😌";
    return;
  }
  const z = zone.getBoundingClientRect(), b = noBtn.getBoundingClientRect();
  noBtn.style.left = Math.random() * (z.width - b.width) + "px";
  noBtn.style.top = Math.random() * (z.height - b.height) + "px";
  $("#noText").textContent = noPhrases[noCount - 1];
  yesBtn.style.transform = `scale(${Math.min(1.8, 1 + noCount * 0.13)})`;
}
noBtn.addEventListener("pointerenter", runAway);
noBtn.addEventListener("pointerdown", runAway);
noBtn.addEventListener("click", runAway);

yesBtn.onclick = () => { confetti(); setTimeout(() => show("s-final"), 400); };

/* ---------- Финал ---------- */
let typer;
function startFinal() {
  confetti();
  $("#couponText").textContent = CONFIG.coupon;
  const el = $("#letter"), t = CONFIG.letter;
  let i = 0;
  el.textContent = "";
  clearInterval(typer);
  typer = setInterval(() => {
    el.textContent = t.slice(0, ++i);
    if (i >= t.length) clearInterval(typer);
  }, 35);
}

$("#again").onclick = () => {
  noCount = 0;
  noBtn.style.display = "";
  noBtn.style.left = noBtn.style.top = "";
  yesBtn.style.transform = "";
  $("#noText").textContent = "";
  showOverlay("Готова?", "Играть ▶", startCatch);
  show("s-start");
};

/* ---------- Конфетти ---------- */
const cv = $("#confetti"), ctx = cv.getContext("2d");
let parts = [], confettiOn = false;

function resize() {
  const r = window.devicePixelRatio || 1;
  cv.width = innerWidth * r;
  cv.height = innerHeight * r;
  ctx.setTransform(r, 0, 0, r, 0, 0);
}
resize();
addEventListener("resize", resize);

function confetti() {
  const colors = ["#ff6b9d", "#ffc2d6", "#ffd166", "#a0e7e5", "#b4a7ff"];
  for (let i = 0; i < 160; i++) {
    parts.push({
      x: innerWidth / 2, y: innerHeight / 3,
      vx: (Math.random() - 0.5) * 14, vy: -4 - Math.random() * 12,
      s: 5 + Math.random() * 6, c: colors[i % colors.length],
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
    });
  }
  if (!confettiOn) { confettiOn = true; requestAnimationFrame(drawConfetti); }
}

function drawConfetti() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.y < innerHeight + 20);
  for (const p of parts) {
    p.vy += 0.3; p.vx *= 0.99;
    p.x += p.vx; p.y += p.vy; p.r += p.vr;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
    ctx.restore();
  }
  if (parts.length) requestAnimationFrame(drawConfetti);
  else { confettiOn = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
}
