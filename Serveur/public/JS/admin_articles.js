document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const sortOrder = document.getElementById('sort-order');
    const brandFilter = document.getElementById('brand-filter');
    const sizeFilter = document.getElementById('size-filter');
    const articlesContainer = document.getElementById('articles');

    if (searchInput) {
        searchInput.addEventListener('input', filterArticles);
    }

    if (sortOrder) {
        sortOrder.addEventListener('change', filterArticles);
    }

    if (brandFilter) {
        brandFilter.addEventListener('change', filterArticles);
    }

    if (sizeFilter) {
        sizeFilter.addEventListener('change', filterArticles);
    }

    function filterArticles() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedBrand = brandFilter.value;
        const selectedSize = sizeFilter.value;
        const sortOrderValue = sortOrder.value;

        fetch('/articles/filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                searchTerm,
                selectedBrand,
                selectedSize,
                sortOrderValue,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Erreur de réponse');
                }
                return response.json();
            })
            .then((data) => {
                articlesContainer.innerHTML = '';
                data.forEach((article) => {
                    const vetement = document.createElement('div');
                    vetement.className = 'vetements';
                    vetement.dataset.id = article._id;
                    vetement.innerHTML = `
                            <a href="/articles/${article.vetement_id}" title="${article.marque_vetement} - ${article.nom_vetement}">
                                <img class="imgVetement" src="${article.image}" alt="${article.nom_vetement}">
                            </a>
                            <div class="NomEtPrix">
                                <div class="marqueVetement">Marque : ${article.marque_vetement}</div>
                                <div class="nomVetement">Nom : ${article.nom_vetement}</div>
                                <div class="tailleVetement">Taille : ${article.taille_vetement}</div>
                                <div class="prix">Prix: ${article.prix}$</div>
                            </div>
                            <div class="buttons">
                                <form action="/admin_articles/${article._id}?_method=DELETE" method="POST">
                                    <button type="submit" class="buttonSupprimer">Supprimer</button>
                                </form>
                            </div>`;
                    articlesContainer.appendChild(vetement);
                });
            })
            .catch((error) => {
                console.error('Erreur de FETCH le filtrage', error);
            });
    }
});

function deleteArticle(id) {
    fetch('/admin_articles/' + id, {
        method: 'DELETE',
    })
    .then(response => response.text())
    .then(() => window.location.reload())
    .catch((error) => {
        console.error('Error:', error);
    });
}