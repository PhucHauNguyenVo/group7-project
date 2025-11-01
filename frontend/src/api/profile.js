import apiClient from "./apiClient";
import EP from "./endpoints";

// Try a list of endpoints until one succeeds; only skip on 404/405
async function tryEndpoints(requests) {
  let lastErr;
  for (const req of requests) {
    try {
      const { method = "get", url, data, headers } = req;
      const res = await apiClient({ method, url, data, headers });
      return res.data;
    } catch (err) {
      lastErr = err;
      const status = err?.response?.status;
      if (status === 404 || status === 405) continue; // try the next candidate
      throw err; // other errors -> bail early
    }
  }
  throw lastErr || new Error("No matching endpoint");
}

// Get current user's profile (accepts multiple backend routes)
export const getProfile = async () => {
  return await tryEndpoints([
    { method: "get", url: EP.me || EP.profile },
    { method: "get", url: "/users/profile" },
    { method: "get", url: "/users/me" },
    { method: "get", url: "/profile" },
    { method: "get", url: "/auth/me" },
  ]);
};

// Update profile (PUT/PATCH across common variants)
export const updateProfile = async (updatedData) => {
  return await tryEndpoints([
    { method: "put", url: EP.profileUpdate || EP.profile, data: updatedData },
    { method: "put", url: "/users/profile", data: updatedData },
    { method: "put", url: "/users/me", data: updatedData },
    { method: "patch", url: "/users/me", data: updatedData },
    { method: "put", url: "/profile", data: updatedData },
  ]);
};

// Upload avatar using a few likely endpoints
export const uploadAvatar = async (file) => {
  const form = new FormData();
  form.append("avatar", file);
  return await tryEndpoints([
    { method: "post", url: EP.avatarUpload, data: form, headers: { "Content-Type": "multipart/form-data" } },
    { method: "post", url: "/users/upload-avatar", data: form, headers: { "Content-Type": "multipart/form-data" } },
    { method: "post", url: "/users/avatar", data: form, headers: { "Content-Type": "multipart/form-data" } },
    { method: "post", url: "/profile/avatar", data: form, headers: { "Content-Type": "multipart/form-data" } },
    { method: "post", url: "/users/me/avatar", data: form, headers: { "Content-Type": "multipart/form-data" } },
  ]);
};

// Remove avatar; first try a semantic DELETE endpoint, else fall back to updating avatar: ""
export const removeAvatar = async () => {
  try {
    return await tryEndpoints([
      { method: "delete", url: EP.avatarDelete },
      { method: "delete", url: "/users/avatar" },
      { method: "delete", url: "/profile/avatar" },
    ]);
  } catch (e) {
    // fallback: update profile with empty avatar
    return await updateProfile({ avatar: "" });
  }
};
