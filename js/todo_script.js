document.addEventListener("DOMContentLoaded", function() {
    todosLaden();
});

function handleErrors(response) {
    if (!response.ok) {
        throw new Error('Netzwerkantwort war nicht ok: ' + response.statusText);
    }
    return response;
}

function todosLaden() {
    fetch('/todos')
        .then(handleErrors)
        .then(response => response.json())
        .then(todos => {
            const tabelle = document.querySelector('#todoListe tbody');
            tabelle.innerHTML = '';
            todos.forEach(todo => {
                const tr = document.createElement('tr');

                const textTd = document.createElement('td');
                textTd.textContent = todo.text;
                tr.appendChild(textTd);

                const loeschTd = document.createElement('td');
                const loeschButton = document.createElement('button');
                loeschButton.textContent = 'Löschen';
                loeschButton.addEventListener('click', () => todoLoeschen(todo._id));
                loeschTd.appendChild(loeschButton);
                tr.appendChild(loeschTd);

                tr.id = todo._id;

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
        body: JSON.stringify({ text: aufgabeText })
    })
    .then(handleErrors)
    .then(() => {
        todosLaden();
        document.getElementById('neueAufgabe').value = '';
    })
    .catch(error => {
        console.error(error);
        const fehlermeldung = document.getElementById('fehlermeldung');
        fehlermeldung.textContent = 'Fehler beim Hinzufügen des To-Dos: ' + error.message;
    });
}

function todoLoeschen(todoId) {
    if (todoId) {
        fetch(`/todos/${todoId}`, {
            method: 'DELETE'
        })
        .then(handleErrors)
        .then(() => {
            const todoElement = document.getElementById(todoId);
            if (todoElement) {
                todoElement.remove();
            }
            todosLaden();
        })
        .catch(error => {
            console.error(error);
            alert('Fehler beim Löschen des To-Dos: ' + error.message);
        });
    } else {
        console.error('Ungültige ID für das zu löschende To-Do.');
    }
}
