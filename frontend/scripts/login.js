function login() {
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

    message.className = "success";
    message.textContent = "Вход выполнен успешно!";
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function goToRegister() {
    window.location.href = 'reg.html';
}