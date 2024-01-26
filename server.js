// Importieren notwendiger Module
const express = require('express');
const app = express();
const port = 8080;
const https = require('https');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs'); // Neu hinzugefügtes Modul für die Verwaltung der To-Do-Liste
const ARTIKEL_FALSE = 'F'; // Definition der Konstante
const SUCHTYP_ANFANGSSUCHE = 'anfangssuche';
const githubRepoURL = 'https://github.com/BiancaAH/test.git';
const githubToken = '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'; // Hier den GitHub-Token einfügen


const { exec } = require('child_process');


app.use(cors());
app.use(express.static('public')); // Statisches Hosting für das 'public'-Verzeichnis
app.use('/js', express.static(__dirname + '/js'));
app.use(express.json());

// GET-Route für die Startseite
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// GET-Route für die Anmeldeseite
app.get('/anmelden', (req, res) => {
    res.sendFile(__dirname + '/public/anmelden.html');
});

// GET-Route für Artikelabfragen
app.get('/article/:artNr', async (req, res) => {
    // Extrahiert die Artikelnummer aus der URL
    const artikelnummer = req.params.artNr || 'VKBA3236';
    const apiUrl = 'https://webisco.dandler.eu:9229/artikelanfrage';

    // Konfiguration für HTTPS-Anfragen, um unsichere Zertifikate zu akzeptieren
    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    // Anmeldeinformationen
    const username = '3319';
    const password = '123456789';

    // Erstellt eine XML-Anfrage für die Webisco API
    const xmlRequest = `
    <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <webisco type="request" version="46" username="${username}" password="${password}">
        <content>
            <artikelanfragen>
                <artikelanfrage
                    suchmuster="${artikelnummer}"
                    eancode=""
                    forceonlinecheck="${ARTIKEL_FALSE}"
                    ersatzartikelsuche="${ARTIKEL_FALSE}"
                    lieferantnummer=""
                    suchtyp="${SUCHTYP_ANFANGSSUCHE}"
                    hersteller=""
                    id="1"
                    herstellerid="0"
                    menge="1"
                    artikelid="0"
                    einspeiserid="0"/>
            </artikelanfragen>
        </content>
    </webisco>
    `;

    try {
        // Sendet die XML-Anfrage an die API und empfängt die Antwort
        const result = await axios.post(apiUrl, xmlRequest, {
            headers: {
                'Accept': 'application/xml',
                'Content-Type': 'application/xml',
                'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
            },
            httpsAgent: agent
        });

        // Loggt die Antwort und sendet sie zurück
        console.log(result.data);
        res.send(result.data || '');
    } catch (error) {
        // Fehlerbehandlung, wenn die Anfrage fehlschlägt
        console.error(error);
        res.status(500).send(error.message);
    }
});

// To-Do-Liste Routen
const TODOS_FILE = 'js/todos.json';

// Hilfsfunktion zum Lesen der To-Dos aus der JSON-Datei
function leseTodos() {
    return new Promise((resolve, reject) => {
        fs.readFile(TODOS_FILE, (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(JSON.parse(data));
        });
    });
}

// Hilfsfunktion zum Schreiben der To-Dos in die JSON-Datei
function schreibeTodos(todos) {
    return new Promise((resolve, reject) => {
        fs.writeFile(TODOS_FILE, JSON.stringify(todos), (err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

// Fügen Sie eine neue Route hinzu, um den GitHub-Token abzurufen
app.get('/github-token', (req, res) => {
console.log('GitHub-Token:', process.env.GITHUB_TOKEN);

    res.json({ githubToken: process.env.GITHUB_TOKEN });
});


// Route zum Abrufen aller To-Dos
app.get('/todos', async (req, res) => {
    try {
        const todos = await leseTodos();
        res.json(todos);
    } catch (err) {
        console.error('Fehler beim Lesen der To-Dos:', err);
        res.status(500).json({ error: 'Fehler beim Lesen der To-Dos' });
    }
});

// Route zum Hinzufügen eines neuen To-Dos
app.post('/todos', async (req, res) => {
    try {
        const todos = await leseTodos();
        const newTodo = { id: todos.length, text: req.body.text }; // Füge eine eindeutige ID hinzu
        todos.push(newTodo);
        await schreibeTodos(todos);

        // Führe Git-Commit und Push zum GitHub-Repository aus
        exec(`git add . && git commit -m "Hinzufügen eines neuen To-Dos" && git push https://${githubToken}@github.com/BiancaAH/test.git`, (error, stdout, stderr) => {
            if (error) {
                console.error('Fehler beim Git-Commit und Push:', error);
                res.status(500).send('Fehler beim Git-Commit und Push');
            } else {
                res.status(201).send('To-Do hinzugefügt und Git-Commit und Push zum GitHub-Repository erfolgreich');
            }
        });
    } catch (err) {
        res.status(500).send('Fehler beim Hinzufügen des To-Dos');
    }
});

// Route zum Löschen eines To-Dos anhand seiner ID
app.delete('/todos/:id', async (req, res) => {
    try {
        const todos = await leseTodos();
        const idToDelete = parseInt(req.params.id);
        if (!isNaN(idToDelete)) {
            const updatedTodos = todos.filter(todo => todo.id !== idToDelete);
            await schreibeTodos(updatedTodos);
            res.send('To-Do gelöscht');
        } else {
            res.status(400).send('Ungültige ID');
        }
    } catch (err) {
        res.status(500).send('Fehler beim Löschen des To-Dos');
    }
});


// Fallback-Route (Standardroute) für nicht definierte Pfade
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Starten des Servers
app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
