const searchInput = document.getElementById("searchInput");
const cards = document.querySelectorAll(".card");

searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase();

    cards.forEach(card => {
        const name = card.getAttribute("data-name").toLowerCase();

        if (name.includes(value)) {
            card.classList.remove("hide");
        } else {
            card.classList.add("hide");
        }
    });
});