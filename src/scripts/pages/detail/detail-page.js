import {
  generateLoaderAbsoluteTemplate,
  generateStoryDetailTemplate,
  generateStoryDetailErrorTemplate,
} from "../../templates";
import DetailPresenter from "./detail-presenter";
import * as StoryAPI from "../../data/api";
import { parseActivePathname } from "../../routes/url-parser";

export default class DetailPage {
  #presenter = null;

  async render() {
    return `
      <div id="detail-story-container" class="detail-story__container"></div>
      <div id="detail-loading-container" aria-live="polite"></div>
    `;
  }

  async afterRender() {
    const { id } = parseActivePathname();

    this.#presenter = new DetailPresenter({
      view: this,
      model: StoryAPI,
    });

    await this.#presenter.initialPage(id);
  }

  populateStoryDetail(story) {
    const container = document.getElementById("detail-story-container");
    container.innerHTML = generateStoryDetailTemplate(story);

    if (story.lat && story.lon) {
      this.#initialMap(story.lat, story.lon);
    }
  }

  populateStoryDetailError(message) {
    const container = document.getElementById("detail-story-container");
    container.innerHTML = generateStoryDetailErrorTemplate(message);
  }

  #initialMap(lat, lon) {
    // Leaflet map setup
    const map = L.map("map").setView([lat, lon], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([lat, lon]).addTo(map);

    // Force map to render correctly
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }

  showLoading() {
    document.getElementById("detail-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideLoading() {
    document.getElementById("detail-loading-container").innerHTML = "";
  }
}
