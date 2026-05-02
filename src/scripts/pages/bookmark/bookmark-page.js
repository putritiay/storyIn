import {
  generateLoaderAbsoluteTemplate,
  generateBookmarkPageTemplate,
  generateBookmarkItemTemplate,
} from "../../templates";
import BookmarkPresenter from "./bookmark-presenter";

export default class BookmarkPage {
  #presenter = null;
  #allStories = [];

  async render() {
    return `
      <section id="bookmark-page-container">
        <div class="new-story__header">
          <div class="container">
            <h1 class="new-story__header__title">Cerita Tersimpan</h1>
            <p class="new-story__header__description">
              Kumpulan cerita menarik yang telah Anda simpan secara lokal.<br>
              Baca kembali kapan saja, bahkan saat offline.
            </p>
          </div>
        </div>
        
        <div class="container">
          ${generateBookmarkPageTemplate()}
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new BookmarkPresenter({
      view: this,
    });

    await this.#presenter.initialPage();
    this.#setupEventListeners();
  }

  populateStoriesList(stories) {
    this.#allStories = stories;
    this.#renderStories(stories);
  }

  #renderStories(stories) {
    const storiesList = document.getElementById("stories-list");
    storiesList.setAttribute("aria-busy", "false");

    if (!stories || stories.length <= 0) {
      storiesList.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-bookmark empty-state__icon"></i>
          <p class="empty-state__text">Belum ada cerita yang disimpan.</p>
        </div>
      `;
      return;
    }

    const html = stories.reduce(
      (acc, story) => acc + generateBookmarkItemTemplate(story),
      "",
    );
    storiesList.innerHTML = `<div class="stories-list">${html}</div>`;

    this.#setupDeleteButtons();
  }

  #setupEventListeners() {
    const searchInput = document.getElementById("search-input");
    const sortFilter = document.getElementById("sort-filter");

    const handleFilter = () => {
      const searchTerm = searchInput.value.toLowerCase();
      const sortBy = sortFilter.value;

      let filtered = this.#allStories.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm) ||
          s.description.toLowerCase().includes(searchTerm),
      );

      // Sorting logic
      if (sortBy === "newest") {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === "oldest") {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else if (sortBy === "alphabetical") {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      }

      this.#renderStories(filtered);
    };

    searchInput.addEventListener("input", handleFilter);
    sortFilter.addEventListener("change", handleFilter);
  }

  #setupDeleteButtons() {
    const deleteButtons = document.querySelectorAll(".btn-delete-bookmark");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const { id } = e.currentTarget.dataset;
        if (confirm("Hapus cerita ini dari simpanan?")) {
          await this.#presenter.deleteBookmark(id);
        }
      });
    });
  }

  populateStoriesListError(message) {
    const storiesList = document.getElementById("stories-list");
    storiesList.innerHTML = `<p class="error-text">${message}</p>`;
  }

  showLoading() {
    document.getElementById("stories-list-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById("stories-list-loading-container").innerHTML = "";
  }
}
