import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CropData {
  x: number;
  y: number;
  radius: number;
}

interface EditorState {
  originalImage: string | null;
  croppedImage: string | null;
  generatedHeader: string | null;
  cropData: CropData | null;
  isLoading: boolean;
  error: string | null;
  setOriginalImage: (image: string) => void;
  setCroppedImage: (image: string | null) => void;
  setGeneratedHeader: (header: string | null) => void;
  setCropData: (data: CropData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  originalImage: null,
  croppedImage: null,
  generatedHeader: null,
  cropData: null,
  isLoading: false,
  error: null,
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      ...initialState,
      setOriginalImage: (image) => set({ originalImage: image }),
      setCroppedImage: (image) => set({ croppedImage: image }),
      setGeneratedHeader: (header) => set({ generatedHeader: header }),
      setCropData: (data) => set({ cropData: data }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: "editor-storage",
      // Persist originalImage now that we have 5MB file size limit
      // This allows images to persist across page refreshes
    }
  )
);
