import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Travel, Accommodation, TravelStats, Reminder } from '@/types/travel';
import { mockTravels, mockAccommodations } from '@/mock';
import { generateId, getDaysFromNow, parseISO } from '@/utils/date';
import { getDaysDiff } from '@/utils/date';

interface TravelState {
  travels: Travel[];
  accommodations: Accommodation[];
  
  addTravel: (travel: Omit<Travel, 'id'>) => void;
  updateTravel: (id: string, data: Partial<Travel>) => void;
  deleteTravel: (id: string) => void;
  addAccommodation: (accommodation: Omit<Accommodation, 'id'>) => void;
  updateAccommodation: (id: string, data: Partial<Accommodation>) => void;
  deleteAccommodation: (id: string) => void;
  getStats: () => TravelStats;
  getUpcomingReminders: () => Reminder[];
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      travels: mockTravels,
      accommodations: mockAccommodations,

      addTravel: (travel) => {
        const newTravel: Travel = {
          ...travel,
          id: generateId(),
        };
        set((state) => ({
          travels: [...state.travels, newTravel].sort(
            (a, b) => a.departureDate.localeCompare(b.departureDate)
          ),
        }));
      },

      updateTravel: (id, data) => {
        set((state) => ({
          travels: state.travels.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        }));
      },

      deleteTravel: (id) => {
        set((state) => ({
          travels: state.travels.filter((t) => t.id !== id),
        }));
      },

      addAccommodation: (accommodation) => {
        const newAccommodation: Accommodation = {
          ...accommodation,
          id: generateId(),
        };
        set((state) => ({
          accommodations: [...state.accommodations, newAccommodation].sort(
            (a, b) => a.checkInDate.localeCompare(b.checkInDate)
          ),
        }));
      },

      updateAccommodation: (id, data) => {
        set((state) => ({
          accommodations: state.accommodations.map((a) =>
            a.id === id ? { ...a, ...data } : a
          ),
        }));
      },

      deleteAccommodation: (id) => {
        set((state) => ({
          accommodations: state.accommodations.filter((a) => a.id !== id),
        }));
      },

      getStats: () => {
        const { travels, accommodations } = get();
        
        const totalTravelCost = travels
          .filter(t => t.status !== '已取消')
          .reduce((sum, t) => sum + t.cost, 0);
        
        const totalAccommodationCost = accommodations
          .filter(a => a.status !== '已取消')
          .reduce((sum, a) => sum + a.totalCost, 0);
        
        const totalNights = accommodations
          .filter(a => a.status !== '已取消')
          .reduce((sum, a) => sum + getDaysDiff(a.checkInDate, a.checkOutDate), 0);
        
        return {
          totalTravelCost,
          totalAccommodationCost,
          totalCost: totalTravelCost + totalAccommodationCost,
          totalNights,
        };
      },

      getUpcomingReminders: () => {
        const reminders: Reminder[] = [];
        const now = new Date();

        get().travels.forEach((t) => {
          if (t.status !== '已取消' && t.status !== '已完成') {
            const daysLeft = getDaysFromNow(t.departureDate);
            if (daysLeft >= 0 && daysLeft <= 14) {
              reminders.push({
                id: `travel-${t.id}`,
                type: 'travel',
                title: `${t.departure} → ${t.destination}`,
                date: t.departureDate,
                daysLeft,
                description: t.notes || '',
              });
            }
          }
        });

        get().accommodations.forEach((a) => {
          if (a.status !== '已取消' && a.status !== '已退房') {
            const daysLeft = getDaysFromNow(a.checkInDate);
            if (daysLeft >= 0 && daysLeft <= 14) {
              reminders.push({
                id: `acc-${a.id}`,
                type: 'accommodation',
                title: `入住 ${a.name}`,
                date: a.checkInDate,
                daysLeft,
                description: `${getDaysDiff(a.checkInDate, a.checkOutDate)}晚 · ${a.address}`,
              });
            }
          }
        });

        return reminders.sort((a, b) => a.daysLeft - b.daysLeft);
      },
    }),
    {
      name: 'ivf-travel-storage',
    }
  )
);
