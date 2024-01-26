const express = require('express');
const https = require('https');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const app = express();
const port = 8080;

const ARTIKEL_FALSE = 'F';
const SUCHTYP_ANFANGSSUCHE = 'anfangssuche';

app.use(cors());
app.use(express.static('public'));
app.use('/js', express.static(__dirname + '/js'));
app.use(express.json());

// MongoDB-Verbindung herstellen
const mongoURI =
  'mongodb+srv://doadmin:b0X1q9G7345tZ2rV@db-mongodb-nyc3-48965-d36c7ff1.mongo.ondigitalocean.com/admin?tls=true&authSource=admin';

async function connectToMongoDB() {
  try {
    const client = await MongoClient.connect(mongoURI);
    console.log('MongoDB verbunden');
    return client;
  } catch (err) {
    console.error('Fehler beim Verbinden mit MongoDB:', err);
    throw err;
  }
}


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
        'Accept': 'application/xml',
        'Content-Type': 'application/xml',
        'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64'),
      },
      httpsAgent: agent,
    });

    console.log(result.data);
    res.send(result.data || '');
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});

// To-Do-Liste Routen

// Route zum Abrufen aller To-Dos aus der MongoDB
app.get('/todos', async (req, res) => {
  try {
    const client = await connectToMongoDB();
    const db = client.db('Zahlungsvereinbarungen');
    const collection = db.collection('DB');
    const todos = await collection.find({}).toArray();
    res.json(todos);
    await client.close();
  } catch (err) {
    console.error('Fehler beim Lesen der To-Dos aus der MongoDB:', err);
    res.status(500).json({ error: 'Fehler beim Lesen der To-Dos' });
  }
});

// Route zum Hinzufügen eines neuen To-Dos in die MongoDB
app.post('/todos', async (req, res) => {
  const aufgabeText = req.body.text;
  try {
    const client = await connectToMongoDB();
    const db = client.db('Zahlungsvereinbarungen');
    const collection = db.collection('DB');
    await collection.insertOne({ text: aufgabeText });
    res.status(201).send('To-Do hinzugefügt');
    await client.close();
  } catch (err) {
    console.error('Fehler beim Hinzufügen des To-Dos in die MongoDB:', err);
    res.status(500).send('Fehler beim Hinzufügen des To-Dos');
  }
});

// Route zum Löschen eines To-Dos aus der MongoDB anhand seiner ID
app.delete('/todos/:id', async (req, res) => {
  const todoId = req.params.id;
  try {
    const client = await connectToMongoDB();
    const db = client.db('Zahlungsvereinbarungen');
    const collection = db.collection('DB');

    // Require the ObjectId class and create a new ObjectId
    const { ObjectId } = require('mongodb');
    const objectId = new ObjectId(todoId);

    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 1) {
      res.send('To-Do gelöscht');
    } else {
      res.status(404).send('To-Do nicht gefunden');
    }

    await client.close();
  } catch (err) {
    console.error('Fehler beim Löschen des To-Dos aus der MongoDB:', err);
    res.status(500).send('Fehler beim Löschen des To-Dos: ' + err.message);
  }
});




app.get('*', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
