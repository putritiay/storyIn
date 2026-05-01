import LoginPresenter from "./login-presenter";
import * as StoryAPI from "../../../data/api";
import * as AuthModel from "../../../utils/auth";

export default class LoginPage {
  #presenter = null;

  async render() {
    return `
      <section class="login-container" aria-labelledby="login-heading">
        <article class="login-form-container">
          <h1 id="login-heading" class="login__title">Masuk akun</h1>

          <form id="login-form" class="login-form" novalidate aria-describedby="login-error">
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
                aria-describedby="login-error"
              >
            </div>

            <div class="form-control">
              <label for="password-input">Password</label>
              <input
                id="password-input"
                type="password"
                name="password"
                placeholder="Masukkan password Anda"
                autocomplete="current-password"
                required
                aria-required="true"
                aria-describedby="login-error"
              >
            </div>

            <!-- Inline error region -->
            <p
              id="login-error"
              class="form-inline-error"
              role="alert"
              aria-live="assertive"
            ></p>

            <div class="form-buttons login-form__form-buttons">
              <div id="submit-button-container">
                <button class="btn" type="submit">Masuk</button>
              </div>
              <p class="login-form__do-not-have-account">
                Belum punya akun? <a href="#/register">Daftar</a>
              </p>
            </div>
          </form>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#presenter = new LoginPresenter({
      view: this,
      model: StoryAPI,
      authModel: AuthModel,
    });

    this.#setupForm();
  }

  #setupForm() {
    document
      .getElementById("login-form")
      .addEventListener("submit", async (event) => {
        event.preventDefault();
        this.#clearError();

        const data = {
          email: document.getElementById("email-input").value,
          password: document.getElementById("password-input").value,
        };
        await this.#presenter.getLogin(data);
      });
  }

  #showError(message) {
    const errorEl = document.getElementById("login-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    }
  }

  #clearError() {
    const errorEl = document.getElementById("login-error");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("visible");
    }
  }

  loginSuccessfully(message) {
    console.log(message);
    location.hash = "/";
  }

  loginFailed(message) {
    this.#showError(message || "Login gagal. Periksa email dan password Anda.");
    document.getElementById("email-input")?.focus();
  }

  showSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit" disabled aria-busy="true">
        <i class="fas fa-spinner loader-button" aria-hidden="true"></i> Masuk...
      </button>
    `;
  }

  hideSubmitLoadingButton() {
    document.getElementById("submit-button-container").innerHTML = `
      <button class="btn" type="submit">Masuk</button>
    `;
  }
}
