import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from "../templates";
import { getAccessToken, getLogout } from "../utils/auth";

class App {
  #content = null;
  #drawerButton = null;
  #drawerNavigation = null;
  #drawerOverlay = null;
  #isRendering = false;

  constructor({ drawerNavigation, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#drawerOverlay = document.getElementById("drawer-overlay");

    this.#init();
  }

  #init() {
    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      const isOpen = this.#drawerNavigation.classList.toggle("open");
      document.body.classList.toggle("drawer-open", isOpen);

      this.#drawerButton.setAttribute("aria-expanded", String(isOpen));
      this.#drawerButton.setAttribute(
        "aria-label",
        isOpen ? "Tutup menu navigasi" : "Buka menu navigasi",
      );
    });

    if (this.#drawerOverlay) {
      this.#drawerOverlay.addEventListener("click", () => {
        this.#drawerNavigation.classList.remove("open");
        document.body.classList.remove("drawer-open");
        this.#drawerButton.setAttribute("aria-expanded", "false");
        this.#drawerButton.setAttribute("aria-label", "Buka menu navigasi");
      });
    }

    document.body.addEventListener("click", (event) => {
      if (
        !this.#drawerNavigation.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#drawerNavigation.classList.remove("open");
        this.#drawerButton.setAttribute("aria-expanded", "false");
        this.#drawerButton.setAttribute("aria-label", "Buka menu navigasi");
      }

      this.#drawerNavigation.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#drawerNavigation.classList.remove("open");
          document.body.classList.remove("drawer-open");
          this.#drawerButton.setAttribute("aria-expanded", "false");
          this.#drawerButton.setAttribute("aria-label", "Buka menu navigasi");
        }
      });
    });

    // Keyboard: close drawer with Escape
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        this.#drawerNavigation.classList.contains("open")
      ) {
        this.#drawerNavigation.classList.remove("open");
        document.body.classList.remove("drawer-open");
        this.#drawerButton.setAttribute("aria-expanded", "false");
        this.#drawerButton.setAttribute("aria-label", "Buka menu navigasi");
        this.#drawerButton.focus();
      }
    });
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navListMain =
      this.#drawerNavigation.children.namedItem("navlist-main");
    const navList = this.#drawerNavigation.children.namedItem("navlist");

    if (!isLogin) {
      navListMain.innerHTML = "";
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById("logout-button");
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();

      if (confirm("Apakah Anda yakin ingin keluar?")) {
        getLogout();
        location.hash = "/login";
      }
    });
  }

  /**
   * Stops any active camera/video media streams left over from the previous page.
   */
  async #stopActiveMediaStreams() {
    try {
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        if (video.srcObject) {
          video.srcObject.getTracks().forEach((track) => track.stop());
          video.srcObject = null;
        }
      });
    } catch (_) {
      // Ignore any permission / browser errors silently
    }
  }

  /**
   * Renders the new page content inside a View Transition when supported,
   * otherwise falls back to a CSS-only fade+slide animation.
   */
  async renderPage() {
    if (this.#isRendering) return;
    this.#isRendering = true;

    try {
      await this.#stopActiveMediaStreams();

      const url = getActiveRoute();
      const route = routes[url];
      const page = route ? route() : null;

      if (!page) {
        this.#content.innerHTML = "";
        return;
      }

      // ── View Transition API (Chrome 111+) ─────────────────────────────────
      if (document.startViewTransition) {
        const transition = document.startViewTransition(async () => {
          try {
            this.#content.innerHTML = await page.render();
            await page.afterRender();
            scrollTo({ top: 0, behavior: "instant" });
            this.#setupNavigationList();
          } catch (e) {
            console.error("DOM update failed during transition:", e);
            throw e; // Abort transition
          }
        });

        await transition.finished.catch((err) => {
          if (err?.name !== "AbortError") {
            console.warn("View transition aborted/failed:", err);
          }
        });
      } else {
        // ── CSS Fallback: fade-out old content, fade-in new content ───────────
        this.#content.classList.add("page-exit");

        await new Promise((resolve) => setTimeout(resolve, 200));

        this.#content.innerHTML = await page.render();
        await page.afterRender();
        scrollTo({ top: 0, behavior: "instant" });
        this.#setupNavigationList();

        this.#content.classList.remove("page-exit");
        this.#content.classList.add("page-enter");

        this.#content.addEventListener(
          "animationend",
          () => this.#content.classList.remove("page-enter"),
          { once: true },
        );
      }
    } finally {
      this.#isRendering = false;
    }
  }
}

export default App;
