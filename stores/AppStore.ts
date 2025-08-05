import { create } from "zustand";
import type { SpendingModel } from "../expenses/models/SpendingModel";
import { MonthlyReportModel } from "../report/models/MonthlyReportModel";
import { getBudget } from "../budget/services/BudgetService";
import {
  getSpendings,
  getTotalSpendings,
} from "../expenses/services/SpendingService";
import { getMonthlyData } from "../report/services/ReportData";

type AppStore = {
  budget: number;
  spendings: SpendingModel[];
  generatedReports: MonthlyReportModel[];
  totalSpendings: number;
  cardExpanded: boolean;

  setBudget: (budget: number) => void;
  setSpendings: (spendings: SpendingModel[]) => void;
  setGeneratedReports: (reports: MonthlyReportModel[]) => void;
  setTotalSpendings: (totalSpendings: number) => void;
  setCardExpanded: (cardExpanded: boolean) => void;

  fetchBudget: () => Promise<void>;
  fetchSpendings: () => Promise<void>;
  fetchTotalSpendings: () => Promise<void>;
  fetchGeneratedReports: () => Promise<void>;
};

export const useAppStore = create<AppStore>((set, get) => ({
  budget: 0,
  spendings: [],
  generatedReports: [],
  totalSpendings: 0,
  cardExpanded: false,

  setCardExpanded: (cardExpanded: boolean) => set({ cardExpanded }),
  setBudget: (budget: number) => set({ budget }),
  setSpendings: (spendings: SpendingModel[]) => set({ spendings }),
  setGeneratedReports: (reports: MonthlyReportModel[]) =>
    set({ generatedReports: reports }),
  setTotalSpendings: (totalSpendings: number) => set({ totalSpendings }),

  fetchBudget: async () => {
    const budget = await getBudget();
    set({ budget: +budget! });
  },
  fetchSpendings: async () => {
    const spendings = await getSpendings();
    set({ spendings });
  },
  fetchTotalSpendings: async () => {
    const totalSpendings = await getTotalSpendings();
    set({ totalSpendings });
  },
  fetchGeneratedReports: async () => {
    const reports = await getMonthlyData();
    set({ generatedReports: reports });
  }
}));
