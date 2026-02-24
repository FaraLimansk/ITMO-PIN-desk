// ============================================================
// DATA
// Each section has: label, weight (баллов из 100), items[]
// item.score = raw score (0–item.max), displayed as contribution to weight
// Exam is always 20 points
// ============================================================
const subjects = [
  {
    id: 1, color: '#0033A0',
    name: 'Алгоритмы и структуры данных',
    teacher: 'Смирнов Д.В.',
    sections: [
      {
        key: 'labs', label: '🔬 Лабораторные работы', weight: 40,
        items: [
          { name: 'Лаб. №1 — Сортировки',                   date: 'Сдана 10 фев',    score: 38,   max: 40, status: 'done' },
          { name: 'Лаб. №2 — Обходы графов',                date: 'Сдана 17 фев',    score: 32,   max: 40, status: 'done' },
          { name: 'Лаб. №3 — Динамическое программирование',date: 'Дедлайн 28 фев',  score: null, max: 40, status: 'pend' },
          { name: 'Лаб. №4 — Жадные алгоритмы',            date: 'Откроется 5 мар', score: null, max: 40, status: 'future'},
        ]
      },
      {
        key: 'ctrl', label: '📝 Контрольные работы', weight: 40,
        items: [
          { name: 'Контрольная №1 — Теория графов',         date: 'Написана 5 фев',  score: 35,   max: 40, status: 'done' },
          { name: 'Контрольная №2 — Динамика',              date: '28 февраля',      score: null, max: 40, status: 'pend' },
        ]
      },
      {
        key: 'exam', label: '🎓 Экзамен', weight: 20,
        items: [
          { name: 'Экзамен по дисциплине', date: 'Сессия — июнь 2026', score: null, max: 20, status: 'future' },
        ]
      },
    ],
    attendance: [1,1,1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,null,null,null,null],
  },
  {
    id: 2, color: '#0A6B3A',
    name: 'Математический анализ',
    teacher: 'Петрова Е.А.',
    sections: [
      {
        key: 'hw',   label: '📋 Домашние задания', weight: 30,
        items: [
          { name: 'ДЗ №1', date: 'Сдано 3 фев',     score: 28, max: 30, status: 'done' },
          { name: 'ДЗ №2', date: 'Сдано 10 фев',    score: 25, max: 30, status: 'done' },
          { name: 'ДЗ №3', date: 'Сдано 17 фев',    score: 29, max: 30, status: 'done' },
          { name: 'ДЗ №4', date: 'Дедлайн 24 фев',  score: null, max: 30, status: 'pend' },
        ]
      },
      {
        key: 'ctrl', label: '📝 Контрольные работы', weight: 50,
        items: [
          { name: 'КР №1 — Пределы и производные', date: 'Написана 1 фев',  score: 44, max: 50, status: 'done' },
          { name: 'КР №2 — Интегралы',             date: 'Написана 14 фев', score: 47, max: 50, status: 'done' },
          { name: 'КР №3 — Ряды',                  date: '10 мар',          score: null, max: 50, status: 'pend' },
        ]
      },
      {
        key: 'exam', label: '🎓 Зачёт', weight: 20,
        items: [
          { name: 'Зачёт по мат. анализу', date: 'Сессия — июнь 2026', score: null, max: 20, status: 'future' },
        ]
      },
    ],
    attendance: [1,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,null,null,null,null],
  },
  {
    id: 3, color: '#7C3AED',
    name: 'Операционные системы',
    teacher: 'Козлов В.И.',
    sections: [
      {
        key: 'labs', label: '🔬 Лабораторные работы', weight: 50,
        items: [
          { name: 'Лаб. №1 — Процессы и потоки', date: 'Сдана 8 фев',     score: 48, max: 50, status: 'done' },
          { name: 'Лаб. №2 — Файловая система',  date: 'Сдана 20 фев',    score: 44, max: 50, status: 'done' },
          { name: 'Лаб. №3 — Сокеты и сети',     date: 'Дедлайн 5 мар',   score: null, max: 50, status: 'pend' },
        ]
      },
      {
        key: 'ctrl', label: '📝 Контрольная', weight: 30,
        items: [
          { name: 'КР — Планировщики и прерывания', date: 'Написана 12 фев', score: 26, max: 30, status: 'done' },
        ]
      },
      {
        key: 'exam', label: '🎓 Экзамен', weight: 20,
        items: [
          { name: 'Экзамен', date: 'Сессия — июнь 2026', score: null, max: 20, status: 'future' },
        ]
      },
    ],
    attendance: [1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,null,null,null,null],
  },
  {
    id: 4, color: '#B94A00',
    name: 'Теория вероятностей',
    teacher: 'Новикова Л.С.',
    sections: [
      {
        key: 'hw',   label: '📋 Домашние задания', weight: 20,
        items: [
          { name: 'ДЗ №1', date: 'Сдано 10 фев',   score: 16, max: 20, status: 'done' },
          { name: 'ДЗ №2', date: 'Дедлайн 24 фев', score: null, max: 20, status: 'pend' },
        ]
      },
      {
        key: 'ctrl', label: '📝 Контрольные', weight: 60,
        items: [
          { name: 'КР №1 — Комбинаторика',       date: 'Написана 5 фев', score: 39, max: 60, status: 'done' },
          { name: 'КР №2 — Случайные величины',  date: '5 мар',          score: null, max: 60, status: 'pend' },
        ]
      },
      {
        key: 'exam', label: '🎓 Зачёт', weight: 20,
        items: [
          { name: 'Зачёт по ТВиМС', date: 'Сессия — июнь 2026', score: null, max: 20, status: 'future' },
        ]
      },
    ],
    attendance: [1,0,1,1,1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,null,null,null,null],
  },
];

