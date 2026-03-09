// ---- CONFIG ----
const API_BASE_URL = '/api';

// ---- STATE ----
let slots = [];
let myBookings = new Set();
let currentUser = null;
let userRole = null;

// ---- CALENDAR DATA ----
const days = ['17', '18', '19', '20', '21'];
const todayCol = 3;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserInfo();
    await loadSlots();
    renderCalendar();
    updateTeacherUI();
});

// ---- API FUNCTIONS ----
async function loadUserInfo() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const data = await res.json();
            currentUser = data;
            userRole = data.role;

            document.getElementById('ava-name').textContent = data.name;
            const initials = data.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            document.getElementById('ava-initials').textContent = initials;

            // Загружаем мои записи
            await loadMyBookings();
        } else if (res.status === 401) {
            localStorage.removeItem('jwt_token');
            window.location.href = 'login.html';
        }
    } catch (e) {
        console.error('Failed to load user info:', e);
    }
}

async function loadMyBookings() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/consultations/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const bookings = await res.json();
            myBookings = new Set(bookings.map(b => b.slotId));
        }
    } catch (e) {
        console.error('Failed to load bookings:', e);
    }
}

async function loadSlots() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/consultations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            slots = await res.json();
        }
    } catch (e) {
        console.error('Failed to load slots:', e);
        showToast('Ошибка загрузки консультаций', 'error');
    }
}

async function bookSlot(slotId) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    try {
        const res = await fetch(`${API_BASE_URL}/consultations/${slotId}/book`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (res.ok) {
            myBookings.add(slotId);
            return true;
        } else {
            const error = await res.json();
            showToast(error.message || 'Ошибка записи', 'error');
            return false;
        }
    } catch (e) {
        console.error('Failed to book slot:', e);
        showToast('Ошибка подключения', 'error');
        return false;
    }
}

async function cancelBooking(slotId) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    try {
        const res = await fetch(`${API_BASE_URL}/consultations/${slotId}/book`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            myBookings.delete(slotId);
            return true;
        } else {
            const error = await res.json();
            showToast(error.message || 'Ошибка отмены', 'error');
            return false;
        }
    } catch (e) {
        console.error('Failed to cancel booking:', e);
        showToast('Ошибка подключения', 'error');
        return false;
    }
}

async function createSlot(slotData) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return null;

    try {
        const res = await fetch(`${API_BASE_URL}/consultations`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(slotData)
        });

        if (res.ok) {
            const data = await res.json();
            await loadSlots();
            return data;
        } else {
            const error = await res.json();
            showToast(error.message || 'Ошибка создания', 'error');
            return null;
        }
    } catch (e) {
        console.error('Failed to create slot:', e);
        showToast('Ошибка подключения', 'error');
        return null;
    }
}

