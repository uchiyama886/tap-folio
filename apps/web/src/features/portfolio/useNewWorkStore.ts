import { create } from "zustand";
import type { PhotoSuggestion } from "@portfolio-share/core";

/**
 * 作品記録画面（/works/new）のフォーム状態。
 * 状態管理はZustandに統一する規約に従い、画面ローカルの状態をここへ集約する。
 */
type NewWorkState = {
  file: File | null;
  previewUrl: string | null;
  title: string;
  description: string;
  isSuggesting: boolean;
  isSaving: boolean;
  error: string | null;

  setFile: (file: File, previewUrl: string) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  applySuggestion: (suggestion: PhotoSuggestion) => void;
  setSuggesting: (value: boolean) => void;
  setSaving: (value: boolean) => void;
  setError: (message: string | null) => void;
  reset: () => void;
};

export const useNewWorkStore = create<NewWorkState>((set) => ({
  file: null,
  previewUrl: null,
  title: "",
  description: "",
  isSuggesting: false,
  isSaving: false,
  error: null,

  setFile: (file, previewUrl) => set({ file, previewUrl, error: null }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  applySuggestion: (suggestion) =>
    set({ title: suggestion.title, description: suggestion.description }),
  setSuggesting: (value) => set({ isSuggesting: value }),
  setSaving: (value) => set({ isSaving: value }),
  setError: (message) => set({ error: message }),
  reset: () =>
    set({
      file: null,
      previewUrl: null,
      title: "",
      description: "",
      isSuggesting: false,
      isSaving: false,
      error: null,
    }),
}));
