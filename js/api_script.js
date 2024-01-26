function searchArticle() {
    const articleNumber = document.getElementById("articleNumberInput").value;
    const apiUrl = `/article/${articleNumber}`;

    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/xml',
        }
    })
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");

            // Extrahiert die Artikel aus dem XML
            const articles = xmlDoc.querySelectorAll('artikel');

            // Leert vorherige Daten
            const articleInfoContainer = document.getElementById('articleInfoContainer');
            articleInfoContainer.innerHTML = '';

            // Regulärer Ausdruck, um die genaue Artikelnummer zu überprüfen
            const regex = new RegExp(`\\b${articleNumber}\\b`);

            // Überprüfen, ob mehrere Artikel gefunden wurden
            if (articles.length === 0) {
                articleInfoContainer.innerHTML = `<p>Kein Artikel mit der Nummer ${articleNumber} gefunden.</p>`;
                return;
            }

            articles.forEach(article => {
                const herstellernummer = article.getAttribute('herstellernummer');
                const hersteller = article.getAttribute('hersteller');
                const beschreibung = article.getAttribute('beschreibung');
                const nettopreisString = article.querySelector('staffel').getAttribute('nettopreis');

                // Ersetzt Kommas mit Punkten und konvertiert in eine Gleitkommazahl
                const nettopreis = parseFloat(nettopreisString.replace(',', '.'));

                // Kalkuliert den Verkaufspreis basierend auf dem Nettopreis
                const verkaufspreis = calculateVerkaufspreis(nettopreis);

                // Erstellt einen Container für jeden Artikel
                const articleContainer = document.createElement('div');
                articleContainer.classList.add('article');

                // Füllt den Artikelcontainer mit Artikelinformationen
                articleContainer.innerHTML = `
                <h2>Artikelinformation</h2>
                <p><strong>Herstellernummer:</strong> ${herstellernummer}</p>
                <p><strong>Hersteller:</strong> ${hersteller}</p>
                <p><strong>Beschreibung:</strong> ${beschreibung}</p>
                <p><strong>Nettopreis:</strong> ${nettopreis.toFixed(2)} €</p>
                <p><strong>Verkaufspreis netto:</strong> ${verkaufspreis.toFixed(2)} €</p>
            `;

                // Fügt den Artikelcontainer zum Hauptcontainer hinzu
                articleInfoContainer.appendChild(articleContainer);
            });
        })
        .catch(error => {
            console.error(error);
        });
}

function calculateSalesPrice() {
    const nettoeinkaufspreisInput = document.getElementById("nettoeinkaufspreisInput");
    const verkaufspreisOutput = document.getElementById("verkaufspreisOutput");

    // Eingegebenen Nettoeinkaufspreis abrufen
    const nettoeinkaufspreis = parseFloat(nettoeinkaufspreisInput.value);

    // Verkaufspreis berechnen
    const verkaufspreis = calculateVerkaufspreis(nettoeinkaufspreis);

    // Verkaufspreis im HTML anzeigen
    verkaufspreisOutput.textContent = verkaufspreis.toFixed(2);
}



function calculateVerkaufspreis(nettopreis) {
    let verkaufspreis;

    if (nettopreis < 10) {
        verkaufspreis = nettopreis * 2;
    } else if (nettopreis >= 10 && nettopreis < 100) {
        verkaufspreis = nettopreis * 1.8;
    } else if (nettopreis >= 100 && nettopreis < 250) {
        verkaufspreis = nettopreis * 1.7;
    } else if (nettopreis >= 250 && nettopreis < 500) {
        verkaufspreis = nettopreis * 1.6;
    } else if (nettopreis >= 500 && nettopreis < 800) {
        verkaufspreis = nettopreis * 1.4;
    } else {
        verkaufspreis = nettopreis * 1.3;
    }

    return parseFloat(verkaufspreis.toFixed(2)); // Der Verkaufspreis wird als float-Wert mit zwei Dezimalstellen zurückgegeben
}

function calculateVerkaufspreisTyres(nettopreis) {
    return parseFloat((nettopreis * 1.2).toFixed(2)); // Der Verkaufspreis wird als float-Wert mit zwei Dezimalstellen zurückgegeben
}

function clearSearchResults() {
    document.getElementById('articleInfoContainer').innerHTML = '';
}
