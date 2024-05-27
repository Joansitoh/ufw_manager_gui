import { create } from 'zustand'

const useStorage = create((set) => ({
  logged: null,
  setLogged: (logged) => set({ logged }),

  page: 'rules',
  setPage: (page) => set({ page }),

  rules: [],
  setRules: (rules) => set({ rules }),
  addRule: (rule) => set((state) => ({ rules: [...state.rules, rule] })),
  deleteRule: (rule) =>
    set((state) => ({
      rules: state.rules.filter((r) => r !== rule)
    })),

  resetAll: () => set({ logged: null, page: 'rules', rules: [] })
}))

export { useStorage }
