document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalSheet");

  modal.addEventListener("show.bs.modal", (event) => {
    const button = event.relatedTarget; // Button that triggered the modal

    // Get book details from data attributes
    const title = button.getAttribute("data-title");
    const author = button.getAttribute("data-author");
    const year = button.getAttribute("data-year");
    const cover = button.getAttribute("data-cover");
    const summary = button.getAttribute("data-summary");
    const edition = button.getAttribute("data-edition");
    const bookWork = button.getAttribute("data-WorkId");

    console.log("Summary data:", summary); // Debug log

    // Update modal content
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-author").textContent = author;
    document.getElementById("modal-year").textContent = year;
    document.getElementById("modal-cover").src = cover
      ? cover
      : "https://via.placeholder.com/150";

    const summaryElement = document.getElementById("modal-summary");
    summaryElement.textContent = summary || "No summary available";

    const editionElement = document.getElementById("modal-edition");
    console.log("Edition element:", editionElement); // Debug log
    editionElement.textContent = edition || "Not available";
    document.getElementById("modal-bookwork").textContent = bookWork;

    // Populate hidden form fields
    document.getElementById("form-title").value = title;
    document.getElementById("form-author").value = author;
    document.getElementById("form-year").value = year;
    document.getElementById("form-edition").value = edition;
    document.getElementById("form-summary").value = summary;
    document.getElementById("form-cover").value = cover;
    document.getElementById("form-bookwork").value = bookWork;
  });
});
