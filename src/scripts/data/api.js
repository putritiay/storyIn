import { getAccessToken } from "../utils/auth";
import CONFIG from "../config";

const ENDPOINTS = {
  // Authentications
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,

  // Story
  ADD_NEW_STORY: `${CONFIG.BASE_URL}/stories`,
  ADD_NEW_STORY_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  STORY_LIST: `${CONFIG.BASE_URL}/stories`,
  STORY_DETAIL: (id) => `${CONFIG.BASE_URL}/stories/${id}`,

  // Push Notifications
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

export async function getRegistered({ name, email, password }) {
  const data = JSON.stringify({
    name,
    email,
    password,
  });
  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });
  const json = await fetchResponse.json();
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getLogin({ email, password }) {
  const data = JSON.stringify({
    email,
    password,
  });
  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });
  const json = await fetchResponse.json();
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getAllStories() {
  const accessToken = getAccessToken();
  const fetchResponse = await fetch(ENDPOINTS.STORY_LIST, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function getStoryDetail(id) {
  const accessToken = getAccessToken();
  const fetchResponse = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await fetchResponse.json();
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function addNewStory({ description, photo, lat, lon }) {
  const accessToken = getAccessToken();

  // formData used to send multipart/form-data, which is suitable for file uploads.
  const formData = new FormData();
  formData.set("description", description);
  formData.set("lat", lat);
  formData.set("lon", lon);
  formData.append("photo", photo);

  const fetchResponse = await fetch(ENDPOINTS.ADD_NEW_STORY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
  const json = await fetchResponse.json();
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}

export async function addNewStoryWithoutAuth({
  description,
  photo,
  latitude,
  longitude,
}) {
  // formData used to send multipart/form-data, which is suitable for file uploads.
  const formData = new FormData();
  formData.set("description", description);
  formData.set("latitude", latitude);
  formData.set("longitude", longitude);
  photo.forEach((file) => {
    formData.append("photo", file);
  });

  const fetchResponse = await fetch(ENDPOINTS.ADD_NEW_STORY_GUEST, {
    method: "POST",
    body: formData,
  });
  const json = await fetchResponse.json();
  return {
    ...json,
    ok: fetchResponse.ok,
  };
}
