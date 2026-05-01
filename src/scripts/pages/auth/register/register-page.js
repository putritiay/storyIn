import RegisterPresenter from "./register-presenter";
import * as StoryAPI from "../../../data/api";

export default class RegisterPage {
  #presenter = null;

  async render() {
    return `
      <section class="register-container" aria-labelledby="register-heading">
        <div class="register-form-container">
          <h1 id="register-heading" class="register__title">Daftar akun</h1>

          <form id="register-form" class="register-form" novalidate aria-describedby="register-error">
            <div class="form-control">
              <label for="name-input">Nama lengkap</label>
              <input
                id="name-input"
                type="text"
                name="name"
                placeholder="Masukkan nama lengkap Anda"
                autocomplete="name"
                required
                aria-required="true"
              >
            </div>

            <div class="form-control">
              <label for="email-input">Email</label>
              <input
                id="email-input"
                type="email"
                name="email"
                placeholder="Contoh: nama@email.com"
                autocomplete="email"
                required
                aria-required="true"
                aria-describedby="register-error"
              >
            </div>

            <div class="form-control">
              <label for="password-input">Password</label>
              <input
                id="password-input"
                type="password"
                name="password"
                placeholder="Minimal 8 karakter"
                autocomplete="new-password"
                required
                aria-required="true"
                minlength="8"
                aria-describedby="register-error"
              >
            </div>

            <!-- Inline error region -->
            <p
              id="register-error"
              class="form-inline-error"
              role="alert"
              aria-live="assertive"
            ></p>

            <div class="form-buttons register-form__form-buttons">
              <div id="submit-button-container">
                <button class="btn" type="submit">Daftar akun</button>
              </div>
              <p class="register-form__already-have-account">
                Sudah punya akun? <a href="#/login">Masuk</a>
              </p>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new RegisterPresenter({
      view: this,
      model: StoryAPI,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("register-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();
        this.#clearError();

        const data = {
          name: document.getElementById("name-input").value,
          email: document.getElementById("email-input").value,
          password: document.getElementById("password-input").value,
        };
        await this.#presenter.getRegistered(data);
      });
  }

  #showError(message) {
    const errorEl = document.getElementById("register-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    }
  }

  #clearError() {
    const errorEl = document.getElementById("register-error");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("visible");
    }
  }

  registeredSuccessfully(message) {
    console.log(message);
    location.hash = "/login";
  }

  registeredFailed(message) {
    this.#showError(
      message || "Pendaftaran gagal. Periksa kembali data yang dimasukkan.",
    );
    document.getElementById("name-input")?.focus();
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled aria-busy="true">
        <i class="fas fa-spinner loader-button" aria-hidden="true"></i> Mendaftar...
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Daftar akun</button>
    `;
  }
}
