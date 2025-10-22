/**
 * Main JavaScript file
 */

// Add active class to current nav item
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentPage) {
      link.style.color = "#58a6ff";
    }
  });
});

// Log page load
console.log("Page loaded successfully!");