const ATTENDANCE_THRESHOLD = 75; // %
const BONUS_POINTS = 3;
const TOTAL_MAX = 100;

let currentSubject = subjects[0];

// ============================================================
// HELPERS
// ============================================================

// Convert raw item score to contribution toward section weight
function itemContrib(item) {
  if (item.score === null) return null;
  return Math.round((item.score / item.max) * 100) / 100;
}

// Section earned points (out of section weight)
function sectionEarned(section) {
  const scored = section.items.filter(i => i.score !== null);
  if (!scored.length) return null;
  // average ratio * weight
  const ratio = scored.reduce((a, i) => a + (i.score / i.max), 0) / scored.length;
  return Math.round(ratio * section.weight * 10) / 10;
}

// Total base score out of 100
function calcBase(sub) {
  let earned = 0;
  let hasAny = false;
  sub.sections.forEach(sec => {
    const e = sectionEarned(sec);
    if (e !== null) { earned += e; hasAny = true; }
  });
  return hasAny ? Math.round(earned * 10) / 10 : null;
}

function attendPct(att) {
  const held = att.filter(v => v !== null).length;
  const present = att.filter(v => v === 1).length;
  return held ? Math.round(present / held * 100) : 0;
}

function gradeFromScore(s) {
  if (s === null || isNaN(s)) return { letter: '—', color: '#94A3B8' };
  if (s >= 93) return { letter: 'A', color: '#0A6B3A' };
  if (s >= 80) return { letter: 'B', color: '#0033A0' };
  if (s >= 65) return { letter: 'C', color: '#B94A00' };
  if (s >= 50) return { letter: 'D', color: '#C05200' };
  return { letter: 'F', color: '#E4002B' };
}

function scClass(score, max) {
  if (score === null) return 'sc-none';
  const p = score / max;
  if (p >= 0.8) return 'sc-high';
  if (p >= 0.6) return 'sc-mid';
  return 'sc-low';
}

function pillHtml(status) {
  const map = {
    done:   ['pill-done',   '✓ Сдано'],
    pend:   ['pill-pend',   '⚠ Дедлайн'],
    future: ['pill-future', '— Впереди'],
  };
  const [cls, lbl] = map[status] || map.future;
  return `<span class="pill ${cls}">${lbl}</span>`;
}

