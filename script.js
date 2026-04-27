const searchInput = document.getElementById("search");
const cards = document.querySelectorAll(".card");

// Search
searchInput.addEventListener("keyup", function () {
    const value = this.value.toLowerCase();

    cards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        card.style.display = name.includes(value) ? "block" : "none";
    });
});

// Filter
function filterProjects(status) {
    cards.forEach(card => {
        if (status === "all") {
            card.style.display = "block";
        } else {
            card.style.display =
                card.dataset.status === status ? "block" : "none";
        }
    });
}

// Click handling (NEW SYSTEM)
cards.forEach(card => {
    card.addEventListener("click", () => {
        const link = card.dataset.link;
        if (link) {
            window.location.href = link;
        }
    });
});