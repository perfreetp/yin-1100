import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FamilyMember, Task, DutyRoster, StressNote, ImportantDate } from '@/types/family';
import { mockFamilyMembers, mockTasks, mockDutyRoster, mockStressNotes, mockImportantDates } from '@/mock';
import { generateId, getDaysFromNow, isSameDate, getWeekRange } from '@/utils/date';

interface FamilyState {
  members: FamilyMember[];
  tasks: Task[];
  dutyRoster: DutyRoster[];
  stressNotes: StressNote[];
  importantDates: ImportantDate[];
  
  addMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateMember: (id: string, data: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByMember: (memberId: string) => Task[];
  getTasksByStatus: () => Record<Task['status'], Task[]>;
  
  addDuty: (duty: Omit<DutyRoster, 'id'>) => void;
  updateDuty: (id: string, data: Partial<DutyRoster>) => void;
  deleteDuty: (id: string) => void;
  getThisWeekDuties: () => DutyRoster[];
  getDutiesByDate: (date: string) => DutyRoster[];
  
  addStressNote: (note: Omit<StressNote, 'id'>) => void;
  updateStressNote: (id: string, data: Partial<StressNote>) => void;
  deleteStressNote: (id: string) => void;
  
  addImportantDate: (date: Omit<ImportantDate, 'id'>) => void;
  updateImportantDate: (id: string, data: Partial<ImportantDate>) => void;
  deleteImportantDate: (id: string) => void;
  getUpcomingImportantDates: (days?: number) => ImportantDate[];
  
  getStats: () => {
    totalMembers: number;
    pendingTasks: number;
    completedTasks: number;
    thisWeekDuties: DutyRoster[];
    upcomingImportantDates: ImportantDate[];
  };
  
  resetToMock: () => void;
}

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      members: mockFamilyMembers,
      tasks: mockTasks,
      dutyRoster: mockDutyRoster,
      stressNotes: mockStressNotes,
      importantDates: mockImportantDates,

      addMember: (member) => {
        const newMember: FamilyMember = {
          ...member,
          id: generateId(),
        };
        set((state) => ({
          members: [...state.members, newMember],
        }));
      },

      updateMember: (id, data) => {
        set((state) => ({
          members: state.members.map((m) =>
            m.id === id ? { ...m, ...data } : m
          ),
        }));
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        }));
      },

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask].sort(
            (a, b) => a.dueDate.localeCompare(b.dueDate)
          ),
        }));
      },

      updateTask: (id, data) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      getTasksByMember: (memberId) => get().tasks.filter((t) => t.memberId === memberId),

      getTasksByStatus: () => {
        const statuses: Task['status'][] = ['待办', '进行中', '已完成'];
        const grouped = {} as Record<Task['status'], Task[]>;
        statuses.forEach((s) => {
          grouped[s] = get().tasks.filter((t) => t.status === s);
        });
        return grouped;
      },

      addDuty: (duty) => {
        const newDuty: DutyRoster = {
          ...duty,
          id: generateId(),
        };
        set((state) => ({
          dutyRoster: [...state.dutyRoster, newDuty].sort(
            (a, b) => a.date.localeCompare(b.date)
          ),
        }));
      },

      updateDuty: (id, data) => {
        set((state) => ({
          dutyRoster: state.dutyRoster.map((d) =>
            d.id === id ? { ...d, ...data } : d
          ),
        }));
      },

      deleteDuty: (id) => {
        set((state) => ({
          dutyRoster: state.dutyRoster.filter((d) => d.id !== id),
        }));
      },

      getThisWeekDuties: () => {
        const { start, end } = getWeekRange();
        return get().dutyRoster.filter(
          (d) => d.date >= start && d.date <= end
        );
      },

      getDutiesByDate: (date) => get().dutyRoster.filter((d) => d.date === date),

      addStressNote: (note) => {
        const newNote: StressNote = {
          ...note,
          id: generateId(),
        };
        set((state) => ({
          stressNotes: [newNote, ...state.stressNotes].sort(
            (a, b) => b.date.localeCompare(a.date)
          ),
        }));
      },

      updateStressNote: (id, data) => {
        set((state) => ({
          stressNotes: state.stressNotes.map((n) =>
            n.id === id ? { ...n, ...data } : n
          ),
        }));
      },

      deleteStressNote: (id) => {
        set((state) => ({
          stressNotes: state.stressNotes.filter((n) => n.id !== id),
        }));
      },

      addImportantDate: (date) => {
        const newDate: ImportantDate = {
          ...date,
          id: generateId(),
        };
        set((state) => ({
          importantDates: [...state.importantDates, newDate].sort(
            (a, b) => a.date.localeCompare(b.date)
          ),
        }));
      },

      updateImportantDate: (id, data) => {
        set((state) => ({
          importantDates: state.importantDates.map((d) =>
            d.id === id ? { ...d, ...data } : d
          ),
        }));
      },

      deleteImportantDate: (id) => {
        set((state) => ({
          importantDates: state.importantDates.filter((d) => d.id !== id),
        }));
      },

      getUpcomingImportantDates: (days = 30) => {
        return get()
          .importantDates.filter((d) => {
            const daysLeft = getDaysFromNow(d.date);
            return daysLeft >= 0 && daysLeft <= days;
          })
          .sort((a, b) => getDaysFromNow(a.date) - getDaysFromNow(b.date));
      },

      getStats: () => {
        const tasks = get().tasks;
        return {
          totalMembers: get().members.length,
          pendingTasks: tasks.filter((t) => t.status !== '已完成').length,
          completedTasks: tasks.filter((t) => t.status === '已完成').length,
          thisWeekDuties: get().getThisWeekDuties(),
          upcomingImportantDates: get().getUpcomingImportantDates(14),
        };
      },

      resetToMock: () => {
        set({
          members: mockFamilyMembers,
          tasks: mockTasks,
          dutyRoster: mockDutyRoster,
          stressNotes: mockStressNotes,
          importantDates: mockImportantDates,
        });
      },
    }),
    {
      name: 'ivf-family-storage',
    }
  )
);
