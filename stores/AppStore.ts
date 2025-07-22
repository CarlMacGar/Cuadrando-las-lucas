import { create } from "zustand";
import type { SpendingModel } from "../expenses/models/SpendingModel";
import { getBudget } from "../budget/services/BudgetService";
import {
  getSpendings,
  getTotalSpendings,
} from "../expenses/services/SpendingService";
import { getPreviousMonthKey, getAnnualReportKey, getLastDecemberKey } from "../utils/PrevKeys";

type AppStore = {
  budget: number;
  spendings: SpendingModel[];
  totalSpendings: number;
  cardExpanded: boolean;
  canGenerateMonthlyReport: boolean;
  canGenerateAnnualReport: boolean;
  generatedReports: Set<string>;

  setBudget: (budget: number) => void;
  setSpendings: (spendings: SpendingModel[]) => void;
  setTotalSpendings: (totalSpendings: number) => void;
  setCardExpanded: (cardExpanded: boolean) => void;
  setCanGenerateMonthlyReport: () => void;
  setCanGenerateAnnualReport: () => void; 

  resetReports: () => void;
  addGeneratedReports: (key: string) => void;

  fetchBudget: () => Promise<void>;
  fetchSpendings: () => Promise<void>;
  fetchTotalSpendings: () => Promise<void>;
};

export const useAppStore = create<AppStore>((set, get) => ({
  budget: 0,
  spendings: [],
  totalSpendings: 0,
  cardExpanded: false,
  canGenerateMonthlyReport: false,
  canGenerateAnnualReport: false,
  generatedReports: new Set(),

  setCardExpanded: (cardExpanded: boolean) => set({ cardExpanded }),
  setBudget: (budget: number) => set({ budget }),
  setSpendings: (spendings: SpendingModel[]) => set({ spendings }),
  setTotalSpendings: (totalSpendings: number) => set({ totalSpendings }),
  setCanGenerateMonthlyReport: () => {
    const today = new Date();
    const day = today.getDate();
    const key = getPreviousMonthKey();
    const alreadyGenerated = get().generatedReports.has(key);

    const withinWindow = day >= 1 && day <= 5;
    set({ canGenerateMonthlyReport: withinWindow && !alreadyGenerated });
  },
  setCanGenerateAnnualReport: () => {
    const today = new Date();
    const isJanuary = today.getMonth() === 0;
    const day = today.getDate();

    const decemberKey = getLastDecemberKey();
    const annualKey = getAnnualReportKey();

    const alreadyGenerated = get().generatedReports.has(annualKey);
    const decemberGenerated = get().generatedReports.has(decemberKey);

    const withinWindow = isJanuary && day >= 2 && day <= 6;
    const canGenerate = withinWindow && decemberGenerated && !alreadyGenerated;

    set({ canGenerateAnnualReport: canGenerate });
  },

  resetReports: () => {
    set({ generatedReports: new Set() });
  },
  addGeneratedReports: (key: string) => {
    const current = new Set(get().generatedReports);
    current.add(key);
    set({ generatedReports: current });
  },

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
}));
