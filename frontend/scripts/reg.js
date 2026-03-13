const API_BASE_URL = 'http://localhost:8080';

// Проверка URL параметра ?role=TEACHER
let registerAsTeacher = false;
let teacherCode = '';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const role = urlParams.get('role');
    
    if (role && role.toUpperCase() === 'TEACHER') {
        registerAsTeacher = true;
        document.getElementById('form-title').textContent = 'Регистрация преподавателя';
        document.getElementById('teacher-code-group').style.display = 'block';
    }
});

async function register() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    message.className = "";
    message.textContent = "";

    if (!name || !email || !password || !confirmPassword) {
        message.className = "error";
        message.textContent = "Заполните все поля.";
        return;
    }

    if (!validateEmail(email)) {
        message.className = "error";
        message.textContent = "Некорректный E-mail.";
        return;
    }

    if (password.length < 6) {
        message.className = "error";
        message.textContent = "Пароль должен быть минимум 6 символов.";
        return;
    }

    if (password !== confirmPassword) {
        message.className = "error";
        message.textContent = "Пароли не совпадают.";
        return;
    }

    // Проверка кода преподавателя
    if (registerAsTeacher) {
        teacherCode = document.getElementById("teacher-code").value.trim();
        if (!teacherCode) {
            message.className = "error";
            message.textContent = "Введите код преподавателя.";
            return;
        }
        if (teacherCode !== 'ITMO-TEACHER-2026') {
            message.className = "error";
            message.textContent = "Неверный код преподавателя.";
            return;
        }
    }

    try {
        const url = registerAsTeacher
            ? `${API_BASE_URL}/api/auth/register?role=TEACHER`
            : `${API_BASE_URL}/api/auth/register`;


        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, password })
        });

        if (!res.ok) {
            const error = await res.json();
            message.className = "error";
            message.textContent = error.message || 'Ошибка регистрации';
            return;
        }

        const data = await res.json();
        localStorage.setItem('jwt_token', data.token);

        message.className = "success";
        message.textContent = "Регистрация прошла успешно!";
        setTimeout(() => {
            window.location.href = 'courses.html';
        }, 500);
    } catch (e) {
        message.className = "error";
        message.textContent = 'Ошибка подключения к серверу';
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function goBack() {
    window.location.href = 'login.html';
}