// ============================================================
// DROPDOWN
// ============================================================
function renderDD() {
  document.getElementById('dd-items').innerHTML = subjects.map(s => `
    <div class="dd-item ${s.id === currentSubject.id ? 'active' : ''}" onclick="selectSubject(${s.id})">
      <div class="dd-color" style="background:${s.color}"></div>
      <div class="dd-info">
        <div class="dd-name">${s.name}</div>
        <div class="dd-teacher">${s.teacher}</div>
      </div>
      ${s.id === currentSubject.id ? '<div class="dd-check">✓</div>' : ''}
    </div>`).join('');
}

function toggleDD() {
  document.getElementById('subj-btn').classList.toggle('open');
  document.getElementById('dropdown').classList.toggle('open');
}

function selectSubject(id) {
  currentSubject = subjects.find(s => s.id === id);
  document.getElementById('subj-btn').classList.remove('open');
  document.getElementById('dropdown').classList.remove('open');
  document.getElementById('btn-label').textContent = '📖 ' + currentSubject.name;
  renderPage();
  renderDD();
}

document.addEventListener('click', e => {
  if (!document.getElementById('switcher').contains(e.target)) {
    document.getElementById('subj-btn').classList.remove('open');
    document.getElementById('dropdown').classList.remove('open');
  }
});

// ============================================================
// SCORE HERO
// ============================================================
function renderHero(sub) {
  const base    = calcBase(sub);
  const attP    = attendPct(sub.attendance);
  const bonusEarned = attP >= ATTENDANCE_THRESHOLD;
  const bonus   = bonusEarned ? BONUS_POINTS : 0;
  const total   = base !== null ? Math.min(TOTAL_MAX + BONUS_POINTS, Math.round((base + bonus) * 10) / 10) : null;
  const { letter, color: gc } = gradeFromScore(total);

  const breakdownRows = sub.sections.map(sec => {
    const e = sectionEarned(sec);
    const pct = e !== null ? Math.round(e / sec.weight * 100) : 0;
    const icon = sec.label.split(' ')[0];
    const name = sec.label.split(' ').slice(1).join(' ');
    return `
      <div class="sb-row">
        <div class="sb-label">${icon} ${name}</div>
        <div class="sb-track"><div class="sb-fill" style="width:${pct}%;background:${sub.color}"></div></div>
        <div class="sb-val" style="color:${sub.color}">
          ${e !== null ? `${e} / ${sec.weight} б` : `— / ${sec.weight} б`}
        </div>
      </div>`;
  }).join('');

  return `
  <div class="score-hero anim" style="border-left:5px solid ${sub.color}">
    <div class="sh-body">

      <div class="sh-score">
        <div class="sh-score-main">
          <div class="sh-score-val" style="color:${sub.color}">${total ?? '—'}</div>
          <div class="sh-score-max">/ ${TOTAL_MAX + BONUS_POINTS}</div>
        </div>
        <div class="sh-score-lbl">Итоговый балл${bonus ? ' (с бонусом)' : ''}</div>
        <div class="sh-bonus ${bonusEarned ? '' : 'inactive'}">
          ${bonusEarned ? '🌟' : '⭐'} +${BONUS_POINTS} балла за посещаемость
          ${bonusEarned ? '' : `<span style="font-weight:600;opacity:0.7">— ещё ${ATTENDANCE_THRESHOLD - attP}%</span>`}
        </div>
      </div>

      <div class="sh-div"></div>

      <div class="sh-breakdown">${breakdownRows}</div>

      <div class="sh-div2"></div>

      <div class="sh-grade">
        <div class="grade-letter" style="color:${gc}">${letter}</div>
        <div class="grade-lbl">Оценка</div>
      </div>

    </div>
  </div>`;
}

