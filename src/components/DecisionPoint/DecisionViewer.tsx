import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DecisionPoint } from '../../types';
import { DecisionOption } from './DecisionOption';
import { X, Users, User, Check } from 'lucide-react';

interface DecisionViewerProps {
  decision: DecisionPoint;
  currentUserId?: string;
  travelers?: Array<{ id: string; name: string; color: string }>;
  isOrganizer?: boolean;
  onClose: () => void;
  onVote: (optionId: string) => void;
  onResolve: (optionId: string) => void;
  onToggleMode: (mode: 'personal' | 'group') => void;
}

export function DecisionViewer({
  decision,
  currentUserId,
  travelers = [],
  isOrganizer = true,
  onClose,
  onVote,
  onResolve,
  onToggleMode,
}: DecisionViewerProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(
    currentUserId ? decision.votes?.[currentUserId] : undefined
  );

  const votes = decision.votes || {};
  
  // Count votes per option
  const voteCounts = decision.options.reduce((acc, opt) => {
    acc[opt.id] = Object.values(votes).filter(v => v === opt.id).length;
    return acc;
  }, {} as Record<string, number>);

  const handleVote = (optionId: string) => {
    setSelectedOptionId(optionId);
    onVote(optionId);
  };

  const handleResolve = () => {
    if (!selectedOptionId && decision.mode === 'personal') return;
    
    // In group mode, resolve to the option with most votes
    const resolveOptionId = decision.mode === 'group'
      ? Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
      : selectedOptionId;

    if (resolveOptionId) {
      onResolve(resolveOptionId);
      onClose();
    }
  };

  const canResolve = isOrganizer && !decision.resolved && (
    decision.mode === 'group' 
      ? Object.keys(votes).length > 0
      : selectedOptionId !== undefined
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-black text-gray-900 leading-tight">
              {decision.question}
            </h2>
            {decision.time && (
              <p className="text-sm text-gray-500 mt-1">{decision.time}</p>
            )}
          </div>

          {/* Mode toggle */}
          {!decision.resolved && (
            <div className="flex items-center gap-2 mr-4">
              <button
                onClick={() => onToggleMode('personal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  decision.mode === 'personal'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <User size={12} className="inline mr-1" />
                Personal
              </button>
              <button
                onClick={() => onToggleMode('group')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  decision.mode === 'group'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Users size={12} className="inline mr-1" />
                Group
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Options grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className={`grid gap-4 ${
              decision.options.length === 2
                ? 'grid-cols-1 md:grid-cols-2'
                : decision.options.length === 3
                ? 'grid-cols-1 md:grid-cols-3'
                : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {decision.options.map((option) => (
              <DecisionOption
                key={option.id}
                option={option}
                selected={
                  decision.resolved
                    ? option.id === decision.selectedOptionId
                    : option.id === selectedOptionId
                }
                votes={voteCounts[option.id]}
                showVotes={decision.mode === 'group'}
                onSelect={() => !decision.resolved && handleVote(option.id)}
                disabled={decision.resolved}
              />
            ))}
          </div>

          {/* Vote summary for group mode */}
          {decision.mode === 'group' && !decision.resolved && Object.keys(votes).length > 0 && (
            <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Vote Summary</h4>
              <div className="space-y-2">
                {travelers
                  .filter(t => votes[t.id])
                  .map(traveler => {
                    const votedOptionId = votes[traveler.id];
                    const votedOption = decision.options.find(o => o.id === votedOptionId);
                    return (
                      <div key={traveler.id} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ backgroundColor: traveler.color }}
                        >
                          {traveler.name.charAt(0)}
                        </div>
                        <span className="text-gray-700">{traveler.name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-semibold text-gray-900">
                          {votedOption?.emoji} {votedOption?.title || 'Unknown'}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Resolved message */}
          {decision.resolved && (
            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <Check size={20} />
                <span className="font-bold">Decision resolved!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                The chosen events have been added to the itinerary.
              </p>
            </div>
          )}
        </div>

        {/* Footer with resolve button */}
        {!decision.resolved && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {decision.mode === 'group' ? (
                <span>
                  {Object.keys(votes).length} / {travelers.length} travelers voted
                </span>
              ) : (
                <span>Choose an option to continue</span>
              )}
            </div>

            <button
              onClick={handleResolve}
              disabled={!canResolve}
              className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all ${
                canResolve
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Resolve Decision
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
