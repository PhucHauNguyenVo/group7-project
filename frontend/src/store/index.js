import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Dev-only: Log thay đổi state auth (token, user) sau khi login/logout
if (process.env.NODE_ENV !== "production") {
  try {
    let prev = store.getState()?.auth || {};
    const mask = (t) => (t ? `${String(t).slice(0, 12)}…(${String(t).length})` : null);
    store.subscribe(() => {
      const next = store.getState()?.auth || {};
      const tokenChanged = prev.token !== next.token;
      const userChanged = JSON.stringify(prev.user) !== JSON.stringify(next.user);
      if (tokenChanged || userChanged) {
        /* eslint-disable no-console */
        console.log("[Redux][auth] token:", mask(next.token), "user:", next.user);
        /* eslint-enable no-console */
      }
      prev = next;
    });
  } catch (_) {
    // ignore
  }
}

export default store;
