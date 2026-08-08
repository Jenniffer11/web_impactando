document.addEventListener("DOMContentLoaded", () => {
  const navOverlay = document.getElementById("navOverlay");
  const navOpenButton = document.getElementById("navOpenButton");
  const navCloseButton = document.getElementById("navCloseButton");
  const navCloseLinks = Array.from(document.querySelectorAll(".nav-close-link"));

  const setOverlayState = (isOpen) => {
    if (!navOverlay) return;
    navOverlay.classList.toggle("hidden", !isOpen);
    navOverlay.setAttribute("aria-hidden", String(!isOpen));
  };

  if (navOpenButton) {
    navOpenButton.addEventListener("click", () => setOverlayState(true));
  }

  if (navCloseButton) {
    navCloseButton.addEventListener("click", () => setOverlayState(false));
  }

  navCloseLinks.forEach((link) => {
    link.addEventListener("click", () => setOverlayState(false));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navOverlay && !navOverlay.classList.contains("hidden")) {
      setOverlayState(false);
    }
  });
});
