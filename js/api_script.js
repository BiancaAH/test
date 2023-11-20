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
            if (articles.length > 1) {
                articleInfoContainer.innerHTML = `<p>Mehrere Artikel mit der Nummer ${articleNumber} gefunden. Bitte präzisieren Sie die Suche.</p>`;
                return;
            }

            articles.forEach(article => {
                const herstellernummer = article.getAttribute('herstellernummer');
                const hersteller = article.getAttribute('hersteller');
                const beschreibung = article.getAttribute('beschreibung');
                const nettopreisString = article.querySelector('staffel').getAttribute('nettopreis');

                // Ersetzt Kommas mit Punkten
                const nettopreis = parseFloat(nettopreisString.replace(',', '.'));

                //Kontrolliert ob die ID eindeutig ist
                if (regex.test(herstellernummer)) {
                    // Kalkuliert den VK basierend auf EK
                    const verkaufspreis = calculateVerkaufspreis(nettopreis);

                    // erstellt einen Container für jeden Artikel
                    const articleContainer = document.createElement('div');
                    articleContainer.classList.add('article');

                    // Fülle den Artikelcontainer mit Artikelinformationen
                    articleContainer.innerHTML = `
                        <h2>Artikelinformation</h2>
                        <p><strong>Herstellernummer:</strong> ${herstellernummer}</p>
                        <p><strong>Hersteller:</strong> ${hersteller}</p>
                        <p><strong>Beschreibung:</strong> ${beschreibung}</p>
                        <p><strong>Nettopreis:</strong> ${nettopreis.toFixed(2)} €</p>
                        <p><strong>Verkaufspreis:</strong> ${verkaufspreis.toFixed(2)} €</p>
                    `;

                    // Füge den Artikelcontainer zum Hauptcontainer hinzu
                    articleInfoContainer.appendChild(articleContainer);
                }
            });
        })
        .catch(error => {
            console.error(error);

        });
}

// Funktion zur Berechnung des Verkaufspreises basierend auf dem Nettopreis
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
        verkaufspreis = nettopreis * 1.5;
    } else {
        verkaufspreis = nettopreis * 1.4;
    }

    return parseFloat(verkaufspreis.toFixed(2)); // Der Verkaufspreis wird als float-Wert mit zwei Dezimalstellen zurückgegeben
}

function clearSearchResults() {
    document.getElementById('articleInfoContainer').innerHTML = '';
}
