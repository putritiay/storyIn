import StoryInDB from "../../data/db/storyin-db";

export default class BookmarkPresenter {
  #view;

  constructor({ view }) {
    this.#view = view;
  }

  async initialPage() {
    this.#view.showLoading();
    try {
      const stories = await StoryInDB.getAllBookmarks();
      this.#view.populateStoriesList(stories);
    } catch (error) {
      console.error("initialPage: error:", error);
      this.#view.populateStoriesListError(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }

  async deleteBookmark(id) {
    try {
      await StoryInDB.deleteBookmark(id);
      const stories = await StoryInDB.getAllBookmarks();
      this.#view.populateStoriesList(stories);
    } catch (error) {
      console.error("deleteBookmark: error:", error);
    }
  }
}
