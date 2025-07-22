import AsyncStorage from '@react-native-async-storage/async-storage';
import { BADGET_KEY } from '../../constants/Constant';

export const saveBudget = async (badget: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(BADGET_KEY, JSON.stringify({badget}));
  } catch (error) {
    console.error('Error saving badget:', error);
    throw error;
  }
};

export const getBudget = async (): Promise<string | null> => {
  try {
    const value = await AsyncStorage.getItem(BADGET_KEY);
    if (value !== null) {
      const parsedValue = JSON.parse(value);
      return parsedValue.badget;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving badget:', error);
    throw error;
  }
};

export const addBudget = async (amount: number): Promise<void> => {
  try {
    const currentBadget = await getBudget();
    const newBadget = currentBadget ? parseFloat(currentBadget) + amount : amount;
    await saveBudget(newBadget.toString());
  } catch (error) {
    console.error('Error adding to badget:', error);
    throw error;
  }
};

export const subtractBudget = async (amount: number): Promise<void> => {
  try {
    const currentBadget = await getBudget();
    const newBadget = currentBadget ? parseFloat(currentBadget) - amount : -amount;
    await saveBudget(newBadget.toString());
  } catch (error) {
    console.error('Error subtracting from badget:', error);
    throw error;
  }
};