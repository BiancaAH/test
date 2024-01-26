// In Ihrer Frontend-JavaScript-Datei können Sie den Token abrufen, indem Sie eine Anfrage an Ihren Server stellen
document.addEventListener("DOMContentLoaded", function() {
    fetch('/github-token') // Hier wird eine neue Route verwendet, um den Token abzurufen
        .then(response => response.json())
        .then(data => {
            const githubToken = data.githubToken;
            // Verwenden Sie den Token hier in Ihren Anfragen an GitHub
        })
        .catch(error => {
            console.error('Fehler beim Abrufen des GitHub-Tokens:', error);
        });

    todosLaden();
});

// ...


function todosLaden() {
    fetch('/todos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Netzwerkantwort war nicht ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(todos => {
            const tabelle = document.querySelector('#todoListe tbody');
            tabelle.innerHTML = ''; // Tabelle leeren
            todos.forEach(todo => {
                const tr = document.createElement('tr');

                // Text-Spalte hinzufügen
                const textTd = document.createElement('td');
                textTd.textContent = todo.text; // Stellen Sie sicher, dass 'text' das richtige Attribut ist
                tr.appendChild(textTd);

                // Löschen-Button-Spalte hinzufügen
                const loeschTd = document.createElement('td');
                const loeschButton = document.createElement('button');
                loeschButton.textContent = 'Löschen';
                loeschButton.onclick = () => todoLoeschen(todo.id); // Verwendung von 'id' für das Löschen
                loeschTd.appendChild(loeschButton);
                tr.appendChild(loeschTd);

                tabelle.appendChild(tr);
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
            // Das To-Do-Element aus der Anzeige entfernen
            const todoElement = document.getElementById(todoId);
            if (todoElement) {
                todoElement.remove();
            }
            // Die Liste neu laden, um das gelöschte To-Do zu entfernen
            todosLaden();
        } else {
            throw new Error('Fehler beim Löschen des To-Dos: ' + response.statusText);
        }
    })
    .catch(error => {
        console.error(error);
        alert('Fehler beim Löschen des To-Dos: ' + error.message); // Zeigt den Fehler dem Benutzer an
    });
}

