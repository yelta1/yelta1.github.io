// ====== НАСТРОЙКИ ======
// Твой номер WhatsApp в международном формате без "+" и пробелов, например 77011234567.
// Если оставить пустым, ответ скопируется в буфер и откроется Telegram/WhatsApp на выбор.
const MY_WHATSAPP = "";
// ========================

const answers = { arrive: null, food: null, watch: null };
let current = 0;

function goTo(step) {
  document.querySelector(`.step[data-step="${current}"]`).classList.remove('active');
  current = step;
  document.querySelector(`.step[data-step="${current}"]`).classList.add('active');
  burstHearts(6);
}
const next = () => goTo(current + 1);

// Сердечки на фоне
const heartsBox = document.getElementById('hearts');
const heartChars = ['💖', '💕', '💗', '❤️', '🌸'];
function spawnHeart() {
  const h = document.createElement('span');
  h.className = 'heart';
  h.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = 14 + Math.random() * 22 + 'px';
  h.style.animationDuration = 6 + Math.random() * 6 + 's';
  heartsBox.appendChild(h);
  setTimeout(() => h.remove(), 13000);
}
function burstHearts(n) { for (let i = 0; i < n; i++) setTimeout(spawnHeart, i * 80); }
setInterval(spawnHeart, 700);

// 0 → 1 конверт
document.getElementById('envelope').addEventListener('click', next);

// 1. Кнопка "Нет" убегает
const noBtn = document.getElementById('noBtn');
const noTexts = ['Нет', 'Точно?', 'Подумай ещё 🥺', 'Ну пожааалуйста', 'Не-а, не поймаешь 😜', 'Нажми лучше «Да»'];
let noCount = 0;
function runAway() {
  noCount++;
  noBtn.textContent = noTexts[Math.min(noCount, noTexts.length - 1)];
  noBtn.style.position = 'fixed';
  const maxX = window.innerWidth - noBtn.offsetWidth - 16;
  const maxY = window.innerHeight - noBtn.offsetHeight - 16;
  noBtn.style.left = Math.max(16, Math.random() * maxX) + 'px';
  noBtn.style.top = Math.max(16, Math.random() * maxY) + 'px';
  noBtn.style.zIndex = 10;
  // "Да" растёт с каждой попыткой
  const yes = document.getElementById('yesBtn');
  yes.style.transform = `scale(${1 + Math.min(noCount, 6) * 0.12})`;
}
noBtn.addEventListener('mouseenter', runAway);
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); runAway(); }, { passive: false });
noBtn.addEventListener('click', runAway);

document.getElementById('yesBtn').addEventListener('click', () => {
  noBtn.style.display = 'none';
  burstHearts(25);
  next();
});

// 2. Сможет ли приехать
document.querySelectorAll('[data-arrive]').forEach(btn => {
  btn.addEventListener('click', () => {
    answers.arrive = btn.dataset.arrive;
    if (answers.arrive === 'yes') return next();
    document.getElementById('arriveHint').hidden = false;
    document.getElementById('arriveNext').hidden = false;
  });
});
document.getElementById('arriveNext').addEventListener('click', next);

// 3. Прогулка
document.querySelectorAll('[data-next]').forEach(b => b.addEventListener('click', next));

// 4. Еда
document.querySelectorAll('[data-food]').forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.map-link')) return; // ссылка на карту не выбирает вариант
    answers.food = card.dataset.food;
    next();
  });
});

// 5. Фильм / сериал
document.querySelectorAll('[data-watch]').forEach(btn => {
  btn.addEventListener('click', () => {
    answers.watch = btn.dataset.watch;
    buildPlan();
    burstHearts(30);
    next();
  });
});

// 6. Итог
const foodNames = {
  cu: 'CU — раменчик и кимпаб',
  ksf: 'Korean Street Food у ЦУМа (Абылай хана, 59/61)'
};

function buildPlan() {
  const meet = answers.arrive === 'yes'
    ? '<b>17:00–18:00</b> — после учёбы едешь ко мне на работу, в 18:00 выхожу'
    : '<b>Встреча</b> — договоримся, где и во сколько 💬';
  const items = [
    meet,
    '<b>Прогулка</b> — по аллее рядом',
    `<b>Ужин</b> — ${foodNames[answers.food]}`,
    `<b>Вечер</b> — в машине у твоего дома смотрим ${answers.watch === 'на твой выбор' ? 'сюрприз 🤫' : answers.watch}`
  ];
  document.getElementById('plan').innerHTML = items.map(i => `<li>${i}</li>`).join('');
}

function messageText() {
  return [
    'Да, я иду на свидание 4 ноября! 💖',
    answers.arrive === 'yes' ? 'После учёбы приеду к тебе на работу.' : 'К тебе на работу приехать не получится, давай договоримся о встрече.',
    `Кушать хочу: ${foodNames[answers.food]}.`,
    `Смотрим: ${answers.watch}.`
  ].join('\n');
}

document.getElementById('sendBtn').addEventListener('click', async () => {
  const text = encodeURIComponent(messageText());
  if (MY_WHATSAPP) {
    window.open(`https://wa.me/${MY_WHATSAPP}?text=${text}`, '_blank');
    return;
  }
  try {
    await navigator.clipboard.writeText(messageText());
    alert('Ответ скопирован! Отправь его мне 💌');
  } catch {
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
});
