import { createAsyncThunk } from "@reduxjs/toolkit";
import { moneyGuardAPI, setAuthHeader } from "../auth/operations";

// Helper function to generate summary from transactions
const generateSummaryFromTransactions = (transactions, month, year) => {
  const filteredTransactions = transactions.filter((transaction) => {
    // Handle different date formats
    let transactionDate;
    if (transaction.date.includes("-")) {
      // Handle DD-MM-YYYY format
      const [day, monthPart, yearPart] = transaction.date.split("-");
      transactionDate = new Date(yearPart, monthPart - 1, day);
    } else {
      transactionDate = new Date(transaction.date);
    }

    const transactionMonth = transactionDate.getMonth() + 1;
    const transactionYear = transactionDate.getFullYear();

    return (
      transactionMonth === parseInt(month) && transactionYear === parseInt(year)
    );
  });

  const summary = {};

  filteredTransactions.forEach((transaction) => {
    const category = transaction.category || "Other";
    if (!summary[category]) {
      summary[category] = { category, total: 0 };
    }
    summary[category].total += parseFloat(transaction.sum) || 0;
  });

  return Object.values(summary);
};

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
      // Fallback to localStorage transactions for statistics
      const savedTransactions = localStorage.getItem("transactions");
      if (savedTransactions) {
        const transactions = JSON.parse(savedTransactions);
        return generateSummaryFromTransactions(transactions, month, year);
      }

      // Return empty data if no transactions
      return [];
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
