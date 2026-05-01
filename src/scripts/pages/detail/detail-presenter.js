export default class DetailPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async initialPage(id) {
    this.#view.showLoading();
    try {
      const response = await this.#model.getStoryDetail(id);

      if (!response.ok) {
        console.error("initialPage: response:", response);
        this.#view.populateStoryDetailError(response.message);
        return;
      }

      this.#view.populateStoryDetail(response.story);
    } catch (error) {
      console.error("initialPage: error:", error);
      this.#view.populateStoryDetailError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
