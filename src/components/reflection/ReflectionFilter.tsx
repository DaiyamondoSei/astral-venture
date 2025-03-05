
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ReflectionFilterProps {
  total: number;
  energyCount: number;
  philosophicalCount: number;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const ReflectionFilter: React.FC<ReflectionFilterProps> = ({
  total,
  energyCount,
  philosophicalCount,
  activeFilter,
  onFilterChange
}) => {
  return (
    <div className="flex space-x-2">
      <Badge 
        variant={activeFilter === null ? "default" : "outline"} 
        className="cursor-pointer hover:bg-primary/20"
        onClick={() => onFilterChange(null)}
      >
        All ({total})
      </Badge>
      <Badge 
        variant={activeFilter === 'energy' ? "default" : "outline"} 
        className="cursor-pointer hover:bg-primary/20"
        onClick={() => onFilterChange('energy')}
      >
        Energy ({energyCount})
      </Badge>
      <Badge 
        variant={activeFilter === 'consciousness' ? "default" : "outline"} 
        className="cursor-pointer hover:bg-primary/20"
        onClick={() => onFilterChange('consciousness')}
      >
        Consciousness ({philosophicalCount})
      </Badge>
    </div>
  );
};

export default ReflectionFilter;
