const API_BASE_URL = '/api';

let courses = [];
let currentCourseId = null;
let assignments = [];

// ============================================================
// AUTH HELPER
// ============================================================
function getAuthHeaders() {
    const token = localStorage.getItem('jwt_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function getCurrentUser() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return null;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            localStorage.removeItem('jwt_token');
            window.location.href = 'login.html';
            return null;
        }

        return await res.json();
    } catch (e) {
        console.error('Failed to get current user:', e);
        return null;
    }
}

function logout() {
    localStorage.removeItem('jwt_token');
    window.location.href = 'login.html';
}

// ============================================================
// LOAD USER INFO
// ============================================================
async function loadUserInfo() {
    const user = await getCurrentUser();
    if (!user) return;

    document.getElementById('user-name').textContent = user.name;

    // Инициалы для аватара
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('ava-initials').textContent = initials;
}

// ============================================================
// LOAD COURSES
// ============================================================
async function loadCourses() {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/courses/teaching`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            throw new Error('Failed to fetch courses');
        }

        courses = await res.json();

        const select = document.getElementById('course-select');
        select.innerHTML = '<option value="">Выберите курс</option>' +
            courses.map(c => `<option value="${c.id}">${c.title} (${c.term})</option>`).join('');

        if (courses.length === 0) {
            document.getElementById('no-courses-message').style.display = 'block';
            document.getElementById('course-selector').style.display = 'none';
        } else {
            document.getElementById('no-courses-message').style.display = 'none';
        }
    } catch (e) {
        console.error('Failed to load courses:', e);
    }
}

function onCourseChange() {
    const select = document.getElementById('course-select');
    currentCourseId = select.value ? parseInt(select.value) : null;

    if (currentCourseId) {
        document.getElementById('assignments-section').style.display = 'block';
        loadAssignments();
    } else {
        document.getElementById('assignments-section').style.display = 'none';
    }
}

// ============================================================
// LOAD ASSIGNMENTS
// ============================================================
async function loadAssignments() {
    if (!currentCourseId) return;

    try {
        const [summaryRes, itemsRes] = await Promise.all([
            fetch(`${API_BASE_URL}/gradebook/summary?courseId=${currentCourseId}`, {
                headers: getAuthHeaders()
            }),
            fetch(`${API_BASE_URL}/gradebook/items?courseId=${currentCourseId}`, {
                headers: getAuthHeaders()
            })
        ]);

        if (!summaryRes.ok || !itemsRes.ok) {
            throw new Error('Failed to fetch assignments');
        }

        const items = await itemsRes.json();
        assignments = items;

        renderAssignments();
    } catch (e) {
        console.error('Failed to load assignments:', e);
        document.getElementById('assignments-list').innerHTML =
            '<p style="color: var(--red)">Ошибка загрузки работ</p>';
    }
}

function renderAssignments() {
    const container = document.getElementById('assignments-list');

    if (assignments.length === 0) {
        container.innerHTML = '<p style="color: var(--gray); text-align: center; padding: 40px;">Нет лабораторных работ</p>';
        return;
    }

    // Группируем по категориям
    const byCategory = {};
    assignments.forEach(item => {
        if (!byCategory[item.categoryTitle]) {
            byCategory[item.categoryTitle] = [];
        }
        byCategory[item.categoryTitle].push(item);
    });

    container.innerHTML = Object.entries(byCategory).map(([category, items]) => `
        <div class="category-group">
            <h4 style="color: var(--gray); font-size: var(--text-sm); margin: 20px 0 12px 0;">${category}</h4>
            ${items.map(item => `
                <div class="assignment-item" data-id="${item.itemId}">
                    <div class="assignment-info">
                        <div class="assignment-title">${item.title}</div>
                        <div class="assignment-meta">
                            Макс. балл: ${item.maxPoints}
                            ${item.dueDate ? `• Срок: ${formatDate(item.dueDate)}` : ''}
                            ${item.files && item.files.length > 0 ? `• Файлов: ${item.files.length}` : ''}
                        </div>
                        ${item.files && item.files.length > 0 ? `
                            <div class="file-list">
                                ${item.files.map(f => `
                                    <a href="#" class="file-link" onclick="downloadFile(${f.id}); return false;">
                                        📄 ${f.fileName} (${formatFileSize(f.fileSize)})
                                    </a>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="assignment-actions">
                        <button class="btn-icon" onclick="uploadFile(${item.itemId})" title="Загрузить файл">📎</button>
                        <button class="btn-icon" onclick="editAssignment(${item.itemId})">✏️</button>
                        <button class="btn-icon" onclick="deleteAssignment(${item.itemId})">🗑️</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function downloadFile(fileId) {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
        const res = await fetch(`${API_BASE_URL}/gradebook/files/${fileId}`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            throw new Error('Failed to download file');
        }

        const blob = await res.blob();
        const disposition = res.headers.get('Content-Disposition');
        let filename = 'file.docx';
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    } catch (e) {
        console.error('Failed to download file:', e);
        showMessage('Ошибка скачивания файла', 'error');
    }
}

async function uploadFile(itemId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;

        if (!file.name.endsWith('.docx')) {
            showMessage('Только файлы DOCX поддерживаются', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_BASE_URL}/gradebook/items/${itemId}/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
                },
                body: formData
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Ошибка загрузки');
            }

            showMessage('Файл загружен', 'success');
            loadAssignments();
        } catch (e) {
            console.error('Failed to upload file:', e);
            showMessage(e.message || 'Ошибка при загрузке файла', 'error');
        }
    };
    input.click();
}

function showMessage(text, type) {
    const message = document.getElementById('message');
    message.className = type;
    message.textContent = text;
    setTimeout(() => {
        message.className = '';
        message.textContent = '';
    }, 3000);
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ============================================================
// CREATE ASSIGNMENT
// ============================================================
function showAddAssignmentModal() {
    document.getElementById('add-assignment-modal').style.display = 'flex';
}

function hideAddAssignmentModal() {
    document.getElementById('add-assignment-modal').style.display = 'none';
    // Clear form
    document.getElementById('category-title').value = '';
    document.getElementById('assignment-title').value = '';
    document.getElementById('max-points').value = '10';
    document.getElementById('due-date').value = '';
}

async function createAssignment() {
    const categoryTitle = document.getElementById('category-title').value.trim();
    const title = document.getElementById('assignment-title').value.trim();
    const maxPoints = parseInt(document.getElementById('max-points').value);
    const dueDate = document.getElementById('due-date').value;
    const fileInput = document.getElementById('assignment-file');
    const message = document.getElementById('message');

    if (!categoryTitle || !title || !maxPoints) {
        message.className = 'error';
        message.textContent = 'Заполните обязательные поля';
        return;
    }

    try {
        // Сначала создаём работу
        let url = `${API_BASE_URL}/gradebook/items?courseId=${currentCourseId}&categoryTitle=${encodeURIComponent(categoryTitle)}&title=${encodeURIComponent(title)}&maxPoints=${maxPoints}${dueDate ? '&dueDate=' + dueDate : ''}`;

        const res = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Ошибка создания');
        }

        const item = await res.json();

        // Если есть файл, загружаем его
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            if (!file.name.endsWith('.docx')) {
                message.className = 'error';
                message.textContent = 'Только файлы DOCX поддерживаются';
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            const fileRes = await fetch(`${API_BASE_URL}/gradebook/items/${item.itemId}/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
                },
                body: formData
            });

            if (!fileRes.ok) {
                console.error('Failed to upload file');
            }
        }

        message.className = 'success';
        message.textContent = 'Работа добавлена!';
        hideAddAssignmentModal();
        loadAssignments();

        setTimeout(() => {
            message.className = '';
            message.textContent = '';
        }, 3000);
    } catch (e) {
        console.error('Failed to create assignment:', e);
        message.className = 'error';
        message.textContent = e.message || 'Ошибка при создании работы';
    }
}

// ============================================================
// DELETE ASSIGNMENT (placeholder)
// ============================================================
async function deleteAssignment(itemId) {
    if (!confirm('Удалить эту работу?')) return;

    // TODO: Implement delete API
    alert('Функция удаления будет добавлена позже');
}

async function editAssignment(itemId) {
    // TODO: Implement edit modal
    alert('Функция редактирования будет добавлена позже');
}

// ============================================================
// INIT
// ============================================================
async function init() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    await loadUserInfo();
    await loadCourses();
}

init();
