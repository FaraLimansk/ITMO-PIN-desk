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
let currentUser = null;
let studentsData = [];

// Для модального окна оценок
let currentEditGrade = null; // { studentId, itemId, maxPoints, currentPoints }

// ============================================================
// AUTH HELPER
// ============================================================
function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

function getCurrentUser() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  } catch (e) {
    return null;
  }
}

// ============================================================
// API FUNCTIONS
// ============================================================
async function fetchCourses() {
  const res = await fetch(`${API_BASE_URL}/api/courses/my`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch courses');
  return await res.json();
}

async function fetchGradebookSummary(courseId) {
  const res = await fetch(`${API_BASE_URL}/api/gradebook/summary?courseId=${courseId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch gradebook summary');
  return await res.json();
}

async function fetchGradebookItems(courseId) {
  const res = await fetch(`${API_BASE_URL}/api/gradebook/items?courseId=${courseId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch gradebook items');
  return await res.json();
}

async function fetchStudents(courseId) {
  const res = await fetch(`${API_BASE_URL}/api/gradebook/students?courseId=${courseId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch students');
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

  if (!items || items.length === 0) {
    console.warn('No gradebook items received');
    return [];
  }

  items.forEach(item => {
    if (!item.categoryTitle) {
      console.warn('Item without categoryTitle:', item);
      return;
    }
    
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

  if (summary && summary.categories && summary.categories.length > 0) {
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
      section.weight = totalMax || 10;
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
  
  // Выбираем вид в зависимости от роли
  if (currentUser?.role === 'TEACHER') {
    document.getElementById('content').innerHTML = renderTeacherView(currentCourse);
  } else {
    const sub = currentCourse;
    document.getElementById('content').innerHTML =
      renderHero(sub) +
      renderTable(sub);
  }
}

// ============================================================
// USER INFO
// ============================================================
function loadUserInfo() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return;
  try {
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))));
    const name = payload.name || payload.email?.split('@')[0] || 'Пользователь';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('ava-name').textContent = name;
    document.getElementById('ava-initials').textContent = initials;
  } catch (e) {
    console.error('Failed to load user info:', e);
  }
}

function logout() {
  localStorage.removeItem('jwt_token');
  courses = [];
  currentCourse = null;
  gradebookSummary = null;
  gradebookItems = [];
  studentsData = [];
  currentUser = null;
  currentEditGrade = null;
  window.location.href = 'login.html';
}

// ============================================================
// GRADE EDITOR MODAL
// ============================================================
function openGradeModal(studentName, itemTitle, studentId, itemId, points, maxPoints) {
  currentEditGrade = { studentId, itemId, maxPoints, currentPoints: points };
  
  document.getElementById('gm-title').textContent = `${studentName} — ${itemTitle}`;
  document.getElementById('grade-slider').max = maxPoints;
  document.getElementById('grade-slider').value = points;
  document.getElementById('grade-max').textContent = maxPoints;
  
  updateGradeValue(points);
  document.getElementById('grade-modal').classList.add('open');
}

function updateGradeValue(value) {
  const max = parseInt(document.getElementById('grade-slider').max);
  const pct = (value / max) * 100;
  
  document.getElementById('grade-value').textContent = value;
  document.getElementById('grade-slider-fill').style.width = pct + '%';
  
  // Цвет полоски в зависимости от процента
  const fill = document.getElementById('grade-slider-fill');
  if (pct >= 80) {
    fill.style.background = 'var(--green)';
  } else if (pct >= 60) {
    fill.style.background = 'var(--blue)';
  } else {
    fill.style.background = 'var(--red)';
  }
}

function closeGradeModal(e) {
  if (e.target.id === 'grade-modal') {
    closeGradeModalDirect();
  }
}

function closeGradeModalDirect() {
  document.getElementById('grade-modal').classList.remove('open');
  currentEditGrade = null;
}

async function saveGrade() {
  if (!currentEditGrade) return;
  
  const points = parseInt(document.getElementById('grade-slider').value);
  const token = localStorage.getItem('jwt_token');
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/gradebook/items/${currentEditGrade.itemId}/grades`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        studentId: currentEditGrade.studentId,
        points: points
      })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to save grade');
    }
    
    // Обновляем данные и перерисовываем
    studentsData = await fetchStudents(currentCourse.id);
    renderPage();
    closeGradeModalDirect();
  } catch (err) {
    console.error('Failed to save grade:', err);
    alert('Ошибка при сохранении оценки');
  }
}

