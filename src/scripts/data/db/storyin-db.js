import { openDB } from "idb";

const DATABASE_NAME = "storyin-db";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAMES = {
  BOOKMARKS: "bookmarks",
  OFFLINE_POSTS: "offline-posts",
};

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAMES.BOOKMARKS)) {
      db.createObjectStore(OBJECT_STORE_NAMES.BOOKMARKS, { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAMES.OFFLINE_POSTS)) {
      db.createObjectStore(OBJECT_STORE_NAMES.OFFLINE_POSTS, {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  },
});

const StoryInDB = {
  // Bookmarks (CRD)
  async getBookmark(id) {
    return (await dbPromise).get(OBJECT_STORE_NAMES.BOOKMARKS, id);
  },
  async getAllBookmarks() {
    return (await dbPromise).getAll(OBJECT_STORE_NAMES.BOOKMARKS);
  },
  async putBookmark(story) {
    return (await dbPromise).put(OBJECT_STORE_NAMES.BOOKMARKS, story);
  },
  async deleteBookmark(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAMES.BOOKMARKS, id);
  },

  // Offline Sync (CRD)
  async addOfflinePost(post) {
    return (await dbPromise).add(OBJECT_STORE_NAMES.OFFLINE_POSTS, post);
  },
  async getAllOfflinePosts() {
    return (await dbPromise).getAll(OBJECT_STORE_NAMES.OFFLINE_POSTS);
  },
  async deleteOfflinePost(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAMES.OFFLINE_POSTS, id);
  },
};

export default StoryInDB;
