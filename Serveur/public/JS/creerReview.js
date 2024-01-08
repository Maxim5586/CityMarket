const buttonAfficher = document.getElementById("creerReview");
const div = document.getElementById("ecrireReview");

document.addEventListener('DOMContentLoaded', function() {
    const buttonAfficher = document.getElementById("creerReview");
    const div = document.getElementById("ecrireReview");

    buttonAfficher.addEventListener('click', function() {
        if (div.style.display === 'none' || div.style.display === '') {
            div.style.display = 'flex';
            buttonAfficher.innerHTML = 'Fermer le commentaire';
        } else {
            div.style.display = 'none';
            buttonAfficher.innerHTML = 'Écrire un commentaire';
        }
    });
});