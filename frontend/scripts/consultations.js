// ---- DATA ----
const slots = [
  { id:1, day:1, time:'10:00', topic:'Разбор лабораторной №3', building:'Кронверкский, 49', room:'ауд. 305', teacher:'Смирнов Д.В.', total:8, booked:3 },
  { id:2, day:1, time:'14:00', topic:'Вопросы по курсовой', building:'Ломоносова, 9', room:'ауд. 114', teacher:'Смирнов Д.В.', total:10, booked:9 },
  { id:3, day:1, time:'16:00', topic:'Индивидуальный разбор ошибок', building:'Биржевая л., 14', room:'ауд. 201', teacher:'Петрова Е.А.', total:6, booked:6 },
  { id:4, day:2, time:'09:30', topic:'Контрольная №2 — подготовка', building:'Кронверкский, 49', room:'ауд. 305', teacher:'Смирнов Д.В.', total:12, booked:4 },
  { id:5, day:2, time:'13:00', topic:'Лабораторная №4 — сдача', building:'Ломоносова, 9', room:'ауд. 114', teacher:'Петрова Е.А.', total:8, booked:5, mine:true },
  { id:6, day:3, time:'11:00', topic:'Разбор теории по теме 7', building:'Биржевая л., 14', room:'ауд. 201', teacher:'Смирнов Д.В.', total:10, booked:10 },
  { id:7, day:3, time:'15:30', topic:'Алгоритмы и структуры данных', building:'Кронверкский, 49', room:'ауд. 305', teacher:'Козлов В.И.', total:8, booked:2 },
  { id:8, day:4, time:'10:00', topic:'Лабораторная №3 — сдача', building:'Ломоносова, 9', room:'ауд. 114', teacher:'Смирнов Д.В.', total:6, booked:5 },
  { id:9, day:4, time:'14:00', topic:'Вопросы к экзамену', building:'Биржевая л., 14', room:'ауд. 201', teacher:'Козлов В.И.', total:15, booked:7 },
  { id:10, day:5, time:'12:00', topic:'Разбор контрольной №1', building:'Кронверкский, 49', room:'ауд. 305', teacher:'Петрова Е.А.', total:10, booked:3 },
  { id:11, day:5, time:'16:00', topic:'Индивидуальные вопросы', building:'Ломоносова, 9', room:'ауд. 114', teacher:'Смирнов Д.В.', total:5, booked:1 },
];

const days = ['17', '18', '19', '20', '21'];
const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'];
const todayCol = 3; // Wednesday

let bookedSet = new Set([5]); // slot id=5 already booked

// Collect unique times
function getStatus(slot) {
  if (bookedSet.has(slot.id)) return 'mine';
  if (slot.booked >= slot.total) return 'full';
  if (slot.booked >= slot.total * 0.75) return 'busy';
  return 'free';
}

function badgeHtml(status) {
  const map = {
    free: ['badge-free', 'Свободно'],
    busy: ['badge-busy', 'Мало мест'],
    full: ['badge-full', 'Нет мест'],
    mine: ['badge-mine', 'Вы записаны'],
  };
  const [cls, label] = map[status];
  return `<span class="slot-badge ${cls}">${label}</span>`;
}

function renderCalendar() {
  // Group by day, then time
  const byDay = {};
  for (let d = 1; d <= 5; d++) byDay[d] = slots.filter(s => s.day === d);

  // Get all unique times sorted
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
          const status = getStatus(slot);
          const free = slot.total - slot.booked;
          const div = document.createElement('div');
          div.className = `slot ${status}`;
          div.onclick = () => openModal(slot.id);
          div.innerHTML = `
            <div class="slot-topic">${slot.topic}</div>
            <div class="slot-meta">${slot.building}<br>${slot.room}</div>
            <div class="slot-footer">
              ${badgeHtml(status)}
              <span class="slot-seats">${free > 0 ? free + ' мест' : 'Занято'}</span>
            </div>
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
  const status = getStatus(slot);
  const free = slot.total - slot.booked;

  document.getElementById('m-title').textContent = slot.topic;
  document.getElementById('m-subtitle').textContent = slot.teacher;
  document.getElementById('m-datetime').textContent = `${days[slot.day-1]} февраля, ${slot.time}`;
  document.getElementById('m-place').textContent = `${slot.building}, ${slot.room}`;
  document.getElementById('m-teacher').textContent = slot.teacher;
  document.getElementById('m-seats').textContent = `${slot.booked} из ${slot.total} мест занято`;

  const pct = (slot.booked / slot.total) * 100;
  const barColor = pct >= 100 ? '#E4002B' : pct >= 75 ? '#E07B00' : '#12A050';
  document.getElementById('m-seats-bar').style.width = Math.min(pct, 100) + '%';
  document.getElementById('m-seats-bar').style.background = barColor;

  const btn = document.getElementById('m-action-btn');
  if (status === 'mine') {
    btn.textContent = 'Отменить запись';
    btn.className = 'modal-btn danger';
  } else if (status === 'full') {
    btn.textContent = 'Нет свободных мест';
    btn.className = 'modal-btn disabled';
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
  const slot = slots.find(s => s.id === activeSlotId);
  const status = getStatus(slot);
  if (status === 'full') return;

  if (status === 'mine') {
    bookedSet.delete(activeSlotId);
    slot.booked--;
    showToast('Запись отменена', 'cancel');
  } else {
    bookedSet.add(activeSlotId);
    slot.booked++;
    showToast('✓ Вы записаны на консультацию!', 'success');
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

// ---- WEEK NAV (cosmetic) ----
const weeks = ['10 – 14, Февраль', '17 – 21, Февраль', '24 – 28, Февраль', '3 – 7, Март'];
let weekIdx = 1;

function changeWeek(dir) {
  weekIdx = Math.max(0, Math.min(weeks.length - 1, weekIdx + dir));
  document.getElementById('week-label').textContent = weeks[weekIdx];
}

renderCalendar();