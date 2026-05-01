import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generatePushNotificationToggleTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from "../templates";
import { getAccessToken, getLogout } from "../utils/auth";
import PushNotificationHelper from "../utils/push-notification-helper";
import * as StoryAPI from "../data/api";
import StoryInDB from "../data/db/storyin-db";

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
    this.#setupPushNotification();
    this.#setupGlobalEvents();
    this.#setupOfflineSync();
    this.#setupScrollListener();
  }

  async #setupPushNotification() {
    await PushNotificationHelper.registerServiceWorker();
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
    const navContentWrapper = this.#drawerNavigation.querySelector(".nav-content-wrapper");
    const navListMain = navContentWrapper.querySelector("#navlist-main");
    const navList = navContentWrapper.querySelector("#navlist");

    if (!isLogin) {
      navListMain.innerHTML = "";
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navListMain.innerHTML = generateMainNavigationListTemplate();
    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    this.#setupPushSubscriptionButton();
  }

  async #setupPushSubscriptionButton() {
    const pushNotificationTools = document.getElementById("push-notification-tools");
    if (!pushNotificationTools) return;

    const subscription = await PushNotificationHelper.getSubscription();
    const isSubscribed = !!subscription;

    pushNotificationTools.innerHTML = generatePushNotificationToggleTemplate(isSubscribed);

    const subscribeButton = document.getElementById("push-subscription-button");
    subscribeButton.addEventListener("click", async (event) => {
      event.preventDefault();

      const currentSubscription = await PushNotificationHelper.getSubscription();
      const isCurrentlySubscribed = !!currentSubscription;

      try {
        subscribeButton.disabled = true;
        subscribeButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>Processing...</span>`;

        if (isCurrentlySubscribed) {
          const endpoint = await PushNotificationHelper.unsubscribeUser();
          if (endpoint) {
            await StoryAPI.pushUnsubscribe(endpoint);
          }
        } else {
          const newSubscription = await PushNotificationHelper.subscribeUser();
          if (newSubscription) {
            const subJSON = newSubscription.toJSON();
            await StoryAPI.pushSubscribe({
              endpoint: subJSON.endpoint,
              keys: {
                p256dh: subJSON.keys.p256dh,
                auth: subJSON.keys.auth,
              },
            });
          }
        }

        // Re-render button
        this.#setupPushSubscriptionButton();
      } catch (error) {
        console.error("Error toggling push subscription:", error);
        alert("Gagal mengubah status langganan notifikasi. Silakan coba lagi.");
        this.#setupPushSubscriptionButton();
      }
    });
  }

  #setupGlobalEvents() {
    // Delegation for dynamic bookmark buttons
    document.body.addEventListener("click", async (event) => {
      const saveBtn = event.target.closest(".btn-save-story");
      if (saveBtn) {
        event.preventDefault();
        try {
          const storyData = JSON.parse(saveBtn.dataset.story);
          const existing = await StoryInDB.getBookmark(storyData.id);

          if (existing) {
            await StoryInDB.deleteBookmark(storyData.id);
            saveBtn.querySelector("i").className = "far fa-bookmark";
            saveBtn.classList.remove("active");
          } else {
            await StoryInDB.putBookmark(storyData);
            saveBtn.querySelector("i").className = "fas fa-bookmark";
            saveBtn.classList.add("active");
          }
        } catch (error) {
          console.error("Bookmark error:", error);
        }
      }

      // Delegation for logout button
      const logoutBtn = event.target.closest("#logout-button");
      if (logoutBtn) {
        event.preventDefault();
        if (confirm("Apakah Anda yakin ingin keluar?")) {
          getLogout();
          location.hash = "/login";
        }
      }
    });
  }

  #setupScrollListener() {
    const header = document.querySelector("header");
    if (!header) return;

    window.addEventListener("scroll", () => {
      header.classList.toggle("scrolled", window.scrollY > 20);
    });
  }

  async #setupOfflineSync() {
    // Check for offline posts on startup and whenever online
    const sync = async () => {
      if (!navigator.onLine) return;

      const offlinePosts = await StoryInDB.getAllOfflinePosts();
      if (offlinePosts.length === 0) return;

      console.log(`Syncing ${offlinePosts.length} offline posts...`);

      for (const post of offlinePosts) {
        try {
          const response = await StoryAPI.addNewStory({
            description: post.description,
            photo: post.photo,
            lat: post.lat,
            lon: post.lon,
          });

          if (response.ok) {
            await StoryInDB.deleteOfflinePost(post.id);
            console.log("Offline post synced successfully!");
          }
        } catch (error) {
          console.error("Sync failed for post:", post.id, error);
        }
      }
    };

    window.addEventListener("online", sync);
    sync(); // Run once at start
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
