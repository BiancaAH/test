document.addEventListener("DOMContentLoaded", function() {
    todosLaden();
});

function todosLaden() {
    fetch('/todos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(todos => {
            const liste = document.getElementById('todoListe');
            liste.innerHTML = ''; // Liste leeren
            todos.forEach(todo => {
                const li = document.createElement('li');
                li.textContent = todo.text; // Stellen Sie sicher, dass 'text' das richtige Attribut ist

                // Löschbutton hinzufügen
                const loeschButton = document.createElement('button');
                loeschButton.textContent = 'Löschen';
                loeschButton.onclick = () => todoLoeschen(todo.id); // Verwendung von 'id' für das Löschen
                li.appendChild(loeschButton);

                liste.appendChild(li);
            });
        })
        .catch(error => {
            console.error('Fehler beim Laden der To-Dos:', error);
            const fehlermeldung = document.getElementById('fehlermeldung');
            fehlermeldung.textContent = 'Fehler beim Laden der To-Dos: ' + error.message;
        });
}

function neueAufgabeHinzufuegen() {
    const aufgabeText = document.getElementById('neueAufgabe').value;
    fetch('/todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: aufgabeText }) // Stellen Sie sicher, dass 'text' das richtige Attribut ist
    })
    .then(response => {
        if (response.ok) {
            todosLaden(); // Die Liste neu laden, um das neue To-Do anzuzeigen
            document.getElementById('neueAufgabe').value = ''; // Eingabefeld leeren
        } else {
            throw new Error('Fehler beim Hinzufügen des To-Dos: ' + response.statusText);
        }
    })
    .catch(error => {
        console.error(error);
        const fehlermeldung = document.getElementById('fehlermeldung');
        fehlermeldung.textContent = 'Fehler beim Hinzufügen des To-Dos: ' + error.message;
    });
}

function todoLoeschen(todoId) {
    fetch(`/todos/${todoId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            todosLaden(); // Die Liste neu laden, um das gelöschte To-Do zu entfernen
        } else {
            throw new Error('Fehler beim Löschen des To-Dos: ' + response.statusText);
        }
    })
    .catch(error => {
        console.error(error);
        const fehlermeldung = document.getElementById('fehlermeldung');
        fehlermeldung.textContent = 'Fehler beim Löschen des To-Dos: ' + error.message;
    });
}