// ============================================================
// TABLE
// ============================================================
function renderTable(sub) {
  const totalWeight = sub.sections.reduce((a,s) => a + s.weight, 0);

  const sectionsHtml = sub.sections.map(sec => {
    const secEarned = sectionEarned(sec);
    const secPct    = secEarned !== null ? Math.round(secEarned / sec.weight * 100) : null;

    const secRow = `
      <tr class="sec-row">
        <td colspan="6">${sec.label}
          <span>${sec.weight} баллов из ${TOTAL_MAX}</span>
        </td>
      </tr>`;

    const itemRows = sec.items.map(item => {
      // contribution = how much this item's score maps to section weight (proportionally)
      const contrib = item.score !== null
        ? Math.round((item.score / item.max) * sec.weight * 10) / 10
        : null;
      const contribPct = contrib !== null ? Math.round(contrib / sec.weight * 100) : 0;
      const cls = scClass(item.score, item.max);

      return `
        <tr>
          <td class="td-name">
            <div class="work-name">${item.name}</div>
            <div class="work-date">${item.date}</div>
          </td>
          <td class="td-c">
            <span class="weight-badge">${sec.weight} б</span>
          </td>
          <td class="td-c">
            <span class="sc ${cls}">${item.score !== null ? item.score : '—'}</span>
            <span style="font-size:10px;color:var(--gray);margin-left:2px">/ ${item.max}</span>
          </td>
          <td class="td-c" style="font-size:13px;font-weight:800;color:${contrib !== null ? sub.color : '#CBD5E1'}">
            ${contrib !== null ? '+' + contrib : '—'}
          </td>
          <td class="td-c">
            <div class="contrib-wrap">
              <div class="contrib-track">
                <div class="contrib-fill" style="width:${contribPct}%;background:${sub.color}"></div>
              </div>
              <div class="contrib-val" style="color:${sub.color}">${contrib !== null ? contribPct + '%' : '—'}</div>
            </div>
          </td>
          <td class="td-c">${pillHtml(item.status)}</td>
        </tr>`;
    }).join('');

    // section subtotal
    const subTotal = `
      <tr style="background:#FAFBFF">
        <td style="padding:8px 16px;font-size:12px;font-weight:700;color:var(--gray)" colspan="3">Итого по разделу</td>
        <td class="td-c" style="font-size:13px;font-weight:900;color:${sub.color}">
          ${secEarned !== null ? secEarned + ' б' : '—'}
        </td>
        <td class="td-c">
          ${secPct !== null ? `
            <div class="contrib-wrap">
              <div class="contrib-track" style="width:70px">
                <div class="contrib-fill" style="width:${secPct}%;background:${sub.color}"></div>
              </div>
              <div class="contrib-val" style="color:${sub.color}">${secPct}%</div>
            </div>` : '<span style="color:#CBD5E1">—</span>'}
        </td>
        <td></td>
      </tr>`;

    return secRow + itemRows + subTotal;
  }).join('');

  const base  = calcBase(sub);
  const attP  = attendPct(sub.attendance);
  const bonus = attP >= ATTENDANCE_THRESHOLD ? BONUS_POINTS : 0;
  const total = base !== null ? Math.round((base + bonus) * 10) / 10 : null;

  const grandTotal = `
    <tr class="totals-row">
      <td class="totals-label" colspan="3">
        Итого баллов
        ${bonus ? `<span style="color:#92600A;font-size:12px;margin-left:8px">+ ${bonus} бонусных 🌟</span>` : ''}
      </td>
      <td class="td-c" style="font-size:16px;font-weight:900;color:${sub.color}">
        ${total !== null ? total : '—'}
      </td>
      <td class="td-c">
        ${total !== null ? `
          <div class="contrib-wrap">
            <div class="contrib-track" style="width:80px">
              <div class="contrib-fill" style="width:${Math.min(100, Math.round(total / (TOTAL_MAX + BONUS_POINTS) * 100))}%;background:${sub.color}"></div>
            </div>
            <div class="contrib-val" style="color:${sub.color}">${Math.min(100, Math.round(total / (TOTAL_MAX + BONUS_POINTS) * 100))}%</div>
          </div>` : '<span style="color:#CBD5E1">—</span>'}
      </td>
      <td></td>
    </tr>`;

  return `
  <div class="table-card anim anim-d1">
    <div class="tc-head">
      <div class="tc-title">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${sub.color}"></span>
        Ведомость баллов
      </div>
      <div class="tc-teacher">${sub.teacher}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:38%">Работа</th>
          <th>Вес раздела</th>
          <th>Баллы</th>
          <th>Вклад в итог</th>
          <th>Прогресс</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        ${sectionsHtml}
        ${grandTotal}
      </tbody>
    </table>
  </div>`;
}

