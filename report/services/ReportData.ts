import { MonthlyReportModel } from "../models/MonthlyReportModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ANNUAL_REP_KEY } from "../../constants/Constant";

export const saveMonthlyData = async (ann_rep: MonthlyReportModel): Promise<void> => {
  try {
    const currentData = await getMonthlyData();

    if (!ann_rep.month.trim()) {
      throw new Error('Month is required');
    }

   const normalizedCategory = ann_rep.month.trim().toLowerCase();
    const alreadyExists = currentData.some(
      (d) => d.month.trim().toLowerCase() === normalizedCategory
    );

    if (alreadyExists) {
      throw new Error(`La datos de "${ann_rep.month}" ya existen`);
    }

    const updatedData = [...currentData, ann_rep];
    await AsyncStorage.setItem(ANNUAL_REP_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error('Error saving spending:', error);
    throw error;
  }
};

export const getMonthlyData = async (): Promise<MonthlyReportModel[]> => {
  try {
    const data = await AsyncStorage.getItem(ANNUAL_REP_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error retrieving spendings:', error);
    throw error;
  }
}

export const clearMonthlyData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ANNUAL_REP_KEY);
  } catch (error) {
    console.error('Error clearing monthly data:', error);
    throw error;
  }
}
