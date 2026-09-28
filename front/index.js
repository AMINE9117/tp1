// Attendre que le contenu de la page soit chargé
document.addEventListener("DOMContentLoaded", () => {
    
    // Sélectionner le bouton et le corps du document
    const themeToggleBtn = document.getElementById("theme-toggle");
    const body = document.body;
    const icon = themeToggleBtn.querySelector("i");

    // Vérifier si un thème est déjà sauvegardé dans le navigateur
    const currentTheme = localStorage.getItem("theme");
    if (currentTheme === "dark") {
        body.classList.add("dark-mode");
        icon.classList.replace("fa-moon", "fa-sun");
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Mode Clair';
    }

    // Ajouter un événement au clic sur le bouton
    themeToggleBtn.addEventListener("click", () => {
        body.classList.toggle("dark-mode");

        // Changer le texte et l'icône du bouton en fonction du mode
        if (body.classList.contains("dark-mode")) {
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Mode Clair';
            localStorage.setItem("theme", "dark");
        } else {
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Mode Sombre';
            localStorage.setItem("theme", "light");
        }
    });
});