import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ProjectState {
  selectedProject: string | null
  setSelectedProject: (name: string | null) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set) => ({
      selectedProject: null,
      setSelectedProject: (name) => set({ selectedProject: name }),
    }),
    { name: 'client-project-storage' },
  ),
)
