import {
  generateLoaderAbsoluteTemplate,
  generateStoryItemTemplate,
  generateStoriesListEmptyTemplate,
  generateStoriesListErrorTemplate,
} from "../../templates";
import HomePresenter from "./home-presenter";
import * as StoryAPI from "../../data/api";

export default class HomePage {
  #presenter = null;
  #map = null;
  #markers = [];
  #layers = {};

  async render() {
    return `
      <section aria-label="Peta lokasi cerita">
        <div class="stories-list__map__container">
          <div
            id="map"
            class="stories-list__map"
            role="application"
            aria-label="Peta interaktif lokasi cerita"
          ></div>
          <div id="map-loading-container" aria-live="polite" aria-label="Status memuat peta"></div>
        </div>
      </section>

      <section class="container" aria-labelledby="stories-heading">
        <h1 id="stories-heading" class="section-title">Daftar Cerita Terbaru</h1>

        <div class="stories-list__container">
          <div
            id="stories-list"
            role="feed"
            aria-label="Daftar cerita terbaru"
            aria-busy="true"
          ></div>
          <div
            id="stories-list-loading-container"
            aria-live="polite"
            aria-atomic="true"
            aria-label="Status memuat cerita"
          ></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  populateStoriesList(message, stories) {
    const storiesList = document.getElementById("stories-list");
    storiesList.setAttribute("aria-busy", "false");

    if (!stories || stories.length <= 0) {
      this.populateStoriesListEmpty();
      return;
    }

    const html = stories.reduce((accumulator, story) => {
      return accumulator.concat(generateStoryItemTemplate(story));
    }, "");

    storiesList.innerHTML = `<div class="stories-list">${html}</div>`;

    this.#addMarkers(stories);
    this.#setupCardClickSync();
  }

  populateStoriesListEmpty() {
    const storiesList = document.getElementById("stories-list");
    storiesList.setAttribute("aria-busy", "false");
    storiesList.innerHTML = generateStoriesListEmptyTemplate();
  }

  populateStoriesListError(message) {
    const storiesList = document.getElementById("stories-list");
    storiesList.setAttribute("aria-busy", "false");
    storiesList.innerHTML = generateStoriesListErrorTemplate(message);
  }

  async initialMap() {
    const defaultLocation = [-2.5489, 118.0149]; // Indonesia center
    this.#map = L.map("map").setView(defaultLocation, 5);

    // Tile Layers
    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    const satellite = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community",
      },
    );

    const dark = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      },
    );

    // Default layer
    osm.addTo(this.#map);

    // Layer Control
    const baseMaps = {
      "Street View": osm,
      "Satellite View": satellite,
      "Dark Mode": dark,
    };

    L.control.layers(baseMaps).addTo(this.#map);
  }

  #addMarkers(stories) {
    // Clear existing markers
    this.#markers.forEach((marker) => this.#map.removeLayer(marker));
    this.#markers = [];

    const storyMarkers = stories.filter((story) => story.lat && story.lon);

    if (storyMarkers.length > 0) {
      const bounds = L.latLngBounds();

      storyMarkers.forEach((story) => {
        const marker = L.marker([story.lat, story.lon]).addTo(this.#map)
          .bindPopup(`
            <div class="map-popup" role="dialog" aria-label="Informasi cerita ${story.name}">
              <img
                src="${story.photoUrl}"
                class="map-popup__image"
                alt="Foto cerita oleh ${story.name}"
              >
              <h2 class="map-popup__name">${story.name}</h2>
              <p class="map-popup__desc">${story.description.substring(0, 80)}...</p>
              <a href="#/detail/${story.id}" class="btn-text" aria-label="Lihat detail cerita dari ${story.name}">
                Lihat Detail <i class="fas fa-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          `);

        this.#markers.push(marker);
        bounds.extend([story.lat, story.lon]);
      });

      this.#map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  #setupCardClickSync() {
    const cards = document.querySelectorAll(".story-card");

    cards.forEach((card, index) => {
      // Make card keyboard-operable for map sync
      card.setAttribute("tabindex", "0");

      const handleSync = (e) => {
        // Let the "Baca Selengkapnya" link handle its own navigation
        if (e.target.closest(".btn-text")) return;

        const marker = this.#markers[index];
        if (marker) {
          this.#map.flyTo(marker.getLatLng(), 15);
          marker.openPopup();

          // Scroll map into view on mobile
          if (window.innerWidth < 768) {
            document
              .getElementById("map")
              .scrollIntoView({ behavior: "smooth" });
          }
        }
      };

      card.addEventListener("click", handleSync);

      // Keyboard: Enter or Space triggers map sync
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSync(e);
        }
      });
    });
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showLoading() {
    document.getElementById("stories-list").setAttribute("aria-busy", "true");
    document.getElementById("stories-list-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById("stories-list-loading-container").innerHTML = "";
  }
}
