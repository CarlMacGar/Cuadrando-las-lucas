import { MonthlyReportModel } from "../models/MonthlyReportModel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ANNUAL_REP_KEY } from "../../constants/Constant";

export const saveMonthlyData = async (
  ann_rep: MonthlyReportModel
): Promise<void> => {
  try {
    const currentData = await getMonthlyData();

    if (!ann_rep.month.trim()) {
      throw new Error("Month is required");
    }

    const normalizedCategory = ann_rep.month.trim().toLowerCase();
    const alreadyExists = currentData.some(
      (d) => d.month.trim().toLowerCase() === normalizedCategory
    );

    if (alreadyExists) {
      throw new Error(`Los datos de "${ann_rep.month}" ya existen`);
    }

    const updatedData = [...currentData, ann_rep];
    await AsyncStorage.setItem(ANNUAL_REP_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error("Error saving spending:", error);
    throw error;
  }
};

export const getMonthlyData = async (): Promise<MonthlyReportModel[]> => {
  try {
    const data = await AsyncStorage.getItem(ANNUAL_REP_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error retrieving spendings:", error);
    throw error;
  }
};

export const clearMonthlyData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ANNUAL_REP_KEY);
  } catch (error) {
    console.error("Error clearing monthly data:", error);
    throw error;
  }
};

export const monthlyReportAble = async (): Promise<boolean> => {
  try {
    const generatedReports = await getMonthlyData();
    const today = new Date();
    const day = today.getDate();

    const alreadyGenerated = generatedReports.some(
      (report) =>
        report.month.trim().toLowerCase() ===
        getDate().capitalizedMonth.trim().toLowerCase()
    );
    const withinWindow = day >= 1 && day <= 5;
    return withinWindow && !alreadyGenerated;
  } catch (error) {
    console.error("Error checking monthly report ability:", error);
    return false;
  }
};

export const saveLastReportYear = async (year: number): Promise<void> => {
  try {
    await AsyncStorage.setItem("LAST_REPORT_YEAR", JSON.stringify(year));
  } catch (error) {
    console.error("Error saving last report year:", error);
    throw error;
  }
};

export const getLastReportYear = async (): Promise<number | null> => {
  try {
    const year = await AsyncStorage.getItem("LAST_REPORT_YEAR");
    return year ? JSON.parse(year) : null;
  } catch (error) {
    console.error("Error retrieving last report year:", error);
    throw error;
  }
};

export const annualReportAble = async (): Promise<boolean> => {
  try {
    const today = new Date();
    const isJanuary = today.getMonth() === 0;
    const day = today.getDate();

    const generatedReports = await getMonthlyData();
    const DecemberGenerated = generatedReports.some(
      (report) =>
        report.month.trim().toLowerCase() === "diciembre".trim().toLowerCase()
    );
    const lastReportYear = await getLastReportYear();
    const alreadyGenerated = lastReportYear === today.getFullYear() - 1;

    const withinWindow = day >= 2 && day <= 6;
    return withinWindow && DecemberGenerated && isJanuary && !alreadyGenerated;
  } catch (error) {
    console.error("Error checking annual report ability:", error);
    return false;
  }
}

const getDate = () => {
  const now = new Date();
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const month = prevMonthDate.toLocaleString("es-CO", { month: "long" });
  const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  const year = prevMonthDate.getFullYear();
  return { capitalizedMonth, year };
};
