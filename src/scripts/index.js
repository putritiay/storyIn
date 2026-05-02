// CSS imports
import "../styles/styles.css";

// Component imports
import App from "./pages/app";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    drawerNavigation: document.querySelector("#navigation-drawer"),
  });

  await app.renderPage();

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });
});
