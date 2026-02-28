async function login() {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const message = document.getElementById("message");

    message.className = "";
    message.textContent = "";

    if (!email || !password) {
        message.className = "error";
        message.textContent = "Заполните все поля.";
        return;
    }

    if (!validateEmail(email)) {
        message.className = "error";
        message.textContent = "Некорректный E-mail.";
        return;
    }

    try {
        const res = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const error = await res.json();
            message.className = "error";
            message.textContent = error.message || 'Ошибка входа';
            return;
        }

        const data = await res.json();
        localStorage.setItem('jwt_token', data.token);
        
        message.className = "success";
        message.textContent = "Вход выполнен успешно!";
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

function goToRegister() {
    window.location.href = 'reg.html';
}