// Yjs + y-webrtc collaboration utilities
// If y-webrtc or Yjs causes issues, we gracefully degrade to a UI placeholder

import { ConnectedPeer } from '../types';

export interface CollabDoc {
  tripId: string;
  connected: boolean;
  peers: ConnectedPeer[];
  provider: any | null;
  doc: any | null;
  destroy: () => void;
}

let yjsAvailable = false;

// Test if Yjs + y-webrtc are available and functional
async function checkYjsAvailability(): Promise<boolean> {
  try {
    await import('yjs');
    await import('y-webrtc');
    return true;
  } catch {
    return false;
  }
}

export async function initCollaboration(
  tripId: string,
  localPeer: { id: string; name: string; color: string },
  onPeersChange: (peers: ConnectedPeer[]) => void,
  onUpdate: (data: any) => void
): Promise<CollabDoc> {
  const available = await checkYjsAvailability();

  if (!available) {
    console.warn('Yjs/y-webrtc not available, running in offline mode');
    return {
      tripId,
      connected: false,
      peers: [],
      provider: null,
      doc: null,
      destroy: () => {},
    };
  }

  try {
    const { Doc, Map: YMap } = await import('yjs');
    const { WebrtcProvider } = await import('y-webrtc');

    const doc = new Doc();
    const provider = new WebrtcProvider(`trip-planner-${tripId}`, doc, {
      signaling: ['wss://signaling.yjs.dev', 'wss://y-webrtc-signaling-eu.herokuapp.com'],
    });

    // Track awareness (connected peers)
    provider.awareness.setLocalStateField('user', {
      id: localPeer.id,
      name: localPeer.name,
      color: localPeer.color,
      joinedAt: new Date().toISOString(),
    });

    const updatePeers = () => {
      const states = Array.from(provider.awareness.getStates().entries());
      const peers: ConnectedPeer[] = states
        .filter(([clientId]) => clientId !== provider.awareness.clientID)
        .map(([, state]) => ({
          id: state.user?.id ?? `peer-${Math.random()}`,
          name: state.user?.name ?? 'Traveler',
          color: state.user?.color ?? '#6B7280',
          joinedAt: state.user?.joinedAt ?? new Date().toISOString(),
          lastSeen: new Date().toISOString(),
        }));
      onPeersChange(peers);
    };

    provider.awareness.on('change', updatePeers);

    return {
      tripId,
      connected: true,
      peers: [],
      provider,
      doc,
      destroy: () => {
        provider.awareness.off('change', updatePeers);
        provider.destroy();
        doc.destroy();
      },
    };
  } catch (err) {
    console.warn('Failed to init collaboration:', err);
    return {
      tripId,
      connected: false,
      peers: [],
      provider: null,
      doc: null,
      destroy: () => {},
    };
  }
}

// Generate a random user color
export function randomUserColor(): string {
  const colors = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6', '#EF4444', '#EC4899', '#06B6D4'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Generate a guest name
export function generateGuestName(): string {
  const adjectives = ['Wandering', 'Curious', 'Adventurous', 'Daring', 'Happy'];
  const nouns = ['Traveler', 'Explorer', 'Nomad', 'Voyager', 'Adventurer'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
}
