import React, { useState } from 'react';
import { Wifi, WifiOff, Users } from 'lucide-react';
import { ConnectedPeer } from '../types';

interface CollabAvatarsProps {
  connected: boolean;
  peers: ConnectedPeer[];
  localUser: { name: string; color: string } | null;
  onCopyLink?: () => void;
  shareUrl?: string;
}

export default function CollabAvatars({
  connected,
  peers,
  localUser,
  onCopyLink,
  shareUrl,
}: CollabAvatarsProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const allUsers = [
    localUser ? { ...localUser, id: 'local', isLocal: true } : null,
    ...peers.map(p => ({ ...p, isLocal: false })),
  ].filter(Boolean) as Array<{ id: string; name: string; color: string; isLocal?: boolean }>;

  return (
    <div className="flex items-center gap-2">
      {/* Connection indicator */}
      <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium
        ${connected
          ? 'bg-green-50 text-green-600 border border-green-100'
          : 'bg-gray-50 text-gray-400 border border-gray-100'
        }`}
      >
        {connected ? (
          <>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </>
        ) : (
          <>
            <WifiOff size={10} />
            Offline
          </>
        )}
      </div>

      {/* Avatar stack */}
      <div className="relative flex items-center">
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className="flex items-center"
        >
          <div className="flex -space-x-1.5">
            {allUsers.slice(0, 4).map((user, i) => (
              <div
                key={user.id}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold
                           border-2 border-white shadow-sm ring-1 ring-white"
                style={{ backgroundColor: user.color, zIndex: 10 - i }}
                title={user.name + (user.isLocal ? ' (you)' : '')}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ))}
            {allUsers.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border-2 border-white">
                +{allUsers.length - 4}
              </div>
            )}
          </div>
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-50 min-w-[180px]">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Travelers
            </div>
            {allUsers.map(user => (
              <div key={user.id} className="flex items-center gap-2 py-1">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">
                  {user.name}
                  {user.isLocal && <span className="text-xs text-gray-400 ml-1">(you)</span>}
                </span>
                {!user.isLocal && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-green-400" />
                )}
              </div>
            ))}
            {shareUrl && (
              <button
                onClick={() => { onCopyLink?.(); setShowTooltip(false); }}
                className="mt-2 w-full text-xs text-blue-600 text-center py-1 border-t border-gray-100 hover:text-blue-700"
              >
                Copy invite link
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Floating "Join collaboration" banner shown when coming from a share link
export function CollabBanner({ roomId, onJoin }: { roomId: string; onJoin: () => void }) {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 text-sm flex items-center gap-3">
      <Users size={16} />
      <span className="flex-1">You were invited to collaborate on this trip</span>
      <button
        onClick={onJoin}
        className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full"
      >
        Join
      </button>
    </div>
  );
}
