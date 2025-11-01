import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { login as apiLogin } from "../../api/auth";
import { getProfile } from "../../api/profile";
import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  getUser as getStoredUser,
  setUser as setStoredUser,
  clearAllAuth,
} from "../../utils/storage";

// Thunk: đăng nhập và lấy profile đầy đủ
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await apiLogin(credentials); // đã lưu token + refreshToken + user (nếu có)
      const token = res.token || res.accessToken || res.access_token || getToken();
      const refreshToken = res.refreshToken || res.refresh_token || getRefreshToken();

      // Sau khi có token, lấy profile đầy đủ để đảm bảo role/name/avatar chuẩn
      try {
        const prof = await getProfile();
        const userData = prof?.user || prof;
        if (userData) setStoredUser(userData);
      } catch (_) {
        // Nếu lỗi, vẫn tiếp tục; lần sau sẽ tự fetch
      }

      const user = getStoredUser();
      return { token, refreshToken, user };
    } catch (err) {
      // Thông tin lỗi chi tiết để login page có thể xử lý 429 (rate limit)
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || "Login failed";
      const retryAfter = err?.response?.headers?.["retry-after"] || err?.response?.headers?.["Retry-After"] || null;
      return rejectWithValue({ status, message, retryAfter });
    }
  }
);

export const fetchProfileThunk = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const prof = await getProfile();
      const userData = prof?.user || prof;
      if (userData) setStoredUser(userData);
      return userData;
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Fetch profile failed";
      return rejectWithValue(message);
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  clearAllAuth();
  return true;
});

const initialState = {
  token: getToken() || null,
  refreshToken: getRefreshToken() || null,
  user: getStoredUser() || null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateFromStorage(state) {
      state.token = getToken() || null;
      state.refreshToken = getRefreshToken() || null;
      state.user = getStoredUser() || null;
    },
    setCredentials(state, action) {
      const { token, refreshToken, user } = action.payload || {};
      if (token) {
        state.token = token;
        setToken(token);
      }
      if (refreshToken) {
        state.refreshToken = refreshToken;
        setRefreshToken(refreshToken);
      }
      if (user) {
        state.user = user;
        setStoredUser(user);
      }
    },
    clearAuth(state) {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      clearAllAuth();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        state.token = action.payload?.token || null;
        state.refreshToken = action.payload?.refreshToken || null;
        state.user = action.payload?.user || state.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error?.message || "Login failed";
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.user = action.payload || state.user;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.refreshToken = null;
        state.user = null;
        state.status = "idle";
        state.error = null;
      });
  },
});

export const { hydrateFromStorage, setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
