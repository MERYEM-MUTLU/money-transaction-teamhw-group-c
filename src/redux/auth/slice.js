import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import {
  loginThunk,
  logoutThunk,
  refreshUserThunk,
  registerThunk,
  editUserName,
  editUserAvatar,
  getTotalBalanceThunk,
  resetPassword,
  changePassword,
} from "./operations";

const initialState = {
  user: {
    name: null,
    email: null,
    balance: null,
    avatar: null,
  },
  preview: null,
  token: null,
  isLoggedIn: false,
  isRefreshing: false,
  isAuthLoading: false,
  isAuthError: null,
  isRegistering: false,
  isLoading: false,
  error: null,
  resetEmailSent: false,
  passwordChanged: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateBalance: (state, action) => {
      state.user.balance = action.payload;
    },
    setAvatarPreview: (state, action) => {
      state.preview = action.payload;
    },
    clearAvatarPreview: (state) => {
      state.preview = null;
    },
    // Manual logout action in case automatic logout fails
    forceLogout: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      // Logout cases - handle both success and failure
      .addCase(logoutThunk.pending, (state) => {
        state.isAuthLoading = true;
      })
      .addCase(logoutThunk.fulfilled, () => {
        // Always reset to initial state on successful logout
        return { ...initialState };
      })
      .addCase(logoutThunk.rejected, () => {
        // Even if logout fails, reset the state for security
        return { ...initialState };
      })

      // Balance cases
      .addCase(getTotalBalanceThunk.fulfilled, (state, action) => {
        state.user.balance = action.payload;
      })

      // Refresh user cases
      .addCase(refreshUserThunk.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isLoggedIn = true;
        state.isRefreshing = false;
        state.isAuthLoading = false;
        state.isAuthError = null;
      })
      .addCase(refreshUserThunk.pending, (state) => {
        state.isRefreshing = true;
        state.isAuthLoading = true;
      })
      .addCase(refreshUserThunk.rejected, (state) => {
        state.isRefreshing = false;
        state.isAuthLoading = false;
        state.isLoggedIn = false;
        state.token = null;
      })

      // Edit user name cases
      .addCase(editUserName.fulfilled, (state, action) => {
        state.user.name = action.payload.data.name;
        state.isAuthLoading = false;
      })
      .addCase(editUserName.pending, (state) => {
        state.isAuthLoading = true;
        state.isAuthError = null;
      })
      .addCase(editUserName.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isAuthError = action.payload;
      })

      // Edit user avatar cases
      .addCase(editUserAvatar.fulfilled, (state, action) => {
        state.user.avatar = action.payload.data.avatar;
        state.isAuthLoading = false;
        state.preview = null; // Clear preview after successful upload
      })
      .addCase(editUserAvatar.pending, (state) => {
        state.isAuthLoading = true;
        state.isAuthError = null;
      })
      .addCase(editUserAvatar.rejected, (state, action) => {
        state.isAuthLoading = false;
        state.isAuthError = action.payload;
      })

      // Reset password cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.resetEmailSent = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.resetEmailSent = true;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.resetEmailSent = false;
      })

      // Change password cases
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordChanged = false;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordChanged = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.passwordChanged = false;
      })

      // Login and Register success matcher
      .addMatcher(
        isAnyOf(registerThunk.fulfilled, loginThunk.fulfilled),
        (state, action) => {
          state.user.name = action.payload.data.user.name;
          state.user.email = action.payload.data.user.email;
          state.user.balance = action.payload.data.user.balance;
          state.user.avatar = action.payload.data.user.avatar;
          state.token = action.payload.data.accessToken;
          state.isLoggedIn = true;
          state.isRegistering = false;
          state.isAuthLoading = false;
          state.isAuthError = null;
        }
      )

      // Login and Register pending matcher
      .addMatcher(
        isAnyOf(registerThunk.pending, loginThunk.pending),
        (state) => {
          state.isAuthLoading = true;
          state.isAuthError = null;
          state.isRegistering = true;
        }
      )

      // Login and Register rejected matcher
      .addMatcher(
        isAnyOf(registerThunk.rejected, loginThunk.rejected),
        (state, action) => {
          state.isAuthLoading = false;
          state.isAuthError = action.payload;
          state.isRegistering = false;
          state.isLoggedIn = false;
          state.token = null;
        }
      );
  },
});

export const authReducer = authSlice.reducer;
export const {
  updateBalance,
  setAvatarPreview,
  clearAvatarPreview,
  forceLogout,
} = authSlice.actions;
