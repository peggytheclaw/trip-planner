import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Social proof base — makes the number feel real at launch
const BASE_COUNT = 847;

interface WaitlistStore {
  emails: string[];
  dismissed: boolean;
  joinedAt: string | null;

  addEmail: (email: string) => boolean; // returns false if already exists
  dismiss: () => void;
  getCount: () => number;
  hasEmail: (email: string) => boolean;
}

export const useWaitlistStore = create<WaitlistStore>()(
  persist(
    (set, get) => ({
      emails: [],
      dismissed: false,
      joinedAt: null,

      addEmail: (email: string) => {
        const lower = email.toLowerCase().trim();
        if (get().emails.includes(lower)) return false;
        set(state => ({
          emails: [...state.emails, lower],
          joinedAt: new Date().toISOString(),
        }));
        return true;
      },

      dismiss: () => set({ dismissed: true }),

      getCount: () => BASE_COUNT + get().emails.length,

      hasEmail: (email: string) => get().emails.includes(email.toLowerCase().trim()),
    }),
    { name: 'wanderplan-waitlist' }
  )
);
