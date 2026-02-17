import { create } from 'zustand';
import { ConnectedPeer } from '../types';

interface CollaborationStore {
  roomId: string | null;
  connected: boolean;
  peers: ConnectedPeer[];
  syncing: boolean;
  error: string | null;
  localUser: { id: string; name: string; color: string } | null;

  setRoom: (roomId: string) => void;
  setConnected: (connected: boolean) => void;
  setPeers: (peers: ConnectedPeer[]) => void;
  setSyncing: (syncing: boolean) => void;
  setError: (error: string | null) => void;
  setLocalUser: (user: { id: string; name: string; color: string }) => void;
}

export const useCollabStore = create<CollaborationStore>((set) => ({
  roomId: null,
  connected: false,
  peers: [],
  syncing: false,
  error: null,
  localUser: null,

  setRoom: (roomId) => set({ roomId }),
  setConnected: (connected) => set({ connected }),
  setPeers: (peers) => set({ peers }),
  setSyncing: (syncing) => set({ syncing }),
  setError: (error) => set({ error }),
  setLocalUser: (user) => set({ localUser: user }),
}));
