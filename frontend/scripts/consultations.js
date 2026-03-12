// ---- CONFIG ----
const API_BASE_URL = 'http://localhost:8080';

// ---- STATE ----
let slots = [];
let myBookings = new Set();
let currentUser = null;
let userRole = null;
let userCourses = []; // Курсы пользователя (записан/преподает)

// ---- CALENDAR STATE ----
let currentWeekStart = new Date();
let weeks = [];

// ---- INIT ----
document.addEventListener('DOMContentLoaded', async () => {
    initWeeks();
    await loadUserInfo();
    await loadUserCourses(); // Загружаем курсы пользователя
    await loadSlots();
    renderCalendar();
    updateTeacherUI();
});

// ---- WEEK NAVIGATION ----
function initWeeks() {
    // Находим ближайший понедельник
    const today = new Date();
    const day = today.getDay(); // 0 = вс, 1 = пн, ..., 6 = сб
    const diff = day === 0 ? 6 : day - 1; // дней до понедельника
    currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - diff);
    
    updateWeeksArray();
}

function updateWeeksArray() {
    weeks = [];
    // Показываем ±4 недели от текущей
    for (let i = -4; i <= 4; i++) {
        const weekDate = new Date(currentWeekStart);
        weekDate.setDate(currentWeekStart.getDate() + i * 7);
        weeks.push(weekDate);
    }
    updateWeekLabel();
}

function updateWeekLabel() {
    const weekIndex = weeks.findIndex(w => 
        w.toDateString() === currentWeekStart.toDateString()
    );
    if (weekIndex === -1) return;
    
    const weekStart = weeks[weekIndex];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 4); // +4 дня до пятницы
    
    const formatOptions = { day: 'numeric', month: 'long' };
    const startStr = weekStart.toLocaleDateString('ru-RU', formatOptions);
    const endStr = weekEnd.toLocaleDateString('ru-RU', formatOptions);
    
    document.getElementById('week-label').textContent = 
        `${startStr} – ${endStr}`;
}

function changeWeek(dir) {
    currentWeekStart.setDate(currentWeekStart.getDate() + dir * 7);
    updateWeeksArray();
    renderCalendar();
}

// ---- API FUNCTIONS ----
function loadUserInfo() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        currentUser = {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            role: payload.role
        };
        userRole = payload.role;
        
        const name = payload.name || payload.email?.split('@')[0] || 'Пользователь';
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        
        document.getElementById('ava-name').textContent = name;
        document.getElementById('ava-initials').textContent = initials;
        
    } catch (e) {
        console.error('Failed to load user info:', e);
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
    }
}

// Загрузка курсов пользователя (в зависимости от роли)
async function loadUserCourses() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return [];

    try {
        let endpoint = '';
        if (userRole === 'STUDENT') {
            endpoint = `${API_BASE_URL}/api/courses/my`; // Курсы, на которые записан студент
        } else if (userRole === 'TEACHER' || userRole === 'ADMIN') {
            endpoint = `${API_BASE_URL}/api/courses/my`; // Курсы, которые ведет преподаватель
        } else {
            return [];
        }

        const res = await fetch(endpoint, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            userCourses = await res.json();
            console.log('Loaded user courses:', userCourses);
            
            // Для студентов также загружаем их записи на консультации
            if (userRole === 'STUDENT') {
                await loadMyBookings();
            }
            
            return userCourses;
        } 
    } catch (e) {
        console.error('Failed to load user courses:', e);
        
        // Тестовые данные при ошибке
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            if (userRole === 'TEACHER' || userRole === 'ADMIN') {
                userCourses = [
                    { id: 1, name: 'Математический анализ' },
                    { id: 2, name: 'Линейная алгебра' },
                    { id: 3, name: 'Программирование на Java' },
                    { id: 4, name: 'Базы данных' }
                ];
            } else if (userRole === 'STUDENT') {
                userCourses = [
                    { id: 1, name: 'Математический анализ' },
                    { id: 2, name: 'Линейная алгебра' }
                ];
            }
            return userCourses;
        }
        
        userCourses = [];
        return [];
    }
}