async function deleteSlot(slotId) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    try {
        const res = await fetch(`${API_BASE_URL}/consultations/${slotId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            await loadSlots();
            return true;
        } else {
            const error = await res.json();
            showToast(error.message || 'Ошибка удаления', 'error');
            return false;
        }
    } catch (e) {
        console.error('Failed to delete slot:', e);
        showToast('Ошибка подключения', 'error');
        return false;
    }
}

// ---- CALENDAR RENDER ----
function renderCalendar() {
    const byDay = {};
    for (let d = 1; d <= 5; d++) byDay[d] = slots.filter(s => {
        const slotDate = new Date(s.date);
        return slotDate.getDay() === d;
    });

    const allTimes = [...new Set(slots.map(s => s.startTime))].sort();

    const tbody = document.getElementById('cal-body');
    tbody.innerHTML = '';

    if (slots.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#888;">Консультаций пока нет</td></tr>';
        return;
    }

    allTimes.forEach(time => {
        const tr = document.createElement('tr');

        const tdTime = document.createElement('td');
        tdTime.className = 'time-cell';
        tdTime.innerHTML = `<span class="time-label">${formatTime(time)}</span>`;
        tr.appendChild(tdTime);

        for (let d = 1; d <= 5; d++) {
            const td = document.createElement('td');
            td.className = 'day-cell' + (d === todayCol ? ' today-col' : '');

            const daySlots = byDay[d]?.filter(s => s.startTime === time) || [];

            if (daySlots.length === 0) {
                td.innerHTML = '';
            } else {
                daySlots.forEach(slot => {
                    const div = document.createElement('div');
                    div.className = 'slot' + (myBookings.has(slot.id) ? ' booked' : '');
                    div.onclick = () => openModal(slot.id);
                    div.innerHTML = `
                        <div class="slot-topic">${slot.topic}</div>
                        <div class="slot-meta">${slot.location}</div>
                        <div class="slot-teacher">${slot.teacherName}</div>
                    `;
                    td.appendChild(div);
                });
            }

            tr.appendChild(td);
        }

        tbody.appendChild(tr);
    });
}

function formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

// ---- MODAL ----
let activeSlotId = null;

function openModal(slotId) {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    activeSlotId = slotId;
    const isBooked = myBookings.has(slot.id);
    const isTeacher = userRole === 'TEACHER' || userRole === 'ADMIN';

    document.getElementById('m-title').textContent = slot.topic;
    document.getElementById('m-subtitle').textContent = slot.teacherName;
    document.getElementById('m-datetime').textContent = `${formatDate(slot.date)}, ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
    document.getElementById('m-place').textContent = slot.location;
    document.getElementById('m-teacher').textContent = slot.teacherName;

    const btn = document.getElementById('m-action-btn');
    const deleteBtn = document.getElementById('m-delete-btn');

    // Скрываем кнопку удаления для всех кроме автора
    if (deleteBtn) {
        deleteBtn.style.display = isTeacher ? 'inline-block' : 'none';
    }

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

async function handleAction() {
    if (!activeSlotId) return;
    const isBooked = myBookings.has(activeSlotId);

    let success = false;
    if (isBooked) {
        success = await cancelBooking(activeSlotId);
        if (success) {
            showToast('Запись отменена', 'cancel');
        }
    } else {
        success = await bookSlot(activeSlotId);
        if (success) {
            showToast('Вы записаны на консультацию!', 'success');
        }
    }

    if (success) {
        closeModalDirect();
        renderCalendar();
    }
}

async function handleDelete() {
    if (!activeSlotId) return;
    if (!confirm('Вы уверены, что хотите удалить эту консультацию?')) return;

    const success = await deleteSlot(activeSlotId);
    if (success) {
        showToast('Консультация удалена', 'success');
        closeModalDirect();
        renderCalendar();
    }
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

// ---- TEACHER UI ----
function updateTeacherUI() {
    const createBtn = document.getElementById('create-slot-btn');
    if (createBtn) {
        if (userRole === 'TEACHER' || userRole === 'ADMIN') {
            createBtn.style.display = 'inline-block';
        } else {
            createBtn.style.display = 'none';
        }
    }
}

function openCreateModal() {
    document.getElementById('create-modal').classList.add('open');
}

function closeCreateModal(e) {
    if (e.target.id === 'create-modal') {
        document.getElementById('create-modal').classList.remove('open');
    }
}

async function handleCreateSlot() {
    const date = document.getElementById('c-date').value;
    const startTime = document.getElementById('c-start-time').value;
    const endTime = document.getElementById('c-end-time').value;
    const location = document.getElementById('c-location').value.trim();
    const topic = document.getElementById('c-topic').value.trim();
    const maxStudents = parseInt(document.getElementById('c-max-students').value) || 1;

    if (!date || !startTime || !endTime || !location || !topic) {
        showToast('Заполните все поля', 'error');
        return;
    }

    const slotData = {
        date,
        startTime,
        endTime,
        location,
        topic,
        maxStudents
    };

    const created = await createSlot(slotData);
    if (created) {
        showToast('Консультация создана', 'success');
        document.getElementById('create-modal').classList.remove('open');
        document.getElementById('create-form').reset();
        renderCalendar();
    }
}

// ---- LOGOUT ----
function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}
