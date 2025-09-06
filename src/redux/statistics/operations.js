import { createAsyncThunk } from "@reduxjs/toolkit";
import { moneyGuardAPI, setAuthHeader } from "../auth/operations";

export const getTransSummary = createAsyncThunk(
  "transactions/summary",
  async ({ month, year }, thunkApi) => {
    const token = thunkApi.getState().auth.token;
    if (!token) return thunkApi.rejectWithValue("No token");

    setAuthHeader(token);
    const date = `${month}-${year}`;

    try {
      const { data } = await moneyGuardAPI.get(`/summary?date=${date}`);
      return data.data;
    } catch (error) {
      return thunkApi.rejectWithValue(error.message);
    }
  }
);

export const getCategories = createAsyncThunk(
  "transactions/categories",
  async (_, thunkApi) => {
    try {
      const { data } = await moneyGuardAPI.get(`/categories`);
      return data.data;
    } catch (error) {
      // Fallback to predefined categories
      const defaultCategories = [
        "Main expenses",
        "Products",
        "Car",
        "Self care",
        "Child care",
        "Household products",
        "Education",
        "Leisure",
        "Other expenses",
        "Entertainment",
      ];

      // Store categories in localStorage for consistency
      localStorage.setItem("categories", JSON.stringify(defaultCategories));
      return defaultCategories;
    }
  }
);
