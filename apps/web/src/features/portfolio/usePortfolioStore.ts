import { create } from "zustand";
import type { PortfolioItem } from "@portfolio-share/core";

type PortfolioState = {
  items: PortfolioItem[];
  setItems: (items: PortfolioItem[]) => void;
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));
