document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Überprüfen Sie, ob die Anmeldedaten korrekt sind
        if (username === "JimmysBox" && password === "$Ws2017!") {
            alert("Anmeldung erfolgreich!");
            // Hier leiten Sie den Benutzer zur Seite webisco.html weiter
            window.location.href = "webisco.html";
        } else {
            alert("Falscher Benutzername oder Passwort. Bitte versuchen Sie es erneut.");
        }
    });
});
