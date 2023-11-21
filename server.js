// Importieren notwendiger Module
const express = require('express');
const app = express();
const port = 3000;
app.use(express.static('public')); // Statisches Hosting für das 'public'-Verzeichnis
const https = require('https');
const cors = require('cors');
const axios = require('axios');
const ARTIKEL_FALSE = 'F'; // Definition der Konstante
const SUCHTYP_ANFANGSSUCHE = 'anfangssuche';

app.use(cors());

app.use(cors());
app.use('/js', express.static(__dirname + '/js'));
app.use(express.text({ type: 'application/xml' }));
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});
// GET-Route für die Startseite
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.text({ type: 'application/xml' }));
app.use(express.json());
app.use(express.static('public'));


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

// Fallback-Route (Standardroute) für nicht definierte Pfade
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Starten des Servers
app.listen(port, () => {
    console.log(`Server läuft auf Port ${port}`);
});
