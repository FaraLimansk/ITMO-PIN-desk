// ============================================================
// CONFIG
// ============================================================
const API_BASE_URL = 'http://localhost:8080';
const ATTENDANCE_THRESHOLD = 75;
const BONUS_POINTS = 3;
const TOTAL_MAX = 100;

const COLORS = ['#4577e3', '#0A6B3A', '#7C3AED', '#B94A00', '#DC2626', '#0891b2'];

let courses = [];
let currentCourse = null;
let gradebookSummary = null;
let gradebookItems = [];

// ============================================================
// API FUNCTIONS
// ============================================================
async function fetchCourses() {
  const res = await fetch(`${API_BASE_URL}/api/courses`);
  if (!res.ok) throw new Error('Failed to fetch courses');
  return await res.json();
}

async function fetchGradebookSummary(courseId) {
  const userId = 1;
  const res = await fetch(`${API_BASE_URL}/api/gradebook/summary?courseId=${courseId}&userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch gradebook summary');
  return await res.json();
}

async function fetchGradebookItems(courseId) {
  const userId = 1;
  const res = await fetch(`${API_BASE_URL}/api/gradebook/items?courseId=${courseId}&userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch gradebook items');
  return await res.json();
}

// ============================================================
// DATA TRANSFORM
// ============================================================
function transformCourse(apiCourse, index) {
  return {
    id: apiCourse.id,
    color: COLORS[index % COLORS.length],
    name: apiCourse.title,
    teacher: 'Преподаватель',
    term: apiCourse.term,
    sections: [],
    attendance: [],
  };
}

function transformGradebookToSections(summary, items) {
  const sectionsMap = {};

  items.forEach(item => {
    if (!sectionsMap[item.categoryTitle]) {
      sectionsMap[item.categoryTitle] = {
        key: item.categoryTitle.toLowerCase().replace(/\s+/g, '_'),
        label: getCategoryLabel(item.categoryTitle),
        weight: 0,
        items: [],
      };
    }

    const section = sectionsMap[item.categoryTitle];
    section.items.push({
      name: item.title,
      date: item.dueDate ? formatDate(item.dueDate) : 'Без срока',
      score: item.points > 0 ? item.points : null,
      max: item.maxPoints,
      status: item.status,
    });
  });

  if (summary && summary.categories) {
    summary.categories.forEach(cat => {
      const key = cat.title.toLowerCase().replace(/\s+/g, '_');
      const section = Object.values(sectionsMap).find(s => s.key === key);
      if (section) {
        section.weight = cat.maxPoints;
      }
    });
  }

  Object.values(sectionsMap).forEach(section => {
    if (section.weight === 0) {
      const totalMax = section.items.reduce((sum, item) => sum + item.max, 0);
      section.weight = Math.round((totalMax / 100) * 100) || 10;
    }
  });

  return Object.values(sectionsMap);
}

function getCategoryLabel(category) {
  const labels = {
    'labs': 'Лабораторные работы',
    'lab': 'Лабораторные работы',
    'hw': 'Домашние задания',
    'homework': 'Домашние задания',
    'ctrl': 'Контрольные работы',
    'control': 'Контрольные работы',
    'exam': 'Экзамен',
    'zachet': 'Зачёт',
  };

  const key = category.toLowerCase();
  for (const [k, label] of Object.entries(labels)) {
    if (key.includes(k)) return label;
  }
  return category;
}

function formatDate(dateStr) {
  if (!dateStr) return 'Без срока';
  const date = new Date(dateStr);
  const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const day = date.getDate();
  const month = months[date.getMonth()];
  return `${day} ${month}`;
}

// ============================================================
// HELPERS
// ============================================================
function gradeFromScore(s) {
  if (s === null || isNaN(s)) return { letter: '—', color: '#94A3B8' };
  if (s > 90) return { letter: '5', color: '#0A6B3A' };
  if (s > 74) return { letter: '4', color: '#0033A0' };
  if (s >= 60) return { letter: '3', color: '#B94A00' };
  return { letter: '2', color: '#E4002B' };
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
    done:   ['pill-done',   'Сдано'],
    pend:   ['pill-pend',   'Дедлайн'],
    future: ['pill-future', 'Впереди'],
  };
  const [cls, lbl] = map[status] || map.future;
  return `<span class="pill ${cls}">${lbl}</span>`;
}

// ============================================================
// DROPDOWN
// ============================================================
function renderDD() {
  document.getElementById('dd-items').innerHTML = courses.map(c => `
    <div class="dd-item ${c.id === currentCourse?.id ? 'active' : ''}" onclick="selectCourse(${c.id})">
      <div class="dd-color" style="background:${c.color}"></div>
      <div class="dd-info">
        <div class="dd-name">${c.name}</div>
        <div class="dd-teacher">${c.term}</div>
      </div>
      ${c.id === currentCourse?.id ? '<div class="dd-check"></div>' : ''}
    </div>`).join('');
}

function toggleDD() {
  document.getElementById('subj-btn').classList.toggle('open');
  document.getElementById('dropdown').classList.toggle('open');
}