async function loadMyBookings() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/consultations/my`, {
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
        const startDate = new Date(currentWeekStart);
        startDate.setDate(currentWeekStart.getDate() - 7);
        
        const endDate = new Date(currentWeekStart);
        endDate.setDate(currentWeekStart.getDate() + 11);
        
        const params = new URLSearchParams({
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        });

        const res = await fetch(`${API_BASE_URL}/api/consultations?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            const allSlots = await res.json();
            
            // Фильтруем слоты по курсам пользователя
            slots = filterSlotsByUserCourses(allSlots);
            console.log('Filtered slots:', slots);
        }
    } catch (e) {
        console.error('Failed to load slots:', e);
        showToast('Ошибка загрузки консультаций', 'error');
    }
}

// Фильтрация слотов по курсам пользователя
function filterSlotsByUserCourses(allSlots) {
    // Администратор видит всё
    if (userRole === 'ADMIN') {
        return allSlots;
    }
    
    // Если у пользователя нет курсов, показываем только слоты без курса
    if (!userCourses || userCourses.length === 0) {
        return allSlots.filter(slot => !slot.courseId);
    }
    
    // Получаем ID курсов пользователя
    const userCourseIds = userCourses.map(c => c.id);
    
    // Фильтруем слоты:
    // - слоты без курса (courseId = null) видят все
    // - слоты с курсом видят только те, у кого есть этот курс
    return allSlots.filter(slot => {
        if (!slot.courseId) return true; // Слоты без курса видят все
        return userCourseIds.includes(slot.courseId);
    });
}

