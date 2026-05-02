export default class NewPresenter {
  #view;
  #model;
  #db;

  constructor({ view, model, db }) {
    this.#view = view;
    this.#model = model;
    this.#db = db;
  }

  async showNewFormMap() {
    this.#view.showMapLoading();
    try {
      await this.#view.initialMap();
    } catch (error) {
      console.error("showNewFormMap: error:", error);
    } finally {
      this.#view.hideMapLoading();
    }
  }

  async postNewStory({ description, photo, lat, lon }) {
    this.#view.showSubmitLoadingButton();
    try {
      const data = {
        description,
        photo,
        lat,
        lon,
      };

      if (!navigator.onLine) {
        await this.#db.addOfflinePost(data);
        this.#view.storeSuccessfully(
          "Cerita disimpan secara lokal karena Anda sedang offline. Akan di-sync saat online! 📶",
          data,
        );
        return;
      }

      const response = await this.#model.addNewStory(data);

      if (!response.ok) {
        console.error("postNewStory: response:", response);
        this.#view.storeFailed(response.message);
        return;
      }

      this.#view.storeSuccessfully(response.message, response.data);
    } catch (error) {
      console.error("postNewStory: error:", error);
      this.#view.storeFailed(error.message);
    } finally {
      this.#view.hideSubmitLoadingButton();
    }
  }
}
