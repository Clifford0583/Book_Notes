document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalSheet");

  modal.addEventListener("show.bs.modal", (event) => {
    const button = event.relatedTarget; // Button that triggered the modal

    // Get book details from data attributes
    const title = button.getAttribute("data-title");
    const author = button.getAttribute("data-author");
    const year = button.getAttribute("data-year");
    const cover = button.getAttribute("data-cover");

    // Update modal content
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-author").textContent = author;
    document.getElementById("modal-year").textContent = year;
    document.getElementById("modal-cover").src = cover
      ? cover
      : "https://via.placeholder.com/150";
  });
});
