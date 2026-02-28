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

    try {
        const res = await fetch('http://localhost:8080/api/auth/register', {
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
            window.location.href = 'points.html?refresh=' + Date.now();
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