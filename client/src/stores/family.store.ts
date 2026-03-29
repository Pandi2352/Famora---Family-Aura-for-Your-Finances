import { create } from 'zustand';
import { familyApi } from '../lib/api/family.api';
import type { FamilySummary } from '../lib/api/family.api';

interface FamilyState {
  activeFamily: FamilySummary | null;
  families: FamilySummary[];
  isLoaded: boolean;

  fetchFamilies: () => Promise<void>;
  updateFamily: (name?: string, slogan?: string) => Promise<void>;
  clear: () => void;
}

export const useFamilyStore = create<FamilyState>((set, get) => ({
  activeFamily: null,
  families: [],
  isLoaded: false,

  fetchFamilies: async () => {
    try {
      const res = await familyApi.myFamilies();
      const families = res.data.data;
      set({
        families,
        activeFamily: families[0] || null,
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  updateFamily: async (name?: string, slogan?: string) => {
    const { activeFamily } = get();
    if (!activeFamily) return;

    const res = await familyApi.update(activeFamily.id, { name, slogan });
    const updated = res.data.data;

    set((state) => ({
      activeFamily: state.activeFamily
        ? { ...state.activeFamily, name: updated.name, slogan: updated.slogan }
        : null,
      families: state.families.map((f) =>
        f.id === activeFamily.id
          ? { ...f, name: updated.name, slogan: updated.slogan }
          : f,
      ),
    }));
  },

  clear: () => set({ activeFamily: null, families: [], isLoaded: false }),
}));
