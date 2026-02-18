import { create } from 'zustand'

interface UIState {
  inquiryDialogOpen: boolean
  openInquiry: () => void
  closeInquiry: () => void
  setInquiryOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  inquiryDialogOpen: false,
  openInquiry: () => set({ inquiryDialogOpen: true }),
  closeInquiry: () => set({ inquiryDialogOpen: false }),
  setInquiryOpen: (open) => set({ inquiryDialogOpen: open }),
}))