// ============================================================
// TEACHER VIEW
// ============================================================
function renderTeacherView(course) {
  const totalStudents = studentsData.length;
  
  // Считаем средние баллы по категориям
  const categoryStats = {};
  course.sections.forEach(sec => {
    const studentsWithGrades = studentsData.filter(s => 
      s.grades.some(g => g.categoryTitle.toLowerCase().replace(/\s+/g, '_') === sec.key)
    );
    const filledCount = studentsData.filter(s => {
      const grade = s.grades.find(g => g.categoryTitle.toLowerCase().replace(/\s+/g, '_') === sec.key);
      return grade && grade.points > 0;
    }).length;
    categoryStats[sec.key] = {
      avg: studentsWithGrades.length > 0 
        ? studentsWithGrades.reduce((sum, s) => {
            const grade = s.grades.find(g => g.categoryTitle.toLowerCase().replace(/\s+/g, '_') === sec.key);
            return sum + (grade ? grade.points / grade.maxPoints * 100 : 0);
          }, 0) / studentsWithGrades.length 
        : 0,
      filled: filledCount,
      total: totalStudents,
      maxPoints: sec.weight
    };
  });

  // Считаем итоговые баллы студентов
  const studentTotals = studentsData.map(s => {
    const total = s.grades.reduce((sum, g) => sum + (g.points || 0), 0);
    const max = s.grades.reduce((sum, g) => sum + g.maxPoints, 0);
    return { id: s.studentId, name: s.studentName, total, max, pct: max > 0 ? total / max * 100 : 0 };
  });
  const overallAvg = studentTotals.reduce((sum, s) => sum + s.pct, 0) / (totalStudents || 1);

  // Собираем все уникальные items по категориям из данных студентов
  const itemsByCategory = {};
  studentsData.forEach(student => {
    student.grades.forEach(grade => {
      const key = grade.categoryTitle.toLowerCase().replace(/\s+/g, '_');
      if (!itemsByCategory[key]) {
        itemsByCategory[key] = [];
      }
      // Добавляем item если его ещё нет
      if (!itemsByCategory[key].find(i => i.itemId === grade.itemId)) {
        itemsByCategory[key].push({
          itemId: grade.itemId,
          title: grade.title,
          maxPoints: grade.maxPoints
        });
      }
    });
  });

  // Сортируем items внутри каждой категории по itemId
  Object.keys(itemsByCategory).forEach(key => {
    itemsByCategory[key].sort((a, b) => a.itemId - b.itemId);
  });

  // Таблица студентов
  const studentsTable = `
    <div class="teacher-table-card">
      <div class="ttc-stats">
        <div class="stat-box">
          <div class="stat-val">${totalStudents}</div>
          <div class="stat-lbl">Студентов</div>
        </div>
        <div class="stat-box">
          <div class="stat-val" style="color:${overallAvg >= 75 ? '#0A6B3A' : overallAvg >= 60 ? '#0033A0' : '#E4002B'}">${overallAvg.toFixed(1)}%</div>
          <div class="stat-lbl">Средний балл</div>
        </div>
        ${course.sections.map(sec => {
          const stat = categoryStats[sec.key];
          const icon = sec.label.split(' ')[0];
          const name = sec.label.split(' ').slice(1).join(' ') || sec.label;
          return `
            <div class="stat-box">
              <div class="stat-val" style="color:${stat.avg >= 75 ? '#0A6B3A' : stat.avg >= 60 ? '#0033A0' : '#E4002B'}">${stat.avg.toFixed(0)}%</div>
              <div class="stat-lbl">${icon} ${name}</div>
              <div class="stat-sub">${stat.filled}/${stat.total}</div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="table-scroll-wrapper">
        <table class="students-table">
          <thead>
            <tr>
              <th class="student-header">Студент</th>
              ${course.sections.map(sec => `
                <th class="category-header" colspan="${itemsByCategory[sec.key]?.length || 1}">
                  <div class="cat-name">${sec.label}</div>
                  <div class="cat-max">${sec.weight} б</div>
                </th>
              `).join('')}
              <th class="total-header">
                <div class="cat-name">Итого</div>
                <div class="cat-max">${course.sections.reduce((s, sec) => s + sec.weight, 0)} б</div>
              </th>
            </tr>
            <tr class="sub-header">
              <th class="student-header"></th>
              ${course.sections.map(sec => {
                const items = itemsByCategory[sec.key] || [];
                return items.map(item => `
                  <th class="item-header">${item.title}</th>
                `).join('');
              }).join('')}
              <th class="total-header"></th>
            </tr>
          </thead>
          <tbody>
            ${studentsData.map(student => {
              const studentTotal = student.grades.reduce((s, g) => s + (g.points || 0), 0);
              const studentMax = student.grades.reduce((s, g) => s + g.maxPoints, 0);
              const pct = studentMax > 0 ? studentTotal / studentMax * 100 : 0;
              
              const gradeByItemId = {};
              student.grades.forEach(g => {
                gradeByItemId[g.itemId] = g;
              });
              
              return `
                <tr>
                  <td class="student-name-cell">${student.studentName}</td>
                  ${course.sections.map(sec => {
                    const items = itemsByCategory[sec.key] || [];
                    return items.map(item => {
                      const grade = gradeByItemId[item.itemId];
                      const score = grade ? grade.points : 0;
                      const max = grade ? grade.maxPoints : item.maxPoints;
                      const itemPct = max > 0 ? score / max * 100 : 0;
                      return `
                        <td class="td-c item-cell" onclick="openGradeModal('${student.studentName}', '${item.title}', ${student.studentId}, ${item.itemId}, ${score}, ${max})">
                          <span class="sc ${itemPct >= 80 ? 'sc-high' : itemPct >= 60 ? 'sc-mid' : 'sc-low'}">${score}</span>
                        </td>
                      `;
                    }).join('');
                  }).join('')}
                  <td class="td-c total-cell">
                    <span class="sc ${pct >= 80 ? 'sc-high' : pct >= 60 ? 'sc-mid' : 'sc-low'}" style="font-size:15px;font-weight:900">
                      ${studentTotal} / ${studentMax}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  return studentsTable;
}

// ============================================================
// STUDENT VIEW (existing)
// ============================================================
async function initCourses() {
  const token = localStorage.getItem('jwt_token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  currentUser = getCurrentUser();
  loadUserInfo();
  
  try {
    const myCourses = await fetchCourses();

    if (myCourses.length === 0) {
      window.location.href = 'courses.html';
      return;
    }

    courses = myCourses.map((c, i) => transformCourse(c, i));
    currentCourse = courses[0];
    
    // Загружаем данные в зависимости от роли
    if (currentUser.role === 'TEACHER') {
      // Для учителя: загружаем студентов
      studentsData = await fetchStudents(currentCourse.id);
      // Загружаем items для названий заданий
      gradebookItems = await fetchGradebookItems(currentCourse.id);
      // Создаём секции из оценок студентов
      if (studentsData.length > 0 && studentsData[0].grades.length > 0) {
        const categoriesMap = {};
        studentsData[0].grades.forEach(g => {
          if (!categoriesMap[g.categoryTitle]) {
            categoriesMap[g.categoryTitle] = {
              key: g.categoryTitle.toLowerCase().replace(/\s+/g, '_'),
              label: getCategoryLabel(g.categoryTitle),
              weight: g.maxPoints
            };
          }
        });
        currentCourse.sections = Object.values(categoriesMap);
      }
    } else {
      // Для студента: загружаем свои оценки
      const [summary, items] = await Promise.all([
        fetchGradebookSummary(currentCourse.id),
        fetchGradebookItems(currentCourse.id)
      ]);
      gradebookSummary = summary;
      gradebookItems = items;
      currentCourse.sections = transformGradebookToSections(summary, items);
    }

    renderDD();
    document.getElementById('btn-label').textContent = currentCourse.name;
    renderPage();
  } catch (err) {
    console.error('Failed to initialize courses:', err);
    document.getElementById('content').innerHTML = '<div style="padding:40px;text-align:center;color:#ef4444">Ошибка загрузки. Проверьте подключение к серверу.</div>';
  }
}

async function selectCourse(id) {
  currentCourse = courses.find(c => c.id === id);
  document.getElementById('subj-btn').classList.remove('open');
  document.getElementById('dropdown').classList.remove('open');
  document.getElementById('btn-label').textContent = currentCourse.name;

  if (currentUser.role === 'TEACHER') {
    studentsData = await fetchStudents(id);
    gradebookItems = await fetchGradebookItems(id);
    // Пересоздаём секции
    if (studentsData.length > 0 && studentsData[0].grades.length > 0) {
      const categoriesMap = {};
      studentsData[0].grades.forEach(g => {
        if (!categoriesMap[g.categoryTitle]) {
          categoriesMap[g.categoryTitle] = {
            key: g.categoryTitle.toLowerCase().replace(/\s+/g, '_'),
            label: getCategoryLabel(g.categoryTitle),
            weight: g.maxPoints
          };
        }
      });
      currentCourse.sections = Object.values(categoriesMap);
    }
  } else {
    const [summary, items] = await Promise.all([
      fetchGradebookSummary(id),
      fetchGradebookItems(id)
    ]);
    gradebookSummary = summary;
    gradebookItems = items;
    currentCourse.sections = transformGradebookToSections(summary, items);
  }

  renderPage();
  renderDD();
}

initCourses();