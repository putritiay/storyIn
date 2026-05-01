import NewPresenter from "./new-presenter";
import { convertBase64ToBlob } from "../../utils";
import * as StoryAPI from "../../data/api";
import { generateLoaderAbsoluteTemplate } from "../../templates";

export default class NewPage {
  #presenter;
  #form;
  #isCameraOpen = false;
  #takenDocumentations = [];
  #mediaStream = null;
  #videoElement = null;

  async render() {
    return `
      <section>
        <div class="new-story__header">
          <div class="container">
            <h1 class="new-story__header__title">Bagikan Cerita Anda</h1>
            <p class="new-story__header__description">
              Bagikan momen spesial atau cerita menarik Anda kepada dunia.<br>
              Biarkan orang lain terinspirasi oleh pengalaman Anda.
            </p>
          </div>
        </div>
      </section>
  
      <section class="container">
        <div id="form-toast-container" class="form-toast-container" role="alert" aria-live="polite"></div>

        <div class="story-form__container">
          <form id="new-form" class="story-form" novalidate>

            <!-- Description -->
            <div class="form-control" id="description-field">
              <label for="description-input" class="story-form__title">Cerita Anda</label>
              <div class="story-form__description__container">
                <textarea
                  id="description-input"
                  name="description"
                  placeholder="Tuliskan cerita menarik Anda di sini..."
                  aria-required="true"
                  aria-describedby="description-error"
                ></textarea>
              </div>
              <p id="description-error" class="field-error" role="alert" aria-live="assertive"></p>
            </div>

            <!-- Photo / Camera -->
            <div class="form-control" id="photo-field">
              <label class="story-form__title">Foto Cerita</label>
              <div id="documentations-more-info" class="field-hint">
                Tambahkan foto untuk membuat cerita Anda lebih hidup.
              </div>
              <p id="photo-error" class="field-error" role="alert" aria-live="assertive"></p>

              <div class="story-form__documentations__container">
                <div class="story-form__documentations__buttons">
                  <button id="documentations-input-button" class="btn btn-outline" type="button" aria-label="Pilih foto dari galeri">
                    <i class="fas fa-image"></i> Pilih Foto
                  </button>
                  <input
                    id="documentations-input"
                    class="story-form__documentations__input"
                    name="documentations"
                    type="file"
                    accept="image/*"
                    aria-describedby="documentations-more-info"
                    aria-label="Unggah foto cerita"
                  >
                  <button id="open-documentations-camera-button" class="btn btn-outline" type="button" aria-pressed="false" aria-label="Buka kamera untuk mengambil foto">
                    <i class="fas fa-camera"></i> <span id="camera-btn-text">Buka Kamera</span>
                  </button>
                </div>

                <!-- Camera Container -->
                <div id="camera-container" class="story-form__camera__container" aria-hidden="true">
                  <div class="camera-wrapper">
                    <video id="camera-video" class="camera-video" autoplay playsinline muted aria-label="Tampilan kamera langsung"></video>
                    <div class="camera-controls">
                      <button id="camera-capture-button" class="btn camera-capture-btn" type="button" aria-label="Ambil foto dari kamera">
                        <i class="fas fa-circle"></i> Ambil Foto
                      </button>
                    </div>
                    <canvas id="camera-canvas" class="camera-canvas" hidden aria-hidden="true"></canvas>
                  </div>
                </div>

                <!-- Taken Pictures List -->
                <ul id="documentations-taken-list" class="story-form__documentations__outputs" aria-label="Daftar foto yang dipilih"></ul>
              </div>
            </div>

            <!-- Location -->
            <div class="form-control">
              <div class="story-form__title">Lokasi Cerita <span class="optional-badge">(Opsional)</span></div>
              <p class="field-hint">Klik pada peta untuk memilih lokasi, atau seret penanda.</p>

              <div class="story-form__location__container">
                <div class="story-form__location__map__container">
                  <div id="map" class="story-form__location__map" role="application" aria-label="Peta interaktif untuk memilih lokasi"></div>
                  <div id="map-loading-container"></div>
                </div>
                <div class="story-form__location__lat-lng">
                  <div class="story-form__location__lat">
                    <label for="latitude">Latitude</label>
                    <input id="latitude" type="number" name="latitude" value="-6.175389" step="any" aria-label="Nilai latitude lokasi">
                  </div>
                  <div class="story-form__location__lng">
                    <label for="longitude">Longitude</label>
                    <input id="longitude" type="number" name="longitude" value="106.827139" step="any" aria-label="Nilai longitude lokasi">
                  </div>
                </div>
              </div>
            </div>

            <div class="form-buttons">
              <span id="submit-button-container">
                <button class="btn" type="submit" aria-label="Kirim cerita baru">
                  <i class="fas fa-paper-plane"></i> Bagikan Cerita
                </button>
              </span>
              <a class="btn btn-outline" href="#/" aria-label="Batalkan dan kembali ke halaman utama">
                <i class="fas fa-times"></i> Batal
              </a>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new NewPresenter({
      view: this,
      model: StoryAPI,
    });
    this.#takenDocumentations = [];

    this.#presenter.showNewFormMap();
    this.#setupForm();
    this.#setupCameraButton();

    // Stop media stream when navigating away via hash change
    window.addEventListener("hashchange", this.#handleHashChange, { once: true });
  }

  #handleHashChange = () => {
    this.#stopCameraStream();
  };

  // ─── Form Setup ────────────────────────────────────────────────────────────

  #setupForm() {
    this.#form = document.getElementById("new-form");

    this.#form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!this.#validateForm()) return;

      const data = {
        description: this.#form.elements.namedItem("description").value.trim(),
        photo: this.#takenDocumentations[0]?.blob,
        lat: this.#form.elements.namedItem("latitude").value,
        lon: this.#form.elements.namedItem("longitude").value,
      };
      await this.#presenter.postNewStory(data);
    });

    // File input trigger
    document
      .getElementById("documentations-input-button")
      .addEventListener("click", () => {
        document.getElementById("documentations-input").click();
      });

    // File selected
    document
      .getElementById("documentations-input")
      .addEventListener("change", async (event) => {
        const insertingPicturesPromises = Object.values(event.target.files).map(
          async (file) => await this.#addTakenPicture(file)
        );
        await Promise.all(insertingPicturesPromises);
        await this.#populateTakenPictures();
        this.#clearFieldError("photo-error");
      });
  }

  // ─── Validation ────────────────────────────────────────────────────────────

  #validateForm() {
    let isValid = true;

    const description = this.#form.elements.namedItem("description").value.trim();

    // Validate description
    if (!description) {
      this.#showFieldError("description-error", "Cerita tidak boleh kosong.");
      document.getElementById("description-input").focus();
      isValid = false;
    } else if (description.length < 10) {
      this.#showFieldError("description-error", "Cerita minimal 10 karakter.");
      document.getElementById("description-input").focus();
      isValid = false;
    } else {
      this.#clearFieldError("description-error");
    }

    // Validate photo
    if (this.#takenDocumentations.length === 0) {
      this.#showFieldError("photo-error", "Harap pilih atau ambil setidaknya satu foto.");
      if (isValid) document.getElementById("documentations-input-button").focus();
      isValid = false;
    } else {
      this.#clearFieldError("photo-error");
    }

    return isValid;
  }

  #showFieldError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = message;
      el.classList.add("visible");
      const fieldId = elementId.replace("-error", "-field");
      document.getElementById(fieldId)?.classList.add("has-error");
    }
  }

  #clearFieldError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.textContent = "";
      el.classList.remove("visible");
      const fieldId = elementId.replace("-error", "-field");
      document.getElementById(fieldId)?.classList.remove("has-error");
    }
  }

  // ─── Camera ────────────────────────────────────────────────────────────────

  #setupCameraButton() {
    const cameraContainer = document.getElementById("camera-container");
    const cameraBtn = document.getElementById("open-documentations-camera-button");
    const btnText = document.getElementById("camera-btn-text");

    cameraBtn.addEventListener("click", async () => {
      const isOpen = cameraContainer.classList.contains("open");

      if (isOpen) {
        // Close camera
        this.#stopCameraStream();
        cameraContainer.classList.remove("open");
        cameraContainer.setAttribute("aria-hidden", "true");
        cameraBtn.setAttribute("aria-pressed", "false");
        btnText.textContent = "Buka Kamera";
        cameraBtn.querySelector("i").className = "fas fa-camera";
        this.#isCameraOpen = false;
      } else {
        // Open camera
        cameraContainer.classList.add("open");
        cameraContainer.setAttribute("aria-hidden", "false");
        cameraBtn.setAttribute("aria-pressed", "true");
        btnText.textContent = "Tutup Kamera";
        cameraBtn.querySelector("i").className = "fas fa-times";
        this.#isCameraOpen = true;
        await this.#startCamera();
      }
    });

    // Capture button
    document.getElementById("camera-capture-button")
      .addEventListener("click", () => this.#capturePhoto());
  }

  async #startCamera() {
    this.#videoElement = document.getElementById("camera-video");

    try {
      this.#mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      this.#videoElement.srcObject = this.#mediaStream;
    } catch (err) {
      console.error("Camera access error:", err);
      let errorMsg = "Tidak dapat mengakses kamera.";
      if (err.name === "NotAllowedError") {
        errorMsg = "Akses kamera ditolak. Harap izinkan akses kamera di browser Anda.";
      } else if (err.name === "NotFoundError") {
        errorMsg = "Kamera tidak ditemukan pada perangkat ini.";
      }
      this.#showToast(errorMsg, "error");

      // Close camera container
      document.getElementById("camera-container").classList.remove("open");
      document.getElementById("camera-container").setAttribute("aria-hidden", "true");
      document.getElementById("open-documentations-camera-button").setAttribute("aria-pressed", "false");
      document.getElementById("camera-btn-text").textContent = "Buka Kamera";
      document.getElementById("open-documentations-camera-button").querySelector("i").className = "fas fa-camera";
      this.#isCameraOpen = false;
    }
  }

  #capturePhoto() {
    if (!this.#videoElement || !this.#mediaStream) return;

    const canvas = document.getElementById("camera-canvas");
    const video = this.#videoElement;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (blob) {
        await this.#addTakenPicture(blob);
        await this.#populateTakenPictures();
        this.#clearFieldError("photo-error");
        this.#showToast("Foto berhasil diambil!", "success");
      }
    }, "image/jpeg", 0.9);
  }

  #stopCameraStream() {
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.#mediaStream = null;
    }
    if (this.#videoElement) {
      this.#videoElement.srcObject = null;
      this.#videoElement = null;
    }
    this.#isCameraOpen = false;
  }

  // ─── Map ───────────────────────────────────────────────────────────────────

  async initialMap() {
    const defaultLocation = [-6.175389, 106.827139]; // Monas, Jakarta
    const mapContainer = document.getElementById("map");

    const map = L.map(mapContainer).setView(defaultLocation, 13);

    const osm = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    );
    osm.addTo(map);

    const marker = L.marker(defaultLocation, {
      draggable: true,
    }).addTo(map);

    marker.bindTooltip("Seret atau klik peta untuk pilih lokasi", {
      permanent: false,
      direction: "top",
    });

    const updateInputs = (lat, lng) => {
      this.#form.elements.namedItem("latitude").value = lat.toFixed(6);
      this.#form.elements.namedItem("longitude").value = lng.toFixed(6);
    };

    marker.on("dragend", (event) => {
      const position = event.target.getLatLng();
      updateInputs(position.lat, position.lng);
    });

    // ✅ Click on map to set lat/lng
    map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      marker.setLatLng([lat, lng]);
      updateInputs(lat, lng);
    });

    // Sync from inputs to map
    const latInput = this.#form.elements.namedItem("latitude");
    const lngInput = this.#form.elements.namedItem("longitude");

    const onInputChange = () => {
      const lat = parseFloat(latInput.value);
      const lng = parseFloat(lngInput.value);
      if (!isNaN(lat) && !isNaN(lng)) {
        const newPos = [lat, lng];
        marker.setLatLng(newPos);
        map.panTo(newPos);
      }
    };

    latInput.addEventListener("change", onInputChange);
    lngInput.addEventListener("change", onInputChange);

    // Ensure map displays correctly after render
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }

  // ─── Picture Helpers ───────────────────────────────────────────────────────

  async #addTakenPicture(image) {
    let blob = image;

    if (image instanceof String) {
      blob = await convertBase64ToBlob(image, "image/png");
    }

    const newDocumentation = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      blob: blob,
    };
    this.#takenDocumentations = [
      ...this.#takenDocumentations,
      newDocumentation,
    ];
  }

  async #populateTakenPictures() {
    const html = this.#takenDocumentations.reduce(
      (accumulator, picture, currentIndex) => {
        const imageUrl = URL.createObjectURL(picture.blob);
        return accumulator.concat(`
        <li class="story-form__documentations__outputs-item">
          <div class="photo-preview">
            <img src="${imageUrl}" alt="Dokumentasi ke-${currentIndex + 1}">
            <button
              type="button"
              data-deletepictureid="${picture.id}"
              class="photo-preview__delete-btn"
              aria-label="Hapus foto ke-${currentIndex + 1}"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </li>
      `);
      },
      ""
    );

    document.getElementById("documentations-taken-list").innerHTML = html;

    document
      .querySelectorAll("button[data-deletepictureid]")
      .forEach((button) =>
        button.addEventListener("click", (event) => {
          const pictureId = event.currentTarget.dataset.deletepictureid;
          const deleted = this.#removePicture(pictureId);
          if (!deleted) {
            console.log(`Picture with id ${pictureId} was not found`);
          }
          this.#populateTakenPictures();
        })
      );
  }

  #removePicture(id) {
    const selectedPicture = this.#takenDocumentations.find(
      (picture) => picture.id == id
    );

    if (!selectedPicture) return null;

    this.#takenDocumentations = this.#takenDocumentations.filter(
      (picture) => picture.id != selectedPicture.id
    );

    return selectedPicture;
  }

  // ─── Toast Notification ────────────────────────────────────────────────────

  #showToast(message, type = "info") {
    const container = document.getElementById("form-toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `form-toast form-toast--${type}`;
    toast.setAttribute("role", "alert");

    const icon = type === "success"
      ? "fas fa-check-circle"
      : type === "error"
      ? "fas fa-exclamation-circle"
      : "fas fa-info-circle";

    toast.innerHTML = `
      <i class="${icon}"></i>
      <span>${message}</span>
      <button class="form-toast__close" aria-label="Tutup notifikasi"><i class="fas fa-times"></i></button>
    `;

    container.appendChild(toast);

    // Close button
    toast.querySelector(".form-toast__close").addEventListener("click", () => {
      this.#dismissToast(toast);
    });

    // Auto dismiss after 5s
    setTimeout(() => this.#dismissToast(toast), 5000);

    // Trigger animation
    requestAnimationFrame(() => toast.classList.add("visible"));
  }

  #dismissToast(toast) {
    toast.classList.remove("visible");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }

  // ─── View Interface (called by Presenter) ─────────────────────────────────

  storeSuccessfully(message) {
    this.#stopCameraStream();
    this.#showToast(message || "Cerita berhasil dibagikan! 🎉", "success");

    setTimeout(() => {
      this.clearForm();
      location.href = "/";
    }, 1500);
  }

  storeFailed(message) {
    this.#showToast(message || "Gagal membagikan cerita. Silakan coba lagi.", "error");
  }

  clearForm() {
    this.#form.reset();
    this.#takenDocumentations = [];
    document.getElementById("documentations-taken-list").innerHTML = "";
  }

  showMapLoading() {
    document.getElementById("map-loading-container").innerHTML =
      generateLoaderAbsoluteTemplate();
  }

  hideMapLoading() {
    document.getElementById("map-loading-container").innerHTML = "";
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled aria-busy="true">
        <i class="fas fa-spinner loader-button"></i> Mengirim...
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" aria-label="Kirim cerita baru">
        <i class="fas fa-paper-plane"></i> Bagikan Cerita
      </button>
    `;
  }
}
