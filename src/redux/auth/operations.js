import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

// The base URL has been updated to the new API endpoint
export const moneyGuardAPI = axios.create({
  baseURL: "https://wallet.b.goit.study/",
  withCredentials: true,
});

export const setAuthHeader = (token) => {
  moneyGuardAPI.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const resetAuthHeader = () => {
  moneyGuardAPI.defaults.headers.common.Authorization = ``;
};

// This thunk is now a local operation using localStorage
export const registerThunk = createAsyncThunk(
  "user/register",
  async (credentials, thunkAPI) => {
    try {
      // Simulate successful registration and store user data locally
      const dummyToken =
        "dummy-auth-token-" + Math.random().toString(36).substr(2, 9);
      const userData = {
        user: {
          name: credentials.name,
          email: credentials.email,
          balance: 0,
          avatarURL: null,
        },
        accessToken: dummyToken,
      };

      // Store the token and user data in local storage
      localStorage.setItem("userToken", dummyToken);
      localStorage.setItem("userData", JSON.stringify(userData.user));
      setAuthHeader(dummyToken);
      toast.success("Registration successful! Welcome aboard.");
      return { data: userData };
    } catch (error) {
      // Simplified error handling for local operations
      toast.error("Registration failed. Please try again.");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// This thunk is now a local operation using localStorage
export const loginThunk = createAsyncThunk(
  "user/login",
  async (credentials, thunkAPI) => {
    try {
      // Simulate successful login and retrieve token from local storage
      const dummyToken = "dummy-auth-token-123456";
      const userData = {
        user: {
          name: "Dummy User",
          email: credentials.email,
          balance: 1500.75,
          avatarURL: null,
        },
        accessToken: dummyToken,
      };

      // Store the token and user data in local storage
      localStorage.setItem("userToken", dummyToken);
      localStorage.setItem("userData", JSON.stringify(userData.user));

      setAuthHeader(dummyToken);
      toast.success("Login successful! Welcome back.");
      return { data: userData };
    } catch (error) {
      // Simplified error handling for local operations
      toast.error("Login failed. Please check your credentials.");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Fixed logout thunk - now properly handles local storage cleanup
export const logoutThunk = createAsyncThunk(
  "user/logout",
  async (_, thunkAPI) => {
    try {
      // Save current path before logout
      const state = thunkAPI.getState();
      const lastPath =
        state.router?.location?.pathname || window.location.pathname;
      localStorage.setItem("lastVisitedPage", lastPath);

      // Try to call API, but don't fail if it doesn't work
      try {
        await moneyGuardAPI.post("/auth/logout");
      } catch (apiError) {
        console.warn(
          "API logout failed, but continuing with local logout:",
          apiError
        );
      }

      // Always clear local storage and auth headers regardless of API success
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      // Keep transactions and categories for demo purposes
      // localStorage.removeItem("transactions");
      // localStorage.removeItem("categories");
      resetAuthHeader();

      toast.success("Logout successful! We'll be waiting for you!");
      return true; // Return success
    } catch (error) {
      // Even if there's an error, try to clean up local storage
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      // Keep transactions and categories for demo purposes
      // localStorage.removeItem("transactions");
      // localStorage.removeItem("categories");
      resetAuthHeader();

      toast.error("Logout completed but with some issues.");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// This thunk now uses the updated base URL
export const refreshUserThunk = createAsyncThunk(
  "user/refresh",
  async (_, thunkAPI) => {
    const savedToken = localStorage.getItem("userToken");
    const savedUserData = localStorage.getItem("userData");

    if (!savedToken) {
      return thunkAPI.rejectWithValue("Token is not exist");
    }

    setAuthHeader(savedToken);

    try {
      // Try API first, fallback to localStorage
      const { data } = await moneyGuardAPI.get("/users/current");
      return data;
    } catch (error) {
      // Fallback to localStorage data
      if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        return { data: userData };
      }
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// This thunk now uses the updated base URL
export const editUserName = createAsyncThunk(
  "users/editName",
  async ({ name }, thunkAPI) => {
    try {
      const { data } = await moneyGuardAPI.patch(`/users/current`, { name });

      // Update localStorage
      const savedUserData = localStorage.getItem("userData");
      if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        userData.name = name;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// This thunk now uses the updated base URL
export const editUserAvatar = createAsyncThunk(
  "users/editAvatar",
  async ({ avatar }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatar);

      const { data } = await moneyGuardAPI.patch(
        "/users/current/avatar",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update localStorage
      const savedUserData = localStorage.getItem("userData");
      if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        userData.avatar = data.data.avatar;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// This thunk now uses the updated base URL
export const getTotalBalanceThunk = createAsyncThunk(
  "balance/get",
  async (_, thunkAPI) => {
    try {
      const { data } = await moneyGuardAPI.get("/users/current");
      return data.data.balance;
    } catch (error) {
      // Fallback to localStorage
      const savedUserData = localStorage.getItem("userData");
      if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        return userData.balance || 0;
      }
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// This thunk now uses the updated base URL
export const resetPassword = createAsyncThunk(
  "users/resetPassword",
  async (credentials, thunkAPI) => {
    try {
      const data = await moneyGuardAPI.post(
        `/auth/send-reset-email`,
        credentials
      );
      toast.success("Reset Email password was sent successfully");
      return data.data;
    } catch (error) {
      toast.error("Failed to send reset email");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// This thunk now uses the updated base URL
export const changePassword = createAsyncThunk(
  "users/changePassword",
  async (credentials, thunkAPI) => {
    try {
      const data = await moneyGuardAPI.post("/auth/reset-pwd", credentials);
      toast.success("Password was changed successfully");
      return data.data;
    } catch (error) {
      toast.error("Failed to change password");
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
