    function register() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const message = document.getElementById("message");

        message.className = "";
        message.textContent = "";

        if (!email || !password || !confirmPassword) {
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

        message.className = "success";
        message.textContent = "Регистрация прошла успешно!";
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function goBack() {
        alert("Возврат назад");
    }