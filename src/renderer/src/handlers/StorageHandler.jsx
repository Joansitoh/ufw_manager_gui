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
    
  // Current active host
  activeHost: null,
  setActiveHost: (hostId) => set({ activeHost: hostId }),
  
  // List of connected hosts
  hosts: [],
  addHost: (host) => set((state) => ({ 
    hosts: [...state.hosts, { ...host, id: Date.now().toString() }],
    activeHost: state.hosts.length === 0 ? Date.now().toString() : state.activeHost
  })),
  removeHost: (hostId) => set((state) => {
    const newHosts = state.hosts.filter((h) => h.id !== hostId);
    const newActiveHost = state.activeHost === hostId 
      ? (newHosts.length > 0 ? newHosts[0].id : null) 
      : state.activeHost;
    
    return {
      hosts: newHosts,
      activeHost: newActiveHost
    };
  }),
  updateHostStatus: (hostId, status) => set((state) => ({
    hosts: state.hosts.map((h) => h.id === hostId ? { ...h, ...status } : h)
  })),

  resetAll: () => set({ logged: null, page: 'rules', rules: [], hosts: [], activeHost: null })
}))

export { useStorage }
