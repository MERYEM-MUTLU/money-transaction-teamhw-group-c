import { createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { moneyGuardAPI, getTotalBalanceThunk } from "../auth/operations";

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchAll",
  async (_, thunkAPI) => {
    try {
      // Try API first, fallback to localStorage
      const { data } = await moneyGuardAPI.get("/transactions");
      return data.data;
    } catch (error) {
      // Fallback to localStorage
      const savedTransactions = localStorage.getItem("transactions");
      if (savedTransactions) {
        return JSON.parse(savedTransactions);
      }

      // Initialize with sample transactions if none exist
      const sampleTransactions = [
        {
          _id: "sample_1",
          date: "15-12-2024",
          type: "EXPENSE",
          category: "Products",
          comment: "Grocery shopping",
          sum: 85.5,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "sample_2",
          date: "14-12-2024",
          type: "INCOME",
          category: "Income",
          comment: "Salary payment",
          sum: 2500.0,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "sample_3",
          date: "13-12-2024",
          type: "EXPENSE",
          category: "Car",
          comment: "Gas station",
          sum: 45.0,
          createdAt: new Date().toISOString(),
        },
      ];

      localStorage.setItem("transactions", JSON.stringify(sampleTransactions));
      return sampleTransactions;
    }
  }
);

export const addTransaction = createAsyncThunk(
  "transactions/addTransaction",
  async (body, thunkAPI) => {
    try {
      // Try API first, fallback to localStorage
      const { data } = await moneyGuardAPI.post("/transactions", body);
      thunkAPI.dispatch(getTotalBalanceThunk());
      return data;
    } catch (error) {
      // Fallback to localStorage
      const newTransaction = {
        _id: "transaction_" + Math.random().toString(36).substr(2, 9),
        ...body,
        createdAt: new Date().toISOString(),
      };

      const savedTransactions = localStorage.getItem("transactions");
      const transactions = savedTransactions
        ? JSON.parse(savedTransactions)
        : [];
      transactions.push(newTransaction);
      localStorage.setItem("transactions", JSON.stringify(transactions));

      // Update user balance in localStorage
      const savedUserData = localStorage.getItem("userData");
      if (savedUserData) {
        const userData = JSON.parse(savedUserData);
        const amount = parseFloat(body.sum);
        if (body.type === "INCOME") {
          userData.balance = (userData.balance || 0) + amount;
        } else {
          userData.balance = (userData.balance || 0) - amount;
        }
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      thunkAPI.dispatch(getTotalBalanceThunk());
      return { data: { transaction: newTransaction } };
    }
  }
);

export const editTransaction = createAsyncThunk(
  "transactions/editTransaction",
  async ({ id, transaction }, thunkAPI) => {
    try {
      const { date, type, category, comment, sum } = transaction;
      const { data } = await moneyGuardAPI.patch(`/transactions/${id}`, {
        date,
        type,
        category,
        comment,
        sum,
      });
      thunkAPI.dispatch(getTotalBalanceThunk());

      return data;
    } catch (error) {
      // Fallback to localStorage
      const savedTransactions = localStorage.getItem("transactions");
      if (savedTransactions) {
        const transactions = JSON.parse(savedTransactions);
        const transactionIndex = transactions.findIndex((t) => t._id === id);
        if (transactionIndex !== -1) {
          const oldTransaction = transactions[transactionIndex];
          transactions[transactionIndex] = {
            ...oldTransaction,
            ...transaction,
            _id: id,
          };
          localStorage.setItem("transactions", JSON.stringify(transactions));

          // Update balance if amount changed
          const savedUserData = localStorage.getItem("userData");
          if (savedUserData && oldTransaction.sum !== transaction.sum) {
            const userData = JSON.parse(savedUserData);
            const oldAmount = parseFloat(oldTransaction.sum);
            const newAmount = parseFloat(transaction.sum);
            const difference = newAmount - oldAmount;

            if (oldTransaction.type === "INCOME") {
              userData.balance = (userData.balance || 0) + difference;
            } else {
              userData.balance = (userData.balance || 0) - difference;
            }
            localStorage.setItem("userData", JSON.stringify(userData));
          }

          thunkAPI.dispatch(getTotalBalanceThunk());
          return { data: transactions[transactionIndex] };
        }
      }
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  "transactions/deleteTransaction",
  async (id, thunkAPI) => {
    try {
      await moneyGuardAPI.delete(`/transactions/${id}`);
      thunkAPI.dispatch(getTotalBalanceThunk());
      toast.success("Transaction deleted successfully!");
      return id;
    } catch (error) {
      // Fallback to localStorage
      const savedTransactions = localStorage.getItem("transactions");
      if (savedTransactions) {
        const transactions = JSON.parse(savedTransactions);
        const transactionToDelete = transactions.find((t) => t._id === id);
        if (transactionToDelete) {
          // Update balance
          const savedUserData = localStorage.getItem("userData");
          if (savedUserData) {
            const userData = JSON.parse(savedUserData);
            const amount = parseFloat(transactionToDelete.sum);
            if (transactionToDelete.type === "INCOME") {
              userData.balance = (userData.balance || 0) - amount;
            } else {
              userData.balance = (userData.balance || 0) + amount;
            }
            localStorage.setItem("userData", JSON.stringify(userData));
          }

          // Remove transaction
          const updatedTransactions = transactions.filter((t) => t._id !== id);
          localStorage.setItem(
            "transactions",
            JSON.stringify(updatedTransactions)
          );

          thunkAPI.dispatch(getTotalBalanceThunk());
          toast.success("Transaction deleted successfully!");
          return id;
        }
      }
      toast.error(`Failed to delete transaction: ${error.message}`);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const copyTransaction = createAsyncThunk(
  "transactions/copyTransaction",
  async (id, thunkAPI) => {
    try {
      const { data: originalTransaction } = await moneyGuardAPI.get(
        `/transactions/${id}`
      );
      const original = originalTransaction.data;
      const transactionCopy = {
        date: original.date,
        type: original.type,
        category: original.category,
        comment: original.comment,
        sum: original.sum,
      };
      const { data } = await moneyGuardAPI.post(
        "/transactions",
        transactionCopy
      );
      thunkAPI.dispatch(getTotalBalanceThunk());
      toast.success("Transaction successfully repeated!");
      return data;
    } catch (error) {
      // Fallback to localStorage
      const savedTransactions = localStorage.getItem("transactions");
      if (savedTransactions) {
        const transactions = JSON.parse(savedTransactions);
        const originalTransaction = transactions.find((t) => t._id === id);
        if (originalTransaction) {
          const transactionCopy = {
            _id: "transaction_" + Math.random().toString(36).substr(2, 9),
            date: originalTransaction.date,
            type: originalTransaction.type,
            category: originalTransaction.category,
            comment: originalTransaction.comment,
            sum: originalTransaction.sum,
            createdAt: new Date().toISOString(),
          };

          transactions.push(transactionCopy);
          localStorage.setItem("transactions", JSON.stringify(transactions));

          // Update user balance in localStorage
          const savedUserData = localStorage.getItem("userData");
          if (savedUserData) {
            const userData = JSON.parse(savedUserData);
            const amount = parseFloat(transactionCopy.sum);
            if (transactionCopy.type === "INCOME") {
              userData.balance = (userData.balance || 0) + amount;
            } else {
              userData.balance = (userData.balance || 0) - amount;
            }
            localStorage.setItem("userData", JSON.stringify(userData));
          }

          thunkAPI.dispatch(getTotalBalanceThunk());
          toast.success("Transaction successfully repeated!");
          return { data: { transaction: transactionCopy } };
        }
      }
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
