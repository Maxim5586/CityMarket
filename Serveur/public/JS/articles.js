document.addEventListener('DOMContentLoaded', function () {
  const searchInput = document.getElementById('search-input');
  const sortOrder = document.getElementById('sort-order');
  const brandFilter = document.getElementById('brand-filter');
  const sizeFilter = document.getElementById('size-filter');
  const vetements = Array.from(document.querySelectorAll('.vetements'));
  const initialVetementsOrder = Array.from(vetements);

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
        const articlesContainer = document.getElementById('articles');
        articlesContainer.innerHTML = '';
        data.forEach((article) => {
          const vetement = document.createElement('div');
          vetement.className = 'vetements';
          vetement.innerHTML = `
            <a href="/articles/${article.vetement_id}" title="${article.marque_vetement} - ${article.nom_vetement}">
              <img class="imgVetement" src="${article.image}" alt="${article.nom_vetement}">
              <div class="nomVetement">${article.marque_vetement} - ${article.nom_vetement}</div>
              <div class="tailleVetement">${article.taille_vetement}</div>
              <div class="prix">${article.prix} $</div>
            </a>
          `;
          articlesContainer.appendChild(vetement);
        });
      })
      .catch((error) => {
        console.error('Erreur de FETCH le filtrage', error);
      });
  }    
});