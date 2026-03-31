"use client";

import { create } from "zustand";
import type { DashboardStats, BodyMapEntryData, AuthUser } from "@/types";

interface AppState {
  user: AuthUser | null;
  dashboardStats: DashboardStats | null;
  selectedPainEntry: BodyMapEntryData | null;
  sidebarOpen: boolean;
  isLoadingStats: boolean;

  setUser: (user: AuthUser | null) => void;
  setDashboardStats: (stats: DashboardStats) => void;
  setSelectedPainEntry: (entry: BodyMapEntryData | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoadingStats: (loading: boolean) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  dashboardStats: null,
  selectedPainEntry: null,
  sidebarOpen: false,
  isLoadingStats: false,

  setUser: (user) => set({ user }),
  setDashboardStats: (dashboardStats) => set({ dashboardStats }),
  setSelectedPainEntry: (selectedPainEntry) => set({ selectedPainEntry }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setLoadingStats: (isLoadingStats) => set({ isLoadingStats }),
  reset: () =>
    set({
      user: null,
      dashboardStats: null,
      selectedPainEntry: null,
      sidebarOpen: false,
      isLoadingStats: false,
    }),
}));
