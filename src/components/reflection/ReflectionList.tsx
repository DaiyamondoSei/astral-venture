
import React from 'react';
import ReflectionItem from './ReflectionItem';
import { HistoricalReflection } from './types';

interface ReflectionListProps {
  reflections: HistoricalReflection[];
  expandedId: string | number | null;
  onToggleExpand: (id: string | number) => void;
}

const ReflectionList: React.FC<ReflectionListProps> = ({
  reflections,
  expandedId,
  onToggleExpand
}) => {
  if (reflections.length === 0) {
    return (
      <div className="p-6 border border-quantum-500/20 rounded-lg bg-black/20 text-center">
        <p className="text-white/60 mb-3">
          Your reflection history will appear here once you begin your journaling practice.
        </p>
        <p className="text-white/40 text-sm">
          Start with the "New Reflection" tab to begin your consciousness evolution.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reflections.map((reflection) => (
        <ReflectionItem
          key={reflection.id}
          reflection={reflection}
          isExpanded={expandedId === reflection.id}
          onToggleExpand={() => onToggleExpand(reflection.id)}
        />
      ))}
    </div>
  );
};

export default ReflectionList;
