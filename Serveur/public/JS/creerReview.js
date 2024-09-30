const buttonAfficher = document.getElementById("creerReview");
const div = document.getElementById("ecrireReview");

document.addEventListener('DOMContentLoaded', function() {
    const buttonAfficher = document.getElementById("creerReview");
    const div = document.getElementById("ecrireReview");

    buttonAfficher.addEventListener('click', function() {
        if (div.style.display === 'none' || div.style.display === '') {
            div.style.display = 'flex';
            buttonAfficher.innerHTML = 'Close Comment';
        } else {
            div.style.display = 'none';
            buttonAfficher.innerHTML = 'Write a Comment';
        }
    });
});