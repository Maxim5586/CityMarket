function deleteArticlePanier(id) {
    fetch('/panier/' + id, {
        method: 'DELETE',
    })
    .then(response => response.text())
    .then(() => window.location.reload())
    .catch((error) => {
        console.error('Error:', error);
    });
}