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



function calculateVerkaufspreis(nettopreis) {
    return parseFloat((nettopreis * 1.18).toFixed(2)); // Der Verkaufspreis wird als float-Wert mit zwei Dezimalstellen zurückgegeben
}

function clearSearchResults() {
    document.getElementById('articleInfoContainer').innerHTML = '';
}
