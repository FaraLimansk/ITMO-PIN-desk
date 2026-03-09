let selectedCourses = new Set();
let availableCourses = [];
const API_BASE_URL = '/api';

async function loadAvailableCourses() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Получаем все курсы и уже записанные
        const [allCoursesRes, myCoursesRes] = await Promise.all([
            fetch(`${API_BASE_URL}/courses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch(`${API_BASE_URL}/courses/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const allCourses = await allCoursesRes.json();
        const myCourses = await myCoursesRes.json();

        // Фильтруем — показываем только те, на которые ещё не записан
        const myCourseIds = new Set(myCourses.map(c => c.id));
        availableCourses = allCourses.filter(c => !myCourseIds.has(c.id));

        renderCourses();
    } catch (e) {
        console.error('Error loading courses:', e);
        document.getElementById('course-list').innerHTML =
            '<p style="color: #e74c3c">Ошибка загрузки курсов</p>';
    }
}

function renderCourses() {
    const container = document.getElementById('course-list');
    
    if (availableCourses.length === 0) {
        container.innerHTML = `
            <p style="color: #0A6B3A; text-align: center; padding: 30px;">
                ✓ Вы записаны на все доступные курсы
            </p>
            <button class="btn btn-primary" onclick="window.location.href='points.html'" style="width: 100%; margin-top: 20px;">
                Перейти к зачётке
            </button>
        `;
        document.getElementById('btn-finish').style.display = 'none';
        document.querySelector('.btn-skip').style.display = 'none';
        document.getElementById('selected-count').style.display = 'none';
        return;
    }

    container.innerHTML = availableCourses.map(course => `
        <div class="course-item" data-id="${course.id}">
            <div class="course-info">
                <h3>${course.title}</h3>
                <p>${course.term}</p>
            </div>
            <button class="btn-enroll" onclick="toggleCourse(${course.id})" id="btn-${course.id}">
                Выбрать
            </button>
        </div>
    `).join('');
}

function toggleCourse(courseId) {
    const btn = document.getElementById(`btn-${courseId}`);
    
    if (selectedCourses.has(courseId)) {
        selectedCourses.delete(courseId);
        btn.textContent = 'Выбрать';
        btn.style.background = '#0033A0';
    } else {
        selectedCourses.add(courseId);
        btn.textContent = '✓ Выбрано';
        btn.style.background = '#0A6B3A';
    }

    updateCount();
}

function updateCount() {
    document.getElementById('selected-count').textContent = 
        `Выбрано курсов: ${selectedCourses.size}`;
    document.getElementById('btn-finish').disabled = selectedCourses.size === 0;
}

async function finishSelection() {
    const token = localStorage.getItem('jwt_token');
    const message = document.getElementById('message');

    if (selectedCourses.size === 0) {
        message.className = 'error';
        message.textContent = 'Выберите хотя бы один курс';
        return;
    }

    try {
        const enrollPromises = Array.from(selectedCourses).map(courseId =>
            fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
        );

        const results = await Promise.all(enrollPromises);
        
        if (results.every(r => r.ok)) {
            message.className = 'success';
            message.textContent = 'Курсы выбраны! Перенаправление...';
            setTimeout(() => {
                window.location.href = 'points.html';
            }, 1000);
        } else {
            throw new Error('Some enrollments failed');
        }
    } catch (e) {
        console.error('Error enrolling:', e);
        message.className = 'error';
        message.textContent = 'Ошибка при записи на курсы';
    }
}

function skipSelection() {
    window.location.href = 'points.html';
}

// Load courses on page load
loadAvailableCourses();
