// ---- DATA ----
const slots = [
  { id:1, day:1, time:'10:00', topic:'Разбор лабораторной №3', building:'Кронверкский, 49', room:'ауд. 305', teacher:'Смирнов Д.В.' },
  { id:2, day:1, time:'14:00', topic:'Вопросы по курсовой', building:'Ломоносова, 9', room:'ауд. 114', teacher:'Смирнов Д.В.' },
  { id:3, day:1, time:'16:00', topic:'Индивидуальный разбор ошибок', building:'Биржевая л., 14', room:'ауд. 201', teacher:'Петрова Е.А.' },
  { id:4, day:2, time:'09:30', topic:'Контрольная №2 — подготовка', building:'Кронверкский, 49', room:'ауд. 305', teacher:'Смирнов Д.В.' },
  { id:5, day:2, time:'13:00', topic:'Лабораторная №4 — сдача', building:'Ломоносова, 9', room:'ауд. 114', teacher:'Петрова Е.А.' },
  { id:6, day:3, time:'11:00', topic:'Разбор теории по теме 7', building:'Биржевая л., 14', room:'ауд. 201', teacher:'Смирнов Д.В.' },
  { id:7, day:3, time:'15:30', topic:'Алгоритмы и структуры данных', building:'Кронверкский, 49', room:'ауд. 305', teacher:'Козлов В.И.' },
  { id:8, day:4, time:'10:00', topic:'Лабораторная №3 — сдача', building:'Ломоносова, 9', room:'ауд. 114', teacher:'Смирнов Д.В.' },
  { id:9, day:4, time:'14:00', topic:'Вопросы к экзамену', building:'Биржевая л., 14', room:'ауд. 201', teacher:'Козлов В.И.' },
  { id:10, day:5, time:'12:00', topic:'Разбор контрольной №1', building:'Кронверкский, 49', room:'ауд. 305', teacher:'Петрова Е.А.' },
  { id:11, day:5, time:'16:00', topic:'Индивидуальные вопросы', building:'Ломоносова, 9', room:'ауд. 114', teacher:'Смирнов Д.В.' },
];

const days = ['17', '18', '19', '20', '21'];
const todayCol = 3;

let bookedSet = new Set([5]);

function renderCalendar() {
  const byDay = {};
  for (let d = 1; d <= 5; d++) byDay[d] = slots.filter(s => s.day === d);

  const allTimes = [...new Set(slots.map(s => s.time))].sort();

  const tbody = document.getElementById('cal-body');
  tbody.innerHTML = '';

  allTimes.forEach(time => {
    const tr = document.createElement('tr');

    const tdTime = document.createElement('td');
    tdTime.className = 'time-cell';
    tdTime.innerHTML = `<span class="time-label">${time}</span>`;
    tr.appendChild(tdTime);

    for (let d = 1; d <= 5; d++) {
      const td = document.createElement('td');
      td.className = 'day-cell' + (d === todayCol ? ' today-col' : '');

      const daySlots = byDay[d].filter(s => s.time === time);

      if (daySlots.length === 0) {
        td.innerHTML = '';
      } else {
        daySlots.forEach(slot => {
          const div = document.createElement('div');
          div.className = 'slot';
          div.onclick = () => openModal(slot.id);
          div.innerHTML = `
            <div class="slot-topic">${slot.topic}</div>
            <div class="slot-meta">${slot.building}<br>${slot.room}</div>
          `;
          td.appendChild(div);
        });
      }

      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });
}

// ---- MODAL ----
let activeSlotId = null;

function openModal(id) {
  const slot = slots.find(s => s.id === id);
  if (!slot) return;
  activeSlotId = id;
  const isBooked = bookedSet.has(slot.id);

  document.getElementById('m-title').textContent = slot.topic;
  document.getElementById('m-subtitle').textContent = slot.teacher;
  document.getElementById('m-datetime').textContent = `${days[slot.day-1]} февраля, ${slot.time}`;
  document.getElementById('m-place').textContent = `${slot.building}, ${slot.room}`;
  document.getElementById('m-teacher').textContent = slot.teacher;

  const btn = document.getElementById('m-action-btn');
  if (isBooked) {
    btn.textContent = 'Отменить запись';
    btn.className = 'modal-btn danger';
  } else {
    btn.textContent = 'Записаться на консультацию';
    btn.className = 'modal-btn primary';
  }

  document.getElementById('modal').classList.add('open');
}

function closeModal(e) {
  if (e.target.id === 'modal') closeModalDirect();
}

function closeModalDirect() {
  document.getElementById('modal').classList.remove('open');
  activeSlotId = null;
}

function handleAction() {
  if (!activeSlotId) return;
  const isBooked = bookedSet.has(activeSlotId);

  if (isBooked) {
    bookedSet.delete(activeSlotId);
    showToast('Запись отменена', 'cancel');
  } else {
    bookedSet.add(activeSlotId);
    showToast('Вы записаны на консультацию!', 'success');
  }

  closeModalDirect();
  renderCalendar();
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ---- WEEK NAV ----
const weeks = ['10 – 14, Февраль', '17 – 21, Февраль', '24 – 28, Февраль', '3 – 7, Март'];
let weekIdx = 1;

function changeWeek(dir) {
  weekIdx = Math.max(0, Math.min(weeks.length - 1, weekIdx + dir));
  document.getElementById('week-label').textContent = weeks[weekIdx];
}

// ---- USER INFO ----
function loadUserInfo() {
  const token = localStorage.getItem('jwt_token');
  if (!token) return;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
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
  window.location.href = 'login.html';
}

loadUserInfo();
renderCalendar();