// ============================================================
// ATTENDANCE
// ============================================================
function renderAttend(sub) {
  const att   = sub.attendance;
  const held  = att.filter(v => v !== null).length;
  const present = att.filter(v => v === 1).length;
  const pct   = held ? Math.round(present / held * 100) : 0;
  const bonusEarned = pct >= ATTENDANCE_THRESHOLD;
  const attColor = bonusEarned ? sub.color : pct >= 60 ? '#B94A00' : '#E4002B';

  const numWeeks = Math.ceil(att.length / 4);
  const maxH = 40;
  const barsHtml = Array.from({ length: numWeeks }, (_, w) => {
    const sl = att.slice(w*4, w*4+4);
    const p  = sl.filter(v=>v===1).length;
    const t  = sl.filter(v=>v!==null).length;
    const future = t === 0;
    const h  = future ? 5 : Math.max(5, Math.round((t ? p/t : 0) * maxH));
    const bg = future ? '#E2E8F0' : p===t ? sub.color : p/t>=0.5 ? sub.color+'99' : '#FFE8EC';
    return `
      <div class="att-week">
        <div class="att-bar" style="height:${h}px;background:${bg}"></div>
        <div class="att-wlbl">${w+1} нед</div>
      </div>`;
  }).join('');

  const dotsHtml = att.filter(v=>v!==null).map(v =>
    `<div class="att-dot" style="background:${v===1 ? sub.color : '#FFE8EC'}"></div>`
  ).join('');

  const noteHtml = bonusEarned
    ? `<div class="threshold-note earned"><span class="threshold-note-icon">🌟</span>Посещаемость ≥ ${ATTENDANCE_THRESHOLD}% — бонус +${BONUS_POINTS} балла начислен!</div>`
    : `<div class="threshold-note"><span class="threshold-note-icon">⭐</span>До бонуса +${BONUS_POINTS} балла не хватает ${ATTENDANCE_THRESHOLD - pct}% посещаемости (нужно ≥ ${ATTENDANCE_THRESHOLD}%)</div>`;

  return `
  ${noteHtml}
  <div class="attend-card anim anim-d2">
    <div class="att-left">
      <div class="att-big" style="color:${attColor}">${pct}%</div>
      <div class="att-sub">${present} из ${held} лекций</div>
      <div class="att-bonus-note ${bonusEarned ? '' : 'inactive'}"
           style="background:${bonusEarned ? '#E8F8EF' : '#F1F5F9'};color:${bonusEarned ? '#0A6B3A' : '#64748B'};border:1px solid ${bonusEarned ? '#6EE7B7' : '#E2E8F0'}">
        ${bonusEarned ? '🌟 Бонус получен!' : `⭐ Ещё ${ATTENDANCE_THRESHOLD - pct}% до бонуса`}
      </div>
    </div>
    <div class="att-div"></div>
    <div class="att-bars">
      <div class="att-bars-title">По неделям</div>
      <div class="att-weeks">${barsHtml}</div>
    </div>
    <div class="att-div2"></div>
    <div class="att-dots-wrap">
      <div class="att-dots-title">Каждая лекция</div>
      <div class="att-dots">${dotsHtml}</div>
    </div>
  </div>`;
}

// ============================================================
// RENDER PAGE
// ============================================================
function renderPage() {
  const sub = currentSubject;
  document.getElementById('content').innerHTML =
    renderHero(sub) +
    renderTable(sub) +
    renderAttend(sub);
}

// INIT
renderDD();
document.getElementById('btn-label').textContent = '📖 ' + currentSubject.name;
renderPage();