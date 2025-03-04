
import React from 'react';
import { BookOpen } from 'lucide-react';

interface QuantumDownload {
  id: string;
  title: string;
  content: string;
  level: number;
  category: string;
}

interface WisdomTabProps {
  downloads: QuantumDownload[];
}

const WisdomTab = ({ downloads }: WisdomTabProps) => {
  return (
    <div className="space-y-4">
      {downloads.map((download) => (
        <div key={download.id} className="glass-card p-5">
          <div className="flex items-center mb-2">
            <BookOpen size={18} className="mr-2 text-primary" />
            <h3 className="font-display">{download.title}</h3>
          </div>
          <p className="text-white/80">{download.content}</p>
        </div>
      ))}
      
      {downloads.length === 0 && (
        <div className="text-center py-8 text-white/60">
          No quantum wisdom available for this category yet
        </div>
      )}
    </div>
  );
};

export default WisdomTab;
