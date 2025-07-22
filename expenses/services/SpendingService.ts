import { SpendingModel } from "../models/SpendingModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SPENDING_KEY } from "../../constants/Constant";

export const saveSpending = async (spending: SpendingModel): Promise<void> => {
  try {
    const currentSpendings = await getSpendings();

    if (!spending.category.trim()) {
      throw new Error('Category name is required');
    }

    const normalizedCategory = spending.category.trim().toLowerCase();
    const alreadyExists = currentSpendings.some(
      (s) => s.category.trim().toLowerCase() === normalizedCategory
    );

    if (alreadyExists) {
      throw new Error(`La categoría "${spending.category}" ya existe`);
    }

    const updatedSpendings = [...currentSpendings, spending];
    await AsyncStorage.setItem(SPENDING_KEY, JSON.stringify(updatedSpendings));
  } catch (error) {
    console.error('Error saving spending:', error);
    throw error;
  }
};

export const getSpendings = async (): Promise<SpendingModel[]> => {
  try {
    const value = await AsyncStorage.getItem(SPENDING_KEY);
    if (value !== null) {
      const parsedValue = JSON.parse(value);
      return parsedValue;
    }
    return [];
  } catch (error) {
    console.error('Error retrieving spendings:', error);
    throw error;
  }
};

export const updateSpending = async (spending: SpendingModel): Promise<void> => {
  try {
    const currentSpendings = await getSpendings();
    if (currentSpendings) {
      let spendings: SpendingModel[] = currentSpendings;
      spendings = spendings.map((s) =>
        s.category === spending.category ? { ...s, value: s.value + spending.value } : s
      );
      await AsyncStorage.setItem(SPENDING_KEY, JSON.stringify(spendings));
    } else {
      throw new Error('No spendings found');
    }
  } catch (error) {
    console.error('Error updating spending:', error);
    throw error;
  }
}

export const deleteSpending = async (category: string): Promise<void> => {
  try {
    const currentSpendings = await getSpendings();
    if (currentSpendings) {
      const updatedSpendings = currentSpendings.filter(s => s.category !== category);
      await AsyncStorage.setItem(SPENDING_KEY, JSON.stringify(updatedSpendings));
    } else {
      throw new Error('No spendings found');
    }
  } catch (error) {
    console.error('Error deleting spending:', error);
    throw error;
  }
};

export const getTotalSpendings = async (): Promise<number> => {
  try {
    const spendings = await getSpendings();
    return spendings.reduce((total, s) => total + s.value, 0);
  } catch (error) {
    console.error('Error calculating total spendings:', error);
    throw error;
  }
}

export const clearSpendingsValues = async (): Promise<void> => {
  try {
    const spendings = await getSpendings();
    const clearedSpendings = spendings.map(s => ({ ...s, value: 0 }));
    await AsyncStorage.setItem(SPENDING_KEY, JSON.stringify(clearedSpendings));
  } catch (error) {
    console.error('Error clearing spendings values:', error);
    throw error;
  }
}