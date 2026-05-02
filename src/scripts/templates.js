import { showFormattedDate } from "./utils";

export function generatePushNotificationToggleTemplate(isSubscribed) {
  return `
    <button
      id="push-subscription-button"
      class="btn btn-outline push-subscription-button ${isSubscribed ? "subscribed" : ""}"
      aria-label="${isSubscribed ? "Batalkan langganan notifikasi" : "Langganan notifikasi"}"
      title="${isSubscribed ? "Matikan Notifikasi" : "Aktifkan Notifikasi"}"
    >
      <i class="${isSubscribed ? "fas fa-bell-slash" : "fas fa-bell"}"></i>
      <span>${isSubscribed ? "Unsubscribe" : "Subscribe"}</span>
    </button>
  `;
}

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
          <div class="story-card__actions">
            <a
              href="#/detail/${story.id}"
              class="btn-text"
              aria-label="Baca cerita lengkap dari ${story.name}"
            >
              Baca Cerita <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
            <button
              class="btn-icon btn-save-story"
              data-story='${JSON.stringify({
    id: story.id,
    name: story.name,
    description: story.description,
    photoUrl: story.photoUrl,
    createdAt: story.createdAt,
  }).replace(/'/g, "&apos;")}'
              aria-label="Simpan cerita ini"
              title="Simpan Cerita"
            >
              <i class="far fa-bookmark"></i>
            </button>
          </div>
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

export function generateStoryDetailTemplate(story) {
  return `
    <div class="detail-story">
      <div class="detail-story__header">
        <div class="container">
          <a href="#/" class="btn-back" aria-label="Kembali ke daftar cerita">
            <i class="fas fa-arrow-left"></i> Kembali
          </a>
          <h1 class="detail-story__title">Cerita dari ${story.name}</h1>
        </div>
      </div>

      <div class="container">
        <div class="detail-story__content">
          <button
            class="btn-icon btn-save-story detail-story__bookmark-btn"
            data-story='${JSON.stringify({
    id: story.id,
    name: story.name,
    description: story.description,
    photoUrl: story.photoUrl,
    createdAt: story.createdAt,
  }).replace(/'/g, "&apos;")}'
            aria-label="Simpan cerita ini"
            title="Simpan Cerita"
          >
            <i class="far fa-bookmark"></i>
          </button>

          <div class="detail-story__image-container">
            <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" class="detail-story__image">
          </div>

          <div class="detail-story__info">
            <div class="detail-story__meta">
              <span class="detail-story__author">
                <i class="fas fa-user"></i> ${story.name}
              </span>
              <time class="detail-story__date" datetime="${story.createdAt}">
                <i class="fas fa-calendar-alt"></i> ${showFormattedDate(story.createdAt, "id-ID")}
              </time>
            </div>

            <p class="detail-story__description">${story.description}</p>

            ${story.lat && story.lon
      ? `
              <div class="detail-story__location">
                <h2 class="detail-story__location-title">Lokasi Cerita</h2>
                <div id="map" class="detail-story__map" role="application" aria-label="Peta lokasi cerita"></div>
              </div>
            `
      : ""
    }
          </div>
        </div>
      </div>
    </div>
  `;
}

export function generateStoryDetailErrorTemplate(message) {
  return `
    <div class="error-state" role="alert">
      <i class="fas fa-exclamation-circle error-state__icon" aria-hidden="true"></i>
      <p class="error-state__text">Gagal memuat detail cerita: ${message}</p>
      <a href="#/" class="btn btn-outline" aria-label="Kembali ke halaman utama">
        <i class="fas fa-arrow-left" aria-hidden="true"></i> Kembali ke Beranda
      </a>
    </div>
  `;
}

export function generateBookmarkPageTemplate() {
  return `
    <div class="search-filter__sticky-wrapper">
      <div class="search-filter__container">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            id="search-input" 
            placeholder="Cari cerita berdasarkan nama atau isi..." 
            aria-label="Cari cerita"
          >
        </div>
        <div class="filter-box">
          <select id="sort-filter" aria-label="Urutkan cerita">
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="alphabetical">A-Z (Nama)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="stories-list__container">
      <div id="stories-list" role="feed" aria-label="Daftar cerita tersimpan" aria-busy="true"></div>
      <div id="stories-list-loading-container" aria-live="polite"></div>
    </div>
  `;
}


export function generateBookmarkItemTemplate(story) {
  return `
    <article class="story-card bookmark-card" aria-label="Cerita tersimpan dari ${story.name}">
      <div class="story-card__image-container">
        <img class="story-card__image" src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" loading="lazy">
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
          <div class="story-card__actions">
            <a href="#/detail/${story.id}" class="btn-text">
              Baca Cerita <i class="fas fa-arrow-right"></i>
            </a>
            <button class="btn-icon btn-delete-bookmark" data-id="${story.id}" aria-label="Hapus dari simpanan" title="Hapus">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}
