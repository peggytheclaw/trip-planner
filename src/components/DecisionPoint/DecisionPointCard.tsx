import { DecisionPoint } from '../../types';
import { GitBranch, Users, User, Check } from 'lucide-react';

interface DecisionPointCardProps {
  decision: DecisionPoint;
  onClick: () => void;
  currentUserId?: string;
  travelers?: Array<{ id: string; name: string }>;
}

export function DecisionPointCard({
  decision,
  onClick,
  currentUserId,
  travelers = [],
}: DecisionPointCardProps) {
  const votes = decision.votes || {};
  const totalVotes = Object.keys(votes).length;
  const userHasVoted = currentUserId ? votes[currentUserId] !== undefined : false;
  
  // Count votes per option
  const voteCounts = decision.options.reduce((acc, opt) => {
    acc[opt.id] = Object.values(votes).filter(v => v === opt.id).length;
    return acc;
  }, {} as Record<string, number>);

  // Find winning option (most votes)
  const winningOptionId = decision.resolved
    ? decision.selectedOptionId
    : Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  const winningOption = decision.options.find(opt => opt.id === winningOptionId);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-5 border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all group"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
          {decision.resolved ? (
            <Check size={20} className="text-white" />
          ) : (
            <GitBranch size={20} className="text-white" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {decision.question}
            </h3>
          </div>
          {decision.time && (
            <div className="text-xs text-gray-500 font-medium">
              {decision.time}
            </div>
          )}
        </div>
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Mode badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/60 text-xs font-semibold text-gray-700">
          {decision.mode === 'group' ? (
            <>
              <Users size={12} />
              <span>Group voting</span>
            </>
          ) : (
            <>
              <User size={12} />
              <span>Personal choice</span>
            </>
          )}
        </div>

        {/* Resolved badge */}
        {decision.resolved && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-xs font-semibold text-green-700">
            <Check size={12} />
            <span>Resolved</span>
          </div>
        )}

        {/* Vote count badge (only for group mode, not resolved) */}
        {decision.mode === 'group' && !decision.resolved && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-xs font-semibold text-purple-700">
            <span>{totalVotes}/{travelers.length || '?'}</span>
            <span>voted</span>
          </div>
        )}

        {/* User vote status */}
        {!decision.resolved && currentUserId && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            userHasVoted 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-amber-100 text-amber-700'
          }`}>
            {userHasVoted ? '✓ You voted' : 'Your vote needed'}
          </div>
        )}
      </div>

      {/* Options preview */}
      {decision.resolved && winningOption ? (
        <div className="rounded-xl bg-white/60 p-3 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            {winningOption.emoji && <span className="text-lg">{winningOption.emoji}</span>}
            <span className="text-sm font-bold text-gray-900">
              Chosen: {winningOption.title}
            </span>
          </div>
          {winningOption.description && (
            <p className="text-xs text-gray-600 mt-1">{winningOption.description}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {decision.options.slice(0, 3).map(opt => (
            <div
              key={opt.id}
              className="flex items-center gap-2 text-xs text-gray-700"
            >
              {opt.emoji && <span>{opt.emoji}</span>}
              <span className="font-medium">{opt.title}</span>
              {decision.mode === 'group' && voteCounts[opt.id] > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">
                  {voteCounts[opt.id]}
                </span>
              )}
            </div>
          ))}
          {decision.options.length > 3 && (
            <div className="text-xs text-gray-500 italic">
              +{decision.options.length - 3} more options
            </div>
          )}
        </div>
      )}

      {/* Click hint */}
      <div className="mt-3 text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
        {decision.resolved ? 'Click to view details →' : 'Click to vote →'}
      </div>
    </button>
  );
}