async function bookSlot(slotId) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return false;

    try {
        const res = await fetch(`${API_BASE_URL}/api/consultations/${slotId}/book`, {
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
        const res = await fetch(`${API_BASE_URL}/api/consultations/${slotId}/book`, {
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
        const res = await fetch(`${API_BASE_URL}/api/consultations`, {
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
        const res = await fetch(`${API_BASE_URL}/api/consultations/${slotId}`, {
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
function getWeekDays() {
    const days = [];
    for (let i = 0; i < 5; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        days.push({
            date: date,
            dayNum: date.getDate(),
            dayName: getDayName(date),
            isToday: isSameDay(date, new Date())
        });
    }
    return days;
}

function getDayName(date) {
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[date.getDay()];
}

function isSameDay(d1, d2) {
    return d1.toDateString() === d2.toDateString();
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

// Получить название курса по ID
function getCourseName(courseId) {
    if (!courseId) return null;
    const course = userCourses.find(c => c.id === courseId);
    if (course) {
        return course.name || course.title || course.courseName || `Курс ${courseId}`;
    }
    return null;
}

function renderCalendar() {
    const weekDays = getWeekDays();
    renderCalendarHeader(weekDays);
    
    const weekSlots = slots.filter(slot => {
        const slotDate = new Date(slot.date);
        return weekDays.some(day => isSameDay(day.date, slotDate));
    });

    const byDay = {};
    weekDays.forEach((day, index) => {
        byDay[index + 1] = weekSlots.filter(slot => 
            isSameDay(new Date(slot.date), day.date)
        );
    });

    const allTimes = [...new Set(weekSlots.map(s => s.startTime))].sort();

    const tbody = document.getElementById('cal-body');
    tbody.innerHTML = '';

    if (weekSlots.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px;color:#888;">На этой неделе консультаций по вашим курсам нет</td></tr>';
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
            td.className = 'day-cell' + (weekDays[d-1].isToday ? ' today-col' : '');

            const daySlots = byDay[d]?.filter(s => s.startTime === time) || [];

            if (daySlots.length === 0) {
                td.innerHTML = '';
            } else {
                daySlots.forEach(slot => {
                    const div = document.createElement('div');
                    div.className = 'slot' + (myBookings.has(slot.id) ? ' booked' : '');
                    div.onclick = () => openModal(slot.id);
                    
                    // Добавляем информацию о курсе, если есть
                    const courseName = getCourseName(slot.courseId);
                    const courseHtml = courseName ? 
                        `<div class="slot-course">${courseName}</div>` : '';
                    
                    div.innerHTML = `
                        ${courseHtml}
                        <div class="slot-meta">${slot.location}</div>
                        <div class="slot-topic">${slot.topic}</div>
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

function renderCalendarHeader(weekDays) {
    const thead = document.querySelector('.cal-head');
    if (!thead) return;
    
    const cells = thead.children;
    for (let i = 1; i <= 5; i++) {
        const cell = cells[i];
        if (cell) {
            const dayNum = weekDays[i-1].dayNum;
            const dayName = weekDays[i-1].dayName;
            cell.innerHTML = `<span class="day-num">${dayNum}</span><span class="day-name">${dayName}</span>`;
            cell.className = weekDays[i-1].isToday ? 'today' : '';
        }
    }
}

// ---- MODAL ----
let activeSlotId = null;

function openModal(slotId) {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    activeSlotId = slotId;
    const isBooked = myBookings.has(slot.id);
    const isTeacher = userRole === 'TEACHER' || userRole === 'ADMIN';
    const courseName = getCourseName(slot.courseId);

    document.getElementById('m-title').textContent = slot.topic;
    document.getElementById('m-subtitle').textContent = slot.teacherName;
    document.getElementById('m-datetime').textContent = `${formatDate(slot.date)}, ${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`;
    document.getElementById('m-place').textContent = slot.location;
    document.getElementById('m-teacher').textContent = slot.teacherName;
    
    // Добавляем информацию о курсе в модальное окно
    const courseInfoEl = document.getElementById('m-course');
    if (courseInfoEl) {
        courseInfoEl.textContent = courseName || 'Не привязан к курсу';
    }

    const btn = document.getElementById('m-action-btn');
    const deleteBtn = document.getElementById('m-delete-btn');

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

// ---- TEACHER UI ----
function updateTeacherUI() {
    const createBtn = document.getElementById('create-slot-btn');
    if (createBtn) {
        createBtn.style.display = (userRole === 'TEACHER' || userRole === 'ADMIN') ? 'inline-block' : 'none';
    }
}

async function openCreateModal() {
    if (userRole !== 'TEACHER' && userRole !== 'ADMIN') {
        showToast('Только преподаватели могут создавать консультации', 'error');
        return;
    }
    
    // Принудительно обновляем список курсов для преподавателя
    if (userRole === 'TEACHER' || userRole === 'ADMIN') {
        await loadUserCourses(); // Перезагружаем курсы
    }
    
    const modal = document.getElementById('create-modal');
    const courseSelect = document.getElementById('c-course');
    
    if (courseSelect) {
        courseSelect.innerHTML = '<option value="">Общая консультация (без курса)</option>';
        
        if (userCourses && userCourses.length > 0) {
            console.log('Displaying courses in select:', userCourses);
            
            userCourses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                
                // Пробуем разные варианты названий
                if (course.name) {
                    option.textContent = course.name;
                } else if (course.title) {
                    option.textContent = course.title;
                } else if (course.courseName) {
                    option.textContent = course.courseName;
                } else {
                    option.textContent = `Курс ID: ${course.id}`;
                }
                
                courseSelect.appendChild(option);
            });
        } else {
            console.log('No courses available');
            // Добавляем заглушку, если курсов нет
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "Нет доступных курсов";
            option.disabled = true;
            courseSelect.appendChild(option);
        }
    }
    
    modal.classList.add('open');
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
    const courseId = document.getElementById('c-course')?.value || null;

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
        maxStudents,
        courseId: courseId ? parseInt(courseId) : null
    };

    const created = await createSlot(slotData);
    if (created) {
        showToast('Консультация создана', 'success');
        document.getElementById('create-modal').classList.remove('open');
        
        const form = document.getElementById('create-form');
        if (form) form.reset();
        
        renderCalendar();
    }
}

// ---- LOGOUT ----
function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}