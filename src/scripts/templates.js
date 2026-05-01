import { showFormattedDate } from "./utils";

export function generateMainNavigationListTemplate() {
  return `
    <li><a id="story-list-button" class="story-list-button" href="#/" aria-label="Daftar cerita">Daftar Cerita</a></li>
    <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark" aria-label="Cerita tersimpan">Cerita Tersimpan</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="login-button" href="#/login" aria-label="Masuk ke akun Anda">Login</a></li>
    <li><a id="register-button" href="#/register" aria-label="Daftar akun baru">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li>
      <a id="new-story-button" class="btn new-story-button" href="#/new" aria-label="Berbagi cerita baru">
        Berbagi Cerita <i class="fas fa-plus" aria-hidden="true"></i>
      </a>
    </li>
    <li>
      <a id="logout-button" class="logout-button" href="#/logout" aria-label="Keluar dari akun">
        <i class="fas fa-sign-out-alt" aria-hidden="true"></i> Logout
      </a>
    </li>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute" role="status" aria-label="Memuat...">
      <span class="sr-only">Memuat konten...</span>
    </div>
  `;
}

export function generateStoryItemTemplate(story) {
  return `
    <article class="story-card" aria-label="Cerita dari ${story.name}">
      <div class="story-card__image-container">
        <img
          class="story-card__image"
          src="${story.photoUrl}"
          alt="Foto cerita oleh ${story.name}"
          loading="lazy"
        >
      </div>
      <div class="story-card__content">
        <div class="story-card__header">
          <h2 class="story-card__name">${story.name}</h2>
          <time class="story-card__date" datetime="${story.createdAt}">
            ${showFormattedDate(story.createdAt, "id-ID")}
          </time>
        </div>
        <p class="story-card__description">${story.description}</p>
        <div class="story-card__footer">
          <a
            href="#/detail/${story.id}"
            class="btn-text"
            aria-label="Baca cerita lengkap dari ${story.name}"
          >
            Baca Selengkapnya <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      </div>
    </article>
  `;
}

export function generateStoriesListEmptyTemplate() {
  return `
    <div class="empty-state" role="status">
      <i class="fas fa-feather empty-state__icon" aria-hidden="true"></i>
      <p class="empty-state__text">Belum ada cerita yang dibagikan.</p>
    </div>
  `;
}

export function generateStoriesListErrorTemplate(message) {
  return `
    <div class="error-state" role="alert">
      <i class="fas fa-exclamation-circle error-state__icon" aria-hidden="true"></i>
      <p class="error-state__text">Gagal memuat cerita: ${message}</p>
      <button class="btn btn-outline" onclick="location.reload()" aria-label="Coba muat ulang halaman">
        <i class="fas fa-redo" aria-hidden="true"></i> Coba Lagi
      </button>
    </div>
  `;
}
