const toggle = document.getElementById("themeToggle");

const saved = localStorage.getItem("theme") || "dark";

document.documentElement.setAttribute("data-theme", saved);

toggle.checked = saved === "light";

toggle.addEventListener("change", () => {

    const theme = toggle.checked ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", theme);

    localStorage.setItem("theme", theme);

});