async function loadCourseData(course) {
  try {
    gradebookSummary = await fetchGradebookSummary(course.id);
    gradebookItems = await fetchGradebookItems(course.id);
    course.sections = transformGradebookToSections(gradebookSummary, gradebookItems);
  } catch (err) {
    console.error('Failed to load gradebook:', err);
    course.sections = [];
  }
}

async function initCourses() {
  try {
    courses = await fetchCourses();
    courses = courses.map((c, i) => transformCourse(c, i));
    
    if (courses.length > 0) {
      currentCourse = courses[0];
      await loadCourseData(currentCourse);
    }
    
    renderDD();
    document.getElementById('btn-label').textContent = currentCourse?.name || 'Нет курсов';
    renderPage();
  } catch (err) {
    console.error('Failed to initialize courses:', err);
    document.getElementById('content').innerHTML = '<div style="padding:40px;text-align:center;color:#64748B">Ошибка загрузки данных. Попробуйте обновить страницу.</div>';
  }
}

async function selectCourse(id) {
  currentCourse = courses.find(c => c.id === id);
  document.getElementById('subj-btn').classList.remove('open');
  document.getElementById('dropdown').classList.remove('open');
  document.getElementById('btn-label').textContent = currentCourse.name;
  
  try {
    gradebookSummary = await fetchGradebookSummary(id);
    gradebookItems = await fetchGradebookItems(id);
    currentCourse.sections = transformGradebookToSections(gradebookSummary, gradebookItems);
  } catch (err) {
    console.error('Failed to load gradebook:', err);
    currentCourse.sections = [];
  }
  
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
  const total = gradebookSummary ? gradebookSummary.totalPoints : null;
  const maxPoints = gradebookSummary ? gradebookSummary.maxPoints : TOTAL_MAX;
  const { letter, color: gc } = gradeFromScore(total);

  const breakdownRows = sub.sections.map(sec => {
    const category = gradebookSummary?.categories?.find(c => 
      c.title.toLowerCase().replace(/\s+/g, '_') === sec.key
    );
    const e = category ? category.earnedPoints : null;
    const secMax = category ? category.maxPoints : sec.weight;
    const pct = secMax ? Math.round(e / secMax * 100) : 0;
    const icon = sec.label.split(' ')[0];
    const name = sec.label.split(' ').slice(1).join(' ');
    return `
      <div class="sb-row">
        <div class="sb-label">${icon} ${name}</div>
        <div class="sb-track"><div class="sb-fill" style="width:${pct}%;background:${sub.color}"></div></div>
        <div class="sb-val">
          ${e !== null ? `${e} / ${secMax} б` : `— / ${secMax} б`}
        </div>
      </div>`;
  }).join('');

  return `
  <div class="score-hero anim" style="border-left:5px solid ${sub.color}">
    <div class="sh-body">

      <div class="sh-score">
        <div class="sh-score-main">
          <div class="sh-score-val" style="color:${sub.color}">${total ?? '—'}</div>
          <div class="sh-score-max">/ ${maxPoints}</div>
        </div>
        <div class="sh-score-lbl">Итоговый балл</div>
        <div class="sh-bonus inactive">
          +${BONUS_POINTS} балла за посещаемость
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
  const sectionsHtml = sub.sections.map(sec => {
    const category = gradebookSummary?.categories?.find(c =>
      c.title.toLowerCase().replace(/\s+/g, '_') === sec.key
    );
    const secEarned = category ? category.earnedPoints : null;

    const secRow = `
      <tr class="sec-row">
        <td colspan="4">${sec.label}
          <span>${sec.weight} баллов из ${TOTAL_MAX}</span>
        </td>
      </tr>`;

    const itemRows = sec.items.map(item => {
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
          <td class="td-c">${pillHtml(item.status)}</td>
        </tr>`;
    }).join('');

    const subTotal = `
      <tr style="background:#FAFBFF">
        <td style="padding:8px 16px;font-size:12px;font-weight:700;color:var(--gray)" colspan="2">Итого по разделу</td>
        <td class="td-c" style="font-size:13px;font-weight:900;color:${sub.color}">
          ${secEarned !== null ? secEarned + ' б' : '—'}
        </td>
        <td></td>
      </tr>`;

    return secRow + itemRows + subTotal;
  }).join('');

  const total = gradebookSummary ? gradebookSummary.totalPoints : null;

  const grandTotal = `
    <tr class="totals-row">
      <td class="totals-label" colspan="2">
        Итого баллов
      </td>
      <td class="td-c" style="font-size:16px;font-weight:900;color:${sub.color}">
        ${total !== null ? total : '—'}
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
      <div class="tc-teacher">${sub.term}</div>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:45%">Работа</th>
          <th>Вес раздела</th>
          <th>Баллы</th>
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
// RENDER PAGE
// ============================================================
function renderPage() {
  if (!currentCourse) {
    document.getElementById('content').innerHTML = '<div style="padding:40px;text-align:center;color:#64748B">Загрузка...</div>';
    return;
  }
  const sub = currentCourse;
  document.getElementById('content').innerHTML =
    renderHero(sub) +
    renderTable(sub)
}

// INIT
initCourses();