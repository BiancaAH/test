const express = require('express');
const https = require('https');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8080;

const ARTIKEL_FALSE = 'F';
const SUCHTYP_ANFANGSSUCHE = 'anfangssuche';

app.use(cors());
app.use(express.static('public'));
app.use('/js', express.static(__dirname + '/js'));
app.use(express.json());

const JSON_FILE_PATH = path.join(__dirname, 'public', 'todos.json');

// Funktion zum Abrufen aller To-Dos aus der JSON-Datei
function readTodosFromFile() {
  try {
    const data = fs.readFileSync(JSON_FILE_PATH, 'utf-8');
    console.log("Daten erfolgreich aus JSON-Datei gelesen.");
    return JSON.parse(data);
  } catch (err) {
    console.error('Fehler beim Lesen der JSON-Datei:', err.message);
    return [];
  }
}

// Funktion zum Speichern aller To-Dos in die JSON-Datei
function writeTodosToFile(todos) {
  try {
    fs.writeFileSync(JSON_FILE_PATH, JSON.stringify(todos, null, 2), 'utf-8');
    console.log("Daten erfolgreich in JSON-Datei geschrieben.");
  } catch (err) {
    console.error('Fehler beim Schreiben in die JSON-Datei:', err.message);
  }
}

// GET-Route für die Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      console.error("Fehler beim Senden der Startseite:", err.message);
      res.status(500).send('Fehler beim Laden der Startseite');
    }
  });
});

// GET-Route für die Anmeldeseite
app.get('/anmelden', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'anmelden.html'), (err) => {
    if (err) {
      console.error("Fehler beim Senden der Anmeldeseite:", err.message);
      res.status(500).send('Fehler beim Laden der Anmeldeseite');
    }
  });
});

// GET-Route für Artikelabfragen
app.get('/article/:artNr', async (req, res) => {
  const artikelnummer = req.params.artNr || 'VKBA3236';
  const apiUrl = 'https://webisco.dandler.eu:9229/artikelanfrage';

  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const username = '3319';
  const password = '123456789';

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
    const result = await axios.post(apiUrl, xmlRequest, {
      headers: {
        Accept: 'application/xml',
        'Content-Type': 'application/xml',
        Authorization: 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
      },
      httpsAgent: agent,
    });

    console.log("Artikelanfrage erfolgreich:", result.data);
    res.send(result.data || '');
  } catch (error) {
    console.error("Fehler bei der Artikelanfrage:", error.message);
    res.status(500).send('Fehler bei der Artikelanfrage: ' + error.message);
  }
});

// To-Do-Liste Routen

// Route zum Abrufen aller To-Dos aus der JSON-Datei
app.get('/todos', (req, res) => {
  try {
    const todos = readTodosFromFile();
    res.json(todos);
  } catch (error) {
    console.error("Fehler beim Abrufen der To-Dos:", error.message);
    res.status(500).json({ error: 'Fehler beim Abrufen der To-Dos' });
  }
});

// Route zum Hinzufügen eines neuen To-Dos in die JSON-Datei
app.post('/todos', (req, res) => {
  const aufgabeText = req.body.text;
  if (!aufgabeText) {
    console.error("Ungültige Anfrage: 'text' fehlt");
    return res.status(400).send("Fehler: 'text'-Feld ist erforderlich");
  }
  
  try {
    const todos = readTodosFromFile();
    const newTodo = { id: Date.now().toString(), text: aufgabeText };
    todos.push(newTodo);
    writeTodosToFile(todos);
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Fehler beim Hinzufügen eines neuen To-Dos:", error.message);
    res.status(500).send("Fehler beim Hinzufügen eines neuen To-Dos");
  }
});

// Route zum Löschen eines To-Dos aus der JSON-Datei anhand seiner ID
app.delete('/todos/:id', (req, res) => {
  const todoId = req.params.id;
  if (!todoId) {
    console.error("Ungültige Anfrage: 'id' fehlt");
    return res.status(400).send("Fehler: 'id'-Parameter ist erforderlich");
  }

  try {
    let todos = readTodosFromFile();
    const initialLength = todos.length;
    todos = todos.filter(todo => todo.id !== todoId);

    if (todos.length === initialLength) {
      console.warn("To-Do nicht gefunden:", todoId);
      return res.status(404).send('To-Do nicht gefunden');
    }

    writeTodosToFile(todos);
    res.send('To-Do gelöscht');
  } catch (error) {
    console.error("Fehler beim Löschen des To-Dos:", error.message);
    res.status(500).send('Fehler beim Löschen des To-Dos: ' + error.message);
  }
});

// Standardroute für nicht definierte Routen
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      console.error("Fehler beim Senden der Startseite:", err.message);
      res.status(500).send('Fehler beim Laden der Seite');
    }
  });
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
